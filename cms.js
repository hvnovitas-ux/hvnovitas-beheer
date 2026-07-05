import { db } from "./firebase.js";
import { uploadFile } from "./drive.js";

import {
    ref,
    push,
    onValue,
    remove,
    update
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

// ==========================================
// ELEMENTEN
// ==========================================

const form = document.getElementById("newsForm");
const title = document.getElementById("title");
const text = document.getElementById("text");
const image = document.getElementById("image");

const publish = document.getElementById("publish");
const reset = document.getElementById("reset");
const melding = document.getElementById("melding");
const newsList = document.getElementById("newsList");

let editID = null;

// ==========================================
// RESET
// ==========================================

function clearForm() {
    title.value = "";
    text.value = "";
    image.value = "";
    editID = null;
}

// ==========================================
// PUBLISH
// ==========================================

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!title.value.trim() || !text.value.trim()) {
        alert("Vul titel en bericht in");
        return;
    }

    try {

        let imageUrl = "";

        const file = image.files[0];

        if (file) {
            const upload = await uploadFile(file);
            imageUrl = upload.image;
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
            melding.textContent = "✅ Nieuws bijgewerkt";

        } else {

            await push(ref(db, "news"), data);
            melding.textContent = "✅ Nieuws gepubliceerd";
        }

        clearForm();

    } catch (err) {

        console.error(err);
        melding.textContent = "❌ Fout bij opslaan";
    }

});

// ==========================================
// LOAD NEWS (BEHOUD UI)
// ==========================================

onValue(ref(db, "news"), (snapshot) => {

    let items = [];

    snapshot.forEach((item) => {
        items.push({
            id: item.key,
            ...item.val()
        });
    });

    items.sort((a, b) => b.created - a.created);

    if (items.length === 0) {
        newsList.innerHTML = "Nog geen nieuws geplaatst.";
        return;
    }

    let html = "";

    items.forEach((b) => {

        html += `
<div class="bericht">

    ${b.image ? `<img src="${b.image}" style="width:120px;border-radius:8px;">` : ""}

    <h3>${b.title}</h3>

    <small>📅 ${b.date} 🕒 ${b.time}</small>

    <p>${b.text}</p>

    <button onclick="editNews('${b.id}')">✏️ Bewerken</button>
    <button onclick="deleteNews('${b.id}')">🗑️ Verwijderen</button>

</div>
`;
    });

    newsList.innerHTML = html;

});

// ==========================================
// DELETE
// ==========================================

window.deleteNews = async function (id) {

    if (!confirm("Verwijderen?")) return;

    await remove(ref(db, "news/" + id));
};

// ==========================================
// EDIT
// ==========================================

window.editNews = function (id) {

    onValue(ref(db, "news/" + id), (snap) => {

        const b = snap.val();

        if (!b) return;

        editID = id;

        title.value = b.title;
        text.value = b.text;

        window.scrollTo({ top: 0, behavior: "smooth" });

    }, { onlyOnce: true });
};
🔥 WAT DIT NU
