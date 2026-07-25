import { db } from "./firebase.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const container = document.getElementById("highlightList");

console.log("🏆 Highlights loaded");

// ================= FIREBASE LISTENER =================

onValue(ref(db, "highlights"), (snapshot) => {

    const data = snapshot.val() || {};

    if (!container) return;

    const items = Object.entries(data)
        .map(([id, value]) => value)
        .filter(Boolean)
        .sort((a, b) => (b.created || 0) - (a.created || 0));

    // ================= EMPTY STATE =================

    if (items.length === 0) {
        container.innerHTML = `
            <div style="
                padding:15px;
                text-align:center;
                color:gray;
                font-style:italic;
            ">
                🧡 Geen highlights op dit moment
            </div>
        `;
        return;
    }

    // ================= RENDER =================

    container.innerHTML = items.map(h => `
        <div class="highlight">

            <h3>${h.title || ""}</h3>

            <small>📅 ${h.date || ""} | ⭐ ${h.type || ""}</small>

            <p>${h.text || ""}</p>

        </div>
    `).join("");

});
