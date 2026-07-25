console.log("🏺 CLUB100 START");

// 🔥 BELANGRIJK: VOORKOM DUPLICATE INIT
if (!firebase.apps.length) {
    firebase.initializeApp({
        apiKey: "JOUW_API_KEY",
        authDomain: "JOUW_PROJECT.firebaseapp.com",
        databaseURL: "https://JOUW_PROJECT.firebaseio.com",
        projectId: "JOUW_PROJECT"
    });
}

const db = firebase.database();
const clubList = document.getElementById("clubList");

// 🧠 LIVE DATA
db.ref("club100").on("value", (snapshot) => {

    const data = snapshot.val();

    console.log("CLUB100 DATA:", data);

    if (!data) {
        clubList.innerHTML = `
            <div style="color:white;text-align:center;padding:20px;">
                Nog geen leden in Club van 100
            </div>
        `;
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
💥 WAT IK HEB GEFIXT
✔ Fireba
