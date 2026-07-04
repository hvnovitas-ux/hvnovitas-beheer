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
// GOOGLE SHEETS LADEN
// ======================================================

async function laadAanvragen(){

    aanvragen =
    await getProeftrainingen();

    aanvragen.forEach(item=>{

        item.gelezen =
        gelezenItems.includes(item._row);

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

        a=>!a.gelezen

    );

    nieuw.textContent =
    nieuwe.length;

    gelezen.textContent =
    aanvragen.length-
    nieuwe.length;

}

// ======================================================
// FILTER
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
// TONEN
// ======================================================

function toonAanvragen(){

    let lijst = [...aanvragen];

    // ----------------------------------
    // ZOEKEN
    // ----------------------------------

    const zoek =
    zoeken.value
    .trim()
    .toLowerCase();

    if(zoek){

        lijst = lijst.filter(item=>{

            return(

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

        });

    }

    // ----------------------------------
    // ALLEEN NIEUW
    // ----------------------------------

    if(alleenNieuw.checked){

        lijst =
        lijst.filter(

            item=>!item.gelezen

        );

    }

    // ----------------------------------
    // NIEUW BOVENAAN
    // ----------------------------------

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

        container.appendChild(

            maakKaart(item)

        );

    });

}

// ======================================================
// KAART
// ======================================================

function maakKaart(item){

    const kaart =
    document.createElement("div");

    kaart.className="proef-card";

    if(!item.gelezen){

        kaart.style.borderLeft=
        "8px solid var(--orange)";

    }

    kaart.innerHTML=`

        <h3>

            👤 ${item.voornaam}
            ${item.Achternaam}

        </h3>

        <div class="proef-info">

            <div class="proef-label">

                📅 Aanmelding

            </div>

            <div>

                ${item.Tijdstempel || "-"}

            </div>

            <div class="proef-label">

                🎂 Geboortedatum

            </div>

            <div>

                ${item.Geboortedatum || "-"}

            </div>

            <div class="proef-label">

                🚻 Geslacht

            </div>

            <div>

                ${item.Geslacht || "-"}

            </div>

            <div class="proef-label">

                📞 Telefoon

            </div>

            <div>

                ${item.Telefoonnummer || "-"}

            </div>

            <div class="proef-label">

                📧 E-mail

            </div>

            <div>

                ${item["E-mail"] || "-"}

            </div>

            <div class="proef-label">

                📝 Opmerkingen

            </div>

            <div>

                ${item.Opmerkingen || "-"}

            </div>

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

    aanvragen.forEach(item=>{

        if(item._row===rij){

            item.gelezen=true;

        }

    });

    updateStatus();

    toonAanvragen();

};

// ======================================================
// VERWIJDEREN
// ======================================================

window.verwijderAanvraag = async function(rij){

    const antwoord = confirm(

        "Weet je zeker dat je deze aanmelding wilt verwijderen?"

    );

    if(!antwoord){

        return;

    }

    try{

        await deleteRow(rij);

        aanvragen =
        aanvragen.filter(

            item=>item._row!==rij

        );

        gelezenItems =
        gelezenItems.filter(

            item=>item!==rij

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
// AUTOMATISCH VERVERSEN
// ======================================================

setInterval(

    async()=>{

        try{

            await laadAanvragen();

        }

        catch(error){

            console.error(error);

        }

    },

    60000

);

// ======================================================
// EINDE
// ======================================================

console.log(

    "🧡 HV Novitas Proeftrainingen geladen"

);
