console.log("🧡 CMS DEBUG START");

document.addEventListener("DOMContentLoaded", () => {

    console.log("🟢 DOM LOADED");

    const form = document.getElementById("newsForm");

    console.log("FORM:", form);

    if (!form) {
        console.error("❌ FORM BESTAAT NIET");
        return;
    }

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        console.log("🟢 SUBMIT WERKT");
        alert("CMS werkt tot hier");
    });

});
