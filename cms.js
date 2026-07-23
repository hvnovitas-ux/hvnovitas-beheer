console.log("🧡 CMS IS AAN");
import { db } from "./firebase.js";
import {
    ref,
    push,
    get,
    onValue,
    remove
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

console.log("🧡 CMS CLEAN FINAL");

// ELEMENTS
const form = document.getElementById("newsForm");
const title = document.getElementById("title");
const text = document.getElementById("text");
const image = document.getElementById("newsImage");
const list = document.getElementById("newsList");

// SAVE NEWS
form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const t = title.value;
    const tx = text.value;
    const file = image?.files?.[0];

    if (!t || !tx) return;

    const save = async (imageUrl = "") => {
        await push(ref(db, "news"), {
            title: t,
            text: tx,
            imageUrl,
            created: Date.now()
        });

        form.reset();
        loadNews();
    };

    if (file) {
        const reader = new FileReader();
        reader.onload = () => save(reader.result);
        reader.readAsDataURL(file);
    } else {
        save("");
    }
});

// LOAD NEWS
async function loadNews() {
    const snap = await get(ref(db, "news"));
    const data = snap.val() || {};

    const items = Object.entries(data)
        .map(([id, n]) => ({ id, ...n }))
        .sort((a, b) => (b.created || 0) - (a.created || 0));

    if (!list) return;

    list.innerHTML = items.map(n => `
        <div class="news-item">

            <b>${n.title || ""}</b><br>

            ${n.imageUrl ? `<img src="${n.imageUrl}" style="width:100%;border-radius:10px;">` : ""}

            <p>${n.text || ""}</p>

            <small>
                📅 ${n.created ? new Date(n.created).toLocaleDateString() : "geen datum"}
                🕒 ${n.created ? new Date(n.created).toLocaleTimeString() : ""}
            </small>

            <br><br>

            <button onclick="deleteNews('${n.id}')">🗑 Delete</button>

        </div>
    `).join("");
}

loadNews();

// DELETE
window.deleteNews = async (id) => {
    await remove(ref(db, "news/" + id));
    loadNews();
};
