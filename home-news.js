
// ==========================================
// HV NOVITAS - HOME NEWS (CLEAN)
// ==========================================

import { db } from "./firebase.js";

import {
    ref,
    query,
    orderByChild,
    limitToLast,
    onValue
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

// ==========================================
// CONTAINER
// ==========================================

const newsContainer = document.getElementById("news");

if (!newsContainer) {
    console.error("❌ #news container niet gevonden");
    throw new Error("Container ontbreekt");
}

// ==========================================
// QUERY
// ==========================================

const newsQuery = query(
    ref(db, "news"),
    orderByChild("timestamp"),
    limitToLast(3)
);

// ==========================================
// HELPERS
// ==========================================

function escapeHTML(text = "") {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
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

// ==========================================
// IMAGE
// ==========================================

function createImage(item) {

    if (!item.image) return "";

    return `
        <img
            class="nieuwsfoto"
            src="${item.image}"
            alt="${escapeHTML(item.title)}"
            loading="lazy">
    `;
}

// ==========================================
// CARD
// ==========================================

function createCard(item) {

    return `
        <article class="kaart">

            ${createImage(item)}

            <h3>${escapeHTML(item.title)}</h3>

            <div class="datum">
                📅 ${item.date || ""} &nbsp;&nbsp; 🕒 ${item.time || ""}
            </div>

            <div class="tekst">
                ${formatText(createSummary(item.text || ""))}
            </div>

        </article>
    `;
}

// ==========================================
// LOAD NEWS (SINGLE LISTENER - FIXED)
// ==========================================

onValue(newsQuery, (snapshot) => {

    const newsItems = [];

    snapshot.forEach((item) => {
        newsItems.push({
            id: item.key,
            ...item.val()
        });
    });

    newsItems.sort((a, b) =>
        (b.timestamp || 0) - (a.timestamp || 0)
    );

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

    let html = "";

    newsItems.forEach((item) => {
        html += createCard(item);
    });

    newsContainer.innerHTML = html;

}, (error) => {

    console.error("❌ Nieuws fout:", error);

    newsContainer.innerHTML = `
        <article class="kaart">
            <h3>❌ Fout</h3>
            <div class="tekst">
                Nieuws kon niet worden geladen.
            </div>
        </article>
    `;
});

// ==========================================
// LOG
// ==========================================

console.log("🧡 HV Novitas Home News geladen");
