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
// QUERY (laatste 3 berichten)
// ==========================================

const newsQuery = query(
    ref(db, "news"),
    orderByChild("created"),
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

// ==========================================
// CARD BUILDER
// ==========================================

function createCard(item) {

    const textValue = item.text || "";

    const shortText = textValue.length > 150
        ? textValue.substring(0, 150) + "..."
        : textValue;

    return `
<article class="kaart">

    <h3>${escapeHTML(item.title || "")}</h3>

    <div class="datum">
        📅 ${item.date || ""} &nbsp;&nbsp;
        🕒 ${item.time || ""}
    </div>

    ${item.image ? `<img src="${item.image}" style="width:100%;border-radius:10px;">` : ""}

    <p>${escapeHTML(shortText)}</p>

</article>
`;
}

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

console.log("🧡 HV Novitas NEWS.JS REBUILD OK");
