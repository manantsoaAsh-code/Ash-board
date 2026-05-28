export function renderList(patients, TAGS) {
  const listContainer = document.getElementById('patientList');
  const query = document.getElementById('searchInput')?.value.toLowerCase() || '';
  const sortBy = document.getElementById('sortCriteria')?.value || 'priority';

  let filteredPatients = patients.filter((p) => `${p.identity.name} ${p.room} ${p.bed} ${p.diagnostics} ${p.assignedTo}`.toLowerCase().includes(query));

  filteredPatients.sort((a, b) => {
    if (sortBy === 'priority') return (a.clinicalPriority || 3) - (b.clinicalPriority || 3);
    if (sortBy === 'date') return new Date(b.admission.date) - new Date(a.admission.date);
    return (a.identity.name || '').localeCompare(b.identity.name || '');
  });

  document.getElementById('statTotal').innerText = patients.length;
  document.getElementById('statCritique').innerText = patients.filter((p) => p.clinicalPriority == 1).length;
  document.getElementById('statWatch').innerText = patients.filter((p) => p.clinicalPriority == 2).length;
  document.getElementById('statStable').innerText = patients.filter((p) => p.clinicalPriority == 3).length;

  const tagContainer = document.getElementById('statTags');
  tagContainer.innerHTML = '';
  TAGS.slice(0, 4).forEach((tag) => {
    const count = patients.filter((p) => p.tag === tag).length;
    if (count > 0) tagContainer.innerHTML += `<div><span class="text-gray-400">•</span> ${tag}: <b>${count}</b></div>`;
  });

  listContainer.innerHTML = filteredPatients.length ? '' : '<p class="col-span-full text-center text-gray-400 py-10 text-sm">Aucun dossier trouvé.</p>';

  filteredPatients.forEach((p) => {
    const card = document.createElement('div');
    card.className = 'medical-card p-4 flex justify-between items-center active:scale-[0.98] transition-all relative overflow-hidden';

    const clinicalColor = p.clinicalPriority == 1 ? 'bg-red-600' : p.clinicalPriority == 2 ? 'bg-orange-400' : 'bg-green-500';
    const clinicalLabel = p.clinicalPriority == 1 ? 'Critique' : p.clinicalPriority == 2 ? 'À surveiller' : 'Stable';
    const tagStyle = p.tag === 'Décédé' ? 'bg-red-50 text-red-700' : p.tag === 'Sorti' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600';

    card.innerHTML = `
      <div class="absolute left-0 top-0 bottom-0 w-1.5 ${clinicalColor}"></div>
      <div class="flex-1 cursor-pointer pr-4" onclick="showDetailView(${p.id})">
        <div class="flex items-center gap-2 mb-1">
          <div class="text-[9px] font-bold text-gray-400 uppercase tracking-widest">${p.room} • ${p.bed}</div>
          <span class="text-[7px] px-1.5 py-0.5 rounded ${clinicalColor} text-white font-black uppercase">${clinicalLabel}</span>
        </div>
        <div class="font-bold text-gray-900 leading-tight">${p.identity.name || 'Nouveau Patient'}</div>
        <div class="text-[10px] text-gray-500 mb-2">${p.identity.sex} • ${p.identity.age || '?'} ans</div>
        ${p.assignedTo ? `<div class="mt-2 text-[9px] text-blue-600 font-bold bg-blue-50/50 px-2 py-1 rounded-md inline-flex items-center"><i class="fa-solid fa-user-doctor mr-1.5"></i><span class="truncate max-w-[120px]">${p.assignedTo}</span></div>` : ''}
      </div>
      <div class="flex flex-col items-end gap-2 min-w-[70px]">
        <span class="text-[8px] px-2 py-1 rounded-md font-black uppercase text-center leading-tight ${tagStyle}" style="max-width:80px;word-break:break-word">${p.tag}</span>
        <button onclick="sharePatient(${p.id})" class="text-gray-300 hover:text-blue-500 transition text-sm"><i class="fa-solid fa-share-nodes"></i></button>
      </div>`;

    listContainer.appendChild(card);
  });
}
