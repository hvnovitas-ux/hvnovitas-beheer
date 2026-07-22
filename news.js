import { db } from "./firebase.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

console.log("🧡 HV NOVITAS NEWS LOADED");

// =====================================================
// ELEMENT
// =====================================================

const home = document.getElementById("homeNews");

// =====================================================
// LOAD NEWS
// =====================================================

onValue(ref(db, "news"), (snapshot) => {

    const data = snapshot.val() || {};

    // veiligheid: leeg = niks crashen
    const items = Object.entries(data)
        .map(([id, value]) => ({ id, ...value }))
        .sort((a, b) => (b.created || 0) - (a.created || 0))
        .slice(0, 5);

    if (!home) return;

    if (items.length === 0) {
        home.innerHTML = "<p>Geen nieuws</p>";
        return;
    }

    home.innerHTML = items.map(n => `
        <div class="news-item">

            <h3>${n.title || ""}</h3>

            ${n.imageUrl ? `
                <img src="${n.imageUrl}" style="width:100%;border-radius:10px;margin:8px 0;">
            ` : ""}

            <p>${n.text || ""}</p>

            <small>
                📅 ${n.date || new Date(n.created).toLocaleDateString()}
            </small>

        </div>
    `).join("");
});
