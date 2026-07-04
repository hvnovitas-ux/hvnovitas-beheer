// ==========================================
// HV NOVITAS CMS
// PROEFTRAININGEN
// ==========================================

import {

    getProeftrainingen,
    deleteRow

} from "./googleSheets.js";

const container =
document.getElementById("aanvragen");

const zoekveld =
document.getElementById("zoeken");

const alleenNieuw =
document.getElementById("alleenNieuw");

const totaal =
document.getElementById("totaal");

const nieuw =
document.getElementById("nieuw");

const gelezen =
document.getElementById("gelezen");

let aanvragen = [];

document.addEventListener(

    "DOMContentLoaded",

    laadAanvragen

);

// ==========================================
// LADEN
// ==========================================

async function laadAanvragen(){

    try{

        aanvragen =
        await getProeftrainingen();

        laadStatus();

        toonAanvragen();

    }

    catch(error){

        console.error(error);

        container.innerHTML =

        "<h2>Fout bij laden.</h2>";

    }

}
// ==========================================
// STATUS
// ==========================================

function laadStatus(){

    totaal.textContent = aanvragen.length;

    const nieuwe =
    aanvragen.filter(a => !a.gelezen);

    nieuw.textContent =
    nieuwe.length;

    gelezen.textContent =
    aanvragen.length - nieuwe.length;

}

// ==========================================
// FILTER
// ==========================================

zoekveld.addEventListener(

    "input",

    toonAanvragen

);

alleenNieuw.addEventListener(

    "change",

    toonAanvragen

);

// ==========================================
// TONEN
// ==========================================

function toonAanvragen(){

    let lijst = [...aanvragen];

    const zoek =
    zoekveld.value.toLowerCase();

    if(zoek){

        lijst = lijst.filter(a =>

            (a.voornaam || "")
            .toLowerCase()
            .includes(zoek)

            ||

            (a.Achternaam || "")
            .toLowerCase()
            .includes(zoek)

            ||

            (a["E-mail"] || "")
            .toLowerCase()
            .includes(zoek)

            ||

            (a.Telefoonnummer || "")
            .includes(zoek)

        );

    }

    if(alleenNieuw.checked){

        lijst =
        lijst.filter(a => !a.gelezen);

    }

    lijst.sort((a,b)=>{

        return (a.gelezen===b.gelezen)

            ?0

            :a.gelezen?1:-1;

    });

    container.innerHTML = "";

    lijst.forEach(maakKaart);

}
