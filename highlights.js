import { db } from "./firebase.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const container = document.getElementById("highlightList");

console.log("🏆 highlights.js gestart");

if (!container) {
    console.error("❌ highlightList niet gevonden");
} else {

    onValue(ref(db, "highlights"), (snapshot) => {

        const data = snapshot.val() || {};

        const now = new Date();
        const todayNumber =
            (now.getMonth() + 1) * 100 +
            now.getDate();

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

        let upcomingItems = items
            .filter(h => h.calendarNumber >= todayNumber)
            .sort((a, b) => {
                if (a.calendarNumber !== b.calendarNumber) {
                    return a.calendarNumber - b.calendarNumber;
                }

                return (b.created || 0) - (a.created || 0);
            });

        // Na december opnieuw beginnen bij januari
        if (upcomingItems.length === 0) {
            upcomingItems = items.sort((a, b) => {
                if (a.calendarNumber !== b.calendarNumber) {
                    return a.calendarNumber - b.calendarNumber;
                }

                return (b.created || 0) - (a.created || 0);
            });
        }

        if (upcomingItems.length === 0) {
            container.innerHTML = "<p>Geen highlights.</p>";
            return;
        }

        const h = upcomingItems[0];

        container.innerHTML = `
            <div class="item">
                <strong>${escapeHTML(h.title || "")}</strong>
                <p>${escapeHTML(h.text || "")}</p>
                <small>${escapeHTML(h.date || "")}</small>
                <br><br>
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
