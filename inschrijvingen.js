/*
=========================================================
HV NOVITAS
Module : Inschrijvingen
Bestand: inschrijvingen.js
Versie : 1.0
=========================================================
*/

import { db } from "./firebase.js";

import {
    ref,
    onValue,
    remove
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

console.log("📋 Module Inschrijvingen geladen");

// ======================================================
// ELEMENTEN
// ======================================================

const container =
    document.getElementById("inschrijvingenContainer");

const searchInput =
    document.getElementById("searchInput");

const detailModal =
    document.getElementById("detailModal");

const detailContent =
    document.getElementById("detailContent");

const closeModal =
    document.getElementById("closeModal");

// ======================================================
// GEGEVENS
// ======================================================

let inschrijvingen = [];

// ======================================================
// MODAL
// ======================================================

closeModal.addEventListener("click", () => {

    detailModal.style.display = "none";

});

window.addEventListener("click", e => {

    if (e.target === detailModal) {

        detailModal.style.display = "none";

    }

});

// ======================================================
// FIREBASE
// ======================================================

onValue(

    ref(db, "inschrijvingen"),

    snapshot => {

        inschrijvingen = [];

        container.innerHTML = "";

        if (!snapshot.exists()) {

            container.innerHTML = `

                <div class="inschrijving-card">

                    <h3>

                        Er zijn nog geen inschrijvingen.

                    </h3>

                </div>

            `;

            return;

        }

        snapshot.forEach(item => {

            inschrijvingen.push({

                id: item.key,

                ...item.val()

            });

        });

        toonInschrijvingen(inschrijvingen);

    }

);

console.log("✅ Firebase gekoppeld.");
// ======================================================
// KAARTEN TONEN
// ======================================================

function toonInschrijvingen(lijst) {

    container.innerHTML = "";

    lijst.forEach(item => {

        container.innerHTML += `

            <div class="inschrijving-card">

                <h3>

                    👤 ${item.voornaam} ${item.achternaam}

                </h3>

                <p>📅 ${item.geboortedatum}</p>

                <p>📍 ${item.woonplaats}</p>

                <p>📧 ${item.email}</p>

                <div class="card-buttons">

                    <button
                        class="openButton"
                        data-id="${item.id}">

                        Open

                    </button>

                    <button
                        class="deleteButton"
                        data-id="${item.id}">

                        Verwijderen

                    </button>

                </div>

            </div>

        `;

    });

}

// ======================================================
// ZOEKEN
// ======================================================

searchInput.addEventListener("input", () => {

    const zoek =
        searchInput.value.toLowerCase();

    const resultaat =
        inschrijvingen.filter(item => {

            return (`${item.voornaam} ${item.achternaam}`)
                .toLowerCase()
                .includes(zoek);

        });

    toonInschrijvingen(resultaat);

});

// ======================================================
// POPUP OPENEN
// ======================================================

container.addEventListener("click", e => {

    const knop =
        e.target.closest("button");

    if (!knop) return;

    if (!knop.classList.contains("openButton")) return;

    const gegevens =
        inschrijvingen.find(

            item => item.id === knop.dataset.id

        );

    if (!gegevens) return;

    detailContent.innerHTML = `

        <h2>

            ${gegevens.voornaam}
            ${gegevens.achternaam}

        </h2>

        <hr>

        <h3>👤 Persoonsgegevens</h3>

        <p><b>Voornaam:</b> ${gegevens.voornaam}</p>

        <p><b>Achternaam:</b> ${gegevens.achternaam}</p>

        <p><b>Geslacht:</b> ${gegevens.geslacht}</p>

        <p><b>Geboortedatum:</b> ${gegevens.geboortedatum}</p>

        <p><b>Geboorteplaats:</b> ${gegevens.geboorteplaats}</p>

        <p><b>Nationaliteit:</b> ${gegevens.nationaliteit}</p>

        <hr>

        <h3>🏠 Adres</h3>

        <p><b>Straat:</b> ${gegevens.straat}</p>

        <p><b>Huisnummer:</b> ${gegevens.huisnummer}</p>

        <p><b>Postcode:</b> ${gegevens.postcode}</p>

        <p><b>Woonplaats:</b> ${gegevens.woonplaats}</p>

        <hr>

        <h3>☎ Contact</h3>

        <p><b>E-mail:</b> ${gegevens.email}</p>

        <p><b>Telefoon:</b> ${gegevens.telefoon}</p>

        <hr>

        <h3>🤾 Handbal</h3>

        <p><b>Eerder lid:</b> ${gegevens.eerderLid}</p>

        <p><b>Vereniging:</b> ${gegevens.vereniging || "-"}</p>

        <hr>

        <h3>👨 Ouder / Verzorger</h3>

        <p><b>Naam:</b> ${gegevens.ouderNaam || "-"}</p>

        <p><b>E-mail:</b> ${gegevens.ouderEmail || "-"}</p>

        <p><b>Telefoon:</b> ${gegevens.ouderTelefoon || "-"}</p>

        <hr>

        <h3>✍ Handtekening</h3>

        <img
            src="${gegevens.handtekening}"
            style="
                max-width:320px;
                border:1px solid #ccc;
                padding:10px;
                background:white;
            ">

        <hr>

        <div id="actieKnoppen"></div>

    `;

    detailModal.style.display = "block";

});
// ======================================================
// ACTIES
// ======================================================

container.addEventListener("click", async e => {

    const knop = e.target.closest("button");

    if (!knop) return;

    const id = knop.dataset.id;

    const gegevens =
        inschrijvingen.find(item => item.id === id);

    if (!gegevens) return;

    // ==========================================
    // VERWIJDEREN
    // ==========================================

    if (knop.classList.contains("deleteButton")) {

        const antwoord = confirm(

            `Wilt u de inschrijving van ${gegevens.voornaam} ${gegevens.achternaam} verwijderen?`

        );

        if (!antwoord) return;

        try {

            await remove(
                ref(db, "inschrijvingen/" + id)
            );

            alert("✅ Inschrijving verwijderd.");

        }

        catch (error) {

            console.error(error);

            alert("❌ Verwijderen mislukt.");

        }

    }

});

// ======================================================
// PRINTKNOP
// ======================================================

detailContent.addEventListener("click", e => {

    if (e.target.id !== "printButton") return;

    window.print();

});

// ======================================================
// PRINTKNOP TOEVOEGEN
// ======================================================

const observer = new MutationObserver(() => {

    const actie =
        document.getElementById("actieKnoppen");

    if (!actie) return;

    actie.innerHTML = `

        <button
            id="printButton"
            class="openButton">

            🖨 Afdrukken / Opslaan als PDF

        </button>

    `;

});

observer.observe(detailContent, {

    childList: true,

    subtree: true

});

// ======================================================
// EINDE
// ======================================================

console.log(
    "✅ Module Inschrijvingen gereed."
);
