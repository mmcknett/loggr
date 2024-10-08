import { FirebaseContext } from '../data/FirebaseContext';
import { Fragment, useContext, useState } from 'react';
import { useLogs, deleteLog } from '../hooks/use-logs';
import { ILog } from '../data/data-types';
import { useInProgress } from '../hooks/use-in-progress';
import { DateTime } from 'luxon';
import Spinner from './Spinner';
import { useAccount } from '../hooks/use-account';
import './LogTable.css';

export function LogTable() {
  const fBaseContext = useContext(FirebaseContext)!;

  const [selectedList, setSelectedList] = useState<string | null>(null);
  const [filterOldLogs, setFilterOldLogs] = useState<boolean>(true);

  const { account: { listCache } } = useAccount(fBaseContext);
  const { logs } = useLogs(fBaseContext, selectedList, filterOldLogs);
  logs.sort((a: ILog, b: ILog) => !a.endTime || !b.endTime ? 0 : b.endTime?.seconds - a.endTime?.seconds);

  const lists = listCache || [];

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
    <>
    <div>
      <select
        name='list-select'
        id='list-select'
        value={selectedList || '--'}
        onChange={e => setSelectedList(e.target.value)}
        style={{ marginInlineEnd: '1em' }}
      >
        <option value='--' key='--'>--</option>
        {
          lists.map(listname => <option value={listname} key={listname}>{listname}</option>)
        }
      </select>
      <button onClick={() => setSelectedList(null)}>Clear</button>
      <span className='vl' />
      <button onClick={() => setFilterOldLogs(!filterOldLogs)}>{filterOldLogs ? 'Show All' : 'Show Only Recent'}</button>
    </div>
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
            <Group group={group} key={`${get_year(group)}.${get_week_number(group)}`} />
          ))
          : <tr><td colSpan={5}>No Data</td></tr>}
      </tbody>
    </table>
    </>
  );
}

interface IGroupProps {
  group: ILog[]
}

function duration_hours(log: ILog) {
  const dur_ms = log.endTime!.toDate().valueOf() - log.startTime!.toDate().valueOf();
  const ms_per_hour = 1000 * 60 * 60;
  return dur_ms / ms_per_hour;
}

function get_week_number(group: ILog[]): string {
  const weekNumber = DateTime.fromMillis(group[0].endTime!.toMillis()).weekNumber;
  return weekNumber.toFixed(0);
}

function get_year(group: ILog[]): string {
  const year = DateTime.fromMillis(group[0].endTime!.toMillis()).year;
  return year.toFixed(0);
}

function Group({ group }: IGroupProps) {
  const totalHours = group.map((log: ILog) => duration_hours(log)).reduce((a, b) => a + b);
  const weekNumber = get_week_number(group);

  const perListTotalHours = group
    .map((log: ILog) => ({ hours: duration_hours(log), list: log.list }))
    .reduce<{[key:string]: number}>((res, { hours, list }) => ({ ...res, [list]: (res[list] || 0) + hours }), {});
  const numlists = Object.keys(perListTotalHours).length;

  const days = [];
  let currentGroup = [];
  let prevDay = DateTime.fromMillis(0);
  for (const log of group) {
    const endDate = DateTime.fromSeconds(log.endTime!.seconds);
    const thisDay = endDate.startOf('day');

    if (!prevDay.equals(thisDay)) {
      prevDay = thisDay;
      if (currentGroup.length > 0) {
        days.push(currentGroup);
        currentGroup = [];
      }
    }

    currentGroup.push(log);
  }

  if (currentGroup.length > 0) {
    days.push(currentGroup);
  }

  return (
    <>
    <tr className='space-above'>
      <td colSpan={5}>
        <h2>
        Week {weekNumber}, Total Hours: {totalHours.toFixed(1)}
        </h2>
        <div>
        { numlists > 1 && (
          <>
          <ul>
            { Object.entries(perListTotalHours).map(([list, totalHours]) => <li key={list}>{list}: {totalHours.toFixed(1)}</li>) }
          </ul>
          </>
        )}
        </div>
      </td>
    </tr>
    {
      days.map((logs: ILog[]) => {
        const totalHours = logs.map(
          (log) => duration_hours(log)).reduce((a, b) => a + b
        );
        const date = logs[0].endTime!.toDate().toDateString();
        return(
          <Fragment key={date}>
          <tr><td colSpan={5} className='invert'>
            {DateTime.fromMillis(logs[0].endTime!.toMillis()).startOf('day').toLocaleString({ weekday: 'short', month: '2-digit', day: '2-digit', year: '2-digit' })}:{' '}
            {totalHours.toFixed(1)}
          </td></tr>
          {
            logs.map((log) => (
              <Row log={log} key={log.id} />
            ))
          }
          </Fragment>
        )
      })
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
        {DateTime.fromJSDate(log.startTime!.toDate()).toLocaleString(DateTime.TIME_SIMPLE)}
        <br />
        {DateTime.fromJSDate(log.endTime!.toDate()).toLocaleString(DateTime.TIME_SIMPLE)}
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
