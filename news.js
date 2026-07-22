import { db } from "./firebase.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

console.log("🧡 HV NOVITAS NEWS LOADED");

const newsList = document.getElementById("newsList");

onValue(ref(db, "news"), (snapshot) => {

    const data = snapshot.val() || {};

    const items = Object.entries(data)
        .map(([id, value]) => ({ id, ...value }))
        .sort((a, b) => (b.created || 0) - (a.created || 0));

    if (!newsList) return;

    if (items.length === 0) {
        newsList.innerHTML = "<p>Geen nieuws</p>";
        return;
    }

    newsList.innerHTML = items.map(n => `
        <div class="news-item">

            <h3>${n.title || ""}</h3>

            ${n.imageUrl ? `
                <img src="${n.imageUrl}" style="width:100%;border-radius:10px;">
            ` : ""}

            <p>${n.text || ""}</p>

            <small>
                📅 ${n.date || new Date(n.created).toLocaleDateString()}
            </small>

        </div>
    `).join("");
});
