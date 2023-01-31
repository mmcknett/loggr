import { FirebaseContext } from '../data/FirebaseContext';
import { useContext } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { EmailPasswordForm, Email, Password, LastError } from './email-password-form';

export function LoginForm() {
  const { auth } = useContext(FirebaseContext)!;

  const login = async (email: Email, password: Password): Promise<LastError> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return '';
    } catch (err: any) {
      // Handle error codes listed in https://firebase.google.com/docs/reference/js/v8/firebase.auth.Auth#error-codes_3
      const { message } = err;
      return message;
    }
  }

  return (
    <EmailPasswordForm
      submit={ login }
      formTitle='Log In'
      submitText='Log In'
    />
  );
}
