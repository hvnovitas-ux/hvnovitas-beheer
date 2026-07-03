// ==========================================
// HV NOVITAS - PROEFTRAININGEN
// ==========================================

import {
    initSheets,
    getProeftrainingen
} from "./googleSheets.js";

const status = document.getElementById("status");
const container = document.getElementById("proeftrainingen");

// ==========================================
// Pagina laden
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

    await laadProeftrainingen();

});

// ==========================================
// Proeftrainingen laden
// ==========================================

async function laadProeftrainingen() {

    try {

        status.textContent = "Google Sheets verbinden...";

        await initSheets();

        status.textContent = "Proeftrainingen ophalen...";

        const aanvragen = await getProeftrainingen();

        toonProeftrainingen(aanvragen);

        status.textContent =
            `${aanvragen.length} proeftraining(en) gevonden`;

    }

    catch (error) {

        console.error(error);

        status.textContent = "Fout bij laden.";

        container.innerHTML = `

        <div class="bericht">

            <h3>❌ Fout</h3>

            <p>${error.message || error}</p>

        </div>

        `;

    }

}

// ==========================================
// Tonen
// ==========================================

function toonProeftrainingen(data) {

    if (!data || data.length === 0) {

        container.innerHTML = `

        <div class="bericht">

            Geen proeftrainingen gevonden.

        </div>

        `;

        return;

    }

    let html = "";

    data.forEach((persoon) => {

        html += `

        <div class="bericht">

            <h3>

                ${persoon.voornaam || ""}

                ${persoon.Achternaam || ""}

            </h3>

            <p>

                <strong>Geslacht:</strong><br>

                ${persoon.Geslacht || "-"}

            </p>

            <p>

                <strong>Geboortedatum:</strong><br>

                ${formatDatum(persoon.Geboortedatum)}

            </p>

            <p>

                <strong>Telefoon:</strong><br>

                ${persoon.Telefoonnummer || "-"}

            </p>

            <p>

                <strong>E-mail:</strong><br>

                <a href="mailto:${persoon["E-mail"] || ""}">
                    ${persoon["E-mail"] || "-"}
                </a>

            </p>

            <p>

                <strong>Opmerkingen:</strong><br>

                ${persoon.Opmerkingen || "-"}

            </p>

            <p>

                <strong>Aanvraag:</strong><br>

                ${formatDatum(persoon.Tijdstempel)}

            </p>

            <div class="knoppen">

                <button onclick="window.location.href='tel:${persoon.Telefoonnummer || ""}'">
                    📞 Bellen
                </button>

                <button onclick="window.location.href='mailto:${persoon["E-mail"] || ""}'">
                    📧 Mail
                </button>

            </div>

        </div>

        `;

    });

    container.innerHTML = html;

}

// ==========================================
// Datum formatteren
// ==========================================

function formatDatum(datum) {

    if (!datum) return "-";

    const d = new Date(datum);

    if (isNaN(d)) {

        return datum;

    }

    return d.toLocaleDateString("nl-NL");

}
