import { db } from "./firebase.js";
import {
    ref,
    push,
    onValue,
    remove
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

console.log("CMS FULL LOADED");

// =====================
// 🧱 CLUB100
// =====================

const clubName = document.getElementById("clubName");
document.getElementById("saveClub100")?.addEventListener("click", async () => {

    if (!clubName.value) return;

    await push(ref(db, "club100"), {
        name: clubName.value,
        created: Date.now()
    });

    clubName.value = "";
});

const clubList = document.getElementById("clubList");

onValue(ref(db, "club100"), (snap) => {
    const data = snap.val() || {};

    clubList.innerHTML = Object.entries(data).map(([id, p]) => `
        <div class="tile">
            <div>${p.name}</div>
            <button onclick="del('club100','${id}')">🗑</button>
        </div>
    `).join("");
});

// =====================
// 🏆 HIGHLIGHTS
// =====================

const hlTitle = document.getElementById("hlTitle");
const hlText = document.getElementById("hlText");

document.getElementById("saveHighlight")?.addEventListener("click", async () => {

    if (!hlTitle.value) return;

    await push(ref(db, "highlights"), {
        title: hlTitle.value,
        text: hlText.value,
        created: Date.now()
    });

    hlTitle.value = "";
    hlText.value = "";
});

const highlightList = document.getElementById("highlightList");

onValue(ref(db, "highlights"), (snap) => {
    const data = snap.val() || {};

    highlightList.innerHTML = Object.entries(data).map(([id, h]) => `
        <div class="card">
            <b>${h.title}</b>
            <p>${h.text}</p>
            <button onclick="del('highlights','${id}')">🗑</button>
        </div>
    `).join("");
});

// =====================
// 📰 NEWS
// =====================

const newsTitle = document.getElementById("newsTitle");
const newsText = document.getElementById("newsText");

document.getElementById("saveNews")?.addEventListener("click", async () => {

    if (!newsTitle.value) return;

    await push(ref(db, "news"), {
        title: newsTitle.value,
        text: newsText.value,
        created: Date.now()
    });

    newsTitle.value = "";
    newsText.value = "";
});

const newsList = document.getElementById("newsList");

onValue(ref(db, "news"), (snap) => {
    const data = snap.val() || {};

    newsList.innerHTML = Object.entries(data).map(([id, n]) => `
        <div class="card">
            <b>${n.title}</b>
            <p>${n.text}</p>
            ${n.imageUrl ? `<img src="${n.imageUrl}">` : ""}
            <button onclick="del('news','${id}')">🗑</button>
        </div>
    `).join("");
});

// =====================
// 🤝 SPONSORS
// =====================

const sponsorList = document.getElementById("sponsorList");

onValue(ref(db, "sponsors"), (snap) => {
    const data = snap.val() || {};

    sponsorList.innerHTML = Object.entries(data).map(([id, s]) => `
        <div class="card">
            <img src="${s.imageUrl}">
            <button onclick="del('sponsors','${id}')">🗑</button>
        </div>
    `).join("");
});

// =====================
// 📸 OME JAN
// =====================

const omeList = document.getElementById("omejanList");

onValue(ref(db, "omejan"), (snap) => {
    const data = snap.val() || {};

    omeList.innerHTML = Object.entries(data).map(([id, o]) => `
        <div class="card">
            <img src="${o.imageUrl}">
            <button onclick="del('omejan','${id}')">🗑</button>
        </div>
    `).join("");
});

// =====================
// 🧹 DELETE
// =====================

window.del = (path, id) => {
    remove(ref(db, path + "/" + id));
};
