import { db } from "./firebase.js";
import { uploadFile } from "./drive.js";

import {
    ref,
    push,
    onValue,
    remove,
    update
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

console.log("🔥 CMS CLEAN REBUILD OK");

// ==========================================
// ELEMENTEN
// ==========================================

const form = document.getElementById("newsForm");
const title = document.getElementById("title");
const text = document.getElementById("text");
const image = document.getElementById("image");
const newsList = document.getElementById("newsList");
const status = document.getElementById("melding");

let editID = null;

// ==========================================
// RESET
// ==========================================

function resetForm() {
    title.value = "";
    text.value = "";
    image.value = "";
    editID = null;
    status.textContent = "";
}

// ==========================================
// SUBMIT
// ==========================================

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!title.value.trim() || !text.value.trim()) {
        alert("Titel en bericht zijn verplicht");
        return;
    }

    try {

        status.textContent = "⏳ Bezig met opslaan...";

        let imageUrl = "";

        const file = image.files && image.files[0];

        if (file) {
            const upload = await uploadFile(file);
            imageUrl = upload.image || "";
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

        resetForm();

    } catch (err) {

        console.error("CMS ERROR:", err);
        status.textContent = "❌ Fout bij opslaan";
    }
});

// ==========================================
// LOAD NEWS
// ==========================================

onValue(ref(db, "news"), (snapshot) => {

    const items = [];

    snapshot.forEach((item) => {
        items.push({
            id: item.key,
            ...item.val()
        });
    });

    items.sort((a, b) => (b.created || 0) - (a.created || 0));

    if (items.length === 0) {
        newsList.innerHTML = "<p>Geen nieuws geplaatst</p>";
        return;
    }

    newsList.innerHTML = items.map(b => {

        const img = b.image
            ? `<img src="${b.image}" style="width:100%;border-radius:10px;margin-top:10px;">`
            : "";

        return `
        <div class="news-item">

            <h3>${b.title || ""}</h3>

            <small>${b.date || ""} • ${b.time || ""}</small>

            ${img}

            <p>${b.text || ""}</p>

            <div style="display:flex;gap:10px;margin-top:10px;">

                <button onclick="editNews('${b.id}')">✏️ Edit</button>
                <button onclick="deleteNews('${b.id}')">🗑️ Delete</button>

            </div>

        </div>
        `;

    }).join("");

});

// ==========================================
// DELETE
// ==========================================

window.deleteNews = async function (id) {

    if (!confirm("Weet je zeker dat je dit wilt verwijderen?")) return;

    await remove(ref(db, "news/" + id));
};

// ==========================================
// EDIT
// ==========================================

window.editNews = function (id) {

    onValue(ref(db, "news/" + id), (snap) => {

        const data = snap.val();
        if (!data) return;

        editID = id;

        title.value = data.title || "";
        text.value = data.text || "";

        window.scrollTo({ top: 0, behavior: "smooth" });

    }, { onlyOnce: true });
};
