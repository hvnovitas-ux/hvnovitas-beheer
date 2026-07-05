import { db } from "./firebase.js";
import { ref, push, remove, update, onValue } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

console.log("🧡 CMS FINAL LOADED");

document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("newsForm");
    const status = document.getElementById("status");
    const list = document.getElementById("newsList");
    const imgInput = document.getElementById("image");

    let imageData = "";
    window.editingId = null;
    window.currentImage = "";

    // =====================
    // IMAGE
    // =====================
    imgInput?.addEventListener("change", (e) => {

        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = () => {
            imageData = reader.result;
        };

        reader.readAsDataURL(file);
    });

    // =====================
    // SUBMIT (CREATE + EDIT)
    // =====================
    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        const title = document.getElementById("title").value.trim();
        const text = document.getElementById("text").value.trim();

        if (!title || !text) return;

        status.textContent = "⏳ Opslaan...";

        try {

            // ================= EDIT =================
            if (window.editingId) {

                await update(ref(db, "news/" + window.editingId), {
                    title,
                    text,
                    image: imageData || window.currentImage || ""
                });

                window.editingId = null;
                window.currentImage = "";
            }

            // ================= CREATE =================
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

            form.reset();
            imageData = "";
            status.textContent = "✅ Opgeslagen!";

        } catch (err) {
            console.error(err);
            status.textContent = "❌ Fout";
        }
    });

    // =====================
    // LOAD LIST
    // =====================
    onValue(ref(db, "news"), (snapshot) => {

        const data = snapshot.val();

        const items = Object.entries(data || {}).map(([id, value]) => ({
            id,
            ...value
        }));

        list.innerHTML = items.reverse().map(n => `
            <div class="news-item">

                <b>${n.title}</b>

                <div class="actions">
                    <button onclick="editNews('${n.id}', '${n.title}', '${n.text}', '${n.image || ""}')">Edit</button>
                    <button onclick="deleteNews('${n.id}')" style="background:red;">Delete</button>
                </div>

            </div>
        `).join("");

    });

});

// =====================
// DELETE (FIXED)
// =====================
window.deleteNews = async (id) => {

    if (!id) return;

    const ok = confirm("Weet je zeker dat je dit wilt verwijderen?");
    if (!ok) return;

    await remove(ref(db, "news/" + id));
};

// =====================
// EDIT (FIXED)
// =====================
window.editNews = (id, title, text, image) => {

    document.getElementById("title").value = title || "";
    document.getElementById("text").value = text || "";

    window.editingId = id;
    window.currentImage = image || "";
};
