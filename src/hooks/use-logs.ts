import { addDoc, collection, deleteDoc, doc } from "firebase/firestore";
import { useCollection } from 'react-firebase-hooks/firestore';

import { IFirebaseContext } from "../data/FirebaseContext";
import { DEFAULT_LIST, ILog } from '../data/data-types';
import { checkedLogPath } from "../data/paths";
import { saveMruListAndDeleteDraft } from "./useAccount";

export function useLogs(fBaseContext: IFirebaseContext, listName: string = DEFAULT_LIST) {
  const [logsSnapshot, loading, error] = useCollection(collection(fBaseContext.db, checkedLogPath(fBaseContext))); //, where("list", "==", listName));
  
  // TODO: Use a FirestoreDataConverter: https://github.com/CSFrequency/react-firebase-hooks/tree/master/firestore#transforming-data
  const logs: ILog[] = logsSnapshot?.docs.map(logSnap => (
    { ...logSnap.data(), id: logSnap.id } as ILog
  )) || [];

  const lists = Array.from(new Set(logs?.map(log => log.list)));

  return { logs, lists, loading, error };
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
