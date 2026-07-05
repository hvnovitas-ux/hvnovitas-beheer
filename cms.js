import { db } from "./firebase.js";

import {
    ref,
    push,
    onValue,
    remove,
    update
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

console.log("🧡 NEW CMS LOADED");

// ELEMENTEN
const title = document.getElementById("title");
const text = document.getElementById("text");
const publish = document.getElementById("publish");
const status = document.getElementById("status");
const newsList = document.getElementById("newsList");

let editID = null;

// PUBLISH
publish.onclick = async () => {

    if (!title.value || !text.value) {
        alert("Vul alles in");
        return;
    }

    try {

        status.textContent = "⏳ Opslaan...";

        const data = {
            title: title.value,
            text: text.value,
            created: Date.now(),
            date: new Date().toLocaleDateString("nl-NL"),
            time: new Date().toLocaleTimeString("nl-NL", {
                hour: "2-digit",
                minute: "2-digit"
            })
        };

        if (editID) {

            await update(ref(db, "news/" + editID), data);
            status.textContent = "✅ Bijgewerkt";

        } else {

            await push(ref(db, "news"), data);
            status.textContent = "✅ Gepubliceerd";
        }

        title.value = "";
        text.value = "";
        editID = null;

    } catch (err) {
        console.error(err);
        status.textContent = "❌ Fout";
    }
};

// LOAD NEWS
onValue(ref(db, "news"), (snap) => {

    let items = [];

    snap.forEach((i) => {
        items.push({ id: i.key, ...i.val() });
    });

    items.sort((a, b) => (b.created || 0) - (a.created || 0));

    newsList.innerHTML = items.map(n => `
        <div class="news-item">

            <h3>${n.title}</h3>
            <small>${n.date} ${n.time}</small>

            <p>${n.text}</p>

            <div class="actions">

                <button onclick="editNews('${n.id}')">Edit</button>
                <button class="delete" onclick="deleteNews('${n.id}')">Delete</button>

            </div>

        </div>
    `).join("");
});

// DELETE
window.deleteNews = async (id) => {
    await remove(ref(db, "news/" + id));
};

// EDIT
window.editNews = async (id) => {

    const snap = await get(ref(db, "news/" + id));
    const data = snap.val();

    title.value = data.title;
    text.value = data.text;

    editID = id;
};
