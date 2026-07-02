import {
    auth,
    provider
} from "./firebase.js";

import {
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

const loginButton = document.getElementById("login");

loginButton.addEventListener("click", login);

async function login() {

    loginButton.disabled = true;
    loginButton.textContent = "⏳ Inloggen...";

    try {

        const result = await signInWithPopup(auth, provider);

        const user = result.user;

        console.log("Ingelogd:", user);

        sessionStorage.setItem("uid", user.uid);
        sessionStorage.setItem("naam", user.displayName || "");
        sessionStorage.setItem("email", user.email || "");
        sessionStorage.setItem("foto", user.photoURL || "");

        window.location.href = "dashboard.html";

    } catch (error) {

        console.error(error);

        alert("Inloggen mislukt.\n\n" + error.message);

        loginButton.disabled = false;
        loginButton.textContent = "🔐 Inloggen met Google";

    }

}
