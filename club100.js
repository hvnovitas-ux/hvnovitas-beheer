console.log("🏺 CLUB100 SCRIPT START");

const clubList = document.getElementById("clubList");

// Firebase check
if (!firebase) {
    console.error("Firebase is niet geladen!");
}

// REF
const refDB = firebase.database().ref("club100");

// LIVE DATA
refDB.on("value", (snapshot) => {

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
