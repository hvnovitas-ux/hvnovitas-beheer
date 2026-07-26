import { db } from "./firebase.js";
import {
    ref,
    push,
    onValue,
    remove
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

console.log("🧡 NOVITAS CMS LOADED");

// =====================================================
// 🔥 UNIVERSELE RENDER HELPER (BELANGRIJK)
// =====================================================

function renderGrid(listElement, items, templateFn, emptyText) {
    if (!listElement) return;

    listElement.innerHTML = items.length
        ? items.map(templateFn).join("")
        : `<p style="opacity:0.7"> ${emptyText} </p>`;
}

// =====================================================
// 📰 NEWS
// =====================================================

const newsForm = document.getElementById("newsForm");
const title = document.getElementById("title");
const text = document.getElementById("text");
const image = document.getElementById("newsImage");
const newsList = document.getElementById("newsList");

newsForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const file = image?.files?.[0];

    const save = async (imageUrl = "") => {
        await push(ref(db, "news"), {
            title: title.value,
            text: text.value,
            imageUrl,
            created: Date.now()
        });

        newsForm.reset();
    };

    if (file) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("upload_preset", "hvnovitas_upload");

        const res = await fetch(
            "https://api.cloudinary.com/v1_1/hwxe3jzg/image/upload",
            { method: "POST", body: fd }
        );

        const data = await res.json();
        save(data.secure_url || "");
    } else {
        save("");
    }
});

onValue(ref(db, "news"), (snap) => {

    const data = snap.val() || {};
    const items = Object.entries(data)
        .map(([id, v]) => ({ id, ...v }))
        .sort((a, b) => (b.created || 0) - (a.created || 0));

    renderGrid(newsList, items, (n) => `
        <div class="card">
            <b>${n.title}</b>
            ${n.imageUrl ? `<img src="${n.imageUrl}">` : ""}
            <p>${n.text}</p>
            <button onclick="deleteNews('${n.id}')">🗑</button>
        </div>
    `, "Geen nieuws");
});

window.deleteNews = (id) =>
    remove(ref(db, "news/" + id));

// =====================================================
// 🏆 HIGHLIGHTS
// =====================================================

const hlDate = document.getElementById("hlDate");
const hlTitle = document.getElementById("hlTitle");
const hlText = document.getElementById("hlText");
const saveHighlight = document.getElementById("saveHighlight");
const highlightList = document.getElementById("highlightList");

saveHighlight?.addEventListener("click", async () => {

    if (!hlTitle.value) return;

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
        .sort((a, b) => (b.created || 0) - (a.created || 0));

    renderGrid(highlightList, items, (h) => `
        <div class="card">
            <b>${h.title}</b>
            <p>${h.text}</p>
            <small>${h.date}</small>
            <button onclick="deleteHighlight('${h.id}')">🗑</button>
        </div>
    `, "Geen highlights");
});

window.deleteHighlight = (id) =>
    remove(ref(db, "highlights/" + id));

// =====================================================
// 🧱 CLUB VAN 100 (FIXED GRID PROOF)
// =====================================================

const clubInput = document.getElementById("clubName");
const clubBtn = document.getElementById("saveClub100");
const clubList = document.getElementById("clubList");

clubBtn?.addEventListener("click", async () => {

    if (!clubInput.value) return;

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
        .sort((a, b) => (b.created || 0) - (a.created || 0));

    renderGrid(clubList, items, (p) => {

        const parts = (p.name || "").split(" ");

        return `
            <div class="tile">
                <div>${parts[0] || ""}</div>
                <div>${parts.slice(1).join(" ")}</div>
                <button onclick="deleteClub('${p.id}')">🗑</button>
            </div>
        `;
    }, "Geen leden");
});

window.deleteClub = (id) =>
    remove(ref(db, "club100/" + id));

// =====================================================
// 🤝 SPONSORS
// =====================================================

const sponsorFile = document.getElementById("logo");
const sponsorBtn = document.getElementById("saveSponsor");
const sponsorList = document.getElementById("sponsorList");

sponsorBtn?.addEventListener("click", async () => {

    const file = sponsorFile?.files?.[0];
    if (!file) return;

    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", "hvnovitas_upload");

    const res = await fetch(
        "https://api.cloudinary.com/v1_1/hwxe3jzg/image/upload",
        { method: "POST", body: fd }
    );

    const data = await res.json();

    await push(ref(db, "sponsors"), {
        imageUrl: data.secure_url,
        created: Date.now()
    });

    sponsorFile.value = "";
});

onValue(ref(db, "sponsors"), (snap) => {

    const data = snap.val() || {};
    const items = Object.entries(data).map(([id, v]) => ({ id, ...v }));

    renderGrid(sponsorList, items, (s) => `
        <div class="card">
            <img src="${s.imageUrl}">
            <button onclick="deleteSponsor('${s.id}')">🗑</button>
        </div>
    `, "Geen sponsors");
});

window.deleteSponsor = (id) =>
    remove(ref(db, "sponsors/" + id));

// =====================================================
// 📸 OME JAN
// =====================================================

const omeFile = document.getElementById("omejanFile");
const omeBtn = document.getElementById("saveOmejan");
const omeList = document.getElementById("omejanList");

omeBtn?.addEventListener("click", async () => {

    const file = omeFile?.files?.[0];
    if (!file) return;

    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", "hvnovitas_upload");

    const res = await fetch(
        "https://api.cloudinary.com/v1_1/hwxe3jzg/image/upload",
        { method: "POST", body: fd }
    );

    const data = await res.json();

    await push(ref(db, "omejan"), {
        imageUrl: data.secure_url,
        created: Date.now()
    });

    omeFile.value = "";
});

onValue(ref(db, "omejan"), (snap) => {

    const data = snap.val() || {};
    const items = Object.entries(data).map(([id, v]) => ({ id, ...v }));

    renderGrid(omeList, items, (o) => `
        <div class="card">
            <img src="${o.imageUrl}">
            <button onclick="deleteOmeJan('${o.id}')">🗑</button>
        </div>
    `, "Geen items");
});

window.deleteOmeJan = (id) =>
    remove(ref(db, "omejan/" + id));
