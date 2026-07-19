import { db } from "./firebase.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const container = document.getElementById("sponsors");
const status = document.getElementById("status");

console.log("🧡 Sponsors JS geladen");

// ================= LOAD SPONSORS =================
function laadSponsors() {

    // safety check (BELANGRIJK)
    if (!container || !status) {
        console.error("❌ Sponsors HTML elementen niet gevonden");
        return;
    }

    status.textContent = "Sponsors laden...";

    onValue(ref(db, "sponsors"), (snapshot) => {

        const data = snapshot.val();

        // geen sponsors
        if (!data) {
            container.innerHTML = "<p>Geen sponsors gevonden</p>";
            status.textContent = "Gereed";
            return;
        }

        // omzetten naar array
        const items = Object.values(data);

        // tonen
        container.innerHTML = items.map(s => `
            <img 
                src="${s.imageUrl}" 
                style="
                    height:60px;
                    margin:10px;
                    background:white;
                    padding:5px;
                    border-radius:8px;
                "
            >
        `).join("");

        status.textContent = "Gereed";
    });
}

laadSponsors();
