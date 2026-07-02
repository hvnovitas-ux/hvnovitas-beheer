import {
    auth,
    provider
} from "./firebase.js";

import {
    signInWithPopup,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

// ================================
// Toegestane beheerders
// ================================

const beheerders = [
    "hvnovitas@gmail.com"
    // Later:
    // "patricia@gmail.com"
];

// ================================
// Login
// ================================

const loginButton = document.getElementById("login");

loginButton.addEventListener("click", login);

async function login() {

    loginButton.disabled = true;
    loginButton.textContent = "⏳ Inloggen...";

    try {

        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        console.log("Ingelogd:", user.email);

        // Geen beheerder
        if (!beheerders.includes(user.email)) {

            await signOut(auth);

            alert("❌ Je hebt geen toegang tot HV Novitas Beheer.");

            loginButton.disabled = false;
            loginButton.textContent = "🔐 Inloggen met Google";

            return;
        }

        // Gegevens opslaan voor dashboard
        sessionStorage.setItem("displayName", user.displayName || "");
        sessionStorage.setItem("email", user.email || "");
        sessionStorage.setItem("photoURL", user.photoURL || "");

        // Naar dashboard
        window.location.replace("dashboard.html");

    } catch (error) {

        console.error(error);

        alert(
            "Inloggen mislukt.\n\n" +
            error.message
        );

        loginButton.disabled = false;
        loginButton.textContent = "🔐 Inloggen met Google";
    }

}
