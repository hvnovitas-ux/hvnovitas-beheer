import { db } from "./firebase.js";

import {
    ref,
    query,
    orderByChild,
    limitToLast,
    onValue
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

// =====================================================
// HV NOVITAS HOMEPAGE NIEUWS
// =====================================================

const news = document.getElementById("news");

if (!news) {
    console.error("Element #news niet gevonden.");
    throw new Error("Nieuwscontainer ontbreekt.");
}

// =====================================================
// FIREBASE
// =====================================================

const newsQuery = query(
    ref(db, "news"),
    orderByChild("created"),
    limitToLast(3)
);

// =====================================================
// HELPERS
// =====================================================

function escapeHTML(text = "") {

    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}

function formatText(text = "") {

    return escapeHTML(text).replace(/\n/g, "<br>");

}

function shortText(text = "", max = 180) {

    if (text.length <= max) return text;

    return text.substring(0, max).trim() + "...";

}

function createImage(newsItem) {

    if (!newsItem.image) return "";

    return `
        <img
            src="${newsItem.image}"
            class="nieuwsfoto"
            alt="${escapeHTML(newsItem.title)}"
            loading="lazy">
    `;

}

// =====================================================
// HTML
// =====================================================

function createCard(newsItem) {

    const shortVersion = formatText(shortText(newsItem.text || ""));
    const fullVersion = formatText(newsItem.text || "");

    return `

<div class="kaart">

    ${createImage(newsItem)}

    <h3>${escapeHTML(newsItem.title)}</h3>

    <div class="datum">

        📅 ${newsItem.date}
        &nbsp;&nbsp;
        🕒 ${newsItem.time}

    </div>

    <div
        id="short-${newsItem.id}"
        class="tekst">

        ${shortVersion}

    </div>

    <div
        id="full-${newsItem.id}"
        class="tekst"
        style="display:none;">

        ${fullVersion}

    </div>

    <button
        class="leesButton"
        data-id="${newsItem.id}">

        ➜ Lees verder

    </button>

</div>

`;

}

// =====================================================
// DEEL 2 START HIER
// =====================================================
// =====================================================
// NIEUWS LADEN
// =====================================================

onValue(newsQuery, (snapshot) => {

    const berichten = [];

    snapshot.forEach((item) => {

        berichten.push({
            id: item.key,
            ...item.val()
        });

    });

    // Nieuwste eerst
    berichten.sort((a, b) => b.created - a.created);

    // Geen nieuws
    if (berichten.length === 0) {

        news.innerHTML = `

<div class="kaart">

    <h3>📰 Nog geen nieuws</h3>

    <p>Er zijn nog geen nieuwsberichten gepubliceerd.</p>

</div>

`;

        return;

    }

    // HTML opbouwen

    let html = "";

    berichten.forEach((bericht) => {

        html += createCard(bericht);

    });

    news.innerHTML = html;

    // ==========================================
    // LEES VERDER
    // ==========================================

    const buttons = document.querySelectorAll(".leesButton");

    buttons.forEach((button) => {

        button.addEventListener("click", () => {

            const id = button.dataset.id;

            // Eerst alle berichten sluiten

            berichten.forEach((b) => {

                const shortDiv = document.getElementById("short-" + b.id);
                const fullDiv = document.getElementById("full-" + b.id);
                const btn = document.querySelector(
                    `.leesButton[data-id="${b.id}"]`
                );

                if (!shortDiv || !fullDiv || !btn) return;

                shortDiv.style.display = "block";
                fullDiv.style.display = "none";

                btn.textContent = "➜ Lees verder";

            });

            const shortDiv = document.getElementById("short-" + id);
            const fullDiv = document.getElementById("full-" + id);

            // Was dit bericht al open?

            if (button.dataset.open === "true") {

                button.dataset.open = "false";

                return;

            }

            // Alles resetten

            buttons.forEach((b) => b.dataset.open = "false");

            // Gekozen bericht openen

            shortDiv.style.display = "none";
            fullDiv.style.display = "block";

            button.textContent = "▲ Lees minder";

            button.dataset.open = "true";

        });

    });

}, (error) => {

    console.error(error);

    news.innerHTML = `

<div class="kaart">

    <h3>❌ Fout</h3>

    <p>

        Het nieuws kon niet worden geladen.

    </p>

</div>

`;

});

// =====================================================
// EINDE home-news.js
// =====================================================
