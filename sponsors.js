import { db } from "./firebase.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const sponsorTrack = document.getElementById("sponsorTrack");

let animationId = null;

onValue(ref(db, "sponsors"), (snapshot) => {

    const data = snapshot.val();

    if (animationId) {
        cancelAnimationFrame(animationId);
    }

    sponsorTrack.innerHTML = "";

    if (!data) {
        sponsorTrack.innerHTML = "<p>Geen sponsors gevonden.</p>";
        return;
    }

    const sponsors = Object.values(data);

    // Bouw de rij 3 keer op voor een vloeiende lus
    for (let i = 0; i < 3; i++) {

        sponsors.forEach((sponsor) => {

            const item = document.createElement("div");
            item.className = "sponsor";

            const img = document.createElement("img");
            img.src = sponsor.imageUrl;
            img.alt = "Sponsor";

            item.appendChild(img);
            sponsorTrack.appendChild(item);

        });

    }

    let position = 0;
    const speed = 0.5;

    requestAnimationFrame(() => {

        const loopWidth = sponsorTrack.scrollWidth / 3;

        function animate() {

            position -= speed;

            if (Math.abs(position) >= loopWidth) {
                position = 0;
            }

            sponsorTrack.style.transform = `translateX(${position}px)`;

            animationId = requestAnimationFrame(animate);

        }

        animate();

    });

});
