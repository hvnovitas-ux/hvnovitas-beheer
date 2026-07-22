import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import {
    getDatabase,
    ref,
    onValue
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

// ================= FIREBASE =================

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "hv-novitas-beheer.firebaseapp.com",
    databaseURL: "https://hv-novitas-beheer-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "hv-novitas-beheer"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ================= ELEMENTS =================

const matchesEl = document.getElementById("matches");
const activitiesEl = document.getElementById("activities");
const highlightsEl = document.getElementById("highlights");

// safety check (voorkomt crashes in embed)
if (!matchesEl || !activitiesEl || !highlightsEl) {
    console.error("HTML elementen niet gevonden");
}

// ================= LOAD AGENDA =================

onValue(ref(db, "agenda"), (snapshot) => {

    const data = snapshot.val() || {};

    // reset UI (belangrijk)
    matchesEl.innerHTML = "<h3>⚔️ Wedstrijden</h3>";
    activitiesEl.innerHTML = "<h3>🏋️ Activiteiten</h3>";
    highlightsEl.innerHTML = "<h3>🏆 Highlights</h3>";

    const items = Object.values(data);

    if (items.length === 0) {
        matchesEl.innerHTML += "<p>Geen data</p>";
        activitiesEl.innerHTML += "<p>Geen data</p>";
        highlightsEl.innerHTML += "<p>Geen data</p>";
        return;
    }

    // ================= SORTING =================

    const matches = {};
    const activities = [];
    const highlights = [];

    items.forEach(a => {

        const type = a.type || "activity";

        if (type === "match") {

            if (!matches[a.date]) matches[a.date] = [];
            matches[a.date].push(a);
        }

        else if (
            type === "training" ||
            type === "meeting" ||
            type === "clubday" ||
            type === "event"
        ) {
            activities.push(a);
        }

        else if (type === "highlight") {
            highlights.push(a);
        }

        else {
            activities.push(a);
        }
    });

    // ================= MATCHES =================

    Object.keys(matches)
        .sort((a, b) => (a || "").localeCompare(b || ""))
        .forEach(date => {

            const html = matches[date].map(m => `
                <div>
                    ${m.time || ""} - ${m.team1 || ""} vs ${m.team2 || ""}
                </div>
            `).join("");

            matchesEl.innerHTML += `
                <div class="item match">
                    <b>${date}</b>
                    ${html}
                </div>
            `;
        });

    // ================= ACTIVITIES =================

    activities
        .sort((a, b) => (a.date || "").localeCompare(b.date || ""))
        .forEach(a => {

            activitiesEl.innerHTML += `
                <div class="item ${a.type || "training"}">
                    <b>${a.date || ""} ${a.time || ""}</b><br>
                    ${a.team1 || ""}
                    ${a.team2 ? " vs " + a.team2 : ""}
                </div>
            `;
        });

    // ================= HIGHLIGHTS =================

    if (highlights.length === 0) {
        highlightsEl.innerHTML += "<p>Geen highlights</p>";
        return;
    }

    highlights
        .sort((a, b) => (b.created || 0) - (a.created || 0))
        .forEach(h => {

            highlightsEl.innerHTML += `
                <div class="item highlight">
                    <b>${h.date || ""}</b><br>
                    ${h.team1 || ""}
                </div>
            `;
        });

});
