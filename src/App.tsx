import './App.css'
import { FirebaseContext } from './data/FirebaseContext'
import { app, db, auth } from './data/database';
import React from 'react';
import { useLogin } from './useLogin';
import { LogTable } from './components/LogTable';
import { LoginForm } from './components/LoginForm';
import { TimeEntryForm } from './components/TimeEntryForm';
import { NavBar } from './components/NavBar';

export default function App() {
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


