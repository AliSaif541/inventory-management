// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import {getFirestore} from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAZ43LQcknv8tRPLGz_Qjt-9UUIU-sLz6A",
  authDomain: "inventory-management-b9879.firebaseapp.com",
  projectId: "inventory-management-b9879",
  storageBucket: "inventory-management-b9879.appspot.com",
  messagingSenderId: "218197666754",
  appId: "1:218197666754:web:bdc89abee944a2d373845b",
  measurementId: "G-SEPY742Z0V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

export { auth, firestore};