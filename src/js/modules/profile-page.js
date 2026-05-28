export function renderProfilePage() {
  return `
    <section class="space-y-4 pb-24">
      <div class="flex items-center justify-between px-1">
        <div>
          <h2 class="text-xl font-black text-gray-900 tracking-tight"><i class="fa-solid fa-user-doctor text-teal-500 mr-2"></i>Mon Profil</h2>
          <p class="text-[10px] text-gray-500 font-bold mt-1 uppercase tracking-wider">Identité et Statistiques.</p>
        </div>
        <span class="text-[9px] uppercase tracking-[0.2em] text-teal-600 bg-teal-100 px-3 py-1.5 rounded-md font-black">Externe</span>
      </div>

      <div class="medical-card p-4 space-y-4 border-t-4 border-teal-500">
        <div class="flex items-center gap-4 border-b border-gray-100 pb-4">
          <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center border border-teal-200 shadow-sm">
            <i class="fa-solid fa-user-astronaut text-teal-600 text-2xl"></i>
          </div>
          <div class="flex-1">
            <input class="w-full font-black text-lg text-gray-900 border-none bg-transparent p-0 focus:ring-0 placeholder-gray-300" placeholder="Ton Nom Complet" value="" />
            <input class="w-full text-xs text-gray-500 border-none bg-transparent p-0 mt-1 focus:ring-0 placeholder-gray-300" placeholder="email@faculte.mg" value="" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-[9px] font-bold text-gray-400 uppercase mb-1">Niveau d'étude</label>
            <select class="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs font-bold bg-gray-50 text-gray-700 focus:border-teal-500 outline-none transition">
              <option>3ème année </option>  
              <option>4ème année </option>
              <option>5ème année </option>
              <option selected>6ème année </option>
              <option>Interne</option>
              <option>Médecin Thésé</option>
            </select>
          </div>
          <div>
            <label class="block text-[9px] font-bold text-gray-400 uppercase mb-1">Faculté / CHU</label>
            <input class="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs font-bold bg-gray-50 text-gray-700 focus:border-teal-500 outline-none transition" placeholder="Ex: CHU JRA" />
          </div>
        </div>
      </div>

      <div class="medical-card p-4 space-y-3 bg-gradient-to-br from-gray-900 to-black text-white shadow-lg">
        <h3 class="text-[9px] font-black uppercase text-gray-400 tracking-widest flex justify-between items-center">
          <span><i class="fa-solid fa-chart-simple mr-1.5 text-teal-400"></i>Tableau de Chasse</span>
          <span class="bg-white/10 px-2 py-0.5 rounded text-[8px]">Ashclépios IA</span>
        </h3>
        
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-white/5 rounded-xl p-3 border border-white/10 relative overflow-hidden">
            <div class="absolute -right-2 -bottom-2 opacity-10"><i class="fa-solid fa-skull text-4xl"></i></div>
            <div class="text-[10px] text-gray-400 uppercase font-bold mb-1">Cas Résolus</div>
            <div class="text-2xl font-black text-white">42</div>
          </div>
          <div class="bg-white/5 rounded-xl p-3 border border-white/10 relative overflow-hidden">
            <div class="absolute -right-2 -bottom-2 opacity-10"><i class="fa-solid fa-bullseye text-4xl"></i></div>
            <div class="text-[10px] text-gray-400 uppercase font-bold mb-1">Précision IA Moyenne</div>
            <div class="text-2xl font-black text-teal-400">87%</div>
          </div>
        </div>

        <div class="mt-2 bg-white/5 rounded-lg p-3 border-l-2 border-teal-500 text-[10px] text-gray-300 leading-relaxed">
          <span class="text-teal-400 font-bold block mb-1">Bilan du superviseur virtuel :</span> 
          Bonne progression en cardio. Vos dosages pédiatriques restent cependant discutables. Essayez de ne pas tuer le prochain patient simulé.
        </div>
      </div>

      <div class="pt-2">
        <button class="w-full bg-teal-500 text-white px-6 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-teal-600 transition shadow-lg shadow-teal-500/30 active:scale-[0.98] flex justify-center items-center gap-2">
          <i class="fa-solid fa-floppy-disk"></i> Mettre à jour le profil
        </button>
      </div>
    </section>
  `;
}