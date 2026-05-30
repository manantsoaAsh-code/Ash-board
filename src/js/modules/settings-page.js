export function renderSettingsPage() {
  return `
    <section class="space-y-4 pb-24">
      <div class="flex items-center justify-between px-1">
        <div>
          <h2 class="text-xl font-black text-gray-900 tracking-tight"><i class="fa-solid fa-gear text-gray-400 mr-2"></i>Paramètres</h2>
          <p class="text-[10px] text-gray-500 font-bold mt-1 uppercase tracking-wider">Configurez la machine. Ne tuez personne.</p>
        </div>
        <span class="text-[9px] uppercase tracking-[0.2em] text-gray-500 bg-gray-200 px-3 py-1.5 rounded-md font-black">V 1.0.0</span>
      </div>

      <div class="medical-card p-4 space-y-3">
        <h3 class="text-[9px] font-black uppercase text-amber-500 tracking-widest mb-2"><i class="fa-solid fa-crown mr-1.5"></i>Abonnement & Accès</h3>
        
        <div class="flex items-center justify-between rounded-xl border border-amber-100 bg-amber-50/40 p-3">
          <div>
            <p class="font-black text-xs text-gray-900">Plan actuel : Standard</p>
            <p class="text-[9px] text-gray-500 mt-0.5">Région : Madagascar (Tarif étudiant local appliqué).</p>
          </div>
          <button class="text-[10px] font-black uppercase text-amber-700 bg-amber-200 px-3 py-2 rounded-lg hover:bg-amber-300 transition shadow-sm">Gérer</button>
        </div>
      </div>

      <div class="medical-card p-4 space-y-3">
        <h3 class="text-[9px] font-black uppercase text-blue-500 tracking-widest mb-2"><i class="fa-solid fa-user-doctor mr-1.5"></i>Clinique & Ashclépios</h3>


        <div class="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-3">
          <div class="pr-2">
            <p class="font-bold text-xs text-gray-900">Normes biologiques</p>
            <p class="text-[9px] text-gray-500 leading-tight mt-0.5">Valeurs de référence par défaut.</p>
          </div>
          <select class="text-[10px] font-bold bg-white border border-gray-200 rounded-lg p-2 text-gray-700 outline-none shadow-sm cursor-pointer">
            <option>Internationales</option>
            <option>Locales (Encore non disponibles)</option>
          </select>
        </div>
      </div>

      <div class="medical-card p-4 space-y-3">
        <h3 class="text-[9px] font-black uppercase text-gray-500 tracking-widest mb-2"><i class="fa-solid fa-mobile-screen mr-1.5"></i>Système Mobile</h3>

        <div class="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-3">
          <div class="pr-2">
            <p class="font-bold text-xs text-gray-900">Mode Hors-ligne (Cache)</p>
            <p class="text-[9px] text-gray-500 leading-tight mt-0.5">Stocker les dossiers en local pour les sous-sols d'hôpitaux sans réseau.</p>
          </div>
          <div class="w-9 h-5 bg-green-500 rounded-full relative cursor-pointer shadow-inner flex-shrink-0">
            <div class="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm transition-all"></div>
          </div>
        </div>

        <div class="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-3">
          <div class="pr-2">
            <p class="font-bold text-xs text-gray-900">Verrouillage Biométrique</p>
            <p class="text-[9px] text-gray-500 leading-tight mt-0.5">FaceID / Empreinte. Évitez que vos potes lisent vos dossiers patients.</p>
          </div>
          <div class="w-9 h-5 bg-gray-300 rounded-full relative cursor-pointer shadow-inner flex-shrink-0">
            <div class="w-4 h-4 bg-white rounded-full absolute left-0.5 top-0.5 shadow-sm transition-all"></div>
          </div>
        </div>

        <div class="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-3">
          <div class="pr-2">
            <p class="font-bold text-xs text-gray-900">Mode Sombre</p>
            <p class="text-[9px] text-gray-500 leading-tight mt-0.5">Pour épargner vos rétines à 3h du matin.</p>
          </div>
          <button class="text-[10px] font-bold text-gray-700 bg-gray-200 px-3 py-1.5 rounded-lg shadow-sm hover:bg-gray-300 transition">Système</button>
        </div>
      </div>

      <div class="medical-card p-4 space-y-3 border-t-4 border-t-red-500">
        <button onclick="openLegalPage()" class="w-full flex justify-between items-center p-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100 transition">
          <span class="font-bold text-xs text-gray-700"><i class="fa-solid fa-scale-balanced mr-2 text-gray-400"></i>CGU & Mentions Légales</span>
          <i class="fa-solid fa-chevron-right text-gray-400 text-xs"></i>
        </button>

        <button onclick="handleLogout()" class="w-full flex justify-center items-center gap-2 p-3 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition font-black text-[10px] uppercase tracking-widest mt-2 shadow-sm">
          <i class="fa-solid fa-right-from-bracket"></i> Déconnexion
        </button>
      </div>
    </section>
  `;
}