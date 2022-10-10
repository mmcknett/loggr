import { FirebaseApp } from "firebase/app";
import { Auth } from "firebase/auth";
import { Firestore } from "firebase/firestore";
import { createContext } from "react"

export interface IFirebaseContext {
  app: FirebaseApp,
  db: Firestore,
  auth: Auth
}

export const FirebaseContext = createContext<IFirebaseContext | null>(null);
