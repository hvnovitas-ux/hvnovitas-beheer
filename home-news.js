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
// QUERY (SYNC MET CMS → created)
// ==========================================

const newsQuery = query(
    ref(db, "news"),
    orderByChild("created"),
    limitToLast(3)
);

// ==========================================
// SAFE TEXT
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

// ==========================================
// IMAGE
// ==========================================

function createImage(item) {

    if (!item.image) return "";

    return `
        <img
            class="nieuwsfoto"
            src="${item.image}"
            alt="${escapeHTML(item.title || "")}"
            loading="lazy">
    `;
}

// ==========================================
// CARD
// ==========================================

function createCard(item) {

    const text = item.text || "";

    const shortText =
        text.length > 180
            ? text.substring(0, 180) + "..."
            : text;

    return `
        <article class="kaart">

            ${createImage(item)}

            <h3>${escapeHTML(item.title || "")}</h3>

            <div class="datum">
                📅 ${item.date || ""} &nbsp;&nbsp; 🕒 ${item.time || ""}
            </div>

            <div class="tekst">
                ${formatText(shortText)}
            </div>

        </article>
    `;
}

// ==========================================
// LOAD NEWS
// ==========================================

onValue(newsQuery, (snapshot) => {

    const newsItems = [];

    snapshot.forEach((item) => {
        newsItems.push({
            id: item.key,
            ...item.val()
        });
    });

    // BELANGRIJK: stabiele sort
    newsItems.sort((a, b) =>
        (b.created || 0) - (a.created || 0)
    );

    if (newsItems.length === 0) {

        newsContainer.innerHTML = `
            <article class="kaart">
                <h3>📰 Nog geen nieuws</h3>
                <div class="tekst">
                    Er zijn nog geen nieuwsberichten.
                </div>
            </article>
        `;
        return;
    }

    newsContainer.innerHTML = newsItems
        .map(createCard)
        .join("");

}, (error) => {

    console.error("❌ NEWS ERROR:", error);

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

console.log("🧡 HOME NEWS RESTORED OK");
