const API =
"https://script.google.com/macros/s/AKfycbxxwdYKvrzfr4hEbBru0zQUz2om9dqcCitiQF6ieV_PGnMyOf-UFK2SBKITUAYthMMdeg/exec";

const lijst = document.getElementById("proeftrainingen");

async function laadProeftrainingen() {

    lijst.innerHTML = "Laden...";

    try {

        const response = await fetch(API);

        const data = await response.json();

        if (data.length === 0) {

            lijst.innerHTML = "Geen aanvragen.";

            return;

        }

        let html = "";

        data.reverse();

        data.forEach(item => {

            html += `

<div class="bericht">

<h3>${item.voornaam} ${item.Achternaam}</h3>

<p><strong>Geslacht:</strong> ${item.Geslacht}</p>

<p><strong>Geboortedatum:</strong> ${item.Geboortedatum.substring(0,10)}</p>

<p><strong>Telefoon:</strong> ${item.Telefoonnummer}</p>

<p><strong>E-mail:</strong> ${item["E-mail"]}</p>

<p><strong>Opmerking:</strong><br>${item.Opmerkingen}</p>

</div>

`;

        });

        lijst.innerHTML = html;

    } catch (error) {

        console.error(error);

        lijst.innerHTML = "Fout bij laden.";

    }

}

laadProeftrainingen();
