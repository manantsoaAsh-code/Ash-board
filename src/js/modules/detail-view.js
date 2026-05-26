export function renderDetailView(patient = {}) {
  return `
    <section>
      <h2 class="text-2xl font-semibold">Fiche patient</h2>
      <p class="text-slate-300">${patient.name || 'Patient'}</p>
    </section>
  `;
}
