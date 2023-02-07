import { UserCredential } from 'firebase/auth';
import { useContext, useState } from 'react';
import { useCreateUserWithEmailAndPassword } from 'react-firebase-hooks/auth';

import { FirebaseContext } from '../data/FirebaseContext';
import { EmailPasswordForm, Email, Password } from './email-password-form';

export function SignupForm() {
  const { auth } = useContext(FirebaseContext)!;
  const [
    createUserWithEmailAndPassword,
    _user,
    loading,
    error,
  ] = useCreateUserWithEmailAndPassword(auth);

  const [tosAccepted, setTosAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [signupError, setSignupError] = useState('');

  const signup = async (email: Email, password: Password): Promise<UserCredential | undefined> => {
    if (!tosAccepted || !privacyAccepted) {
      setSignupError('You must agree to the Terms of Service and Privacy Policy.');
      return;
    } else {
      setSignupError('');
    }

    return createUserWithEmailAndPassword(email, password);
  }

  return (
    <EmailPasswordForm
      submit={ signup }
      formTitle='Create an Account'
      submitText='Sign Up'
      inProgress={ loading }
      error={ error?.message || signupError }
    >
      <h4 className='large-space-above'>Terms of Service</h4>
      <p>
      This service is a hobbyist project. The individuals who maintain and operate the service are referred to here as "administrators". The administrators make no warranty that the system will operate without errors, nor that it will always be available.
      Changes to the service are made at the sole discretion of the administrators. The service and software are provided on an "as is" and "as available" basis. Use of the service is at your sole risk. The administrators make no warranties, express or implied, or guarantees
      with respect to your use of this service.
      </p>
      <p>When you access this service and/or store information in it, you agree that:
      <ul>
        <li>You must provide a valid email address to sign up for the service.</li>
        <li>You will not use the service for commercial purposes, such as in furtherance of a business, nor for any application that is mission-critical. You may contact the administrators to license the service for commercial purposes.</li>
        <li>You will not use the service in an unlawful manner, nor in a manner that violates these Terms.</li>
        <li>You will not use the service in a manner which degrades the service's performance or harms the experience of other users.</li>
        <li>You will not attempt to gain access to restricted portions of the service, nor circumvent its security policies.</li>
        <li>You will not use software automation to access the service, such as using scripts that access its firestore database via an API or automated tools like web scrapers.</li>
        <li>You are over the age of 13.</li>
        <li>If a violation of these terms of service is suspected, access to your account may be suspended.</li>
        <li>The administrators of the service have sole discretion to remove any data or user accounts, or to terminate the service, without warning or recourse.</li>
        <li>The administrators may change these terms at any time at their sole discretion. By continuing to use the service, you agree to any updated terms.</li>
        <li>You understand that you are provided no guarantee of the service's performance, availability, or data integrity.</li>
        <li>You understand and agree to the practices described in the Privacy Policy.</li>
        <li><strong>Liability</strong>: The administrators shall not be liable to you for any damages arising from your use of or inability to use this service.</li>
      </ul>
      <small>Terms of Service date: January 31, 2023</small>
      </p>

      <div className="horiz">
        <input type="checkbox" id="tos" name="tos" value="tos"
          checked={ tosAccepted }
          onChange={ () => setTosAccepted(state => !state) }
        />
        <label htmlFor="tos">I agree to the Terms of Service</label>
      </div>

      <h4 className='large-space-above'>Privacy Policy</h4>
      <p>
      This service is a hobbyist project. It provides no guarantee of security or privacy. Security and privacy are provided on a "best effort" basis. The individuals who maintain and operate the service are referred to here as "administrators".
      You are advised NOT to store sensitive personal or business information information in this system. You understand that:
      <ul>
        <li>We collect your email address and sets of data that includes, for example, logs, notes, time stamps, log list names, and drafts.</li>
        <li>You provide this data directly when you sign up for the service and use the service to store log information.</li>
        <li>Your email address is used to communicate with you about the status of the service and your account.</li>
        <li>Your data is stored in Google Firebase services:
          <ul>
            <li>Your email address will be stored in the Google Firebase Authentication service.</li>
            <li>Your data will be stored in Google Firebase Firestore. Firestore collects usage statistics, in aggregate with no personally-identifying information, about your use of the service.</li>
            <li>No information you enter will be provided to any other third party unless required by law.</li>
            <li>For more information, see: <a href="https://firebase.google.com/support/privacy">Privacy and Security in Firebase</a>.</li>
          </ul>
        </li>
        <li>Your data will be deleted with reasonable expediency at your request, as long as your account is not suspended pending an investigation of violation of the terms of service.</li>
        <li>Your data is NOT encrypted. Therefore, administrators have access to your data. The administrators use this access only to:
          <ul>
            <li>Provide you with support in accessing your data if you request support.</li>
            <li>Maintain the service and keep it in working order, including making regular backups.</li>
            <li>Comply with legal obligations.</li>
          </ul>
        </li>
      </ul>
      <small>Privacy Policy date: January 31, 2023</small>
      </p>
      <div className="horiz">
        <input type="checkbox" id="privacy" name="privacy" value="privacy"
          checked={ privacyAccepted }
          onChange={ () => setPrivacyAccepted(state => !state) }
        />
        <label htmlFor='privacy'>I agree to the Privacy Policy</label>
      </div>
    </EmailPasswordForm>
  );
}