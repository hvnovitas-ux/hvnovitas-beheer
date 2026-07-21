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

const agendaType = document.getElementById("agendaType");
const agendaDate = document.getElementById("agendaDate");
const agendaTime = document.getElementById("agendaTime");
const agendaTeam1 = document.getElementById("agendaTeam1");
const agendaTeam2 = document.getElementById("agendaTeam2");
const agendaBulk = document.getElementById("agendaBulk");

const repeatFrom = document.getElementById("repeatFrom");
const repeatUntil = document.getElementById("repeatUntil");
const repeatTime = document.getElementById("repeatTime");
const repeatTitle = document.getElementById("repeatTitle");
const repeatExtraTitle = document.getElementById("repeatExtraTitle");

const agendaList = document.getElementById("agendaList");

// =====================================================
// CLOUDINARY SETTINGS (OME JAN)
// =====================================================

const cloudName = "JOUW_CLOUD_NAME";
const uploadPreset = "hvnovitas_upload";

// =====================================================
// NEWS
// =====================================================

let editingNewsId = null;

newsForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!title.value || !text.value) return;

    if (editingNewsId) {

        await update(ref(db, "news/" + editingNewsId), {
            title: title.value,
            text: text.value
        });

        editingNewsId = null;

    } else {

        await push(ref(db, "news"), {
            title: title.value,
            text: text.value,
            created: Date.now()
        });
    }

    newsForm.reset();
});

onValue(ref(db, "news"), (snapshot) => {

    const data = snapshot.val();
    if (!newsList) return;

    if (!data) {
        newsList.innerHTML = "<p>Geen nieuws</p>";
        return;
    }

    const items = Object.entries(data).reverse();

    newsList.innerHTML = items.map(([id, n]) => `
        <div class="news-item">

            <b>${n.title}</b>
            <p>${n.text}</p>

            <button onclick="editNews('${id}', \`${n.title}\`, \`${n.text}\`)">Edit</button>
            <button onclick="deleteNews('${id}')">Delete</button>

        </div>
    `).join("");
});

window.editNews = (id, t, txt) => {
    title.value = t;
    text.value = txt;
    editingNewsId = id;
};

window.deleteNews = async (id) => {
    await remove(ref(db, "news/" + id));
};

// =====================================================
// SPONSORS (FIREBASE IMAGE)
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
        sponsorList.innerHTML = "<p>Geen sponsors</p>";
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
// OME JAN (CLOUDINARY UPLOAD)
// =====================================================

omeBtn?.addEventListener("click", async () => {

    const file = omeFile.files[0];

    if (!file) {
        alert("Kies een foto");
        return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
            method: "POST",
            body: formData
        }
    );

    const data = await res.json();

    if (!data.secure_url) {
        alert("Upload mislukt");
        console.error(data);
        return;
    }

    await push(ref(db, "omejan"), {
        imageUrl: data.secure_url,
        created: Date.now()
    });

    omeFile.value = "";
});

// =====================================================
// OME JAN LIST
// =====================================================

onValue(ref(db, "omejan"), (snapshot) => {

    const data = snapshot.val();
    if (!omeList) return;

    if (!data) {
        omeList.innerHTML = "<p>Geen foto's</p>";
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

    if (!confirm("Foto verwijderen?")) return;

    await remove(ref(db, "omejan/" + id));
};

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

document.getElementById("importAgendaBulk")?.addEventListener("click", async () => {

    const lines = agendaBulk.value.split("\n");

    for (let line of lines) {

        if (!line.trim()) continue;

        const p = line.split(" ");

        await push(ref(db, "agenda"), {
            type: "match",
            raw: line,
            date: p[0] + " " + p[1],
            time: p[2],
            team1: p[3] || "",
            team2: p[4] || "",
            created: Date.now()
        });
    }
});

document.getElementById("generateRepeat")?.addEventListener("click", async () => {

    const start = new Date(repeatFrom.value);
    const end = new Date(repeatUntil.value);

    let current = new Date(start);

    while (current <= end) {

        if (current.getDay() === 2) {

            await push(ref(db, "agenda"), {
                type: "training",
                date: current.toDateString(),
                time: repeatTime.value,
                team1: repeatTitle.value,
                titleExtra: repeatExtraTitle.value,
                created: Date.now()
            });
        }

        current.setDate(current.getDate() + 1);
    }
});

// =====================================================
// AGENDA LIST
// =====================================================

onValue(ref(db, "agenda"), (snapshot) => {

    const data = snapshot.val();
    if (!agendaList) return;

    if (!data) {
        agendaList.innerHTML = "<p>Geen agenda</p>";
        return;
    }

    const items = Object.entries(data);

    agendaList.innerHTML = items.map(([id, a]) => `
        <div class="news-item">

            <b>${a.date} - ${a.time || ""}</b><br>
            ${a.team1 || ""} ${a.team2 || ""}<br>

            <button onclick="deleteAgenda('${id}')">Delete</button>

        </div>
    `).join("");
});

window.deleteAgenda = async (id) => {
    await remove(ref(db, "agenda/" + id));
};
