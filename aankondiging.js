import { db } from "./firebase.js";

import {
    ref,
    onValue
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

console.log("📷 Alleen-foto Aankondigingspagina geladen");

const foto = document.getElementById("aankondigingFoto");

const BASISFOTOS = ["foto1", "foto2", "foto3"];

onValue(
    ref(db, "aankondigingsfoto"),
    (snapshot) => {

        const data = snapshot.val() || {};

        const basisfotos = data.basePhotos || {};
        const gekozenBasis = data.selectedBase || "foto1";
        const speciale = data.special || {};

        let imageUrl = "";

        // =========================================
        // SPECIALE FOTO CONTROLEREN
        // =========================================

        const nu = Date.now();

        const start = speciale.start
            ? new Date(speciale.start).getTime()
            : 0;

        const einde = speciale.end
            ? new Date(speciale.end).getTime()
            : 0;

        const specialeActief =
            Boolean(speciale.imageUrl) &&
            start > 0 &&
            einde > 0 &&
            nu >= start &&
            nu <= einde;

        // =========================================
        // JUISTE FOTO KIEZEN
        // =========================================

        if (specialeActief) {

            imageUrl = speciale.imageUrl;

        } else {

            imageUrl =
                basisfotos[gekozenBasis]?.imageUrl || "";

            // Veilige fallback
            if (!imageUrl) {

                for (const slot of BASISFOTOS) {

                    if (basisfotos[slot]?.imageUrl) {

                        imageUrl =
                            basisfotos[slot].imageUrl;

                        break;
                    }
                }
            }
        }

        // =========================================
        // ALLEEN DE FOTO TONEN
        // =========================================

        if (imageUrl) {

            foto.src = imageUrl;
            foto.hidden = false;

        } else {

            foto.removeAttribute("src");
            foto.hidden = true;
        }
    }
);
