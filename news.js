import { db } from "./firebase.js";
import { uploadFile } from "./drive.js";

import {
    ref,
    push,
    onValue,
    remove,
    update
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

// ----------------------------
// Elementen
// ----------------------------

const title = document.getElementById("title");
const text = document.getElementById("text");
const photo = document.getElementById("photo");

const publish = document.getElementById("publish");
const reset = document.getElementById("reset");

const melding = document.getElementById("melding");
const newsList = document.getElementById("newsList");

let editID = null;

// ----------------------------
// Publiceren
// ----------------------------

publish.addEventListener("click", async () => {

    if (title.value.trim() === "") {
        alert("Vul een titel in.");
        return;
    }

    if (text.value.trim() === "") {
        alert("Vul een bericht in.");
        return;
    }

    try {

        publish.disabled = true;
        melding.textContent = "⏳ Bezig met uploaden...";

        let imageId = "";
        let imageUrl = "";

        if (photo.files.length > 0) {

            const result = await uploadFile(photo.files[0]);

            imageId = result.id;

            imageUrl =
                `https://drive.google.com/thumbnail?id=${imageId}&sz=w1600`;

        }

        const nu = new Date();

        const bericht = {

            title: title.value,

            text: text.value,

            imageId,

            imageUrl,

            date: nu.toLocaleDateString("nl-NL"),

            time: nu.toLocaleTimeString("nl-NL", {
                hour: "2-digit",
                minute: "2-digit"
            }),

            created: Date.now()

        };

        if (editID) {

            await update(ref(db, "news/" + editID), bericht);

            melding.textContent = "✅ Nieuws bijgewerkt.";

            editID = null;

        } else {

            await push(ref(db, "news"), bericht);

            melding.textContent = "✅ Nieuws gepubliceerd.";

        }

        leeg();

    } catch (error) {

        console.error(error);

        melding.textContent = "❌ " + error.message;

    } finally {

        publish.disabled = false;

    }

});

// ----------------------------
// Wissen
// ----------------------------

reset.addEventListener("click", leeg);

function leeg() {

    title.value = "";
    text.value = "";
    photo.value = "";

}

// ----------------------------
// Nieuws laden
// ----------------------------

onValue(ref(db, "news"), (snapshot) => {

    let berichten = [];

    snapshot.forEach((item) => {

        berichten.push({
            id: item.key,
            ...item.val()
        });

    });

    berichten.sort((a, b) => b.created - a.created);

    let html = "";

    berichten.forEach((b) => {

        html += `
<div class="bericht">

${b.imageUrl ? `<img src="${b.imageUrl}" style="width:100%;max-width:300px;border-radius:8px;margin-bottom:10px;">` : ""}

<h3>${b.title}</h3>

<small>📅 ${b.date} &nbsp; 🕒 ${b.time}</small>

<p>${b.text}</p>

<button onclick="bewerk('${b.id}')">
✏️ Bewerken
</button>

<button onclick="verwijder('${b.id}')">
🗑️ Verwijderen
</button>

</div>
`;

    });

    newsList.innerHTML = html || "Nog geen nieuws geplaatst.";

});

// ----------------------------
// Verwijderen
// ----------------------------

window.verwijder = async function(id){

    if(confirm("Nieuws verwijderen?")){

        await remove(ref(db,"news/"+id));

    }

}

// ----------------------------
// Bewerken
// ----------------------------

window.bewerk = function(id){

    onValue(ref(db,"news/"+id),(snapshot)=>{

        const b=snapshot.val();

        if(!b) return;

        editID=id;

        title.value=b.title;
        text.value=b.text;

        window.scrollTo({
            top:0,
            behavior:"smooth"
        });

    },{
        onlyOnce:true
    });

}
