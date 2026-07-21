import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const db = getDatabase();
const track = document.querySelector(".track");

let offset = 0;
let speed = 0.6; // rustig zoals vroeger

async function loadSponsors() {

    const snap = await get(ref(db, "sponsors"));

    if (!snap.exists()) return;

    const data = Object.values(snap.val());

    // BELANGRIJK: gebruik .sponsor wrapper (zoals je CSS)
    track.innerHTML = data.concat(data).map(s => `
        <div class="sponsor">
            <img src="${s.imageUrl}">
        </div>
    `).join("");

    startAnimation();
}

function startAnimation() {

    function animate() {

        offset -= speed;

        track.style.transform = `translateX(${offset}px)`;

        // reset zonder breuk (smooth loop)
        if (Math.abs(offset) > track.scrollWidth / 2) {
            offset = 0;
        }

        requestAnimationFrame(animate);
    }

    animate();
}

loadSponsors();
