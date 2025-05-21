// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Substitua pelos seus dados de configuração do Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyDL0YZ75AApdBhQBPujPraukjN3lSSQOOs",
  authDomain: "gastmetro.firebaseapp.com",
  projectId: "gastmetro",
  storageBucket: "gastmetro.firebasestorage.app",
  messagingSenderId: "788960406875",
  appId: "1:788960406875:web:eeff68a3c8a94032353e7e",
  measurementId: "G-7WG9YRLY98",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth and Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
