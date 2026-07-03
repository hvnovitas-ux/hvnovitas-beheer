// ==========================================
// HV NOVITAS - CONTACT
// ==========================================

const container = document.getElementById("contact");
const status = document.getElementById("status");

async function laadContact() {

    status.textContent = "Contactberichten laden...";

    try {

        container.innerHTML = `

        <div class="bericht">

            <h3>📧 Contactmodule</h3>

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

laadContact();
