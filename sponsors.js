import { db } from "./firebase.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const sponsorTrack = document.getElementById("sponsorTrack");

onValue(ref(db, "sponsors"), (snapshot) => {

    const data = snapshot.val();

    sponsorTrack.innerHTML = "";

    if (!data) {
        sponsorTrack.innerHTML = "<p>Geen sponsors gevonden.</p>";
        return;
    }

    Object.values(data).forEach((sponsor) => {

        sponsorTrack.innerHTML += `
            <div class="sponsor">
                <img src="${sponsor.imageUrl}" alt="Sponsor">
            </div>
        `;

    });

});
