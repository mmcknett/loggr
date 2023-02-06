import { Auth, User } from 'firebase/auth';
import { useEffect, useState } from 'react';

const extractEmail = (user: User | null) => {
  if (user === null) {
    return null;
  }

  if (user && user.providerData?.length > 0) {
    return user.providerData[0]?.email || '';
  }
  return '';
}

export function useLogin(auth: Auth) {
  const [currentUser, setCurrentUser] = useState<string | null>(extractEmail(auth.currentUser));
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((newUser: User | null) => setCurrentUser(extractEmail(newUser)));
    return unsubscribe;
  }, [auth]);

  return currentUser;
}
