import { db } from "./firebase.js";
import {
    ref,
    push,
    get,
    onValue,
    remove
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

console.log("🧡 HV NOVITAS CMS LOADED");

// =====================================================
// ELEMENTS
// =====================================================

const newsList = document.getElementById("newsList");

const sponsorFile = document.getElementById("logo");
const sponsorBtn = document.getElementById("saveSponsor");
const sponsorList = document.getElementById("sponsorList");

const omeFile = document.getElementById("omejanFile");
const omeBtn = document.getElementById("saveOmejan");
const omeList = document.getElementById("omejanList");

// =====================================================
// NEWS
// =====================================================

async function loadNews() {

    const snap = await get(ref(db, "news"));
    const data = snap.val();

    if (!newsList) return;

    if (!data) {
        newsList.innerHTML = "Geen nieuws";
        return;
    }

    const items = Object.entries(data).reverse();

    newsList.innerHTML = items.map(([id, n]) => `
        <div class="news-item">
            <b>${n.title}</b>
            <p>${n.text}</p>
            <button onclick="deleteNews('${id}')">Delete</button>
        </div>
    `).join("");
}

loadNews();

// =====================================================
// SPONSORS
// =====================================================

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

    const data = snapshot.val();

    if (!sponsorList) return;

    if (!data) {
        sponsorList.innerHTML = "Geen sponsors";
        return;
    }

    sponsorList.innerHTML = Object.entries(data).map(([id, s]) => `
        <div style="display:inline-block;margin:10px;text-align:center;">
            <img src="${s.imageUrl}" style="height:60px;">
            <br>
            <button onclick="deleteSponsor('${id}')">Delete</button>
        </div>
    `).join("");
});

// =====================================================
// OME JAN
// =====================================================

omeBtn?.addEventListener("click", async () => {

    const file = omeFile?.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "hvnovitas_upload");

    try {

        const res = await fetch(
            "https://api.cloudinary.com/v1_1/hwxe3jzg/image/upload",
            {
                method: "POST",
                body: formData
            }
        );

        const data = await res.json();

        if (!res.ok || !data.secure_url) return;

        await push(ref(db, "omejan"), {
            imageUrl: data.secure_url,
            created: Date.now()
        });

        omeFile.value = "";

    } catch (err) {
        console.error(err);
    }
});

onValue(ref(db, "omejan"), (snapshot) => {

    const data = snapshot.val();

    if (!omeList) return;

    if (!data) {
        omeList.innerHTML = "Geen foto's";
        return;
    }

    omeList.innerHTML = Object.entries(data).map(([id, o]) => `
        <div style="display:inline-block;margin:10px;text-align:center;background:#fff;padding:10px;border-radius:10px;">
            <img src="${o.imageUrl}" style="height:70px;border-radius:8px;">
            <br>
            <button onclick="deleteOmeJan('${id}')">Delete</button>
        </div>
    `).join("");
});

// =====================================================
// DELETE FUNCTIONS
// =====================================================

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
