console.log("🔥 CMS JS IS GELADEN");
import { db } from "./firebase.js";
import { uploadFile } from "./drive.js";

import {
    ref,
    push,
    update,
    remove,
    get
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

/* ==========================================
   CONFIG
========================================== */

const NEWS_PATH = "news";

/* ==========================================
   DOM
========================================== */

const form = document.getElementById("newsForm");
const titleInput = document.getElementById("title");
const textInput = document.getElementById("text");
const imageInput = document.getElementById("image");
const newsList = document.getElementById("newsList");
const submitButton = document.getElementById("submitButton");
const cancelButton = document.getElementById("cancelButton");

/* ==========================================
   STATE
========================================== */

let editingId = null;
let currentImage = "";
let currentImagePath = "";

/* ==========================================
   DATUM
========================================== */

function createDateTime() {

    const now = new Date();

    return {
        created: now.getTime(),
        date: now.toLocaleDateString("nl-NL"),
        time: now.toLocaleTimeString("nl-NL", {
            hour: "2-digit",
            minute: "2-digit"
        })
    };
}

/* ==========================================
   SAFE TEXT
========================================== */

function escapeHTML(text = "") {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

/* ==========================================
   RESET FORM
========================================== */

function resetForm() {

    form.reset();
    editingId = null;
    currentImage = "";
    currentImagePath = "";

    submitButton.textContent = "Publiceren";
    cancelButton.style.display = "none";
}

/* ==========================================
   UPLOAD + SAVE
========================================== */

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const title = titleInput.value.trim();
    const text = textInput.value.trim();
    const file = imageInput.files[0];

    if (!title || !text) {
        alert("Vul titel en tekst in");
        return;
    }

    submitButton.disabled = true;

    try {

        let image = currentImage;
        let imagePath = currentImagePath;

        /* FOTO UPLOAD */
        if (file) {

            const upload = await uploadFile(file);

            image = upload.image;
            imagePath = upload.id;
        }

        const dateInfo = createDateTime();

        const data = {
            title,
            text,
            image,
            imagePath,
            created: dateInfo.created,
            date: dateInfo.date,
            time: dateInfo.time
        };

        if (editingId) {

            await update(ref(db, `${NEWS_PATH}/${editingId}`), data);

        } else {

            await push(ref(db, NEWS_PATH), data);
        }

        resetForm();
        await loadNews();

    } catch (err) {

        console.error(err);
        alert("Opslaan mislukt");
    }

    submitButton.disabled = false;
});

/* ==========================================
   LOAD NEWS
========================================== */

async function loadNews() {

    newsList.innerHTML = "";

    const snap = await get(ref(db, NEWS_PATH));

    if (!snap.exists()) {
        newsList.innerHTML = "<p>Geen nieuws</p>";
        return;
    }

    snap.forEach(item => {

        const data = item.val();

        const div = document.createElement("div");

        div.className = "news-item";

        div.innerHTML = `
            ${data.image ? `<img src="${data.image}" width="100">` : ""}
            <h3>${escapeHTML(data.title)}</h3>
            <p>${escapeHTML(data.text)}</p>
            <small>${data.date} ${data.time}</small>
        `;

        newsList.appendChild(div);
    });
}

/* ==========================================
   START
========================================== */

document.addEventListener("DOMContentLoaded", () => {
    loadNews();
    console.log("🧡 CMS CLEAN VERSION LOADED");
});
