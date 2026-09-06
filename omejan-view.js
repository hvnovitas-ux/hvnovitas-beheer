import { db } from "./firebase.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const esc = (v) => String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const grid = document.getElementById("omejanGrid");

onValue(ref(db, "omejan"), (snap) => {
    const data = Object.values(snap.val() || {})
        .filter(v => v?.imageUrl)
        .sort((a, b) => (b.created || 0) - (a.created || 0));

    grid.innerHTML = data.length
        ? data.map(v => `
            <div class="card">
                <img src="${esc(v.imageUrl)}" alt="Ome Jan">
            </div>
        `).join("")
        : '<div class="empty">Geen afbeeldingen beschikbaar.</div>';
});
