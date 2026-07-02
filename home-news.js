import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getDatabase,
    ref,
    query,
    orderByChild,
    limitToLast,
    onValue
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

// =====================================
// Firebase
// =====================================

const firebaseConfig = {

    apiKey: "AIzaSyBCUZeWMIxIz__7TfNG_b0V47H_pYFPyQ",

    authDomain: "hv-novitas-handbal-challenge.firebaseapp.com",

    databaseURL: "https://hv-novitas-handbal-challenge-default-rtdb.europe-west1.firebasedatabase.app",

    projectId: "hv-novitas-handbal-challenge",

    storageBucket: "hv-novitas-handbal-challenge.firebasestorage.app",

    messagingSenderId: "707710141199",

    appId: "1:707710141199:web:ba304ce4e5f653d0afb47a"

};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// =====================================
// Nieuws laden
// =====================================

const nieuws = document.getElementById("news");

const q = query(
    ref(db, "news"),
    orderByChild("created"),
    limitToLast(3)
);

onValue(q, (snapshot) => {

    let berichten = [];

    snapshot.forEach((item) => {

        berichten.push(item.val());

    });

    berichten.reverse();

    let html = "";

    berichten.forEach((b) => {

        let tekst = b.text || "";

        if (tekst.length > 180) {

            tekst = tekst.substring(0, 180) + "...";

        }

        html += `

<div class="kaart">

    <h3>${b.title}</h3>

    <div class="datum">

        📅 ${b.date} &nbsp; 🕒 ${b.time}

    </div>

    <div class="tekst">

        ${tekst}

    </div>

</div>

`;

    });

    if (html === "") {

        html = `
        <div class="kaart">
            <h3>Nog geen nieuws</h3>
            <p>Er zijn nog geen nieuwsberichten gepubliceerd.</p>
        </div>
        `;
    }

    nieuws.innerHTML = html;

});
