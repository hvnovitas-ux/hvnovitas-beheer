import { db } from "./firebase.js";
import {
    ref,
    push,
    get,
    onValue,
    remove
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

console.log("🧡 CMS FULL SYSTEM LOADED");

// ================= CLOUDINARY =================

const cloudName = "hwxe3jzg";
const uploadPreset = "hvnovitas_upload";

// ================= NEWS =================

const form = document.getElementById("newsForm");
const title = document.getElementById("title");
const text = document.getElementById("text");
const image = document.getElementById("newsImage");
const list = document.getElementById("newsList");

form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const t = title.value;
    const tx = text.value;
    const file = image?.files?.[0];

    if (!t || !tx) return;

    const save = async (imageUrl = "") => {

        await push(ref(db, "news"), {
            title: t,
            text: tx,
            imageUrl: imageUrl || "",
            created: Date.now()
        });

        form.reset();
        loadNews();
    };

    if (file) {

        const fd = new FormData();
        fd.append("file", file);
        fd.append("upload_preset", uploadPreset);

        const res = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            {
                method: "POST",
                body: fd
            }
        );

        const data = await res.json();
        save(data.secure_url || "");

    } else {
        save("");
    }
});

async function loadNews() {

    const snap = await get(ref(db, "news"));
    const data = snap.val() || {};

    const items = Object.entries(data)
        .map(([id, n]) => ({ id, ...n }))
        .sort((a, b) => (b.created || 0) - (a.created || 0));

    if (!list) return;

    list.innerHTML = items.map(n => `
        <div class="news-item">

            <b>${n.title}</b><br>

            ${n.imageUrl ? `<img src="${n.imageUrl}" style="width:100%;border-radius:10px;">` : ""}

            <p>${n.text}</p>

            <small>
                📅 ${new Date(n.created).toLocaleDateString()}
                🕒 ${new Date(n.created).toLocaleTimeString()}
            </small>

            <br><br>

            <button onclick="deleteNews('${n.id}')">🗑 Delete</button>

        </div>
    `).join("");
}

loadNews();

window.deleteNews = async (id) => {
    await remove(ref(db, "news/" + id));
};

// ================= SPONSORS =================

const sponsorFile = document.getElementById("logo");
const sponsorBtn = document.getElementById("saveSponsor");
const sponsorList = document.getElementById("sponsorList");

sponsorBtn?.addEventListener("click", async () => {

    const file = sponsorFile?.files?.[0];
    if (!file) return;

    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", uploadPreset);

    const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
            method: "POST",
            body: fd
        }
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
        <div style="display:inline-block;margin:10px;text-align:center;">
            <img src="${s.imageUrl}" style="height:60px;border-radius:8px;">
            <br>
            <button onclick="deleteSponsor('${id}')">🗑 Delete</button>
        </div>
    `).join("");
});

window.deleteSponsor = async (id) => {
    await remove(ref(db, "sponsors/" + id));
};

// ================= OME JAN =================

const omeFile = document.getElementById("omejanFile");
const omeBtn = document.getElementById("saveOmejan");
const omeList = document.getElementById("omejanList");

omeBtn?.addEventListener("click", async () => {

    const file = omeFile?.files?.[0];
    if (!file) return;

    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", uploadPreset);

    const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
            method: "POST",
            body: fd
        }
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
        <div style="display:inline-block;margin:10px;text-align:center;">
            <img src="${o.imageUrl}" style="height:70px;border-radius:8px;">
            <br>
            <button onclick="deleteOmeJan('${id}')">🗑 Delete</button>
        </div>
    `).join("");
});

window.deleteOmeJan = async (id) => {
    await remove(ref(db, "omejan/" + id));
};

// ================= 🧡 HIGHLIGHTS (GEFIXT) =================

const hlDate = document.getElementById("hlDate");
const hlTitle = document.getElementById("hlTitle");
const hlText = document.getElementById("hlText");
const hlType = document.getElementById("hlType");
const saveHighlight = document.getElementById("saveHighlight");
const highlightList = document.getElementById("highlightList");

saveHighlight?.addEventListener("click", async () => {

    if (!hlDate?.value || !hlTitle?.value) return;

    await push(ref(db, "highlights"), {
        date: hlDate.value,
        title: hlTitle.value,
        text: hlText.value || "",
        type: hlType.value || "milestone",
        created: Date.now()
    });

    hlTitle.value = "";
    hlText.value = "";
});

function loadHighlights() {

    onValue(ref(db, "highlights"), (snapshot) => {

        const data = snapshot.val() || {};

        const items = Object.entries(data)
            .map(([id, item]) => ({ id, ...item }))
            .sort((a, b) => (b.created || 0) - (a.created || 0));

        if (!highlightList) return;

        highlightList.innerHTML = items.length
            ? items.map(h => `
                <div class="news-item">

                    <b>${h.title}</b><br>

                    <small>📅 ${h.date} | ⭐ ${h.type}</small>

                    <p>${h.text}</p>

                    <button onclick="deleteHighlight('${h.id}')">🗑 Delete</button>

                </div>
            `).join("")
            : "<p>Geen highlights</p>";

    });
}

window.deleteHighlight = async (id) => {
    await remove(ref(db, "highlights/" + id));
};

loadHighlights();
