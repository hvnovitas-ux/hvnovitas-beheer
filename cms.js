import { db } from "./firebase.js";
import { uploadFile } from "./drive.js";

import {
    ref,
    push,
    update,
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
   FORM SUBMIT
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

        /* ==========================================
           FOTO UPLOAD (DRIVE)
        ========================================== */

        let image = currentImage;
        let imagePath = currentImagePath;

        if (file) {

            const upload = await uploadFile(file);

            console.log("📷 DRIVE UPLOAD RESULT:", upload);

            image = upload.image;     // <-- URL
            imagePath = upload.id;    // <-- Drive file ID
        }

        /* ==========================================
           DATA OPBOUW
        ========================================== */

        const data = {
            title,
            text,
            image,
            imagePath,
            created: Date.now(),
            date: new Date().toLocaleDateString("nl-NL"),
            time: new Date().toLocaleTimeString("nl-NL", {
                hour: "2-digit",
                minute: "2-digit"
            })
        };

        /* ==========================================
           FIREBASE SAVE
        ========================================== */

        if (editingId) {

            await update(ref(db, `${NEWS_PATH}/${editingId}`), data);

        } else {

            await push(ref(db, NEWS_PATH), data);
        }

        form.reset();

        await loadNews();

    } catch (error) {

        console.error("❌ ERROR:", error);

        alert("Opslaan mislukt");
    }

    submitButton.disabled = false;
});

/* ==========================================
   NEWS LOAD
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
            ${data.image ? `<img src="${data.image}" width="120">` : ""}
            <h3>${data.title}</h3>
            <p>${data.text}</p>
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
    console.log("🧡 CMS CLEAN + DRIVE READY");
});
