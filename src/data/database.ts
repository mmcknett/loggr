export { app, db, auth, attachEmulators } from './firebase';
import { attachEmulators } from './firebase';

// In dev mode, when prod firestore is not specifically selected, connect to the emulator.
// Use vite's statically-replaced env variables/modes: https://vitejs.dev/guide/env-and-mode.html#modes
if (import.meta.env.DEV && import.meta.env.MODE !== 'prodfirestore') {
  attachEmulators();
}
