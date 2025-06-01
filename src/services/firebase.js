import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence,
  getAuth,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

// configs do firebase
const firebaseConfig = {
  apiKey: "AIzaSyDL0YZ75AApdBhQBPujPraukjN3lSSQOOs",
  authDomain: "gastmetro.firebaseapp.com",
  projectId: "gastmetro",
  storageBucket: "gastmetro.firebasestorage.app",
  messagingSenderId: "788960406875",
  appId: "1:788960406875:web:eeff68a3c8a94032353e7e",
  measurementId: "G-7WG9YRLY98",
};

// inicia o firebase
const app = initializeApp(firebaseConfig);

// tenta usar initializeAuth primeiro, se falhar usa getAuth
// (problema se a pessoa já está logada na web)
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error) {
  // se initializeAuth falhar, usa getAuth
  auth = getAuth(app);
}

export { auth };

// inicia o firestore
export const db = getFirestore(app);

export default app;
