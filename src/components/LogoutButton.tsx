import { FirebaseContext } from '../data/FirebaseContext';
import { useContext } from 'react';

export function LogoutButton() {
  const { auth } = useContext(FirebaseContext)!;

  return (
    <button id='logout' onClick={() => auth.signOut()} tabIndex={0}>Log Out</button>
  );
}
