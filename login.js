import {
    auth,
    provider
} from "./firebase.js";

import {
    signInWithPopup,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    ref,
    get,
    child
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

import {
    db
} from "./firebase.js";

const loginButton = document.getElementById("login");

loginButton.addEventListener("click", login);

async function login() {

    loginButton.disabled = true;
    loginButton.textContent = "⏳ Inloggen...";

    try {

        const result = await signInWithPopup(auth, provider);

        const user = result.user;

        console.log("Ingelogd als:", user.email);

        // Controle in Firebase of gebruiker beheerder is
        const snapshot = await get(
            child(ref(db), "admins/" + user.uid)
        );

        if (!snapshot.exists()) {

            alert("❌ Je bent geen beheerder van HV Novitas.");

            await signOut(auth);

            loginButton.disabled = false;
            loginButton.textContent = "🔐 Inloggen met Google";

            return;

        }

        sessionStorage.setItem("naam", user.displayName);
        sessionStorage.setItem("email", user.email);
        sessionStorage.setItem("foto", user.photoURL);

        window.location.href = "dashboard.html";

    }
    catch(error){

        console.error(error);

        alert(error.message);

        loginButton.disabled = false;
        loginButton.textContent = "🔐 Inloggen met Google";

    }

}
