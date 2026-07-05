import { db, storage } from "./firebase.js";

import {
    ref,
    push,
    onValue,
    remove,
    update,
    get
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

import {
    ref as sRef,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";

console.log("🧡 CMS PRO CLEAN LOADED");

// ELEMENTEN
const title = document.getElementById("title");
const text = document.getElementById("text");
const image = document.getElementById("image");
const publish = document.getElementById("publish");
const status = document.getElementById("status");
const newsList = document.getElementById("newsList");

let editID = null;

// SAVE
publish.onclick = async () => {

    if (!title.value || !text.value) {
        status.textContent = "⚠️ Vul titel en tekst in";
        return;
    }

    try {

        status.textContent = "⏳ Opslaan...";

        let imageUrl = "";

        const file = image?.files?.[0]; // SAFE FIX

        if (file) {

            const imgRef = sRef(storage, "news/" + Date.now() + "_" + file.name);

            await uploadBytes(imgRef, file);

            imageUrl = await getDownloadURL(imgRef);
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

        title.value = "";
        text.value = "";
        image.value = "";
        editID = null;

    } catch (err) {

        console.error("CMS ERROR:", err);
        status.textContent = "❌ Fout bij opslaan";
    }
};

// LOAD
onValue(ref(db, "news"), (snap) => {

    const items = [];

    snap.forEach(i => {
        items.push({ id: i.key, ...i.val() });
    });

    items.sort((a, b) => (b.created || 0) - (a.created || 0));

    newsList.innerHTML = items.map(n => `
        <div class="news-item">

            <h3>${n.title || ""}</h3>
            <small>${n.date || ""} ${n.time || ""}</small>

            ${n.image ? `<img src="${n.image}" style="width:100%;border-radius:10px;">` : ""}

            <p>${n.text || ""}</p>

            <button onclick="editNews('${n.id}')">Edit</button>
            <button onclick="deleteNews('${n.id}')">Delete</button>

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

    if (!data) return;

    title.value = data.title || "";
    text.value = data.text || "";

    editID = id;
};
