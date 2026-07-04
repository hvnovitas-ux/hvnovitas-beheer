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

}
