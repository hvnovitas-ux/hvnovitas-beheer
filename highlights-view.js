// ============================================================
// HV NOVITAS - HIGHLIGHTS OPENBARE WEERGAVE
// ============================================================

import { db } from "./firebase.js";

import {
    ref,
    onValue
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const container =
    document.getElementById("highlightsContainer") ||
    document.getElementById("highlightsList") ||
    document.getElementById("highlights");

function escapeHTML(value = "") {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatDate(value) {
    if (!value) return "";

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const date = new Date(`${value}T00:00:00`);

        return date.toLocaleDateString(
            "nl-NL",
            {
                day: "2-digit",
                month: "long",
                year: "numeric"
            }
        );
    }

    return value;
}

function render(snapshot) {
    if (!container) return;

    const data = snapshot.val() || {};

    const items = Object.values(data)
        .filter(Boolean)
        .sort((a, b) => {
            const dateA = a.date || "";
            const dateB = b.date || "";

            if (dateA !== dateB) {
                return dateB.localeCompare(dateA);
            }

            return (
                (b.created || 0) -
                (a.created || 0)
            );
        });

    if (!items.length) {
        container.innerHTML = "";
        return;
    }

    container.innerHTML = items
        .map(
            (item) => `
                <article class="highlight-item">
                    <div class="highlight-date">
                        ${escapeHTML(formatDate(item.date || ""))}
                    </div>

                    <h3>
                        ${escapeHTML(item.title || "")}
                    </h3>

                    <p>
                        ${escapeHTML(item.text || "")}
                    </p>
                </article>
            `
        )
        .join("");
}

if (container) {
    onValue(
        ref(db, "highlights"),
        render
    );
}

console.log("🧡 Highlights openbare module gereed.");
