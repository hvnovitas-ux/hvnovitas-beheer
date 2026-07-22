import { db } from "./firebase.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const container = document.getElementById("newsList");

onValue(ref(db, "news"), (snapshot) => {

    const data = snapshot.val() || {};

    const items = Object.entries(data)
        .map(([id, n]) => ({ id, ...n }))
        .sort((a, b) => (b.created || 0) - (a.created || 0));

    if (!container) return;

    if (items.length === 0) {
        container.innerHTML = "<p>Geen nieuws</p>";
        return;
    }

    container.innerHTML = items.map(n => `
        <div class="news-item">

            <h3>${n.title || ""}</h3>

            <!-- 💥 FOTO FIX (DIT MOET JE GEBRUIKEN) -->
            ${n.imageUrl ? `
                <img src="${n.imageUrl}" style="width:100%;border-radius:10px;margin-top:10px;">
            ` : ""}

            <p>${n.text || ""}</p>

            <small>
                📅 ${n.date || new Date(n.created).toLocaleDateString()}
            </small>

        </div>
    `).join("");
});
