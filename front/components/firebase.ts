// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA_wtUIs38TKEFk708kVAg-sEPxtxWF95U",
  authDomain: "syncwave-73bf3.firebaseapp.com",
  projectId: "syncwave-73bf3",
  storageBucket: "syncwave-73bf3.firebasestorage.app",
  messagingSenderId: "801413103999",
  appId: "1:801413103999:web:ffc1f18965c7a085b9da4a",
  measurementId: "G-FW0T61G4D3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const provider = new GoogleAuthProvider();
const analytics = getAnalytics(app);
export {auth,provider};

