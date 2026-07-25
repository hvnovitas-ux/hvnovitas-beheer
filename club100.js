import { db } from "./firebase.js";
import {
    ref,
    onValue,
    remove
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

console.log("🏺 Club100 loaded");

const clubList = document.getElementById("clubList");

// ================= LOAD =================

onValue(ref(db, "club100"), (snapshot) => {

    const data = snapshot.val() || {};

    const items = Object.entries(data)
        .map(([id, item]) => ({ id, ...item }))
        .sort((a, b) => (a.name || "").localeCompare(b.name || ""));

    if (!clubList) return;

    if (items.length === 0) {
        clubList.innerHTML = "<p>Geen leden</p>";
        return;
    }

    clubList.innerHTML = items.map(p => `
        <div class="tile">
            ${p.name}

            <br><br>

            <button onclick="deleteClub('${p.id}')">
                🗑 Delete
            </button>
        </div>
    `).join("");
});

// ================= DELETE =================

window.deleteClub = async (id) => {

    console.log("delete club:", id);

    await remove(ref(db, "club100/" + id));
};
