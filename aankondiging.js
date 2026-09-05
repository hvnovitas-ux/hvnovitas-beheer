import { db } from "./firebase.js";

import {
    ref,
    onValue
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

console.log("📷 Publieke Aankondigingsfoto geladen");

const image =
    document.getElementById("aankondigingFoto");

const loading =
    document.getElementById("loading");

const geenFoto =
    document.getElementById("geenFoto");

const BASE_SLOTS =
    ["foto1", "foto2", "foto3"];

onValue(
    ref(db, "aankondigingsfoto"),
    (snapshot) => {

        const data =
            snapshot.val() || {};

        const basePhotos =
            data.basePhotos || {};

        const selectedBase =
            data.selectedBase || "foto1";

        const special =
            data.special || {};

        const now =
            Date.now();

        const start =
            special.start
                ? new Date(
                    special.start
                ).getTime()
                : 0;

        const end =
            special.end
                ? new Date(
                    special.end
                ).getTime()
                : 0;

        const specialActive =
            !!special.imageUrl &&
            start > 0 &&
            end > 0 &&
            now >= start &&
            now <= end;

        let imageUrl = "";

        // =============================================
        // 1. SPECIALE FOTO ACTIEF?
        // =============================================

        if (specialActive) {

            imageUrl =
                special.imageUrl;

        } else {

            // =========================================
            // 2. GEKOZEN BASISFOTO
            // =========================================

            imageUrl =
                basePhotos[
                    selectedBase
                ]?.imageUrl || "";

            // =========================================
            // 3. VEILIGE FALLBACK
            // =========================================

            if (!imageUrl) {

                for (
                    const slot of BASE_SLOTS
                ) {

                    if (
                        basePhotos[slot]?.imageUrl
                    ) {

                        imageUrl =
                            basePhotos[
                                slot
                            ].imageUrl;

                        break;
                    }
                }
            }
        }

        loading.hidden = true;

        if (imageUrl) {

            image.src =
                imageUrl;

            image.hidden =
                false;

            geenFoto.hidden =
                true;

        } else {

            image.removeAttribute(
                "src"
            );

            image.hidden =
                true;

            geenFoto.hidden =
                false;
        }
    },
    (error) => {

        console.error(
            "❌ Aankondigingsfoto laden mislukt:",
            error
        );

        loading.hidden =
            true;

        image.hidden =
            true;

        geenFoto.textContent =
            "Aankondigingsfoto kon niet worden geladen.";

        geenFoto.hidden =
            false;
    }
);
