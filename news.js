import { db } from "./firebase.js";

import {
    ref,
    query,
    orderByChild,
    limitToLast,
    onValue
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

console.log("🧡 NEWS PRO LOADED");

// CONTAINER
const newsContainer = document.getElementById("news");

if (!newsContainer) {
    console.error("❌ #news container niet gevonden");
}

// QUERY (laatste 10, stabieler dan 3)
const newsQuery = query(
    ref(db, "news"),
    orderByChild("created"),
    limitToLast(10)
);

// SAFE TEXT
function escapeHTML(text = "") {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

// CARD BUILDER
function createCard(item) {

    return `
        <article class="kaart">

            <h3>${escapeHTML(item.title || "")}</h3>

            <div class="datum">
                📅 ${item.date || ""} • 🕒 ${item.time || ""}
            </div>

            ${item.image ? `<img src="${item.image}" style="width:100%;border-radius:10px;">` : ""}

            <p>${escapeHTML(item.text || "")}</p>

        </article>
    `;
}

// LOAD DATA
onValue(newsQuery, (snapshot) => {

    const items = [];

    snapshot.forEach(child => {
        items.push({
            id: child.key,
            ...child.val()
        });
    });

    // SORT SAFE
    items.sort((a, b) => (b.created || 0) - (a.created || 0));

    // EMPTY STATE
    if (items.length === 0) {
        newsContainer.innerHTML = `
            <article class="kaart">
                <h3>📰 Geen nieuws</h3>
                <p>Er zijn nog geen berichten.</p>
            </article>
        `;
        return;
    }

    // RENDER
    newsContainer.innerHTML = items.map(createCard).join("");

}, (error) => {

    console.error("❌ NEWS ERROR:", error);

    newsContainer.innerHTML = `
        <article class="kaart">
            <h3>❌ Fout</h3>
            <p>Nieuws kon niet geladen worden.</p>
        </article>
    `;
});
