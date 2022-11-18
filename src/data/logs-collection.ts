import {
  addDoc,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  onSnapshot,
  query,
  setDoc,
  Timestamp,
  updateDoc
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { IFirebaseContext } from "./FirebaseContext";

export interface ILog {
  id?: string,
  startTime?: Timestamp,
  endTime?: Timestamp,
  note: string,
  list: string
}

export interface IAccountData {
  draft?: ILogDraft,
  recentList?: string
}

export interface ILogDraft {
  log: ILog,
  savedTime: Timestamp
}

export const DEFAULT_LIST = 'Main';
const LOGS_COLLECTION = 'logs';
const ACCOUNTS_COLLECTION = 'accounts';

const logPath = (uid: string) => `${ACCOUNTS_COLLECTION}/${uid}/${LOGS_COLLECTION}`;

const checkedUid = ({ auth }: IFirebaseContext) => {
  if (!auth.currentUser) {
    throw new Error(`No user is logged in.`);
  }
  const uid = auth.currentUser.uid;
  return uid;
}

const checkedLogPath = (fBaseContext: IFirebaseContext) => {
  const uid = checkedUid(fBaseContext)
  return logPath(uid);
}

export function useLogs(fBaseContext: IFirebaseContext, listName: string = DEFAULT_LIST) {
  const [logs, setLogs] = useState<ILog[] | null>(null);
  const [lists, setLists] = useState<string[]>([]);

  useEffect(() => {
    // TODO: Bring back list filtering, but don't default to "Main"
    const q = query(collection(fBaseContext.db, checkedLogPath(fBaseContext))); //, where("list", "==", listName));
    const unsub = onSnapshot(q, (querySnapshot) => {
      // const source = doc.metadata.hasPendingWrites ? "Local" : "Server";
      setLogs(querySnapshot.docs.map(queryDocSnapshot => (
        { ...queryDocSnapshot.data(), id: queryDocSnapshot.id } as ILog
      )));
    });
    return unsub;
  }, [listName, fBaseContext]);

  // Discover any new lists from the updated log data.
  // Use sets to determine if there are new list items so that we can call setLists.
  const newListSet = new Set(logs?.map(log => log.list));
  newListSet.add(DEFAULT_LIST); // Make sure the default list is included, even if no entries are on it.
  const diff = new Set(lists);

  // Modified symmetric set difference algorithm from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
  newListSet.forEach(itemNew => diff.has(itemNew) ? diff.delete(itemNew) : diff.add(itemNew));

  if (diff.size !== 0) {
    setLists(Array.from(newListSet.keys()).sort());
  }

  return { logs, lists };
}

export async function addLog(fBaseContext: IFirebaseContext, entry: ILog) {
  try {
    const docRef = await addDoc(collection(fBaseContext.db, checkedLogPath(fBaseContext)), entry);
    await saveMruListAndDeleteDraft(fBaseContext, entry.list);
    console.log(`Added an entry to ${entry.list}, id: ${docRef.id}`);
  } catch(err: any) {
    console.error(`Failed to add an entry to ${entry.list}. Message: ${err.message}`);
  }
}

export async function deleteLog(fBaseContext: IFirebaseContext, id: string | undefined, description: string = 'this item') {
  if (id && confirm(`This action will delete ${description}.`)) {
    try
    {
      await deleteDoc(doc(fBaseContext.db, checkedLogPath(fBaseContext), id));
      console.log(`Deleted doc ID ${id}`);
    } catch(err: any) {
      console.error(`Delete failed: ${err.message}`);
    }
  }
}

export async function deleteDraft(fBaseContext: IFirebaseContext) {
  const uid = checkedUid(fBaseContext);
  const docRef = doc(fBaseContext.db, ACCOUNTS_COLLECTION, uid);
  try {
    await updateDoc(docRef, { draft: deleteField() });
    console.log(`Draft deleted for user ${uid}`);
  } catch(err: any) {
    console.error(`Unable to delete draft for user ${uid}. Message: ${err.message}`);
  }
}

export async function saveDraft(fBaseContext: IFirebaseContext, entry: ILog) {
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

  const uid = checkedUid(fBaseContext);
  const docRef = doc(fBaseContext.db, ACCOUNTS_COLLECTION, uid);
  await setDoc(docRef, { draft }, { merge: true });
  console.log(`Draft saved for user ${uid}`);
}

export async function saveMruListAndDeleteDraft(fBaseContext: IFirebaseContext, list: string) {
  const uid = checkedUid(fBaseContext);
  const docRef = doc(fBaseContext.db, ACCOUNTS_COLLECTION, uid);
  await setDoc(docRef, { draft: deleteField(), recentList: list }, { merge: true });
  console.log(`Deleted draft and set MRU list for user ${uid}`);
}

export function useAccount(fBaseContext: IFirebaseContext) {
  const [account, setAccount] = useState<IAccountData>({});

  useEffect(() => {
    const uid = checkedUid(fBaseContext);
    const d = doc(fBaseContext.db, `${ACCOUNTS_COLLECTION}/${uid}`);
    const unsub = onSnapshot(d, (accountDocRef) => {
      setAccount(accountDocRef.data() as IAccountData);
    });
    return unsub;
  }, [fBaseContext]);

  return account;
}

export async function loadDraft(fBaseContext: IFirebaseContext): Promise<ILogDraft> {
  const uid = checkedUid(fBaseContext);
  const userData = await (await getDoc(doc(fBaseContext.db, ACCOUNTS_COLLECTION, uid))).data();
  return userData!.draft;
}
