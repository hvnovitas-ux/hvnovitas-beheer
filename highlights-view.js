```javascript
import { db } from "./firebase.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const container = document.getElementById("highlightsContainer");

console.log("🏆 Highlights view loaded");

// ================= FIREBASE =================

onValue(ref(db, "highlights"), (snapshot) => {

    const data = snapshot.val() || {};

    if (!container) return;

    const today = new Date().toISOString().split("T")[0];

    const items = Object.entries(data)
        .map(([id, value]) => value)
        .filter(h => h && h.date);

    // ================= FILTER: VANDAAG OF TOEKOMST =================

    const upcomingItems = items.filter(h => h.date >= today);

    // ================= EMPTY STATE =================

    if (upcomingItems.length === 0) {
        container.innerHTML = `
            <div class="empty-title">
                🧡 Er zijn geen komende highlights
            </div>
        `;
        return;
    }

    // ================= SORT OP DATUM =================

    upcomingItems.sort((a, b) => {

        // Eerstvolgende datum eerst
        if (a.date !== b.date) {
            return a.date.localeCompare(b.date);
        }

        // Bij dezelfde datum: nieuwste eerst
        return (b.created || 0) - (a.created || 0);
    });

    // ================= EERSTVOLGENDE HIGHLIGHT =================

    const nextHighlight = upcomingItems[0];

    // ================= RENDER =================

    container.innerHTML = `
        <article class="item">

            <div class="date">
                📅 ${escapeHTML(nextHighlight.date || "")}
                ${nextHighlight.type ? ` | ⭐ ${escapeHTML(nextHighlight.type)}` : ""}
            </div>

            <h2>
                ${escapeHTML(nextHighlight.title || "")}
            </h2>

            <p>
                ${escapeHTML(nextHighlight.text || "")}
            </p>

        </article>
    `;

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
```
