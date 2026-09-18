```javascript
import { db } from "./firebase.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const container = document.getElementById("highlightList");

console.log("🏆 Highlights loaded");

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
            <div style="
                padding:15px;
                text-align:center;
                color:gray;
                font-style:italic;
            ">
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

        // Bij dezelfde datum: nieuwste aangemaakte eerst
        return (b.created || 0) - (a.created || 0);
    });

    // ================= EERSTVOLGENDE HIGHLIGHT =================

    const nextHighlight = upcomingItems[0];

    // ================= RENDER =================

    container.innerHTML = `
        <div class="highlight">

            <h3>${nextHighlight.title || ""}</h3>

            <small>📅 ${nextHighlight.date || ""} | ⭐ ${nextHighlight.type || ""}</small>

            <p>${nextHighlight.text || ""}</p>

        </div>
    `;

});
```
