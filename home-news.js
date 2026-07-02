import { db } from "./firebase.js";

import {
    ref,
    query,
    orderByChild,
    limitToLast,
    onValue
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

console.log("📰 Home News gestart");

const news = document.getElementById("news");

if (!news) {

    console.error("❌ Element #news niet gevonden.");

} else {

    console.log("✅ Element #news gevonden.");

}

const newsRef = query(
    ref(db, "news"),
    orderByChild("created"),
    limitToLast(3)
);

onValue(newsRef, (snapshot) => {

    console.log("🔥 Firebase verbonden");

    console.log(snapshot.val());

    if (!snapshot.exists()) {

        news.innerHTML = `

<div class="kaart">

<h3>📰 Nog geen nieuws</h3>

<p>Er zijn nog geen nieuwsberichten gepubliceerd.</p>

</div>

`;

        return;

    }

    let berichten = [];

    snapshot.forEach((item) => {

        berichten.push({
            id: item.key,
            ...item.val()
        });

    });

    berichten.sort((a, b) => b.created - a.created);

    let html = "";

    berichten.forEach((bericht) => {

        let tekst = bericht.text || "";

        if (tekst.length > 180) {

            tekst = tekst.substring(0, 180) + "...";

        }

        html += `

<div class="kaart">

<h3>${bericht.title}</h3>

<div class="datum">

📅 ${bericht.date}
&nbsp;&nbsp;
🕒 ${bericht.time}

</div>

<div class="tekst">

${tekst}

</div>

</div>

`;

    });

    news.innerHTML = html;

}, (error) => {

    console.error("❌ Firebase fout", error);

    news.innerHTML = `

<div class="kaart">

<h3>❌ Fout</h3>

<p>${error.message}</p>

</div>

`;

});
Daarna
Opslaan
Commit
Push
Wacht ongeveer 1 minuut.
Open:

https://hvnovitas-ux.githu
