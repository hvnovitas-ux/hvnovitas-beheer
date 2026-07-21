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

const track = document.getElementById("sponsorTrack");

let offset = 0;
let interval = null;

// ================= LOAD ONCE =================

async function loadSponsors() {

    const snapshot = await get(ref(db, "sponsors"));

    if (!snapshot.exists()) {
        track.innerHTML = "<p>Geen sponsors</p>";
        return;
    }

    const data = snapshot.val();
    const items = Object.values(data);

    // build slider content
    track.innerHTML = items.concat(items).map(s => `
        <img src="${s.imageUrl}" style="
            height:60px;
            margin:10px;
            background:white;
            padding:5px;
            border-radius:8px;
        ">
    `).join("");

    startSlider();
}

// ================= SLIDER =================

function startSlider() {

    const images = track.querySelectorAll("img");

    if (!images.length) return;

    let speed = 1;

    function animate() {

        offset -= speed;

        track.style.transform = `translateX(${offset}px)`;

        // reset loop
        if (Math.abs(offset) > track.scrollWidth / 2) {
            offset = 0;
        }

        requestAnimationFrame(animate);
    }

    animate();
}

// start
loadSponsors();
