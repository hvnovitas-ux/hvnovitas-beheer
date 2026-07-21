import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

// ================= FIREBASE =================

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "hv-novitas-beheer.firebaseapp.com",
    databaseURL: "https://hv-novitas-beheer-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "hv-novitas-beheer"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ================= START =================

window.addEventListener("DOMContentLoaded", async () => {

    const track = document.getElementById("sponsorTrack");

    if (!track) {
        console.error("sponsorTrack niet gevonden");
        return;
    }

    try {

        const snapshot = await get(ref(db, "sponsors"));

        if (!snapshot.exists()) {
            track.innerHTML = "<p>Geen sponsors</p>";
            return;
        }

        const data = snapshot.val();
        const items = Object.values(data);

        track.innerHTML = items.map(s => `
            <img src="${s.imageUrl}" style="
                height:60px;
                margin:10px;
                background:white;
                padding:5px;
                border-radius:8px;
            ">
        `).join("");

    } catch (error) {
        console.error("Sponsors error:", error);
        track.innerHTML = "<p>Fout bij laden sponsors</p>";
    }

});
