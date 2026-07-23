import { db } from "./firebase.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

console.log("🤝 Sponsor slider geladen");

// ================= ELEMENT =================

const track = document.getElementById("sponsorTrack");

if (!track) {
    console.error("❌ sponsorTrack niet gevonden in HTML");
}

// ================= VARS =================

let position = 0;
let speed = 0.5;
let animationId = null;

// ================= LOAD SPONSORS =================

async function loadSponsors() {

    const snap = await get(ref(db, "sponsors"));
    const data = snap.val() || {};

    const list = Object.entries(data).map(([id, s]) => ({
        id,
        imageUrl: s.imageUrl || s.image || ""
    }));

    if (!track) return;

    if (list.length === 0) {
        track.innerHTML = "<p>Geen sponsors</p>";
        return;
    }

    // dubbel voor infinite scroll
    const items = [...list, ...list];

    track.innerHTML = items.map(s => `
        <div class="sponsor">
            <img src="${s.imageUrl}" />
        </div>
    `).join("");

    startSlider();
}

// ================= SLIDER ANIMATION =================

function startSlider() {

    cancelAnimationFrame(animationId);

    const halfWidth = track.scrollWidth / 2;

    function animate() {

        position -= speed;

        track.style.transform = `translateX(${position}px)`;

        if (Math.abs(position) >= halfWidth) {
            position = 0;
        }

        animationId = requestAnimationFrame(animate);
    }

    animate();
}

// ================= START =================

window.addEventListener("DOMContentLoaded", loadSponsors);
