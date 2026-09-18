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

        // ================= LOKALE DATUM =================

        const now = new Date();

        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");

        const today = year + "-" + month + "-" + day;

        console.log("📅 Vandaag:", today);

        // ================= ALLE HIGHLIGHTS =================

        const items = Object.values(data)
            .filter(h => h && h.date);

        console.log("📦 Alle highlights:", items);

        // ================= VANDAAG OF TOEKOMST =================

        const upcomingItems = items.filter(h => h.date >= today);

        console.log("➡️ Komende highlights:", upcomingItems);

        // ================= GEEN KOMENDE HIGHLIGHTS =================

        if (upcomingItems.length === 0) {

            container.innerHTML =
                '<div class="empty-title">' +
                    '🧡 Er zijn geen komende highlights' +
                '</div>';

            return;
        }

        // ================= SORTEREN OP DATUM =================

        upcomingItems.sort((a, b) => {

            if (a.date !== b.date) {
                return a.date.localeCompare(b.date);
            }

            return (b.created || 0) - (a.created || 0);
        });

        // ================= EERSTVOLGENDE HIGHLIGHT =================

        const h = upcomingItems[0];

        console.log("⭐ Getoonde highlight:", h);

        // ================= TYPE =================

        const typeText = h.type
            ? " | ⭐ " + escapeHTML(h.type)
            : "";

        // ================= RENDER =================

        container.innerHTML =
            '<article class="item">' +

                '<div class="date">' +
                    '📅 ' + escapeHTML(h.date || "") +
                    typeText +
                '</div>' +

                '<h2>' +
                    escapeHTML(h.title || "") +
                '</h2>' +

                '<p>' +
                    escapeHTML(h.text || "") +
                '</p>' +

            '</article>';

    }, (error) => {

        console.error("❌ Firebase fout:", error);

        container.innerHTML =
            '<div class="empty-title">' +
                '⚠️ Highlights konden niet worden geladen.' +
            '</div>';

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
