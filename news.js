newsList.innerHTML = items.map(n => {

    let img = "";

    if (n.image) {
        img = `<img src="${n.image}" style="width:100%; border-radius:10px; margin-top:10px;">`;
    }

    return `
        <div class="news-item">

            <h3>${n.title}</h3>

            ${img}

            <p>${n.text}</p>

            <small>📅 ${n.date} 🕒 ${n.time}</small>

            <div class="actions">
                <button onclick="editNews('${n.id}', '${n.title}', '${n.text}')">Edit</button>
                <button onclick="deleteNews('${n.id}')" style="background:red;">Delete</button>
            </div>

        </div>
    `;
}).join("");
