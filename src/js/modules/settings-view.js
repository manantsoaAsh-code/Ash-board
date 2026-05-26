export function renderSettingsView(settings = {}) {
  return `
    <section>
      <h2 class="text-2xl font-semibold">Paramètres</h2>
      <p class="text-slate-300">Tarif Mada / International : ${settings.priceMode || 'non défini'}</p>
    </section>
  `;
}
