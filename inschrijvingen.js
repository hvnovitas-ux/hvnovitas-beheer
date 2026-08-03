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
    document.getElementById(
        "inschrijvingenContainer"
    );

const searchInput =
    document.getElementById(
        "searchInput"
    );

const detailModal =
    document.getElementById(
        "detailModal"
    );

const detailContent =
    document.getElementById(
        "detailContent"
    );

const closeModal =
    document.getElementById(
        "closeModal"
    );

// ======================================================
// GEGEVENS
// ======================================================

let inschrijvingen = [];

// ======================================================
// POPUP
// ======================================================

closeModal.addEventListener(
    "click",
    () => {

        detailModal.style.display =
            "none";

    }
);

window.addEventListener(
    "click",
    e => {

        if (
            e.target === detailModal
        ) {

            detailModal.style.display =
                "none";

        }

    }
);

// ======================================================
// START
// ======================================================

console.log(
    "✅ Basis geladen."
);
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

                        Geen inschrijvingen gevonden.

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

        toonInschrijvingen(
            inschrijvingen
        );

    }

);

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
