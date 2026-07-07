import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBn2zkxkdKM3fvzhjfqOa1IGJkWA8Fi13U",
  authDomain: "aqualytics-649ed.firebaseapp.com",
  databaseURL: "https://aqualytics-649ed-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "aqualytics-649ed",
  storageBucket: "aqualytics-649ed.firebasestorage.app",
  messagingSenderId: "823456739352",
  appId: "1:823456739352:web:4c379b7bda19716f7d936d",
  
};
const app = initializeApp(firebaseConfig);


// Initialize Firebase
export const auth = getAuth(app);

// ✅ THIS MUST EXIST
export const db = getDatabase(app);