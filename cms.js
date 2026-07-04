console.log("🔥 CMS IS GELADEN");
// ==========================================
// HV NOVITAS CMS - CLEAN FIXED VERSION
// ==========================================

import { db } from "./firebase.js";
import { uploadFile } from "./drive.js";

import {
    ref,
    push
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

// ==========================================
// START
// ==========================================

console.log("🔥 CMS LOADED");

// ==========================================
// WAIT FOR DOM
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("newsForm");
    const titleInput = document.getElementById("title");
    const textInput = document.getElementById("text");
    const imageInput = document.getElementById("image");
    const status = document.getElementById("status");

    if (!form) {
        console.error("❌ FORM NIET GEVONDEN");
        return;
    }

    console.log("✅ FORM READY");

    // ======================================
    // SUBMIT HANDLER
    // ======================================

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        console.log("🚀 SUBMIT START");

        const title = titleInput.value.trim();
        const text = textInput.value.trim();
        const file = imageInput.files[0];

        if (!title || !text) {
            alert("Vul titel en tekst in");
            return;
        }

        try {

            status.innerText = "Uploaden...";

            let imageUrl = "";

            // ==================================
            // 1. UPLOAD NAAR DRIVE
            // ==================================

            if (file) {

                console.log("📷 Upload naar Drive...");

                const upload = await uploadFile(file);

                console.log("📦 DRIVE RESULT:", upload);

                imageUrl = upload.image;
            }

            // ==================================
            // 2. SAVE NAAR FIREBASE
            // ==================================

            const data = {
                title,
                text,
                image: imageUrl,
                timestamp: Date.now(),
                date: new Date().toLocaleDateString("nl-NL"),
                time: new Date().toLocaleTimeString("nl-NL", {
                    hour: "2-digit",
                    minute: "2-digit"
                })
            };

            await push(ref(db, "news"), data);

            console.log("🔥 SAVED TO FIREBASE");

            status.innerText = "✅ Nieuws gepubliceerd";

            form.reset();

        } catch (error) {

            console.error("❌ ERROR:", error);

            status.innerText = "❌ Fout bij publiceren";
        }

    });

});
