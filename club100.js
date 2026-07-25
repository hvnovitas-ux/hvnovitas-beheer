import { db } from "./firebase.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const clubList = document.getElementById("clubList");

onValue(ref(db, "club100"), (snapshot) => {

    const data = snapshot.val() || {};

    const items = Object.values(data)
        .map(v => v)
        .sort((a, b) => (a.name || "").localeCompare(b.name || ""));

    if (!clubList) return;

    if (items.length === 0) {
        clubList.innerHTML = "<p>Geen leden</p>";
        return;
    }

    clubList.innerHTML = items.map(p => `
        <div class="tile">
            ${p.name}
        </div>
    `).join("");
});
