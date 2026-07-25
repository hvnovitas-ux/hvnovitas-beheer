import { db } from "./firebase.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

console.log("🏺 Club100 JS geladen");

// ================= GRID =================

const grid = document.getElementById("clubGrid");

if (!grid) {
    console.error("❌ clubGrid niet gevonden in HTML");
}

// ================= FIREBASE LIVE DATA =================

onValue(ref(db, "club100"), (snapshot) => {

    const data = snapshot.val() || {};

    const items = Object.entries(data)
        .map(([id, value]) => ({
            id,
            ...value
        }))
        .sort((a, b) => (b.created || 0) - (a.created || 0));

    if (!grid) return;

    if (items.length === 0) {
        grid.innerHTML = "<p style='text-align:center;'>Nog geen Club van 100 leden</p>";
        return;
    }

    grid.innerHTML = items.map(p => `
        <div class="tile">
            🏺<br>
            ${p.name}
        </div>
    `).join("");

});
