// @ts-nocheck
import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Enable Firestore offline persistence for high robustness and automatic cache lookups
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time.
      console.warn('Firestore offline persistence failed-precondition: multiple tabs are open.');
    } else if (err.code === 'unimplemented') {
      // The current browser does not support all of the features required to enable persistence
      console.warn('Firestore offline persistence is unimplemented in this browser.');
    } else {
      console.warn('Firestore offline persistence initialization warning:', err);
    }
  });
}

export { firebaseConfig };
