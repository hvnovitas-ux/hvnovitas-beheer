import { db } from "./firebase.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

console.log("🏺 CLUB100 DISPLAY LOADED");

onValue(ref(db, "club100"), (snapshot) => {

    const clubList = document.getElementById("clubList");
    if (!clubList) return;

    const data = snapshot.val() || {};
    const items = Object.entries(data);

    if (items.length === 0) {
        clubList.innerHTML = "<div class='tile'>Geen leden</div>";
        return;
    }

    clubList.innerHTML = items.map(([id, v]) => {

        // 🧠 naam split
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
