import { db } from "./firebase.js";
import { ref, push, remove, update } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

console.log("🧡 CMS LOADED");

document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("newsForm");
    const status = document.getElementById("status");
    const imgInput = document.getElementById("image");

    let imageData = "";
    window.editingId = null;

    // ======================
    // IMAGE
    // ======================
    imgInput?.addEventListener("change", (e) => {

        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = () => {
            imageData = reader.result;
        };

        reader.readAsDataURL(file);
    });

    // ======================
    // SUBMIT (CREATE + EDIT)
    // ======================
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

            // EDIT MODE
            if (window.editingId) {

                await update(ref(db, "news/" + window.editingId), {
                    title,
                    text,
                    image: imageData
                });

                window.editingId = null;

            } 
            // CREATE MODE
            else {

                await push(ref(db, "news"), {
                    title,
                    text,
                    image: imageData,
                    created: Date.now(),
                    date: new Date().toLocaleDateString("nl-NL"),
                    time: new Date().toLocaleTimeString("nl-NL")
                });
            }

            status.textContent = "✅ Opgeslagen!";
            form.reset();
            imageData = "";

        } catch (err) {
            console.error(err);
            status.textContent = "❌ Fout";
        }

    });

});

// ======================
// DELETE
// ======================
window.deleteNews = async (id) => {

    if (!confirm("Weet je zeker dat je dit wilt verwijderen?")) return;

    await remove(ref(db, "news/" + id));
};

// ======================
// EDIT
// ======================
window.editNews = (id, title, text, image) => {

    document.getElementById("title").value = title;
    document.getElementById("text").value = text;

    window.editingId = id;
};
