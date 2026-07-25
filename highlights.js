import { db } from "./firebase.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const container = document.getElementById("highlightList");

onValue(ref(db, "highlights"), (snapshot) => {

    const data = snapshot.val() || {};

    const items = Object.values(data)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    if (!container) return;

    container.innerHTML = items.map(h => `
        <div class="highlight">

            <h3>${h.title}</h3>

            <small>📅 ${h.date} | ⭐ ${h.type}</small>

            <p>${h.text}</p>

        </div>
    `).join("");
});
