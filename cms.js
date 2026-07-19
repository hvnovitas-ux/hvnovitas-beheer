import { db } from "./firebase.js";
import { ref, push, onValue, remove, update } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

console.log("🧡 CLEAN CMS LOADED");

window.addEventListener("DOMContentLoaded", () => {

    // ================= NEWS =================

    const form = document.getElementById("newsForm");
    const title = document.getElementById("title");
    const text = document.getElementById("text");
    const statusNews = document.getElementById("newsStatus");
    const newsList = document.getElementById("newsList");

    window.editingId = null;
    window.newsCache = {};

    if (form) {

        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            if (!title.value || !text.value) return;

            if (window.editingId) {

                await update(ref(db, "news/" + window.editingId), {
                    title: title.value,
                    text: text.value
                });

                window.editingId = null;

            } else {

                await push(ref(db, "news"), {
                    title: title.value,
                    text: text.value,
                    created: Date.now()
                });
            }

            form.reset();
            if (statusNews) statusNews.textContent = "✅ Opgeslagen";
        });
    }

    onValue(ref(db, "news"), (snapshot) => {

        const data = snapshot.val();
        if (!newsList) return;

        if (!data) {
            newsList.innerHTML = "<p>Geen nieuws</p>";
            return;
        }

        window.newsCache = data;

        const items = Object.entries(data);

        newsList.innerHTML = items.reverse().map(([id, n]) => `
            <div class="news-item">

                <b>${n.title}</b>
                <p>${n.text}</p>

                <button onclick="editNews('${id}')">Edit</button>
                <button onclick="deleteNews('${id}')">Delete</button>

            </div>
        `).join("");
    });

    window.deleteNews = async (id) => {
        await remove(ref(db, "news/" + id));
    };

    window.editNews = (id) => {
        const data = window.newsCache[id];
        if (!data) return;

        document.getElementById("title").value = data.title;
        document.getElementById("text").value = data.text;
        window.editingId = id;
    };

    // ================= SPONSORS =================

    const fileInput = document.getElementById("logo");
    const sponsorList = document.getElementById("sponsorList");
    const statusSponsor = document.getElementById("sponsorStatus");
    const btn = document.getElementById("saveSponsor");

    if (btn && fileInput) {

        btn.addEventListener("click", () => {

            if (!fileInput.files[0]) {
                alert("Kies eerst een logo");
                return;
            }

            if (statusSponsor) statusSponsor.textContent = "Uploaden...";

            const file = fileInput.files[0];
            const reader = new FileReader();

            reader.onload = async () => {

                await push(ref(db, "sponsors"), {
                    imageUrl: reader.result,
                    created: Date.now()
                });

                fileInput.value = "";
                if (statusSponsor) statusSponsor.textContent = "✅ Opgeslagen";
            };

            reader.readAsDataURL(file);
        });
    }

    onValue(ref(db, "sponsors"), (snapshot) => {

        const data = snapshot.val();
        if (!sponsorList) return;

        if (!data) {
            sponsorList.innerHTML = "<p>Geen sponsors</p>";
            return;
        }

        const items = Object.entries(data);

        sponsorList.innerHTML = items.map(([id, s]) => `
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

    // ================= OME JAN =================

    const fileInputO = document.getElementById("omejanFile");
    const btnO = document.getElementById("saveOmejan");
    const listO = document.getElementById("omejanList");
    const statusO = document.getElementById("omejanStatus");

    if (btnO && fileInputO) {

        btnO.addEventListener("click", () => {

            if (!fileInputO.files[0]) {
                alert("Kies eerst een foto");
                return;
            }

            if (statusO) statusO.textContent = "Uploaden...";

            const file = fileInputO.files[0];
            const reader = new FileReader();

            reader.onload = async () => {

                await push(ref(db, "omejan"), {
                    imageUrl: reader.result,
                    created: Date.now()
                });

                fileInputO.value = "";
                if (statusO) statusO.textContent = "✅ Opgeslagen";
            };

            reader.readAsDataURL(file);
        });
    }

    onValue(ref(db, "omejan"), (snapshot) => {

        if (!listO) return;

        const data = snapshot.val();

        if (!data) {
            listO.innerHTML = "<p>Geen foto's</p>";
            return;
        }

        const items = Object.entries(data);

        listO.innerHTML = items.map(([id, o]) => `
            <div style="display:inline-block; margin:10px;">
                <img src="${o.imageUrl}" style="height:80px; border-radius:10px;">
            </div>
        `).join("");
    });

});
