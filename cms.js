import { db } from "./firebase.js";
import { ref, push } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

console.log("🧡 CMS SAFE START");

const form = document.getElementById("newsForm");
const status = document.getElementById("status");

if (!form) {
    console.error("❌ newsForm niet gevonden");
} else {

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        const title = document.getElementById("title").value;
        const text = document.getElementById("text").value;

        if (!title || !text) {
            alert("Vul alles in");
            return;
        }

        await push(ref(db, "news"), {
            title,
            text,
            image: "",
            created: Date.now(),
            date: new Date().toLocaleDateString("nl-NL"),
            time: new Date().toLocaleTimeString("nl-NL")
        });

        status.textContent = "✅ Werkt (basis versie)";
    });
}
