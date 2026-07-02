import { db } from "./firebase.js";

import {
    ref,
    query,
    orderByChild,
    limitToLast,
    onValue
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

// =====================================================
// HV NOVITAS HOMEPAGE NIEUWS
// =====================================================

const news = document.getElementById("news");

if (!news) {

    console.error("Element #news niet gevonden.");

} else {

    console.log("📰 Homepage Nieuws gestart.");

}

const newsQuery = query(
    ref(db, "news"),
    orderByChild("created"),
    limitToLast(3)
);

onValue(newsQuery, (snapshot) => {

    let berichten = [];

    snapshot.forEach((item) => {

        berichten.push({
            id: item.key,
            ...item.val()
        });

    });

    // Nieuwste bovenaan
    berichten.sort((a, b) => b.created - a.created);

    // Geen nieuws
    if (berichten.length === 0) {

        news.innerHTML = `

<div class="kaart">

    <h3>📰 Nog geen nieuws</h3>

    <p>Er zijn nog geen nieuwsberichten gepubliceerd.</p>

</div>

`;

        return;

    }

    let html = "";

    berichten.forEach((bericht) => {

        let tekst = bericht.text || "";

        // Tekst inkorten voor homepage
        if (tekst.length > 180) {

            tekst = tekst.substring(0, 180) + "...";

        }

        // Foto (voor later)
        let foto = "";

        if (bericht.image && bericht.image !== "") {

            foto = `

<img
    src="${bericht.image}"
    class="nieuwsfoto"
    alt="${bericht.title}">

`;

        }

        html += `

<div class="kaart">

    ${foto}

    <h3>${bericht.title}</h3>

    <div class="datum">

        📅 ${bericht.date}
        &nbsp;&nbsp;
        🕒 ${bericht.time}

    </div>

    <div class="tekst">

        ${tekst}

    </div>

    <div class="leesverder">

        <a href="#">

            ➜ Lees verder

        </a>

    </div>

</div>

`;

    });

    news.innerHTML = html;

}, (error) => {

    console.error(error);

    news.innerHTML = `

<div class="kaart">

    <h3>❌ Fout</h3>

    <p>

        Het nieuws kon niet worden geladen.

    </p>

</div>

`;

});
