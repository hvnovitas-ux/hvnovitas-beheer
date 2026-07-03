// ==========================================
// HV NOVITAS - SPONSORS
// ==========================================

const container = document.getElementById("sponsors");
const status = document.getElementById("status");

async function laadSponsors() {

    status.textContent = "Sponsors laden...";

    try {

        container.innerHTML = `

        <div class="bericht">

            <h3>💰 Sponsormodule</h3>

            <p>
                De koppeling wordt binnenkort toegevoegd.
            </p>

        </div>

        `;

        status.textContent = "Gereed";

    }

    catch (error) {

        console.error(error);

        status.textContent = "Fout bij laden.";

    }

}

laadSponsors();
