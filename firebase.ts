
// Import the functions you need from the SDKs you need
import {initializeApp} from "firebase/app";
import {getAuth} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration

const firebaseConfig = {
  apiKey: "AIzaSyDK3wKiGqfMnKbupbaSnA06utuSckrZSFo",
  authDomain: "task-manager-app-1fdbf.firebaseapp.com",
  projectId: "task-manager-app-1fdbf",
  storageBucket: "task-manager-app-1fdbf.firebasestorage.app",
  messagingSenderId: "671486075488",
  appId: "1:671486075488:web:e6a6e91afacd38ab6a5905"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app)
export const db = getFirestore(app)


