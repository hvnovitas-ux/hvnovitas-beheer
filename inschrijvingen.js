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

const loading =
    document.getElementById(
        "loading"
    );

const geenResultaten =
    document.getElementById(
        "geenResultaten"
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

        detailModal.style.display = "none";

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
    "✅ Inschrijvingen gereed."
);
// ======================================================
// FIREBASE LADEN
// ======================================================

onValue(

    ref(db, "inschrijvingen"),

    snapshot => {

        loading.style.display = "none";

        inschrijvingen = [];

        container.innerHTML = "";

        if (!snapshot.exists()) {

            geenResultaten.style.display = "block";

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
// INSCHRIJVINGEN TONEN
// ======================================================

function toonInschrijvingen(lijst) {

    container.innerHTML = "";

    if (lijst.length === 0) {

        geenResultaten.style.display =
            "block";

        return;

    }

    geenResultaten.style.display =
        "none";

    lijst.forEach(item => {

        container.innerHTML += `

            <div class="inschrijving-card">

                <h3>

                    👤 ${item.voornaam}
                    ${item.achternaam}

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

searchInput.addEventListener(

    "input",

    () => {

        const zoek =
            searchInput.value
            .toLowerCase();

        const resultaat =
            inschrijvingen.filter(item => {

                const naam =

                    `${item.voornaam} ${item.achternaam}`
                    .toLowerCase();

                return naam.includes(zoek);

            });

        toonInschrijvingen(
            resultaat
        );

    }

);
// ======================================================
// DETAILS TONEN
// ======================================================

container.addEventListener("click", async e => {

    // ------------------------------------------
    // OPEN
    // ------------------------------------------

    if (e.target.classList.contains("openButton")) {

        const id =
            e.target.dataset.id;

        const gegevens =
            inschrijvingen.find(

                item => item.id === id

            );

        if (!gegevens) return;

        detailContent.innerHTML = `

            <h3>Persoonsgegevens</h3>

            <p><b>Naam:</b> ${gegevens.voornaam} ${gegevens.achternaam}</p>

            <p><b>Geslacht:</b> ${gegevens.geslacht}</p>

            <p><b>Geboortedatum:</b> ${gegevens.geboortedatum}</p>

            <p><b>Geboorteplaats:</b> ${gegevens.geboorteplaats}</p>

            <p><b>Nationaliteit:</b> ${gegevens.nationaliteit}</p>

            <hr>

            <h3>Adres</h3>

            <p><b>Straat:</b> ${gegevens.straat} ${gegevens.huisnummer}</p>

            <p><b>Postcode:</b> ${gegevens.postcode}</p>

            <p><b>Woonplaats:</b> ${gegevens.woonplaats}</p>

            <hr>

            <h3>Contact</h3>

            <p><b>E-mail:</b> ${gegevens.email}</p>

            <p><b>Telefoon:</b> ${gegevens.telefoon}</p>

            <hr>

            <h3>Handbal</h3>

            <p><b>Eerder lid:</b> ${gegevens.eerderLid}</p>

            <p><b>Vereniging:</b> ${gegevens.vereniging || "-"}</p>

            <hr>

            <h3>Ouder / Verzorger</h3>

            <p><b>Naam:</b> ${gegevens.ouderNaam || "-"}</p>

            <p><b>E-mail:</b> ${gegevens.ouderEmail || "-"}</p>

            <p><b>Telefoon:</b> ${gegevens.ouderTelefoon || "-"}</p>

            <hr>

            <h3>Handtekening</h3>

            <img
                src="${gegevens.handtekening}"
                style="
                    width:220px;
                    border:1px solid #ccc;
                    padding:10px;
                    background:#fff;
                ">

        `;

        detailModal.style.display =
            "block";

    }

    // ------------------------------------------
    // VERWIJDEREN
    // ------------------------------------------

    if (e.target.classList.contains("deleteButton")) {

        const id =
            e.target.dataset.id;

        const gegevens =
            inschrijvingen.find(

                item => item.id === id

            );

        if (!gegevens) return;

        const antwoord =
            confirm(

                `Weet u zeker dat u de inschrijving van ${gegevens.voornaam} ${gegevens.achternaam} wilt verwijderen?`

            );

        if (!antwoord) return;

        try {

            await remove(

                ref(

                    db,

                    "inschrijvingen/" + id

                )

            );

            console.log(

                "🗑 Inschrijving verwijderd."

            );

        }

        catch (error) {

            console.error(error);

            alert(

                "Verwijderen is mislukt."

            );

        }

    }

});

// ======================================================
// EINDE
// ======================================================

console.log(
    "✅ Module Inschrijvingen gereed."
);
