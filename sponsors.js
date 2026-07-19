import { db } from "./firebase.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const sponsorTrack = document.getElementById("sponsorTrack");

let animationId = null;
let position = 0;
let speed = 0.6;

onValue(ref(db, "sponsors"), (snapshot) => {

    const data = snapshot.val();

    cancelAnimationFrame(animationId);

    sponsorTrack.innerHTML = "";

    if (!data) {
        sponsorTrack.innerHTML = "<p>Geen sponsors gevonden.</p>";
        return;
    }

    const sponsors = Object.values(data);

    function buildRow() {

        sponsors.forEach((sponsor) => {

            const div = document.createElement("div");
            div.className = "sponsor";

            div.innerHTML = `
                <img src="${sponsor.imageUrl}" alt="Sponsor">
            `;

            sponsorTrack.appendChild(div);

        });

    }

    // Genoeg logo's maken voor een vloeiende lus
    buildRow();
    buildRow();
    buildRow();

    requestAnimationFrame(() => {

        const halfWidth = sponsorTrack.scrollWidth / 3;

        position = 0;

        function animate() {

            position -= speed;

            if (Math.abs(position) >= halfWidth) {
                position = 0;
            }

            sponsorTrack.style.transform = `translateX(${position}px)`;

            animationId = requestAnimationFrame(animate);

        }

        animate();

    });

});
