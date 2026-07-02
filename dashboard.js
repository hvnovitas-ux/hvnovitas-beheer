import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    ref,
    get,
    child
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const naam = document.getElementById("naam");
const logout = document.getElementById("logout");

onAuthStateChanged(auth, async (user) => {

    if (!user) {
        window.location.replace("index.html");
        return;
    }

    try {

        // Controle of gebruiker beheerder is
        const snapshot = await get(
            child(ref(db), "admins/" + user.uid)
        );

        if (!snapshot.exists()) {

            await signOut(auth);

            window.location.replace("index.html");

            return;
        }

        // Naam tonen
        if (naam) {
            naam.textContent = user.displayName || user.email;
        }

        // Profielfoto tonen (optioneel)
        const foto = document.getElementById("foto");

        if (foto && user.photoURL) {
            foto.src = user.photoURL;
            foto.style.display = "block";
        }

    } catch (error) {

        console.error("Dashboard fout:", error);

        await signOut(auth);

        window.location.replace("index.html");

    }

});

// Uitloggen
if (logout) {

    logout.addEventListener("click", async () => {

        await signOut(auth);

        window.location.replace("index.html");

    });

}
