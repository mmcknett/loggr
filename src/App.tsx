import { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { OneEightyRing } from 'react-svg-spinners';

import './App.css'
import { FirebaseContext } from './data/FirebaseContext'
import { app, db, auth } from './data/database';
import { LogTable } from './components/LogTable';
import { LoginForm } from './components/LoginForm';
import { TimeEntryForm } from './components/TimeEntryForm';
import { NavBar } from './components/NavBar';
import { SignupForm } from './components/SignupForm';


export default function App() {
  let [currentUser, loading] = useAuthState(auth);
  const [showSignup, setShowSignup] = useState(false);

  return (
    <FirebaseContext.Provider value={{ app, db, auth }}>
      <div className='App'>
        {
            loading ? 
              <div>Loading <OneEightyRing color="white" width="0.8em" height="0.8em"/></div>
            :
            currentUser ? 
              <>
              <NavBar />
              <TimeEntryForm />
              <LogTable />
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
      </div>
    </FirebaseContext.Provider>
  )
}


