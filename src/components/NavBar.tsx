import { useAuthState } from 'react-firebase-hooks/auth';

import { auth } from '../data/database';
import { LogoutButton } from './LogoutButton';

export function NavBar() {
  const [user, loading] = useAuthState(auth);
  const emailDisplay = loading ? 'Fetching email...' : (user?.email || '');
  return (
    <div className='nav-bar'>
      { emailDisplay }
      { emailDisplay && <span className='vl' /> }
      <LogoutButton />
    </div>
  );
}
