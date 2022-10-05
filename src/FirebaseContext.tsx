import { FirebaseApp } from "firebase/app";
import { Firestore } from "firebase/firestore";
import { createContext } from "react"

interface IFirebaseContext {
  app: FirebaseApp,
  db: Firestore
}

export const FirebaseContext = createContext<IFirebaseContext | null>(null);
