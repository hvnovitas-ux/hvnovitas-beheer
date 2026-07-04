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
// Start
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    laadDashboard();
});

// ==========================================
// Dashboard laden
// ==========================================

function laadDashboard() {
    updateKaarten();
    console.log("🧡 Dashboard geladen");
}

// ==========================================
// Kaarten updaten
// ==========================================

function updateKaarten() {
    setBadge("nieuws", dashboard.nieuws);
    setBadge("proeftrainingen", dashboard.proeftrainingen);
    setBadge("contact", dashboard.contact);
    setBadge("vrijwilligers", dashboard.vrijwilligers);
    setBadge("agenda", dashboard.agenda);
    setBadge("sponsors", dashboard.sponsors);
}

// ==========================================
// Badge zetten
// ==========================================

function setBadge(id, waarde) {

    const badge = document.querySelector(`[data-badge="${id}"]`);

    if (!badge) return;

    badge.textContent = waarde;
}
