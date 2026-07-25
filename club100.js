console.log("🏺 CLUB100 START");

// Firebase bestaat NU zeker
const db = firebase.database();
const clubList = document.getElementById("clubList");

db.ref("club100").on("value", (snapshot) => {

    const data = snapshot.val();

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
