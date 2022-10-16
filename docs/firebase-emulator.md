# Firebase Emulator
Once the project started getting usage, the time came to start using an emulator for testing, to avoid any situation that might blow away the data in production.

Getting Started: [Connect your app and start prototyping](https://firebase.google.com/docs/emulator-suite/connect_and_prototype?authuser=1)

See also: [Install, configure and integrate Local Emulator Suite](https://firebase.google.com/docs/emulator-suite/install_and_configure?authuser=1)

Notes from first install:
1. First, I had to make sure Java was up-to-date. I used Homebrew to install OpenJDK: `brew install openjdk`, then had to make sure to follow its note to symlink the openjdk.jdk file in my macos `/Library` folder.
1. After that, the Firestore emulator ran with `firebase emulators:start`. A web UI runs at http://localhost:4000/firestore.

## Connecting to the emulator
Adding a connection was as simple as making a call to `connectFirestoreEmulator` in the firebase initialization. In order to make it so the production database is still available while in dev mode, I set up the initialization logic to connect to the emulator by default only when in dev mode, and added an exception for when `vite` is run with `--mode prodfirestore`.

Now the `npm run dev` command will concurrently run both the emulators and `vite` in dev mode. To run the dev app against the prod firestore database, use `npm run dev:real-db`

To keep the emulator from losing data across stopping/starting, the `--export-on-exit` flag was used with a directory called `fs-dev-stash`. Individual developers can expect to find any data there that they wrote while using the emulator.
