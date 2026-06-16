# loggr

A simple SPA using a firebase backend for logging time.

`main` build/test status: ![Cypress Test Status indicator](https://github.com/mmcknett/loggr/actions/workflows/cypress-tests.yml/badge.svg?branch=main) ![Firebase Hosting Deployment Status indicator](https://github.com/mmcknett/loggr/actions/workflows/firebase-hosting-merge.yml/badge.svg?branch=main)

Prod deployment to: https://loggr.mmcknett.dev

# Development
## Setup
You'll need the firebase CLI tools in order to setup and run emulators or make manual deVployments.

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
### Simple
The easiest way to run end-to-end cypress tests is:

```
npm run cypress:auto
```

This will build the project to use the emulators, start the emulators, and invoke a cypress run. Everything tears down automatically.

Similarly, if you run

```
npm run cypress:interactive
```

you'll be able to invoke tests from the Cypress UI, targeting the emulators, all with single command. Everything also tears down automatically in this mode.

### Custom
If you have more complex testing needs, such as if you need to execute command line tests, you can also start the dev server and emulators separately and allow them to continue running. Use this command:

```
npm run dev:cypress
```

With the dev server and firebase emulators running in this mode, you can, for example, invoke cypress commands by running them from the command line:

```
# For interactive Cypress UI
npm run cypress

# To run Cypress without the UI
npm run cypress:run
```

Note that unlike the commands that run the `vite` dev server, these commands build the app in `emulators` mode, and rely on the firebase hosting emulator to make the built app available on http://localhost:5002.
