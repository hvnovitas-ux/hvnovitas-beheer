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
    console.error("❌ news container niet gevonden");
    throw new Error("Missing #news container");
}

// ==========================================
// FIREBASE QUERY (laatste 3 nieuws)
// ==========================================

const newsQuery = query(
    ref(db, "news"),
    orderByChild("created"),
    limitToLast(3)
);

// ==========================================
// HTML SAFE TEXT
// ==========================================

function escapeHTML(text = "") {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

// ==========================================
// CARD
// ==========================================

function createCard(item) {

    const text = item.text || "";

    const shortText =
        text.length > 150
            ? text.substring(0, 150) + "..."
            : text;

    return `
<article class="kaart">

    <h3>${escapeHTML(item.title || "")}</h3>

    <div class="datum">
        📅 ${item.date || ""} • 🕒 ${item.time || ""}
    </div>

    ${item.image
        ? `<img src="${item.image}" style="width:100%;border-radius:10px;margin-top:10px;">`
        : ""
    }

    <p>${escapeHTML(shortText)}</p>

</article>
`;
}

// ==========================================
// LOAD DATA
// ==========================================

onValue(newsQuery, (snapshot) => {

    const items = [];

    snapshot.forEach((child) => {
        items.push({
            id: child.key,
            ...child.val()
        });
    });

    if (items.length === 0) {
        newsContainer.innerHTML = `
            <article class="kaart">
                <h3>📰 Geen nieuws</h3>
                <p>Er zijn nog geen berichten geplaatst.</p>
            </article>
        `;
        return;
    }

    // nieuwste eerst
    items.sort((a, b) => (b.created || 0) - (a.created || 0));

    newsContainer.innerHTML = items
        .map(createCard)
        .join("");

}, (error) => {

    console.error("❌ NEWS ERROR:", error);

    newsContainer.innerHTML = `
        <article class="kaart">
            <h3>❌ Fout</h3>
            <p>Nieuws kon niet geladen worden.</p>
        </article>
    `;
});

// ==========================================
// START LOG
// ==========================================

console.log("🧡 NEWS.JS CLEAN REWRITE LOADED");
