// ==========================================
// HV NOVITAS - VRIJWILLIGERS
// ==========================================

const container = document.getElementById("vrijwilligers");
const status = document.getElementById("status");

async function laadVrijwilligers() {

    status.textContent = "Vrijwilligers laden...";

    try {

        container.innerHTML = `

        <div class="bericht">

            <h3>🙋 Vrijwilligersmodule</h3>

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

laadVrijwilligers();
