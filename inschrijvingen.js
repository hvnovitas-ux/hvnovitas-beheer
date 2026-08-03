/*
=========================================================
HV NOVITAS
Module : Inschrijvingen
Bestand: inschrijvingen.js
Versie : 2.0
=========================================================
*/

import { db } from "./firebase.js";

import {
    ref,
    onValue,
    remove
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

// =====================================================
// ELEMENTEN
// =====================================================

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

const printButton =
    document.getElementById("printButton");

const deleteButton =
    document.getElementById("deleteButton");

// =====================================================
// GEGEVENS
// =====================================================

let inschrijvingen = [];

let huidigeInschrijving = null;

// =====================================================
// INITIALISEREN
// =====================================================

init();

function init() {

    laadInschrijvingen();

    closeModal.addEventListener(
        "click",
        sluitPopup
    );

    window.addEventListener(
        "click",
        e => {

            if (e.target === detailModal) {

                sluitPopup();

            }

        }
    );

    searchInput.addEventListener(
        "input",
        zoeken
    );

    printButton.addEventListener(
        "click",
        printInschrijving
    );

    deleteButton.addEventListener(
        "click",
        verwijderInschrijving
    );

}

function sluitPopup() {

    detailModal.style.display = "none";

}
// =====================================================
// FIREBASE LADEN
// =====================================================

function laadInschrijvingen() {

    onValue(

        ref(db, "inschrijvingen"),

        snapshot => {

            inschrijvingen = [];

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

            toonKaarten(inschrijvingen);

        }

    );

}

// =====================================================
// KAARTEN
// =====================================================

function toonKaarten(lijst) {

    container.innerHTML = "";

    lijst.forEach(item => {

        container.innerHTML += `

            <div class="inschrijving-card">

                <h3>

                    👤 ${item.voornaam} ${item.achternaam}

                </h3>

                <p>

                    📅 ${item.geboortedatum}

                </p>

                <p>

                    📍 ${item.woonplaats}

                </p>

                <p>

                    📧 ${item.email}

                </p>

                <div class="card-buttons">

                    <button

                        class="openButton"

                        data-id="${item.id}">

                        Open

                    </button>

                </div>

            </div>

        `;

    });

}

// =====================================================
// ZOEKEN
// =====================================================

function zoeken() {

    const tekst =
        searchInput.value
        .trim()
        .toLowerCase();

    if (tekst === "") {

        toonKaarten(inschrijvingen);

        return;

    }

    const resultaat = inschrijvingen.filter(item => {

        const naam =

            `${item.voornaam} ${item.achternaam}`
            .toLowerCase();

        return naam.includes(tekst);

    });

    toonKaarten(resultaat);

}
// =====================================================
// OPEN INSCHRIJVING
// =====================================================

container.addEventListener("click", e => {

    const knop = e.target.closest(".openButton");

    if (!knop) return;

    const id = knop.dataset.id;

    huidigeInschrijving =
        inschrijvingen.find(
            item => item.id === id
        );

    if (!huidigeInschrijving) return;

    detailContent.innerHTML = `

        <h2>HV Novitas - Inschrijfformulier</h2>

        <hr>

        <h3>👤 Persoonsgegevens</h3>

        <p><b>Voornaam:</b> ${huidigeInschrijving.voornaam || ""}</p>
        <p><b>Achternaam:</b> ${huidigeInschrijving.achternaam || ""}</p>
        <p><b>Geslacht:</b> ${huidigeInschrijving.geslacht || ""}</p>
        <p><b>Geboortedatum:</b> ${huidigeInschrijving.geboortedatum || ""}</p>
        <p><b>Geboorteplaats:</b> ${huidigeInschrijving.geboorteplaats || ""}</p>
        <p><b>Nationaliteit:</b> ${huidigeInschrijving.nationaliteit || ""}</p>

        <hr>

        <h3>🏠 Adres</h3>

        <p><b>Straat:</b> ${huidigeInschrijving.straat || ""}</p>
        <p><b>Huisnummer:</b> ${huidigeInschrijving.huisnummer || ""}</p>
        <p><b>Postcode:</b> ${huidigeInschrijving.postcode || ""}</p>
        <p><b>Woonplaats:</b> ${huidigeInschrijving.woonplaats || ""}</p>

        <hr>

        <h3>☎ Contact</h3>

        <p><b>E-mail:</b> ${huidigeInschrijving.email || ""}</p>
        <p><b>Telefoon:</b> ${huidigeInschrijving.telefoon || ""}</p>

        <hr>

        <h3>🤾 Handbal</h3>

        <p><b>Eerder lid:</b> ${huidigeInschrijving.eerderLid || ""}</p>
        <p><b>Vereniging:</b> ${huidigeInschrijving.vereniging || "-"}</p>

        <hr>

        <h3>👨 Ouder / Verzorger</h3>

        <p><b>Naam:</b> ${huidigeInschrijving.ouderNaam || "-"}</p>
        <p><b>E-mail:</b> ${huidigeInschrijving.ouderEmail || "-"}</p>
        <p><b>Telefoon:</b> ${huidigeInschrijving.ouderTelefoon || "-"}</p>

        <hr>

        <h3>✍ Handtekening</h3>

        <img
            src="${huidigeInschrijving.handtekening || ""}"
            style="max-width:320px;border:1px solid #ccc;padding:10px;">

    `;

    detailModal.style.display = "block";

});

// =====================================================
// PRINTEN
// =====================================================

function printInschrijving() {

    window.print();

}

// =====================================================
// VERWIJDEREN
// =====================================================

async function verwijderInschrijving() {

    if (!huidigeInschrijving) return;

    const antwoord = confirm(

        `Wilt u ${huidigeInschrijving.voornaam} ${huidigeInschrijving.achternaam} verwijderen?`

    );

    if (!antwoord) return;

    try {

        await remove(

            ref(
                db,
                "inschrijvingen/" + huidigeInschrijving.id
            )

        );

        detailModal.style.display = "none";

        alert("✅ Inschrijving verwijderd.");

    }

    catch (error) {

        console.error(error);

        alert("❌ Verwijderen mislukt.");

    }

}

console.log("✅ Inschrijvingen gereed.");
