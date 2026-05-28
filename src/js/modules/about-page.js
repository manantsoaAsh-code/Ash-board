export function renderAboutPage() {
  return `
    <section class="space-y-4 pb-24">
      <div class="flex items-center justify-between px-1">
        <div>
          <h2 class="text-xl font-black text-gray-900 tracking-tight"><i class="fa-solid fa-staff-snake text-purple-500 mr-2"></i>À Propos</h2>
          <p class="text-[10px] text-gray-500 font-bold mt-1 uppercase tracking-wider">Origine, validation scientifique et contact.</p>
        </div>
        <span class="text-[9px] uppercase tracking-[0.2em] text-purple-600 bg-purple-100 px-3 py-1.5 rounded-md font-black">Infos</span>
      </div>

      <div class="medical-card p-4 border-l-4 border-l-purple-500 bg-purple-50/40 space-y-2">
        <div class="flex items-center gap-2">
          <i class="fa-solid fa-file-signature text-purple-600 text-xs"></i>
          <h3 class="text-[9px] font-black uppercase text-purple-900 tracking-widest">Validation Scientifique</h3>
        </div>
        <p class="text-xs text-gray-700 leading-relaxed font-medium">
          L'architecture logique et la méthodologie de simulation clinique intégrées à cette plateforme sont officiellement approuvées et parrainées par le <span class="font-black text-gray-900">Pr Rakototiana Auberlin</span>.
        </p>
      </div>

      <div class="medical-card p-4 space-y-3">
        <p class="text-xs text-gray-700 leading-relaxed">
          <span class="font-black text-gray-900">Ash-board</span> est un écosystème d'aide au diagnostic rigoureux et de gestion patient conçu exclusivement pour les étudiants en médecine et externes. Il a été pensé pour optimiser le raisonnement clinique en mode déconnecté, là où les réseaux mobiles des CHU refusent de fonctionner.
        </p>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div class="medical-card p-3 bg-gray-50/50">
          <span class="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Version Globale</span>
          <p class="text-sm font-black text-gray-900 mt-1">1.0.0 (Stable)</p>
        </div>
        <div class="medical-card p-3 bg-gray-50/50">
          <span class="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Environnement</span>
          <p class="text-sm font-black text-gray-900 mt-1">SPA / Capacitor</p>
        </div>
      </div>

      <div class="medical-card p-4 space-y-3">
        <h3 class="text-[9px] font-black uppercase text-gray-400 tracking-widest"><i class="fa-solid fa-code mr-1.5"></i>Développement</h3>
        
        <div class="border-b border-gray-100 pb-3">
          <p class="text-xs font-black text-gray-900">RAHARIMANANTSOA Herivola</p>
          <p class="text-[10px] text-gray-500 mt-0.5">Auteur, concepteur et développeur principal de l'architecture.</p>
        </div>

        <div>
          <span class="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Support & Partenariats</span>
          <a href="mailto:herivolapro@gmail.com" class="w-full flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100 transition active:scale-[0.98]">
            <div class="flex items-center gap-2 overflow-hidden">
              <i class="fa-solid fa-envelope text-gray-400 text-xs"></i>
              <span class="text-xs font-bold text-gray-700 truncate">herivolapro@gmail.com</span>
            </div>
            <i class="fa-solid fa-paper-plane text-purple-500 text-[10px] ml-2"></i>
          </a>
        </div>
      </div>

      <div class="p-3 bg-gray-100 rounded-xl text-[10px] text-gray-500 space-y-2 leading-relaxed">
        <p><strong><i class="fa-solid fa-shield-halved mr-1 text-gray-400"></i>Sécurité des données :</strong> Le secret médical est préservé. Vos patients fictifs ou réels restent confinés dans la mémoire locale de cet appareil.</p>
        <p><strong><i class="fa-solid fa-triangle-exclamation mr-1 text-amber-500"></i>Avertissement légal :</strong> Ash-board est un outil d'entraînement pédagogique. Il ne remplace ni votre propre jugement ni votre responsabilité juridique lors de vos stages en salle de soins.</p>
      </div>
    </section>
  `;
}