import { db } from "./firebase.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

console.log("🏺 CLUB100 CLEAN LOADED");

onValue(ref(db, "club100"), (snapshot) => {

    const clubList = document.getElementById("clubList");
    if (!clubList) return;

    const data = snapshot.val() || {};

    // 🛡️ FILTER RARE / TEST DATA
    const items = Object.entries(data).filter(([id, v]) => {

        const name = (v.name || "").trim();

        // ❌ blokkeer rommel / test tekst
        if (!name) return false;
        if (name.toLowerCase() === "wat je nu krijgt") return false;

        return true;
    });

    // 🧱 lege staat
    if (items.length === 0) {
        clubList.innerHTML = "<div class='tile'>Geen leden</div>";
        return;
    }

    // 🟦 render tegels
    clubList.innerHTML = items.map(([id, v]) => {

        const fullName = (v.name || "").trim();
        const parts = fullName.split(" ");

        const firstName = parts[0] || "";
        const lastName = parts.slice(1).join(" ");

        return `
            <div class="tile">
                <div class="tile-inner">
                    <div class="first">${firstName}</div>
                    <div class="last">${lastName}</div>
                </div>
            </div>
        `;
    }).join("");

});
