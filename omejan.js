import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "hv-novitas-beheer.firebaseapp.com",
    databaseURL: "https://hv-novitas-beheer-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "hv-novitas-beheer"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const track = document.getElementById("sliderTrack");
const dots = document.getElementById("dots");

let images = [];
let index = 0;

onValue(ref(db, "omejan"), (snapshot) => {

    const data = snapshot.val();

    if (!data) {
        track.innerHTML = "<p>Geen foto's</p>";
        return;
    }

    images = Object.values(data);

    track.innerHTML = images.map(img => `
        <img src="${img.imageUrl}" style="width:100%">
    `).join("");

    createDots();
    startSlider();
});

function createDots() {

    dots.innerHTML = "";

    images.forEach((_, i) => {

        const dot = document.createElement("span");
        dot.style.cssText = "height:10px;width:10px;background:#ccc;display:inline-block;margin:5px;border-radius:50%";

        dots.appendChild(dot);
    });
}

function startSlider() {

    setInterval(() => {

        index++;

        if (index >= images.length) {
            index = 0;
        }

        track.style.transform = `translateX(-${index * 100}%)`;

    }, 3000);
}
