import { FirebaseApp } from "firebase/app";
import { Auth } from "firebase/auth";
import { Firestore } from "firebase/firestore";
import { createContext } from "react"

export interface IFirebaseContext {
  app: FirebaseApp,
  db: Firestore,
  auth: Auth
}

export const checkedUid = ({ auth }: IFirebaseContext) => {
  if (!auth.currentUser) {
    throw new Error(`No user is logged in.`);
  }
  const uid = auth.currentUser.uid;
  return uid;
}

export const FirebaseContext = createContext<IFirebaseContext | null>(null);
