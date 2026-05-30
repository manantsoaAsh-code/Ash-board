export function renderProfilePage() {
  return `
    <section class="space-y-4 pb-24">
      <div class="flex items-center justify-between px-1">
        <div>
          <h2 class="text-xl font-black text-gray-900 tracking-tight"><i class="fa-solid fa-user-doctor text-teal-500 mr-2"></i>Mon Profil</h2>
          <p class="text-[10px] text-gray-500 font-bold mt-1 uppercase tracking-wider">Identité et informations de l’utilisateur.</p>
        </div>
        <span class="text-[9px] uppercase tracking-[0.2em] text-teal-600 bg-teal-100 px-3 py-1.5 rounded-md font-black">Externe</span>
      </div>

      <div id="profileMessage" class="hidden px-4 py-3 rounded-2xl bg-teal-50 text-teal-700 text-sm font-semibold border border-teal-100"></div>

      <div class="medical-card p-4 space-y-4 border-t-4 border-teal-500">
        <div class="flex items-center gap-4 border-b border-gray-100 pb-4">
          <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center border border-teal-200 shadow-sm">
            <i class="fa-solid fa-user-astronaut text-teal-600 text-2xl"></i>
          </div>
          <div class="flex-1">
            <input id="profileName" class="w-full font-black text-lg text-gray-900 border border-gray-200 rounded-2xl bg-white px-4 py-3 focus:ring-0 focus:border-teal-500" placeholder="Ton Nom Complet" value="" />
            <input id="profileEmail" class="w-full text-xs text-gray-500 border border-gray-200 rounded-2xl bg-white px-4 py-3 mt-2 focus:ring-0 focus:border-teal-500" placeholder="email@faculte.mg" value="" disabled />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-[9px] font-bold text-gray-400 uppercase mb-1">Niveau d'étude</label>
            <select id="profileStudyLevel" class="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs font-bold bg-gray-50 text-gray-700 focus:border-teal-500 outline-none transition">
              <option value="3ème année">3ème année</option>
              <option value="4ème année">4ème année</option>
              <option value="5ème année">5ème année</option>
              <option value="6ème année">6ème année</option>
              <option value="Interne">Interne</option>
              <option value="Médecin Thésé">Médecin Thésé</option>
            </select>
          </div>
          <div>
            <label class="block text-[9px] font-bold text-gray-400 uppercase mb-1">Faculté / CHU</label>
            <input id="profileInstitution" class="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs font-bold bg-gray-50 text-gray-700 focus:border-teal-500 outline-none transition" placeholder="Ex: CHU JRA" value="" />
          </div>
        </div>
      </div>

      <div class="medical-card p-4 rounded-3xl border border-gray-200 bg-white shadow-sm">
        <h3 class="text-xs font-black uppercase text-gray-500 tracking-widest mb-3">Aperçu du profil</h3>
        <p class="text-sm text-gray-600 leading-6">Les informations enregistrées sont stockées et récupérées automatiquement depuis votre compte. Mettez à jour votre nom, niveau d'études et établissement pour conserver votre profil à jour.</p>
      </div>

      <div class="pt-2">
        <button onclick="saveProfile()" class="w-full bg-teal-500 text-white px-6 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-teal-600 transition shadow-lg shadow-teal-500/30 active:scale-[0.98] flex justify-center items-center gap-2">
          <i class="fa-solid fa-floppy-disk"></i> Mettre à jour le profil
        </button>
      </div>
    </section>
  `;
}