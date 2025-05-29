// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence,
  getAuth,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Configuração do Firebase
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

// Initialize Firebase Auth com persistência para React Native
// Tenta usar initializeAuth primeiro, se falhar usa getAuth (fallback para web)
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error) {
  // Se initializeAuth falhar (ex: já foi inicializado), usa getAuth
  auth = getAuth(app);
}

export { auth };

// Initialize Firestore
export const db = getFirestore(app);

export default app;
