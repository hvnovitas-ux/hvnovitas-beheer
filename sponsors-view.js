// ============================================================
// HV NOVITAS - SPONSORS OPENBARE WEERGAVE
// ============================================================

import { db } from "./firebase.js";

import {
    ref,
    onValue
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const track =
    document.getElementById("sponsorTrack") ||
    document.getElementById("sponsorsTrack");

let sponsors = [];
let index = 0;
let timer = null;

function escapeHTML(value = "") {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function normalizeUrl(value = "") {
    const url = String(value).trim();

    if (!url) return "";

    if (
        url.startsWith("https://") ||
        url.startsWith("http://")
    ) {
        return url;
    }

    if (url.startsWith("www.")) {
        return `https://${url}`;
    }

    if (
        url.includes(".") &&
        !url.includes(" ")
    ) {
        return `https://${url}`;
    }

    return "";
}

function load(snapshot) {
    const data = snapshot.val() || {};

    sponsors = Object.values(data)
        .filter(
            item =>
                item &&
                item.active !== false &&
                (item.imageUrl || item.image)
        )
        .sort(
            (a, b) =>
                (a.created || 0) -
                (b.created || 0)
        );

    index = 0;

    render();
    startAutoplay();
}

function render() {
    if (!track) return;

    if (!sponsors.length) {
        track.innerHTML = "";
        return;
    }

    const visible = sponsors.map(
        (sponsor) => {
            const image =
                sponsor.imageUrl ||
                sponsor.image ||
                "";

            const name =
                sponsor.name ||
                sponsor.sponsorName ||
                "Sponsor";

            const website =
                normalizeUrl(
                    sponsor.website ||
                    sponsor.url ||
                    ""
                );

            const card = `
                <div class="sponsor">
                    ${
                        website
                            ? `
                                <a
                                    href="${escapeHTML(website)}"
                                    target="_blank"
                                    rel="noopener noreferrer">
                                    <img
                                        src="${escapeHTML(image)}"
                                        alt="${escapeHTML(name)}">
                                </a>
                            `
                            : `
                                <img
                                    src="${escapeHTML(image)}"
                                    alt="${escapeHTML(name)}">
                            `
                    }
                </div>
            `;

            return card;
        }
    );

    track.innerHTML = visible.join("");
}

function startAutoplay() {
    if (timer) {
        clearInterval(timer);
    }

    if (sponsors.length > 1) {
        timer = setInterval(
            () => {
                index =
                    (index + 1) %
                    sponsors.length;

                render();
            },
            3500
        );
    }
}

if (track) {
    onValue(
        ref(db, "sponsors"),
        load
    );
}

console.log("🧡 Sponsors openbare module gereed.");
