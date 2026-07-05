import { db } from "./firebase.js";
import { uploadFile } from "./drive.js";

import {
    ref,
    push,
    onValue,
    remove,
    update,
    get
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

console.log("🧡 CMS DRIVE FINAL LOADED");

// ELEMENTEN
const title = document.getElementById("title");
const text = document.getElementById("text");
const image = document.getElementById("image");
const publish = document.getElementById("publish");
const status = document.getElementById("status");
const newsList = document.getElementById("newsList");

let editID = null;

// ============================
// PUBLISH (CREATE / UPDATE)
// ============================

publish.onclick = async () => {

    if (!title.value || !text.value) {
        status.textContent = "⚠️ Vul titel en tekst in";
        return;
    }

    try {

        status.textContent = "⏳ Opslaan...";

        let imageUrl = "";

        const file = image?.files?.[0];

        // ✔ DRIVE UPLOAD (geen Firebase Storage meer)
        if (file) {
            const upload = await uploadFile(file);
            imageUrl = upload?.image || "";
        }

        const data = {
            title: title.value.trim(),
            text: text.value.trim(),
            image: imageUrl,
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

        // reset
        title.value = "";
        text.value = "";
        image.value = "";
        editID = null;

    } catch (err) {

        console.error("CMS ERROR:", err);
        status.textContent = "❌ Opslaan mislukt";
    }
};

// ============================
// LOAD NEWS
// ============================

onValue(ref(db, "news"), (snap) => {

    const items = [];

    snap.forEach(i => {
        items.push({ id: i.key, ...i.val() });
    });

    items.sort((a, b) => (b.created || 0) - (a.created || 0));

    if (items.length === 0) {
        newsList.innerHTML = "<p>Geen nieuws</p>";
        return;
    }

    newsList.innerHTML = items.map(n => `
        <div class="news-item">

            <h3>${n.title || ""}</h3>

            <small>${n.date || ""} ${n.time || ""}</small>

            ${n.image ? `<img src="${n.image}" alt="news image">` : ""}

            <p>${n.text || ""}</p>

            <div class="actions">

                <button onclick="editNews('${n.id}')">Edit</button>
                <button onclick="deleteNews('${n.id}')">Delete</button>

            </div>

        </div>
    `).join("");

});

// ============================
// DELETE
// ============================

window.deleteNews = async (id) => {

    if (!confirm("Weet je zeker dat je dit wilt verwijderen?")) return;

    try {
        await remove(ref(db, "news/" + id));
    } catch (err) {
        console.error("DELETE ERROR:", err);
    }
};

// ============================
// EDIT
// ============================

window.editNews = async (id) => {

    try {

        const snap = await get(ref(db, "news/" + id));
        const data = snap.val();

        if (!data) return;

        editID = id;

        title.value = data.title || "";
        text.value = data.text || "";

        window.scrollTo({ top: 0, behavior: "smooth" });

    } catch (err) {
        console.error("EDIT ERROR:", err);
    }
};
