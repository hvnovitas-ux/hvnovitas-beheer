import { db } from "./firebase.js";
import { ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

console.log("🧡 AGENDA CMS LOADED");

const title = document.getElementById("title");
const date = document.getElementById("date");
const time = document.getElementById("time");
const text = document.getElementById("text");
const status = document.getElementById("status");
const list = document.getElementById("agendaList");

document.getElementById("save").addEventListener("click", async () => {

    if (!title.value || !date.value) {
        alert("Vul titel en datum in");
        return;
    }

    await push(ref(db, "agenda"), {
        title: title.value,
        date: date.value,
        time: time.value,
        text: text.value,
        created: Date.now()
    });

    status.textContent = "✅ Opgeslagen";

    title.value = "";
    date.value = "";
    time.value = "";
    text.value = "";
});

// ================= LOAD =================
onValue(ref(db, "agenda"), (snapshot) => {

    const data = snapshot.val();

    if (!data) {
        list.innerHTML = "<p style='color:#aaa'>Geen agenda items</p>";
        return;
    }

    const items = Object.entries(data).map(([id, v]) => ({ id, ...v }));

    list.innerHTML = items.reverse().map(i => `
        <div class="item">

            <b>${i.title}</b><br>

            <span style="color:#aaa">📅 ${i.date} 🕒 ${i.time || ""}</span>

            <p>${i.text || ""}</p>

            <button onclick="deleteItem('${i.id}')">Delete</button>

        </div>
    `).join("");

});

// ================= DELETE =================
window.deleteItem = async (id) => {
    await remove(ref(db, "agenda/" + id));
};
