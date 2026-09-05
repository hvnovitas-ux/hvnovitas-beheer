import { db } from "./firebase.js";
import {
    ref,
    onValue,
    set,
    remove
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

console.log("📷 Aankondigingsfoto module geladen");

const DB_PATH = "aankondigingsfoto";
const BASE_SLOTS = ["foto1", "foto2", "foto3"];

const CLOUDINARY_UPLOAD_URL =
    "https://api.cloudinary.com/v1_1/hwxe3jzg/image/upload";
const CLOUDINARY_UPLOAD_PRESET = "hvnovitas_upload";

let state = {
    basePhotos: {
        foto1: null,
        foto2: null,
        foto3: null
    },
    selectedBase: "foto1",
    special: {
        imageUrl: "",
        publicId: "",
        created: 0,
        start: "",
        end: ""
    }
};

let pendingSpecialUpload = null;
let messageTimer = null;

const basePhotosEl = document.getElementById("basePhotos");
const baseStatusEl = document.getElementById("baseStatus");

const specialFileEl = document.getElementById("specialFile");
const specialPreviewEl = document.getElementById("specialPreview");
const specialEmptyEl = document.getElementById("specialEmpty");
const specialStatusEl = document.getElementById("specialStatus");

const startDateEl = document.getElementById("specialStartDate");
const startTimeEl = document.getElementById("specialStartTime");
const endDateEl = document.getElementById("specialEndDate");
const endTimeEl = document.getElementById("specialEndTime");

const saveSpecialBtn = document.getElementById("saveSpecial");
const clearSpecialBtn = document.getElementById("clearSpecial");

const uploadProgressEl = document.getElementById("uploadProgress");
const uploadProgressBarEl = document.getElementById("uploadProgressBar");

const currentPhotoLabelEl = document.getElementById("currentPhotoLabel");
const currentReasonEl = document.getElementById("currentReason");
const lastCheckEl = document.getElementById("lastCheck");

const messageEl = document.getElementById("message");

onValue(ref(db, DB_PATH), (snapshot) => {
    const data = snapshot.val() || {};

    state = {
        basePhotos: {
            foto1: data.basePhotos?.foto1 || null,
            foto2: data.basePhotos?.foto2 || null,
            foto3: data.basePhotos?.foto3 || null
        },
        selectedBase: data.selectedBase || "foto1",
        special: {
            imageUrl: data.special?.imageUrl || "",
            publicId: data.special?.publicId || "",
            created: data.special?.created || 0,
            start: data.special?.start || "",
            end: data.special?.end || ""
        }
    };

    renderBasePhotos();
    renderSpecial();
    renderCurrent();
}, (error) => {
    console.error("Firebase leesfout:", error);
    showMessage("De Aankondigingsfoto-module kan Firebase niet lezen.", "error");
    setCurrent("—", "Firebase niet beschikbaar");
});

function renderBasePhotos() {
    const cards = BASE_SLOTS.map((slot, index) => {
        const photo = state.basePhotos[slot];
        const active = state.selectedBase === slot;

        return `
            <article class="af-photo-card ${active ? "active" : ""}" data-slot="${slot}">
                <div class="af-photo-preview">
                    ${photo?.imageUrl
                        ? `<img src="${escapeAttribute(photo.imageUrl)}" alt="Basisfoto ${index + 1}">`
                        : `<div class="af-empty">
                                <span>📷</span>
                                <strong>Foto ${index + 1}</strong>
                                <small>Nog geen foto</small>
                           </div>`
                    }
                </div>

                <div class="af-photo-body">
                    <div class="af-photo-title">Foto ${index + 1}</div>

                    <label class="af-radio-row">
                        <input
                            type="radio"
                            name="selectedBase"
                            value="${slot}"
                            ${active ? "checked" : ""}
                            ${photo?.imageUrl ? "" : "disabled"}
                        >
                        Gebruik als basisfoto
                    </label>

                    <label class="af-file-label">
                        📤 ${photo?.imageUrl ? "Foto vervangen" : "Foto uploaden"}
                        <input
                            type="file"
                            accept="image/*"
                            data-base-slot="${slot}"
                        >
                    </label>

                    <button
                        type="button"
                        class="af-btn af-btn-danger af-delete-slot"
                        data-delete-base="${slot}"
                        ${photo?.imageUrl ? "" : "hidden"}
                    >
                        🗑️ Verwijderen
                    </button>
                </div>
            </article>
        `;
    }).join("");

    basePhotosEl.innerHTML = cards;

    basePhotosEl
        .querySelectorAll('input[name="selectedBase"]')
        .forEach((radio) => {
            radio.addEventListener("change", async (event) => {
                const slot = event.target.value;

                try {
                    await set(ref(db, `${DB_PATH}/selectedBase`), slot);
                    showMessage(`Foto ${slot.replace("foto", "")} is nu de basisfoto.`, "success");
                } catch (error) {
                    console.error(error);
                    showMessage("De basisfoto kon niet worden opgeslagen.", "error");
                }
            });
        });

    basePhotosEl.querySelectorAll("[data-base-slot]").forEach((input) => {
        input.addEventListener("change", async (event) => {
            const file = event.target.files?.[0];
            const slot = event.target.dataset.baseSlot;

            if (!file) return;

            try {
                showMessage("Foto wordt geüpload…");

                const uploaded = await uploadToCloudinary(file);

                await set(ref(db, `${DB_PATH}/basePhotos/${slot}`), {
                    imageUrl: uploaded.secure_url,
                    publicId: uploaded.public_id || "",
                    created: Date.now()
                });

                // Als dit de eerste foto is, maak hem automatisch actief.
                if (!BASE_SLOTS.some((item) => state.basePhotos[item]?.imageUrl)) {
                    await set(ref(db, `${DB_PATH}/selectedBase`), slot);
                }

                showMessage(`Foto ${slot.replace("foto", "")} opgeslagen.`, "success");
            } catch (error) {
                console.error(error);
                showMessage(error.message || "Upload mislukt.", "error");
            } finally {
                event.target.value = "";
            }
        });
    });

    basePhotosEl.querySelectorAll("[data-delete-base]").forEach((button) => {
        button.addEventListener("click", async () => {
            const slot = button.dataset.deleteBase;
            const photo = state.basePhotos[slot];

            if (!photo?.imageUrl) return;

            if (!window.confirm(`Wil je Foto ${slot.replace("foto", "")} verwijderen?`)) {
                return;
            }

            try {
                await remove(ref(db, `${DB_PATH}/basePhotos/${slot}`));

                if (state.selectedBase === slot) {
                    const fallback = BASE_SLOTS.find(
                        (item) =>
                            item !== slot &&
                            state.basePhotos[item]?.imageUrl
                    );

                    await set(
                        ref(db, `${DB_PATH}/selectedBase`),
                        fallback || "foto1"
                    );
                }

                showMessage("Basisfoto verwijderd.", "success");
            } catch (error) {
                console.error(error);
                showMessage("Verwijderen mislukt.", "error");
            }
        });
    });

    const count = BASE_SLOTS.filter(
        (slot) => state.basePhotos[slot]?.imageUrl
    ).length;

    if (count === 0) {
        baseStatusEl.textContent = "Nog geen basisfoto";
        baseStatusEl.className = "af-badge af-badge-neutral";
    } else {
        baseStatusEl.textContent =
            `Foto ${state.selectedBase.replace("foto", "")} actief`;
        baseStatusEl.className = "af-badge af-badge-good";
    }
}

function renderSpecial() {
    const special = state.special;

    if (special.imageUrl) {
        specialPreviewEl.src = special.imageUrl;
        specialPreviewEl.hidden = false;
        specialEmptyEl.hidden = true;
    } else {
        specialPreviewEl.removeAttribute("src");
        specialPreviewEl.hidden = true;
        specialEmptyEl.hidden = false;
    }

    startDateEl.value = getDatePart(special.start);
    startTimeEl.value = getTimePart(special.start, "00:00");
    endDateEl.value = getDatePart(special.end);
    endTimeEl.value = getTimePart(special.end, "23:59");

    updateSpecialStatus();
}

specialFileEl.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
        showMessage("Speciale foto wordt geüpload…");

        pendingSpecialUpload = await uploadToCloudinary(file);

        specialPreviewEl.src = pendingSpecialUpload.secure_url;
        specialPreviewEl.hidden = false;
        specialEmptyEl.hidden = true;

        showMessage(
            "Speciale foto geüpload. Stel de periode in en klik op opslaan.",
            "success"
        );
    } catch (error) {
        console.error(error);
        showMessage(error.message || "Upload mislukt.", "error");
    } finally {
        event.target.value = "";
    }
});

saveSpecialBtn.addEventListener("click", async () => {
    const imageUrl =
        pendingSpecialUpload?.secure_url ||
        state.special.imageUrl;

    if (!imageUrl) {
        showMessage("Upload eerst een speciale foto.", "error");
        return;
    }

    const start = combineDateTime(
        startDateEl.value,
        startTimeEl.value || "00:00"
    );

    const end = combineDateTime(
        endDateEl.value,
        endTimeEl.value || "23:59"
    );

    if (!start || !end) {
        showMessage("Vul zowel de start- als einddatum in.", "error");
        return;
    }

    if (toTimestamp(end) <= toTimestamp(start)) {
        showMessage(
            "De einddatum/tijd moet na de startdatum/tijd liggen.",
            "error"
        );
        return;
    }

    try {
        await set(ref(db, `${DB_PATH}/special`), {
            imageUrl,
            publicId:
                pendingSpecialUpload?.public_id ||
                state.special.publicId ||
                "",
            created:
                pendingSpecialUpload
                    ? Date.now()
                    : state.special.created || Date.now(),
            start,
            end
        });

        pendingSpecialUpload = null;
        showMessage("Speciale foto opgeslagen en ingepland.", "success");
    } catch (error) {
        console.error(error);
        showMessage("De speciale foto kon niet worden opgeslagen.", "error");
    }
});

clearSpecialBtn.addEventListener("click", async () => {
    if (!state.special.imageUrl) {
        showMessage("Er is geen speciale foto ingesteld.");
        return;
    }

    if (!window.confirm("Wil je de speciale foto en de planning verwijderen?")) {
        return;
    }

    try {
        await remove(ref(db, `${DB_PATH}/special`));
        pendingSpecialUpload = null;
        showMessage(
            "Speciale foto verwijderd. De basisfoto blijft actief.",
            "success"
        );
    } catch (error) {
        console.error(error);
        showMessage("De speciale foto kon niet worden verwijderd.", "error");
    }
});

function renderCurrent() {
    const active = getActivePhoto();
    setCurrent(active.label, active.reason);
}

function setCurrent(label, reason) {
    currentPhotoLabelEl.textContent = label;
    currentReasonEl.textContent = reason;
    lastCheckEl.textContent = new Date().toLocaleString("nl-NL");
}

function getActivePhoto() {
    if (isSpecialActive()) {
        return {
            label: "Speciale foto",
            reason: "Nu actief volgens planning"
        };
    }

    const selected = state.basePhotos[state.selectedBase];

    if (selected?.imageUrl) {
        return {
            label: `Foto ${state.selectedBase.replace("foto", "")}`,
            reason: "Gekozen basisfoto"
        };
    }

    const firstAvailable = BASE_SLOTS.find(
        (slot) => state.basePhotos[slot]?.imageUrl
    );

    if (firstAvailable) {
        return {
            label: `Foto ${firstAvailable.replace("foto", "")}`,
            reason: "Eerste beschikbare basisfoto"
        };
    }

    return {
        label: "Geen foto",
        reason: "Nog niets ingesteld"
    };
}

function updateSpecialStatus() {
    if (!state.special.imageUrl) {
        specialStatusEl.textContent = "Geen speciale foto";
        specialStatusEl.className = "af-badge af-badge-neutral";
        return;
    }

    const now = Date.now();
    const start = toTimestamp(state.special.start);
    const end = toTimestamp(state.special.end);

    if (!start || !end) {
        specialStatusEl.textContent = "Foto aanwezig – nog niet gepland";
        specialStatusEl.className = "af-badge af-badge-warn";
        return;
    }

    if (now < start) {
        specialStatusEl.textContent = "🟡 Gepland";
        specialStatusEl.className = "af-badge af-badge-warn";
        return;
    }

    if (now <= end) {
        specialStatusEl.textContent = "🟢 Nu actief";
        specialStatusEl.className = "af-badge af-badge-good";
        return;
    }

    specialStatusEl.textContent = "⚪ Verlopen";
    specialStatusEl.className = "af-badge af-badge-neutral";
}

function isSpecialActive() {
    if (
        !state.special.imageUrl ||
        !state.special.start ||
        !state.special.end
    ) {
        return false;
    }

    const now = Date.now();
    const start = toTimestamp(state.special.start);
    const end = toTimestamp(state.special.end);

    return now >= start && now <= end;
}

setInterval(() => {
    updateSpecialStatus();
    renderCurrent();
}, 30_000);

async function uploadToCloudinary(file) {
    if (!file.type.startsWith("image/")) {
        throw new Error("Alleen afbeeldingen zijn toegestaan.");
    }

    const form = new FormData();
    form.append("file", file);
    form.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    uploadProgressEl.hidden = false;
    uploadProgressBarEl.style.width = "20%";

    try {
        const response = await fetch(CLOUDINARY_UPLOAD_URL, {
            method: "POST",
            body: form
        });

        uploadProgressBarEl.style.width = "80%";

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data?.error?.message || "Cloudinary upload mislukt."
            );
        }

        if (!data.secure_url) {
            throw new Error("Cloudinary gaf geen afbeelding-URL terug.");
        }

        uploadProgressBarEl.style.width = "100%";
        return data;
    } finally {
        setTimeout(() => {
            uploadProgressEl.hidden = true;
            uploadProgressBarEl.style.width = "0%";
        }, 350);
    }
}

function combineDateTime(date, time) {
    if (!date) return "";
    return `${date}T${time}:00`;
}

function toTimestamp(value) {
    if (!value) return 0;
    const timestamp = new Date(value).getTime();
    return Number.isNaN(timestamp) ? 0 : timestamp;
}

function getDatePart(value) {
    return value ? value.slice(0, 10) : "";
}

function getTimePart(value, fallback) {
    return value ? value.slice(11, 16) : fallback;
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
    messageEl.className = `af-message show ${type}`;

    messageTimer = setTimeout(() => {
        messageEl.className = "af-message";
    }, 4500);
}
