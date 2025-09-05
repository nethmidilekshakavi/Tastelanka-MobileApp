import { FirebaseApp, initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import {getStorage} from "firebase/storage";
import { getFunctions } from "firebase/functions"; // web SDK


const firebaseConfig = {
  apiKey: "AIzaSyDjJl_BuEvctQI8y_uL4obJQes8PqvVNLQ",
  authDomain: "tastelanka-mobileapp.firebaseapp.com",
  projectId: "tastelanka-mobileapp",
  storageBucket: "tastelanka-mobileapp.firebasestorage.app",
  messagingSenderId: "744189469283",
  appId: "1:744189469283:web:64f673a6e5695e91ab8e56"
};


// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app); // ← pass app





