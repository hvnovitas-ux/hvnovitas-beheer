import { db } from "./firebase.js";

import {
    ref,
    onValue,
    remove,
    update
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

// ==========================================
// Elementen
// ==========================================

const lijst = document.getElementById("proeftrainingen");

if (!lijst) {
    console.error("Element #proeftrainingen niet gevonden.");
}

// ==========================================
// Aanvragen laden
// ==========================================

onValue(ref(db, "proeftrainingen"), (snapshot) => {

    if (!lijst) return;

    let aanvragen = [];

    snapshot.forEach((item) => {

        aanvragen.push({

            id: item.key,

            ...item.val()

        });

    });

    aanvragen.sort((a, b) => b.created - a.created);

    if (aanvragen.length === 0) {

        lijst.innerHTML = "Nog geen aanvragen.";

        return;

    }

    let html = "";

    aanvragen.forEach((a) => {

        html += `

<div class="bericht">

<h3>${a.voornaam} ${a.achternaam}</h3>

<p><strong>Status:</strong> ${a.status}</p>

<p><strong>Geslacht:</strong> ${a.geslacht}</p>

<p><strong>Geboortedatum:</strong> ${a.geboortedatum}</p>

<p><strong>Telefoon:</strong> ${a.telefoon}</p>

<p><strong>E-mail:</strong> ${a.email}</p>

<p><strong>Datum aanvraag:</strong> ${a.datum}</p>

<p><strong>Opmerkingen:</strong><br>${a.opmerkingen || "-"}</p>

<button onclick="status('${a.id}')">
✅ Contact opgenomen
</button>

<button onclick="verwijder('${a.id}')">
🗑️ Verwijderen
</button>

</div>

`;

    });

    lijst.innerHTML = html;

});

// ==========================================
// Status wijzigen
// ==========================================

window.status = async function(id) {

    await update(ref(db, "proeftrainingen/" + id), {

        status: "Contact opgenomen"

    });

}

// ==========================================
// Verwijderen
// ==========================================

window.verwijder = async function(id) {

    if (!confirm("Aanvraag verwijderen?")) return;

    await remove(ref(db, "proeftrainingen/" + id));

}
