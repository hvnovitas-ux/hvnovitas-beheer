import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import {
    getDatabase,
    ref,
    get,
    onValue
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDWYYS09i4YN9tnCmAzeiicD9T4YZ3a6HE",
    authDomain: "hv-novitas-beheer.firebaseapp.com",
    databaseURL: "https://hv-novitas-beheer-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "hv-novitas-beheer"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const matchesEl = document.getElementById("matches");
const activitiesEl = document.getElementById("activities");
const highlightsEl = document.getElementById("highlights");

onValue(ref(db, "agenda"), (snapshot) => {

    const data = snapshot.val() || {};

    matchesEl.innerHTML = "<h3>⚔️ Wedstrijden</h3>";
    activitiesEl.innerHTML = "<h3>🏋️ Activiteiten</h3>";
    highlightsEl.innerHTML = "<h3>🏆 Highlights</h3>";

    const items = Object.values(data);

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
            type === "clubday"
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

    Object.keys(matches)
        .sort((a, b) => a.localeCompare(b))
        .forEach(date => {

            matchesEl.innerHTML += `
                <div class="item match">
                    <b>${date}</b>
                    ${matches[date].map(m => `
                        <div>${m.time || ""} ${m.team1 || ""} vs ${m.team2 || ""}</div>
                    `).join("")}
                </div>
            `;
        });

    activities
        .sort((a, b) => (a.date || "").localeCompare(b.date || ""))
        .forEach(a => {

            activitiesEl.innerHTML += `
                <div class="item ${a.type}">
                    <b>${a.date || ""} ${a.time || ""}</b><br>
                    ${a.team1 || ""}
                </div>
            `;
        });

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
