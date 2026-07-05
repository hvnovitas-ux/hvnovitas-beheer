import { db } from "./firebase.js";
import { ref, push } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

console.log("🧡 CMS FINAL ACTIVE");

document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("newsForm");
    const status = document.getElementById("status");

    if (!form) {
        console.error("❌ FORM NIET GEVONDEN");
        return;
    }

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        console.log("🟢 SUBMIT TRIGGERED");

        const title = document.getElementById("title").value;
        const text = document.getElementById("text").value;

        if (!title || !text) {
            alert("Vul alles in");
            return;
        }

        try {

            status.textContent = "⏳ Opslaan...";

            await push(ref(db, "news"), {
                title,
                text,
                image: "",
                created: Date.now(),
                date: new Date().toLocaleDateString("nl-NL"),
                time: new Date().toLocaleTimeString("nl-NL")
            });

            status.textContent = "✅ Opgeslagen!";
            form.reset();

        } catch (err) {
            console.error("FIREBASE ERROR:", err);
            status.textContent = "❌ Fout bij opslaan";
        }

    });

});
