import { db } from "./firebase.js";

import {
    ref,
    push,
    onValue,
    update,
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

let currentNewsData = {};
let currentNewsHighlights = {};

function highlightForNews(newsId, newsItem) {
    const matches = Object.entries(currentNewsHighlights);
    return matches.find(([, highlight]) => {
        if (!highlight) return false;
        if (highlight.sourceNewsId === newsId) return true;

        // Compatibility check for highlights copied before sourceNewsId was added.
        return Number(newsItem?.created) > 0 &&
            Number(highlight.created) === Number(newsItem.created) &&
            String(highlight.title || "") === String(newsItem.title || "") &&
            String(highlight.text || "") === String(newsItem.text || "") &&
            String(highlight.imageUrl || "") === String(newsItem.imageUrl || "");
    }) || null;
}

function renderNewsList() {
    const list = document.getElementById("newsList");
    if (!list) return;

    list.innerHTML = Object.entries(currentNewsData)
        .sort(([, a], [, b]) => Number(b?.created || 0) - Number(a?.created || 0))
        .map(([id, newsItem]) => {
            const safeId = escapeAttribute(id);
            const highlighted = Boolean(highlightForNews(id, newsItem));
            const highlightButton = highlighted
                ? '<button type="button" class="highlight-news-button" disabled>✓ Staat bij Highlights</button>'
                : `<button type="button" class="highlight-news-button" data-news-highlight-id="${safeId}">Ook als highlight bewaren</button>`;

            return `
                <div class="item news-item">
                    <div class="news-item-content">
                        <strong>${escapeHtml(newsItem.title || "")}</strong>
                        <p>${escapeHtml(newsItem.text || "")}</p>
                        ${newsItem.imageUrl ? `
                            <img src="${escapeAttribute(newsItem.imageUrl)}" alt="Nieuws">
                        ` : ""}
                        <small>Geplaatst: ${newsItem.created ? escapeHtml(new Date(newsItem.created).toLocaleDateString("nl-NL")) : "datum onbekend"}</small>
                    </div>
                    <div class="news-item-actions">
                        ${highlightButton}
                        <button type="button" class="danger" onclick="del('news','${safeId}')">Verwijderen</button>
                    </div>
                </div>
            `;
        })
        .join("") || "<p>Geen nieuws.</p>";
}

document.getElementById("newsList")?.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-news-highlight-id]");
    if (!button) return;

    const newsId = button.dataset.newsHighlightId;
    const newsItem = currentNewsData[newsId];
    if (!newsItem) {
        alert("Dit nieuwsbericht is niet meer beschikbaar. Vernieuw de pagina.");
        return;
    }

    if (highlightForNews(newsId, newsItem)) {
        renderNewsList();
        return;
    }

    button.disabled = true;
    button.textContent = "Highlight opslaan...";
    try {
        const created = Number(newsItem.created) || Date.now();
        const placedAt = new Date(created);
        const date = [
            placedAt.getFullYear(),
            String(placedAt.getMonth() + 1).padStart(2, "0"),
            String(placedAt.getDate()).padStart(2, "0")
        ].join("-");

        await push(ref(db, "highlights"), {
            date,
            title: newsItem.title || "",
            text: newsItem.text || "",
            imageUrl: newsItem.imageUrl || "",
            created,
            sourceNewsId: newsId
        });

        alert("Het bestaande nieuwsbericht is ook als zelfstandige highlight bewaard.");
    } catch (error) {
        console.error("Nieuws omzetten naar highlight mislukt:", error);
        alert("De highlight kon niet worden opgeslagen. Controleer de Firebase-regels en probeer het opnieuw.");
    } finally {
        renderNewsList();
    }
});

document.getElementById("saveNews")?.addEventListener("click", async () => {
    try {
        const title = document.getElementById("newsTitle")?.value?.trim() || "";
        const text = document.getElementById("newsText")?.value?.trim() || "";
        const file = document.getElementById("newsImage")?.files?.[0];

        if (!title || !text) {
            alert("Vul een titel en tekst in.");
            return;
        }

        let url = "";
        if (file) {
            const form = new FormData();
            form.append("file", file);
            form.append("upload_preset", "hvnovitas_upload");

            const res = await fetch(
                "https://api.cloudinary.com/v1_1/hwxe3jzg/image/upload",
                { method: "POST", body: form }
            );

            if (!res.ok) throw new Error("Cloudinary upload mislukt.");
            const data = await res.json();
            url = data.secure_url || "";
        }

        const created = Date.now();
        const newsRecordRef = push(ref(db, "news"));
        const changes = {};
        changes[`news/${newsRecordRef.key}`] = { title, text, imageUrl: url, created };

        const alsoHighlight = document.getElementById("newsAsHighlight")?.checked === true;
        if (alsoHighlight) {
            const placedAt = new Date(created);
            const date = [
                placedAt.getFullYear(),
                String(placedAt.getMonth() + 1).padStart(2, "0"),
                String(placedAt.getDate()).padStart(2, "0")
            ].join("-");
            const highlightRecordRef = push(ref(db, "highlights"));
            changes[`highlights/${highlightRecordRef.key}`] = {
                date, title, text, imageUrl: url, created,
                sourceNewsId: newsRecordRef.key
            };
        }

        await update(ref(db), changes);

        document.getElementById("newsTitle").value = "";
        document.getElementById("newsText").value = "";
        document.getElementById("newsImage").value = "";
        document.getElementById("newsAsHighlight").checked = false;

        alert(alsoHighlight
            ? "Nieuws opgeslagen en ook als zelfstandige highlight bewaard."
            : "Nieuws opgeslagen.");
    } catch (error) {
        console.error("Fout bij nieuws:", error);
        alert("Nieuws kon niet worden opgeslagen.");
    }
});

onValue(ref(db, "news"), (snap) => {
    currentNewsData = snap.val() || {};
    renderNewsList();
});

onValue(ref(db, "highlights"), (snap) => {
    currentNewsHighlights = snap.val() || {};
    renderNewsList();
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
