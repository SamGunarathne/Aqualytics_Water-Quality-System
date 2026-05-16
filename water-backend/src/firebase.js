// src/firebase.js

import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Your Firebase config (from Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyBn2zkxkdKM3fvzhjfqOa1IGJkWA8Fi13U",
  authDomain: "aqualytics-649ed.firebaseapp.com",
  databaseURL: "https://aqualytics-649ed-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "aqualytics-649ed",
  storageBucket: "aqualytics-649ed.firebasestorage.app",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

