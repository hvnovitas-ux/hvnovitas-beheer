console.log("🏺 CLUB100 LOADED");

// 🔥 Firebase v8 global (komt uit HTML script tags)
const db = firebase.database();
const clubList = document.getElementById("clubList");

// LIVE DATA
db.ref("club100").on("value", (snapshot) => {

    const data = snapshot.val();

    console.log("CLUB100 DATA:", data);

    if (!data) {
        clubList.innerHTML = `
            <div style="color:white;text-align:center;padding:20px;">
                Nog geen leden
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
