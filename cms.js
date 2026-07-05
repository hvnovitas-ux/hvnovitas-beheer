import { db } from "./firebase.js";
import { ref, push, onValue, remove, update } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

console.log("🧡 NEWS CMS CLEAN LOADED");

const form = document.getElementById("newsForm");
const title = document.getElementById("title");
const text = document.getElementById("text");
const status = document.getElementById("status");
const list = document.getElementById("newsList");

window.editingId = null;

// ================= CREATE / UPDATE =================
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!title.value || !text.value) return;

    status.textContent = "⏳ Opslaan...";

    try {

        // 🔴 EDIT MODE
        if (window.editingId) {

            await update(ref(db, "news/" + window.editingId), {
                title: title.value,
                text: text.value,
                date: new Date().toLocaleDateString("nl-NL"),
                time: new Date().toLocaleTimeString("nl-NL")
            });

            window.editingId = null;

        } 
        // 🟢 CREATE MODE
        else {

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

// ================= LOAD NEWS =================
onValue(ref(db, "news"), (snapshot) => {

    const data = snapshot.val();

    if (!list) return;

    if (!data) {
        list.innerHTML = "<p>Geen nieuws</p>";
        return;
    }

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

            <button onclick="editNews('${n.id}', ${JSON.stringify(n)})">Edit</button>
            <button onclick="deleteNews('${n.id}')">Delete</button>

        </div>
    `).join("");

});

// ================= DELETE =================
window.deleteNews = async (id) => {
    await remove(ref(db, "news/" + id));
};

// ================= EDIT =================
window.editNews = (id, data) => {

    title.value = data.title;
    text.value = data.text;

    window.editingId = id;
};
