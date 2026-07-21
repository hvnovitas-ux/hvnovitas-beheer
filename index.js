import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import {
    getDatabase,
    ref,
    query,
    orderByChild,
    onValue
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

// ==========================================
// Firebase
// ==========================================

const firebaseConfig = {

    apiKey: "AIzaSyBCUZeWMIxIz__7TfNG_b0V47H_pYFPYQ",

    authDomain: "hv-novitas-handbal-challenge.firebaseapp.com",

    databaseURL: "https://hv-novitas-handbal-challenge-default-rtdb.europe-west1.firebasedatabase.app",

    projectId: "hv-novitas-handbal-challenge",

    storageBucket: "hv-novitas-handbal-challenge.firebasestorage.app",

    messagingSenderId: "707710141199",

    appId: "1:707710141199:web:ba304ce4e5f653d0afb47a"

};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ==========================================
// NIEUWS (BLIJFT EXACT ZOALS JIJ HEBT)
// ==========================================

const nieuws = document.getElementById("news");

if (nieuws) {

    const q = query(
        ref(db, "news"),
        orderByChild("created")
    );

    onValue(q, (snapshot) => {

        let berichten = [];

        snapshot.forEach((item) => {
            berichten.push(item.val());
        });

        berichten.sort((a, b) => b.created - a.created);

        let html = "";

        berichten.forEach((b) => {

            html += `

<div class="bericht">

<h2>${b.title}</h2>

<small>
📅 ${b.date || ""} &nbsp;&nbsp; 🕒 ${b.time || ""}
</small>

<p>${b.text}</p>

</div>

`;
        });

        if (html === "") {
            html = "<p>Nog geen nieuws geplaatst.</p>";
        }

        nieuws.innerHTML = html;
    });
}

// ==========================================
// AGENDA (VEILIGE TOEVOEGING)
// ==========================================

const agendaBox = document.getElementById("agenda");

if (agendaBox) {

    onValue(ref(db, "agenda"), (snapshot) => {

        const data = snapshot.val();

        if (!data) {
            agendaBox.innerHTML = "<p>Geen agenda</p>";
            return;
        }

        const items = Object.values(data);

        let matches = [];
        let others = [];

        items.forEach(a => {

            if (a.type === "match") {
                matches.push(a);
            } else {
                others.push(a);
            }
        });

        let html = "";

        // ================= WEDSTRIJDEN =================

        html += `<h3>⚔️ Wedstrijden</h3>`;

        matches.forEach(m => {

            html += `
                <div class="bericht">
                    <b>${m.date} - ${m.time}</b><br>
                    ${m.team1 || ""} vs ${m.team2 || ""}
                </div>
            `;
        });

        // ================= ACTIVITEITEN =================

        html += `<h3>🏋️ Activiteiten</h3>`;

        others.forEach(o => {

            html += `
                <div class="bericht">
                    <b>${o.date} - ${o.time}</b><br>
                    ${o.team1 || ""}
                </div>
            `;
        });

        agendaBox.innerHTML = html;
    });
}
