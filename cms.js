import { db } from "./firebase.js";
import {
    ref,
    push,
    get,
    onValue,
    remove
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

console.log("🧡 CMS CLEAN LOADED");

// ================= ELEMENTS =================

// NEWS
const newsForm = document.getElementById("newsForm");
const title = document.getElementById("title");
const text = document.getElementById("text");
const newsImage = document.getElementById("newsImage");
const newsList = document.getElementById("newsList");

// SPONSORS
const sponsorFile = document.getElementById("logo");
const sponsorBtn = document.getElementById("saveSponsor");
const sponsorList = document.getElementById("sponsorList");

// OME JAN
const omeFile = document.getElementById("omejanFile");
const omeBtn = document.getElementById("saveOmejan");
const omeList = document.getElementById("omejanList");


// ================= NEWS =================

newsForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const t = title.value;
    const tx = text.value;
    const file = newsImage?.files?.[0];

    if (!t || !tx) return;

    let imageUrl = "";

    const save = async () => {

        await push(ref(db, "news"), {
            title: t,
            text: tx,
            imageUrl,
            created: Date.now()
        });

        newsForm.reset();
        loadNews();
    };

    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            imageUrl = reader.result;
            save();
        };
        reader.readAsDataURL(file);
    } else {
        save();
    }
});

async function loadNews() {

    const snap = await get(ref(db, "news"));
    const data = snap.val() || {};

    const items = Object.entries(data)
        .map(([id, n]) => ({ id, ...n }))
        .sort((a, b) => (b.created || 0) - (a.created || 0));

    if (!newsList) return;

    newsList.innerHTML = items.map(n => `
        <div class="news-item">

            <b>${n.title || ""}</b><br>

            ${n.imageUrl ? `<img src="${n.imageUrl}" style="width:100%;border-radius:10px;">` : ""}

            <p>${n.text || ""}</p>

            <small>📅 ${new Date(n.created).toLocaleDateString()}</small>

            <br><br>

            <button onclick="deleteNews('${n.id}')">🗑 Delete</button>

        </div>
    `).join("");
}

loadNews();


// ================= SPONSORS =================

sponsorBtn?.addEventListener("click", () => {

    const file = sponsorFile?.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async () => {

        await push(ref(db, "sponsors"), {
            imageUrl: reader.result,
            created: Date.now()
        });

        sponsorFile.value = "";
    };

    reader.readAsDataURL(file);
});

onValue(ref(db, "sponsors"), (snapshot) => {

    const data = snapshot.val() || {};

    if (!sponsorList) return;

    sponsorList.innerHTML = Object.entries(data).map(([id, s]) => `
        <div style="display:inline-block;margin:10px;text-align:center;">
            <img src="${s.imageUrl}" style="height:60px;border-radius:8px;">
            <br>
            <button onclick="deleteSponsor('${id}')">🗑 Delete</button>
        </div>
    `).join("");
});


// ================= OME JAN =================

omeBtn?.addEventListener("click", async () => {

    const file = omeFile?.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "hvnovitas_upload");

    const res = await fetch(
        "https://api.cloudinary.com/v1_1/hwxe3jzg/image/upload",
        {
            method: "POST",
            body: formData
        }
    );

    const data = await res.json();

    if (data.secure_url) {

        await push(ref(db, "omejan"), {
            imageUrl: data.secure_url,
            created: Date.now()
        });

        omeFile.value = "";
    }
});

onValue(ref(db, "omejan"), (snapshot) => {

    const data = snapshot.val() || {};

    if (!omeList) return;

    omeList.innerHTML = Object.entries(data).map(([id, o]) => `
        <div style="display:inline-block;margin:10px;text-align:center;background:#fff;padding:10px;border-radius:10px;">
            <img src="${o.imageUrl}" style="height:70px;border-radius:8px;">
            <br>
            <button onclick="deleteOmeJan('${id}')">🗑 Delete</button>
        </div>
    `).join("");
});


// ================= DELETE =================

window.deleteNews = async (id) => {
    await remove(ref(db, "news/" + id));
    loadNews();
};

window.deleteSponsor = async (id) => {
    await remove(ref(db, "sponsors/" + id));
};

window.deleteOmeJan = async (id) => {
    await remove(ref(db, "omejan/" + id));
};
