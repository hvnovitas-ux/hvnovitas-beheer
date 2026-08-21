/* =====================================================
   HV NOVITAS SPONSOR SLIDER
===================================================== */

import { db } from "./firebase.js";

import {
    ref,
    get
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";


console.log("🤝 Sponsor slider geladen");


// =====================================================
// ELEMENT
// =====================================================

const track =
    document.getElementById("sponsorTrack");


// =====================================================
// CONTROLEREN
// =====================================================

if (!track) {

    console.error(
        "❌ sponsorTrack niet gevonden in HTML"
    );

}


// =====================================================
// SLIDER VARS
// =====================================================

let position = 0;

const speed = 0.5;

let animationId = null;


// =====================================================
// SPONSORS LADEN
// =====================================================

async function loadSponsors() {

    try {

        console.log(
            "🔄 Sponsors laden..."
        );


        const snapshot =
            await get(
                ref(db, "sponsors")
            );


        const data =
            snapshot.val() || {};


        // =================================================
        // FIREBASE DATA OMZETTEN
        // =================================================

        const list =
            Object.entries(data)

                .map(([id, sponsor]) => ({

                    id: id,

                    name:
                        sponsor.name ||
                        sponsor.sponsorName ||
                        sponsor.sponsorNaam ||
                        "",

                    imageUrl:
                        sponsor.imageUrl ||
                        sponsor.image ||
                        "",

                    website:
                        sponsor.website ||
                        sponsor.url ||
                        "",

                    active:
                        sponsor.active !== false

                }))


                // Alleen actieve sponsors
                .filter(
                    sponsor =>
                        sponsor.active
                )


                // Alleen sponsors met logo
                .filter(
                    sponsor =>
                        sponsor.imageUrl
                );


        console.log(
            `✅ ${list.length} sponsors gevonden`
        );


        // =================================================
        // GEEN SPONSORS
        // =================================================

        if (list.length === 0) {

            track.innerHTML =
                "<p>Geen sponsors</p>";

            return;

        }


        // =================================================
        // DUBBEL VOOR ONEINDIGE SLIDER
        // =================================================

        const items =
            [
                ...list,
                ...list
            ];


        // =================================================
        // HTML MAKEN
        // =================================================

        track.innerHTML =
            items
                .map(
                    sponsor =>
                        createSponsorHTML(
                            sponsor
                        )
                )
                .join("");


        // =================================================
        // SLIDER STARTEN
        // =================================================

        requestAnimationFrame(() => {

            startSlider();

        });


    } catch (error) {

        console.error(
            "❌ Fout bij laden sponsors:",
            error
        );


        track.innerHTML =
            "<p>Sponsors konden niet worden geladen.</p>";

    }

}


// =====================================================
// SPONSOR HTML
// =====================================================

function createSponsorHTML(sponsor) {

    const imageUrl =
        escapeAttribute(
            sponsor.imageUrl
        );


    const name =
        escapeHtml(
            sponsor.name ||
            "HV Novitas sponsor"
        );


    const website =
        normalizeUrl(
            sponsor.website
        );


    // =================================================
    // SPONSOR MET WEBSITE
    // =================================================

    if (website) {

        return `

            <div class="sponsor">

                <a
                    href="${escapeAttribute(website)}"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="${name}"
                >

                    <img
                        src="${imageUrl}"
                        alt="${name}"
                    >

                </a>

            </div>

        `;

    }


    // =================================================
    // SPONSOR ZONDER WEBSITE
    // =================================================

    return `

        <div class="sponsor no-link">

            <img
                src="${imageUrl}"
                alt="${name}"
                title="${name}"
            >

        </div>

    `;

}


// =====================================================
// SLIDER ANIMATIE
// =====================================================

function startSlider() {

    cancelAnimationFrame(
        animationId
    );


    position = 0;


    const halfWidth =
        track.scrollWidth / 2;


    function animate() {

        position -= speed;


        track.style.transform =
            `translateX(${position}px)`;


        if (
            Math.abs(position) >=
            halfWidth
        ) {

            position = 0;

        }


        animationId =
            requestAnimationFrame(
                animate
            );

    }


    animate();

}


// =====================================================
// URL NORMALISEREN
// =====================================================

function normalizeUrl(url) {

    if (!url) {

        return "";

    }


    url =
        String(url).trim();


    if (!url) {

        return "";

    }


    // ---------------------------------------------
    // HTTPS / HTTP
    // ---------------------------------------------

    if (
        url.startsWith("https://") ||
        url.startsWith("http://")
    ) {

        return url;

    }


    // ---------------------------------------------
    // WWW
    // ---------------------------------------------

    if (
        url.startsWith("www.")
    ) {

        return (
            "https://" +
            url
        );

    }


    // ---------------------------------------------
    // NORMALE DOMEINNAAM
    // ---------------------------------------------

    if (
        url.includes(".") &&
        !url.includes(" ")
    ) {

        return (
            "https://" +
            url
        );

    }


    return "";

}


// =====================================================
// HTML VEILIG MAKEN
// =====================================================

function escapeHtml(value) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// =====================================================
// ATTRIBUTE VEILIG MAKEN
// =====================================================

function escapeAttribute(value) {

    return escapeHtml(value);

}


// =====================================================
// START
// =====================================================

window.addEventListener(
    "DOMContentLoaded",
    loadSponsors
);
