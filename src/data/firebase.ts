import { initializeApp } from "firebase/app";
import { connectFirestoreEmulator, initializeFirestore } from "firebase/firestore";
import { connectAuthEmulator, getAuth } from "firebase/auth";

export const projectId = "loggr-a3f89";

// Firebase configuration: Firebase API key and app IDs are not secret.
const firebaseConfig = {
  apiKey: "AIzaSyBicOCKq5uX_7eQ0cWW0poe7eHR7wEx_T4",
  authDomain: "loggr-a3f89.firebaseapp.com",
  projectId,
  storageBucket: "loggr-a3f89.appspot.com",
  messagingSenderId: "1016117877817",
  appId: "1:1016117877817:web:8e78be6dc5d84d1b9a41e8"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = initializeFirestore(app, { experimentalAutoDetectLongPolling: true, })
// Initialize the firebase auth service.
export const auth = getAuth(app);

export const attachEmulators = () => {
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  connectAuthEmulator(auth, 'http://127.0.0.1:9099');
}
