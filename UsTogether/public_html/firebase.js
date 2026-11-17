import { initializeApp } from
"https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js";

import { getAuth } from
"https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

import { getFirestore } from
"https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";

import { getStorage } from
"https://www.gstatic.com/firebasejs/13.4.0/firebase-storage.js";

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD5tOXqbPEWwgv5k4Gv22bGIT9f5OoNR7w",
    authDomain: "us-together-df3c5.firebaseapp.com",
    projectId: "us-together-df3c5",
    storageBucket: "us-together-df3c5.firebasestorage.app",
    messagingSenderId: "671741579645",
    appId: "1:671741579645:web:dc97640d90ec48e642bc14",
    measurementId: "G-YG9LJFJ4QQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Export services
export { app, auth, db, storage };

console.log("Us Together connected to Firebase! ♡");