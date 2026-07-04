import { db } from "./firebase.js";

import {
    ref,
    query,
    orderByChild,
    limitToLast,
    onValue
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

/* ==========================================
   HV NOVITAS
   HOME NEWS
========================================== */

const newsContainer = document.getElementById("news");

if (!newsContainer) {

    console.error("Nieuwscontainer (#news) niet gevonden.");

    throw new Error("Container ontbreekt.");

}

/* ==========================================
   FIREBASE QUERY
========================================== */

const newsQuery = query(

    ref(db, "news"),

    orderByChild("timestamp"),

    limitToLast(3)

);

/* ==========================================
   HELPERS
========================================== */

function escapeHTML(text = "") {

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}

function formatText(text = "") {

    return escapeHTML(text).replace(/\n/g, "<br>");

}

function createSummary(text = "", max = 180) {

    const value = text.trim();

    return value.length <= max
        ? value
        : value.substring(0, max).trim() + "...";

}
/* ==========================================
   AFBEELDING
========================================== */

function createImage(item) {

    if (!item.image) {

        return "";

    }

    return `

<img
    class="nieuwsfoto"
    src="${item.image}"
    alt="${escapeHTML(item.title)}"
    loading="lazy">

`;

}

/* ==========================================
   NIEUWSKAART
========================================== */

function createCard(item) {

    return `

<article class="kaart">

    ${createImage(item)}

    <h3>${escapeHTML(item.title)}</h3>

    <div class="datum">

        📅 ${item.date || ""}

        &nbsp;&nbsp;

        🕒 ${item.time || ""}

    </div>

    <div
        id="short-${item.id}"
        class="tekst">

        ${formatText(createSummary(item.text || ""))}

    </div>

    <div
        id="full-${item.id}"
        class="tekst extraTekst">

        ${formatText(item.text || "")}

    </div>

    <div class="leesverder">

        <button
            type="button"
            class="leesButton"
            data-id="${item.id}"
            data-open="false">

            ➜ Lees verder

        </button>

    </div>

</article>

`;

}
/* ==========================================
   NIEUWS LADEN
========================================== */

onValue(newsQuery, (snapshot) => {

    const newsItems = [];

    snapshot.forEach((item) => {

        newsItems.push({

            id: item.key,

            ...item.val()

        });

    });

    /* Nieuwste eerst */

    newsItems.sort((a, b) =>

        (b.timestamp || 0) - (a.timestamp || 0)

    );

    /* Geen nieuws */

    if (newsItems.length === 0) {

        newsContainer.innerHTML = `

<article class="kaart">

    <h3>📰 Nog geen nieuws</h3>

    <div class="tekst">

        Er zijn momenteel nog geen nieuwsberichten.

    </div>

</article>

`;

        return;

    }

    /* HTML opbouwen */

    let html = "";

    newsItems.forEach((item) => {

        html += createCard(item);

    });

    newsContainer.innerHTML = html;

    initReadMore();

}, (error) => {

    console.error("Nieuws laden mislukt:", error);

    newsContainer.innerHTML = `

<article class="kaart">

    <h3>❌ Fout</h3>

    <div class="tekst">

        Het nieuws kon niet worden geladen.

    </div>

</article>

`;

});
