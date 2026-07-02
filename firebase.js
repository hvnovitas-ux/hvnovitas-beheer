import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getAuth,
    GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    getDatabase
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

import {
    getStorage
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";

// =====================================
// Firebase Config
// =====================================

const firebaseConfig = {
    apiKey: "AIzaSyDWYYS09i4YN9tnCmAzeiicD9T4YZ3a6HE",
    authDomain: "hv-novitas-beheer.firebaseapp.com",
    databaseURL: "https://hv-novitas-beheer-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "hv-novitas-beheer",
    storageBucket: "hv-novitas-beheer.firebasestorage.app",
    messagingSenderId: "71716605241",
    appId: "1:71716605241:web:b7e87d680b7499421a6ce8"
};

// =====================================
// Initialiseren
// =====================================

const app = initializeApp(firebaseConfig);

// =====================================
// Authentication
// =====================================

export const auth = getAuth(app);

export const provider = new GoogleAuthProvider();

// Altijd Google-account kiezen
provider.setCustomParameters({
    prompt: "select_account"
});

// =====================================
// Realtime Database
// =====================================

export const db = getDatabase(app);

// =====================================
// Storage
// =====================================

export const storage = getStorage(app);

// =====================================
// Console
// =====================================

console.log("🧡 HV Novitas Beheer succesvol verbonden met Firebase");
