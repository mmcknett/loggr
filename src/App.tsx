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
      <h2>Add Log Entry</h2>
      <label for='date-entry'>Date:</label>
      <input type='date' id='date-entry' name='date-entry' />
      <label for='start-time'>Start Time:</label>
      <input type='time' id='start-time' name='start-time' />
      <label for='end-time'>End Time:</label>
      <input type='time' id='end-time' name='end-time' />
      <label for='notes'>Notes:</label>
      <textarea id='notes' name='notes' />
    </form>
  );
}

export default App
