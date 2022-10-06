import './App.css'
import { FirebaseContext } from './FirebaseContext'
import { app, db } from './database';
import { useContext } from 'react';
import { ILog, DEFAULT_LIST, addLog, useLogs } from './logs-collection';
import { Timestamp } from 'firebase/firestore';

// 1. As things are typed, a draft is saved.
// 2. Retrieve the latest draft on load.
// 3. Clear button deletes draft (with yes/no confirmation)
// 4. Separate page to see log entries
// 5. Filtering by log (log is just a string naming the log.)
function App() {

  return (
    <FirebaseContext.Provider value={{ app, db }}>
      <div className="App">
        <TimeEntryForm />
        <LogTable />
      </div>
    </FirebaseContext.Provider>
  )
}

function TimeEntryForm() {
  const { db } = useContext(FirebaseContext)!;

  const submitTimeEntry = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();

    const formFields = {
      dateEntry: null,
      startTime: null,
      endTime: null,
      note: ""
    };

    for (let element of evt.target) {
      if (element.name in formFields) {
        formFields[element.name] = element.value;
      }
    }

    const start = Timestamp.fromDate(new Date(`${formFields.dateEntry}T${formFields.startTime}`));
    const end   = Timestamp.fromDate(new Date(`${formFields.dateEntry}T${formFields.endTime}`));

    const entry: ILog = {
      startTime: start,
      endTime: end,
      note: formFields.note,
      list: DEFAULT_LIST
    };

    addLog(db, entry);
  }

  return (
    <form onSubmit={submitTimeEntry}>
      <h2>Add Log Entry</h2>
      <label htmlFor='dateEntry'>Date:</label>
      <input type='date' id='dateEntry' name='dateEntry' />
      <label htmlFor='startTime'>Start Time:</label>
      <input type='time' id='startTime' name='startTime' />
      <label htmlFor='endTime'>End Time:</label>
      <input type='time' id='endTime' name='endTime' />
      <label htmlFor='note'>Notes:</label>
      <textarea id='note' name='note' />
      <input type='submit' value='Add Entry' />
    </form>
  );
}

function LogTable() {
  const { db } = useContext(FirebaseContext)!;
  const logs = useLogs(db);

  return (
    <table>
      <thead>
        <tr>
          <th>start<br/>end</th>
          <th>List</th>
          <th>Notes</th>
        </tr>
      </thead>
      <tbody>
      {
        logs.map((log: ILog) => (
          <tr>
            <td className='small-time'>
              { log.startTime.toDate().toLocaleString() }
              <br/>
              { log.endTime.toDate().toLocaleString() }
            </td>
            <td>{ log.list }</td>
            <td><p>{ log.note }</p></td>
          </tr>
        ))
      }
      </tbody>
    </table>
  )
}

export default App
