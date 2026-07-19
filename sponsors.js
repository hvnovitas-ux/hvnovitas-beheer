import { db } from "./firebase.js";
import { ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

console.log("🧡 Sponsors CMS geladen");

const fileInput = document.getElementById("logo");
const list = document.getElementById("sponsorList");
const status = document.getElementById("sponsorStatus"); // 🔥 FIX

document.getElementById("saveSponsor").addEventListener("click", async () => {

    if (!fileInput.files[0]) {
        alert("Kies eerst een logo");
        return;
    }

    status.textContent = "Uploaden...";

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = async () => {

        await push(ref(db, "sponsors"), {
            imageUrl: reader.result,
            created: Date.now()
        });

        fileInput.value = "";
        status.textContent = "✅ Opgeslagen";
    };

    reader.readAsDataURL(file);
});

onValue(ref(db, "sponsors"), (snapshot) => {

    const data = snapshot.val();

    if (!list) return;

    if (!data) {
        list.innerHTML = "<p>Geen sponsors</p>";
        return;
    }

    const items = Object.entries(data);

    list.innerHTML = items.map(([id, s]) => `
        <div style="display:inline-block; margin:10px; text-align:center;">

            <img src="${s.imageUrl}" style="height:60px; background:white; padding:5px; border-radius:8px;">

            <br>

            <button onclick="deleteSponsor('${id}')">Delete</button>

        </div>
    `).join("");
});

window.deleteSponsor = async (id) => {
    await remove(ref(db, "sponsors/" + id));
};
