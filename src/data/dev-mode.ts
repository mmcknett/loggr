// In any environment, `--mode emulators` means use the firebase emulators.
// In dev, only use the real firestore database if `--mode prodfirestore` is supplied explicitly.
export const shouldUseEmulators = 
  import.meta.env.MODE === 'emulators' ||
  (import.meta.env.DEV && import.meta.env.MODE !== 'prodfirestore');

// Let's try always saving drafts quickly because it feels flimsy if drafts don't save
// immediately when you add a note and switch away from the browser.
export const shouldSaveDraftQuickly = true;