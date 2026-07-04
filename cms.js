
// ==========================================
// CMS START
// ==========================================

console.log("🔥 CMS JS GELADEN");

// ==========================================
// DOM READY
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    console.log("🔥 DOM LOADED");

    const form = document.getElementById("newsForm");

    console.log("FORM:", form);

    if (!form) {
        console.error("❌ FORM NIET GEVONDEN - check HTML id='newsForm'");
        return;
    }

    form.addEventListener("submit", (e) => {

        e.preventDefault();

        console.log("🔥 SUBMIT WERKT");

        alert("Form submit werkt!");

    });

});
