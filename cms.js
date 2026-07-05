import { db } from "./firebase.js";
import { ref, push, remove, update, onValue } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

console.log("🧡 TEXT CMS LOADED");

document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("newsForm");
    const status = document.getElementById("status");
    const list = document.getElementById("newsList");

    window.editingId = null;

    // ================= SAVE / EDIT =================
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
                    date: new Date().toLocaleDateString("nl-NL"),
                    time: new Date().toLocaleTimeString("nl-NL")
                });

                window.editingId = null;

            }

            // ================= CREATE =================
            else {

                await push(ref(db, "news"), {
                    title,
                    text,
                    created: Date.now(),
                    date: new Date().toLocaleDateString("nl-NL"),
                    time: new Date().toLocaleTimeString("nl-NL")
                });
            }

            form.reset();
            status.textContent = "✅ Opgeslagen!";

        } catch (err) {
            console.error(err);
            status.textContent = "❌ Fout";
        }
    });

    // ================= LIST =================
    onValue(ref(db, "news"), (snapshot) => {

        const data = snapshot.val();

        if (!list) return;

        const items = Object.entries(data || {}).map(([id, value]) => ({
            id,
            ...value
        }));

        list.innerHTML = items.reverse().map(n => `
            <div class="news-item">

                <b>${n.title}</b>

                <p>${n.text}</p>

                <small>${n.date || ""} ${n.time || ""}</small>

                <div class="actions">
                    <button onclick="editNews('${n.id}', '${n.title}', '${n.text}')">Edit</button>
                    <button onclick="deleteNews('${n.id}')" style="background:red;">Delete</button>
                </div>

            </div>
        `).join("");

    });

});

// ================= DELETE =================
window.deleteNews = async (id) => {

    if (!confirm("Weet je zeker dat je dit wilt verwijderen?")) return;

    await remove(ref(db, "news/" + id));
};

// ================= EDIT =================
window.editNews = (id, title, text) => {

    document.getElementById("title").value = title;
    document.getElementById("text").value = text;

    window.editingId = id;
};
