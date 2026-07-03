import {
    initSheets,
    getProeftrainingen
} from "./googleSheets.js";

// ==========================================
// HV NOVITAS - PROEFTRAININGEN
// ==========================================

const container = document.getElementById("proeftrainingen");

// ==========================================
// Laden
// ==========================================

async function laadProeftrainingen() {

    if (!container) {

        console.error("Container #proeftrainingen niet gevonden.");

        return;

    }

    container.innerHTML = "<p>⏳ Proeftrainingen laden...</p>";

    try {

        await initSheets();

        const aanvragen = await getProeftrainingen();

        toonProeftrainingen(aanvragen);

    }

    catch (error) {

        console.error(error);

        container.innerHTML = `

<div class="bericht">

<h3>❌ Fout</h3>

<p>

De proeftrainingen konden niet worden geladen.

</p>

<pre style="white-space:pre-wrap;">
${error.message || error}
</pre>

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

Nog geen proeftrainingen gevonden.

</div>

`;

        return;

    }

    let html = "";

    data.forEach((p) => {

        const naam =
            `${p.voornaam || ""} ${p.Achternaam || p.achternaam || ""}`.trim();

        html += `

<div class="bericht">

<h3>${naam}</h3>

<p>

<strong>Geslacht</strong><br>
${p.Geslacht || p.geslacht || "-"}

</p>

<p>

<strong>Geboortedatum</strong><br>
${formatDatum(
    p.Geboortedatum ||
    p.geboortedatum
)}

</p>

<p>

<strong>Telefoon</strong><br>
${p.Telefoonnummer || p.telefoonnummer || "-"}

</p>

<p>

<strong>E-mail</strong><br>
${p["E-mail"] || p.email || "-"}

</p>

<p>

<strong>Opmerkingen</strong><br>
${p.Opmerkingen || "-"}

</p>

<p>

<strong>Aangevraagd</strong><br>
${formatDatum(
    p.Tijdstempel ||
    p.tijdstempel
)}

</p>

</div>

`;

    });

    container.innerHTML = html;

}

// ==========================================
// Datum formatteren
// ==========================================

function formatDatum(waarde) {

    if (!waarde) return "-";

    const datum = new Date(waarde);

    if (isNaN(datum)) {

        return waarde;

    }

    return datum.toLocaleDateString("nl-NL");

}

// ==========================================

laadProeftrainingen();
