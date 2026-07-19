import { db } from "./firebase.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const container = document.getElementById("sponsors");
const status = document.getElementById("status");

function laadSponsors() {

    status.textContent = "Sponsors laden...";

    onValue(ref(db, "sponsors"), (snapshot) => {

        const data = snapshot.val();

        if (!data) {
            container.innerHTML = "<p>Geen sponsors gevonden</p>";
            status.textContent = "Gereed";
            return;
        }

        const items = Object.values(data);

        container.innerHTML = items.map(s => `
            <img src="${s.imageUrl}" style="height:60px; margin:10px;">
        `).join("");

        status.textContent = "Gereed";
    });
}

laadSponsors();
