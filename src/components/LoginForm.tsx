import { useContext } from 'react';
import { useSignInWithEmailAndPassword } from 'react-firebase-hooks/auth';

import { FirebaseContext } from '../data/FirebaseContext';
import { EmailPasswordForm, Email, Password, LastError } from './email-password-form';

export function LoginForm() {
  const { auth } = useContext(FirebaseContext)!;
  const [
    signInWithEmailAndPassword,
    _user,
    loading,
    error,
  ] = useSignInWithEmailAndPassword(auth);

  return (
    <EmailPasswordForm
      submit={ signInWithEmailAndPassword }
      formTitle='Log In'
      submitText='Log In'
      error={ error?.message || '' }
      inProgress={ loading }
    />
  );
}
