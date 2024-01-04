import {
  addDoc,
  collection,
  deleteDoc,
  DocumentReference,
  query,
  Timestamp,
  where
} from "firebase/firestore";
import { useCollectionData } from 'react-firebase-hooks/firestore';

import { IFirebaseContext } from "../data/FirebaseContext";
import { ILog, logConverter } from '../data/data-types';
import { checkedLogPath } from "../data/paths";
import { saveMruListAndDeleteDraft } from "./use-account";

export function useLogs(fBaseContext: IFirebaseContext, listName?: string | undefined, filterOldLogs: boolean = true) {
  const LOOKBACK_DAYS = 21;
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  startDate.setDate(startDate.getDate() - LOOKBACK_DAYS);
  const startTimestamp = Timestamp.fromDate(startDate);

  const filters = [];
  if (filterOldLogs) {
    filters.push(where("startTime", ">=", startTimestamp));
  }
  if (listName) {
    filters.push(where("list", "==", listName));
  }

  const logPath = checkedLogPath(fBaseContext);
  const logsCollection = collection(fBaseContext.db, logPath).withConverter(logConverter);
  const logsQuery = query(logsCollection, ...filters);

  const [logsSnapshot, loading, error] = useCollectionData(logsQuery);

  const logs: ILog[] = logsSnapshot || [];

  const lists = Array.from(new Set(logs?.map(log => log.list)));

  const addLog = async (entry: ILog) => {
    try {
      const docRef = await addDoc(logsCollection, entry);
      await saveMruListAndDeleteDraft(fBaseContext, entry.list);
      console.log(`Added an entry to ${entry.list}, id: ${docRef.id}`);
    } catch(err: any) {
      console.error(`Failed to add an entry to ${entry.list}. Message: ${err.message}`);
    }
  }

  return { logs, lists, loading, error, addLog };
}

export async function deleteLog(ref: DocumentReference | undefined, description: string = 'this item') {
  if (ref && confirm(`This action will delete ${description}.`)) {
    try
    {
      await deleteDoc(ref);
      console.log(`Deleted doc ID ${ref.id}`);
    } catch(err: any) {
      console.error(`Delete failed: ${err.message}`);
    }
  }
}
