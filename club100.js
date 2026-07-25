import { db } from "./firebase.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

console.log("🏺 Club van 100 geladen");

const grid = document.getElementById("clubGrid");

// ================= FIREBASE =================

onValue(ref(db, "club100"), (snapshot) => {

    const data = snapshot.val() || {};

    if (!grid) return;

    const items = Object.entries(data)
        .map(([id, value]) => value)
        .filter(Boolean)
        .sort((a, b) => (a.name || "").localeCompare(b.name || ""));

    // ================= EMPTY =================

    if (items.length === 0) {
        grid.innerHTML = `
            <div style="
                width:100%;
                text-align:center;
                color:gray;
                font-style:italic;
                padding:20px;
            ">
                🧱 Nog geen Club van 100 leden
            </div>
        `;
        return;
    }

    // ================= TEGELS =================

    grid.innerHTML = items.map(p => `
        <div class="tile">
            🏺<br>
            ${p.name || ""}
        </div>
    `).join("");

});
