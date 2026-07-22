import { db } from "./firebase.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

console.log("🧡 HV NOVITAS NEWS LOADED");

// ================= ELEMENT =================

const newsList = document.getElementById("newsList");

// ================= SAFE FORMAT FUNCTIONS =================

function formatDate(n) {

    // modern CMS data
    if (n.created) {
        return new Date(n.created).toLocaleDateString();
    }

    // old CMS data (string)
    if (n.date) {
        return n.date;
    }

    return "";
}

function formatTime(n) {

    if (n.created) {
        return new Date(n.created).toLocaleTimeString();
    }

    if (n.time) {
        return n.time;
    }

    return "";
}

// ================= LOAD NEWS =================

onValue(ref(db, "news"), (snapshot) => {

    const data = snapshot.val() || {};

    const items = Object.entries(data)
        .map(([id, value]) => ({ id, ...value }))
        .sort((a, b) => (b.created || 0) - (a.created || 0));

    if (!newsList) return;

    if (items.length === 0) {
        newsList.innerHTML = "<p>Geen nieuws</p>";
        return;
    }

    newsList.innerHTML = items.map(n => `
        <div class="news-item">

            <h3>${n.title || ""}</h3>

            ${n.imageUrl ? `
                <img src="${n.imageUrl}" style="width:100%;border-radius:10px;margin-top:8px;">
            ` : ""}

            <p>${n.text || ""}</p>

            <small>
                📅 ${formatDate(n)} 
                ${formatTime(n) ? "🕒 " + formatTime(n) : ""}
            </small>

        </div>
    `).join("");
});
