import { db } from "./firebase.js";
import {
    ref,
    push,
    onValue,
    remove
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

console.log("CMS ADMIN LOADED");

// =====================
// 🧱 CLUB100 (WRITE)
// =====================

const clubName = document.getElementById("clubName");

document.getElementById("saveClub100")?.addEventListener("click", async () => {
    if (!clubName.value) return;

    await push(ref(db, "club100"), {
        name: clubName.value,
        created: Date.now()
    });

    clubName.value = "";
});

// optional admin list
const clubList = document.getElementById("clubList");

onValue(ref(db, "club100"), (snap) => {
    const data = snap.val() || {};

    clubList.innerHTML = Object.entries(data).map(([id, p]) => `
        <div>
            ${p.name}
            <button onclick="del('club100','${id}')">🗑</button>
        </div>
    `).join("");
});

// =====================
// 🏆 HIGHLIGHTS
// =====================

document.getElementById("saveHighlight")?.addEventListener("click", async () => {

    const title = document.getElementById("hlTitle").value;
    const text = document.getElementById("hlText").value;

    if (!title) return;

    await push(ref(db, "highlights"), {
        title,
        text,
        created: Date.now()
    });
});

// =====================
// 📰 NEWS
// =====================

document.getElementById("saveNews")?.addEventListener("click", async () => {

    const title = document.getElementById("newsTitle").value;
    const text = document.getElementById("newsText").value;

    if (!title) return;

    await push(ref(db, "news"), {
        title,
        text,
        created: Date.now()
    });
});

// =====================
// 🧹 DELETE ONLY (ADMIN)
// =====================

window.del = (path, id) => {
    remove(ref(db, path + "/" + id));
};
