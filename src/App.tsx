import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';

import './App.css'
import { FirebaseContext } from './data/FirebaseContext'
import { app, db, auth } from './data/database';
import { LogTable } from './components/LogTable';
import { LoginForm } from './components/LoginForm';
import { TimeEntryForm } from './components/TimeEntryForm';
import { NavBar } from './components/NavBar';
import { SignupForm } from './components/SignupForm';
import Spinner from './components/Spinner';


export default function App() {
  let [currentUser, loading] = useAuthState(auth);
  const [showSignup, setShowSignup] = useState(false);
  const [showLogTable, setShowLogTable] = useState(false);

  // For now, respond to the currentUser auth changing by resetting the signup form back to false.
  // Switching over to React Router for routing will eliminate the need for this.
  useEffect(() => {
    if (currentUser) {
      setShowSignup(false);
    }
  }, [currentUser])

  return (
    <FirebaseContext.Provider value={{ app, db, auth }}>
      <>
        {
            loading ? 
              <div>Loading <Spinner/></div>
            :
            currentUser ? 
              <>
              <NavBar />
              <TimeEntryForm />
              { 
                showLogTable ? 
                <LogTable /> : 
                <a
                  className='signup-link'
                  data-testid='show-all-logs'
                  style={{ marginBlockEnd: '4em' }}
                  onClick={(e) => { e.preventDefault(); setShowLogTable(true); }}
                >Show History</a>
              }
              </>
            :
              (
                <>
                  { showSignup ? <SignupForm/> : <LoginForm /> }
                  <a className='signup-link' onClick={ (e) => { e.preventDefault(); setShowSignup(!showSignup); } }>
                    { showSignup ? "Already have an account? Log In!" : "Don't have an account yet? Sign Up!" }
                  </a>
                </>
              )
        }
      </>
    </FirebaseContext.Provider>
  )
}


