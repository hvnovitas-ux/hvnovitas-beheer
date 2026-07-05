import { db } from "./firebase.js";
import { ref, push } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

console.log("🧡 CMS FINAL LOADED");

document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("newsForm");
    const status = document.getElementById("status");

    if (!form) {
        console.error("❌ newsForm niet gevonden");
        return;
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        console.log("🟢 SUBMIT WERKT");

        const title = document.getElementById("title").value;
        const text = document.getElementById("text").value;

        if (!title || !text) {
            alert("Vul titel en tekst in");
            return;
        }

        try {

            status.textContent = "⏳ Opslaan...";

            await push(ref(db, "news"), {
                title: title,
                text: text,
                image: "",
                created: Date.now(),
                date: new Date().toLocaleDateString("nl-NL"),
                time: new Date().toLocaleTimeString("nl-NL", {
                    hour: "2-digit",
                    minute: "2-digit"
                })
            });

            console.log("✅ OPGESLAGEN IN FIREBASE");

            form.reset();
            status.textContent = "✅ Nieuws opgeslagen";

        } catch (err) {

            console.error("❌ FIREBASE ERROR:", err);
            status.textContent = "❌ Fout bij opslaan";
        }
    });

});
