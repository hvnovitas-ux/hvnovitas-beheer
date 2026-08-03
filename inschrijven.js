/*
=========================================================
HV NOVITAS
Module : Inschrijven
Bestand: inschrijven.js
Versie : 1.0
=========================================================
*/

console.log("📋 Module Inschrijven geladen");

// ======================================================
// ELEMENTEN
// ======================================================

const geboortedatum = document.getElementById("geboortedatum");
const ouderCard = document.getElementById("ouderCard");

const canvas = document.getElementById("signatureCanvas");
const clearButton = document.getElementById("clearSignature");

const sendButton = document.getElementById("sendForm");
const message = document.getElementById("message");

// ======================================================
// LEEFTIJD BEREKENEN
// ======================================================

function berekenLeeftijd(datum){

    if(!datum) return 99;

    const geboorte = new Date(datum);
    const vandaag = new Date();

    let leeftijd = vandaag.getFullYear() - geboorte.getFullYear();

    const maand =
        vandaag.getMonth() - geboorte.getMonth();

    if(
        maand < 0 ||
        (
            maand === 0 &&
            vandaag.getDate() < geboorte.getDate()
        )
    ){

        leeftijd--;

    }

    return leeftijd;

}

// ======================================================
// OUDERBLOK TONEN
// ======================================================

function updateOuderBlok(){

    const leeftijd =
        berekenLeeftijd(geboortedatum.value);

    if(leeftijd < 18){

        ouderCard.style.display = "block";

    }else{

        ouderCard.style.display = "none";

    }

}

geboortedatum?.addEventListener(
    "change",
    updateOuderBlok
);

updateOuderBlok();


// ======================================================
// HANDTEKENING
// ======================================================

const ctx = canvas.getContext("2d");

let tekenen = false;

ctx.lineWidth = 2;
ctx.lineCap = "round";
ctx.strokeStyle = "#000";

function positie(e){

    const rect =
        canvas.getBoundingClientRect();

    return{

        x:e.clientX-rect.left,
        y:e.clientY-rect.top

    };

}

canvas.addEventListener("mousedown",(e)=>{

    tekenen = true;

    const p = positie(e);

    ctx.beginPath();

    ctx.moveTo(p.x,p.y);

});

canvas.addEventListener("mousemove",(e)=>{

    if(!tekenen) return;

    const p = positie(e);

    ctx.lineTo(p.x,p.y);

    ctx.stroke();

});

canvas.addEventListener("mouseup",()=>{

    tekenen = false;

});

canvas.addEventListener("mouseleave",()=>{

    tekenen = false;

});

clearButton.addEventListener("click",()=>{

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

});
// ======================================================
// MELDINGEN
// ======================================================

function toonMelding(tekst, type = "success") {

    message.className = "message";
    message.classList.add(type);

    message.textContent = tekst;

}

// ======================================================
// CONTROLE HANDTEKENING
// ======================================================

function heeftHandtekening() {

    const pixels = ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
    ).data;

    for (let i = 3; i < pixels.length; i += 4) {

        if (pixels[i] !== 0) {

            return true;

        }

    }

    return false;

}

// ======================================================
// FORMULIER CONTROLEREN
// ======================================================

function controleerFormulier() {

    const verplichteVelden = [

        "voornaam",
        "achternaam",
        "geslacht",
        "geboortedatum",
        "geboorteplaats",
        "nationaliteit",
        "straat",
        "huisnummer",
        "postcode",
        "woonplaats",
        "email",
        "telefoon"

    ];

    for (const id of verplichteVelden) {

        const veld = document.getElementById(id);

        if (!veld.value.trim()) {

            veld.focus();

            toonMelding(
                "Vul alle verplichte velden in.",
                "error"
            );

            return false;

        }

    }

    if (berekenLeeftijd(geboortedatum.value) < 18) {

        const ouderNaam =
            document.getElementById("ouderNaam");

        const ouderEmail =
            document.getElementById("ouderEmail");

        if (
            ouderNaam.value.trim() === "" ||
            ouderEmail.value.trim() === ""
        ) {

            toonMelding(
                "Vul de gegevens van de ouder/verzorger in.",
                "error"
            );

            return false;

        }

    }

    const akkoord = [

        "privacy",
        "statuten",
        "verenigingjaar",
        "contributie"

    ];

    for (const id of akkoord) {

        const checkbox =
            document.getElementById(id);

        if (!checkbox.checked) {

            toonMelding(
                "Ga akkoord met alle voorwaarden.",
                "error"
            );

            return false;

        }

    }

    if (!heeftHandtekening()) {

        toonMelding(
            "Plaats eerst een digitale handtekening.",
            "error"
        );

        return false;

    }

    return true;

} 
// ======================================================
// VERZENDEN
// ======================================================

sendButton.addEventListener("click", async () => {

    message.style.display = "none";

    if (!controleerFormulier()) {

        return;

    }

    sendButton.disabled = true;

    sendButton.textContent =
        "⏳ Inschrijving controleren...";

    await new Promise(resolve => {

        setTimeout(resolve, 1000);

    });

    toonMelding(
        "✅ Formulier is volledig ingevuld en gereed voor verzending.",
        "success"
    );

    sendButton.disabled = false;

    sendButton.textContent =
        "📨 Inschrijving verzenden";

});


// ======================================================
// ENTER BLOKKEREN
// ======================================================

document.addEventListener("keydown", (e) => {

    if (e.key === "Enter") {

        if (e.target.tagName !== "TEXTAREA") {

            e.preventDefault();

        }

    }

});


// ======================================================
// E-MAIL CONTROLEREN
// ======================================================

const email =
    document.getElementById("email");

email.addEventListener("blur", () => {

    const regex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
        email.value &&
        !regex.test(email.value)
    ) {

        toonMelding(
            "Voer een geldig e-mailadres in.",
            "error"
        );

    }

});


// ======================================================
// POSTCODE
// ======================================================

const postcode =
    document.getElementById("postcode");

postcode.addEventListener("input", () => {

    postcode.value =
        postcode.value.toUpperCase();

});


// ======================================================
// TELEFOON
// ======================================================

const telefoon =
    document.getElementById("telefoon");

telefoon.addEventListener("input", () => {

    telefoon.value =
        telefoon.value.replace(
            /[^0-9+\-\s]/g,
            ""
        );

});


// ======================================================
// START
// ======================================================

console.log(
    "✅ Inschrijfformulier gereed."
);
