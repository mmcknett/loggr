import { checkedUid, IFirebaseContext } from "./FirebaseContext";

const LOGS_COLLECTION = 'logs';
export const ACCOUNTS_COLLECTION = 'accounts';

const logPath = (uid: string) => `${ACCOUNTS_COLLECTION}/${uid}/${LOGS_COLLECTION}`;

export const checkedLogPath = (fBaseContext: IFirebaseContext) => {
  const uid = checkedUid(fBaseContext)
  return logPath(uid);
}

const accountPath = (uid: string) => `${ACCOUNTS_COLLECTION}/${uid}`;

export const checkedAccountPath = (fBaseContext: IFirebaseContext) => {
  const uid = checkedUid(fBaseContext);
  return accountPath(uid);
}