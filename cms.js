import { db } from "./firebase.js";
import {
    ref,
    push,
    onValue,
    remove
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

console.log("CMS LOADED");

// --------------------
// NEWS
// --------------------

const newsList = document.getElementById("newsList");

onValue(ref(db, "news"), (snap) => {

    const data = snap.val() || {};

    const items = Object.entries(data)
        .map(([id, v]) => ({ id, ...v }))
        .sort((a, b) => b.created - a.created);

    newsList.innerHTML = items.map(n => `
        <div class="card">
            <b>${n.title}</b>
            <p>${n.text}</p>
            ${n.imageUrl ? `<img src="${n.imageUrl}">` : ""}
            <button onclick="del('news','${n.id}')">🗑</button>
        </div>
    `).join("");
});

// --------------------
// HIGHLIGHTS
// --------------------

const highlightList = document.getElementById("highlightList");

onValue(ref(db, "highlights"), (snap) => {

    const data = snap.val() || {};

    const items = Object.entries(data)
        .map(([id, v]) => ({ id, ...v }))
        .sort((a, b) => b.created - a.created);

    highlightList.innerHTML = items.map(h => `
        <div class="card">
            <b>${h.title}</b>
            <p>${h.text}</p>
            <small>${h.date || ""}</small>
            <button onclick="del('highlights','${h.id}')">🗑</button>
        </div>
    `).join("");
});

// --------------------
// CLUB100
// --------------------

const clubList = document.getElementById("clubList");

onValue(ref(db, "club100"), (snap) => {

    const data = snap.val() || {};

    const items = Object.entries(data);

    clubList.innerHTML = items.map(([id, p]) => `
        <div class="tile">
            ${p.name}
            <button onclick="del('club100','${id}')">🗑</button>
        </div>
    `).join("");
});

// --------------------
// SPONSORS + OME JAN
// --------------------

const sponsorList = document.getElementById("sponsorList");
const omeList = document.getElementById("omejanList");

onValue(ref(db, "sponsors"), (snap) => {
    const data = snap.val() || {};

    sponsorList.innerHTML = Object.entries(data).map(([id, s]) => `
        <div class="card">
            <img src="${s.imageUrl}">
            <button onclick="del('sponsors','${id}')">🗑</button>
        </div>
    `).join("");
});

onValue(ref(db, "omejan"), (snap) => {
    const data = snap.val() || {};

    omeList.innerHTML = Object.entries(data).map(([id, o]) => `
        <div class="card">
            <img src="${o.imageUrl}">
            <button onclick="del('omejan','${id}')">🗑</button>
        </div>
    `).join("");
});

// --------------------
// DELETE FIX
// --------------------

window.del = (path, id) => {
    remove(ref(db, path + "/" + id));
};
