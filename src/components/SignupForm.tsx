import { FirebaseContext } from '../data/FirebaseContext';
import { useContext } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { EmailPasswordForm, Email, Password, LastError } from './email-password-form';

export function SignupForm() {
  const { auth } = useContext(FirebaseContext)!;

  const signup = async (email: Email, password: Password): Promise<LastError> => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      return '';
    } catch (err: any) {
      // Handle error codes listed in https://firebase.google.com/docs/reference/js/v8/firebase.auth.Auth#error-codes_3
      const { message } = err;
      return message;
    }
  }

  return (
    <EmailPasswordForm
      submit={ signup }
      formTitle='Create an Account'
      submitText='Sign Up'
    />
  );
}