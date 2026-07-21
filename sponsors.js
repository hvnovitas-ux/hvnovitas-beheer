import { db } from "./firebase.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

window.addEventListener("DOMContentLoaded", async () => {

    const track = document.querySelector(".track");

    if (!track) {
        console.error("❌ track niet gevonden");
        return;
    }

    let position = 0;
    const speed = 0.5;

    try {

        const snap = await get(ref(db, "sponsors"));

        if (!snap.exists()) {
            track.innerHTML = "<p>Geen sponsors</p>";
            return;
        }

        const data = Object.values(snap.val());

        console.log("SPONSORS DATA:", data);

        const items = [...data, ...data];

        track.innerHTML = items.map(s => `
            <div class="sponsor">
                <img src="${s.imageUrl || s.image || ''}">
            </div>
        `).join("");

        function animate() {

            const halfWidth = track.scrollWidth / 2;

            position -= speed;

            track.style.transform = `translateX(${position}px)`;

            if (Math.abs(position) >= halfWidth) {
                position = 0;
            }

            requestAnimationFrame(animate);
        }

        animate();

    } catch (err) {
        console.error("Firebase error:", err);
    }
});
