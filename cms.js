import { db } from "./firebase.js";
import {
    ref,
    push,
    onValue,
    remove,
    update
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

console.log("🧡 HV NOVITAS CMS LOADED");

window.addEventListener("DOMContentLoaded", () => {

    // ================= NEWS =================

    const newsForm = document.getElementById("newsForm");
    const title = document.getElementById("title");
    const text = document.getElementById("text");
    const newsList = document.getElementById("newsList");

    let editingNewsId = null;

    if (newsForm) {

        newsForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            if (!title.value || !text.value) return;

            if (editingNewsId) {

                await update(ref(db, "news/" + editingNewsId), {
                    title: title.value,
                    text: text.value
                });

                editingNewsId = null;

            } else {

                await push(ref(db, "news"), {
                    title: title.value,
                    text: text.value,
                    created: Date.now()
                });
            }

            newsForm.reset();
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

    window.editNews = (id, t, txt) => {
        document.getElementById("title").value = t;
        document.getElementById("text").value = txt;
        editingNewsId = id;
    };

    window.deleteNews = async (id) => {
        await remove(ref(db, "news/" + id));
    };


    // ================= SPONSORS =================

    const sponsorFile = document.getElementById("logo");
    const sponsorBtn = document.getElementById("saveSponsor");
    const sponsorList = document.getElementById("sponsorList");
    const sponsorStatus = document.getElementById("sponsorStatus");

    if (sponsorBtn && sponsorFile) {

        sponsorBtn.addEventListener("click", () => {

            if (!sponsorFile.files[0]) return alert("Kies logo");

            sponsorStatus.textContent = "Uploaden...";

            const reader = new FileReader();

            reader.onload = async () => {

                await push(ref(db, "sponsors"), {
                    imageUrl: reader.result,
                    created: Date.now()
                });

                sponsorFile.value = "";
                sponsorStatus.textContent = "✅ Opgeslagen";
            };

            reader.readAsDataURL(sponsorFile.files[0]);
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
            <div style="display:inline-block;margin:10px;text-align:center;">
                <img src="${s.imageUrl}" style="height:60px;border-radius:8px;">
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

            if (!omeFile.files[0]) return alert("Kies foto");

            omeStatus.textContent = "Uploaden...";

            const reader = new FileReader();

            reader.onload = async () => {

                await push(ref(db, "omejan"), {
                    imageUrl: reader.result,
                    created: Date.now()
                });

                omeFile.value = "";
                omeStatus.textContent = "✅ Opgeslagen";
            };

            reader.readAsDataURL(omeFile.files[0]);
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
            <div style="display:inline-block;margin:10px;text-align:center;">
                <img src="${o.imageUrl}" style="height:80px;border-radius:10px;">
                <br>
                <button onclick="deleteOmeJan('${id}')"
                    style="background:red;color:white;border:none;padding:5px;border-radius:5px;">
                    Delete
                </button>
            </div>
        `).join("");
    });

    window.deleteOmeJan = async (id) => {
        await remove(ref(db, "omejan/" + id));
    };


    // ================= AGENDA SYSTEM =================

    const agendaType = document.getElementById("agendaType");
    const agendaDate = document.getElementById("agendaDate");
    const agendaTime = document.getElementById("agendaTime");
    const agendaTeam1 = document.getElementById("agendaTeam1");
    const agendaTeam2 = document.getElementById("agendaTeam2");
    const agendaBulk = document.getElementById("agendaBulk");

    const agendaList = document.getElementById("agendaList");
    const agendaStatus = document.getElementById("agendaStatus");

    // SINGLE

    const saveAgenda = document.getElementById("saveAgenda");

    if (saveAgenda) {

        saveAgenda.addEventListener("click", async () => {

            await push(ref(db, "agenda"), {
                type: agendaType.value,
                mode: "single",
                date: agendaDate.value,
                time: agendaTime.value,
                team1: agendaTeam1.value,
                team2: agendaTeam2.value,
                created: Date.now()
            });

            agendaStatus.textContent = "✅ Opgeslagen";
        });
    }

    // BULK

    const bulkBtn = document.getElementById("importAgendaBulk");

    if (bulkBtn) {

        bulkBtn.addEventListener("click", async () => {

            const lines = agendaBulk.value.split("\n");

            let count = 0;

            for (let line of lines) {

                if (!line.trim()) continue;

                const p = line.split(" ");

                await push(ref(db, "agenda"), {
                    type: line.includes("training") ? "training" : "match",
                    mode: "bulk",
                    raw: line,
                    date: p[0] + " " + p[1],
                    time: p[2],
                    team1: p[3] || "",
                    team2: p[4] || "",
                    created: Date.now()
                });

                count++;
            }

            agendaStatus.textContent = "📋 Bulk: " + count + " toegevoegd";
            agendaBulk.value = "";
        });
    }

    // REPEAT

    const repeatBtn = document.getElementById("generateRepeat");

    if (repeatBtn) {

        repeatBtn.addEventListener("click", async () => {

            const start = new Date(document.getElementById("repeatFrom").value);
            const end = new Date(document.getElementById("repeatUntil").value);
            const time = document.getElementById("repeatTime").value;
            const title = document.getElementById("repeatTitle").value;

            let current = new Date(start);

            while (current <= end) {

                if (current.getDay() === 2) {

                    await push(ref(db, "agenda"), {
                        type: "training",
                        mode: "repeat",
                        date: current.toDateString(),
                        time,
                        team1: title,
                        created: Date.now()
                    });
                }

                current.setDate(current.getDate() + 1);
            }

            agendaStatus.textContent = "🔁 Herhaling klaar";
        });
    }

    // LOAD AGENDA

    onValue(ref(db, "agenda"), (snapshot) => {

        const data = snapshot.val();
        if (!agendaList) return;

        if (!data) {
            agendaList.innerHTML = "<p>Geen agenda</p>";
            return;
        }

        const items = Object.entries(data);

        agendaList.innerHTML = items.map(([id, a]) => `
            <div class="news-item">

                <b>${a.date} - ${a.time}</b><br>
                ${a.team1 || ""} ${a.team2 || ""}<br>
                <small>${a.type} (${a.mode})</small>

                <br><br>
                <button onclick="deleteAgenda('${id}')">Delete</button>

            </div>
        `).join("");
    });

    window.deleteAgenda = async (id) => {
        await remove(ref(db, "agenda/" + id));
    };

});
