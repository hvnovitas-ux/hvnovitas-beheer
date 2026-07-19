const btn = document.getElementById("saveSponsor");

if (btn) {

    btn.addEventListener("click", () => {

        const fileInput = document.getElementById("logo");
        const status = document.getElementById("sponsorStatus");

        if (!fileInput?.files[0]) {
            alert("Kies eerst een logo");
            return;
        }

        if (status) status.textContent = "Uploaden...";

        const file = fileInput.files[0];
        const reader = new FileReader();

        reader.onload = async () => {

            await push(ref(db, "sponsors"), {
                imageUrl: reader.result,
                created: Date.now()
            });

            fileInput.value = "";
            if (status) status.textContent = "✅ Opgeslagen";
        };

        reader.readAsDataURL(file);
    });
}
