import './App.css'
import { FirebaseContext } from './data/FirebaseContext'
import { app, db, auth } from './data/database';
import React from 'react';
import { useLogin } from './useLogin';
import { LogTable } from './components/LogTable';
import { LoginForm } from './components/LoginForm';
import { TimeEntryForm } from './components/TimeEntryForm';
import { NavBar } from './components/NavBar';

// 0. [x] Logs stored per user
// 1. [x] As things are typed, a draft is saved.
// 2. [x] Retrieve the latest draft on load.
// 3. [ ] Clear button deletes draft (with yes/no confirmation)
// 4. [ ] Separate page to see log entries
// 5. [ ] Filtering by log (log is just a string naming the log.)
function App() {
  const currentUser = useLogin(auth);
  const loading = currentUser === null;

  return (
    <FirebaseContext.Provider value={{ app, db, auth }}>
      <div className='App'>
        {
          loading ? 
            'Loading...' :
            currentUser ? 
              <>
              <NavBar />
              <TimeEntryForm />
              <LogTable />
              </>
            :
              <LoginForm />
        }
      </div>
    </FirebaseContext.Provider>
  )
}


