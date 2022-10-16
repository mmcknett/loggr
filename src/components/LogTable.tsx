import { FirebaseContext } from '../data/FirebaseContext';
import React, { useContext } from 'react';
import { ILog, useLogs, deleteLog } from '../data/logs-collection';

export function LogTable() {
  const fBaseContext = useContext(FirebaseContext)!;
  const logs = useLogs(fBaseContext);

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
        {logs ?
          logs.map((log: ILog) => (
            <tr key={log.id}>
              <td className='small-time'>
                {log.startTime.toDate().toLocaleString()}
                <br />
                {log.endTime.toDate().toLocaleString()}
              </td>
              <td>{log.list}</td>
              <td><p className='note-display'>{log.note}</p></td>
              <td>
                <button className='delete-button' onClick={() => deleteLog(fBaseContext, log.id, `the entry from ${log.startTime.toDate().toLocaleDateString()}`)}>
                  ❌
                </button>
              </td>
            </tr>
          ))
          : <tr><td rowSpan={4}>No Data</td></tr>}
      </tbody>
    </table>
  );
}
