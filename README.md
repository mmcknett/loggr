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

## Testing
The easiest way to run end-to-end cypress tests is:

```
npm run cypress:auto
```

This will launch the dev server, start the emulators, and invoke a cypress run.

You can also start the dev server and emulators in the same mode and let them continue running with:

```
npm run dev:cypress
```

With the dev server and firebase emulators running in this mode, invoke cypress commands by running them from the command line with `npm run cypress:run` or open the cypress UI and select tests to run manually with:

```
npm run cypress
```