// ============================================================
// HV NOVITAS - OME JAN OPENBARE WEERGAVE
// Alleen lezen uit Firebase
// ============================================================

import { db } from "./firebase.js";

import {
    ref,
    onValue
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const track = document.getElementById("track");
const dots = document.getElementById("dots");
const prev = document.getElementById("prev");
const nextButton = document.getElementById("next");

let images = [];
let index = 0;
let timer = null;


// ============================================================
// HTML VEILIG MAKEN
// ============================================================

function escapeHTML(value = "") {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ============================================================
// FOTO'S UIT FIREBASE
// ============================================================

function getImages(snapshot) {

    const data = snapshot.val() || {};

    return Object.values(data)
        .filter(item => item && item.imageUrl)
        .sort(
            (a, b) =>
                (b.created || 0) -
                (a.created || 0)
        );
}


// ============================================================
// WEERGAVE
// ============================================================

function render() {

    if (!track) return;

    if (!images.length) {

        track.innerHTML =
            "<div class=\"empty\">Geen foto's</div>";

        if (dots) {
            dots.innerHTML = "";
        }

        return;
    }


    track.innerHTML = images.map(image => `
        <div class="slide">
            <img
                src="${escapeHTML(image.imageUrl)}"
                alt="Ome Jan">
        </div>
    `).join("");


    track.style.transform =
        `translateX(-${index * 100}%)`;


    if (dots) {

        dots.innerHTML = images.map((_, i) => `
            <button
                class="dot${i === index ? " active" : ""}"
                data-index="${i}"
                aria-label="Afbeelding ${i + 1}">
            </button>
        `).join("");


        dots
            .querySelectorAll(".dot")
            .forEach(dot => {

                dot.addEventListener("click", () => {

                    index =
                        Number(dot.dataset.index);

                    render();
                    restartAutoplay();
                });

            });
    }
}


// ============================================================
// VOLGENDE
// ============================================================

function showNext() {

    if (images.length <= 1) return;

    index =
        (index + 1) %
        images.length;

    render();
}


// ============================================================
// VORIGE
// ============================================================

function showPrevious() {

    if (images.length <= 1) return;

    index =
        (index - 1 + images.length) %
        images.length;

    render();
}


// ============================================================
// AUTOPLAY
// ============================================================

function startAutoplay() {

    if (timer) {
        clearInterval(timer);
    }

    if (images.length > 1) {

        timer = setInterval(
            showNext,
            5000
        );
    }
}


function restartAutoplay() {

    startAutoplay();
}


// ============================================================
// KNOPPEN
// ============================================================

if (nextButton) {

    nextButton.addEventListener(
        "click",
        () => {

            showNext();
            restartAutoplay();

        }
    );
}


if (prev) {

    prev.addEventListener(
        "click",
        () => {

            showPrevious();
            restartAutoplay();

        }
    );
}


// ============================================================
// FIREBASE
// ============================================================

onValue(
    ref(db, "omejan"),
    snapshot => {

        images =
            getImages(snapshot);

        index = 0;

        render();
        startAutoplay();
    }
);


console.log(
    "🧡 Ome Jan openbare module gereed."
);
