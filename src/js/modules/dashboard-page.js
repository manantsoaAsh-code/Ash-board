export function renderDashboardPage() {
  return `
    <div id="listView" class="space-y-4 pb-24 animate-fadeIn">

      <div id="statsContainer" class="grid grid-cols-2 md:grid-cols-4 gap-3">
        
        <div class="medical-card p-4 bg-gradient-to-br from-blue-50/60 to-blue-100/40 border border-blue-100/80 rounded-2xl relative overflow-hidden flex flex-col justify-between min-h-[90px]">
          <div class="absolute right-3 top-3 opacity-10 text-blue-600"><i class="fa-solid fa-folder-medical text-2xl"></i></div>
          <span class="text-[9px] font-black uppercase text-blue-500 tracking-wider">Total Dossiers</span>
          <div id="statTotal" class="text-3xl font-black text-blue-700 leading-none mt-2">0</div>
        </div>

        <div class="medical-card p-4 bg-gradient-to-br from-red-50/60 to-red-100/40 border border-red-100 rounded-2xl relative overflow-hidden flex flex-col justify-between min-h-[90px]">
          <div class="absolute right-3 top-3 opacity-20 text-red-500 class-pulse"><i class="fa-solid fa-triangle-exclamation text-xl"></i></div>
          <span class="text-[9px] font-black uppercase text-red-500 tracking-wider">Urgences Critiques</span>
          <div id="statCritique" class="text-3xl font-black text-red-600 leading-none mt-2">0</div>
        </div>

        <div class="medical-card p-3 border border-gray-100 rounded-2xl bg-white shadow-sm flex flex-col justify-center min-h-[90px]">
          <span class="text-[8px] font-black uppercase text-gray-400 tracking-wider mb-2 block"><i class="fa-solid fa-tags mr-1"></i>Services / Pathologies</span>
          <div id="statTags" class="flex flex-col gap-1 max-h-[55px] overflow-y-auto pr-1 text-[10px]"></div>
        </div>

        <div class="medical-card p-3 border border-gray-100 rounded-2xl bg-white shadow-sm flex flex-col justify-center gap-2 min-h-[90px] text-[11px] font-semibold text-gray-700">
          <div class="flex items-center justify-between border-b border-gray-50 pb-1.5">
            <div class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-orange-400 ring-4 ring-orange-100"></span> À surveiller</div>
            <span id="statWatch" class="font-black text-gray-900 bg-gray-50 px-2 py-0.5 rounded-md">0</span>
          </div>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-green-500 ring-4 ring-green-100"></span> Stable</div>
            <span id="statStable" class="font-black text-gray-900 bg-gray-50 px-2 py-0.5 rounded-md">0</span>
          </div>
        </div>

      </div>

      <div class="flex flex-col sm:flex-row gap-2.5">
        <div class="relative flex-1">
          <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
          <input type="text" id="searchInput" placeholder="Rechercher un nom, chambre, diagnostic..." class="w-full pl-11 pr-4 py-3.5 text-sm rounded-2xl border border-gray-200 bg-white shadow-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 font-medium text-gray-800 placeholder-gray-400" />
        </div>
        <div class="relative min-w-[160px]">
          <select id="sortCriteria" class="w-full rounded-2xl border border-gray-200 bg-white pl-4 pr-10 py-3.5 text-xs font-black text-gray-700 uppercase tracking-wider outline-none shadow-sm appearance-none focus:border-teal-500 transition cursor-pointer">
            <option value="priority">Trier par : Statut</option>
            <option value="date">Trier par : Admission</option>
            <option value="name">Trier par : Nom</option>
          </select>
          <i class="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs"></i>
        </div>
      </div>

      <div class="medical-card p-2 bg-gray-50 border border-gray-100 rounded-2xl flex gap-2 items-center">
        <button onclick="createNewPatient()" class="flex-1 min-w-[120px] bg-teal-500 hover:bg-teal-600 text-white px-4 py-3 rounded-xl shadow-md shadow-teal-500/10 text-xs font-black uppercase tracking-widest transition active:scale-[0.98] flex items-center justify-center gap-2">
          <i class="fa-solid fa-user-plus text-sm"></i> Nouveau Patient
        </button>
        <button onclick="openImportModal()" class="flex-1 min-w-[120px] bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm">
          <i class="fa-solid fa-file-import text-gray-400 text-sm"></i> Importer
        </button>
      </div>

      <div id="patientList" class="grid grid-cols-1 md:grid-cols-2 gap-3"></div>

    </div>
  `;
}