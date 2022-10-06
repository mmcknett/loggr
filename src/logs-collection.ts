import {
  addDoc,
  collection,
  Firestore,
  onSnapshot,
  query,
  Timestamp,
  where
} from "firebase/firestore";
import { useEffect, useState } from "react";

export interface ILog {
  startTime: Timestamp,
  endTime: Timestamp,
  note: string,
  list: string
}

export const DEFAULT_LIST = 'main';

export function useLogs(db: Firestore, listName: string = DEFAULT_LIST) {
  const [logs, setLogs] = useState<ILog[]>([]);

  useEffect(() => {
    const q = query(collection(db, "logs"), where("list", "==", listName));
    const unsub = onSnapshot(q, (querySnapshot) => {
      // const source = doc.metadata.hasPendingWrites ? "Local" : "Server";
      setLogs(querySnapshot.docs.map(queryDocSnapshot => queryDocSnapshot.data() as ILog));
    });
    return unsub;
  }, [listName]);

  return logs;
}

export async function addLog(db: Firestore, entry: ILog) {
  const docRef = await addDoc(collection(db, "logs"), entry);
  console.log(`Added an entry to ${entry.list}, id: ${docRef.id}`);
}
