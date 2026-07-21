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

// ================= ELEMENTEN =================

const matchesEl = document.getElementById("matches");
const activitiesEl = document.getElementById("activities");
const highlightsEl = document.getElementById("highlights");

// ================= LOAD AGENDA =================

onValue(ref(db, "agenda"), (snapshot) => {

    const data = snapshot.val();

    if (!data) {
        matchesEl.innerHTML = "<h3>⚔️ Wedstrijden</h3><p>Geen wedstrijden</p>";
        activitiesEl.innerHTML = "<h3>🏋️ Activiteiten</h3><p>Geen activiteiten</p>";
        highlightsEl.innerHTML = "<h3>🏆 Highlights</h3><p>Nog geen highlights</p>";
        return;
    }

    const items = Object.values(data);

    let matches = {};
    let activities = [];
    let highlights = [];

    // ================= SORTING =================

    items.forEach(a => {

        // MATCHES
        if (a.type === "match") {

            if (!matches[a.date]) {
                matches[a.date] = [];
            }

            matches[a.date].push(a);
        }

        // ACTIVITIES
        else if (a.type === "training" || a.type === "meeting") {
            activities.push(a);
        }

        // HIGHLIGHTS (alleen echte highlights)
        else if (a.type === "highlight") {
            highlights.push(a);
        }
    });

    // ================= MATCHES =================

    matchesEl.innerHTML = "<h3>⚔️ Wedstrijden</h3>";

    Object.keys(matches)
        .sort((a, b) => new Date(a) - new Date(b))
        .forEach(date => {

            matchesEl.innerHTML += `
                <div class="item match">
                    <b>${date}</b>

                    ${matches[date].map(m => `
                        <div>
                            ${m.time || ""} - 
                            ${m.team1 || ""} vs ${m.team2 || ""}
                        </div>
                    `).join("")}
                </div>
            `;
        });

    // ================= ACTIVITIES =================

    activitiesEl.innerHTML = "<h3>🏋️ Activiteiten</h3>";

    activities
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .forEach(a => {

            activitiesEl.innerHTML += `
                <div class="item ${a.type}">
                    <b>${a.date || ""} ${a.time || ""}</b><br>
                    ${a.team1 || ""}
                </div>
            `;
        });

    // ================= HIGHLIGHTS =================

    highlightsEl.innerHTML = "<h3>🏆 Highlights</h3>";

    if (highlights.length === 0) {
        highlightsEl.innerHTML += "<p>Geen highlights</p>";
        return;
    }

    highlights
        .sort((a, b) => new Date(b.created || 0) - new Date(a.created || 0))
        .forEach(h => {

            highlightsEl.innerHTML += `
                <div class="item highlight">
                    <b>${h.date || ""}</b><br>
                    ${h.team1 || ""}
                </div>
            `;
        });
});
