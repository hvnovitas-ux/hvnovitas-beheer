newsList.innerHTML = items.map(b => `
<div class="news-item">

    <h3>${b.title}</h3>

    <small>${b.date} • ${b.time}</small>

    ${b.image ? `<img src="${b.image}">` : ""}

    <p>${b.text}</p>

    <div class="actions">

        <button onclick="editNews('${b.id}')">
            ✏️ Bewerken
        </button>

        <button onclick="deleteNews('${b.id}')">
            🗑️ Verwijderen
        </button>

    </div>

</div>
`).join("");
