import { auth } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

console.log("dashboard.js geladen");

const naam = document.getElementById("naam");
const foto = document.getElementById("foto");
const logout = document.getElementById("logout");

onAuthStateChanged(auth, (user) => {

    console.log("Auth state:", user);

    if (!user) {
        console.log("Geen gebruiker, terug naar login");
        window.location.replace("index.html");
        return;
    }

    console.log("Ingelogd als:", user.email);

    if (naam) {
        naam.textContent = user.displayName || user.email;
    }

    if (foto && user.photoURL) {
        foto.src = user.photoURL;
        foto.style.display = "block";
    }

});

logout.addEventListener("click", async () => {

    console.log("Uitloggen...");

    await signOut(auth);

    window.location.replace("index.html");

});
