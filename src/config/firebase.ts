import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDWTCe9V0PFRlMw8H7txZw1K81wZZggaP0",
  authDomain: "cruddd-5b36d.firebaseapp.com",
  projectId: "cruddd-5b36d",
  storageBucket: "cruddd-5b36d.firebasestorage.app",
  messagingSenderId: "143313146115",
  appId: "1:143313146115:web:89e316140617d01e4d1936",
  measurementId: "G-KYZ0R5H9FB",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
