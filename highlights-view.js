import { db } from "./firebase.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const esc = (v) => String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const prettyDate = (d) => {
    if (!d) return "";
    const x = new Date(d + "T00:00:00");
    return isNaN(x)
        ? d
        : x.toLocaleDateString("nl-NL", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
};

const list = document.getElementById("highlightList");

onValue(ref(db, "highlights"), (snap) => {
    const data = Object.values(snap.val() || {});

    data.sort((a, b) =>
        (new Date(b.date || 0).getTime() || b.created || 0) -
        (new Date(a.date || 0).getTime() || a.created || 0)
    );

    list.innerHTML = data.length
        ? data.map(v => `
            <article class="item">
                ${v.date ? `<div class="date">${esc(prettyDate(v.date))}</div>` : ""}
                <h2>${esc(v.title || "")}</h2>
                <p>${esc(v.text || "")}</p>
            </article>
        `).join("")
        : '<div class="empty">Geen highlights beschikbaar.</div>';
});
