import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

console.log("🧡 CMS SYSTEM START");

// =========================
// FIREBASE INIT
// =========================
const firebaseConfig = {
    apiKey: "AIzaSyDWYYS09i4YN9tnCmAzeiicD9T4YZ3a6HE",
    authDomain: "hv-novitas-beheer.firebaseapp.com",
    databaseURL: "https://hv-novitas-beheer-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "hv-novitas-beheer",
    storageBucket: "hv-novitas-beheer.appspot.com",
    messagingSenderId: "71716605241",
    appId: "1:71716605241:web:b7e87d680b7499421a6ce8"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

console.log("🧡 FIREBASE READY");

// =========================
// START CMS
// =========================
document.addEventListener("DOMContentLoaded", () => {

    console.log("🟢 CMS READY");

    const form = document.getElementById("newsForm");
    const status = document.getElementById("status");

    const imgInput = document.getElementById("image");
    const addBtn = document.getElementById("addImage");
    const preview = document.getElementById("preview");
    const imgStatus = document.getElementById("imgStatus");

    if (!form) {
        console.error("❌ newsForm niet gevonden");
        return;
    }

    // =========================
    // IMAGE SYSTEM (MAX 3)
    // =========================
    let images = [];

    function updateUI() {
        preview.innerHTML = "";

        images.forEach(img => {
            const el = document.createElement("img");
            el.src = img;
            el.style.width = "100%";
            el.style.marginTop = "10px";
            el.style.borderRadius = "10px";
            preview.appendChild(el);
        });

        imgStatus.textContent = `${images.length} / 3 foto's`;
    }

    function toBase64(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(file);
        });
    }

    addBtn?.addEventListener("click", async () => {

        if (images.length >= 3) {
            alert("Max 3 foto's toegestaan");
            return;
        }

        const file = imgInput.files[0];

        if (!file) {
            alert("Selecteer een foto");
            return;
        }

        const base64 = await toBase64(file);

        images.push(base64);

        updateUI();

        imgInput.value = "";
    });

    // =========================
    // SUBMIT NEWS
    // =========================
    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        const title = document.getElementById("title").value.trim();
        const text = document.getElementById("text").value.trim();

        if (!title || !text) {
            alert("Vul titel en tekst in");
            return;
        }

        try {

            status.textContent = "⏳ Opslaan...";

            await push(ref(db, "news"), {
                title,
                text,
                images,
                created: Date.now(),
                date: new Date().toLocaleDateString("nl-NL"),
                time: new Date().toLocaleTimeString("nl-NL")
            });

            console.log("✅ SAVED");

            status.textContent = "✅ Opgeslagen!";

            form.reset();
            images = [];
            preview.innerHTML = "";
            imgStatus.textContent = "0 / 3 foto's";

        } catch (err) {

            console.error("❌ ERROR:", err);
            status.textContent = "❌ Opslaan mislukt";
        }

    });

});
