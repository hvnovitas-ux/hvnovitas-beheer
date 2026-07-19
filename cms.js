import { db } from "./firebase.js";
import { ref, push, onValue, remove, update } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

console.log("🧡 CLEAN CMS LOADED");

// ================= NEWS =================

const form = document.getElementById("newsForm");
const title = document.getElementById("title");
const text = document.getElementById("text");
const statusNews = document.getElementById("newsStatus");
const newsList = document.getElementById("newsList");

window.editingId = null;
window.newsCache = {};

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!title.value || !text.value) return;

    if (window.editingId) {

        await update(ref(db, "news/" + window.editingId), {
            title: title.value,
            text: text.value
        });

        window.editingId = null;

    } else {

        await push(ref(db, "news"), {
            title: title.value,
            text: text.value,
            created: Date.now()
        });
    }

    form.reset();
    if (statusNews) statusNews.textContent = "✅ Opgeslagen";
});

onValue(ref(db, "news"), (snapshot) => {

    const data = snapshot.val();
    if (!newsList) return;

    if (!data) {
        newsList.innerHTML = "<p>Geen nieuws</p>";
        return;
    }

    window.newsCache = data;

    const items = Object.entries(data);

    newsList.innerHTML = items.reverse().map(([id, n]) => `
        <div class="news-item">

            <b>${n.title}</b>
            <p>${n.text}</p>

            <button onclick="editNews('${id}')">Edit</button>
            <button onclick="deleteNews('${id}')">Delete</button>

        </div>
    `).join("");
});

window.deleteNews = async (id) => {
    await remove(ref(db, "news/" + id));
};

window.editNews = (id) => {
    const data = window.newsCache[id];
    title.value = data.title;
    text.value = data.text;
    window.editingId = id;
};

// ================= SPONSORS TEST (APART + SAFE) =================

window.addTestSponsor = async () => {

    await push(ref(db, "sponsors"), {
        name: "Test Sponsor",
        imageUrl: "https://via.placeholder.com/150",
        created: Date.now()
    });

    console.log("Sponsor toegevoegd");
};
