# loggr

A simple SPA using a firebase backend for logging time.

# Development
## Setup
You'll need the firebase CLI tools in order to setup and run emulators or make manual deployments.

```
npm i -g firebase-tools
```

## Run manually
You can run the app manually, backed by firebase emulators, by installing and running `dev`.

```
npm ci
npm run dev
```

You can also target the real firestore database:

```
npm run dev:real-db
```

These commands run the vite dev server, which makes the app available at http://localhost:5173/.

## Testing
The easiest way to run end-to-end cypress tests is:

```
npm run cypress:auto
```

This will build the project to use the emulators, start the emulators, and invoke a cypress run. Everything tears down automatically.

You can also start the dev server and emulators in the same mode and let them continue running with:

```
npm run dev:cypress
```

With the dev server and firebase emulators running in this mode, invoke cypress commands by running them from the command line:

```
# For interactive Cypress UI
npm run cypress

# To run Cypress without the UI
npm run cypress:run
```

Note that unlike the commands that run the `vite` dev server, these commands build the app in `emulators` mode, and rely on the firebase hosting emulator to make the built app available on http://localhost:5000.
