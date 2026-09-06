/* ==========================================================
   HV NOVITAS CMS
   Volledige Nieuws-module
   ========================================================== */

import { db, storage } from "./firebase.js";

import {
    ref,
    push,
    update,
    remove,
    get
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

import {
    ref as storageRef,
    uploadBytes,
    getDownloadURL,
    deleteObject
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";

const NEWS_PATH = "news";

const form = document.getElementById("newsForm");
const titleInput = document.getElementById("title");
const textInput = document.getElementById("text");
const imageInput = document.getElementById("image");
const submitButton = document.getElementById("submitButton");
const cancelButton = document.getElementById("cancelButton");
const newsList = document.getElementById("newsList");

let editingId = null;
let currentImage = "";
let currentImagePath = "";

function escapeHTML(text = "") {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

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

function createImagePath(file) {
    const extension = file.name
        .split(".")
        .pop()
        .toLowerCase();

    return `news/${Date.now()}-${crypto.randomUUID()}.${extension}`;
}

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

async function deleteImage(imagePath) {
    if (!imagePath) return;

    try {
        await deleteObject(storageRef(storage, imagePath));
    } catch (error) {
        console.warn("Foto kon niet worden verwijderd:", imagePath, error);
    }
}

function resetForm() {
    if (!form) return;

    form.reset();

    editingId = null;
    currentImage = "";
    currentImagePath = "";

    if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "💾 Nieuws opslaan";
    }

    if (cancelButton) {
        cancelButton.style.display = "none";
    }
}

function createNewsCard(id, item) {
    const imageHTML = item.image
        ? `<img class="news-image" src="${escapeHTML(item.image)}" alt="${escapeHTML(item.title || "Nieuws")}">`
        : "";

    return `
        <article class="news-card">
            ${imageHTML}

            <div class="news-content">
                <h3>${escapeHTML(item.title || "")}</h3>

                <div class="news-meta">
                    📅 ${escapeHTML(item.date || "")}
                    &nbsp;&nbsp;
                    🕒 ${escapeHTML(item.time || "")}
                </div>

                <p>${escapeHTML(item.text || "")}</p>

                <div class="news-actions">
                    <button
                        type="button"
                        class="editButton"
                        data-id="${escapeHTML(id)}">
                        Bewerken
                    </button>

                    <button
                        type="button"
                        class="deleteButton"
                        data-id="${escapeHTML(id)}">
                        Verwijderen
                    </button>
                </div>
            </div>
        </article>
    `;
}

async function loadNews() {
    if (!newsList) return;

    newsList.innerHTML = "";

    try {
        const snapshot = await get(ref(db, NEWS_PATH));

        if (!snapshot.exists()) {
            newsList.innerHTML = "<p>Nog geen nieuws.</p>";
            return;
        }

        const items = [];

        snapshot.forEach((childSnapshot) => {
            items.push({
                id: childSnapshot.key,
                ...childSnapshot.val()
            });
        });

        items.sort(
            (a, b) => (b.created || 0) - (a.created || 0)
        );

        newsList.innerHTML = items
            .map((item) => createNewsCard(item.id, item))
            .join("");
    } catch (error) {
        console.error("Nieuws laden mislukt:", error);
        newsList.innerHTML =
            "<p>Nieuws kon niet worden geladen.</p>";
    }
}

async function saveNews(event) {
    event.preventDefault();

    const title = titleInput?.value.trim() || "";
    const text = textInput?.value.trim() || "";
    const file = imageInput?.files?.[0] || null;

    if (!title || !text) {
        alert("Vul een titel en nieuwsbericht in.");
        return;
    }

    if (submitButton) {
        submitButton.disabled = true;
    }

    try {
        let image = currentImage;
        let imagePath = currentImagePath;

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
            created: dateInfo.created,
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
        } else {
            await push(
                ref(db, NEWS_PATH),
                newsData
            );
        }

        alert("Nieuws opgeslagen.");

        resetForm();
        await loadNews();
    } catch (error) {
        console.error("Opslaan nieuws mislukt:", error);
        alert("Opslaan mislukt.");
    } finally {
        if (submitButton) {
            submitButton.disabled = false;
        }
    }
}

async function startEdit(id) {
    try {
        const snapshot = await get(
            ref(db, `${NEWS_PATH}/${id}`)
        );

        if (!snapshot.exists()) return;

        const item = snapshot.val();

        editingId = id;
        currentImage = item.image || "";
        currentImagePath = item.imagePath || "";

        if (titleInput) {
            titleInput.value = item.title || "";
        }

        if (textInput) {
            textInput.value = item.text || "";
        }

        if (submitButton) {
            submitButton.textContent =
                "💾 Wijzigingen opslaan";
        }

        if (cancelButton) {
            cancelButton.style.display = "inline-block";
        }

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    } catch (error) {
        console.error("Bewerken mislukt:", error);
    }
}

async function deleteNews(id) {
    if (!confirm("Nieuwsbericht verwijderen?")) {
        return;
    }

    try {
        const snapshot = await get(
            ref(db, `${NEWS_PATH}/${id}`)
        );

        if (snapshot.exists()) {
            const item = snapshot.val();

            if (item.imagePath) {
                await deleteImage(item.imagePath);
            }
        }

        await remove(
            ref(db, `${NEWS_PATH}/${id}`)
        );

        if (editingId === id) {
            resetForm();
        }

        await loadNews();
    } catch (error) {
        console.error("Verwijderen mislukt:", error);
        alert("Verwijderen mislukt.");
    }
}

function init() {
    if (!form || !newsList) {
        console.warn(
            "CMS Nieuws: benodigde HTML-elementen ontbreken."
        );
        return;
    }

    resetForm();

    form.addEventListener(
        "submit",
        saveNews
    );

    if (cancelButton) {
        cancelButton.addEventListener(
            "click",
            resetForm
        );
    }

    newsList.addEventListener(
        "click",
        (event) => {
            const editButton =
                event.target.closest(".editButton");

            if (editButton) {
                startEdit(editButton.dataset.id);
                return;
            }

            const deleteButton =
                event.target.closest(".deleteButton");

            if (deleteButton) {
                deleteNews(deleteButton.dataset.id);
            }
        }
    );

    loadNews();
}

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        init,
        { once: true }
    );
} else {
    init();
}

console.log("🧡 HV Novitas Nieuws CMS gereed.");
