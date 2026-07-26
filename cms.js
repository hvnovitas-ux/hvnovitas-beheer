import { db } from "./firebase.js";
import { ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

console.log("🧡 NOVITAS CMS CLEAN LOADED");

// ===============================
// 🧱 NEWS
// ===============================

const newsForm = document.getElementById("newsForm");
const title = document.getElementById("title");
const text = document.getElementById("text");
const image = document.getElementById("newsImage");
const newsList = document.getElementById("newsList");

newsForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    await push(ref(db, "news"), {
        title: title.value,
        text: text.value,
        imageUrl: "",
        created: Date.now()
    });

    newsForm.reset();
});

onValue(ref(db, "news"), (snap) => {
    const data = snap.val() || {};

    const items = Object.entries(data)
        .map(([id, v]) => ({ id, ...v }))
        .sort((a, b) => b.created - a.created);

    newsList.innerHTML = items.length
        ? items.map(n => `
            <div class="card">
                <b>${n.title}</b>
                <p>${n.text}</p>
                <button onclick="deleteNews('${n.id}')">🗑</button>
            </div>
        `).join("")
        : "<p>Geen nieuws</p>";
});

window.deleteNews = (id) =>
    remove(ref(db, "news/" + id));

// ===============================
// 🏆 HIGHLIGHTS
// ===============================

const hlDate = document.getElementById("hlDate");
const hlTitle = document.getElementById("hlTitle");
const hlText = document.getElementById("hlText");
const saveHighlight = document.getElementById("saveHighlight");
const highlightList = document.getElementById("highlightList");

saveHighlight?.addEventListener("click", async () => {

    await push(ref(db, "highlights"), {
        date: hlDate.value,
        title: hlTitle.value,
        text: hlText.value,
        created: Date.now()
    });

    hlTitle.value = "";
    hlText.value = "";
});

onValue(ref(db, "highlights"), (snap) => {
    const data = snap.val() || {};

    const items = Object.entries(data)
        .map(([id, v]) => ({ id, ...v }))
        .sort((a, b) => b.created - a.created);

    highlightList.innerHTML = items.length
        ? items.map(h => `
            <div class="card">
                <b>${h.title}</b>
                <p>${h.text}</p>
                <small>${h.date}</small>
                <button onclick="deleteHighlight('${h.id}')">🗑</button>
            </div>
        `).join("")
        : "<p>Geen highlights</p>";
});

window.deleteHighlight = (id) =>
    remove(ref(db, "highlights/" + id));

// ===============================
// 🧱 CLUB VAN 100
// ===============================

const clubInput = document.getElementById("clubName");
const clubBtn = document.getElementById("saveClub100");
const clubList = document.getElementById("clubList");

clubBtn?.addEventListener("click", async () => {

    await push(ref(db, "club100"), {
        name: clubInput.value,
        created: Date.now()
    });

    clubInput.value = "";
});

onValue(ref(db, "club100"), (snap) => {
    const data = snap.val() || {};

    const items = Object.entries(data)
        .map(([id, v]) => ({ id, ...v }))
        .sort((a, b) => b.created - a.created);

    clubList.innerHTML = items.length
        ? items.map(p => `
            <div class="tile">
                ${p.name}
                <button onclick="deleteClub('${p.id}')">🗑</button>
            </div>
        `).join("")
        : "<p>Geen leden</p>";
});

window.deleteClub = (id) =>
    remove(ref(db, "club100/" + id));

// ===============================
// 🤝 SPONSORS
// ===============================

const sponsorList = document.getElementById("sponsorList");

onValue(ref(db, "sponsors"), (snap) => {
    const data = snap.val() || {};

    const items = Object.entries(data)
        .map(([id, v]) => ({ id, ...v }));

    sponsorList.innerHTML = items.length
        ? items.map(s => `
            <div class="card">
                <img src="${s.imageUrl}">
                <button onclick="deleteSponsor('${s.id}')">🗑</button>
            </div>
        `).join("")
        : "<p>Geen sponsors</p>";
});

window.deleteSponsor = (id) =>
    remove(ref(db, "sponsors/" + id));

// ===============================
// 📸 OME JAN
// ===============================

const omeList = document.getElementById("omejanList");

onValue(ref(db, "omejan"), (snap) => {
    const data = snap.val() || {};

    const items = Object.entries(data)
        .map(([id, v]) => ({ id, ...v }));

    omeList.innerHTML = items.length
        ? items.map(o => `
            <div class="card">
                <img src="${o.imageUrl}">
                <button onclick="deleteOmeJan('${o.id}')">🗑</button>
            </div>
        `).join("")
        : "<p>Geen items</p>";
});

window.deleteOmeJan = (id) =>
    remove(ref(db, "omejan/" + id));
