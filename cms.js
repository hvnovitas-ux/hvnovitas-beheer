import { db } from "./firebase.js";
import { ref, push, onValue, remove, update } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

console.log("🧡 HV NOVITAS PRO CMS LOADED");

// DOM
const form = document.getElementById("newsForm");
const title = document.getElementById("title");
const text = document.getElementById("text");
const status = document.getElementById("status");
const list = document.getElementById("newsList");

// state
window.editingId = null;
window.newsCache = {};

// ================= SAVE (CREATE / UPDATE) =================
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!title.value || !text.value) return;

    status.textContent = "⏳ Opslaan...";

    try {

        if (window.editingId) {

            await update(ref(db, "news/" + window.editingId), {
                title: title.value,
                text: text.value,
                date: new Date().toLocaleDateString("nl-NL"),
                time: new Date().toLocaleTimeString("nl-NL")
            });

            window.editingId = null;

        } else {

            await push(ref(db, "news"), {
                title: title.value,
                text: text.value,
                created: Date.now(),
                date: new Date().toLocaleDateString("nl-NL"),
                time: new Date().toLocaleTimeString("nl-NL")
            });
        }

        form.reset();
        status.textContent = "✅ Opgeslagen";

    } catch (err) {
        console.error(err);
        status.textContent = "❌ Fout";
    }
});

// ================= LOAD =================
onValue(ref(db, "news"), (snapshot) => {

    const data = snapshot.val();

    if (!list) return;

    if (!data) {
        list.innerHTML = "<p style='color:#aaa'>Geen nieuws</p>";
        return;
    }

    window.newsCache = data;

    const items = Object.entries(data).map(([id, v]) => ({
        id,
        ...v
    }));

    list.innerHTML = items.reverse().map(n => `
        <div class="news-item">

            <b>${n.title}</b>

            <p>${n.text}</p>

            <small>${n.date || ""} ${n.time || ""}</small>

            <br><br>

            <button onclick="editNews('${n.id}')">✏️ Edit</button>
            <button onclick="deleteNews('${n.id}')">🗑️ Delete</button>

        </div>
    `).join("");

});

// ================= DELETE =================
window.deleteNews = async (id) => {
    await remove(ref(db, "news/" + id));
};

// ================= EDIT =================
window.editNews = (id) => {

    const data = window.newsCache[id];

    if (!data) return;

    title.value = data.title;
    text.value = data.text;

    window.editingId = id;
    status.textContent = "✏️ Bewerken actief...";
};
