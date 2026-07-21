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

const agendaType = document.getElementById("agendaType");
const agendaDate = document.getElementById("agendaDate");
const agendaTime = document.getElementById("agendaTime");
const agendaTeam1 = document.getElementById("agendaTeam1");
const agendaTeam2 = document.getElementById("agendaTeam2");

// =====================================================
// CLOUDINARY
// =====================================================

const cloudName = "hwxe3jzg";
const uploadPreset = "hvnovitas_upload";

// =====================================================
// NEWS (NO LIVE CONNECTION)
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
        <div style="display:inline-block;margin:10px;">
            <img src="${s.imageUrl}" style="height:60px;">
            <br>
            <button onclick="deleteSponsor('${id}')">Delete</button>
        </div>
    `).join("");
});

// =====================================================
// OME JAN (CLOUDINARY)
// =====================================================

omeBtn?.addEventListener("click", async () => {

    const file = omeFile?.files?.[0];
    if (!file) return;

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

        if (!res.ok || !data.secure_url) {
            console.error("UPLOAD ERROR:", data);
            return;
        }

        await push(ref(db, "omejan"), {
            imageUrl: data.secure_url,
            created: Date.now()
        });

        omeFile.value = "";

    } catch (err) {
        console.error(err);
    }
});

// =====================================================
// AGENDA
// =====================================================

document.getElementById("saveAgenda")?.addEventListener("click", async () => {

    await push(ref(db, "agenda"), {
        type: agendaType.value,
        date: agendaDate.value,
        time: agendaTime.value,
        team1: agendaTeam1.value,
        team2: agendaTeam2.value,
        created: Date.now()
    });
});

// =====================================================
// DELETE FUNCTIONS (FIXED - NO WINDOW BUGS)
// =====================================================

async function deleteNews(id) {
    await remove(ref(db, "news/" + id));
    loadNews();
}

async function deleteSponsor(id) {
    await remove(ref(db, "sponsors/" + id));
}

async function deleteOmeJan(id) {
    await remove(ref(db, "omejan/" + id));
}

// expose for HTML onclick
window.deleteNews = deleteNews;
window.deleteSponsor = deleteSponsor;
window.deleteOmeJan = deleteOmeJan;
