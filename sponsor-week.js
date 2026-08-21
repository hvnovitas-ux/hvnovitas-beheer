/* =====================================================
   HV NOVITAS
   SPONSOR VAN DE WEEK
===================================================== */

import { db } from "./firebase.js";

import {
    ref,
    get
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";


console.log(
    "⭐ Sponsor van de Week geladen"
);


// =====================================================
// ELEMENT
// =====================================================

const content =
    document.getElementById(
        "sponsorWeekContent"
    );


// =====================================================
// SPONSOR VAN DE WEEK LADEN
// =====================================================

async function loadSponsorOfTheWeek() {

    try {

        console.log(
            "🔄 Sponsors ophalen..."
        );


        // ---------------------------------------------
        // FIREBASE
        // ---------------------------------------------

        const snapshot =
            await get(
                ref(db, "sponsors")
            );


        const data =
            snapshot.val() || {};


        // ---------------------------------------------
        // SPONSORS MAKEN
        // ---------------------------------------------

        const sponsors =
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


        // ---------------------------------------------
        // GEEN SPONSORS
        // ---------------------------------------------

        if (sponsors.length === 0) {

            content.innerHTML = `

                <div class="error">

                    Geen sponsors beschikbaar.

                </div>

            `;

            return;

        }


        console.log(
            `✅ ${sponsors.length} sponsors gevonden`
        );


        // ---------------------------------------------
        // AUTOMATISCHE WEEKSELECTIE
        // ---------------------------------------------

        const sponsor =
            getSponsorForCurrentWeek(
                sponsors
            );


        console.log(
            "⭐ Sponsor van deze week:",
            sponsor.name
        );


        // ---------------------------------------------
        // BANNER MAKEN
        // ---------------------------------------------

        renderSponsor(
            sponsor
        );


    } catch (error) {

        console.error(
            "❌ Fout bij Sponsor van de Week:",
            error
        );


        content.innerHTML = `

            <div class="error">

                Sponsor kon niet worden geladen.

            </div>

        `;

    }

}


// =====================================================
// AUTOMATISCHE SPONSORSELECTIE
// =====================================================
//
// De week bepaalt automatisch welke sponsor aan de beurt is.
//
// Week 1  → sponsor 1
// Week 2  → sponsor 2
// Week 3  → sponsor 3
// enz.
//
// Na de laatste sponsor begint de cyclus opnieuw.
//
// =====================================================

function getSponsorForCurrentWeek(
    sponsors
) {

    // ---------------------------------------------
    // HUIDIGE DATUM
    // ---------------------------------------------

    const today =
        new Date();


    // ---------------------------------------------
    // WEEKNUMMER
    // ---------------------------------------------

    const weekNumber =
        getISOWeekNumber(
            today
        );


    // ---------------------------------------------
    // INDEX BEREKENEN
    // ---------------------------------------------

    const index =
        (weekNumber - 1) %
        sponsors.length;


    return sponsors[index];

}


// =====================================================
// ISO WEEKNUMMER
// =====================================================

function getISOWeekNumber(
    date
) {

    const tempDate =
        new Date(
            Date.UTC(
                date.getFullYear(),
                date.getMonth(),
                date.getDate()
            )
        );


    const day =
        tempDate.getUTCDay() || 7;


    tempDate.setUTCDate(
        tempDate.getUTCDate() +
        4 -
        day
    );


    const yearStart =
        new Date(
            Date.UTC(
                tempDate.getUTCFullYear(),
                0,
                1
            )
        );


    return Math.ceil(

        (
            (
                (
                    tempDate -
                    yearStart
                ) / 86400000
            ) + 1
        ) / 7

    );

}


// =====================================================
// SPONSOR TONEN
// =====================================================

function renderSponsor(
    sponsor
) {

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
    // MET WEBSITE
    // =================================================

    if (website) {

        content.innerHTML = `

            <a
                class="sponsor-week-link"
                href="${escapeAttribute(website)}"
                target="_blank"
                rel="noopener noreferrer"
                title="${name}"
            >

                <img
                    class="sponsor-week-logo"
                    src="${imageUrl}"
                    alt="${name}"
                >

                <div
                    class="sponsor-week-name"
                >
                    ${name}
                </div>

                <div
                    class="sponsor-week-visit"
                >
                    Bezoek de website van onze sponsor
                </div>

            </a>

        `;

        return;

    }


    // =================================================
    // ZONDER WEBSITE
    // =================================================

    content.innerHTML = `

        <div
            class="sponsor-week-no-link"
        >

            <img
                class="sponsor-week-logo"
                src="${imageUrl}"
                alt="${name}"
            >

            <div
                class="sponsor-week-name"
            >
                ${name}
            </div>

        </div>

    `;

}


// =====================================================
// URL NORMALISEREN
// =====================================================

function normalizeUrl(
    url
) {

    if (!url) {

        return "";

    }


    url =
        String(url).trim();


    if (!url) {

        return "";

    }


    if (
        url.startsWith("https://") ||
        url.startsWith("http://")
    ) {

        return url;

    }


    if (
        url.startsWith("www.")
    ) {

        return (
            "https://" +
            url
        );

    }


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

function escapeHtml(
    value
) {

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

function escapeAttribute(
    value
) {

    return escapeHtml(
        value
    );

}


// =====================================================
// START
// =====================================================

window.addEventListener(
    "DOMContentLoaded",
    loadSponsorOfTheWeek
);
