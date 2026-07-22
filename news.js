import { db } from "./firebase.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

console.log("🧡 NEWS LOADED");

const container = document.getElementById("newsList");

// ================= SAFE DATE FUNCTIONS =================

function getDate(n) {
    if (n.created) return new Date(n.created).toLocaleDateString();
    if (n.date) return n.date;
    return "";
}

function getTime(n) {
    if (n.created) return new Date(n.created).toLocaleTimeString();
    if (n.time) return n.time;
    return "";
}

// ================= LOAD NEWS =================

onValue(ref(db, "news"), (snapshot) => {

    const data = snapshot.val() || {};

    const items = Object.entries(data)
        .map(([id, n]) => ({ id, ...n }))
        .sort((a, b) => (b.created || 0) - (a.created || 0))
        .slice(0, 10);

    if (!container) return;

    container.innerHTML = items.map(n => `
        <div class="news-item">

            <h3>${n.title || ""}</h3>

            ${n.imageUrl ? `
                <img src="${n.imageUrl}" style="width:100%;border-radius:10px;margin-top:8px;">
            ` : ""}

            <p>${n.text || ""}</p>

            <small>
                📅 ${getDate(n)} 
                🕒 ${getTime(n)}
            </small>

        </div>
    `).join("");
});
