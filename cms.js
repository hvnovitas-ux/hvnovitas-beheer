/* ==========================================================
   HV NOVITAS CMS
   Segment 1
   Basis
========================================================== */

import { db, storage } from "./firebase.js";

import {
    ref,
    push,
    update,
    remove,
    get,
    child
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

import {
    ref as storageRef,
    uploadBytes,
    getDownloadURL,
    deleteObject
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";

/* ==========================================================
   DATABASE
========================================================== */

const NEWS_PATH = "news";

/* ==========================================================
   DOM
========================================================== */

const form = document.getElementById("newsForm");

const titleInput = document.getElementById("title");

const textInput = document.getElementById("text");

const imageInput = document.getElementById("image");

const submitButton = document.getElementById("submitButton");

const cancelButton = document.getElementById("cancelButton");

const newsList = document.getElementById("newsList");

/* ==========================================================
   Bewerken
========================================================== */

let editingId = null;

let currentImage = "";

let currentImagePath = "";

/* ==========================================================
   Datum en tijd
========================================================== */

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

/* ==========================================================
   HTML veilig maken
========================================================== */

function escapeHTML(text = "") {

    return String(text)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}

/* ==========================================================
   Samenvatting
========================================================== */

function createSummary(text = "") {

    const value = text.trim();

    if (value.length <= 180) {

        return value;

    }

    return value.substring(0,180).trim() + "...";

}

console.log("🧡 CMS Segment 1 geladen");
/* ==========================================================
   HV NOVITAS CMS
   Segment 2
   Firebase Storage
========================================================== */
console.log("BESTAND:", file);
console.log("👉 file input:", imageInput.files);
console.log("👉 file:", file);
console.log("👉 DRIVE MODULE GEBRUIKT");
const upload = await uploadFile(file);
console.log("UPLOAD RESULT:", upload);
console.log("👉 upload start");
console.log("👉 upload result:", upload);

/* ==========================================
   Unieke bestandsnaam
========================================== */

function createImagePath(file) {

    const extension = file.name
        .split(".")
        .pop()
        .toLowerCase();

    return `news/${Date.now()}-${crypto.randomUUID()}.${extension}`;

}

/* ==========================================
   Foto uploaden
========================================== */

async function uploadImage(file) {

    if (!file) {

        return {

            image: "",

            imagePath: ""

        };

    }

    const path = createImagePath(file);

    const imageRef = storageRef(storage, path);

    await uploadBytes(imageRef, file);

    const image = await getDownloadURL(imageRef);

    return {

        image,

        imagePath: path

    };

}

/* ==========================================
   Foto verwijderen
========================================== */

async function deleteImage(imagePath) {

    if (!imagePath) return;

    try {

        await deleteObject(

            storageRef(storage, imagePath)

        );

    }

    catch (error) {

        console.warn(

            "Foto niet gevonden:",

            imagePath

        );

    }

}

console.log("🧡 CMS Segment 2 geladen");
/* ==========================================================
   HV NOVITAS CMS
   Segment 3
   Nieuws opslaan
========================================================== */

form.addEventListener("submit", async (event) => {

    event.preventDefault();

    const title = titleInput.value.trim();

    const text = textInput.value.trim();

    const file = imageInput.files[0];

    if (!title || !text) {

        alert("Vul een titel en nieuwsbericht in.");

        return;

    }

    submitButton.disabled = true;

    try {

        let image = currentImage;

        let imagePath = currentImagePath;

        /* Nieuwe foto uploaden */

        if (file) {

            if (editingId && currentImagePath) {

                await deleteImage(currentImagePath);

            }

            const upload = await uploadImage(file);

            image = upload.image;

            imagePath = upload.imagePath;

        }

        const dateInfo = createDateTime();

        const newsData = {

            title,

            text,

            created: editingId
                ? dateInfo.created
                : dateInfo.created,

            date: dateInfo.date,

            time: dateInfo.time,

            image,

            imagePath

        };

        if (editingId) {

            await update(

                ref(db, `${NEWS_PATH}/${editingId}`),

                newsData

            );

        }

        else {

            await push(

                ref(db, NEWS_PATH),

                newsData

            );

        }

        alert("Nieuws opgeslagen.");

    }

    catch (error) {

        console.error(error);

        alert("Opslaan mislukt.");

    }

    finally {

        submitButton.disabled = false;

    }

});

console.log("🧡 CMS Segment 3 geladen");
/* ==========================================================
   HV NOVITAS CMS
   Segment 4
   Formulier en nieuws laden
========================================================== */

/* ==========================================
   Formulier leegmaken
========================================== */

function resetForm() {

    form.reset();

    editingId = null;

    currentImage = "";

    currentImagePath = "";

    submitButton.disabled = false;

    submitButton.textContent = "💾 Nieuws opslaan";

    cancelButton.style.display = "none";

}

/* ==========================================
   Nieuwskaart maken
========================================== */

function createNewsCard(id, item) {

    return `

<article class="news-card">

    ${item.image
        ? `<img class="news-image" src="${item.image}" alt="${escapeHTML(item.title)}">`
        : ""}

    <div class="news-content">

        <h3>${escapeHTML(item.title)}</h3>

        <div class="news-meta">

            📅 ${item.date} &nbsp;&nbsp; 🕒 ${item.time}

        </div>

        <p>

            ${escapeHTML(item.text)}

        </p>

        <div class="news-actions">

            <button
                class="editButton"
                data-id="${id}">

                Bewerken

            </button>

            <button
                class="deleteButton"
                data-id="${id}">

                Verwijderen

            </button>

        </div>

    </div>

</article>

`;

}

/* ==========================================
   Nieuws laden
========================================== */

async function loadNews() {

    newsList.innerHTML = "";

    const snapshot = await get(ref(db, NEWS_PATH));

    if (!snapshot.exists()) {

        newsList.innerHTML = "<p>Nog geen nieuws.</p>";

        return;

    }

    const items = [];

    snapshot.forEach((child) => {

        items.push({

            id: child.key,

            ...child.val()

        });

    });

    items.sort((a, b) => (b.created || 0) - (a.created || 0));

    items.forEach((item) => {

        newsList.insertAdjacentHTML(

            "beforeend",

            createNewsCard(item.id, item)

        );

    });

}

console.log("🧡 CMS Segment 4 geladen");
/* ==========================================================
   HV NOVITAS CMS
   Segment 5
   Bewerken - Verwijderen - Starten
========================================================== */

/* ==========================================
   Bewerken
========================================== */

async function startEdit(id) {

    const snapshot = await get(ref(db, `${NEWS_PATH}/${id}`));

    if (!snapshot.exists()) return;

    const item = snapshot.val();

    editingId = id;

    titleInput.value = item.title || "";

    textInput.value = item.text || "";

    currentImage = item.image || "";

    currentImagePath = item.imagePath || "";

    submitButton.textContent = "💾 Wijzigingen opslaan";

    cancelButton.style.display = "inline-block";

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}

/* ==========================================
   Verwijderen
========================================== */

async function deleteNews(id) {

    if (!confirm("Nieuwsbericht verwijderen?")) {

        return;

    }

    const snapshot = await get(ref(db, `${NEWS_PATH}/${id}`));

    if (snapshot.exists()) {

        const item = snapshot.val();

        if (item.imagePath) {

            await deleteImage(item.imagePath);

        }

    }

    await remove(ref(db, `${NEWS_PATH}/${id}`));

    if (editingId === id) {

        resetForm();

    }

    await loadNews();

}

/* ==========================================
   Annuleren
========================================== */

cancelButton.addEventListener("click", () => {

    resetForm();

});

/* ==========================================
   Knoppen
========================================== */

newsList.addEventListener("click", (event) => {

    const edit = event.target.closest(".editButton");

    if (edit) {

        startEdit(edit.dataset.id);

        return;

    }

    const del = event.target.closest(".deleteButton");

    if (del) {

        deleteNews(del.dataset.id);

    }

});

/* ==========================================
   Na opslaan
========================================== */

form.addEventListener("submit", async () => {

    setTimeout(async () => {

        resetForm();

        await loadNews();

    }, 300);

});

/* ==========================================
   Start
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    resetForm();

    loadNews();

});

console.log("🧡 HV Novitas CMS gereed.");
