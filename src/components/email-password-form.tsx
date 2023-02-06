import { UserCredential } from 'firebase/auth';
import React, { PropsWithChildren, useCallback } from 'react';

import { Email, Password, useEmailPasswordForm } from './email-password-form-reducer';
import Spinner from './Spinner';

export type { Email, Password };

export interface IEmailPasswordFormProps {
  submit: (email: Email, password: Password) => Promise<UserCredential | undefined>,
  formTitle: string,
  submitText: string,
  error?: string,
  inProgress?: boolean
}

export function EmailPasswordForm(props: PropsWithChildren<IEmailPasswordFormProps>) {
  const [state, dispatch] = useEmailPasswordForm();
  
  const submit = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    props.submit(state.email, state.password);
  };

  const handleChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      evt.preventDefault();
      const { name } = evt.target;
      if (name === 'email' || name === 'password') {
        dispatch({ t: name, payload: evt.target.value });
      }
    },
    []
  );

  return (
    <form onSubmit={submit}>
      <h2>{ props.formTitle }</h2>

      <label htmlFor='email'>Email:</label>
      <input autoComplete='username' type='email' id='email' name='email' value={state.email} onChange={handleChange} />

      <label htmlFor='password'>Password:</label>
      <input autoComplete='current-password' type='password' id='password' name='password' value={state.password} onChange={handleChange} />

      { props.children }

      <div id='submit-row' className='horiz'>
        <button type='submit' disabled={props.inProgress}>{ props.submitText } {props.inProgress && <Spinner/>}</button>
      </div>
      {props.error && <span style={{ color: 'red' }}>{props.error}</span>}
    </form>
  );
}