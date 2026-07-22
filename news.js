import { db } from "./firebase.js";
import {
    ref,
    push,
    get,
    onValue,
    remove,
    update
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

console.log("🧡 CMS LOADED");

// ================= ELEMENTS =================

const newsTitle = document.getElementById("title");
const newsText = document.getElementById("text");
const newsImage = document.getElementById("newsImage");
const newsList = document.getElementById("newsList");
const newsForm = document.getElementById("newsForm");

// ================= NEWS OPSLAAN =================

newsForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = newsTitle.value;
    const text = newsText.value;
    const file = newsImage?.files?.[0];

    if (!title || !text) return;

    let imageUrl = "";

    const save = async () => {
        await push(ref(db, "news"), {
            title,
            text,
            imageUrl,
            created: Date.now(),
            date: new Date().toISOString().split("T")[0]
        });

        newsForm.reset();
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
        .map(([id, value]) => ({ id, ...value }))
        .sort((a, b) => (b.created || 0) - (a.created || 0));

    newsList.innerHTML = items.map(n => `
        <div class="news-item">

            <b>${n.title || ""}</b><br>

            ${n.imageUrl ? `<img src="${n.imageUrl}" style="width:100%;border-radius:10px;">` : ""}

            <p>${n.text || ""}</p>

            <small>📅 ${n.date || ""}</small>

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
