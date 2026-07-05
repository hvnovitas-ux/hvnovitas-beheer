import { db } from "./firebase.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const home = document.getElementById("homeNews");

onValue(ref(db, "news"), (snapshot) => {

    const data = snapshot.val();

    const items = Object.entries(data || {})
        .map(([id, value]) => ({ id, ...value }))
        .reverse()
        .slice(0, 5);

    home.innerHTML = items.map(n => `
        <div class="news-item">

            <h3>${n.title}</h3>

            ${n.image ? `<img src="${n.image}" style="width:100%; border-radius:10px;">` : ""}

            <p>${n.text}</p>

        </div>
    `).join("");
});
