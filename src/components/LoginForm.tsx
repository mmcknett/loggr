import { FirebaseContext } from '../data/FirebaseContext';
import React, { useContext, useReducer } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';

export function LoginForm() {
  const { auth } = useContext(FirebaseContext)!;

  interface ILoginForm {
    email: string;
    password: string;
    lastError: string;
  };

  interface IPayload {
    t: 'EMAIL' | 'PASSWORD' | 'ERROR';
    payload: string;
  }

  // This could switch to useForm, but it feels more comfortable not to involve a 3rd-party library in password-handling.
  const reducer = (state: ILoginForm, action: IPayload) => {
    switch (action.t) {
      case 'EMAIL':
        return { ...state, email: action.payload, lastError: '' };
      case 'PASSWORD':
        return { ...state, password: action.payload, lastError: '' };
      case 'ERROR':
        return { ...state, lastError: action.payload };
    }
  };
  const [state, dispatch] = useReducer(reducer, { email: '', password: '', lastError: '' });

  const login = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();

    async function doLogin() {
      try {
        await signInWithEmailAndPassword(auth, state.email, state.password);
      } catch (err: any) {
        // Handle error codes listed in https://firebase.google.com/docs/reference/js/v8/firebase.auth.Auth#error-codes_3
        const { code, message } = err;
        dispatch({ t: 'ERROR', payload: `Login failed with message: "${message}"` });
      }
    }
    doLogin();
  };

  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    evt.preventDefault();

    if (evt.target.name == 'email') {
      dispatch({ t: 'EMAIL', payload: evt.target.value });
    } else if (evt.target.name == 'password') {
      dispatch({ t: 'PASSWORD', payload: evt.target.value });
    }
  };

  return (
    <form onSubmit={login}>
      <h2>Log In</h2>

      <label htmlFor='email'>Email:</label>
      <input autoComplete='username' type='email' id='email' name='email' value={state.email} onChange={handleChange} />

      <label htmlFor='password'>Password:</label>
      <input autoComplete='current-password' type='password' id='password' name='password' value={state.password} onChange={handleChange} />

      <button type='submit'>Log In</button>
      {state.lastError && <div style={{ color: 'red' }}>{state.lastError}</div>}
    </form>
  );
}
