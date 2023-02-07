import { FirebaseContext } from '../data/FirebaseContext';
import { useContext } from 'react';
import { useLogs, deleteLog } from '../hooks/use-logs';
import { ILog } from '../data/data-types';
import { useInProgress } from '../hooks/use-in-progress';
import Spinner from './Spinner';

export function LogTable() {
  const fBaseContext = useContext(FirebaseContext)!;
  const { logs } = useLogs(fBaseContext);

  return (
    <table>
      <thead>
        <tr>
          <th>start<br />end</th>
          <th>List</th>
          <th>Notes</th>
          <th>Del?</th>
        </tr>
      </thead>
      <tbody>
        {logs && logs.length > 0 ?
          logs.map((log: ILog) => (
            <tr key={log.id}>
              <td className='small-time'>
                {log.startTime?.toDate().toLocaleString()}
                <br />
                {log.endTime?.toDate().toLocaleString()}
              </td>
              <td>{log.list}</td>
              <td><p className='note-display'>{log.note}</p></td>
              <td>
                <BlockingDeleteButton log={ log } />
              </td>
            </tr>
          ))
          : <tr><td colSpan={4}>No Data</td></tr>}
      </tbody>
    </table>
  );
}

interface IDeleteButtonProps {
  log: ILog
}

function BlockingDeleteButton({ log }: IDeleteButtonProps) {
  const deleteThisLog = () => deleteLog(
    log.ref,
    `the entry from ${log.startTime?.toDate().toLocaleDateString()}`
  );

  const [blockingDelete, inProgress] = useInProgress(deleteThisLog);

  return (
    <button className='delete-button' onClick={ blockingDelete } disabled={ inProgress }>
      { inProgress ? <Spinner /> : '❌' }
    </button>
  )
}
