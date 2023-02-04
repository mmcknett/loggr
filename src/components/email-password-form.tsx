import React, { PropsWithChildren, useCallback } from 'react';
import { Email, LastError, Password, useEmailPasswordForm } from './email-password-form-reducer';

export type { Email, Password, LastError };
export interface IEmailPasswordFormProps {
  submit: (email: Email, password: Password) => Promise<LastError>,
  formTitle: string,
  submitText: string
}

export function EmailPasswordForm(props: PropsWithChildren<IEmailPasswordFormProps>) {
  const [state, dispatch] = useEmailPasswordForm();
  
  const submit = useCallback(
    (evt: React.FormEvent<HTMLFormElement>) => {
      evt.preventDefault();

      const doSubmit = async () => {
        let message: LastError = await props.submit(state.email, state.password);
        if (message) {
          dispatch({ t: 'ERROR', payload: `Login failed with message: "${message}"` });
        }
      };

      doSubmit();
    },
    [props.submit, state.email, state.password]
  );


  const handleChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      evt.preventDefault();

      if (evt.target.name == 'email') {
        dispatch({ t: 'EMAIL', payload: evt.target.value });
      } else if (evt.target.name == 'password') {
        dispatch({ t: 'PASSWORD', payload: evt.target.value });
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
        <button type='submit'>{ props.submitText }</button>
      </div>
      {state.lastError && <div style={{ color: 'red' }}>{state.lastError}</div>}
    </form>
  );
}