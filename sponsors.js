/* =====================================================
   HV NOVITAS SPONSOR SYSTEM
   Sponsor Slider + Sponsor van de Week
===================================================== */

import { db } from "./firebase.js";

import {
    ref,
    get
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";


console.log("🤝 HV Novitas Sponsor System geladen");


// =====================================================
// ELEMENTEN
// =====================================================

const track = document.getElementById("sponsorTrack");

const sponsorWeekBanner =
    document.getElementById("sponsorWeekBanner");


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

        console.log("🔄 Sponsors worden geladen...");


        const snapshot =
            await get(ref(db, "sponsors"));


        const data =
            snapshot.val() || {};


        // =================================================
        // FIREBASE DATA OMZETTEN NAAR LIJST
        // =================================================

        const list =
            Object.entries(data)

                .map(([id, sponsor]) => ({

                    id,

                    name:
                        sponsor.name ||
                        sponsor.title ||
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
                .filter(sponsor => sponsor.active)

                // Sponsors zonder afbeelding niet tonen
                .filter(sponsor => sponsor.imageUrl);


        console.log(
            `✅ ${list.length} sponsors gevonden`
        );


        // =================================================
        // GEEN SPONSORS
        // =================================================

        if (list.length === 0) {

            if (track) {

                track.innerHTML =
                    "<p>Geen sponsors beschikbaar</p>";

            }

            if (sponsorWeekBanner) {

                sponsorWeekBanner.innerHTML =
                    `<div class="sponsor-week-empty">
                        Geen sponsor beschikbaar
                    </div>`;

            }

            return;
        }


        // =================================================
        // SPONSOR VAN DE WEEK
        // =================================================

        showSponsorOfTheWeek(list);


        // =================================================
        // NORMALE SLIDER
        // =================================================

        createSponsorSlider(list);

    }

    catch (error) {

        console.error(
            "❌ Fout bij laden sponsors:",
            error
        );


        if (track) {

            track.innerHTML =
                "<p>Sponsors konden niet worden geladen.</p>";

        }


        if (sponsorWeekBanner) {

            sponsorWeekBanner.innerHTML =
                `<div class="sponsor-week-empty">
                    Sponsors tijdelijk niet beschikbaar
                </div>`;

        }

    }

}


// =====================================================
// SPONSOR VAN DE WEEK
// =====================================================

function showSponsorOfTheWeek(list) {

    if (!sponsorWeekBanner) {
        return;
    }


    // =================================================
    // WEEKNUMMER
    // =================================================

    const weekNumber =
        getISOWeekNumber(new Date());


    // =================================================
    // SPONSOR INDEX
    // =================================================

    const sponsorIndex =
        (weekNumber - 1) % list.length;


    const sponsor =
        list[sponsorIndex];


    console.log(
        "🏆 Sponsor van de week:",
        sponsor.name || sponsor.id
    );


    // =================================================
    // WEBSITE NORMALISEREN
    // =================================================

    const website =
        normalizeUrl(sponsor.website);


    // =================================================
    // BANNER MAKEN
    // =================================================

    const image =
        escapeAttribute(sponsor.imageUrl);


    const name =
        escapeHtml(
            sponsor.name ||
            "Sponsor van de week"
        );


    let html = "";


    // =================================================
    // MET WEBSITE
    // =================================================

    if (website) {

        html = `
            <a
                href="${escapeAttribute(website)}"
                target="_blank"
                rel="noopener noreferrer"
                title="${name}"
            >
                <img
                    src="${image}"
                    alt="${name}"
                >
            </a>
        `;

    }

    // =================================================
    // ZONDER WEBSITE
    // =================================================

    else {

        html = `
            <img
                src="${image}"
                alt="${name}"
                title="${name}"
            >
        `;

    }


    sponsorWeekBanner.innerHTML = html;


    // =================================================
    // SPONSORNAAM
    // =================================================

    if (sponsor.name) {

        const nameElement =
            document.createElement("div");

        nameElement.className =
            "sponsor-week-name";

        nameElement.textContent =
            sponsor.name;


        sponsorWeekBanner
            .parentElement
            .appendChild(nameElement);

    }

}


// =====================================================
// SPONSOR SLIDER MAKEN
// =====================================================

function createSponsorSlider(list) {

    if (!track) {
        return;
    }


    // =================================================
    // TWEE KEER DE LIJST
    // VOOR ONEINDIGE SCROLL
    // =================================================

    const items =
        [...list, ...list];


    track.innerHTML =
        items
            .map(sponsor => createSponsorHTML(sponsor))
            .join("");


    // Even wachten totdat afbeeldingen geladen zijn
    requestAnimationFrame(() => {

        startSlider();

    });

}


// =====================================================
// HTML VOOR NORMALE SPONSOR
// =====================================================

function createSponsorHTML(sponsor) {

    const image =
        escapeAttribute(sponsor.imageUrl);


    const name =
        escapeHtml(
            sponsor.name ||
            "HV Novitas sponsor"
        );


    const website =
        normalizeUrl(sponsor.website);


    // =================================================
    // MET LINK
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
                        src="${image}"
                        alt="${name}"
                        loading="lazy"
                    >

                </a>

            </div>
        `;

    }


    // =================================================
    // ZONDER LINK
    // =================================================

    return `
        <div class="sponsor no-link">

            <img
                src="${image}"
                alt="${name}"
                title="${name}"
                loading="lazy"
            >

        </div>
    `;

}


// =====================================================
// SLIDER ANIMATIE
// =====================================================

function startSlider() {

    cancelAnimationFrame(animationId);


    position = 0;


    const halfWidth =
        track.scrollWidth / 2;


    function animate() {

        position -= speed;


        track.style.transform =
            `translateX(${position}px)`;


        if (Math.abs(position) >= halfWidth) {

            position = 0;

        }


        animationId =
            requestAnimationFrame(animate);

    }


    animate();

}


// =====================================================
// ISO WEEKNUMMER
// =====================================================

function getISOWeekNumber(date) {

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
        tempDate.getUTCDate() + 4 - day
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
                tempDate -
                yearStart
            ) / 86400000 + 1
        ) / 7
    );

}


// =====================================================
// URL CONTROLEREN
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


    // https://
    if (
        url.startsWith("https://") ||
        url.startsWith("http://")
    ) {

        return url;

    }


    // www.
    if (url.startsWith("www.")) {

        return "https://" + url;

    }


    // Gewone domeinnaam
    if (
        url.includes(".") &&
        !url.includes(" ")
    ) {

        return "https://" + url;

    }


    return "";

}


// =====================================================
// HTML ESCAPE
// =====================================================

function escapeHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// =====================================================
// ATTRIBUTE ESCAPE
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
