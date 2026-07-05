import { db } from "./firebase.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const newsList = document.getElementById("newsList");

onValue(ref(db, "news"), (snapshot) => {

    const data = snapshot.val();

    if (!data) {
        newsList.innerHTML = "Geen nieuws";
        return;
    }

    const items = Object.entries(data).map(([id, value]) => ({
        id,
        ...value
    }));

    newsList.innerHTML = items.reverse().map(n => {

        return `
            <div class="news-item">

                <h3>${n.title}</h3>

                ${n.image ? `<img src="${n.image}" style="width:100%; border-radius:10px; margin-top:10px;">` : ""}

                <p>${n.text}</p>

                <small>📅 ${n.date} 🕒 ${n.time}</small>

                <div class="actions">
                    <button onclick="editNews('${n.id}', '${n.title}', '${n.text}', '${n.image}')">Edit</button>
                    <button onclick="deleteNews('${n.id}')" style="background:red;">Delete</button>
                </div>

            </div>
        `;
    }).join("");

});
