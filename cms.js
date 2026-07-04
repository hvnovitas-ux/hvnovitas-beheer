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

/* ==========================================
   HV NOVITAS CMS
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

const saveButton = document.getElementById("saveButton");

const cancelButton = document.getElementById("cancelButton");

/* ==========================================
   Bewerken
========================================== */

let editingId = null;

let currentImage = "";

let currentImagePath = "";

/* ==========================================
   Datum & tijd
========================================== */

function createDateTime() {

    const now = new Date();

    return {

        timestamp: now.getTime(),

        date: now.toLocaleDateString("nl-NL"),

        time: now.toLocaleTimeString("nl-NL", {

            hour: "2-digit",
            minute: "2-digit"

        })

    };

}

/* ==========================================
   Samenvatting
========================================== */

function createSummary(text = "") {

    const value = text.trim();

    return value.length <= 180

        ? value

        : value.substring(0,180).trim() + "...";

}
/* ==========================================
   HTML veilig maken
========================================== */

function escapeHTML(text = "") {

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}

/* ==========================================
   Unieke bestandsnaam maken
========================================== */

function createImagePath(file) {

    const extension = file.name.split(".").pop().toLowerCase();

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

    const url = await getDownloadURL(imageRef);

    return {

        image: url,

        imagePath: path

    };

}

/* ==========================================
   Foto verwijderen
========================================== */

async function deleteImage(path) {

    if (!path) return;

    try {

        await deleteObject(

            storageRef(storage, path)

        );

    } catch (error) {

        console.warn(

            "Foto niet gevonden:",

            path

        );

    }
    /* ==========================================
   Formulier opslaan
========================================== */

form.addEventListener("submit", async (event) => {

    event.preventDefault();

    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    const file = imageInput.files[0];

    if (!title || !content) {

        alert("Vul een titel en bericht in.");

        return;

    }

    submitButton.disabled = true;

    try {

        const dateInfo = createDateTime();

        let image = currentImage;
        let imagePath = currentImagePath;

        /* Nieuwe foto gekozen */

        if (file) {

            if (editingId && currentImagePath) {

                await deleteImage(currentImagePath);

            }

            const upload = await uploadImage(file);

            image = upload.image;

            imagePath = upload.imagePath;

        }

        const newsData = {

            title,
            content,

            summary: createSummary(content),

            image,
            imagePath,

            date: dateInfo.date,
            time: dateInfo.time,
            timestamp: dateInfo.timestamp

        };

        /* Bewerken */

        if (editingId) {

            await update(

                ref(db, `${NEWS_PATH}/${editingId}`),

                newsData

            );

        }

        /* Nieuw bericht */

        else {

            await push(

                ref(db, NEWS_PATH),

                newsData

            );

        }

        resetForm();

        loadNews();

    }

    catch (error) {

        console.error(error);

        alert("Opslaan mislukt.");

    }

    finally {

        submitButton.disabled = false;

    }

});

}
/* ==========================================
   Bewerken starten
========================================== */

async function startEdit(id) {

    try {

        const snapshot = await get(ref(db, `${NEWS_PATH}/${id}`));

        if (!snapshot.exists()) return;

        const item = snapshot.val();

        editingId = id;

        currentImage = item.image || "";
        currentImagePath = item.imagePath || "";

        titleInput.value = item.title || "";
        contentInput.value = item.content || "";

        submitButton.textContent = "Wijzigingen opslaan";

        cancelButton.style.display = "inline-block";

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    } catch (error) {

        console.error("Bewerken mislukt:", error);

    }

}

/* ==========================================
   Nieuws verwijderen
========================================== */

async function deleteNews(id) {

    if (!confirm("Weet je zeker dat je dit nieuwsbericht wilt verwijderen?")) {
        return;
    }

    try {

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

    } catch (error) {

        console.error("Verwijderen mislukt:", error);

        alert("Het nieuwsbericht kon niet worden verwijderd.");

    }

}

/* ==========================================
   Annuleren
========================================== */

cancelButton.addEventListener("click", () => {

    resetForm();

});

/* ==========================================
   Event delegation
========================================== */

newsList.addEventListener("click", (event) => {

    const editButton = event.target.closest(".editButton");

    if (editButton) {

        startEdit(editButton.dataset.id);

        return;

    }

    const deleteButton = event.target.closest(".deleteButton");

    if (deleteButton) {

        deleteNews(deleteButton.dataset.id);

    }

});

/* ==========================================
   Gereed
========================================== */

console.log("🧡 HV Novitas CMS geladen.");
