// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey:import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-estate-9d99a.firebaseapp.com",
  projectId: "mern-estate-9d99a",
  storageBucket: "mern-estate-9d99a.firebasestorage.app",
  messagingSenderId: "126218895446",
  appId: "1:126218895446:web:85f274c84937a56789fbf7"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);