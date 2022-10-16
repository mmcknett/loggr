import { auth } from '../data/database';
import React from 'react';
import { useLogin } from '../useLogin';
import { LogoutButton } from './LogoutButton';

export function NavBar() {
  const currentUser = useLogin(auth) || '';
  return (
    <div className='nav-bar'>
      {currentUser}
      <span className='vl' />
      <LogoutButton />
    </div>
  );
}
