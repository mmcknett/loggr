import './App.css'
import { FirebaseContext } from './FirebaseContext'
import { app, db, auth } from './database';
import React, { useContext, useEffect, useReducer, useState } from 'react';
import { ILog, DEFAULT_LIST, addLog, useLogs, deleteLog, saveDraft, loadDraft } from './logs-collection';
import { Timestamp } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useLogin } from './useLogin';
import { useForm } from 'react-hook-form';

// 0. [x] Logs stored per user
// 1. [ ] As things are typed, a draft is saved.
// 2. [ ] Retrieve the latest draft on load.
// 3. [ ] Clear button deletes draft (with yes/no confirmation)
// 4. [ ] Separate page to see log entries
// 5. [ ] Filtering by log (log is just a string naming the log.)
function App() {
  const currentUser = useLogin(auth);

  return (
    <FirebaseContext.Provider value={{ app, db, auth }}>
      <div className='App'>
        {
          currentUser ?
            <>
            <div className='nav-bar'>
              { currentUser }
              <span className='vl'/>
              <LougoutButton />
            </div>
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

function twoDig(singleOrDoubleDigit: number | string) {
  return singleOrDoubleDigit.toString().padStart(2, '0');
}

function dateString(date = new Date()) {
  return `${date.getFullYear()}-${twoDig(date.getMonth() + 1)}-${twoDig(date.getDate())}`;
}

function timeString(date = new Date()) {
  return `${twoDig(date.getHours())}:${twoDig(date.getMinutes())}`
}

type TimeEntryFormData = {
  dateEntry?: string,
  startTime?: string,
  endTime?: string,
  note?: string
};

function getLogFromFormFields(formFields: TimeEntryFormData) {
  const start = Timestamp.fromDate(new Date(`${formFields.dateEntry}T${formFields.startTime}`));
  const end   = Timestamp.fromDate(new Date(`${formFields.dateEntry}T${formFields.endTime}`));

  const entry: ILog = {
    startTime: start,
    endTime: end,
    note: formFields.note,
    list: DEFAULT_LIST
  };

  return entry;
}

function getFormFieldsFormLog(log: ILog) {
  const fields: TimeEntryFormData = {
    startTime: timeString(log.startTime?.toDate()),
    endTime: timeString(log.endTime?.toDate()),
    dateEntry: dateString(log.startTime?.toDate()),
    note: log.note
  }
  return fields;
}

function TimeEntryForm() {
  const fBaseContext = useContext(FirebaseContext)!;
  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm<TimeEntryFormData>({
    defaultValues: {
      dateEntry: dateString(),
      startTime: timeString()
    }
  });
  const [draftSaved, setDraftSaved] = useState('');

  useEffect(() => {
    async function loadDraftData() {
      const draftData = await loadDraft(fBaseContext);
      console.log('Draft loaded');
      reset(getFormFieldsFormLog(draftData));
    }
    loadDraftData();
  }, [reset])

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | undefined;
    const subscription = watch((formData, { name, type }) => {
      // A change occurred. Schedule saving a draft in 5 seconds.
      const entry = getLogFromFormFields(formData);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        await saveDraft(fBaseContext, entry);
        setDraftSaved(`Draft saved at ${new Date().toLocaleTimeString()}`)
      }, 5000);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const submitTimeEntry = async (formData: TimeEntryFormData) => {
    const entry = getLogFromFormFields(formData);

    try {
      await addLog(fBaseContext, entry);
      reset();
    } catch(err: any) {
      console.error(`Failed to submit form: ${err.message}`);
    }
  }

  return (
    <form onSubmit={handleSubmit(submitTimeEntry)}>
      <h2>Add Log Entry</h2>

      <label htmlFor='dateEntry'>Date:</label>
      <input type='date' id='dateEntry' {...register('dateEntry', { required: true })} />
      { errors.dateEntry && <small className='error-msg' role='alert'>Date is required.</small> }

      <label htmlFor='startTime'>Start:</label>
      <input tabIndex={1} type='time' id='startTime' {...register('startTime', { required: true })} />
      { errors.startTime && <small className='error-msg' role='alert'>Start time is required.</small> }

      <label htmlFor='note'>Notes:</label>
      <textarea tabIndex={2} id='note' {...register('note', { required: true })} />
      { errors.note && <small className='error-msg' role='alert'>Note is required.</small> }

      <label htmlFor='endTime'>End:</label>
      <input tabIndex={3} type='time' id='endTime' {...register('endTime', { required: true })} />
      { errors.endTime && <small className='error-msg' role='alert'>End time is required.</small> }

      <button tabIndex={5} type='submit'>Add Entry</button>
      { draftSaved && <em>Last saved {draftSaved}</em>}
    </form>
  );
}

function LogTable() {
  const fBaseContext = useContext(FirebaseContext)!;
  const logs = useLogs(fBaseContext);

  return (
    <table>
      <thead>
        <tr>
          <th>start<br/>end</th>
          <th>List</th>
          <th>Notes</th>
          <th>Del?</th>
        </tr>
      </thead>
      <tbody>
      {
        logs.map((log: ILog) => (
          <tr key={log.id}>
            <td className='small-time'>
              { log.startTime.toDate().toLocaleString() }
              <br/>
              { log.endTime.toDate().toLocaleString() }
            </td>
            <td>{ log.list }</td>
            <td><p className='note-display'>{ log.note }</p></td>
            <td>
              <button className='delete-button' onClick={() => deleteLog(fBaseContext, log.id, `the entry from ${log.startTime.toDate().toLocaleDateString()}`)}>
              ❌
              </button>
            </td>
          </tr>
        ))
      }
      </tbody>
    </table>
  )
}

function LougoutButton() {
  const { auth } = useContext(FirebaseContext)!;

  return (
    <button id='logout' onClick={ () => auth.signOut() } tabIndex={0}>Log Out</button>
  )
}

function LoginForm() {
  const { auth } = useContext(FirebaseContext)!;

  interface ILoginForm {
    email: string,
    password: string, 
    lastError: string
  };

  interface IPayload {
    t: 'EMAIL' | 'PASSWORD' | 'ERROR',
    payload: string
  }

  const reducer = (state: ILoginForm, action: IPayload) => {
    switch (action.t) {
      case 'EMAIL':
        return { ...state, email: action.payload, lastError: '' };
      case 'PASSWORD':
        return { ...state, password: action.payload, lastError: '' };
      case 'ERROR':
        return { ...state, lastError: action.payload };
    }
  }
  const [state, dispatch] = useReducer(reducer, { email: '', password: '', lastError: '' });

  const login = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();

    async function doLogin() {
      try {
        await signInWithEmailAndPassword(auth, state.email, state.password);
      } catch (err: any) {
        // Handle error codes listed in https://firebase.google.com/docs/reference/js/v8/firebase.auth.Auth#error-codes_3
        const { code, message } = err;
        dispatch({ t: 'ERROR', payload: `Login failed with message: "${message}"`});
      }
    }
    doLogin();
  }

  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    evt.preventDefault();

    if (evt.target.name == 'email') {
      dispatch({ t: 'EMAIL', payload: evt.target.value });
    } else if (evt.target.name == 'password') {
      dispatch({ t: 'PASSWORD', payload: evt.target.value });
    }
  }

  return (
    <form onSubmit={login}>
      <h2>Log In</h2>

      <label htmlFor='email'>Email:</label>
      <input autoComplete='username' type='email' id='email' name='email' value={state.email} onChange={handleChange} />

      <label htmlFor='password'>Password:</label>
      <input autoComplete='current-password' type='password' id='password' name='password' value={state.password} onChange={handleChange} />

      <input type='submit' value='Log In' />
      { state.lastError && <div style={{color: 'red' }}>{ state.lastError }</div> }
    </form>
  );
}

export default App
