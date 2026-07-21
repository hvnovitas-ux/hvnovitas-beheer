import { db } from "./firebase.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

window.addEventListener("DOMContentLoaded", () => {

    const track = document.querySelector(".track");

    if (!track) {
        console.error("❌ track niet gevonden");
        return;
    }

    let position = 0;
    let speed = 0.5;

    async function loadSponsors() {

        const snap = await get(ref(db, "sponsors"));

        if (!snap.exists()) return;

        const data = Object.values(snap.val());

        const items = [...data, ...data];

        track.innerHTML = items.map(s => `
            <div class="sponsor">
                <img src="${s.imageUrl}">
            </div>
        `).join("");

        // 🔥 BELANGRIJK: wacht 1 frame voor layout
        requestAnimationFrame(() => {
            start();
        });
    }

    function start() {

        const halfWidth = track.scrollWidth / 2;

        function animate() {

            position -= speed;

            track.style.transform = `translateX(${position}px)`;

            if (Math.abs(position) >= halfWidth) {
                position = 0;
            }

            requestAnimationFrame(animate);
        }

        animate();
    }

    loadSponsors();
});
