import {
  addDoc,
  collection,
  deleteDoc,
  DocumentReference,
  query,
  where
} from "firebase/firestore";
import { useCollectionData } from 'react-firebase-hooks/firestore';

import { IFirebaseContext } from "../data/FirebaseContext";
import { DEFAULT_LIST, ILog, logConverter } from '../data/data-types';
import { checkedLogPath } from "../data/paths";
import { saveMruListAndDeleteDraft, useEnsureAcccountListCacheEffect } from "./use-account";

function getLogsCollection(fBaseContext: IFirebaseContext) {
  const logsCollection = collection(fBaseContext.db, checkedLogPath(fBaseContext)).withConverter(logConverter);
  return logsCollection
}

export function useLogs(fBaseContext: IFirebaseContext, listName?: string | undefined) {
  const logsCollection = getLogsCollection(fBaseContext);
  const logsQuery = listName ? query(logsCollection, where("list", "==", listName)) : logsCollection;
  const [logsSnapshot, loading, error] = useCollectionData(logsQuery);

  const logs: ILog[] = logsSnapshot || [];
  const listsFromLogs = Array.from(new Set(logs?.map(log => log.list))).sort();

  // A side effect of querying logs is to ensure the account has all the lists we queried in its cache.
  useEnsureAcccountListCacheEffect(fBaseContext, listsFromLogs);

  return { logs, lists: listsFromLogs, loading, error };
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
