import { db } from "./firebase.js";
import { ref, push } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const form = document.getElementById("uploadForm");
const status = document.getElementById("status");

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const title = document.getElementById("title").value;
    const text = document.getElementById("text").value;
    const file = document.getElementById("image").files[0];

    if (!title || !text) {
        alert("Vul alles in");
        return;
    }

    status.textContent = "⏳ Foto upload nog niet actief...";

    // tijdelijk: alleen tekst testen
    await push(ref(db, "news"), {
        title,
        text,
        image: "",
        created: Date.now(),
        date: new Date().toLocaleDateString("nl-NL"),
        time: new Date().toLocaleTimeString("nl-NL")
    });

    status.textContent = "✅ Werkt (test zonder foto)";
});
