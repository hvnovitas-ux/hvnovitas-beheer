import { db } from "./firebase.js";

import {
    ref,
    query,
    orderByChild,
    limitToLast,
    onValue
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

// =====================================
// Laatste nieuws laden
// =====================================

const news = document.getElementById("news");

const q = query(
    ref(db, "news"),
    orderByChild("created"),
    limitToLast(3)
);

onValue(q, (snapshot) => {

    let berichten = [];

    snapshot.forEach((item) => {

        berichten.push({
            id: item.key,
            ...item.val()
        });

    });

    berichten.sort((a, b) => b.created - a.created);

    if (berichten.length === 0) {

        news.innerHTML = `
            <div class="kaart">
                <h3>Nog geen nieuws</h3>
                <p>Er zijn nog geen nieuwsberichten gepubliceerd.</p>
            </div>
        `;

        return;
    }

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

    news.innerHTML = html;

}, (error) => {

    console.error(error);

    news.innerHTML = `
        <div class="kaart">
            <h3>Fout</h3>
            <p>${error.message}</p>
        </div>
    `;

});
