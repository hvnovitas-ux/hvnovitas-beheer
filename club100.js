console.log("🏺 CLUB100 LOADED");

// 🔥 Firebase config (INVULLEN MET JOUW GEGEVENS)
const firebaseConfig = {
    apiKey: "JOUW_API_KEY",
    authDomain: "JOUW_PROJECT.firebaseapp.com",
    databaseURL: "https://JOUW_PROJECT.firebaseio.com",
    projectId: "JOUW_PROJECT"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.database();
const clubList = document.getElementById("clubList");

// 🧠 LIVE DATA
db.ref("club100").on("value", (snapshot) => {

    const data = snapshot.val();

    if (!data) {
        clubList.innerHTML = `
            <div style="color:white;text-align:center;padding:20px;">
                Nog geen Club van 100 leden
            </div>
        `;
        return;
    }

    const items = Object.entries(data).map(([id, item]) => ({
        id,
        ...item
    }));

    clubList.innerHTML = items.map(p => {

        const parts = (p.name || "").split(" ");
        const first = parts[0] || "";
        const last = parts.slice(1).join(" ") || "";

        return `
            <div class="tile">
                <div class="tile-name">
                    <div>${first}</div>
                    <div>${last}</div>
                </div>
            </div>
        `;
    }).join("");
});
