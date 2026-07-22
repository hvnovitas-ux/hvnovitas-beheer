import { db } from "./firebase.js";
import {
    ref,
    push,
    get,
    remove
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

console.log("🧡 CMS RESTORED LOADED");

// ================= ELEMENTS =================

const form = document.getElementById("newsForm");
const title = document.getElementById("title");
const text = document.getElementById("text");
const image = document.getElementById("newsImage");
const list = document.getElementById("newsList");

// ================= SAVE NEWS =================

form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const t = title?.value;
    const tx = text?.value;
    const file = image?.files?.[0];

    if (!t || !tx) return;

    let imageUrl = "";

    const save = async () => {

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
        reader.onload = () => {
            imageUrl = reader.result;
            save();
        };
        reader.readAsDataURL(file);
    } else {
        save();
    }
});

// ================= LOAD NEWS =================

async function loadNews() {

    const snap = await get(ref(db, "news"));
    const data = snap.val() || {};

    const items = Object.entries(data)
        .map(([id, n]) => ({ id, ...n }))
        .sort((a, b) => (b.created || 0) - (a.created || 0));

    if (!list) return;

    list.innerHTML = items.map(n => `
        <div class="news-item">

            <b>${n.title || ""}</b>

            ${n.imageUrl ? `
                <img src="${n.imageUrl}" style="width:100%;border-radius:10px;">
            ` : ""}

            <p>${n.text || ""}</p>

            <small>📅 ${new Date(n.created).toLocaleDateString()}</small>

            <button onclick="deleteNews('${n.id}')">🗑 Delete</button>

        </div>
    `).join("");
}

loadNews();

// ================= DELETE =================

window.deleteNews = async (id) => {
    await remove(ref(db, "news/" + id));
    loadNews();
};
