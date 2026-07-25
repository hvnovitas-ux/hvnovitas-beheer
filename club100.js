import { db } from "./firebase.js";
import {
    ref,
    onValue
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

console.log("🏺 Club van 100 geladen");

const clubList = document.getElementById("clubList");

onValue(ref(db, "club100"), (snapshot) => {

    const data = snapshot.val() || {};

    const items = Object.entries(data)
        .map(([id, item]) => ({
            id,
            ...item
        }))
        .sort((a, b) => (a.name || "").localeCompare(b.name || ""));

    if (!clubList) return;

    if (items.length === 0) {
        clubList.innerHTML = `
            <div style="color:white;text-align:center;">
                Nog geen Club van 100 leden
            </div>
        `;
        return;
    }

    clubList.innerHTML = items.map(p => {

        const parts = (p.name || "").split(" ");
        const firstName = parts[0] || "";
        const lastName = parts.slice(1).join(" ") || "";

        return `
            <div class="tile">

                <span style="
                    position:absolute;
                    top:10px;
                    left:12px;
                    font-size:14px;
                    color:rgba(30,79,138,0.25);
                ">❖</span>

                <div class="tile-name">
                    <div>${firstName}</div>
                    <div>${lastName}</div>
                </div>

            </div>
        `;
    }).join("");
});
