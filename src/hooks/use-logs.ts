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
import { ILog } from '../data/data-types';
import { getLogsCollection } from "../data/collections";
import { saveMruListAndDeleteDraft, useEnsureAcccountListCacheEffect } from "./use-account";

export function useLogs(fBaseContext: IFirebaseContext, listName?: string | null | undefined, filterOldLogs: boolean = true) {
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

  const logsCollection = getLogsCollection(fBaseContext);
  const logsQuery = query(logsCollection, ...filters);

  const [logsSnapshot, loading, error] = useCollectionData(logsQuery);

  const logs: ILog[] = logsSnapshot || [];
  const listsFromLogs = Array.from(new Set(logs?.map(log => log.list))).sort();

  // A side effect of querying logs is to ensure the account has all the lists we queried in its cache.
  useEnsureAcccountListCacheEffect(fBaseContext, listsFromLogs);

  return { logs, loading, error };
}

export async function addLog(fBaseContext: IFirebaseContext, entry: ILog) {
  const logsCollection = getLogsCollection(fBaseContext);
  try {
    const docRef = await addDoc(logsCollection, entry);
    await saveMruListAndDeleteDraft(fBaseContext, entry.list);
    console.log(`Added an entry to ${entry.list}, id: ${docRef.id}`);
  } catch(err: any) {
    console.error(`Failed to add an entry to ${entry.list}. Message: ${err.message}`);
  }
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
