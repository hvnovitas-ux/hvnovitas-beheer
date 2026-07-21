import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

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
let speed = 1;
let animation;

// ================= LOAD ONCE =================

async function loadSponsors() {

    const snapshot = await get(ref(db, "sponsors"));

    if (!snapshot.exists()) {
        track.innerHTML = "<p>Geen sponsors</p>";
        return;
    }

    const data = snapshot.val();
    const items = Object.values(data);

    // dubbel maken voor infinite loop effect
    track.innerHTML = [...items, ...items].map(s => `
        <img src="${s.imageUrl}" class="sponsor-img">
    `).join("");

    startSlider();
}

// ================= SLIDER =================

function startSlider() {

    const width = track.scrollWidth / 2;

    function animate() {

        offset -= speed;

        track.style.transform = `translateX(${offset}px)`;

        if (Math.abs(offset) >= width) {
            offset = 0;
        }

        animation = requestAnimationFrame(animate);
    }

    animate();
}

// start
loadSponsors();
