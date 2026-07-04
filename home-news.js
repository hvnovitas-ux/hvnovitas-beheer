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

console.log("📰 Homepage Nieuws gestart.");

// =====================================================
// FIREBASE QUERY
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

function maakSamenvatting(text = "", lengte = 180) {

    if (text.length <= lengte) {

        return text;

    }

    return text.substring(0, lengte).trim() + "...";

}

function formatTekst(text = "") {

    return escapeHTML(text).replace(/\n/g, "<br>");

}

function maakFoto(bericht) {

    if (!bericht.image || bericht.image === "") {

        return "";

    }

    return `

<img
    src="${bericht.image}"
    class="nieuwsfoto"
    alt="${escapeHTML(bericht.title)}"
    loading="lazy">

`;

}

// =====================================================
// HTML VAN ÉÉN BERICHT
// =====================================================

function maakKaart(bericht) {

    const korteTekst = formatTekst(

        maakSamenvatting(bericht.text || "")

    );

    const langeTekst = formatTekst(

        bericht.text || ""

    );

    return `

<div class="kaart">

    ${maakFoto(bericht)}

    <h3>

        ${escapeHTML(bericht.title)}

    </h3>

    <div class="datum">

        📅 ${bericht.date}
        &nbsp;&nbsp;
        🕒 ${bericht.time}

    </div>

    <div
        id="kort-${bericht.id}"
        class="tekst">

        ${korteTekst}

    </div>

    <div
        id="lang-${bericht.id}"
        class="tekst volledig"
        style="display:none;">

        ${langeTekst}

    </div>

    <button
        class="leesButton"
        data-id="${bericht.id}">

        ➜ Lees verder

    </button>

</div>

`;

}

// =====================================================
// DEEL 2 GAAT HIER VERDER...
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

    <p>

        Er zijn nog geen nieuwsberichten gepubliceerd.

    </p>

</div>

`;

        return;

    }

    // HTML opbouwen

    let html = "";

    berichten.forEach((bericht) => {

        html += maakKaart(bericht);

    });

    news.innerHTML = html;

    // ============================================
    // LEES VERDER / LEES MINDER
    // ============================================

    const knoppen = document.querySelectorAll(".leesButton");

    knoppen.forEach((button) => {

        button.addEventListener("click", () => {

            const id = button.dataset.id;

            const kort = document.getElementById("kort-" + id);

            const lang = document.getElementById("lang-" + id);

            if (!kort || !lang) return;

            if (lang.style.display === "none") {

                kort.style.display = "none";

                lang.style.display = "block";

                button.innerHTML = "▲ Lees minder";

            } else {

                kort.style.display = "block";

                lang.style.display = "none";

                button.innerHTML = "➜ Lees verder";

            }

        });

    });

}, (error) => {

    console.error("Nieuws laden mislukt:", error);

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
