// ======================================================
// HV NOVITAS CMS
// PROEFTRAININGEN
// ======================================================

import {

    getProeftrainingen,
    deleteRow

} from "./googleSheets.js";

// ======================================================
// ELEMENTEN
// ======================================================

const container =
document.getElementById("aanvragen");

const zoeken =
document.getElementById("zoeken");

const alleenNieuw =
document.getElementById("alleenNieuw");

const totaal =
document.getElementById("totaal");

const nieuw =
document.getElementById("nieuw");

const gelezen =
document.getElementById("gelezen");

// ======================================================
// DATA
// ======================================================

let aanvragen = [];

let gelezenItems = JSON.parse(

    localStorage.getItem(
        "novitas_gelezen"
    ) || "[]"

);

// ======================================================
// START
// ======================================================

document.addEventListener(

    "DOMContentLoaded",

    start

);

async function start(){

    try{

        await laadAanvragen();

    }

    catch(error){

        console.error(error);

        container.innerHTML = `

        <div class="content-card">

            <h2>❌ Fout</h2>

            <p>

                ${error.message || error}

            </p>

        </div>

        `;

    }

}

// ======================================================
// AANVRAGEN LADEN
// ======================================================

async function laadAanvragen(){

    aanvragen =
    await getProeftrainingen();

    aanvragen.forEach(item=>{

        item.gelezen =

        gelezenItems.includes(

            item._row

        );

    });

    updateStatus();

    toonAanvragen();

}

// ======================================================
// STATUS
// ======================================================

function updateStatus(){

    totaal.textContent =
    aanvragen.length;

    const nieuwe =

    aanvragen.filter(

        item => !item.gelezen

    );

    nieuw.textContent =
    nieuwe.length;

    gelezen.textContent =
    aanvragen.length -
    nieuwe.length;

}

// ======================================================
// FILTERS
// ======================================================

zoeken.addEventListener(

    "input",

    toonAanvragen

);

alleenNieuw.addEventListener(

    "change",

    toonAanvragen

);
// ======================================================
// AANVRAGEN TONEN
// ======================================================

function toonAanvragen(){

    let lijst = [...aanvragen];

    // ==========================================
    // ZOEKEN
    // ==========================================

    const zoek = zoeken.value
        .trim()
        .toLowerCase();

    if(zoek){

        lijst = lijst.filter(item =>

            (item.voornaam || "")
            .toLowerCase()
            .includes(zoek)

            ||

            (item.Achternaam || "")
            .toLowerCase()
            .includes(zoek)

            ||

            (item.Telefoonnummer || "")
            .includes(zoek)

            ||

            (item["E-mail"] || "")
            .toLowerCase()
            .includes(zoek)

        );

    }

    // ==========================================
    // ALLEEN NIEUW
    // ==========================================

    if(alleenNieuw.checked){

        lijst = lijst.filter(

            item => !item.gelezen

        );

    }

    // ==========================================
    // SORTEER
    // ==========================================

    lijst.sort((a,b)=>{

        if(a.gelezen===b.gelezen){

            return b._row-a._row;

        }

        return a.gelezen?1:-1;

    });

    container.innerHTML="";

    if(lijst.length===0){

        container.innerHTML=`

        <div class="content-card">

            <h2>

                Geen proeftrainingen gevonden.

            </h2>

        </div>

        `;

        return;

    }

    lijst.forEach(item=>{

        const kaart = maakKaart(item);

        container.appendChild(kaart);

    });

}

// ======================================================
// KAART MAKEN
// ======================================================

function maakKaart(item){

    const kaart =
    document.createElement("div");

    kaart.className="proef-card";

    if(!item.gelezen){

        kaart.classList.add("nieuw");

    }

    kaart.innerHTML=`

        <h3>

            👤 ${item.voornaam}
            ${item.Achternaam}

        </h3>

        <div class="proef-info">

            <div><strong>📅 Aanmelding</strong></div>
            <div>${item.Tijdstempel || "-"}</div>

            <div><strong>🎂 Geboortedatum</strong></div>
            <div>${item.Geboortedatum || "-"}</div>

            <div><strong>🚻 Geslacht</strong></div>
            <div>${item.Geslacht || "-"}</div>

            <div><strong>📞 Telefoon</strong></div>
            <div>${item.Telefoonnummer || "-"}</div>

            <div><strong>📧 E-mail</strong></div>
            <div>${item["E-mail"] || "-"}</div>

            <div><strong>📝 Opmerkingen</strong></div>
            <div>${item.Opmerkingen || "-"}</div>

        </div>

        <div class="knoppen">

            <button
                class="btn-green"
                onclick="window.location.href='tel:${item.Telefoonnummer}'">

                📞 Bellen

            </button>

            <button
                class="btn-orange"
                onclick="window.location.href='mailto:${item["E-mail"]}'">

                📧 Mail

            </button>

            <button
                class="btn-black"
                onclick="markeerGelezen(${item._row})">

                ✔ Gelezen

            </button>

            <button
                class="btn-red"
                onclick="verwijderAanvraag(${item._row})">

                🗑 Verwijderen

            </button>

        </div>

    `;

    return kaart;

}
// ======================================================
// GELEZEN
// ======================================================

window.markeerGelezen = function(rij){

    if(!gelezenItems.includes(rij)){

        gelezenItems.push(rij);

        localStorage.setItem(

            "novitas_gelezen",

            JSON.stringify(gelezenItems)

        );

    }

    const aanvraag = aanvragen.find(

        item => item._row === rij

    );

    if(aanvraag){

        aanvraag.gelezen = true;

    }

    updateStatus();

    toonAanvragen();

};

// ======================================================
// VERWIJDEREN
// ======================================================

window.verwijderAanvraag = async function(rij){

    if(!confirm(

        "Weet je zeker dat je deze proeftraining wilt verwijderen?"

    )){

        return;

    }

    try{

        await deleteRow(rij);

        aanvragen = aanvragen.filter(

            item => item._row !== rij

        );

        gelezenItems = gelezenItems.filter(

            item => item !== rij

        );

        localStorage.setItem(

            "novitas_gelezen",

            JSON.stringify(gelezenItems)

        );

        updateStatus();

        toonAanvragen();

        alert(

            "✅ Aanmelding verwijderd."

        );

    }

    catch(error){

        console.error(error);

        alert(

            "❌ Verwijderen mislukt."

        );

    }

};

// ======================================================
// DATUM OPMAKEN
// ======================================================

function formatDatum(waarde){

    if(!waarde){

        return "-";

    }

    const datum = new Date(waarde);

    if(isNaN(datum)){

        return waarde;

    }

    return datum.toLocaleDateString(

        "nl-NL"

    );

}

// ======================================================
// TELEFOON
// ======================================================

function belNummer(nummer){

    if(!nummer){

        return;

    }

    window.location.href =

    "tel:" + nummer;

}

// ======================================================
// MAIL
// ======================================================

function mailPersoon(mail){

    if(!mail){

        return;

    }

    window.location.href =

    "mailto:" + mail;

}

// ======================================================
// AUTO REFRESH
// ======================================================

setInterval(

    laadAanvragen,

    60000

);

console.log(

    "🧡 HV Novitas Proeftrainingen geladen"

);
// ======================================================
// HULPFUNCTIES
// ======================================================

function escapeHtml(tekst){

    if(!tekst){

        return "";

    }

    return String(tekst)

        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");

}

// ======================================================
// OPNIEUW LADEN
// ======================================================

window.verversAanvragen = async function(){

    try{

        await laadAanvragen();

    }

    catch(error){

        console.error(error);

    }

};

// ======================================================
// ELKE MINUUT CONTROLEREN
// ======================================================

setInterval(

    verversAanvragen,

    60000

);

// ======================================================
// PAGINA KLAAR
// ======================================================

window.addEventListener(

    "load",

    ()=>{

        console.log(

            "🧡 HV Novitas Proeftrainingen actief"

        );

    }

);

// ======================================================
// EINDE
// ======================================================
