import { db } from "./firebase.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

console.log("🏺 Club100 loaded");

const clubList = document.getElementById("clubList");

onValue(ref(db, "club100"), (snapshot) => {

    const data = snapshot.val() || {};

    // ✔ zelfde structuur als highlights (BELANGRIJK!)
    const items = Object.entries(data)
        .map(([id, item]) => ({
            id,
            ...item
        }))
        .sort((a, b) => (a.name || "").localeCompare(b.name || ""));

    if (!clubList) return;

    if (items.length === 0) {
        clubList.innerHTML = "<p style='color:white;text-align:center'>Geen leden</p>";
        return;
    }

    clubList.innerHTML = items.map(p => `
        <div class="tile">
            ${p.name}
        </div>
    `).join("");
});
