console.log("🧡 CMS LOADING...");

// =========================
// FIREBASE INIT (SAFE)
// =========================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyDWYYS09i4YN9tnCmAzeiicD9T4YZ3a6HE",
    authDomain: "hv-novitas-beheer.firebaseapp.com",
    databaseURL: "https://hv-novitas-beheer-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "hv-novitas-beheer",
    storageBucket: "hv-novitas-beheer.appspot.com",
    messagingSenderId: "71716605241",
    appId: "1:71716605241:web:b7e87d680b7499421a6ce8"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

console.log("🧡 Firebase READY");

// =========================
// SAFE START
// =========================
document.addEventListener("DOMContentLoaded", () => {

    console.log("🟢 DOM READY");

    const form = document.getElementById("newsForm");
    const status = document.getElementById("status");

    if (!form) {
        console.error("❌ newsForm niet gevonden");
        return;
    }

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        console.log("🟢 SUBMIT CLICKED");

        const titleEl = document.getElementById("title");
        const textEl = document.getElementById("text");

        if (!titleEl || !textEl) {
            console.error("❌ inputs niet gevonden");
            return;
        }

        const title = titleEl.value.trim();
        const text = textEl.value.trim();

        if (!title || !text) {
            alert("Vul alle velden in");
            return;
        }

        try {

            status.textContent = "⏳ Opslaan...";

            await push(ref(db, "news"), {
                title: title,
                text: text,
                image: "",
                created: Date.now(),
                date: new Date().toLocaleDateString("nl-NL"),
                time: new Date().toLocaleTimeString("nl-NL")
            });

            console.log("✅ SAVED TO FIREBASE");

            status.textContent = "✅ Opgeslagen!";
            form.reset();

        } catch (err) {

            console.error("❌ FIREBASE ERROR:", err);
            status.textContent = "❌ Opslaan mislukt";
        }

    });

});
