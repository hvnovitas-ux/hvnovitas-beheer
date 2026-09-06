// ============================================================
// HV NOVITAS - OME JAN OPENBARE WEERGAVE
// Alleen lezen uit Firebase
// ============================================================

import { db } from "./firebase.js";

import {
    ref,
    onValue
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const container =
    document.getElementById("omejanContainer") ||
    document.getElementById("omejanGrid");

let images = [];
let index = 0;
let timer = null;

function escapeHTML(value = "") {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

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

function render() {
    if (!container) return;

    if (!images.length) {
        container.innerHTML = "";
        return;
    }

    const current = images[index];

    container.innerHTML = `
        <div class="omejan-slide">
            <img
                src="${escapeHTML(current.imageUrl)}"
                alt="Ome Jan">
        </div>
    `;
}

function next() {
    if (!images.length) return;

    index = (index + 1) % images.length;
    render();
}

function startAutoplay() {
    if (timer) {
        clearInterval(timer);
    }

    if (images.length > 1) {
        timer = setInterval(
            next,
            5000
        );
    }
}

onValue(
    ref(db, "omejan"),
    (snapshot) => {
        images = getImages(snapshot);
        index = 0;

        render();
        startAutoplay();
    }
);

if (container) {
    let startX = 0;

    container.addEventListener(
        "touchstart",
        (event) => {
            startX =
                event.touches?.[0]?.clientX || 0;
        },
        { passive: true }
    );

    container.addEventListener(
        "touchend",
        (event) => {
            const endX =
                event.changedTouches?.[0]?.clientX || 0;

            const delta = endX - startX;

            if (Math.abs(delta) < 40) {
                return;
            }

            if (delta < 0) {
                next();
            } else {
                index =
                    images.length
                        ? (index - 1 + images.length) %
                          images.length
                        : 0;

                render();
            }

            startAutoplay();
        },
        { passive: true }
    );
}

console.log("🧡 Ome Jan openbare module gereed.");
