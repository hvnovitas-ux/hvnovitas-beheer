import { db } from "./firebase.js";

import {
    ref,
    onValue
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const container = document.getElementById("club100List");

function escapeHTML(value = "") {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function render(snapshot) {
    if (!container) return;

    const data = snapshot.val() || {};

    const members = Object.values(data)
        .filter(member => member && member.name)
        .sort((a, b) =>
            String(a.name).localeCompare(String(b.name), "nl", {
                sensitivity: "base"
            })
        );

    if (!members.length) {
        container.innerHTML = `
            <div class="empty">
                <div class="empty-title">Nog geen Club100-leden</div>
                <div class="empty-text">
                    Binnenkort vind je hier onze Club100-leden.
                </div>
            </div>
        `;
        return;
    }

    container.innerHTML = members.map(member => `
        <div class="member">
            ${escapeHTML(member.name)}
        </div>
    `).join("");
}

if (container) {
    onValue(ref(db, "club100"), render);
}

console.log("🧱 Club100 openbare module gereed.");
