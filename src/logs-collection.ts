import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  setDoc,
  Timestamp,
  where
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { IFirebaseContext } from "./FirebaseContext";

export interface ILog {
  id?: string,
  startTime: Timestamp,
  endTime: Timestamp,
  note: string,
  list: string
}

export const DEFAULT_LIST = 'main';
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
  const [logs, setLogs] = useState<ILog[]>([]);

  useEffect(() => {
    const q = query(collection(fBaseContext.db, checkedLogPath(fBaseContext)), where("list", "==", listName));
    const unsub = onSnapshot(q, (querySnapshot) => {
      // const source = doc.metadata.hasPendingWrites ? "Local" : "Server";
      setLogs(querySnapshot.docs.map(queryDocSnapshot => (
        { ...queryDocSnapshot.data(), id: queryDocSnapshot.id } as ILog
      )));
    });
    return unsub;
  }, [listName]);

  return logs;
}

export async function addLog(fBaseContext: IFirebaseContext, entry: ILog) {
  // Transaction: Add doc and delete draft
  const docRef = await addDoc(collection(fBaseContext.db, checkedLogPath(fBaseContext)), entry);
  console.log(`Added an entry to ${entry.list}, id: ${docRef.id}`);
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

export async function saveDraft(fBaseContext: IFirebaseContext, entry: ILog | null) {
  const uid = checkedUid(fBaseContext);
  const docRef = doc(fBaseContext.db, ACCOUNTS_COLLECTION, uid);
  await setDoc(docRef, { draft: entry }, { merge: true });
  console.log(`Draft saved for user ${uid}`);
}
