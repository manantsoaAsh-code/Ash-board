export function renderProfileView(user = {}) {
  return `
    <section>
      <h2 class="text-2xl font-semibold">Profil</h2>
      <p class="text-slate-300">${user.name || 'Utilisateur'}</p>
    </section>
  `;
}
