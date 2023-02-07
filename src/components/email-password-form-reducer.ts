import { Dispatch, ReducerAction, ReducerState, useReducer } from 'react';

export type Email = string;
export type Password = string;

export interface ILoginForm {
  email: Email;
  password: Password;
}

export interface IPayload {
  t: 'email' | 'password';
  payload: string;
}

function reducer(state: ILoginForm, action: IPayload): ILoginForm {
  switch (action.t) {
    case 'email':
      return { ...state, email: action.payload };
    case 'password':
      return { ...state, password: action.payload };
  }
}

export function useEmailPasswordForm(): [ReducerState<typeof reducer>, Dispatch<ReducerAction<typeof reducer>>] {
  // This could switch to useForm, but it feels more comfortable not to involve a 3rd-party library in password-handling.
  const [state, dispatch] = useReducer(reducer, { email: '', password: '' });
  return [state, dispatch];
}
