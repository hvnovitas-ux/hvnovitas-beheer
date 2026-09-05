import { db } from "./firebase.js";
import {
    ref,
    onValue
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const image = document.getElementById("aankondigingsfoto");
const DB_PATH = "aankondigingsfoto";
const BASE_SLOTS = ["foto1", "foto2", "foto3"];

if (!image) {
    console.error("📷 Aankondigingsfoto-element ontbreekt.");
} else {
    onValue(ref(db, DB_PATH), (snapshot) => {
        const data = snapshot.val() || {};

        const basePhotos = data.basePhotos || {};
        const selectedBase = data.selectedBase || "foto1";
        const special = data.special || {};

        const now = Date.now();
        const start = toTimestamp(special.start);
        const end = toTimestamp(special.end);

        const specialActive =
            Boolean(special.imageUrl) &&
            Boolean(start) &&
            Boolean(end) &&
            now >= start &&
            now <= end;

        let imageUrl = "";

        if (specialActive) {
            imageUrl = special.imageUrl;
        } else {
            imageUrl =
                basePhotos[selectedBase]?.imageUrl ||
                findFirstBase(basePhotos);
        }

        if (imageUrl) {
            image.src = imageUrl;
            image.hidden = false;
        } else {
            image.removeAttribute("src");
            image.hidden = true;
        }
    }, (error) => {
        console.error("Aankondigingsfoto Firebase-fout:", error);
        image.hidden = true;
    });
}

function findFirstBase(basePhotos) {
    for (const slot of BASE_SLOTS) {
        if (basePhotos[slot]?.imageUrl) {
            return basePhotos[slot].imageUrl;
        }
    }
    return "";
}

function toTimestamp(value) {
    if (!value) return 0;
    const timestamp = new Date(value).getTime();
    return Number.isNaN(timestamp) ? 0 : timestamp;
}

