import { MutableRefObject, useRef, useState } from "react";
import { deleteField, doc, DocumentReference, onSnapshot, setDoc, Timestamp, updateDoc } from "firebase/firestore";
import { useDocumentData } from "react-firebase-hooks/firestore";

import { checkedUid, IFirebaseContext } from "../data/FirebaseContext";
import { IAccountData, ILog, ILogDraft } from "../data/data-types";
import { ACCOUNTS_COLLECTION, checkedAccountPath } from "../data/paths";

export function useAccount(fBaseContext: IFirebaseContext) {
  const accountsPath = checkedAccountPath(fBaseContext);
  const d = doc(fBaseContext.db, accountsPath);
  const accountDocRef = useRef(d);

  const [accountData, loading, error] = useDocumentData(accountDocRef.current);

  const deleteDraft = makeDeleteDraft(accountDocRef, accountsPath);
  const saveDraft = makeSaveDraft(accountDocRef, accountsPath);
  const account: IAccountData = accountData || {};

  return { account, loading, error, deleteDraft, saveDraft };
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
  await setDoc(docRef, { draft: deleteField(), recentList: list }, { merge: true });
  console.log(`Deleted draft and set MRU list for user ${uid}`);
}

