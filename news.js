import { db } from "./firebase.js";

import {
    ref,
    push,
    onValue,
    remove,
    update,
    query,
    orderByChild
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

// ------------------------
// Elementen
// ------------------------

const title = document.getElementById("title");
const text = document.getElementById("text");
const categorie = document.getElementById("categorie");
const vastzetten = document.getElementById("vastzetten");
const publish = document.getElementById("publish");
const reset = document.getElementById("reset");
const melding = document.getElementById("melding");
const newsList = document.getElementById("newsList");

// Voorbeeld

const voorbeeldTitel = document.getElementById("voorbeeldTitel");
const voorbeeldTekst = document.getElementById("voorbeeldTekst");
const voorbeeldDatum = document.getElementById("voorbeeldDatum");

// Bewerken

let editID = null;

// ------------------------
// Live voorbeeld
// ------------------------

function updatePreview() {

    voorbeeldTitel.textContent =
        title.value || "Titel";

    voorbeeldTekst.textContent =
        text.value || "Hier verschijnt een voorbeeld.";

    voorbeeldDatum.textContent =
        new Date().toLocaleDateString("nl-NL");

}

title.addEventListener("input", updatePreview);
text.addEventListener("input", updatePreview);

updatePreview();

// ------------------------
// Publiceren
// ------------------------

publish.addEventListener("click", () => {

    if(title.value.trim()===""){

        alert("Vul een titel in.");

        return;

    }

    if(text.value.trim()===""){

        alert("Vul een bericht in.");

        return;

    }

    const bericht = {

        title:title.value,

        text:text.value,

        categorie:categorie.value,

        pinned:vastzetten.checked,

        created:Date.now(),

        date:new Date().toLocaleDateString("nl-NL"),

        time:new Date().toLocaleTimeString("nl-NL",{

            hour:"2-digit",

            minute:"2-digit"

        })

    };

    if(editID){

        update(ref(db,"news/"+editID),bericht);

        melding.innerHTML="✅ Nieuws bijgewerkt.";

        editID=null;

    }else{

        push(ref(db,"news"),bericht);

        melding.innerHTML="✅ Nieuws gepubliceerd.";

    }

    leegmaken();

});

// ------------------------
// Wissen
// ------------------------

reset.addEventListener("click",leegmaken);

function leegmaken(){

    title.value="";

    text.value="";

    categorie.selectedIndex=0;

    vastzetten.checked=false;

    updatePreview();

}

// ------------------------
// Nieuws laden
// ------------------------

const q=query(

    ref(db,"news"),

    orderByChild("created")

);

onValue(q,(snapshot)=>{

    let berichten=[];

    snapshot.forEach(item=>{

        berichten.push({

            id:item.key,

            ...item.val()

        });

    });

    berichten.reverse();

    let html="";

    berichten.forEach(b=>{

        html+=`

<div class="bericht">

<h2>${b.title}</h2>

<p><b>${b.date}</b> ${b.time}</p>

<p><b>${b.categorie}</b></p>

<p>${b.text}</p>

<button onclick="bewerk('${b.id}')">

✏️ Bewerken

</button>

<button onclick="verwijder('${b.id}')">

🗑️ Verwijderen

</button>

</div>

<hr>

`;

    });

    newsList.innerHTML=html;

});

// ------------------------
// Globale functies
// ------------------------

window.verwijder=function(id){

    if(confirm("Nieuws verwijderen?")){

        remove(ref(db,"news/"+id));

    }

}

window.bewerk=function(id){

    onValue(ref(db,"news/"+id),(snapshot)=>{

        const b=snapshot.val();

        if(!b)return;

        editID=id;

        title.value=b.title;

        text.value=b.text;

        categorie.value=b.categorie;

        vastzetten.checked=b.pinned;

        updatePreview();

        window.scrollTo({

            top:0,

            behavior:"smooth"

        });

    },{

        onlyOnce:true

    });

}
