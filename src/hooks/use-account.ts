import { MutableRefObject, useCallback, useEffect, useRef } from "react";
import { deleteField, doc, DocumentReference, setDoc, Timestamp, updateDoc, arrayUnion, getDocs, DocumentData } from "firebase/firestore";
import { useDocumentData } from "react-firebase-hooks/firestore";

import { checkedUid, IFirebaseContext } from "../data/FirebaseContext";
import { DEFAULT_LIST, IAccountData, ILog, ILogDraft } from "../data/data-types";
import { ACCOUNTS_COLLECTION, checkedAccountPath } from "../data/paths";
import { getLogsCollection } from "../data/collections";

export function useAccount(fBaseContext: IFirebaseContext) {
  const accountsPath = checkedAccountPath(fBaseContext);
  const d = doc(fBaseContext.db, accountsPath);
  const accountDocRef = useRef(d);

  const [accountData, loading, error] = useDocumentData(accountDocRef.current);

  // TODO: The accountDocRef should be enough to get the path.
  const deleteDraft = useCallback(makeDeleteDraft(accountDocRef, accountsPath), [accountDocRef, accountsPath]);
  const saveDraft = useCallback(makeSaveDraft(accountDocRef, accountsPath), [accountDocRef, accountsPath]);
  const ensureAccountListCache = useCallback(makeEnsureAccountListCache(accountDocRef, accountData), [accountDocRef, accountData]);

  // As a side effect of account data becoming available, heal the list cache if necessary.
  useEffect(() => {
    if (accountDocRef.current) {
      healListCacheIfNeeded(fBaseContext, accountDocRef.current, accountData);
    }
  }, [accountDocRef, accountData])

  const account: IAccountData = accountData || {};
  return { account, loading, error, deleteDraft, saveDraft, ensureAccountListCache };
}

async function healListCacheIfNeeded(fBaseContext: IFirebaseContext, accountDocRef: DocumentReference, accountData: DocumentData | undefined) {
  // If there's no account data at all, don't try to detect that the list cache is missing.
  if (!accountData) {
    return;
  }

  // If the list cache is there and has data, don't heal. Rely on the "ensure" function to keep the cache
  // up to date with the logs being loaded in all other circumstances.
  if (accountData.listCache !== undefined && accountData.listCache.length > 0) {
    return;
  }

  // If the list cache is missing or empty, query all logs to rebuild it.
  console.log(`List cache missing for user ${accountDocRef.path}. Rebuilding...`);
  const logsCollectionSnapshot = getLogsCollection(fBaseContext);
  const allLogDocrefs = await getDocs(logsCollectionSnapshot);
  const uniqueLists = new Set<string>(allLogDocrefs.docs.map(doc => doc.data().list));
  const lists = Array.from(uniqueLists).sort();

  if (lists.length == 0) {
    // There aren't any logs, so add the default list.
    lists.push(DEFAULT_LIST);
  }

  const accountPath = accountDocRef.path;
  try {
    // Use updateDoc so that this fails if we haven't created the account yet.
    await updateDoc(accountDocRef, { listCache: lists });
    console.log(`Healed list cache for user: ${accountPath}`);
  } catch(err: any) {
    console.error(`Failed to heal list cache for user: ${accountPath}. Message: ${err.message}`);
  }
}

/**
 * Keeps the listCache up to date as we encounter data lists.
 * @param fBaseContext 
 * @param lists 
 * @returns 
 */
export async function useEnsureAcccountListCacheEffect(fBaseContext: IFirebaseContext, lists: string[]) {
  const { ensureAccountListCache } = useAccount(fBaseContext);
  useEffect(() => {
    if (lists.length == 0) {
      return;
    }
    ensureAccountListCache(lists);
  }, [ensureAccountListCache, lists]);
}

function makeEnsureAccountListCache(accountDocRef: MutableRefObject<DocumentReference>, accountData: IAccountData | undefined) {
  return async (lists: string[]) => {
    // If there's no account data, currently, skip.
    if (!accountData) {
      return;
    }
    
    // If there is a list cache in the account data and every list from the input is in it, no update necessary.
    if (accountData.listCache && lists.every(listName => accountData.listCache?.includes(listName))) {
      return;
    }
  
    // Otherwise, update the list cache.
    const accountDoc = accountDocRef.current;
    const accountPath = accountDoc.path;
    try {
      await updateDoc(accountDoc, { listCache: arrayUnion(...lists) });
      console.log(`Updated lists for user: ${accountPath}`);
    } catch(err: any) {
      console.error(`Failed to update lists for user: ${accountPath}. Message: ${err.message}`);
    }
  };
}

function makeDeleteDraft(docRef: MutableRefObject<DocumentReference>, path: string) {
  return async () => {
    try {
      await updateDoc(docRef.current, { draft: deleteField() });
      console.log(`Draft deleted for user ${path}`);
    } catch(err: any) {
      console.error(`Unable to delete draft for user ${path}. Message: ${err.message}`);
    }
  }
}

function makeSaveDraft(docRef: MutableRefObject<DocumentReference>, path: string) { 
  return async (entry: ILog) => {
    // If the timestamps have NaN in them, just delete the fields before saving.
    if (entry?.endTime && isNaN(entry.endTime.seconds)) {
      delete entry.endTime;
    }

    if (entry?.startTime && isNaN(entry.startTime.seconds)) {
      delete entry.startTime;
    }

    const draft: ILogDraft = {
      log: entry,
      savedTime: Timestamp.now()
    }

    await setDoc(docRef.current, { draft }, { merge: true });
    console.log(`Draft saved for user ${path}`);
  };
}

export async function saveMruListAndDeleteDraft(fBaseContext: IFirebaseContext, list: string) {
  const uid = checkedUid(fBaseContext);
  const docRef = doc(fBaseContext.db, ACCOUNTS_COLLECTION, uid);
  await setDoc(docRef, {
    draft: deleteField(), // Delete the draft
    recentList: list, // Set the most recently used list
    listCache: arrayUnion(list) // Make sure the list is added to the listCache (it might be new).
  }, { merge: true });
  console.log(`Deleted draft and set MRU list for user ${uid}`);
}

