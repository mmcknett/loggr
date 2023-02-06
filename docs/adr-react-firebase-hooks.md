# Architecture Decision Record: React Firebase Hooks

## Background
If you want to take full advantage of Firebase, it's best to register and unregister for observable events on the firebase JavaScript SDK. Using the JS SDK correctly therefore requires writing custom hooks to manage the snapshot registrations.

There is a relatively popular library of existing custom hooks, [react-firebase-hooks
](https://www.npmjs.com/package/react-firebase-hooks), that already wraps all the firebase APIs.

## Options
1. Continue to write custom hooks for basically any firebase SDK API call, and also separately manage information such as whether those API calls are in flight.
1. Use `react-firebase-hooks`, a set of hooks created by CSFrequency.
1. Use `reactfire`, a set of hooks and providers created and maintained on a best-effort basis by Googlers.

## Decision
It's less overhead and maintenance to take simply take advantage of the hooks from the library, so use `react-firebase-hooks`. This comes at the cost of another dependency and more code in the package, but this is mitigated to a degree by the tree-shakeability of the library.

As for why `react-firebase-hooks` over `reactfire`–I didn't find `reactfire` until I had gotten halfway through implementing with `react-firebase-hooks`. This decision may warrant revisiting. `reactfire` looks like it has more features (and support for `Suspense`), but is also significantly less popular.
