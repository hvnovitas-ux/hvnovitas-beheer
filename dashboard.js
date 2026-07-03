// ==========================================
// HV NOVITAS - DASHBOARD
// ==========================================

const dashboard = {

    nieuws: 0,
    proeftrainingen: 0,
    contact: 0,
    vrijwilligers: 0,
    agenda: 0,
    sponsors: 0

};

// ==========================================
// Initialiseren
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

    await laadDashboard();

});

// ==========================================
// Dashboard laden
// ==========================================

async function laadDashboard() {

    try {

        updateKaarten();

        console.log("🧡 Dashboard geladen");

    }

    catch(error){

        console.error(error);

    }

}

// ==========================================
// Kaarten bijwerken
// ==========================================

function updateKaarten(){

    setBadge("nieuws", dashboard.nieuws);

    setBadge("proeftrainingen", dashboard.proeftrainingen);

    setBadge("contact", dashboard.contact);

    setBadge("vrijwilligers", dashboard.vrijwilligers);

    setBadge("agenda", dashboard.agenda);

    setBadge("sponsors", dashboard.sponsors);

}

// ==========================================
// Badge aanpassen
// ==========================================

function setBadge(id, waarde){

    const badge = document.querySelector(

        `[data-badge="${id}"]`

    );

    if(!badge) return;

    badge.textContent = waarde;

}
Kleine aanpassing in dashboard.html

Vervang de badges door deze versie:

<span class="badge" data-badge="nieuws">0</span>

<span class="badge" data-badge="proeftrainingen">0</span>

<span class="badge" data-badge="contact">0</span>

<span class="badge" data-badge="vrijwilligers">0</span>

<span class="badge" data-badge="agenda">0</span>

<span class="badge" data-badge="sponsors">0</span>
