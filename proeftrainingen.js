import { db } from "./firebase.js";

import {
    ref,
    push
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

// ==========================================
// Elementen
// ==========================================

const voornaam = document.getElementById("voornaam");
const achternaam = document.getElementById("achternaam");
const geslacht = document.getElementById("geslacht");
const geboortedatum = document.getElementById("geboortedatum");
const telefoon = document.getElementById("telefoon");
const email = document.getElementById("email");
const opmerkingen = document.getElementById("opmerkingen");

const verstuur = document.getElementById("verstuur");
const melding = document.getElementById("melding");

// ==========================================
// Versturen
// ==========================================

verstuur.addEventListener("click", async () => {

    if (voornaam.value.trim() === "") {
        alert("Vul je voornaam in.");
        return;
    }

    if (achternaam.value.trim() === "") {
        alert("Vul je achternaam in.");
        return;
    }

    if (geslacht.value === "") {
        alert("Kies een geslacht.");
        return;
    }

    if (geboortedatum.value === "") {
        alert("Vul je geboortedatum in.");
        return;
    }

    if (telefoon.value.trim() === "") {
        alert("Vul je telefoonnummer in.");
        return;
    }

    if (email.value.trim() === "") {
        alert("Vul je e-mailadres in.");
        return;
    }

    verstuur.disabled = true;

    melding.textContent = "⏳ Aanvraag versturen...";

    try {

        const aanvraag = {

            voornaam: voornaam.value.trim(),

            achternaam: achternaam.value.trim(),

            geslacht: geslacht.value,

            geboortedatum: geboortedatum.value,

            telefoon: telefoon.value.trim(),

            email: email.value.trim(),

            opmerkingen: opmerkingen.value.trim(),

            status: "Nieuw",

            datum: new Date().toLocaleDateString("nl-NL"),

            created: Date.now()

        };

        await push(ref(db, "proeftrainingen"), aanvraag);

        melding.textContent =
            "✅ Je aanvraag is verzonden. We nemen zo snel mogelijk contact met je op.";

        voornaam.value = "";
        achternaam.value = "";
        geslacht.value = "";
        geboortedatum.value = "";
        telefoon.value = "";
        email.value = "";
        opmerkingen.value = "";

    } catch (error) {

        console.error(error);

        melding.textContent =
            "❌ Er is iets misgegaan. Probeer het later opnieuw.";

    }

    verstuur.disabled = false;

});
