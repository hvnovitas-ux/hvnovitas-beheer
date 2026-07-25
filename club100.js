import { db } from "./firebase.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

console.log("🏺 CLUB100 LOADED");

const clubList = document.getElementById("clubList");

/* 🥇 VIP check */
function isVIP(name) {
    return (name || "").toLowerCase().includes("vip");
}

/* 🔥 render */
onValue(ref(db, "club100"), (snapshot) => {

    const data = snapshot.val();

    if (!data) {
        clubList.innerHTML = "<p style='color:white;text-align:center'>Geen leden</p>";
        return;
    }

    const items = Object.entries(data);

    clubList.innerHTML = items.map(([id, p]) => {

        const name = p.name || "";
        const parts = name.split(" ");

        const first = parts[0] || "";
        const last = parts.slice(1).join(" ") || "";

        return `
            <div class="tile ${isVIP(name) ? "vip" : ""}">
                <div class="tile-name">
                    <div>${first}</div>
                    <div>${last}</div>
                </div>
            </div>
        `;
    }).join("");
});
