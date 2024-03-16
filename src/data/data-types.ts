import {
  DocumentData,
  DocumentReference,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
  Timestamp,
  WithFieldValue
} from "firebase/firestore";

export interface ILog {
  id?: string,
  startTime?: Timestamp,
  endTime?: Timestamp,
  note: string,
  list: string,
  ref?: DocumentReference
}

export const logConverter: FirestoreDataConverter<ILog> = {
  toFirestore(log: WithFieldValue<ILog>): DocumentData {
    return {
      startTime: log.startTime,
      endTime: log.endTime,
      note: log.note,
      list: log.list
    };
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): ILog {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      startTime: data.startTime,
      endTime: data.endTime,
      note: data.note,
      list: data.list,
      ref: snapshot.ref
    };
  },
};

export interface IAccountData {
  draft?: ILogDraft,
  recentList?: string,
  listCache?: string[],
}

export interface ILogDraft {
  log: {
    startTime?: Timestamp,
    endTime? : Timestamp,
    note: string,
    list: string
  },
  savedTime: Timestamp
}

export const DEFAULT_LIST = 'Main';