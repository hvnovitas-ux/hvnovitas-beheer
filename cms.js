import { db } from "./firebase.js";

import {
    ref,
    push,
    onValue,
    remove
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

console.log("🔥 CMS CORE LOADED");

function normalizeUrl(url) {
    if (!url) return "";

    url = String(url).trim();

    if (!url) return "";

    if (
        url.startsWith("https://") ||
        url.startsWith("http://")
    ) {
        return url;
    }

    if (url.startsWith("www.")) {
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

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function escapeAttribute(value) {
    return escapeHtml(value);
}

/* =====================================================
   🧱 CLUB100
   ===================================================== */

document
    .getElementById("saveClub100")
    ?.addEventListener("click", async () => {
        const name =
            document
                .getElementById("clubName")
                ?.value
                ?.trim();

        if (!name) return;

        try {
            await push(ref(db, "club100"), {
                name,
                created: Date.now()
            });

            document.getElementById("clubName").value = "";
        } catch (error) {
            console.error("❌ Fout bij Club100:", error);
            alert("Club100 lid kon niet worden opgeslagen.");
        }
    });

onValue(ref(db, "club100"), (snap) => {
    const list =
        document.getElementById("clubList");

    if (!list) return;

    const data = snap.val() || {};

    list.innerHTML =
        Object.entries(data)
            .map(([id, v]) => `
                <div class="item">
                    <div>
                        <strong>${escapeHtml(v.name || "")}</strong>
                    </div>
                    <button
                        type="button"
                        onclick="del('club100','${escapeAttribute(id)}')">
                        🗑
                    </button>
                </div>
            `)
            .join("") ||
        "<p>Geen Club100 leden.</p>";
});

/* =====================================================
   🏆 HIGHLIGHTS
   ===================================================== */

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

                created: Date.now()
            });

            document.getElementById("hlTitle").value = "";
            document.getElementById("hlText").value = "";
        } catch (error) {
            console.error("❌ Fout bij highlight:", error);
            alert("Highlight kon niet worden opgeslagen.");
        }
    });

onValue(ref(db, "highlights"), (snap) => {
    const list =
        document.getElementById("highlightList");

    if (!list) return;

    const data = snap.val() || {};

    list.innerHTML =
        Object.entries(data)
            .sort(
                ([, a], [, b]) =>
                    (b.created || 0) -
                    (a.created || 0)
            )
            .map(([id, v]) => `
                <div class="item">
                    <strong>${escapeHtml(v.title || "")}</strong>
                    <p>${escapeHtml(v.text || "")}</p>
                    <small>${escapeHtml(v.date || "")}</small>
                    <button
                        type="button"
                        onclick="del('highlights','${escapeAttribute(id)}')">
                        🗑
                    </button>
                </div>
            `)
            .join("") ||
        "<p>Geen highlights.</p>";
});

/* =====================================================
   📰 NIEUWS
   ===================================================== */

document
    .getElementById("saveNews")
    ?.addEventListener("click", async () => {
        try {
            const title =
                document
                    .getElementById("newsTitle")
                    ?.value
                    ?.trim() || "";

            const text =
                document
                    .getElementById("newsText")
                    ?.value
                    ?.trim() || "";

            const file =
                document
                    .getElementById("newsImage")
                    ?.files?.[0];

            if (!title || !text) {
                alert("Vul een titel en tekst in.");
                return;
            }

            let url = "";

            if (file) {
                const form = new FormData();

                form.append("file", file);

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
                        "Cloudinary upload mislukt."
                    );
                }

                const data = await res.json();

                url =
                    data.secure_url || "";
            }

            await push(
                ref(db, "news"),
                {
                    title,
                    text,
                    imageUrl: url,
                    created: Date.now()
                }
            );

            document.getElementById("newsTitle").value = "";
            document.getElementById("newsText").value = "";
            document.getElementById("newsImage").value = "";

            alert("Nieuws opgeslagen.");
        } catch (error) {
            console.error("❌ Fout bij nieuws:", error);
            alert("Nieuws kon niet worden opgeslagen.");
        }
    });

onValue(ref(db, "news"), (snap) => {
    const list =
        document.getElementById("newsList");

    if (!list) return;

    const data = snap.val() || {};

    list.innerHTML =
        Object.entries(data)
            .sort(
                ([, a], [, b]) =>
                    (b.created || 0) -
                    (a.created || 0)
            )
            .map(([id, v]) => `
                <div class="item">
                    <strong>${escapeHtml(v.title || "")}</strong>

                    <p>
                        ${escapeHtml(v.text || "")}
                    </p>

                    ${
                        v.imageUrl
                            ? `
                                <img
                                    src="${escapeAttribute(v.imageUrl)}"
                                    alt="Nieuws">
                              `
                            : ""
                    }

                    <button
                        type="button"
                        onclick="del('news','${escapeAttribute(id)}')">
                        🗑
                    </button>
                </div>
            `)
            .join("") ||
        "<p>Geen nieuws.</p>";
});

/* =====================================================
   🤝 SPONSORS
   ===================================================== */

document
    .getElementById("saveSponsor")
    ?.addEventListener("click", async () => {
        try {
            const name =
                document
                    .getElementById("sponsorName")
                    ?.value
                    ?.trim() || "";

            let website =
                document
                    .getElementById("sponsorWebsite")
                    ?.value
                    ?.trim() || "";

            website =
                normalizeUrl(website);

            const file =
                document
                    .getElementById("sponsorImage")
                    ?.files?.[0];

            if (!name) {
                alert("Vul eerst een sponsornaam in.");
                return;
            }

            if (!file) {
                alert("Kies eerst een sponsorlogo.");
                return;
            }

            const form = new FormData();

            form.append("file", file);

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
                    "Cloudinary upload mislukt."
                );
            }

            const data = await res.json();

            const imageUrl =
                data.secure_url || "";

            if (!imageUrl) {
                throw new Error(
                    "Geen sponsorafbeelding ontvangen."
                );
            }

            await push(
                ref(db, "sponsors"),
                {
                    name,
                    imageUrl,
                    website,
                    created: Date.now(),
                    active: true
                }
            );

            document.getElementById("sponsorName").value = "";
            document.getElementById("sponsorWebsite").value = "";
            document.getElementById("sponsorImage").value = "";

            alert("Sponsor succesvol toegevoegd.");
        } catch (error) {
            console.error("❌ Fout bij sponsor:", error);
            alert("Sponsor kon niet worden opgeslagen.");
        }
    });

onValue(ref(db, "sponsors"), (snap) => {
    const list =
        document.getElementById("sponsorList");

    if (!list) return;

    const data = snap.val() || {};

    list.innerHTML =
        Object.entries(data)
            .sort(
                ([, a], [, b]) =>
                    (b.created || 0) -
                    (a.created || 0)
            )
            .map(([id, v]) => {
                const name =
                    v.name ||
                    "Sponsor";

                const website =
                    normalizeUrl(
                        v.website || ""
                    );

                return `
                    <div class="item sponsor-item">
                        ${
                            v.imageUrl
                                ? `
                                    <img
                                        src="${escapeAttribute(v.imageUrl)}"
                                        alt="${escapeAttribute(name)}">
                                  `
                                : ""
                        }

                        <div>
                            <strong>
                                ${escapeHtml(name)}
                            </strong>

                            ${
                                website
                                    ? `
                                        <a
                                            href="${escapeAttribute(website)}"
                                            target="_blank"
                                            rel="noopener noreferrer">
                                            ${escapeHtml(website)}
                                        </a>
                                      `
                                    : ""
                            }
                        </div>

                        <button
                            type="button"
                            onclick="del('sponsors','${escapeAttribute(id)}')">
                            🗑
                        </button>
                    </div>
                `;
            })
            .join("") ||
        "<p>Geen sponsors toegevoegd.</p>";
});

/* =====================================================
   📸 OME JAN
   ===================================================== */

document
    .getElementById("saveOmejan")
    ?.addEventListener("click", async () => {
        try {
            const file =
                document
                    .getElementById("omejanImage")
                    ?.files?.[0];

            if (!file) {
                alert("Kies eerst een afbeelding.");
                return;
            }

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
                    "Cloudinary upload mislukt."
                );
            }

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

            document.getElementById("omejanImage").value = "";

            alert("Ome Jan afbeelding opgeslagen.");
        } catch (error) {
            console.error("❌ Fout bij Ome Jan:", error);
            alert("Ome Jan afbeelding kon niet worden opgeslagen.");
        }
    });

onValue(ref(db, "omejan"), (snap) => {
    const list =
        document.getElementById("omejanList");

    if (!list) return;

    const data = snap.val() || {};

    list.innerHTML =
        Object.entries(data)
            .sort(
                ([, a], [, b]) =>
                    (b.created || 0) -
                    (a.created || 0)
            )
            .map(([id, v]) => `
                <div class="item">
                    ${
                        v.imageUrl
                            ? `
                                <img
                                    src="${escapeAttribute(v.imageUrl)}"
                                    alt="Ome Jan">
                              `
                            : ""
                    }

                    <button
                        type="button"
                        onclick="del('omejan','${escapeAttribute(id)}')">
                        🗑
                    </button>
                </div>
            `)
            .join("") ||
        "<p>Geen afbeeldingen.</p>";
});

/* =====================================================
   🧹 DELETE
   ===================================================== */

window.del = async (
    path,
    id
) => {
    try {
        await remove(
            ref(
                db,
                `${path}/${id}`
            )
        );
    } catch (error) {
        console.error(
            "❌ Verwijderen mislukt:",
            error
        );

        alert(
            "Verwijderen mislukt."
        );
    }
};
