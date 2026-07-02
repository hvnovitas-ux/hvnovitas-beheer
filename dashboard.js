import { auth } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

const naam=document.getElementById("naam");
const logout=document.getElementById("logout");

onAuthStateChanged(auth,(user)=>{

    if(!user){

        window.location.replace("index.html");
        return;

    }

    naam.textContent=user.displayName;

});

logout.onclick=async()=>{

    await signOut(auth);

    window.location.replace("index.html");

};
