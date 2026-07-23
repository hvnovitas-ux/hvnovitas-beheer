import { db } from "./firebase.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const container = document.getElementById("newsList");

function formatDate(n) {
    if (n.created) return new Date(n.created).toLocaleDateString();
    return n.date || "geen datum";
}

function formatTime(n) {
    if (n.created) return new Date(n.created).toLocaleTimeString();
    return n.time || "";
}

onValue(ref(db, "news"), (snapshot) => {

    const data = snapshot.val() || {};

    const items = Object.entries(data)
        .map(([id, n]) => ({ id, ...n }))
        .sort((a, b) => (b.created || 0) - (a.created || 0));

    if (!container) return;

    container.innerHTML = items.map(n => `

        <div class="news-item">

            <h3>${n.title || ""}</h3>

            ${n.imageUrl ? `
                <img src="${n.imageUrl}" style="width:100%;border-radius:10px;margin-top:8px;">
            ` : ""}

            <p>${n.text || ""}</p>

            <small>
                📅 ${formatDate(n)} 
                🕒 ${formatTime(n)}
            </small>

        </div>

    `).join("");
});
