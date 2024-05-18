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

export function useLogs(fBaseContext: IFirebaseContext, listName?: string | undefined) {
  const logsCollection = collection(fBaseContext.db, checkedLogPath(fBaseContext)).withConverter(logConverter);
  const logsQuery = listName ? query(logsCollection, where("list", "==", listName)) : logsCollection;
  const [logsSnapshot, loading, error] = useCollectionData(logsQuery);

  const logs: ILog[] = logsSnapshot || [];
  const lists = Array.from(new Set(logs?.map(log => log.list))).sort();

  // A side effect of querying logs is to ensure the account has a list cache.
  useEnsureAcccountListCacheEffect(fBaseContext, lists);

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
