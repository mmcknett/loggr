import { deleteField, doc, onSnapshot, setDoc, Timestamp, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

import { checkedUid, IFirebaseContext } from "../data/FirebaseContext";
import { IAccountData, ILog, ILogDraft } from "../data/data-types";
import { ACCOUNTS_COLLECTION, checkedAccountPath } from "../data/paths";

export function useAccount(fBaseContext: IFirebaseContext) {
  const [account, setAccount] = useState<IAccountData>({});

  useEffect(() => {
    const accountsPath = checkedAccountPath(fBaseContext);
    const d = doc(fBaseContext.db, accountsPath);
    const unsub = onSnapshot(d, (accountDocRef) => {
      const account: IAccountData = accountDocRef.data() || {};
      setAccount(account);
    });
    return unsub;
  }, [fBaseContext]);

  return account;
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

