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
// ======================================================
// ZOEKEN
// ======================================================

searchInput.addEventListener("input", () => {

    const zoek = searchInput.value.toLowerCase();

    const resultaat = inschrijvingen.filter(item => {

        const naam =
            `${item.voornaam} ${item.achternaam}`.toLowerCase();

        return naam.includes(zoek);

    });

    toonInschrijvingen(resultaat);

});

// ======================================================
// KNOPPEN
// ======================================================

container.addEventListener("click", async e => {

    const knop = e.target.closest("button");

    if (!knop) return;

    const id = knop.dataset.id;

    const gegevens = inschrijvingen.find(
        item => item.id === id
    );

    if (!gegevens) return;

    // ==========================================
    // OPEN
    // ==========================================

    if (knop.classList.contains("openButton")) {

        detailContent.innerHTML = `

            <h2>${gegevens.voornaam} ${gegevens.achternaam}</h2>

            <p><b>Geboortedatum:</b> ${gegevens.geboortedatum}</p>

            <p><b>Woonplaats:</b> ${gegevens.woonplaats}</p>

            <p><b>E-mail:</b> ${gegevens.email}</p>

            <p><b>Telefoon:</b> ${gegevens.telefoon || ""}</p>

            <hr>

            <h3>Handtekening</h3>

            <img
                src="${gegevens.handtekening}"
                style="
                    max-width:300px;
                    border:1px solid #ccc;
                    padding:10px;
                    background:#fff;
                ">

        `;

        detailModal.style.display = "block";

    }

    // ==========================================
    // VERWIJDEREN
    // ==========================================

    if (knop.classList.contains("deleteButton")) {

        const antwoord = confirm(

            `Wilt u ${gegevens.voornaam} ${gegevens.achternaam} verwijderen?`

        );

        if (!antwoord) return;

        try {

            await remove(

                ref(
                    db,
                    "inschrijvingen/" + id
                )

            );

            alert("Inschrijving verwijderd.");

        }

        catch (error) {

            console.error(error);

            alert("Verwijderen mislukt.");

        }

    }

});

console.log("✅ Module Inschrijvingen gereed.");
