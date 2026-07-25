import { db } from "./firebase.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

console.log("🏺 CLUB VAN 100 LOADED");

const clubList = document.getElementById("clubList");

/* =========================
   🔥 LIVE DATA
========================= */

onValue(ref(db, "club100"), (snapshot) => {

    const data = snapshot.val();

    if (!data) {
        clubList.innerHTML = `
            <div style="color:white;text-align:center;padding:20px;">
                Nog geen Club van 100 leden
            </div>
        `;
        return;
    }

    const items = Object.entries(data);

    /* =========================
       🧱 RENDER TILES
    ========================= */

    clubList.innerHTML = items.map(([id, p]) => {

        const name = p.name || "";
        const parts = name.split(" ");

        const first = parts[0] || "";
        const last = parts.slice(1).join(" ") || "";

        return `
            <div class="tile">
                <div class="tile-name">
                    <div>${first}</div>
                    <div>${last}</div>
                </div>
            </div>
        `;
    }).join("");
});
