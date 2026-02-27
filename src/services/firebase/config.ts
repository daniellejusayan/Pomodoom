import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAnalytics, Analytics } from 'firebase/analytics';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Firebase configuration for the "pomodoom" project. These values
// are taken from the web app settings in the Firebase console.

const firebaseConfig = {
  apiKey: "AIzaSyCBvOkhFQyLjDuFlJiZyTETjUuYNRpq94s",
  authDomain: "pomodoom.firebaseapp.com",
  projectId: "pomodoom",
  storageBucket: "pomodoom.firebasestorage.app",
  messagingSenderId: "97794872445",
  appId: "1:97794872445:web:819c5739e5268dd372cd14",
  measurementId: "G-MVDBF0DR6B"
};

let app: FirebaseApp | undefined;
let analytics: Analytics | undefined;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;

// Initialize Firebase once and export services for use across the app
if (!app) {
  app = initializeApp(firebaseConfig);
  analytics = getAnalytics(app);
  db = getFirestore(app);
  storage = getStorage(app);
}

export { app, analytics, db, storage };
