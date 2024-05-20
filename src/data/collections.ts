import { collection } from "@firebase/firestore";
import { IFirebaseContext } from "./FirebaseContext";
import { checkedLogPath } from "./paths";
import { logConverter } from "./data-types";

export function getLogsCollection(fBaseContext: IFirebaseContext) {
  const logsCollection = collection(fBaseContext.db, checkedLogPath(fBaseContext)).withConverter(logConverter);
  return logsCollection
}