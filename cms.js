import { db } from "./firebase.js";
import {
    ref,
    push,
    onValue,
    remove,
    update
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

console.log("🧡 HV NOVITAS CMS LOADED");

// =====================================================
// ELEMENTS
// =====================================================

const newsForm = document.getElementById("newsForm");
const title = document.getElementById("title");
const text = document.getElementById("text");
const newsList = document.getElementById("newsList");

const sponsorFile = document.getElementById("logo");
const sponsorBtn = document.getElementById("saveSponsor");
const sponsorList = document.getElementById("sponsorList");

const omeFile = document.getElementById("omejanFile");
const omeBtn = document.getElementById("saveOmejan");
const omeList = document.getElementById("omejanList");

// =====================================================
// CLOUDINARY (OME JAN)
// =====================================================

const cloudName = "JOUW_CLOUD_NAME"; 
const uploadPreset = "hvnovitas_upload";

// =====================================================
// NEWS
// =====================================================

newsForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!title.value || !text.value) return;

    await push(ref(db, "news"), {
        title: title.value,
        text: text.value,
        created: Date.now()
    });

    newsForm.reset();
});

onValue(ref(db, "news"), (snapshot) => {

    const data = snapshot.val();
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
});

window.deleteNews = async (id) => {
    await remove(ref(db, "news/" + id));
};

// =====================================================
// SPONSORS (FIREBASE BASE64)
// =====================================================

sponsorBtn?.addEventListener("click", () => {

    const file = sponsorFile.files[0];
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

    const items = Object.entries(data);

    sponsorList.innerHTML = items.map(([id, s]) => `
        <div style="display:inline-block;margin:10px;">
            <img src="${s.imageUrl}" style="height:60px;">
            <br>
            <button onclick="deleteSponsor('${id}')">Delete</button>
        </div>
    `).join("");
});

window.deleteSponsor = async (id) => {
    await remove(ref(db, "sponsors/" + id));
};

// =====================================================
// OME JAN (CLOUDINARY FIX + ERROR DEBUG)
// =====================================================

omeBtn?.addEventListener("click", async () => {

    const file = omeFile.files[0];

    if (!file) {
        alert("Kies een foto");
        return;
    }

    console.log("📸 Upload gestart:", file.name);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    try {

        const res = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            {
                method: "POST",
                body: formData
            }
        );

        const data = await res.json();

        console.log("☁️ Cloudinary response:", data);

        if (!res.ok) {
            console.error("❌ HTTP ERROR:", data);
            alert("Upload mislukt (HTTP error)");
            return;
        }

        if (!data.secure_url) {
            console.error("❌ NO URL:", data);
            alert("Upload mislukt (geen URL)");
            return;
        }

        await push(ref(db, "omejan"), {
            imageUrl: data.secure_url,
            created: Date.now()
        });

        console.log("✅ Upload OK");

        omeFile.value = "";

    } catch (err) {
        console.error("❌ NETWORK ERROR:", err);
        alert("Netwerk fout");
    }
});

// =====================================================
// OME JAN LIST
// =====================================================

onValue(ref(db, "omejan"), (snapshot) => {

    const data = snapshot.val();
    if (!omeList) return;

    if (!data) {
        omeList.innerHTML = "Geen foto's";
        return;
    }

    const items = Object.entries(data);

    omeList.innerHTML = items.map(([id, o]) => `
        <div style="display:inline-block;margin:10px;text-align:center;">
            <img src="${o.imageUrl}" style="height:80px;border-radius:8px;">
            <br>
            <button onclick="deleteOmeJan('${id}')">Delete</button>
        </div>
    `).join("");
});

window.deleteOmeJan = async (id) => {
    await remove(ref(db, "omejan/" + id));
};
