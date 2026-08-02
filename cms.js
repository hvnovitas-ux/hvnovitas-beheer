import { db } from "./firebase.js";
import {
    ref,
    push,
    onValue,
    remove
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

console.log("🔥 CMS CORE LOADED");

// =====================
// 🧱 CLUB100
// =====================

document.getElementById("saveClub100")?.addEventListener("click", async () => {

    const name = document.getElementById("clubName")?.value;
    if (!name) return;

    await push(ref(db, "club100"), {
        name,
        created: Date.now()
    });

    document.getElementById("clubName").value = "";
});

onValue(ref(db, "club100"), snap => {

    const list = document.getElementById("clubList");
    if (!list) return;

    const data = snap.val() || {};

    list.innerHTML = Object.entries(data).map(([id, v]) => `
        <div class="tile">
            <span>${v.name || ""}</span>
            <button onclick="del('club100','${id}')">🗑</button>
        </div>
    `).join("");
});

// =====================
// 🏆 HIGHLIGHTS
// =====================

document.getElementById("saveHighlight")?.addEventListener("click", async () => {

    await push(ref(db, "highlights"), {
        date: document.getElementById("hlDate")?.value,
        title: document.getElementById("hlTitle")?.value,
        text: document.getElementById("hlText")?.value,
        created: Date.now()
    });
});

onValue(ref(db, "highlights"), snap => {

    const list = document.getElementById("highlightList");
    if (!list) return;

    const data = snap.val() || {};

    list.innerHTML = Object.entries(data).map(([id, v]) => `
        <div class="card">
            <b>${v.title || ""}</b>
            <p>${v.text || ""}</p>
            <small>${v.date || ""}</small>
            <button onclick="del('highlights','${id}')">🗑</button>
        </div>
    `).join("");
});

// =====================
// 📰 NEWS
// =====================

document.getElementById("saveNews")?.addEventListener("click", async () => {

    const file = document.getElementById("newsImage")?.files[0];
    let url = "";

    if (file) {
        const form = new FormData();
        form.append("file", file);
        form.append("upload_preset", "hvnovitas_upload");

        const res = await fetch(
            "https://api.cloudinary.com/v1_1/hwxe3jzg/image/upload",
            { method: "POST", body: form }
        );

        const data = await res.json();
        url = data.secure_url || "";
    }

    await push(ref(db, "news"), {
        title: document.getElementById("newsTitle")?.value,
        text: document.getElementById("newsText")?.value,
        imageUrl: url,
        created: Date.now()
    });
});

onValue(ref(db, "news"), snap => {

    const list = document.getElementById("newsList");
    if (!list) return;

    const data = snap.val() || {};

    list.innerHTML = Object.entries(data).map(([id, v]) => `
        <div class="card">
            <b>${v.title || ""}</b>
            <p>${v.text || ""}</p>
            ${v.imageUrl ? `<img src="${v.imageUrl}">` : ""}
            <button onclick="del('news','${id}')">🗑</button>
        </div>
    `).join("");
});

// =====================
// 🤝 SPONSORS
// =====================

document.getElementById("saveSponsor")?.addEventListener("click", async () => {

    const file = document.getElementById("sponsorImage")?.files[0];
    if (!file) return;

    const form = new FormData();
    form.append("file", file);
    form.append("upload_preset", "hvnovitas_upload");

    const res = await fetch(
        "https://api.cloudinary.com/v1_1/hwxe3jzg/image/upload",
        { method: "POST", body: form }
    );

    const data = await res.json();

    await push(ref(db, "sponsors"), {
        imageUrl: data.secure_url || "",
        created: Date.now()
    });
});

onValue(ref(db, "sponsors"), snap => {

    const list = document.getElementById("sponsorList");
    if (!list) return;

    const data = snap.val() || {};

    list.innerHTML = Object.entries(data).map(([id, v]) => `
        <div class="card">
            ${v.imageUrl ? `<img src="${v.imageUrl}">` : ""}
            <button onclick="del('sponsors','${id}')">🗑</button>
        </div>
    `).join("");
});

// =====================
// 📸 OME JAN
// =====================

document.getElementById("saveOmejan")?.addEventListener("click", async () => {

    const file = document.getElementById("omejanImage")?.files[0];
    if (!file) return;

    const form = new FormData();
    form.append("file", file);
    form.append("upload_preset", "hvnovitas_upload");

    const res = await fetch(
        "https://api.cloudinary.com/v1_1/hwxe3jzg/image/upload",
        { method: "POST", body: form }
    );

    const data = await res.json();

    await push(ref(db, "omejan"), {
        imageUrl: data.secure_url || "",
        created: Date.now()
    });
});

onValue(ref(db, "omejan"), snap => {

    const list = document.getElementById("omejanList");
    if (!list) return;

    const data = snap.val() || {};

    list.innerHTML = Object.entries(data).map(([id, v]) => `
        <div class="card">
            ${v.imageUrl ? `<img src="${v.imageUrl}">` : ""}
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
