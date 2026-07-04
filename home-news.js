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

// Popup elementen
const popup = document.getElementById("newsPopup");
const popupContent = document.getElementById("popupContent");
const popupTitle = document.getElementById("popupTitle");
const popupDate = document.getElementById("popupDate");
const popupImage = document.getElementById("popupImage");
const popupText = document.getElementById("popupText");
const popupClose = document.getElementById("popupClose");

// -----------------------------------------------------
// Controle
// -----------------------------------------------------

if (!news) {

    console.error("Element #news niet gevonden.");

} else {

    console.log("📰 Homepage Nieuws gestart.");

}

// -----------------------------------------------------
// Helpers
// -----------------------------------------------------

function escapeHTML(text = "") {

    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}

function inkorten(text = "", lengte = 180) {

    if (text.length <= lengte) return text;

    return text.substring(0, lengte).trim() + "...";

}

// -----------------------------------------------------
// Popup openen
// -----------------------------------------------------

function openNieuws(bericht) {

    popupTitle.textContent = bericht.title || "";

    popupDate.textContent =
        `📅 ${bericht.date || ""}   🕒 ${bericht.time || ""}`;

    popupText.innerHTML =
        escapeHTML(bericht.text || "").replace(/\n/g, "<br>");

    if (bericht.image) {

        popupImage.src = bericht.image;
        popupImage.style.display = "block";

    } else {

        popupImage.removeAttribute("src");
        popupImage.style.display = "none";

    }

    popup.classList.add("open");

    document.body.style.overflow = "hidden";

}

// -----------------------------------------------------
// Popup sluiten
// -----------------------------------------------------

function sluitNieuws() {

    popup.classList.remove("open");

    document.body.style.overflow = "";

}

if (popupClose) {

    popupClose.addEventListener("click", sluitNieuws);

}

window.addEventListener("click", (e) => {

    if (e.target === popup) {

        sluitNieuws();

    }

});

window.addEventListener("keydown", (e) => {

    if (e.key === "Escape") {

        sluitNieuws();

    }

});

// -----------------------------------------------------
// Firebase query
// -----------------------------------------------------

const newsQuery = query(
    ref(db, "news"),
    orderByChild("created"),
    limitToLast(3)
);

// -----------------------------------------------------
// Vanaf hier gaat Deel 2 verder...
// -----------------------------------------------------
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

    let html = "";

    berichten.forEach((bericht) => {

        const titel = escapeHTML(bericht.title || "");

        const datum = bericht.date || "";

        const tijd = bericht.time || "";

        const tekst = escapeHTML(
            inkorten(bericht.text || "")
        ).replace(/\n/g, "<br>");

        let foto = "";

        if (bericht.image && bericht.image !== "") {

            foto = `

<img
    src="${bericht.image}"
    class="nieuwsfoto"
    alt="${titel}"
    loading="lazy">

`;

        }

        html += `

<div class="kaart">

    ${foto}

    <h3>${titel}</h3>

    <div class="datum">

        📅 ${datum}
        &nbsp;&nbsp;
        🕒 ${tijd}

    </div>

    <div class="tekst">

        ${tekst}

    </div>

    <div class="leesverder">

        <button
            class="leesButton"
            data-id="${bericht.id}">

            ➜ Lees verder

        </button>

    </div>

</div>

`;

    });

    news.innerHTML = html;

    // -----------------------------------------
    // Knoppen koppelen
    // -----------------------------------------

    document.querySelectorAll(".leesButton").forEach((knop) => {

        knop.addEventListener("click", () => {

            const id = knop.dataset.id;

            const bericht = berichten.find(
                b => b.id === id
            );

            if (bericht) {

                openNieuws(bericht);

            }

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
