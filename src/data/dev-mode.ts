// In any environment, `--mode emulators` means use the firebase emulators.
// In dev, only use the real firestore database if `--mode prodfirestore` is supplied explicitly.
export const shouldUseEmulators = 
  import.meta.env.MODE === 'emulators' ||
  (import.meta.env.DEV && import.meta.env.MODE !== 'prodfirestore');

// For now, make drafts save quickly whenever we're emulating.
export const shouldSaveDraftQuickly = shouldUseEmulators;