// src/firebase.js

import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBn2zkxkdKM3fvzhjfqOa1IGJkWA8Fi13U",
  authDomain: "aqualytics-649ed.firebaseapp.com",
  databaseURL: "https://aqualytics-649ed-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "aqualytics-649ed",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getDatabase(app);