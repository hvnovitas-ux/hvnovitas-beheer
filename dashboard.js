import {
    auth
} from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

// Controleer of gebruiker is ingelogd
onAuthStateChanged(auth, (user) => {

    if (!user) {
        // Niet ingelogd
        window.location.replace("index.html");
        return;
    }

    // Naam tonen
    const naam = document.getElementById("naam");

    if (naam) {
        naam.textContent = user.displayName;
    }

});

// Uitloggen
const logout = document.getElementById("logout");

if (logout) {

    logout.addEventListener("click", async () => {

        await signOut(auth);

        window.location.replace("index.html");

    });

}
Daarna passen we dashboard.html aan.

In plaats van:

<div class="user">
    Welkom
</div>

maken we er:

<div class="user">

    👤 <span id="naam"></span>
