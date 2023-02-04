import { Dispatch, ReducerAction, ReducerState, useReducer } from 'react';

export type LastError = string;
export type Email = string;
export type Password = string;

export interface ILoginForm {
  email: Email;
  password: Password;
  lastError: LastError;
}

export interface IPayload {
  t: 'EMAIL' | 'PASSWORD' | 'ERROR';
  payload: string;
}

function reducer(state: ILoginForm, action: IPayload): ILoginForm {
  switch (action.t) {
    case 'EMAIL':
      return { ...state, email: action.payload, lastError: '' };
    case 'PASSWORD':
      return { ...state, password: action.payload, lastError: '' };
    case 'ERROR':
      return { ...state, lastError: action.payload };
  }
}

export function useEmailPasswordForm(): [ReducerState<typeof reducer>, Dispatch<ReducerAction<typeof reducer>>] {
  // This could switch to useForm, but it feels more comfortable not to involve a 3rd-party library in password-handling.
  const [state, dispatch] = useReducer(reducer, { email: '', password: '', lastError: '' });
  return [state, dispatch];
}
