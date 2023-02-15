export { app, db, auth, attachEmulators } from './firebase';
import { attachEmulators } from './firebase';
import { shouldUseEmulators } from './dev-mode';

// In dev mode, when prod firestore is not specifically selected, connect to the emulator.
// Use vite's statically-replaced env variables/modes: https://vitejs.dev/guide/env-and-mode.html#modes
if (shouldUseEmulators) {
  attachEmulators();
}
