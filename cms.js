// ==========================================
// HV NOVITAS CMS - STABLE VERSION
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

console.log("🔥 CMS JS GELADEN");

// ==========================================
// DOM READY
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
    // SUBMIT
    // ======================================

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        console.log("🚀 SUBMIT CLICKED");

        const title = titleInput.value.trim();
        const text = textInput.value.trim();
        const file = imageInput.files[0];

        if (!title || !text) {
            alert("Vul titel en tekst in");
            return;
        }

        try {

            status.innerText = "⏳ Uploaden...";

            let imageUrl = "";

            // ==================================
            // DRIVE UPLOAD (APPS SCRIPT)
            // ==================================

            if (file) {

                console.log("📷 Upload start...");

                const upload = await uploadFile(file);

                console.log("📦 Upload result:", upload);

                imageUrl = upload.image;
            }

            // ==================================
            // FIREBASE SAVE
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

            status.innerText = "✅ Gepubliceerd!";

            form.reset();

        } catch (error) {

            console.error("❌ ERROR:", error);

            status.innerText = "❌ Fout bij upload";
        }

    });

});
