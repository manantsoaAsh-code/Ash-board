export function renderPatientCard(patient) {
  return `
    <article class="rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <p class="text-lg font-semibold">${patient.name || 'Patient'}</p>
      <p class="text-sm text-slate-300">${patient.identifiant || 'ID inconnu'}</p>
    </article>
  `;
}
