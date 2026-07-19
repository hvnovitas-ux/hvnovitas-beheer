import { db } from "./firebase.js";
import { ref, push, onValue, remove, update } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

console.log("🧡 CMS SIMPLE LOADED");

const form = document.getElementById("newsForm");
const title = document.getElementById("title");
const text = document.getElementById("text");
const status = document.getElementById("status");
const list = document.getElementById("newsList");

window.editingId = null;
window.newsCache = {};

// SAVE
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
    status.textContent = "✅ Opgeslagen";
});

// LOAD
onValue(ref(db, "news"), (snapshot) => {

    const data = snapshot.val();

    if (!list) return;

    if (!data) {
        list.innerHTML = "<p>Geen nieuws</p>";
        return;
    }

    window.newsCache = data;

    const items = Object.entries(data);

    list.innerHTML = items.reverse().map(([id, n]) => `
        <div class="news-item">

            <b>${n.title}</b>
            <p>${n.text}</p>

            <button onclick="editNews('${id}')">Edit</button>
            <button onclick="deleteNews('${id}')">Delete</button>

        </div>
    `).join("");

});

// DELETE
window.deleteNews = async (id) => {
    await remove(ref(db, "news/" + id));
};

// EDIT
window.editNews = (id) => {

    const data = window.newsCache[id];

    title.value = data.title;
    text.value = data.text;

    window.editingId = id;
};
import { ref, push } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";
import { db } from "./firebase.js";

console.log("🤝 SPONSOR TEST READY");

// TEST: 1 sponsor toevoegen
window.addTestSponsor = async () => {

    await push(ref(db, "sponsors"), {
        name: "Test Sponsor",
        imageUrl: "https://via.placeholder.com/150",
        created: Date.now()
    });

    console.log("Sponsor toegevoegd");
};
