import { db } from "./firebase.js";
import {
    ref,
    onValue
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

// ==========================================
// START DASHBOARD
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    laadDashboard();
});

// ==========================================
// DASHBOARD INIT
// ==========================================

function laadDashboard() {

    console.log("🧡 Dashboard geladen");

    // NEWS
    onValue(ref(db, "news"), (snap) => {
        setBadge("nieuws", countItems(snap));
    });

    // PROEFTRAININGEN
    onValue(ref(db, "proeftrainingen"), (snap) => {
        setBadge("proeftrainingen", countItems(snap));
    });

    // CONTACT
    onValue(ref(db, "contact"), (snap) => {
        setBadge("contact", countItems(snap));
    });

    // VRIJWILLIGERS
    onValue(ref(db, "vrijwilligers"), (snap) => {
        setBadge("vrijwilligers", countItems(snap));
    });

    // AGENDA
    onValue(ref(db, "agenda"), (snap) => {
        setBadge("agenda", countItems(snap));
    });

    // SPONSORS
    onValue(ref(db, "sponsors"), (snap) => {
        setBadge("sponsors", countItems(snap));
    });

    // CLUB100 (extra handig voor jou)
    onValue(ref(db, "club100"), (snap) => {
        setBadge("club100", countItems(snap));
    });
}

// ==========================================
// COUNT FUNCTIE
// ==========================================

function countItems(snapshot) {

    const data = snapshot.val();

    if (!data) return 0;

    return Object.keys(data).length;
}

// ==========================================
// BADGE UPDATER
// ==========================================

function setBadge(id, waarde) {

    const badge = document.querySelector(`[data-badge="${id}"]`);

    if (!badge) return;

    badge.textContent = waarde;
}
