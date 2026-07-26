import { db } from "./firebase.js";
import {
    ref,
    push,
    onValue,
    remove
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

console.log("🧡 NOVITAS CMS FULL SYSTEM LOADED");

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

    const t = title.value;
    const tx = text.value;
    const file = image?.files?.[0];

    if (!t || !tx) return;

    const save = async (imageUrl = "") => {
        await push(ref(db, "news"), {
            title: t,
            text: tx,
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

onValue(ref(db, "news"), (snapshot) => {

    const data = snapshot.val() || {};

    const items = Object.entries(data)
        .map(([id, item]) => ({ id, ...item }))
        .sort((a, b) => (b.created || 0) - (a.created || 0));

    newsList.innerHTML = items.length
        ? items.map(n => `
            <div class="card news">
                <b>${n.title}</b>

                ${n.imageUrl ? `<img src="${n.imageUrl}">` : ""}

                <p>${n.text}</p>

                <small>
                    📅 ${new Date(n.created).toLocaleDateString()}
                </small>

                <button onclick="deleteNews('${n.id}')">🗑</button>
            </div>
        `).join("")
        : "<p>Geen nieuws</p>";
});

window.deleteNews = async (id) => {
    await remove(ref(db, "news/" + id));
};

// =====================================================
// 🏆 HIGHLIGHTS
// =====================================================

const hlDate = document.getElementById("hlDate");
const hlTitle = document.getElementById("hlTitle");
const hlText = document.getElementById("hlText");
const saveHighlight = document.getElementById("saveHighlight");
const highlightList = document.getElementById("highlightList");

saveHighlight?.addEventListener("click", async () => {

    if (!hlDate?.value || !hlTitle?.value) return;

    await push(ref(db, "highlights"), {
        date: hlDate.value,
        title: hlTitle.value,
        text: hlText.value || "",
        created: Date.now()
    });

    hlTitle.value = "";
    hlText.value = "";
});

onValue(ref(db, "highlights"), (snapshot) => {

    const data = snapshot.val() || {};

    const items = Object.entries(data)
        .map(([id, item]) => ({ id, ...item }))
        .sort((a, b) => (b.created || 0) - (a.created || 0));

    highlightList.innerHTML = items.length
        ? items.map(h => `
            <div class="card highlight">
                <b>${h.title}</b>
                <p>${h.text}</p>
                <small>${h.date}</small>

                <button onclick="deleteHighlight('${h.id}')">🗑</button>
            </div>
        `).join("")
        : "<p>Geen highlights</p>";
});

window.deleteHighlight = async (id) => {
    await remove(ref(db, "highlights/" + id));
};

// =====================================================
// 🧱 CLUB VAN 100
// =====================================================

const clubInput = document.getElementById("clubName");
const clubBtn = document.getElementById("saveClub100");
const clubList = document.getElementById("clubList");

clubBtn?.addEventListener("click", async () => {

    const name = clubInput.value;
    if (!name) return;

    await push(ref(db, "club100"), {
        name,
        created: Date.now()
    });

    clubInput.value = "";
});

onValue(ref(db, "club100"), (snapshot) => {

    const data = snapshot.val() || {};

    const items = Object.entries(data)
        .map(([id, item]) => ({ id, ...item }))
        .sort((a, b) => (b.created || 0) - (a.created || 0));

    clubList.innerHTML = items.length
        ? items.map(p => `
            <div class="tile">
                ${p.name}
                <button onclick="deleteClub('${p.id}')">🗑</button>
            </div>
        `).join("")
        : "<p>Geen leden</p>";
});

window.deleteClub = async (id) => {
    await remove(ref(db, "club100/" + id));
};

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

onValue(ref(db, "sponsors"), (snapshot) => {

    const data = snapshot.val() || {};

    sponsorList.innerHTML = Object.entries(data).map(([id, s]) => `
        <div class="card sponsor">
            <img src="${s.imageUrl}">
            <button onclick="deleteSponsor('${id}')">🗑</button>
        </div>
    `).join("");
});

window.deleteSponsor = async (id) => {
    await remove(ref(db, "sponsors/" + id));
};

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

onValue(ref(db, "omejan"), (snapshot) => {

    const data = snapshot.val() || {};

    omeList.innerHTML = Object.entries(data).map(([id, o]) => `
        <div class="card ome">
            <img src="${o.imageUrl}">
            <button onclick="deleteOmeJan('${id}')">🗑</button>
        </div>
    `).join("");
});

window.deleteOmeJan = async (id) => {
    await remove(ref(db, "omejan/" + id));
};
