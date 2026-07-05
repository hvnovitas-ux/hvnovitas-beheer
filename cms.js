import { db } from "./firebase.js";
import { ref, push } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

import {
    images,
    addImage,
    resetImages,
    render
} from "./images.js";

console.log("🧡 CMS LOADED");

document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("newsForm");
    const status = document.getElementById("status");

    const imgInput = document.getElementById("image");
    const addBtn = document.getElementById("addImage");
    const preview = document.getElementById("preview");
    const imgStatus = document.getElementById("imgStatus");

    if (!form) {
        console.error("❌ FORM NIET GEVONDEN");
        return;
    }

    // =====================
    // IMAGE SYSTEM
    // =====================
    addBtn?.addEventListener("click", () => {

        const file = imgInput.files[0];

        if (!file) {
            alert("Selecteer een foto");
            return;
        }

        addImage(file, preview, imgStatus);
        imgInput.value = "";
    });

    // =====================
    // SUBMIT
    // =====================
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
                images,
                created: Date.now(),
                date: new Date().toLocaleDateString("nl-NL"),
                time: new Date().toLocaleTimeString("nl-NL")
            });

            status.textContent = "✅ Opgeslagen!";

            form.reset();
            resetImages();
            render(preview, imgStatus);

        } catch (err) {

            console.error("FIREBASE ERROR:", err);
            status.textContent = "❌ Opslaan mislukt";
        }

    });

});
