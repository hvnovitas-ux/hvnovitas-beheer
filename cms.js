import { db } from "./firebase.js";

import {
    ref,
    push,
    onValue,
    remove
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

console.log("🔥 CMS CORE LOADED");


// =====================================================
// 🧱 CLUB100
// =====================================================

document
    .getElementById("saveClub100")
    ?.addEventListener("click", async () => {

        const name =
            document.getElementById("clubName")?.value?.trim();

        if (!name) return;

        try {

            await push(ref(db, "club100"), {
                name: name,
                created: Date.now()
            });

            document.getElementById("clubName").value = "";

            console.log("✅ Club100 lid opgeslagen");

        } catch (error) {

            console.error(
                "❌ Fout bij Club100:",
                error
            );

        }

    });


onValue(ref(db, "club100"), snap => {

    const list =
        document.getElementById("clubList");

    if (!list) return;

    const data =
        snap.val() || {};

    list.innerHTML =
        Object.entries(data)
            .map(([id, v]) => `

                <div class="tile">

                    <span>
                        ${escapeHtml(v.name || "")}
                    </span>

                    <button
                        onclick="del('club100','${id}')"
                    >
                        🗑
                    </button>

                </div>

            `)
            .join("");

});


// =====================================================
// 🏆 HIGHLIGHTS
// =====================================================

document
    .getElementById("saveHighlight")
    ?.addEventListener("click", async () => {

        try {

            await push(ref(db, "highlights"), {

                date:
                    document
                        .getElementById("hlDate")
                        ?.value || "",

                title:
                    document
                        .getElementById("hlTitle")
                        ?.value || "",

                text:
                    document
                        .getElementById("hlText")
                        ?.value || "",

                created:
                    Date.now()

            });

            console.log("✅ Highlight opgeslagen");

        } catch (error) {

            console.error(
                "❌ Fout bij highlight:",
                error
            );

        }

    });


onValue(ref(db, "highlights"), snap => {

    const list =
        document.getElementById("highlightList");

    if (!list) return;

    const data =
        snap.val() || {};

    list.innerHTML =
        Object.entries(data)
            .map(([id, v]) => `

                <div class="card">

                    <b>
                        ${escapeHtml(v.title || "")}
                    </b>

                    <p>
                        ${escapeHtml(v.text || "")}
                    </p>

                    <small>
                        ${escapeHtml(v.date || "")}
                    </small>

                    <button
                        onclick="del('highlights','${id}')"
                    >
                        🗑
                    </button>

                </div>

            `)
            .join("");

});


// =====================================================
// 📰 NEWS
// =====================================================

document
    .getElementById("saveNews")
    ?.addEventListener("click", async () => {

        try {

            const file =
                document
                    .getElementById("newsImage")
                    ?.files[0];

            let url = "";


            // -----------------------------------------
            // AFBEELDING UPLOADEN
            // -----------------------------------------

            if (file) {

                const form =
                    new FormData();

                form.append(
                    "file",
                    file
                );

                form.append(
                    "upload_preset",
                    "hvnovitas_upload"
                );


                const res =
                    await fetch(
                        "https://api.cloudinary.com/v1_1/hwxe3jzg/image/upload",
                        {
                            method: "POST",
                            body: form
                        }
                    );


                const data =
                    await res.json();

                url =
                    data.secure_url || "";

            }


            // -----------------------------------------
            // NIEUWS OPSLAAN
            // -----------------------------------------

            await push(ref(db, "news"), {

                title:
                    document
                        .getElementById("newsTitle")
                        ?.value || "",

                text:
                    document
                        .getElementById("newsText")
                        ?.value || "",

                imageUrl:
                    url,

                created:
                    Date.now()

            });


            console.log("✅ Nieuws opgeslagen");

        } catch (error) {

            console.error(
                "❌ Fout bij nieuws:",
                error
            );

        }

    });


onValue(ref(db, "news"), snap => {

    const list =
        document.getElementById("newsList");

    if (!list) return;

    const data =
        snap.val() || {};


    list.innerHTML =
        Object.entries(data)
            .map(([id, v]) => `

                <div class="card">

                    <b>
                        ${escapeHtml(v.title || "")}
                    </b>

                    <p>
                        ${escapeHtml(v.text || "")}
                    </p>

                    ${
                        v.imageUrl
                            ? `
                                <img
                                    src="${escapeAttribute(v.imageUrl)}"
                                    alt="Nieuws"
                                >
                              `
                            : ""
                    }

                    <button
                        onclick="del('news','${id}')"
                    >
                        🗑
                    </button>

                </div>

            `)
            .join("");

});


// =====================================================
// 🤝 SPONSORS
// =====================================================
// NIEUW:
// - Sponsor naam
// - Sponsor logo
// - Sponsor website
// - created
//
// Sponsor van de Week wordt NIET hier ingesteld.
// Dat gebeurt automatisch op de website.
// =====================================================

document
    .getElementById("saveSponsor")
    ?.addEventListener("click", async () => {

        try {

            // -----------------------------------------
            // SPONSORNAAM
            // -----------------------------------------

            const name =
                document
                    .getElementById("sponsorName")
                    ?.value
                    ?.trim() || "";


            // -----------------------------------------
            // WEBSITE
            // -----------------------------------------

            let website =
                document
                    .getElementById("sponsorWebsite")
                    ?.value
                    ?.trim() || "";


            // -----------------------------------------
            // WEBSITE NORMALISEREN
            // -----------------------------------------

            website =
                normalizeUrl(website);


            // -----------------------------------------
            // LOGO
            // -----------------------------------------

            const file =
                document
                    .getElementById("sponsorImage")
                    ?.files[0];


            if (!file) {

                alert(
                    "Kies eerst een sponsorlogo."
                );

                return;

            }


            // -----------------------------------------
            // CLOUDINARY UPLOAD
            // -----------------------------------------

            const form =
                new FormData();

            form.append(
                "file",
                file
            );

            form.append(
                "upload_preset",
                "hvnovitas_upload"
            );


            const res =
                await fetch(
                    "https://api.cloudinary.com/v1_1/hwxe3jzg/image/upload",
                    {
                        method: "POST",
                        body: form
                    }
                );


            if (!res.ok) {

                throw new Error(
                    "Cloudinary upload mislukt"
                );

            }


            const data =
                await res.json();


            const imageUrl =
                data.secure_url || "";


            if (!imageUrl) {

                throw new Error(
                    "Geen afbeelding ontvangen van Cloudinary"
                );

            }


            // -----------------------------------------
            // SPONSOR OPSLAAN
            // -----------------------------------------

            await push(
                ref(db, "sponsors"),
                {

                    name:
                        name,

                    imageUrl:
                        imageUrl,

                    website:
                        website,

                    created:
                        Date.now(),

                    active:
                        true

                }
            );


            console.log(
                "✅ Sponsor opgeslagen:",
                name
            );


            // -----------------------------------------
            // FORMULIER LEEGMAKEN
            // -----------------------------------------

            const nameField =
                document.getElementById(
                    "sponsorName"
                );

            const websiteField =
                document.getElementById(
                    "sponsorWebsite"
                );

            const imageField =
                document.getElementById(
                    "sponsorImage"
                );


            if (nameField) {
                nameField.value = "";
            }


            if (websiteField) {
                websiteField.value = "";
            }


            if (imageField) {
                imageField.value = "";
            }


            alert(
                "Sponsor succesvol toegevoegd."
            );


        } catch (error) {

            console.error(
                "❌ Fout bij sponsor:",
                error
            );


            alert(
                "Sponsor kon niet worden opgeslagen."
            );

        }

    });


// =====================================================
// SPONSORS WEERGEVEN
// =====================================================

onValue(
    ref(db, "sponsors"),
    snap => {

        const list =
            document.getElementById(
                "sponsorList"
            );

        if (!list) return;


        const data =
            snap.val() || {};


        const entries =
            Object.entries(data);


        if (entries.length === 0) {

            list.innerHTML =
                "<p>Geen sponsors toegevoegd.</p>";

            return;

        }


        list.innerHTML =
            entries
                .map(([id, v]) => {

                    const name =
                        v.name ||
                        "Sponsor";


                    const website =
                        normalizeUrl(
                            v.website || ""
                        );


                    return `

                        <div
                            class="card sponsor-card"
                        >

                            ${
                                v.imageUrl
                                    ? `
                                        <img
                                            src="${escapeAttribute(v.imageUrl)}"
                                            alt="${escapeAttribute(name)}"
                                        >
                                      `
                                    : ""
                            }


                            <div
                                class="sponsor-info"
                            >

                                <strong>
                                    ${escapeHtml(name)}
                                </strong>


                                ${
                                    website
                                        ? `
                                            <div>
                                                <a
                                                    href="${escapeAttribute(website)}"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    ${escapeHtml(website)}
                                                </a>
                                            </div>
                                          `
                                        : `
                                            <div>
                                                Geen website ingesteld
                                            </div>
                                          `
                                }

                            </div>


                            <button
                                onclick="del('sponsors','${id}')"
                            >
                                🗑
                            </button>

                        </div>

                    `;

                })
                .join("");

    }
);


// =====================================================
// 📸 OME JAN
// =====================================================

document
    .getElementById("saveOmejan")
    ?.addEventListener("click", async () => {

        try {

            const file =
                document
                    .getElementById("omejanImage")
                    ?.files[0];


            if (!file) return;


            const form =
                new FormData();


            form.append(
                "file",
                file
            );


            form.append(
                "upload_preset",
                "hvnovitas_upload"
            );


            const res =
                await fetch(
                    "https://api.cloudinary.com/v1_1/hwxe3jzg/image/upload",
                    {
                        method: "POST",
                        body: form
                    }
                );


            const data =
                await res.json();


            await push(
                ref(db, "omejan"),
                {

                    imageUrl:
                        data.secure_url || "",

                    created:
                        Date.now()

                }
            );


            console.log(
                "✅ Ome Jan afbeelding opgeslagen"
            );


        } catch (error) {

            console.error(
                "❌ Fout bij Ome Jan:",
                error
            );

        }

    });


onValue(ref(db, "omejan"), snap => {

    const list =
        document.getElementById(
            "omejanList"
        );

    if (!list) return;


    const data =
        snap.val() || {};


    list.innerHTML =
        Object.entries(data)
            .map(([id, v]) => `

                <div class="card">

                    ${
                        v.imageUrl
                            ? `
                                <img
                                    src="${escapeAttribute(v.imageUrl)}"
                                    alt="Ome Jan"
                                >
                              `
                            : ""
                    }


                    <button
                        onclick="del('omejan','${id}')"
                    >
                        🗑
                    </button>

                </div>

            `)
            .join("");

});


// =====================================================
// 🧹 DELETE
// =====================================================

window.del = async (
    path,
    id
) => {

    try {

        await remove(
            ref(
                db,
                path + "/" + id
            )
        );


        console.log(
            `🗑 Verwijderd: ${path}/${id}`
        );


    } catch (error) {

        console.error(
            "❌ Verwijderen mislukt:",
            error
        );

    }

};


// =====================================================
// 🔗 URL NORMALISEREN
// =====================================================

function normalizeUrl(url) {

    if (!url) {
        return "";
    }


    url =
        String(url).trim();


    if (!url) {
        return "";
    }


    if (
        url.startsWith("https://") ||
        url.startsWith("http://")
    ) {

        return url;

    }


    if (
        url.startsWith("www.")
    ) {

        return "https://" + url;

    }


    if (
        url.includes(".") &&
        !url.includes(" ")
    ) {

        return "https://" + url;

    }


    return "";

}


// =====================================================
// 🛡 HTML VEILIG MAKEN
// =====================================================

function escapeHtml(value) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// =====================================================
// 🛡 ATTRIBUTE VEILIG MAKEN
// =====================================================

function escapeAttribute(value) {

    return escapeHtml(value);

}
