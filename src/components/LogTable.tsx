import { FirebaseContext } from '../data/FirebaseContext';
import { useContext } from 'react';
import { useLogs, deleteLog } from '../hooks/use-logs';
import { ILog } from '../data/data-types';
import { useInProgress } from '../hooks/use-in-progress';
import { DateTime } from 'luxon';
import Spinner from './Spinner';

export function LogTable() {
  const fBaseContext = useContext(FirebaseContext)!;

  const { logs } = useLogs(fBaseContext, "C19 Instruction");
  logs.sort((a: ILog, b: ILog) => !a.endTime || !b.endTime ? 0 : b.endTime?.seconds - a.endTime?.seconds);

  const groups = [];
  let currentGroup = [];
  let prevWeekNumber = 0;
  for (const log of logs) {
    const endDate = DateTime.fromSeconds(log.endTime!.seconds);
    const thisWeekNumber = endDate.weekNumber;

    if (prevWeekNumber !== thisWeekNumber) {
      prevWeekNumber = thisWeekNumber;
      if (currentGroup.length > 0) {
        groups.push(currentGroup);
        currentGroup = [];
      }
    }

    currentGroup.push(log);
  }

  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  return (
    <table>
      <thead>
        <tr>
          <th>start<br />end</th>
          <th>Hours</th>
          <th>List</th>
          <th>Notes</th>
          <th>Del?</th>
        </tr>
      </thead>
      <tbody>
        {groups && groups.length > 0 ?
          groups.map((group: ILog[]) => (
            <Group group={group} />
          ))
          : <tr><td colSpan={5}>No Data</td></tr>}
      </tbody>
    </table>
  );
}

interface IGroupProps {
  group: ILog[]
}

function duration_hours(log: ILog) {
  const dur_ms = log.endTime!.toDate() - log.startTime!.toDate();
  const ms_per_hour = 1000 * 60 * 60;
  return dur_ms / ms_per_hour;
}

function Group({ group }: IGroupProps) {
  const totalHours = group.map((log: ILog) => duration_hours(log)).reduce((a, b) => a + b);
  const weekNumber = DateTime.fromMillis(group[0].endTime!.toMillis()).weekNumber;

  return (
    <>
    <tr>
      <td colSpan={5}>Week {weekNumber}, Total Hours: {totalHours}</td>
    </tr>
    {
      group.map((log: ILog) => (
        <Row log={log} />
      ))
    }
    </>
  );
}

interface IRowProps {
  log: ILog
}

function Row({ log }: IRowProps) {
  let duration: string = "??";
  if (log.startTime && log.endTime) {
    const dur_hours = duration_hours(log);
    duration = (dur_hours).toFixed(1);
  }

  return (
    <tr key={log.id}>
      <td className='small-time'>
        {log.startTime?.toDate().toLocaleString()}
        <br />
        {log.endTime?.toDate().toLocaleString()}
      </td>
      <td>{duration}</td>
      <td>{log.list}</td>
      <td><p className='note-display'>{log.note}</p></td>
      <td>
        <BlockingDeleteButton log={ log } />
      </td>
    </tr>
  )
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
