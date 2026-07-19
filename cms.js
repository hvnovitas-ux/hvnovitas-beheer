import { db } from "./firebase.js";
import { ref, push, onValue, remove, update } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

console.log("🧡 STABLE CMS LOADED");

window.addEventListener("DOMContentLoaded", () => {

    // ================= NEWS =================

    const form = document.getElementById("newsForm");
    const title = document.getElementById("title");
    const text = document.getElementById("text");
    const newsList = document.getElementById("newsList");

    let editingId = null;

    if (form) {

        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            if (!title.value || !text.value) return;

            if (editingId) {

                await update(ref(db, "news/" + editingId), {
                    title: title.value,
                    text: text.value
                });

                editingId = null;

            } else {

                await push(ref(db, "news"), {
                    title: title.value,
                    text: text.value,
                    created: Date.now()
                });
            }

            form.reset();
        });
    }

    onValue(ref(db, "news"), (snapshot) => {

        const data = snapshot.val();
        if (!newsList) return;

        if (!data) {
            newsList.innerHTML = "<p>Geen nieuws</p>";
            return;
        }

        const items = Object.entries(data);

        newsList.innerHTML = items.reverse().map(([id, n]) => `
            <div class="news-item">

                <b>${n.title}</b>
                <p>${n.text}</p>

                <button onclick="editNews('${id}', \`${n.title}\`, \`${n.text}\`)">Edit</button>
                <button onclick="deleteNews('${id}')">Delete</button>

            </div>
        `).join("");
    });

    window.editNews = (id, titleValue, textValue) => {
        document.getElementById("title").value = titleValue;
        document.getElementById("text").value = textValue;
        editingId = id;
    };

    window.deleteNews = async (id) => {
        await remove(ref(db, "news/" + id));
    };


    // ================= SPONSORS =================

    const fileInput = document.getElementById("logo");
    const sponsorList = document.getElementById("sponsorList");
    const sponsorBtn = document.getElementById("saveSponsor");
    const sponsorStatus = document.getElementById("sponsorStatus");

    if (sponsorBtn && fileInput) {

        sponsorBtn.addEventListener("click", () => {

            if (!fileInput.files[0]) {
                alert("Kies eerst een logo");
                return;
            }

            if (sponsorStatus) sponsorStatus.textContent = "Uploaden...";

            const file = fileInput.files[0];
            const reader = new FileReader();

            reader.onload = async () => {

                await push(ref(db, "sponsors"), {
                    imageUrl: reader.result,
                    created: Date.now()
                });

                fileInput.value = "";
                if (sponsorStatus) sponsorStatus.textContent = "✅ Opgeslagen";
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
                <img src="${s.imageUrl}" style="height:60px; border-radius:8px;">
                <br>
                <button onclick="deleteSponsor('${id}')">Delete</button>
            </div>
        `).join("");
    });

    window.deleteSponsor = async (id) => {
        await remove(ref(db, "sponsors/" + id));
    };


    // ================= OME JAN =================

    const omeFile = document.getElementById("omejanFile");
    const omeBtn = document.getElementById("saveOmejan");
    const omeList = document.getElementById("omejanList");
    const omeStatus = document.getElementById("omejanStatus");

    if (omeBtn && omeFile) {

        omeBtn.addEventListener("click", () => {

            if (!omeFile.files[0]) {
                alert("Kies eerst een foto");
                return;
            }

            if (omeStatus) omeStatus.textContent = "Uploaden...";

            const file = omeFile.files[0];
            const reader = new FileReader();

            reader.onload = async () => {

                await push(ref(db, "omejan"), {
                    imageUrl: reader.result,
                    created: Date.now()
                });

                omeFile.value = "";
                if (omeStatus) omeStatus.textContent = "✅ Opgeslagen";
            };

            reader.readAsDataURL(file);
        });
    }

    onValue(ref(db, "omejan"), (snapshot) => {

        const data = snapshot.val();
        if (!omeList) return;

        if (!data) {
            omeList.innerHTML = "<p>Geen foto's</p>";
            return;
        }

        const items = Object.entries(data);

        omeList.innerHTML = items.map(([id, o]) => `
            <div style="display:inline-block; margin:10px;">
                <img src="${o.imageUrl}" style="height:80px; border-radius:10px;">
            </div>
        `).join("");
    });

});
