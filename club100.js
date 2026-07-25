import { db } from "./firebase.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

console.log("🏺 CLUB100 LOADED OK");

const clubList = document.getElementById("clubList");

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

        return `
            <div class="tile">
                <div class="tile-name">
                    <div>${parts[0] || ""}</div>
                    <div>${parts.slice(1).join(" ")}</div>
                </div>
            </div>
        `;
    }).join("");
});
