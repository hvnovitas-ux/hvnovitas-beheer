import { db } from "./firebase.js";

import {
    ref,
    query,
    orderByChild,
    limitToLast,
    onValue
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

/* ==========================================================
   HV NOVITAS
   Homepage Nieuws
========================================================== */

const newsContainer = document.getElementById("news");

if (!newsContainer) {

    console.error("Element #news niet gevonden.");

    throw new Error("Nieuwscontainer ontbreekt.");

}

/* ==========================================================
   Firebase Query
========================================================== */

const newsQuery = query(

    ref(db, "news"),

    orderByChild("timestamp"),

    limitToLast(3)

);

/* ==========================================================
   HTML veilig maken
========================================================== */

function escapeHTML(text = "") {

    return String(text)

        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}

/* ==========================================================
   Regelafbrekingen behouden
========================================================== */

function formatText(text = "") {

    return escapeHTML(text)

        .replace(/\n/g, "<br>");

}

/* ==========================================================
   Samenvatting
========================================================== */

function createSummary(text = "", max = 180) {

    const value = text.trim();

    if (value.length <= max) {

        return value;

    }

    return value.substring(0, max).trim() + "...";

}

/* ==========================================================
   Afbeelding
========================================================== */

function createImage(item) {

    if (!item.image) {

        return "";

    }

    return `

        <img

            class="nieuwsfoto"

            src="${item.image}"

            alt="${escapeHTML(item.title)}"

            loading="lazy"

        >

    `;

}

/* ==========================================================
   Nieuwskaart
========================================================== */

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
/* ==========================================================
   NIEUWS LADEN
========================================================== */

onValue(newsQuery, (snapshot) => {

    const newsItems = [];

    snapshot.forEach((item) => {

        newsItems.push({

            id: item.key,

            ...item.val()

        });

    });

    /* ==========================================
       Nieuwste eerst
    ========================================== */

    newsItems.sort((a, b) =>

        (b.timestamp || 0) - (a.timestamp || 0)

    );

    /* ==========================================
       Geen nieuws gevonden
    ========================================== */

    if (newsItems.length === 0) {

        newsContainer.innerHTML = `

<article class="kaart">

    <div class="tekst">

        <h3>📰 Nog geen nieuws</h3>

        <p>

            Er zijn momenteel nog geen
            nieuwsberichten beschikbaar.

        </p>

    </div>

</article>

`;

        return;

    }

    /* ==========================================
       HTML opbouwen
    ========================================== */

    let html = "";

    newsItems.forEach((item) => {

        html += createCard(item);

    });

    newsContainer.innerHTML = html;

    /* ==========================================
       Lees verder wordt in Deel 3 toegevoegd
    ========================================== */

}, (error) => {

    console.error("Nieuws laden mislukt:", error);

    newsContainer.innerHTML = `

<article class="kaart">

    <div class="tekst">

        <h3>❌ Fout</h3>

        <p>

            Het nieuws kon niet worden geladen.

        </p>

    </div>

</article>

`;

});
/* ==========================================================
   LEES VERDER / LEES MINDER
========================================================== */

function initializeReadMore() {

    const buttons = newsContainer.querySelectorAll(".leesButton");

    buttons.forEach((button) => {

        button.addEventListener("click", () => {

            const id = button.dataset.id;

            const isOpen = button.dataset.open === "true";

            /* --------------------------------------
               Eerst alle kaarten sluiten
            -------------------------------------- */

            newsContainer.querySelectorAll(".leesButton").forEach((btn) => {

                btn.dataset.open = "false";

                btn.textContent = "➜ Lees verder";

            });

            newsContainer.querySelectorAll(".extraTekst").forEach((div) => {

                div.classList.remove("open");

            });

            newsContainer.querySelectorAll(".tekst[id^='short-']").forEach((div) => {

                div.classList.remove("hidden");

            });

            /* --------------------------------------
               Was deze kaart al open?
            -------------------------------------- */

            if (isOpen) {

                return;

            }

            /* --------------------------------------
               Gekozen kaart openen
            -------------------------------------- */

            const shortText = document.getElementById(`short-${id}`);
            const fullText = document.getElementById(`full-${id}`);

            if (!shortText || !fullText) {

                return;

            }

            shortText.classList.add("hidden");

            fullText.classList.add("open");

            button.dataset.open = "true";

            button.textContent = "▲ Lees minder";

        });

    });

}
/* ==========================================================
   HV NOVITAS
   HOME NEWS
   Deel 4
   Definitieve afronding
========================================================== */

/* ==========================================
   Afbeeldingen optimaliseren
========================================== */

function optimizeImages() {

    const images = newsContainer.querySelectorAll(".nieuwsfoto");

    images.forEach((image) => {

        image.decoding = "async";

        image.loading = "lazy";

        image.referrerPolicy = "no-referrer";

    });

}

/* ==========================================
   Google Sites iframe
========================================== */

function notifyResize() {

    requestAnimationFrame(() => {

        window.dispatchEvent(
            new Event("resize")
        );

    });

}

/* ==========================================
   Initialiseren
========================================== */

function initializeNews() {

    initializeNews();

    optimizeImages();

    notifyResize();

}

/* ==========================================
   Extra beveiliging
========================================== */

window.addEventListener("error", (event) => {

    console.error(

        "Nieuws fout:",

        event.message

    );

});

/* ==========================================
   Einde
========================================== */

console.log(

    "🧡 HV Novitas Home News geladen."

);
