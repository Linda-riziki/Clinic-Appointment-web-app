// Import the functions you need from the SDKs you need
//import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBzIh0ZIY_gj7woD8B9p6QuwIu26VcIz2g",
  authDomain: "powerlearn-b975e.firebaseapp.com",
  projectId: "powerlearn-b975e",
  storageBucket: "powerlearn-b975e.firebasestorage.app",
  messagingSenderId: "303635277341",
  appId: "1:303635277341:web:e1031c495891bbb263c8f4",
  measurementId: "G-CJY2BYNTLM"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();