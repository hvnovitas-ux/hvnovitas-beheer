import { db } from "./firebase.js";
import { ref, push } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

console.log("🧡 CMS LOADED");

document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("newsForm");
    const status = document.getElementById("status");

    const imgInput = document.getElementById("image");

    let imageData = ""; // 👈 1 FOTO ONLY

    if (!form) {
        console.error("❌ FORM NIET GEVONDEN");
        return;
    }

    // =========================
    // IMAGE SELECT (1 FOTO)
    // =========================
    imgInput?.addEventListener("change", async (e) => {

        const file = e.target.files[0];

        if (!file) return;

        const reader = new FileReader();

        reader.onload = () => {
            imageData = reader.result; // 👈 base64 opslaan
            console.log("🖼 FOTO INGELADEN");
        };

        reader.readAsDataURL(file);
    });

    // =========================
    // SUBMIT
    // =========================
    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        const title = document.getElementById("title").value.trim();
        const text = document.getElementById("text").value.trim();

        if (!title || !text) {
            alert("Vul alles in");
            return;
        }

        try {

            status.textContent = "⏳ Opslaan...";

            await push(ref(db, "news"), {
                title,
                text,
                image: imageData, // 👈 BELANGRIJK
                created: Date.now(),
                date: new Date().toLocaleDateString("nl-NL"),
                time: new Date().toLocaleTimeString("nl-NL")
            });

            console.log("✅ OPGESLAGEN");

            status.textContent = "✅ Opgeslagen!";

            form.reset();
            imageData = ""; // reset na save

        } catch (err) {

            console.error("❌ ERROR:", err);
            status.textContent = "❌ Opslaan mislukt";
        }

    });

});
