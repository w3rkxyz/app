// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCC2_wE5t_Xw-mfkOlw9bR-CJGo_rdlfnE",
  authDomain: "w3rk-testnet.firebaseapp.com",
  projectId: "w3rk-testnet",
  storageBucket: "w3rk-testnet.firebasestorage.app",
  messagingSenderId: "1049049004774",
  appId: "1:1049049004774:web:648254ab9ecfbf97af5927",
  measurementId: "G-V0DVQ37253",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;
