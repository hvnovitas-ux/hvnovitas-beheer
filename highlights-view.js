import { db } from "./firebase.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const container = document.getElementById("highlightsContainer");

console.log("🏆 highlights-view.js gestart");

if (!container) {
    console.error("❌ highlightsContainer niet gevonden");
} else {

    onValue(ref(db, "highlights"), (snapshot) => {

        console.log("🔥 Firebase highlights ontvangen");

        const data = snapshot.val() || {};

        const today = new Date().toISOString().split("T")[0];

        console.log("📅 Vandaag:", today);
        console.log("📦 Highlights:", data);

        const items = Object.values(data)
            .filter(h => h && h.date);

        // Alleen vandaag en toekomstige highlights
        const upcomingItems = items.filter(h => h.date >= today);

        console.log("➡️ Komende highlights:", upcomingItems);

        // Geen toekomstige highlights
        if (upcomingItems.length === 0) {
            container.innerHTML = `
                <div class="empty-title">
                    🧡 Er zijn geen komende highlights
                </div>
            `;
            return;
        }

        // Eerstvolgende datum bovenaan
        upcomingItems.sort((a, b) => {
            if (a.date !== b.date) {
                return a.date.localeCompare(b.date);
            }

            return (b.created || 0) - (a.created || 0);
        });

        // Alleen de eerstvolgende highlight
        const h = upcomingItems[0];

        container.innerHTML = `
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
        `;

    }, (error) => {

        console.error("❌ Firebase fout:", error);

        container.innerHTML = `
            <div class="empty-title">
                ⚠️ Highlights konden niet worden geladen.
            </div>
        `;

    });
}


// ================= VEILIGE HTML =================

function escapeHTML(value = "") {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
