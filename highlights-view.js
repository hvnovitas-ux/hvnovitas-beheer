import { db } from "./firebase.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const container = document.getElementById("highlightsContainer");

console.log("🏆 Highlights loaded");

// ================= FIREBASE =================

onValue(ref(db, "highlights"), (snapshot) => {

    const data = snapshot.val() || {};

    if (!container) return;

    const today = new Date().toISOString().split("T")[0];

    const items = Object.entries(data)
        .map(([id, value]) => value)
        .filter(h => h && h.date);

    // ================= FILTER: ALLEEN VANDAAG =================

    const todayItems = items.filter(h => h.date === today);

    // ================= EMPTY STATE =================

    if (todayItems.length === 0) {
        container.innerHTML = `
            <div class="empty-title">
                🧡 Vandaag zijn er geen highlights uit het verleden
            </div>
        `;
        return;
    }

    // ================= SORT =================

    todayItems.sort((a, b) => (b.created || 0) - (a.created || 0));

    // ================= RENDER =================

    container.innerHTML = todayItems.map(h => `
        <article class="item">

            <div class="date">
                📅 ${escapeHTML(h.date || "")}
                ${h.type ? ` | ⭐ ${escapeHTML(h.type)}` : ""}
            </div>

            <h2>
                ${escapeHTML(h.title || "")}
            </h2>

            <p>
                ${escapeHTML(h.text || "")}
            </p>

        </article>
    `).join("");

});

// ================= VEILIGE HTML =================

function escapeHTML(value = "") {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
