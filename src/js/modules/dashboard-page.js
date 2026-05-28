export function renderDashboardPage() {
  return `
    <div id="listView">

      <div id="statsContainer" class="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">

        <div class="medical-card p-3 bg-blue-50/50"><div class="text-[9px] font-black uppercase text-blue-400 tracking-tighter">Total Dossiers</div><div id="statTotal" class="text-2xl font-bold text-blue-600">0</div></div>

        <div class="medical-card p-3 border-red-100"><div class="text-[9px] font-black uppercase text-red-400 tracking-tighter">Critiques</div><div id="statCritique" class="text-2xl font-bold text-red-600">0</div></div>

        <div class="medical-card p-2 text-[10px] space-y-1"><div id="statTags" class="flex flex-col gap-1"></div></div>

        <div class="medical-card p-2 text-[10px] flex flex-col justify-center"><div class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-orange-400"></span> À surveiller : <b id="statWatch">0</b></div><div class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-green-500"></span> Stable : <b id="statStable">0</b></div></div>

      </div>

      <div class="flex flex-col md:flex-row gap-3 mb-3"><div class="relative flex-1"><i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i><input type="text" id="searchInput" placeholder="Rechercher un nom, chambre, diagnostic..." class="w-full pl-10 pr-4 py-3 text-base rounded-xl shadow-sm border-gray-200"></div><div class="relative flex-0.5"><select id="sortCriteria" class="text-xs font-bold flex-1 md:w-40"><option value="priority">Trier par : Statut</option><option value="date">Trier par : Date d'admission</option><option value="name">Trier par : Nom</option></select></div></div>

      <div class="medical-card p-3 mb-6 flex flex-wrap gap-2 items-center"><button onclick="createNewPatient()" class="flex-1 min-w-[120px] bg-black text-white px-4 py-2.5 rounded-xl shadow-sm text-sm font-semibold hover:opacity-80 transition flex items-center justify-center gap-2"><i class="fa-solid fa-plus"></i>Nouveau</button><button onclick="openImportModal()" class="flex-1 min-w-[120px] bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-200 transition flex items-center justify-center gap-2"><i class="fa-solid fa-file-import"></i>Importer</button></div>

      <div id="patientList" class="grid grid-cols-1 md:grid-cols-2 gap-3"></div>

    </div>
  `;
}
