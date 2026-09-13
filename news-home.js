import { db } from "./firebase.js";
import {
    ref,
    onValue
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const container = document.getElementById("newsList");

console.log("📰 Nieuws hoofdpagina geladen");

if (!container) {
    console.error("❌ newsList niet gevonden");
}

onValue(ref(db, "news"), (snapshot) => {

    const data = snapshot.val() || {};

    const items = Object.entries(data)
        .map(([id, n]) => ({
            id,
            ...n
        }))
        .filter(n => n && n.created)
        .sort((a, b) =>
            (b.created || 0) - (a.created || 0)
        );

    if (!container) return;

    /* =========================
       GEEN NIEUWS
    ========================= */

    if (items.length === 0) {

        container.innerHTML = `
            <div class="news-item">
                <h3>Geen nieuws</h3>
                <p>
                    Er is momenteel geen nieuwsbericht beschikbaar.
                </p>
            </div>

            <div class="more-news">
                <a href="news.html">
                    → Voor meer nieuws, klik hier
                </a>
            </div>
        `;

        return;
    }

    /* =========================
       ALLEEN LAATSTE BERICHT
    ========================= */

    const n = items[0];

    container.innerHTML = `
        <div class="news-item">

            <h3>
                ${escapeHTML(n.title || "")}
            </h3>

            ${
                n.imageUrl
                    ? `
                        <img
                            src="${escapeHTML(n.imageUrl)}"
                            alt="${escapeHTML(n.title || "Nieuws")}"
                            style="width:100%;border-radius:10px;"
                        >
                    `
                    : ""
            }

            <p>
                ${escapeHTML(n.text || "")}
            </p>

            <small>
                📅 ${
                    n.created
                        ? new Date(n.created)
                            .toLocaleDateString("nl-NL")
                        : ""
                }
            </small>

        </div>

        <div class="more-news">
            <a href="news.html">
                → Voor meer nieuws, klik hier
            </a>
        </div>
    `;
});


/* =========================
   VEILIGE HTML
========================= */

function escapeHTML(value = "") {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
