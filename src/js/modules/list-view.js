export function renderListView(patients = []) {
  return `
    <section>
      <h2 class="text-2xl font-semibold">Liste des patients</h2>
      <p class="text-slate-300">${patients.length} patient(s) à afficher.</p>
    </section>
  `;
}
