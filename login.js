import {
    auth,
    provider
} from "./firebase.js";

import {
    signInWithPopup,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

// Alleen deze e-mailadressen mogen inloggen
const beheerders = [
    hvnovitas@gmail.com"
    // Later voegen we Patricia hier toe
];

document.getElementById("login").addEventListener("click", async () => {

    try {

        const result = await signInWithPopup(auth, provider);

        const user = result.user;

        if (beheerders.includes(user.email)) {

            alert("Welkom " + user.displayName);

            // Later sturen we door naar dashboard.html
            // window.location = "dashboard.html";

        } else {

            alert("Je hebt geen toegang.");

            await signOut(auth);

        }

    } catch (error) {

        alert(error.message);

    }

});
