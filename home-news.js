import { db } from "./firebase.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const newsList = document.getElementById("newsList");

if (!newsList) {
    console.error("❌ newsList ontbreekt in HTML");
}

onValue(ref(db, "news"), (snapshot) => {

    const data = snapshot.val();

    if (!newsList) return;

    if (!data) {
        newsList.innerHTML = "Geen nieuws";
        return;
    }

    const items = Object.entries(data).map(([id, value]) => ({
        id,
        ...value
    }));

    newsList.innerHTML = items.reverse().map(n => `
        <div class="news-item">

            <h3>${n.title}</h3>

            ${n.image ? `<img src="${n.image}" style="width:100%; border-radius:10px;">` : ""}

            <p>${n.text}</p>

            <small>📅 ${n.date} 🕒 ${n.time}</small>

        </div>
    `).join("");

});
