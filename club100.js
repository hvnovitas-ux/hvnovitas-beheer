import { db } from "./firebase.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

console.log("🏺 CLUB100 LOADED OK");

// ===============================
// 📦 GET CONTAINER
// ===============================

const clubList = document.getElementById("clubList");

// ===============================
// 🔥 LIVE FIREBASE DATA
// ===============================

onValue(ref(db, "club100"), (snapshot) => {

    const data = snapshot.val();

    if (!data) {
        clubList.innerHTML = `
            <div style="color:white;text-align:center;padding:20px;">
                Nog geen leden
            </div>
        `;
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
🎨 BELANG
