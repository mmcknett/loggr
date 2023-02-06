import { addDoc, collection, deleteDoc, doc, DocumentReference } from "firebase/firestore";
import { useCollection } from 'react-firebase-hooks/firestore';

import { IFirebaseContext } from "../data/FirebaseContext";
import { DEFAULT_LIST, ILog } from '../data/data-types';
import { checkedLogPath } from "../data/paths";
import { saveMruListAndDeleteDraft } from "./use-account";
import { useRef } from "react";

export function useLogs(fBaseContext: IFirebaseContext, listName: string = DEFAULT_LIST) {
  const logsCollectionRef = useRef(collection(fBaseContext.db, checkedLogPath(fBaseContext)));
  const [logsSnapshot, loading, error] = useCollection(logsCollectionRef.current); //, where("list", "==", listName));
  
  // TODO: Use a FirestoreDataConverter: https://github.com/CSFrequency/react-firebase-hooks/tree/master/firestore#transforming-data
  const logs: ILog[] = logsSnapshot?.docs.map(logSnap => (
    {
      ...logSnap.data(),
      id: logSnap.id,
      ref: logSnap.ref
    } as ILog
  )) || [];

  const lists = Array.from(new Set(logs?.map(log => log.list)));

  const addLog = async (entry: ILog) => {
    try {
      const docRef = await addDoc(logsCollectionRef.current, entry);
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
