import { db } from "./firebase.js";

import {
    ref,
    onValue
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const container = document.getElementById("club100List");

console.log("🧱 Club100 openbare module geladen");

function escapeHTML(value = "") {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function render(snapshot) {

    if (!container) {
        console.error("❌ club100List niet gevonden");
        return;
    }

    const data = snapshot.val() || {};

    const members = Object.values(data)
        .filter(member => member && member.name)
        .sort((a, b) =>
            String(a.name).localeCompare(
                String(b.name),
                "nl",
                {
                    sensitivity: "base"
                }
            )
        );

    // =========================
    // GEEN CLUB100 LEDEN
    // =========================

    if (members.length === 0) {

        container.innerHTML = `
            <div class="empty">
                <div class="empty-title">
                    Club100
                </div>

                <div class="empty-text">
                    Er zijn momenteel geen Club100-leden.
                </div>
            </div>
        `;

        return;
    }

    // =========================
    // LEDEN WEERGEVEN
    // =========================

    container.innerHTML = members
        .map(member => `
            <div class="member">
                <span>${escapeHTML(member.name)}</span>
            </div>
        `)
        .join("");
}

onValue(
    ref(db, "club100"),
    render,
    error => {
        console.error("❌ Club100 laden mislukt:", error);

        if (container) {
            container.innerHTML = `
                <div class="empty">
                    <div class="empty-title">
                        Club100 kon niet worden geladen
                    </div>
                </div>
            `;
        }
    }
);

console.log("🧡 Club100 openbare module gereed.");
