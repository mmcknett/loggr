import { DocumentReference, Timestamp } from "firebase/firestore";

export interface ILog {
  id?: string,
  startTime?: Timestamp,
  endTime?: Timestamp,
  note: string,
  list: string,
  ref?: DocumentReference
}

export interface IAccountData {
  draft?: ILogDraft,
  recentList?: string
}

export interface ILogDraft {
  log: ILog,
  savedTime: Timestamp
}

export const DEFAULT_LIST = 'Main';