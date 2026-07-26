import { db } from "./firebase.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

console.log("🏺 CLUB100 FINAL LOADED");

onValue(ref(db, "club100"), (snapshot) => {

    const clubList = document.getElementById("clubList");

    if (!clubList) {
        console.log("❌ clubList niet gevonden");
        return;
    }

    const data = snapshot.val() || {};
    const items = Object.entries(data);

    if (items.length === 0) {
        clubList.innerHTML = `<div class="tile empty">Geen leden</div>`;
        return;
    }

    clubList.innerHTML = items.map(([id, p]) => `
        <div class="tile">
            <div class="tile-text">${p.name || ""}</div>
        </div>
    `).join("");
});
