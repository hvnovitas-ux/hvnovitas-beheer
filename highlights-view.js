import { db } from "./firebase.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const container = document.getElementById("highlightsContainer");

console.log("🏆 highlights-view.js gestart");

if (!container) {
    console.error("❌ highlightsContainer niet gevonden");
} else {

    onValue(ref(db, "highlights"), (snapshot) => {

        const data = snapshot.val() || {};

        // ================= VANDAAG =================

        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentDay = now.getDate();

        // Dagnummer binnen het huidige jaar
        const todayNumber = currentMonth * 100 + currentDay;

        // ================= ALLE HIGHLIGHTS =================

        const items = Object.values(data)
            .filter(h => h && h.date)
            .map(h => {

                const parts = String(h.date).split("-");

                const month = Number(parts[1]);
                const day = Number(parts[2]);

                return {
                    ...h,
                    month,
                    day,
                    calendarNumber: month * 100 + day
                };
            })
            .filter(h =>
                Number.isInteger(h.month) &&
                Number.isInteger(h.day) &&
                h.month >= 1 &&
                h.month <= 12 &&
                h.day >= 1 &&
                h.day <= 31
            );

        // ================= EERSTVOLGENDE DATUM DIT JAAR =================

        let upcomingItems = items
            .filter(h => h.calendarNumber >= todayNumber)
            .sort((a, b) => {
                if (a.calendarNumber !== b.calendarNumber) {
                    return a.calendarNumber - b.calendarNumber;
                }

                return (b.created || 0) - (a.created || 0);
            });

        // ================= ALS DIT JAAR NIETS MEER KOMT =================
        // Dan beginnen we opnieuw bij de eerste highlight van het jaar.

        if (upcomingItems.length === 0) {
            upcomingItems = items
                .sort((a, b) => {
                    if (a.calendarNumber !== b.calendarNumber) {
                        return a.calendarNumber - b.calendarNumber;
                    }

                    return (b.created || 0) - (a.created || 0);
                });
        }

        // ================= GEEN HIGHLIGHTS =================

        if (upcomingItems.length === 0) {
            container.innerHTML =
                '<div class="empty-title">' +
                    '🧡 Er zijn geen highlights' +
                '</div>';

            return;
        }

        // ================= EERSTVOLGENDE =================

        const h = upcomingItems[0];

        const typeText = h.type
            ? " | ⭐ " + escapeHTML(h.type)
            : "";

        // ================= WEERGAVE =================

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
