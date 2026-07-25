console.log("🏺 CLUB100 START");

// 🔥 JOUW FIREBASE CONFIG INVULLEN
const firebaseConfig = {
    apiKey: "JOUW_API_KEY",
    authDomain: "JOUW_PROJECT.firebaseapp.com",
    databaseURL: "https://JOUW_PROJECT.firebaseio.com",
    projectId: "JOUW_PROJECT"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.database();
const clubList = document.getElementById("clubList");

// 🔄 LIVE DATA
db.ref("club100").on("value", (snap) => {

    const data = snap.val();

    if (!data) {
        clubList.innerHTML = "<p style='color:white'>Geen leden</p>";
        return;
    }

    const items = Object.entries(data);

    clubList.innerHTML = items.map(([id, p]) => {

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
