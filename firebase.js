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

// ==========================================
// HV NOVITAS BEHEER - FIREBASE
// ==========================================

const firebaseConfig = {

    apiKey: "AIzaSyDWYYS09i4YN9tnCmAzeiicD9T4YZ3a6HE",

    authDomain: "hv-novitas-beheer.firebaseapp.com",

    databaseURL: "https://hv-novitas-beheer-default-rtdb.europe-west1.firebasedatabase.app",

    projectId: "hv-novitas-beheer",

    storageBucket: "hv-novitas-beheer.firebasestorage.app",

    messagingSenderId: "71716605241",

    appId: "1:71716605241:web:b7e87d680b7499421a6ce8"

};

// ==========================================
// INITIALISEREN
// ==========================================

const app = initializeApp(firebaseConfig);

// ==========================================
// AUTHENTICATION
// ==========================================

const auth = getAuth(app);

const provider = new GoogleAuthProvider();

provider.setCustomParameters({
    prompt: "select_account"
});

// ==========================================
// DATABASE
// ==========================================

const db = getDatabase(app);

// ==========================================
// STORAGE
// ==========================================

const storage = getStorage(app);

// ==========================================
// EXPORTS
// ==========================================

export {
    auth,
    provider,
    db,
    storage
};

// ==========================================
// INFO
// ==========================================

console.log("🧡 HV Novitas Beheer succesvol verbonden met Firebase");
