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
// QUERY (laatste 3 nieuws)
   // ==========================================

const newsQuery = query(
    ref(db, "news"),
    orderByChild("created"),
    limitToLast(3)
);

// ==========================================
// HTML HELPERS
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
// CARD
// ==========================================

function createCard(item) {

    const shortText = item.text.length > 150
        ? item.text.substring(0, 150) + "..."
        : item.text;

    return `
<article class="kaart">

    <h3>${escapeHTML(item.title)}</h3>

    <div class="datum">
        📅 ${item.date || ""} &nbsp;&nbsp;
        🕒 ${item.time || ""}
    </div>

    <p id="short-${item.id}">
        ${formatText(shortText)}
    </p>

    <p id="full-${item.id}" style="display:none;">
        ${formatText(item.text)}
    </p>

    <button
        id="btn-${item.id}"
        onclick="toggleNews('${item.id}')">
        Lees verder
    </button>

</article>
`;
}

// ==========================================
// TOGGLE LEES VERDER
// ==========================================

window.toggleNews = function (id) {

    const shortEl = document.getElementById("short-" + id);
    const fullEl = document.getElementById("full-" + id);
    const btn = document.getElementById("btn-" + id);

    if (!shortEl || !fullEl || !btn) return;

    const open = fullEl.style.display === "block";

    if (open) {

        fullEl.style.display = "none";
        shortEl.style.display = "block";
        btn.innerText = "Lees verder";

    } else {

        fullEl.style.display = "block";
        shortEl.style.display = "none";
        btn.innerText = "Minder tonen";
    }
};

// ==========================================
// LOAD NEWS
// ==========================================

onValue(newsQuery, (snapshot) => {

    const items = [];

    snapshot.forEach((item) => {

        items.push({
            id: item.key,
            ...item.val()
        });

    });

    // nieuwste eerst
    items.sort((a, b) => b.created - a.created);

    if (items.length === 0) {

        newsContainer.innerHTML = `
            <article class="kaart">
                <h3>📰 Geen nieuws</h3>
                <p>Er zijn nog geen nieuwsberichten.</p>
            </article>
        `;
        return;
    }

    let html = "";

    items.forEach(item => {
        html += createCard(item);
    });

    newsContainer.innerHTML = html;

}, (error) => {

    console.error("❌ Nieuws fout:", error);

    newsContainer.innerHTML = `
        <article class="kaart">
            <h3>❌ Fout</h3>
            <p>Nieuws kon niet worden geladen.</p>
        </article>
    `;
});

// ==========================================
// START LOG
// ==========================================

console.log("🧡 HV Novitas NEWS.JS geladen");
