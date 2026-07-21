import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const db = getDatabase();
const track = document.querySelector(".track");

let position = 0;
let speed = 0.5;
let animationId;

// ================= LOAD =================

async function loadSponsors() {

    const snap = await get(ref(db, "sponsors"));

    if (!snap.exists()) return;

    const data = Object.values(snap.val());

    // 2x voor infinite loop
    const items = [...data, ...data];

    track.innerHTML = items.map(s => `
        <div class="sponsor">
            <img src="${s.imageUrl}">
        </div>
    `).join("");

    start();
}

// ================= SMOOTH LOOP =================

function start() {

    const halfWidth = track.scrollWidth / 2;

    function animate() {

        position -= speed;

        track.style.transform = `translateX(${position}px)`;

        // ultra smooth reset (geen jump zichtbaar)
        if (Math.abs(position) >= halfWidth) {
            position = 0;
        }

        animationId = requestAnimationFrame(animate);
    }

    animate();
}

// start
loadSponsors();
