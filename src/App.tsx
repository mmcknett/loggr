import './App.css'
import { FirebaseContext } from './FirebaseContext'
import { app, db } from './database';
import { useContext } from 'react';

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
      </div>
    </FirebaseContext.Provider>
  )
}

function TimeEntryForm() {
  const { db } = useContext(FirebaseContext)!;

  return (
    <form>
      Add Log Entry
      <ul>
        <li>Date</li>
        <li>Start Time</li>
        <li>End Time</li>
        <li>Notes</li>
      </ul>
    </form>
  );
}

export default App
