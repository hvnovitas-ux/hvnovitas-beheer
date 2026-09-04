import { db } from "./firebase.js";
import {
    ref,
    onValue,
    set,
    remove,
    update
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

console.log("📷 Aankondigingsfoto module geladen");

// =====================================================
// CLOUDINARY CONFIGURATIE
// Vul hier dezelfde Cloudinary gegevens in die jullie
// bestaande uploadscript gebruikt.
// =====================================================

const CLOUDINARY_CLOUD_NAME = "VUL_HIER_JOUW_CLOUD_NAME_IN";
const CLOUDINARY_UPLOAD_PRESET = "VUL_HIER_JOUW_UNSIGNED_UPLOAD_PRESET_IN";
const CLOUDINARY_FOLDER = "hvnovitas/aankondigingsfoto";

// Firebase locatie van deze zelfstandige module
const DB_PATH = "aankondigingsfoto";

const basePhotosEl = document.getElementById("basePhotos");
const baseStatusEl = document.getElementById("baseStatus");
const specialStatusEl = document.getElementById("specialStatus");

const specialPreviewEl = document.getElementById("specialPreview");
const specialEmptyEl = document.getElementById("specialEmpty");

const specialFileEl = document.getElementById("specialFile");
const startDateEl = document.getElementById("specialStartDate");
const startTimeEl = document.getElementById("specialStartTime");
const endDateEl = document.getElementById("specialEndDate");
const endTimeEl = document.getElementById("specialEndTime");

const saveSpecialBtn = document.getElementById("saveSpecial");
const clearSpecialBtn = document.getElementById("clearSpecial");

const progressEl = document.getElementById("uploadProgress");
const progressBarEl = document.getElementById("uploadProgressBar");

const currentPhotoLabelEl = document.getElementById("currentPhotoLabel");
const currentReasonEl = document.getElementById("currentReason");
const lastUpdateEl = document.getElementById("lastUpdate");

const messageEl = document.getElementById("message");

let moduleData = {
    basePhotos: {
        foto1: null,
        foto2: null,
        foto3: null
    },
    selectedBase: "foto1",
    special: {
        imageUrl: "",
        publicId: "",
        deleteToken: "",
        start: "",
        end: ""
    }
};

let specialUpload = null;
let messageTimer = null;

// =====================================================
// FIREBASE DATA
// =====================================================

onValue(ref(db, DB_PATH), (snapshot) => {
    const data = snapshot.val() || {};

    moduleData = {
        basePhotos: {
            foto1: data.basePhotos?.foto1 || null,
            foto2: data.basePhotos?.foto2 || null,
            foto3: data.basePhotos?.foto3 || null
        },
        selectedBase: data.selectedBase || "foto1",
        special: {
            imageUrl: data.special?.imageUrl || "",
            publicId: data.special?.publicId || "",
            deleteToken: data.special?.deleteToken || "",
            start: data.special?.start || "",
            end: data.special?.end || ""
        }
    };

    renderBasePhotos();
    renderSpecial();
    renderCurrentStatus();
});

function renderBasePhotos() {
    if (!basePhotosEl) return;

    const slots = ["foto1", "foto2", "foto3"];

    basePhotosEl.innerHTML = slots.map((slot, index) => {
        const photo = moduleData.basePhotos[slot];
        const slotName = `Foto ${index + 1}`;
        const active = moduleData.selectedBase === slot;

        return `
            <article class="photo-card ${active ? "active" : ""}">
                <div class="photo-preview">
                    ${
                        photo?.imageUrl
                            ? `<img src="${escapeAttribute(photo.imageUrl)}" alt="${slotName}">`
                            : `<div class="empty-preview">Nog geen foto<br>voor deze positie</div>`
                    }
                </div>

                <div class="photo-card-body">
                    <div class="photo-card-title">${slotName}</div>

                    <label class="radio-wrap">
                        <input
                            type="radio"
                            name="selectedBase"
                            value="${slot}"
                            ${active ? "checked" : ""}
                            ${photo?.imageUrl ? "" : "disabled"}
                        >
                        Gebruik als basisfoto
                    </label>

                    <label class="file-button">
                        📤 ${photo?.imageUrl ? "Foto vervangen" : "Foto uploaden"}
                        <input
                            class="base-file-input"
                            data-slot="${slot}"
                            type="file"
                            accept="image/*"
                            hidden
                        >
                    </label>

                    ${
                        photo?.imageUrl
                            ? `
                                <div style="height:10px"></div>
                                <button
                                    class="danger-outline delete-base-btn"
                                    data-slot="${slot}"
                                    type="button"
                                >
                                    🗑️ Verwijderen
                                </button>
                            `
                            : ""
                    }
                </div>
            </article>
        `;
    }).join("");

    basePhotosEl.querySelectorAll('input[name="selectedBase"]').forEach((radio) => {
        radio.addEventListener("change", async (event) => {
            const slot = event.target.value;
            try {
                await set(ref(db, `${DB_PATH}/selectedBase`), slot);
                showMessage("Basisfoto gewijzigd.", "success");
            } catch (error) {
                console.error(error);
                showMessage("Basisfoto kon niet worden opgeslagen.", "error");
            }
        });
    });

    basePhotosEl.querySelectorAll(".base-file-input").forEach((input) => {
        input.addEventListener("change", async (event) => {
            const file = event.target.files?.[0];
            const slot = event.target.dataset.slot;

            if (!file || !slot) return;

            try {
                showMessage(`${capitalize(slot)} wordt geüpload…`);
                const uploaded = await uploadToCloudinary(file);

                await set(ref(db, `${DB_PATH}/basePhotos/${slot}`), {
                    imageUrl: uploaded.secure_url,
                    publicId: uploaded.public_id || "",
                    deleteToken: uploaded.delete_token || ""
                });

                showMessage("Foto geüpload.", "success");
            } catch (error) {
                console.error(error);
                showMessage(error.message || "Upload mislukt.", "error");
            } finally {
                input.value = "";
            }
        });
    });

    basePhotosEl.querySelectorAll(".delete-base-btn").forEach((button) => {
        button.addEventListener("click", async () => {
            const slot = button.dataset.slot;
            const photo = moduleData.basePhotos[slot];

            if (!photo) return;

            const confirmed = window.confirm(
                `Wil je ${capitalize(slot)} echt verwijderen?`
            );

            if (!confirmed) return;

            try {
                await tryDeleteByToken(photo.deleteToken);

                await remove(ref(db, `${DB_PATH}/basePhotos/${slot}`));

                if (moduleData.selectedBase === slot) {
                    const fallback = ["foto1", "foto2", "foto3"]
                        .find((item) => item !== slot && moduleData.basePhotos[item]?.imageUrl);

                    await set(ref(db, `${DB_PATH}/selectedBase`), fallback || "foto1");
                }

                showMessage("Foto verwijderd.", "success");
            } catch (error) {
                console.error(error);
                showMessage(
                    "Foto is uit de module verwijderd. Permanente verwijdering uit Cloudinary is alleen mogelijk met een geldig delete-token of een beveiligde serverfunctie.",
                    "error"
                );
            }
        });
    });

    const filled = slots.filter((slot) => moduleData.basePhotos[slot]?.imageUrl).length;

    if (filled === 0) {
        baseStatusEl.textContent = "Nog geen basisfoto's";
        baseStatusEl.className = "status neutral";
    } else {
        baseStatusEl.textContent = `${capitalize(moduleData.selectedBase)} actief`;
        baseStatusEl.className = "status success";
    }
}

function renderSpecial() {
    const special = moduleData.special;

    if (special.imageUrl) {
        specialPreviewEl.src = special.imageUrl;
        specialPreviewEl.hidden = false;
        specialEmptyEl.hidden = true;
    } else {
        specialPreviewEl.hidden = true;
        specialPreviewEl.removeAttribute("src");
        specialEmptyEl.hidden = false;
    }

    startDateEl.value = special.start?.slice(0, 10) || "";
    startTimeEl.value = special.start?.slice(11, 16) || "00:00";
    endDateEl.value = special.end?.slice(0, 10) || "";
    endTimeEl.value = special.end?.slice(11, 16) || "23:59";

    const active = isSpecialActive();

    if (!special.imageUrl) {
        specialStatusEl.textContent = "Geen speciale foto";
        specialStatusEl.className = "status neutral";
    } else if (active) {
        specialStatusEl.textContent = "🟢 Nu actief";
        specialStatusEl.className = "status success";
    } else if (special.start && Date.now() < parseDate(special.start)) {
        specialStatusEl.textContent = "🟡 Gepland";
        specialStatusEl.className = "status warning";
    } else {
        specialStatusEl.textContent = "⚪ Verlopen";
        specialStatusEl.className = "status neutral";
    }
}

function renderCurrentStatus() {
    const current = getActivePhoto();

    currentPhotoLabelEl.textContent = current.label;
    currentReasonEl.textContent = current.reason;
    lastUpdateEl.textContent = new Date().toLocaleString("nl-NL");
}

function getActivePhoto() {
    const special = moduleData.special;

    if (special.imageUrl && isSpecialActive()) {
        return {
            imageUrl: special.imageUrl,
            label: "Speciale foto",
            reason: "Binnen geplande periode"
        };
    }

    const selected = moduleData.basePhotos[moduleData.selectedBase];

    if (selected?.imageUrl) {
        return {
            imageUrl: selected.imageUrl,
            label: capitalize(moduleData.selectedBase),
            reason: "Gekozen basisfoto"
        };
    }

    const fallback = ["foto1", "foto2", "foto3"]
        .map((slot) => ({ slot, photo: moduleData.basePhotos[slot] }))
        .find((item) => item.photo?.imageUrl);

    if (fallback) {
        return {
            imageUrl: fallback.photo.imageUrl,
            label: capitalize(fallback.slot),
            reason: "Eerste beschikbare basisfoto"
        };
    }

    return {
        imageUrl: "",
        label: "Geen foto",
        reason: "Er is nog geen foto ingesteld"
    };
}

function isSpecialActive() {
    const { imageUrl, start, end } = moduleData.special;

    if (!imageUrl || !start || !end) return false;

    const now = Date.now();
    const startMs = parseDate(start);
    const endMs = parseDate(end);

    return now >= startMs && now <= endMs;
}

// =====================================================
// SPECIALE FOTO
// =====================================================

specialFileEl.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
        showMessage("Speciale foto wordt geüpload…");
        specialUpload = await uploadToCloudinary(file);

        specialPreviewEl.src = specialUpload.secure_url;
        specialPreviewEl.hidden = false;
        specialEmptyEl.hidden = true;

        showMessage("Speciale foto geüpload. Stel nu de periode in.", "success");
    } catch (error) {
        console.error(error);
        showMessage(error.message || "Upload mislukt.", "error");
    } finally {
        specialFileEl.value = "";
    }
});

saveSpecialBtn.addEventListener("click", async () => {
    const imageUrl = specialUpload?.secure_url || moduleData.special.imageUrl;
    const publicId = specialUpload?.public_id || moduleData.special.publicId;
    const deleteToken = specialUpload?.delete_token || moduleData.special.deleteToken;

    if (!imageUrl) {
        showMessage("Upload eerst een speciale foto.", "error");
        return;
    }

    const start = combineDateTime(startDateEl.value, startTimeEl.value);
    const end = combineDateTime(endDateEl.value, endTimeEl.value);

    if (!start || !end) {
        showMessage("Vul start- en einddatum/tijd in.", "error");
        return;
    }

    if (parseDate(end) <= parseDate(start)) {
        showMessage("De einddatum/tijd moet na de startdatum/tijd liggen.", "error");
        return;
    }

    try {
        await set(ref(db, `${DB_PATH}/special`), {
            imageUrl,
            publicId,
            deleteToken,
            start,
            end
        });

        specialUpload = null;

        showMessage("Speciale foto ingepland.", "success");
    } catch (error) {
        console.error(error);
        showMessage("De planning kon niet worden opgeslagen.", "error");
    }
});

clearSpecialBtn.addEventListener("click", async () => {
    if (!moduleData.special.imageUrl) {
        showMessage("Er is geen speciale foto om te verwijderen.");
        return;
    }

    const confirmed = window.confirm(
        "Wil je de speciale foto en de planning verwijderen?"
    );

    if (!confirmed) return;

    try {
        await tryDeleteByToken(moduleData.special.deleteToken);
        await remove(ref(db, `${DB_PATH}/special`));

        specialUpload = null;
        showMessage("Speciale foto verwijderd. De basisfoto blijft actief.", "success");
    } catch (error) {
        console.error(error);
        await remove(ref(db, `${DB_PATH}/special`));
        showMessage(
            "De speciale foto is uit de module verwijderd. Permanente verwijdering uit Cloudinary vereist een geldig delete-token of beveiligde serverfunctie.",
            "error"
        );
    }
});

// =====================================================
// CLOUDINARY UPLOAD
// =====================================================

async function uploadToCloudinary(file) {
    if (
        !CLOUDINARY_CLOUD_NAME ||
        CLOUDINARY_CLOUD_NAME.includes("VUL_HIER") ||
        !CLOUDINARY_UPLOAD_PRESET ||
        CLOUDINARY_UPLOAD_PRESET.includes("VUL_HIER")
    ) {
        throw new Error(
            "Vul eerst CLOUDINARY_CLOUD_NAME en CLOUDINARY_UPLOAD_PRESET in aankondigingsfoto.js in."
        );
    }

    if (!file.type.startsWith("image/")) {
        throw new Error("Alleen afbeeldingsbestanden zijn toegestaan.");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("folder", CLOUDINARY_FOLDER);
    formData.append("return_delete_token", "true");

    progressEl.hidden = false;
    progressBarEl.style.width = "0%";

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${encodeURIComponent(CLOUDINARY_CLOUD_NAME)}/image/upload`,
        {
            method: "POST",
            body: formData
        }
    );

    progressBarEl.style.width = "100%";

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Cloudinary upload mislukt: ${errorText}`);
    }

    const result = await response.json();

    progressEl.hidden = true;
    return result;
}

async function tryDeleteByToken(deleteToken) {
    if (!deleteToken) return false;

    const response = await fetch(
        "https://api.cloudinary.com/v1_1/delete_by_token",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                token: deleteToken
            })
        }
    );

    return response.ok;
}

// =====================================================
// HELPERS
// =====================================================

function combineDateTime(date, time) {
    if (!date) return "";
    return `${date}T${time || "00:00"}:00`;
}

function parseDate(value) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return 0;
    }

    return date.getTime();
}

function capitalize(value) {
    if (!value) return "";
    return value.charAt(0).toUpperCase() + value.slice(1);
}

function escapeAttribute(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll('"', "&quot;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
}

function showMessage(text, type = "") {
    clearTimeout(messageTimer);

    messageEl.textContent = text;
    messageEl.className = `message show ${type}`;

    messageTimer = setTimeout(() => {
        messageEl.className = "message";
    }, 4500);
}

// =====================================================
// STATUS AUTOMATISCH BIJWERKEN
// =====================================================

setInterval(() => {
    if (moduleData) {
        renderSpecial();
        renderCurrentStatus();
    }
}, 30_000);
