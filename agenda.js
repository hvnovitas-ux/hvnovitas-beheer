// ==========================================
// HV NOVITAS - AGENDA
// ==========================================

const container = document.getElementById("agenda");
const status = document.getElementById("status");

async function laadAgenda() {

    status.textContent = "Agenda laden...";

    try {

        container.innerHTML = `

        <div class="bericht">

            <h3>📅 Agendamodule</h3>

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

laadAgenda();
