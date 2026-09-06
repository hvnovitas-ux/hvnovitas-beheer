// ============================================================
// HV NOVITAS CMS
// Firebase centrale verbinding
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    getDatabase
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

import {
    getStorage
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";

// Gebruik de bestaande HV Novitas Firebase-configuratie.
const firebaseConfig = {
    apiKey: "AIzaSyBCUZeWMIxIz__7TfNG_b0V47H_pYFPyqQ",
    authDomain: "hv-novitas-handbal-challenge.firebaseapp.com",
    databaseURL: "https://hv-novitas-handbal-challenge-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "hv-novitas-handbal-challenge",
    storageBucket: "hv-novitas-handbal-challenge.firebasestorage.app",
    messagingSenderId: "707710141199",
    appId: "1:707710141199:web:ba304ce4e5f653d0afb47a"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);
export const storage = getStorage(app);

console.log("🧡 HV Novitas Firebase geladen");
