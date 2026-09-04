import { db } from "./firebase.js";

import {
    ref,
    onValue
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

console.log("📷 Aankondigingspagina geladen");

const image = document.getElementById("announcementImage");
const loading = document.getElementById("loading");
const empty = document.getElementById("empty");

const BASE_SLOTS = ["foto1", "foto2", "foto3"];

onValue(
    ref(db, "aankondigingsfoto"),
    (snapshot) => {

        const data = snapshot.val() || {};

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
                ? new Date(special.start).getTime()
                : 0;

        const end =
            special.end
                ? new Date(special.end).getTime()
                : 0;

        const specialActive =
            !!special.imageUrl &&
            start > 0 &&
            end > 0 &&
            now >= start &&
            now <= end;

        let imageUrl = "";

        // ---------------------------------------------
        // SPECIALE FOTO
        // ---------------------------------------------

        if (specialActive) {

            imageUrl =
                special.imageUrl;

        } else {

            // -----------------------------------------
            // GEKOZEN BASISFOTO
            // -----------------------------------------

            imageUrl =
                basePhotos[selectedBase]?.imageUrl || "";

            // -----------------------------------------
            // VEILIGE FALLBACK
            // -----------------------------------------

            if (!imageUrl) {

                for (
                    const slot of BASE_SLOTS
                ) {

                    if (
                        basePhotos[slot]?.imageUrl
                    ) {

                        imageUrl =
                            basePhotos[slot].imageUrl;

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

            empty.hidden =
                true;

        } else {

            image.removeAttribute(
                "src"
            );

            image.hidden =
                true;

            empty.hidden =
                false;
        }
    },
    (error) => {

        console.error(
            "❌ Fout bij laden aankondigingsfoto:",
            error
        );

        loading.hidden =
            true;

        image.hidden =
            true;

        empty.textContent =
            "De aankondigingsfoto kon niet worden geladen.";

        empty.hidden =
            false;
    }
);
