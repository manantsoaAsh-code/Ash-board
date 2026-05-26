import { BIO_STANDARDS, checkBioStatus, getBioRef, normalizeBioName } from './config/bio-standards.js';
import { calculateCKDEPI, calculateCockcroftGault, calculateMDRD, calculatePAM } from './core/medical-math.js';
import { storage } from './core/storage.js';

let patients = storage.get('med_dashboard_data_v2', []);
let currentPatientId = null;
let activeTabId = 'tab-identity';
let evolutionViewMode = 'edit';
let currentModalCtx = { idx: null, key: null, subKey: null };
let modalViewMode = 'edit';
let spModalEvIdx = null;
let spModalMode = 'edit';
let paraSortOrder = 'recent';
let paraFilterTag = 'all';

const PARA_TAGS_LIST = [
  { value: '', label: 'Sans tag', color: 'bg-gray-100 text-gray-500', border: '#e5e7eb' },
  { value: 'controle', label: '✅ Contrôle', color: 'bg-green-100 text-green-700', border: '#86efac' },
  { value: 'a-controler', label: '🔁 À contrôler', color: 'bg-blue-100 text-blue-700', border: '#93c5fd' },
];

const TAGS = ['Hospitalisé', 'Décédé', 'Sorti', 'Décharge', 'Fuite', 'Au bloc'];

function getParaclinicNumber(patient, aliases) {
  const list = Array.isArray(patient?.paraclinics) ? patient.paraclinics : [];
  const normalizedAliases = aliases.map((alias) => normalizeBioName(alias));

  const item = list.find((entry) => {
    const normalizedType = normalizeBioName(entry?.type);

    return normalizedAliases.some((alias) => normalizedType === alias || normalizedType.includes(alias) || alias.includes(normalizedType));
  });

  if (!item) return undefined;

  const parsed = Number.parseFloat(item.val);

  return Number.isFinite(parsed) ? parsed : undefined;
}

function getLastWeight(patient) {
  const vitals = patient?.evolution?.flatMap((entry) => entry?.vitals || []) || [];
  const parsed = vitals
    .map((vital) => Number.parseFloat(vital?.poids))
    .filter((value) => Number.isFinite(value));

  return parsed.length ? parsed[parsed.length - 1] : undefined;
}

function calcClearance(p) {
  const result = {};

  const age = Number.parseFloat(p?.identity?.age);
  const sex = (p?.identity?.sex || 'M').toUpperCase();
  const creatinine = getParaclinicNumber(p, ['creatinine']);
  const urea = getParaclinicNumber(p, ['uree']);
  const weight = getLastWeight(p);

  const weightUsed = Number.isFinite(weight) ? weight : 70;

  result.weightUsed = weightUsed;
  result.weightIsReal = Number.isFinite(weight);

  if (Number.isFinite(creatinine) && Number.isFinite(age) && age > 0) {
    result.egfr = Math.round(calculateCKDEPI({ creatinine, age, sex }));
    result.cg = Math.round(calculateCockcroftGault({ creatinine, age, weight: weightUsed, sex }));
    result.mdrd = Math.round(calculateMDRD({ creatinine, age, sex }));

    if (result.egfr >= 90) result.stage = { label: 'G1 — Normal ou élevé', css: 'normal', note: '≥90' };
    else if (result.egfr >= 60) result.stage = { label: 'G2 — Légèrement diminué', css: 'mild', note: '60–89' };
    else if (result.egfr >= 45) result.stage = { label: 'G3a — Modérément diminué', css: 'moderate', note: '45–59' };
    else if (result.egfr >= 30) result.stage = { label: 'G3b — Modérément sévère', css: 'moderate', note: '30–44' };
    else if (result.egfr >= 15) result.stage = { label: 'G4 — Sévèrement diminué', css: 'severe', note: '15–29' };
    else result.stage = { label: 'G5 — Insuffisance rénale', css: 'failure', note: '<15 (dialyse?)' };
  }

  if (Number.isFinite(urea) && Number.isFinite(creatinine)) {
    result.uree = urea;
    result.ureeCreaRatio = (urea / (creatinine / 88.4)).toFixed(1);
  }

  return result;
}

function renderClearanceBlock(p) {
  const cl = calcClearance(p);

  if (!cl.egfr && !cl.cg && !cl.mdrd && !cl.uree) return '';

  let html = '<div class="clearance-block mt-3"><div class="clearance-title"><i class="fa-solid fa-kidneys mr-1"></i>Calcul Clairance Rénale</div>';

  if (cl.egfr !== undefined) {
    const stageColorClass = cl.stage.css === 'normal' ? 'text-green-600' : cl.stage.css === 'mild' ? 'text-amber-600' : cl.stage.css === 'moderate' ? 'text-orange-600' : 'text-red-600';

    html += '<div class="flex flex-wrap gap-3 mt-1">';
    html += `<div><div class="text-[8px] text-gray-400 uppercase font-bold">CKD-EPI (eGFR)</div><div class="clearance-value ${cl.stage.css}">${cl.egfr} <span class="text-xs font-normal text-gray-500">mL/min/1.73m²</span></div><div class="clearance-stage ${stageColorClass}">${cl.stage.label}</div></div>`;
    html += `<div><div class="text-[8px] text-gray-400 uppercase font-bold">Cockcroft-Gault</div><div class="clearance-value ${cl.stage.css}">${cl.cg} <span class="text-xs font-normal text-gray-500">mL/min</span></div><div class="text-[8px] ${cl.weightIsReal ? 'text-green-600 font-bold' : 'text-gray-400'}">Poids : ${cl.weightUsed} kg ${cl.weightIsReal ? '<i class="fa-solid fa-check-circle"></i> (réel)' : '(estimé)'}</div></div>`;
    html += `<div><div class="text-[8px] text-gray-400 uppercase font-bold">MDRD</div><div class="clearance-value ${cl.stage.css}">${cl.mdrd} <span class="text-xs font-normal text-gray-500">mL/min/1.73m²</span></div><div class="text-[8px] text-gray-400">Calcul basé sur la créatinine</div></div>`;
    html += '</div>';
  }

  if (cl.ureeCreaRatio) {
    const ratio = parseFloat(cl.ureeCreaRatio);
    const ratioNote = ratio > 20 ? '⚠️ Possible déshydratation / IRC pré-rénale' : ratio < 10 ? 'Possible cause post-rénale' : 'Normal';
    const ratioColor = ratio > 20 || ratio < 10 ? 'text-orange-600' : 'text-green-600';

    html += `<div class="mt-2 text-[9px]"><span class="text-gray-400">Ratio Urée/Créat :</span> <b>${cl.ureeCreaRatio}</b> — <span class="${ratioColor} font-bold">${ratioNote}</span></div>`;
  }

  html += `<div class="text-[8px] text-gray-400 mt-2 italic">Basé sur : âge ${p.identity.age} ans, sexe ${p.identity.sex}.</div></div>`;

  return html;
}

function renderBioRefBlock(testName, val) {

  if (!val || val.trim() === '') return '';

  const numVal = parseFloat(val);

  if (isNaN(numVal)) return '';

  const refObj = getBioRef(testName);

  if (!refObj) return `<div class="bio-ref-block"><span class="bio-ref-label"><i class="fa-solid fa-circle-question mr-1 text-gray-300"></i>Référence non trouvée pour "<b>${testName}</b>"</span></div>`;

  let tagClass = 'normal';

  let tagIcon = 'fa-check';

  let tagLabel = 'NORMAL';

  if (numVal < refObj.min) { tagClass = 'low'; tagIcon = 'fa-arrow-down'; tagLabel = 'BAS'; }

  else if (numVal > refObj.max) { tagClass = 'high'; tagIcon = 'fa-arrow-up'; tagLabel = 'ÉLEVÉ'; }

  const delta = numVal < refObj.min ? `${(refObj.min - numVal).toFixed(2)} en dessous du seuil` : numVal > refObj.max ? `${(numVal - refObj.max).toFixed(2)} au-dessus du seuil` : 'dans les normes';

  return `<div class="bio-ref-block"><span class="bio-tag ${tagClass}"><i class="fa-solid ${tagIcon} mr-1"></i>${tagLabel}</span><span class="bio-ref-range">${refObj.min}–${refObj.max} ${refObj.unite}</span><span class="bio-ref-label">| ${delta}</span>${refObj.note ? `<span class="text-[8px] text-gray-400 italic">(${refObj.note})</span>` : ''}</div>`;

}



function autoResize(el) {

  el.style.height = 'auto';

  el.style.height = `${el.scrollHeight}px`;

}



function initAutoResize() {

  document.querySelectorAll('textarea.auto-resize').forEach((el) => {

    autoResize(el);

    el.addEventListener('input', function () { autoResize(this); });

  });

}



function checkVitalNormal(key, val) {

  if (val === '' || val === null || val === undefined || isNaN(parseFloat(val))) return false;

  const v = parseFloat(val);

  const ranges = {

    temp: [36.5, 37.5],

    fc: [60, 100],

    fr: [12, 20],

    spo2_aa: [95, 100],

    spo2_o2: [88, 100],

    diurese: [0.5, 3.0],

    tasG: [90, 140],

    tadG: [60, 90],

    tasD: [90, 140],

    tadD: [60, 90],

    pam: [65, 105],

  };

  if (!ranges[key]) return false;

  return v < ranges[key][0] || v > ranges[key][1];

}



function vitalClass(key, val) {

  return checkVitalNormal(key, val) ? 'abnormal-flash' : '';

}



function calcPA(nbCig, anneeDebut) {

  if (!nbCig || !anneeDebut || isNaN(nbCig) || isNaN(anneeDebut)) return '--';

  const currentYear = new Date().getFullYear();

  const duree = currentYear - parseInt(anneeDebut);

  if (duree < 0) return '--';

  return ((parseFloat(nbCig) / 20) * duree).toFixed(1);

}



function getParaTagStyle(tagValue) {

  return PARA_TAGS_LIST.find((t) => t.value === tagValue) || PARA_TAGS_LIST[0];

}



function saveToStorage() { storage.set('med_dashboard_data_v2', patients); }



function showReminderPopup(patientName, taskText, dueTime) {

  const old = document.getElementById('reminder-popup');

  if (old) old.remove();

  const popup = document.createElement('div');

  popup.id = 'reminder-popup';

  popup.style.cssText = `position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 9999; min-width: 300px; max-width: 90vw; background: #fff; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.25); border-left: 5px solid #f59e0b; padding: 16px 20px; animation: slideDown 0.35s cubic-bezier(0.16,1,0.3,1);`;

  popup.innerHTML = `

    <style>

      @keyframes slideDown { from { opacity:0; transform: translateX(-50%) translateY(-20px); } to { opacity:1; transform: translateX(-50%) translateY(0); } }

    </style>

    <div style="display:flex;align-items:flex-start;gap:12px;">

      <div style="font-size:22px;flex-shrink:0;">🔔</div>

      <div style="flex:1;">

        <div style="font-size:11px;font-weight:900;text-transform:uppercase;color:#b45309;letter-spacing:0.5px;margin-bottom:2px;">Rappel — dans 30 minutes</div>

        <div style="font-size:13px;font-weight:700;color:#1f2937;margin-bottom:2px;">${taskText || 'Tâche sans titre'}</div>

        <div style="font-size:10px;color:#6b7280;">Patient : <b>${patientName}</b> · Échéance : <b>${dueTime}</b></div>

      </div>

      <button onclick="document.getElementById('reminder-popup').remove()" style="font-size:18px;color:#9ca3af;background:none;border:none;cursor:pointer;padding:0;line-height:1;flex-shrink:0;">&times;</button>

    </div>`;

  document.body.appendChild(popup);

  setTimeout(() => { if (popup.parentNode) popup.remove(); }, 15000);

}



function handleSmartBullet(e) {

  if (e.key === 'Enter') {

    const textarea = e.target;

    const start = textarea.selectionStart;

    const text = textarea.value;

    const lastNewLine = text.lastIndexOf('\n', start - 1);

    const currentLine = text.substring(lastNewLine + 1, start);

    if (currentLine.trim().startsWith('-')) {

      e.preventDefault();

      const bullet = '\n- ';

      textarea.value = text.substring(0, start) + bullet + text.substring(textarea.selectionEnd);

      textarea.selectionStart = textarea.selectionEnd = start + bullet.length;

    }

  }

}



function formatDateDisplay(dateStr) {

  if (!dateStr) return '';

  const [y, m, d] = dateStr.split('-');

  return `${d}/${m}/${y.substring(2)}`;

}



function showListView() {

  document.getElementById('listView').classList.remove('hidden');

  document.getElementById('detailView').classList.add('hidden');

  document.getElementById('backBtn').classList.add('hidden');

  renderList();

}



function showDetailView(id) {

  currentPatientId = id;

  activeTabId = 'tab-identity';

  document.getElementById('listView').classList.add('hidden');

  document.getElementById('detailView').classList.remove('hidden');

  document.getElementById('backBtn').classList.remove('hidden');

  renderDetail();

}



function createNewPatient() {

  const newId = Date.now();

  const newPatient = {

    id: newId,

    room: 'Ch. ?',

    bed: 'Lit ?',

    tag: 'Hospitalisé',

    clinicalPriority: 3,

    assignedTo: '',

    identity: { name: '', sex: 'M', age: '' },

    history: {

      medical: '',

      surgical: '',

      allergic: '',

      gpa: { g: 0, p: 0, a: 0, living: 0 },

      gynecologic: '',

      tabac: { nbCig: '', anneeDebut: '' },

      alcool: '',

      drogues: '',

    },

    admission: { date: new Date().toISOString().split('T')[0], reason: '', histoireMaladie: '' },

    diagnostics: '',

    diagnosticsDiff: ['', '', ''],

    diagnosticsDiffPrecision: [null, null, null],

    treatments: [],

    paraclinics: [],

    tasks: [],

    evolution: [{

      date: new Date().toISOString().split('T')[0],

      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),

      vitals: [],

      functional: '',

      signesPhysiques: { general: '', neuro: '', cardio: '', pneumo: '', digestif: '', autre: '' },

      exam: {},

      complications: '',

      conclusion: '',

      cat: '',

    }],

  };

  patients.push(newPatient);

  saveToStorage();

  showDetailView(newId);

}



function getJn(admissionDate, targetDate) {

  const d1 = new Date(admissionDate);

  const d2 = new Date(targetDate);

  d1.setHours(0, 0, 0, 0);

  d2.setHours(0, 0, 0, 0);

  return `J${Math.floor((d2 - d1) / 86400000)}`;

}



function openModal(idx, key, subKey = null) {

  const p = patients.find((x) => x.id === currentPatientId);

  currentModalCtx = { idx, key, subKey };

  const content = subKey ? (p.evolution[idx].exam[subKey] || '') : (p.evolution[idx][key] || '');

  document.getElementById('modalTitle').innerText = subKey || key;

  document.getElementById('modalTextarea').value = content;

  document.getElementById('modalExpand').style.display = 'flex';

  setModalMode('edit');

}



function setModalMode(mode) {

  modalViewMode = mode;

  const txt = document.getElementById('modalTextarea');

  const pre = document.getElementById('modalPreview');

  if (mode === 'edit') { txt.classList.remove('hidden'); pre.classList.add('hidden'); txt.focus(); }

  else { txt.classList.add('hidden'); pre.classList.remove('hidden'); pre.innerText = txt.value || 'Champ vide'; }

}



function closeModal() {

  const val = document.getElementById('modalTextarea').value;

  const { idx, key, subKey } = currentModalCtx;

  if (subKey) updateExam(idx, subKey, val);

  else updateEv(idx, key, val);

  document.getElementById('modalExpand').style.display = 'none';

  renderDetail();

}



const SP_SYSTEMS = [

  { key: 'general', label: 'Général', icon: 'fa-person', color: 'text-gray-600' },

  { key: 'neuro', label: 'Neurologique', icon: 'fa-brain', color: 'text-purple-500' },

  { key: 'cardio', label: 'Cardiovasculaire', icon: 'fa-heart-pulse', color: 'text-red-500' },

  { key: 'pneumo', label: 'Pulmonaire / Respiratoire', icon: 'fa-lungs', color: 'text-blue-500' },

  { key: 'digestif', label: 'Digestif / Abdominal', icon: 'fa-stomach', color: 'text-green-600' },

  { key: 'uro', label: 'Urologique / Rénal', icon: 'fa-kidneys', color: 'text-cyan-600' },

  { key: 'gyneco', label: 'Gynécologique', icon: 'fa-venus', color: 'text-pink-500' },

  { key: 'obstetrique', label: 'Obstétrical', icon: 'fa-baby', color: 'text-pink-400' },

  { key: 'ophthalmo', label: 'Ophtalmologique', icon: 'fa-eye', color: 'text-indigo-500' },

  { key: 'orl', label: 'ORL', icon: 'fa-ear-listen', color: 'text-amber-600' },

  { key: 'locomoteur', label: 'Locomoteur / Ostéo-articulaire', icon: 'fa-bone', color: 'text-orange-500' },

  { key: 'tegumentaire', label: 'Tégumentaire / Dermatologie', icon: 'fa-hand-dots', color: 'text-yellow-600' },

  { key: 'endocrino', label: 'Endocrinien / Métabolique', icon: 'fa-vial', color: 'text-teal-600' },

  { key: 'hemato', label: 'Hématologique / Ganglions', icon: 'fa-droplet', color: 'text-rose-500' },

  { key: 'autre', label: 'Autre / Remarques', icon: 'fa-notes-medical', color: 'text-gray-400' },

];



function openSpModal(evIdx) {

  spModalEvIdx = evIdx;

  spModalMode = 'edit';

  const p = patients.find((x) => x.id === currentPatientId);

  const ev = p.evolution[evIdx];

  document.getElementById('spModalDateLabel').textContent = `${formatDateDisplay(ev.date)} — ${ev.time || ''} (${getJn(p.admission.date, ev.date)})`;

  document.getElementById('signesPhysiquesModal').classList.add('open');

  renderSpModalContent();

}



function closeSpModal() {

  document.getElementById('signesPhysiquesModal').classList.remove('open');

  spModalEvIdx = null;

}



function setSpMode(mode) {

  spModalMode = mode;

  const btnEdit = document.getElementById('spBtnEdit');

  const btnRead = document.getElementById('spBtnRead');

  if (mode === 'edit') {

    btnEdit.classList.add('bg-white', 'shadow-sm', 'text-gray-800');

    btnEdit.classList.remove('text-gray-500');

    btnRead.classList.remove('bg-white', 'shadow-sm', 'text-gray-800');

    btnRead.classList.add('text-gray-500');

  } else {

    btnRead.classList.add('bg-white', 'shadow-sm', 'text-gray-800');

    btnRead.classList.remove('text-gray-500');

    btnEdit.classList.remove('bg-white', 'shadow-sm', 'text-gray-800');

    btnEdit.classList.add('text-gray-500');

  }

  renderSpModalContent();

}



function renderSpModalContent() {

  if (spModalEvIdx === null) return;

  const p = patients.find((x) => x.id === currentPatientId);

  const ev = p.evolution[spModalEvIdx];

  const sp = ev.signesPhysiques || {};

  const container = document.getElementById('spModalContent');

  if (spModalMode === 'edit') {

    container.innerHTML = `<div class="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">${SP_SYSTEMS.map((sys) => `<div class="sp-sys-card bg-white border border-gray-100 rounded-xl p-3 space-y-2"><label class="text-[9px] font-bold ${sys.color} uppercase flex items-center gap-1.5"><i class="fa-solid ${sys.icon}"></i> ${sys.label}</label><textarea class="w-full text-xs p-2 border-gray-200 rounded-lg auto-resize bg-white" style="min-height:60px" placeholder="Examen ${sys.label.toLowerCase()}..." onkeydown="handleSmartBullet(event)" oninput="autoResize(this); updateSignesPhysiques(${spModalEvIdx}, '${sys.key}', this.value)" onchange="updateSignesPhysiques(${spModalEvIdx}, '${sys.key}', this.value)">${sp[sys.key] || ''}</textarea></div>`).join('')}</div>`;

    setTimeout(initAutoResize, 30);

  } else {

    const filledSystems = SP_SYSTEMS.filter((sys) => sp[sys.key] && sp[sys.key].trim());

    if (!filledSystems.length) {

      container.innerHTML = '<div class="flex flex-col items-center justify-center h-64 text-gray-300 gap-3"><i class="fa-solid fa-stethoscope text-4xl"></i><div class="text-sm font-bold text-gray-400">Aucun examen physique saisi</div><button onclick="setSpMode(\'edit\')" class="mt-2 text-xs text-teal-500 font-bold underline">Passer en mode édition</button></div>';

      return;

    }

    container.innerHTML = `<div class="space-y-3 pb-6">${filledSystems.map((sys) => `<div class="sp-preview-block bg-white border border-gray-100 rounded-xl p-4"><div class="flex items-center gap-2 mb-2"><div class="w-6 h-6 rounded-lg flex items-center justify-center ${sys.color}" style="background: rgba(0,0,0,0.04);"><i class="fa-solid ${sys.icon} text-xs"></i></div><span class="text-[10px] font-black uppercase tracking-wider ${sys.color}">${sys.label}</span></div><div class="sp-preview-text text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">${(sp[sys.key] || '').replace(/^- /gm, '• ')}</div></div>`).join('')}</div>`;

  }

}



function updateSignesPhysiques(evIdx, sys, val) {

  const p = patients.find((x) => x.id === currentPatientId);

  if (!p.evolution[evIdx].signesPhysiques) p.evolution[evIdx].signesPhysiques = {};

  p.evolution[evIdx].signesPhysiques[sys] = val;

  saveToStorage();

}



function renderList() {

  const listContainer = document.getElementById('patientList');

  const query = document.getElementById('searchInput').value.toLowerCase();

  const sortBy = document.getElementById('sortCriteria').value;

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



function switchTab(tabId) { activeTabId = tabId; renderDetail(); }

function setEvolutionMode(mode) { evolutionViewMode = mode; renderDetail(); }



function addTask() {

  const p = patients.find((x) => x.id === currentPatientId);

  if (!p.tasks) p.tasks = [];

  p.tasks.push({ id: Date.now(), text: '', date: new Date().toISOString().split('T')[0], time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), dueDate: '', dueTime: '', completed: false, reminded: false });

  renderDetail();

}



function updateTask(taskId, key, val) {

  const p = patients.find((x) => x.id === currentPatientId);

  const task = p.tasks.find((t) => t.id === taskId);

  task[key] = val;

  if (key === 'date' || key === 'time' || key === 'dueDate' || key === 'dueTime') task.reminded = false;

  saveToStorage();

}



function removeTask(taskId) {

  const p = patients.find((x) => x.id === currentPatientId);

  p.tasks = p.tasks.filter((t) => t.id !== taskId);

  saveToStorage();

  renderDetail();

}



function renderAdherence(t, trIdx) {

  if (!t.startDate || !t.endDate) return '<div class="text-[9px] text-gray-400 mt-1 italic">Saisir les dates de début et de fin pour afficher l\'observance.</div>';

  const start = new Date(t.startDate);

  const end = new Date(t.endDate);

  if (end < start) return '<div class="text-[9px] text-red-400 mt-1 italic">Date de fin incohérente.</div>';

  const stopDate = t.stoppedDate ? new Date(t.stoppedDate) : null;

  let html = '<div class="adherence-row mt-2 no-scrollbar">';

  let curr = new Date(start);

  let safety = 0;

  while (curr <= end && safety < 100) {

    const dateStr = curr.toISOString().split('T')[0];

    const displayDate = String(curr.getDate()).padStart(2, '0') + '/' + String(curr.getMonth() + 1).padStart(2, '0');

    const isTaken = t.adherence && t.adherence.includes(dateStr);

    const isAfterStop = t.stopped && stopDate && curr >= stopDate;

    if (isAfterStop) html += `<div class="date-bubble bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed" title="Arrêté le ${formatDateDisplay(t.stoppedDate)}">${displayDate}</div>`;

    else html += `<div onclick="toggleAdherence(${trIdx}, '${dateStr}')" class="date-bubble ${isTaken ? 'taken' : 'text-gray-500 hover:bg-gray-50'}">${displayDate}</div>`;

    curr.setDate(curr.getDate() + 1);

    safety++;

  }

  html += '</div>';

  return html;

}



function toggleAdherence(trIdx, dateStr) {

  const p = patients.find((x) => x.id === currentPatientId);

  const tr = p.treatments[trIdx];

  if (!tr.adherence) tr.adherence = [];

  const pos = tr.adherence.indexOf(dateStr);

  if (pos === -1) tr.adherence.push(dateStr);

  else tr.adherence.splice(pos, 1);

  saveToStorage();

  renderDetail();

}



function toggleStopTr(trIdx) {

  const p = patients.find((x) => x.id === currentPatientId);

  const tr = p.treatments[trIdx];

  tr.stopped = !tr.stopped;

  tr.stoppedDate = tr.stopped ? new Date().toISOString().split('T')[0] : null;

  saveToStorage();

  renderDetail();

}



function openShareModal(id) {

  window._sharePatientId = id;

  document.getElementById('shareModal').style.display = 'flex';

}



function closeShareModal() { document.getElementById('shareModal').style.display = 'none'; window._sharePatientId = null; }



function downloadPatientJson() {

  const p = patients.find((x) => x.id === window._sharePatientId);

  if (!p) return;

  const chambre = (p.room || 'Ch').replace(/\s+/g, '-');

  const dateAdm = p.admission && p.admission.date ? p.admission.date : new Date().toISOString().split('T')[0];

  const [y, m, d] = dateAdm.split('-');

  const filename = `${chambre}-${d}-${m}-${y}.json`;

  const blob = new Blob([JSON.stringify(p)], { type: 'application/json' });

  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');

  a.href = url; a.download = filename; document.body.appendChild(a); a.click();

  setTimeout(() => { URL.revokeObjectURL(url); document.body.removeChild(a); }, 1000);

  closeShareModal();

}



async function sharePatientClipboard() {

  const p = patients.find((x) => x.id === window._sharePatientId);

  if (!p) return;

  const dateNow = new Date().toLocaleString();

  const headerText = `🔴 TRANSMISSION : ${p.identity.name || 'Sans Nom'}\n📍 ${p.room} - ${p.bed}\n⚠️ Statut: ${p.clinicalPriority == 1 ? 'CRITIQUE' : p.clinicalPriority == 2 ? 'SURVEILLANCE' : 'STABLE'}\n📋 Diagnostic: ${p.diagnostics || 'Non renseigné'}\n🕒 Exporté le: ${dateNow}`;

  const jsonData = JSON.stringify(p);

  const fullMessage = `${headerText}\n\n${jsonData}`;

  if (navigator.share) {

    try { await navigator.share({ title: `Dossier ${p.identity.name}`, text: fullMessage }); } catch (err) { console.log(err); }

  } else {

    copyToClipboard(fullMessage);

    alert('Copié dans le presse-papier.');

  }

  closeShareModal();

}



function openImportModal() { document.getElementById('importModal').style.display = 'flex'; }

function closeImportModal() { document.getElementById('importModal').style.display = 'none'; }

function triggerJsonUpload() { document.getElementById('jsonFileInput').value = ''; document.getElementById('jsonFileInput').click(); }



function handleJsonFileUpload(event) {

  const file = event.target.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = function (e) {

    try { const importedData = JSON.parse(e.target.result); processImportedPatient(importedData); closeImportModal(); }

    catch (err) { alert('Erreur : fichier JSON invalide.\n' + err.message); }

  };

  reader.readAsText(file);

}



function openPasteModal() { closeImportModal(); document.getElementById('pasteJsonInput').value = ''; document.getElementById('pasteModal').style.display = 'flex'; }

function closePasteModal() { document.getElementById('pasteModal').style.display = 'none'; }



function importFromPaste() {

  const rawInput = document.getElementById('pasteJsonInput').value.trim();

  if (!rawInput) return;

  try {

    const jsonMatch = rawInput.match(/\{.*\}/s);

    if (!jsonMatch) throw new Error('Format invalide. Assurez-vous de coller un JSON complet.');

    const importedData = JSON.parse(jsonMatch[0]);

    processImportedPatient(importedData);

    closePasteModal();

  } catch (e) { alert('Erreur : ' + e.message); }

}



function processImportedPatient(importedData) {

  if (!importedData.identity || !importedData.admission) { alert('Ce fichier ne semble pas être un dossier patient valide.'); return; }

  const existingIndex = patients.findIndex((p) => p.identity.name === importedData.identity.name && p.admission.date === importedData.admission.date);

  if (existingIndex !== -1) {

    if (confirm(`Le dossier de "${importedData.identity.name}" (admis le ${importedData.admission.date}) existe déjà.\n\nVoulez-vous le remplacer ?`)) {

      importedData.id = patients[existingIndex].id;

      patients[existingIndex] = importedData;

      saveToStorage();

      renderList();

      alert('Dossier mis à jour avec succès.');

    }

  } else {

    importedData.id = Date.now();

    patients.push(importedData);

    saveToStorage();

    renderList();

    alert('Dossier importé avec succès.');

  }

}



function sharePatient(id) { openShareModal(id); }

function importPatient() { openImportModal(); }



function copyToClipboard(text) {

  const dummy = document.createElement('textarea');

  document.body.appendChild(dummy);

  dummy.value = text; dummy.select();

  document.execCommand('copy');

  document.body.removeChild(dummy);

}



function updatePADisplay() {

  const p = patients.find((x) => x.id === currentPatientId);

  const nbCig = document.getElementById('tabac-nbcig') ? document.getElementById('tabac-nbcig').value : p.history.tabac.nbCig;

  const annee = document.getElementById('tabac-annee') ? document.getElementById('tabac-annee').value : p.history.tabac.anneeDebut;

  const pa = calcPA(nbCig, annee);

  const el = document.getElementById('pa-display');

  if (el) {

    el.textContent = pa;

    el.className = `text-sm font-black ${parseFloat(pa) >= 20 ? 'text-red-600' : 'text-orange-500'}`;

  }

}



function setParaSort(category, order) {

  const key = category === 'bio' ? 'paraSortOrderBio' : 'paraSortOrderOther';

  window[key] = order;

  renderDetail();

}



function setParaFilter(category, tagValue) {

  const key = category === 'bio' ? 'paraFilterTagBio' : 'paraFilterTagOther';

  window[key] = tagValue;

  renderDetail();

}



function updateTabac(key, val) {

  const p = patients.find((x) => x.id === currentPatientId);

  if (!p.history.tabac) p.history.tabac = {};

  p.history.tabac[key] = val;

  saveToStorage();

}



function renderParaSortBar(category) {

  const stateKey = category === 'bio' ? 'paraSortOrderBio' : 'paraSortOrderOther';

  const filterKey = category === 'bio' ? 'paraFilterTagBio' : 'paraFilterTagOther';

  const sortOrder = window[stateKey] || 'recent';

  const filterTag = window[filterKey] || 'all';

  const tagOptions = `<option value="all">Tous les tags</option>` + PARA_TAGS_LIST.filter((t) => t.value !== '').map((t) => `<option value="${t.value}" ${filterTag === t.value ? 'selected' : ''}>${t.label}</option>`).join('');

  return `<div class="flex items-center gap-2 flex-wrap"><div class="flex bg-gray-100 p-0.5 rounded-lg text-[9px] font-bold"><button onclick="setParaSort('${category}', 'recent')" class="px-2 py-1 rounded-md transition ${sortOrder === 'recent' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400'}"><i class="fa-solid fa-arrow-down-wide-short mr-1"></i>Récents</button><button onclick="setParaSort('${category}', 'oldest')" class="px-2 py-1 rounded-md transition ${sortOrder === 'oldest' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400'}"><i class="fa-solid fa-arrow-up-wide-short mr-1"></i>Anciens</button></div><select onchange="setParaFilter('${category}', this.value)" class="para-tag-select text-[9px]" style="font-size:9px;">${tagOptions}</select></div>`;

}



function renderParaList(list, category, patientObj) {

  const sortKey = category === 'bio' ? 'paraSortOrderBio' : 'paraSortOrderOther';

  const filterKey = category === 'bio' ? 'paraFilterTagBio' : 'paraFilterTagOther';

  const sortOrder = window[sortKey] || 'recent';

  const filterTag = window[filterKey] || 'all';

  let indexed = list.map((pa, idx) => ({ pa, idx })).filter(({ pa }) => (category === 'bio' ? pa.isBio : !pa.isBio));

  if (filterTag !== 'all') indexed = indexed.filter(({ pa }) => (pa.paraTag || '') === filterTag);

  indexed.sort((a, b) => {

    const dA = new Date(a.pa.date || '1970-01-01');

    const dB = new Date(b.pa.date || '1970-01-01');

    return sortOrder === 'recent' ? dB - dA : dA - dB;

  });

  if (!indexed.length) return `<div class="text-center text-gray-300 text-xs py-6">Aucun résultat${filterTag !== 'all' ? ' pour ce tag' : ''}.</div>`;

  return indexed.map(({ pa, idx: realIdx }) => {

    const status = checkBioStatus(pa.type, pa.val);

    const bioRefHtml = pa.isBio ? renderBioRefBlock(pa.type, pa.val) : '';

    const normType = normalizeBioName(pa.type);

    const isClearanceRelated = normType.includes('creatinine') || normType.includes('uree');

    const clearanceHint = isClearanceRelated && pa.val ? '<div class="text-[8px] text-violet-500 font-bold mt-1"><i class="fa-solid fa-kidneys mr-1"></i>→ Voir calcul de clairance ci-dessous</div>' : '';

    const currentTag = pa.paraTag || '';

    const tagStyle = getParaTagStyle(currentTag);

    const tagSelectHtml = `<select onchange="updateParaTag(${realIdx}, this.value)" class="para-tag-select" style="font-size:9px; border-color: ${tagStyle.border};">${PARA_TAGS_LIST.map((t) => `<option value="${t.value}" ${currentTag === t.value ? 'selected' : ''}>${t.label || 'Sans tag'}</option>`).join('')}</select>`;

    return `<div class="medical-card p-3 border-l-4 ${pa.isBio ? 'border-blue-100' : 'border-purple-100'}"><div class="flex justify-between items-center mb-2"><input type="text" value="${pa.type}" onchange="updatePa(${realIdx}, 'type', this.value); refreshBioRef(${realIdx});" class="font-bold text-xs border-none p-0 bg-transparent flex-1" placeholder="Ex: Kaliémie"><div class="flex items-center gap-2 ml-2 flex-shrink-0"><div class="text-[9px] text-gray-400">${formatDateDisplay(pa.date)}</div><input type="date" value="${pa.date || ''}" onchange="updatePa(${realIdx}, 'date', this.value); renderDetail();" class="text-[8px] border-gray-100 p-1 rounded w-28 hidden" id="para-date-input-${realIdx}"><button onclick="document.getElementById('para-date-input-${realIdx}').classList.toggle('hidden'); document.getElementById('para-date-input-${realIdx}').focus();" class="text-gray-300 hover:text-blue-400 text-xs"><i class="fa-solid fa-calendar-days"></i></button></div></div><div class="mb-2">${tagSelectHtml}</div>${pa.isBio ? `<div class="flex items-center gap-4"><input type="text" id="bio-val-${realIdx}" value="${pa.val}" onchange="updatePa(${realIdx}, 'val', this.value); refreshBioRef(${realIdx});" oninput="liveRefresh(${realIdx}, this.value);" class="w-20 text-lg font-bold border-gray-50 ${status.color}" placeholder="0.0"><div><div class="text-[8px] font-bold text-gray-400 uppercase">${status.status !== 'unknown' ? `Réf: ${status.ref}` : 'Réf: Inconnue'}</div>${status.status === 'high' ? '<div class="text-[8px] text-red-500 font-black animate-pulse">⬆ ÉLEVÉ</div>' : ''}${status.status === 'low' ? '<div class="text-[8px] text-blue-500 font-black animate-pulse">⬇ BAS</div>' : ''}${status.status === 'normal' ? '<div class="text-[8px] text-green-500 font-bold">✓ NORMAL</div>' : ''}</div></div><div id="bio-ref-block-${realIdx}">${bioRefHtml}</div>${clearanceHint}` : `<textarea onkeydown="handleSmartBullet(event)" onchange="updatePa(${realIdx}, 'val', this.value)" class="text-xs w-full h-12 bg-gray-50 border-none p-2 rounded auto-resize">${pa.val}</textarea>`}<button onclick="removePa(${realIdx})" class="text-[8px] text-red-300 mt-2 block uppercase">Supprimer</button></div>`;

  }).join('');

}



function updateParaTag(realIdx, tagValue) {

  const p = patients.find((x) => x.id === currentPatientId);

  if (!p.paraclinics[realIdx]) return;

  p.paraclinics[realIdx].paraTag = tagValue;

  saveToStorage();

}



function liveRefresh(realIdx, val) {

  const p = patients.find((x) => x.id === currentPatientId);

  if (!p || !p.paraclinics[realIdx]) return;

  const testName = p.paraclinics[realIdx].type;

  const blockEl = document.getElementById(`bio-ref-block-${realIdx}`);

  if (blockEl) blockEl.innerHTML = renderBioRefBlock(testName, val);

  const inputEl = document.getElementById(`bio-val-${realIdx}`);

  if (inputEl) {

    const st = checkBioStatus(testName, val);

    inputEl.className = `w-20 text-lg font-bold border-gray-50 ${st.color}`;

  }

}



function refreshBioRef(realIdx) {

  const p = patients.find((x) => x.id === currentPatientId);

  if (!p || !p.paraclinics[realIdx]) return;

  const testName = p.paraclinics[realIdx].type;

  const val = p.paraclinics[realIdx].val;

  const blockEl = document.getElementById(`bio-ref-block-${realIdx}`);

  if (blockEl) blockEl.innerHTML = renderBioRefBlock(testName, val);

  const normType = normalizeBioName(testName);

  if (normType.includes('creatinine') || normType.includes('uree')) renderDetail();

}



function renderVitals(evIdx, vitals) {

  return vitals.map((v, vIdx) => {

    const pamVal = Math.round(calculatePAM({ systolic: v.tasG, diastolic: v.tadG }));

    const pamNum = parseInt(pamVal);

    const cTemp = vitalClass('temp', v.temp);

    const cFc = vitalClass('fc', v.fc);

    const cFr = vitalClass('fr', v.fr);

    const cTasG = vitalClass('tasG', v.tasG);

    const cTadG = vitalClass('tadG', v.tadG);

    const cTasD = vitalClass('tasD', v.tasD);

    const cTadD = vitalClass('tadD', v.tadD);

    const cPam = (!isNaN(pamNum) && (pamNum < 70 || pamNum > 105)) ? 'abnormal-flash' : '';

    const cSpo2 = v.spo2Mode === 'o2' ? vitalClass('spo2_o2', v.spo2) : vitalClass('spo2_aa', v.spo2);

    const cDiur = vitalClass('diurese', v.diurese);

    return `

      <div class="text-[10px] p-3 bg-white rounded-xl border border-gray-100 space-y-3 relative">

        <div class="flex justify-between text-[8px] uppercase font-bold text-gray-300 border-b border-gray-50 pb-1 mb-1">

          <span>Prise à : <input type="time" value="${v.time || ''}" onchange="updateVit(${evIdx}, ${vIdx}, 'time', this.value)" class="font-bold border-none p-0 text-xs text-blue-500 w-16 bg-transparent"></span>

          <button onclick="removeVital(${evIdx}, ${vIdx})" class="text-red-400 font-bold">Retirer</button>

        </div>

        <div class="grid grid-cols-3 gap-2 bg-emerald-50/40 border border-emerald-100 rounded-lg p-2">

          <div class="flex flex-col items-center"><span class="text-[8px] text-emerald-600 font-bold uppercase mb-1"><i class="fa-solid fa-weight-scale mr-0.5"></i>Poids</span><div class="flex items-center gap-1"><input type="number" step="0.1" min="0" value="${v.poids || ''}" onchange="updateVit(${evIdx}, ${vIdx}, 'poids', this.value); renderDetail();" class="font-black border-none p-0 text-sm text-center w-14 bg-transparent text-emerald-700" placeholder="70"><span class="text-[8px] text-gray-400">kg</span></div></div>

          <div class="flex flex-col items-center"><span class="text-[8px] text-emerald-600 font-bold uppercase mb-1"><i class="fa-solid fa-ruler-vertical mr-0.5"></i>Taille</span><div class="flex items-center gap-1"><input type="number" step="1" min="0" value="${v.taille || ''}" onchange="updateVit(${evIdx}, ${vIdx}, 'taille', this.value); renderDetail();" class="font-black border-none p-0 text-sm text-center w-14 bg-transparent text-emerald-700" placeholder="170"><span class="text-[8px] text-gray-400">cm</span></div></div>

          <div class="flex flex-col items-center justify-center"><span class="text-[8px] text-emerald-600 font-bold uppercase mb-1">IMC</span>${(() => {

            const pds = parseFloat(v.poids);

            const tll = parseFloat(v.taille);

            if (!isNaN(pds) && !isNaN(tll) && pds > 0 && tll > 0) {

              const imc = (pds / Math.pow(tll / 100, 2)).toFixed(1);

              const imcNum = parseFloat(imc);

              let imcLabel = ''; let imcColor = '';

              if (imcNum < 16.5) { imcLabel = 'Dénutrition sévère'; imcColor = 'text-red-600'; }

              else if (imcNum < 18.5) { imcLabel = 'Sous-poids'; imcColor = 'text-blue-500'; }

              else if (imcNum < 25.0) { imcLabel = 'Normal'; imcColor = 'text-green-600'; }

              else if (imcNum < 30.0) { imcLabel = 'Surpoids'; imcColor = 'text-amber-500'; }

              else if (imcNum < 35.0) { imcLabel = 'Obésité I'; imcColor = 'text-orange-500'; }

              else if (imcNum < 40.0) { imcLabel = 'Obésité II'; imcColor = 'text-red-500'; }

              else { imcLabel = 'Obésité III'; imcColor = 'text-red-700'; }

              return `<div class="font-black text-sm ${imcColor}">${imc}</div><div class="text-[7px] ${imcColor} font-bold">${imcLabel}</div>`;

            }

            return '<div class="text-gray-300 text-xs font-bold">—</div>';

          })()}</div>

        </div>

        <div class="grid grid-cols-3 gap-2">

          <div class="flex flex-col items-center bg-gray-50 rounded-lg p-2"><span class="text-[8px] text-gray-400 font-bold uppercase mb-1">T°C</span><input type="number" step="0.1" value="${v.temp || ''}" onchange="updateVit(${evIdx}, ${vIdx}, 'temp', this.value); renderDetail();" class="font-black border-none p-0 text-sm text-center w-16 bg-transparent ${cTemp}" placeholder="37.0"></div>

          <div class="flex flex-col items-center bg-gray-50 rounded-lg p-2"><span class="text-[8px] text-gray-400 font-bold uppercase mb-1">FC <span class="text-gray-300 normal-case">bpm</span></span><input type="number" value="${v.fc || ''}" onchange="updateVit(${evIdx}, ${vIdx}, 'fc', this.value); renderDetail();" class="font-black border-none p-0 text-sm text-center w-16 bg-transparent ${cFc}" placeholder="80"></div>

          <div class="flex flex-col items-center bg-gray-50 rounded-lg p-2"><span class="text-[8px] text-gray-400 font-bold uppercase mb-1">FR <span class="text-gray-300 normal-case">c/min</span></span><input type="number" value="${v.fr || ''}" onchange="updateVit(${evIdx}, ${vIdx}, 'fr', this.value); renderDetail();" class="font-black border-none p-0 text-sm text-center w-16 bg-transparent ${cFr}" placeholder="16"></div>

        </div>

        <div class="grid grid-cols-2 gap-2">

          <div class="bg-red-50/40 border border-red-100 rounded-lg p-2"><div class="text-[8px] text-red-400 font-bold uppercase mb-1 text-center">TA Gauche</div><div class="flex items-center justify-center gap-1"><div class="flex flex-col items-center"><span class="text-[7px] text-gray-400">TAS</span><input type="number" value="${v.tasG || ''}" onchange="updateVit(${evIdx}, ${vIdx}, 'tasG', this.value); renderDetail();" class="w-12 font-black border-none p-0 text-sm text-center bg-transparent ${cTasG}" placeholder="120"></div><span class="text-gray-400 font-bold text-sm">/</span><div class="flex flex-col items-center"><span class="text-[7px] text-gray-400">TAD</span><input type="number" value="${v.tadG || ''}" onchange="updateVit(${evIdx}, ${vIdx}, 'tadG', this.value); renderDetail();" class="w-12 font-black border-none p-0 text-sm text-center bg-transparent ${cTadG}" placeholder="80"></div></div></div>

          <div class="bg-blue-50/40 border border-blue-100 rounded-lg p-2"><div class="text-[8px] text-blue-400 font-bold uppercase mb-1 text-center">TA Droite</div><div class="flex items-center justify-center gap-1"><div class="flex flex-col items-center"><span class="text-[7px] text-gray-400">TAS</span><input type="number" value="${v.tasD || ''}" onchange="updateVit(${evIdx}, ${vIdx}, 'tasD', this.value); renderDetail();" class="w-12 font-black border-none p-0 text-sm text-center bg-transparent ${cTasD}" placeholder="120"></div><span class="text-gray-400 font-bold text-sm">/</span><div class="flex flex-col items-center"><span class="text-[7px] text-gray-400">TAD</span><input type="number" value="${v.tadD || ''}" onchange="updateVit(${evIdx}, ${vIdx}, 'tadD', this.value); renderDetail();" class="w-12 font-black border-none p-0 text-sm text-center bg-transparent ${cTadD}" placeholder="80"></div></div></div>

        </div>

        <div class="flex items-center gap-2 bg-gray-900 text-white rounded-lg px-3 py-1.5"><span class="text-[8px] uppercase font-bold text-gray-400">PAM (calculé depuis TA G) :</span><span class="font-black text-sm ${cPam}">${pamVal} <span class="text-[8px] font-normal text-gray-400">mmHg</span></span>${!isNaN(pamNum) && pamNum < 65 ? '<span class="text-[8px] text-red-400 font-black animate-pulse">⚠️ CHOC</span>' : ''}</div>

        <div class="grid grid-cols-2 gap-2">

          <div class="bg-sky-50/50 border border-sky-100 rounded-lg p-2"><div class="text-[8px] text-sky-500 font-bold uppercase mb-1">SpO2 %</div><div class="flex items-center gap-1 mb-1"><select onchange="updateVit(${evIdx}, ${vIdx}, 'spo2Mode', this.value); renderDetail();" class="text-[8px] p-1 border-sky-100 rounded bg-white font-bold"><option value="aa" ${(!v.spo2Mode || v.spo2Mode === 'aa') ? 'selected' : ''}>Air ambiant</option><option value="o2" ${v.spo2Mode === 'o2' ? 'selected' : ''}>Sous O2</option></select></div><input type="number" min="0" max="100" step="0.1" value="${v.spo2 || ''}" onchange="updateVit(${evIdx}, ${vIdx}, 'spo2', this.value); renderDetail();" class="w-full font-black border-none p-0 text-sm text-center bg-transparent ${cSpo2}" placeholder="98">${v.spo2Mode === 'o2' ? `<div class="text-[7px] text-sky-400 text-center mt-0.5">Débit O2 : <input type="number" step="0.5" value="${v.debitO2 || ''}" onchange="updateVit(${evIdx}, ${vIdx}, 'debitO2', this.value)" class="w-8 border-none bg-transparent font-bold text-sky-500 p-0 text-[9px]"> L/min</div>` : ''}</div>

          <div class="bg-yellow-50/50 border border-yellow-100 rounded-lg p-2 flex flex-col justify-between"><div class="text-[8px] text-yellow-600 font-bold uppercase mb-2"><i class="fa-solid fa-droplet mr-1"></i>Diurèse</div><div class="flex items-center justify-between gap-2 bg-white border border-yellow-100 rounded-md px-2 py-1.5"><input type="number" min="0" step="0.1" value="${v.diurese || ''}" onchange="updateVit(${evIdx}, ${vIdx}, 'diurese', this.value); renderDetail();" class="flex-1 font-black border-none p-0 text-base text-center bg-transparent ${cDiur}" style="min-width:0" placeholder="—"><span class="text-[9px] text-gray-400 font-semibold whitespace-nowrap">L / 24h</span></div><div class="text-[7px] text-center mt-1 ${cDiur ? 'text-red-400 font-bold' : 'text-gray-300'}">${cDiur ? '⚠️ Anormal' : 'Normale : 1–3 L/24h'}</div></div>

        </div>

      </div>`;

  }).join('');

}



function updateP(key, val) { patients.find((x) => x.id === currentPatientId)[key] = val; saveToStorage(); }

function updateIdentity(key, val) { patients.find((x) => x.id === currentPatientId).identity[key] = val; saveToStorage(); }

function updateHistory(key, val) { patients.find((x) => x.id === currentPatientId).history[key] = val; saveToStorage(); }

function updateGPA(key, val) { patients.find((x) => x.id === currentPatientId).history.gpa[key] = val; saveToStorage(); }

function updateAdmission(key, val) { patients.find((x) => x.id === currentPatientId).admission[key] = val; saveToStorage(); }

function updateEv(idx, key, val) { patients.find((x) => x.id === currentPatientId).evolution[idx][key] = val; saveToStorage(); }

function updateExam(idx, sys, val) { patients.find((x) => x.id === currentPatientId).evolution[idx].exam[sys] = val; saveToStorage(); }

function updateTr(idx, key, val) { patients.find((x) => x.id === currentPatientId).treatments[idx][key] = val; saveToStorage(); }

function updatePa(idx, key, val) { patients.find((x) => x.id === currentPatientId).paraclinics[idx][key] = val; saveToStorage(); }



function addVitalEntry(evIdx) {

  patients.find((x) => x.id === currentPatientId).evolution[evIdx].vitals.push({ time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), temp: '', fc: '', fr: '', tasG: '', tadG: '', tasD: '', tadD: '', spo2: '', spo2Mode: 'aa', debitO2: '', diurese: '', poids: '', taille: '' });

  renderDetail();

}



function updateVit(evIdx, vIdx, key, val) { patients.find((x) => x.id === currentPatientId).evolution[evIdx].vitals[vIdx][key] = val; saveToStorage(); }



function addEvolution() {

  patients.find((x) => x.id === currentPatientId).evolution.push({ date: new Date().toISOString().split('T')[0], time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), vitals: [], functional: '', signesPhysiques: { general: '', neuro: '', cardio: '', pneumo: '', digestif: '', autre: '' }, exam: {}, complications: '', conclusion: '', cat: '' });

  renderDetail();

}



function addTreatment() {

  patients.find((x) => x.id === currentPatientId).treatments.push({ name: '', dosage: '', form: '', stopped: false, stoppedDate: null, startDate: new Date().toISOString().split('T')[0], endDate: '', adherence: [] });

  renderDetail();

}



function addPara(cat) { patients.find((x) => x.id === currentPatientId).paraclinics.push({ type: '', val: '', date: new Date().toISOString().split('T')[0], isBio: cat === 'bio', paraTag: '' }); renderDetail(); }

function removeTr(idx) { patients.find((x) => x.id === currentPatientId).treatments.splice(idx, 1); saveToStorage(); renderDetail(); }

function removeVital(evIdx, vIdx) { patients.find((x) => x.id === currentPatientId).evolution[evIdx].vitals.splice(vIdx, 1); saveToStorage(); renderDetail(); }

function removeEv(idx) { if (confirm('Supprimer ?')) { patients.find((x) => x.id === currentPatientId).evolution.splice(idx, 1); saveToStorage(); renderDetail(); } }

function removePa(idx) { patients.find((x) => x.id === currentPatientId).paraclinics.splice(idx, 1); saveToStorage(); renderDetail(); }

function saveCurrentPatient() { saveToStorage(); showListView(); }

function deleteCurrentPatient() { if (confirm('Supprimer le dossier ?')) { patients = patients.filter((x) => x.id !== currentPatientId); saveToStorage(); showListView(); } }



function toggleDarkMode() {

  document.body.classList.toggle('dark-mode');

  const isDark = document.body.classList.contains('dark-mode');

  storage.set('theme', isDark ? 'dark' : 'light');

  document.getElementById('themeIcon').classList.replace(isDark ? 'fa-moon' : 'fa-sun', isDark ? 'fa-sun' : 'fa-moon');

}



function renderDetail() {

  const p = patients.find((x) => x.id === currentPatientId);

  if (!p) return;

  if (!p.history.tabac) p.history.tabac = { nbCig: '', anneeDebut: '' };

  if (!p.history.alcool) p.history.alcool = '';

  if (!p.history.drogues) p.history.drogues = '';

  if (!p.admission.histoireMaladie) p.admission.histoireMaladie = '';

  if (!p.diagnosticsDiff) p.diagnosticsDiff = ['', '', ''];

  if (!p.diagnosticsDiffPrecision) p.diagnosticsDiffPrecision = [null, null, null];

  const header = document.getElementById('patientHeader');

  const pa = calcPA(p.history.tabac.nbCig, p.history.tabac.anneeDebut);

  header.innerHTML = `

    <div class="header-inner">

      <div class="header-left">

        <input type="text" onchange="updateP('room', this.value)" value="${p.room}" class="w-14 text-[10px] font-bold bg-gray-50 border-none p-1 rounded">

        <input type="text" onchange="updateP('bed', this.value)" value="${p.bed}" class="w-14 text-[10px] font-bold bg-gray-50 border-none p-1 rounded">

        <select onchange="updateP('clinicalPriority', parseInt(this.value)); renderDetail();" class="text-[8px] font-black uppercase px-1 py-1 rounded border-none ${p.clinicalPriority == 1 ? 'bg-red-600 text-white' : p.clinicalPriority == 2 ? 'bg-orange-400 text-white' : 'bg-green-500 text-white'}">

          <option value="1" ${p.clinicalPriority == 1 ? 'selected' : ''}>🔴 Critique</option>

          <option value="2" ${p.clinicalPriority == 2 ? 'selected' : ''}>🟠 Surveillance</option>

          <option value="3" ${p.clinicalPriority == 3 ? 'selected' : ''}>🟢 Stable</option>

        </select>

      </div>

      <div class="header-right">

        <select onchange="updateP('tag', this.value)" class="text-[8px] font-bold uppercase px-1 py-1 rounded border border-gray-200 max-w-[90px]">${TAGS.map((t) => `<option value="${t}" ${p.tag === t ? 'selected' : ''}>${t}</option>`).join('')}</select>

      </div>

    </div>`;



  const form = document.getElementById('detailForm');

  form.innerHTML = `

    <section id="tab-identity" class="tab-content ${activeTabId === 'tab-identity' ? 'active' : ''} space-y-4">

      <div class="medical-card p-4 space-y-4">

        <div><label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Identité</label><input type="text" placeholder="Nom et Prénom" value="${p.identity.name}" onchange="updateIdentity('name', this.value)" class="w-full text-lg font-bold border-transparent focus:border-gray-300"></div>

        <div class="grid grid-cols-2 gap-3"><div><label class="block text-[10px] text-gray-400 font-bold uppercase">Sexe</label><select onchange="updateIdentity('sex', this.value); renderDetail();" class="w-full text-sm border-gray-100"><option value="M" ${p.identity.sex === 'M' ? 'selected' : ''}>M</option><option value="F" ${p.identity.sex === 'F' ? 'selected' : ''}>F</option></select></div><div><label class="block text-[10px] text-gray-400 font-bold uppercase">Âge</label><input type="number" value="${p.identity.age}" onchange="updateIdentity('age', this.value)" class="w-full text-sm border-gray-100"></div></div>

        <div class="pt-2"><label class="block text-[10px] font-bold text-blue-500 uppercase mb-1">Dossier assigné à :</label><div class="relative"><i class="fa-solid fa-user-doctor absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 text-sm"></i><input type="text" placeholder="Dr. Untel (Interne...)" value="${p.assignedTo || ''}" onchange="updateP('assignedTo', this.value)" class="w-full pl-9 py-2.5 text-sm italic bg-blue-50/30 border-blue-100 focus:border-blue-300 rounded-lg"></div></div>

      </div>

      <div class="medical-card p-4 space-y-3 relative">

        <div class="flex justify-between items-center"><label class="block text-[10px] font-bold text-gray-400 uppercase">Admission & Motif</label></div>

        <input type="date" value="${p.admission.date}" onchange="updateAdmission('date', this.value); renderDetail();" class="w-full text-sm border-gray-100 mb-2">

        <textarea id="field-admission-reason" onkeydown="handleSmartBullet(event)" onchange="updateAdmission('reason', this.value)" class="w-full text-sm h-16 border-gray-100" placeholder="Motif d'hospitalisation...">${p.admission.reason}</textarea>

        <div class="pt-2 border-t border-gray-100"><label class="block text-[10px] font-bold text-gray-500 uppercase mb-1"><i class="fa-solid fa-book-medical mr-1 text-blue-400"></i>Histoire de la maladie</label><textarea id="field-histoire-maladie" onkeydown="handleSmartBullet(event)" onchange="updateAdmission('histoireMaladie', this.value)" class="w-full text-sm border-gray-100 auto-resize" style="min-height:80px" placeholder="Résumé chronologique de la maladie actuelle...">${p.admission.histoireMaladie || ''}</textarea></div>

      </div>

      <div class="medical-card p-4 space-y-3">

        <label class="block text-[10px] font-bold text-gray-400 uppercase">Antécédents & Allergies</label>

        <textarea onkeydown="handleSmartBullet(event)" onchange="updateHistory('medical', this.value)" class="w-full text-sm border-gray-100 auto-resize" style="min-height:70px" placeholder="Médicaux / Chirurgicaux...">${p.history.medical || ''}</textarea>

        <input type="text" value="${p.history.allergic || ''}" onchange="updateHistory('allergic', this.value)" class="w-full text-sm border-red-100 text-red-600 font-bold" placeholder="⚠️ ALLERGIES">

        <div class="pt-2 border-t border-gray-100 space-y-3">

          <label class="block text-[10px] font-bold text-orange-500 uppercase"><i class="fa-solid fa-triangle-exclamation mr-1"></i>Antécédents toxicologiques</label>

          <div class="bg-orange-50/50 border border-orange-100 rounded-lg p-3 space-y-2"><label class="text-[9px] font-bold text-orange-400 uppercase block"><i class="fa-solid fa-smoking mr-1"></i>Tabac</label><div class="grid grid-cols-2 gap-2"><div><label class="text-[8px] text-gray-400 uppercase block mb-1">Nb cigarettes/jour</label><input type="number" min="0" value="${p.history.tabac.nbCig || ''}" onchange="updateTabac('nbCig', this.value); updatePADisplay();" id="tabac-nbcig" class="w-full text-sm border-orange-100 p-2" placeholder="ex: 20"></div><div><label class="text-[8px] text-gray-400 uppercase block mb-1">Depuis (année)</label><input type="number" min="1940" max="${new Date().getFullYear()}" value="${p.history.tabac.anneeDebut || ''}" onchange="updateTabac('anneeDebut', this.value); updatePADisplay();" id="tabac-annee" class="w-full text-sm border-orange-100 p-2" placeholder="ex: 2005"></div></div><div class="flex items-center gap-2 bg-white rounded-md px-3 py-2 border border-orange-100"><i class="fa-solid fa-calculator text-orange-400 text-xs"></i><span class="text-[10px] text-gray-500 font-bold uppercase">Paquets-Année :</span><span id="pa-display" class="text-sm font-black ${parseFloat(pa) >= 20 ? 'text-red-600' : 'text-orange-500'}">${pa}</span>${parseFloat(pa) >= 20 ? '<span class="text-[8px] text-red-500 font-bold">⚠️ Risque élevé</span>' : ''}</div></div>

          <div class="bg-yellow-50/50 border border-yellow-100 rounded-lg p-3"><label class="text-[9px] font-bold text-yellow-600 uppercase block mb-1"><i class="fa-solid fa-wine-glass mr-1"></i>Alcool</label><input type="text" value="${p.history.alcool || ''}" onchange="updateHistory('alcool', this.value)" class="w-full text-sm border-yellow-100 p-2" placeholder="Ex: 2 verres/jr, sevré depuis 2020..."></div>

          <div class="bg-purple-50/50 border border-purple-100 rounded-lg p-3"><label class="text-[9px] font-bold text-purple-500 uppercase block mb-1"><i class="fa-solid fa-pills mr-1"></i>Autres substances</label><input type="text" value="${p.history.drogues || ''}" onchange="updateHistory('drogues', this.value)" class="w-full text-sm border-purple-100 p-2" placeholder="Cannabis, opioïdes, etc."></div>

        </div>

      </div>

      ${p.identity.sex === 'F' ? `<div class="medical-card p-4 bg-pink-50/10 border-pink-100 space-y-3"><label class="block text-[10px] font-bold text-pink-400 uppercase">Obstétrique</label><div class="grid grid-cols-4 gap-2">${['g','p','a','living'].map((k) => `<div><label class="text-[8px] block uppercase">${k}</label><input type="number" value="${p.history.gpa[k]}" onchange="updateGPA('${k}', this.value)" class="w-full text-center p-1 text-xs border-transparent"></div>`).join('')}</div></div>` : ''}

      <div class="medical-card p-4 space-y-4">

        <div><div class="flex items-center justify-between mb-2"><label class="block text-[10px] font-bold text-gray-400 uppercase">Diagnostic Principal</label></div><textarea onkeydown="handleSmartBullet(event)" onchange="updateP('diagnostics', this.value)" class="w-full p-3 auto-resize font-bold text-red-800 bg-red-50/30 border-none rounded-lg" style="min-height:60px" placeholder="Diagnostic principal…">${p.diagnostics}</textarea></div>

        <div class="border-t border-gray-100 pt-3 space-y-3"><label class="block text-[10px] font-bold text-gray-400 uppercase"><i class="fa-solid fa-code-branch mr-1 text-amber-400"></i>Diagnostics Différentiels</label>${[0,1,2].map((i) => `<div><textarea onkeydown="handleSmartBullet(event)" onchange="updateDiff(${i}, this.value)" class="w-full p-2.5 auto-resize font-semibold text-amber-900 bg-amber-50/30 border border-amber-100 rounded-lg text-xs" style="min-height:44px" placeholder="Diagnostic différentiel 0${i+1}…">${p.diagnosticsDiff[i]}</textarea></div>`).join('')}</div>

      </div>

    </section>



    <section id="tab-clinique" class="tab-content ${activeTabId === 'tab-clinique' ? 'active' : ''} space-y-4">

      <div class="flex bg-gray-100 p-1 rounded-lg"><button onclick="setEvolutionMode('edit')" class="flex-1 py-1 text-[10px] font-bold rounded-md ${evolutionViewMode === 'edit' ? 'bg-white shadow-sm' : 'text-gray-500'}">ÉDITION</button><button onclick="setEvolutionMode('preview')" class="flex-1 py-1 text-[10px] font-bold rounded-md ${evolutionViewMode === 'preview' ? 'bg-white shadow-sm' : 'text-gray-500'}">APERÇU</button></div>

      ${evolutionViewMode === 'edit' ? `<button onclick="addEvolution()" class="w-full py-3 bg-white border border-gray-200 text-gray-500 rounded-xl text-xs font-bold hover:bg-gray-50"><i class="fa-solid fa-plus mr-1"></i> AJOUTER ÉVOLUTION</button>${p.evolution.map((ev, idx) => `<div class="medical-card p-4 space-y-4"><div class="flex justify-between items-center border-b border-gray-50 pb-2"><div class="flex items-center space-x-2"><input type="date" value="${ev.date}" onchange="updateEv(${idx}, 'date', this.value); renderDetail();" class="font-black text-xs border border-gray-200 rounded-md px-2 py-1 bg-gray-50 text-gray-900 w-34"><input type="time" value="${ev.time || ''}" onchange="updateEv(${idx}, 'time', this.value)" class="font-bold text-xs border-none p-0 text-blue-600 w-16 bg-transparent"><span class="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full font-bold">${getJn(p.admission.date, ev.date)}</span></div><div class="flex gap-2"><button onclick="removeEv(${idx})" class="text-[10px] text-red-300 hover:text-red-500 uppercase"><i class="fa-solid fa-trash"></i></button></div></div><div class="bg-gray-50/50 p-3 rounded-lg border border-gray-100"><div class="flex justify-between mb-3"><span class="text-[9px] font-black uppercase text-gray-400">Constantes</span><button onclick="addVitalEntry(${idx})" class="text-[9px] text-blue-500 font-bold uppercase">+ Ajouter</button></div><div class="space-y-3">${renderVitals(idx, ev.vitals)}</div></div><div class="relative"><label class="block text-[9px] font-bold text-gray-400 uppercase mb-1">Signes fonctionnels</label><textarea onkeydown="handleSmartBullet(event)" class="w-full text-xs p-2 border-gray-100 h-16 pr-8 auto-resize" onchange="updateEv(${idx}, 'functional', this.value)">${ev.functional}</textarea><button onclick="openModal(${idx}, 'functional')" class="absolute top-6 right-2 text-gray-300"><i class="fa-solid fa-expand"></i></button></div><div><button onclick="openSpModal(${idx})" class="w-full flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-100 transition"><span><i class="fa-solid fa-stethoscope mr-2 text-teal-500"></i>Signes Physiques (Examen clinique)</span><div class="flex items-center gap-2">${(() => { const sp = ev.signesPhysiques || {}; const filled = Object.values(sp).filter((v) => v && v.trim()).length; return filled > 0 ? `<span class="text-[8px] bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-black">${filled} système${filled > 1 ? 's' : ''}</span>` : ''; })()}<i class="fa-solid fa-up-right-and-down-left-from-center text-teal-400 text-xs"></i></div></button></div><div class="p-2 bg-gray-900 text-white rounded-lg relative"><div class="flex justify-between items-center mb-1"><span class="text-[8px] uppercase font-bold text-gray-400">Conclusion & CAT</span></div><textarea id="field-ev-cat-${idx}" onkeydown="handleSmartBullet(event)" placeholder="Conclusion & CAT" class="w-full text-xs p-1 border-none bg-transparent pr-10 min-h-[60px] auto-resize" onchange="updateEv(${idx}, 'cat', this.value)">${ev.cat}</textarea><button onclick="openModal(${idx}, 'cat')" class="absolute top-8 right-2 text-gray-600"><i class="fa-solid fa-expand"></i></button></div></div>`).reverse().join('')}` : `<div class="timeline-container px-2">${p.evolution.slice().reverse().map((ev) => `<div class="timeline-item mb-6"><div class="timeline-dot"></div><div class="text-[9px] font-bold text-gray-400 uppercase mb-1">${formatDateDisplay(ev.date)} - ${ev.time} (${getJn(p.admission.date, ev.date)})</div><div class="text-sm font-bold text-gray-800">${ev.cat || 'RAS'}</div><div class="text-xs text-gray-500 italic mt-1">${ev.functional || ''}</div></div>`).join('')}</div>`}

    </section>



    <section id="tab-traitements" class="tab-content ${activeTabId === 'tab-traitements' ? 'active' : ''} space-y-4">

      <div class="flex gap-2"><button onclick="addTreatment()" class="flex-1 py-3 bg-white border border-gray-200 text-gray-500 rounded-xl text-xs font-bold"><i class="fa-solid fa-plus mr-1"></i> MÉDICAMENT</button></div>

      ${p.treatments.map((t, idx) => `<div class="medical-card p-4 border-l-4 ${t.stopped ? 'border-l-red-400 opacity-70 bg-red-50/10' : 'border-l-blue-400'}"><div class="flex justify-between items-start mb-2"><input type="text" value="${t.name}" onchange="updateTr(${idx}, 'name', this.value)" class="font-bold text-sm border-none p-0 w-full bg-transparent ${t.stopped ? 'stopped-text' : ''}" placeholder="Produit..."><button onclick="removeTr(${idx})" class="text-red-300 ml-2">&times;</button></div><div class="grid grid-cols-2 gap-2 mb-3"><input type="text" value="${t.dosage || ''}" onchange="updateTr(${idx}, 'dosage', this.value)" class="text-[10px] p-2 border-gray-100" placeholder="Posologie"><input type="text" value="${t.form || ''}" onchange="updateTr(${idx}, 'form', this.value)" class="text-[10px] p-2 border-gray-100" placeholder="Forme"></div><div class="grid grid-cols-2 gap-2 mb-3 bg-gray-50 p-2 rounded-lg"><div><label class="text-[8px] uppercase text-gray-400 font-bold block mb-1">Début (jj/mm/aaaa)</label><input type="date" value="${t.startDate || ''}" onchange="updateTr(${idx}, 'startDate', this.value); renderDetail();" class="text-[10px] p-1.5 border-gray-200 w-full rounded"></div><div><label class="text-[8px] uppercase text-gray-400 font-bold block mb-1">Fin (jj/mm/aaaa)</label><input type="date" value="${t.endDate || ''}" onchange="updateTr(${idx}, 'endDate', this.value); renderDetail();" class="text-[10px] p-1.5 border-gray-200 w-full rounded"></div></div><div class="mb-2"><label class="text-[9px] uppercase text-gray-500 font-bold block mb-1">Observance Journalière</label>${renderAdherence(t, idx)}</div><div class="mt-4 pt-3 border-t border-gray-100 flex justify-end"><button onclick="toggleStopTr(${idx})" class="text-[9px] ${t.stopped ? 'bg-gray-900 text-white' : 'bg-red-50 text-red-500 hover:bg-red-100'} px-3 py-2 rounded-md font-bold transition">${t.stopped ? '<i class="fa-solid fa-rotate-left mr-1"></i> REPRENDRE (Arrêté le ' + formatDateDisplay(t.stoppedDate) + ')' : '<i class="fa-solid fa-ban mr-1"></i> STOPPER LE TRAITEMENT'}</button></div></div>`).join('')}

    </section>



    <section id="tab-paraclinique" class="tab-content ${activeTabId === 'tab-paraclinique' ? 'active' : ''} space-y-6">

      <div><div class="flex justify-between items-center mb-3"><h3 class="text-xs font-black text-blue-500 uppercase tracking-tighter">Biologie</h3><div class="flex gap-2 flex-wrap"><button onclick="addPara('bio')" class="text-[9px] bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold">+ BIO</button></div></div>${renderParaSortBar('bio')}<div class="space-y-3 mt-2">${renderParaList(p.paraclinics, 'bio', p)}</div>${renderClearanceBlock(p)}</div>

      <div class="border-t border-gray-100 pt-6"><div class="flex justify-between items-center mb-3"><h3 class="text-xs font-black text-purple-500 uppercase tracking-tighter">Imagerie / Autres</h3><button onclick="addPara('other')" class="text-[9px] bg-purple-50 text-purple-600 px-3 py-1 rounded-full font-bold">+ AUTRE</button></div>${renderParaSortBar('other')}<div class="space-y-3 mt-2">${renderParaList(p.paraclinics, 'other', p)}</div></div>

    </section>



    <section id="tab-tasks" class="tab-content ${activeTabId === 'tab-tasks' ? 'active' : ''} space-y-4">

      <div class="flex justify-between items-center"><h3 class="text-xs font-bold text-gray-400 uppercase">To-Do List</h3><div class="flex gap-2"><button onclick="addTask()" class="bg-black text-white px-4 py-2 rounded-full text-xs font-bold">+ Tâche</button></div></div>

      <div class="space-y-3">${(p.tasks || []).map((task) => {

        let dueLabel = '';

        let dueColor = 'text-gray-400';

        let dueBg = '';

        if (task.dueDate && task.dueTime) {

          const now = new Date();

          const due = new Date(`${task.dueDate}T${task.dueTime}`);

          const diffMin = Math.round((due - now) / 60000);

          if (task.completed) { dueLabel = '✅ Terminée'; dueColor = 'text-green-500'; }

          else if (diffMin < 0) { dueLabel = `⛔ Échue depuis ${Math.abs(diffMin)} min`; dueColor = 'text-red-600'; dueBg = 'bg-red-50'; }

          else if (diffMin <= 30) { dueLabel = `⚠️ Dans ${diffMin} min`; dueColor = 'text-amber-600'; dueBg = 'bg-amber-50'; }

          else { const h = Math.floor(diffMin / 60); const m = diffMin % 60; dueLabel = h > 0 ? `⏰ Dans ${h}h${m > 0 ? m + 'min' : ''}` : `⏰ Dans ${m} min`; dueColor = 'text-blue-500'; }

        }

        return `<div class="medical-card p-3 ${task.completed ? 'opacity-50' : ''} ${dueBg}"><div class="flex items-start gap-3"><input type="checkbox" ${task.completed ? 'checked' : ''} onchange="updateTask(${task.id}, 'completed', this.checked); renderDetail();" class="mt-1 w-5 h-5 accent-black flex-shrink-0"><div class="flex-1 min-w-0"><input type="text" value="${task.text}" onchange="updateTask(${task.id}, 'text', this.value)" class="w-full text-sm font-medium border-none p-0 bg-transparent ${task.completed ? 'line-through text-gray-400' : ''}" placeholder="Tâche..."><div class="mt-2 flex flex-wrap items-center gap-2"><span class="text-[8px] font-black uppercase text-amber-500"><i class="fa-solid fa-clock mr-1"></i>Échéance :</span><input type="date" value="${task.dueDate || ''}" onchange="updateTask(${task.id}, 'dueDate', this.value); renderDetail();" class="text-[9px] p-1 border-amber-200 rounded bg-amber-50/40 font-bold text-gray-700 w-30"><input type="time" value="${task.dueTime || ''}" onchange="updateTask(${task.id}, 'dueTime', this.value); renderDetail();" class="text-[9px] p-1 border-amber-200 rounded bg-amber-50/40 font-bold text-blue-600 w-20"></div>${dueLabel ? `<div class="mt-1 text-[9px] font-black ${dueColor}">${dueLabel}</div>` : ''}<div class="flex gap-4 mt-1 text-[8px] text-gray-300"><span>Créée le ${task.date} à ${task.time}</span><button onclick="removeTask(${task.id})" class="text-red-400 uppercase font-bold">Supprimer</button></div></div></div></div>`;

      }).join('') || '<p class="text-center text-gray-300 py-10 text-xs">Aucune tâche.</p>'}</div>

    </section>`;



  document.querySelectorAll('.tab-link').forEach((l) => { l.classList.remove('border-black', 'text-gray-900', 'font-semibold'); l.classList.add('text-gray-400'); });

  const activeLink = document.getElementById('link-' + activeTabId);

  if (activeLink) activeLink.classList.add('border-black', 'text-gray-900', 'font-semibold');

  setTimeout(initAutoResize, 50);

}



function renderApp() {

  const app = document.getElementById('app');

  if (!app) return;

  app.innerHTML = `

    <header class="bg-white border-b border-gray-100 p-4 top-0 z-50 transition-colors">

      <div class="max-w-4xl mx-auto flex justify-between items-center">

        <div>

          <h1 class="text-lg font-semibold tracking-tight text-gray-900"><i class="fa-solid fa-staff-snake text-blue-500 mr-2"></i>Ash-board <span class="text-gray-400">V1.0.0</span></h1>

          <p class="sm:block text-[10px] text-gray-400 font-medium leading-tight mt-1">Outils de gestion et de prise en charge optimale des patients</p>

        </div>

        <div class="flex items-center gap-3 sm:gap-6">

          <button onclick="toggleDarkMode()" class="text-gray-400 hover:text-blue-500 transition" title="Mode Sombre"><i id="themeIcon" class="fa-solid fa-moon text-xl"></i></button>

          <button onclick="showListView()" id="backBtn" class="hidden text-sm text-gray-500 hover:text-black transition font-bold"><i class="fa-solid fa-arrow-left mr-1"></i> RETOUR</button>

        </div>

      </div>

    </header>



    <main class="p-4 max-w-4xl mx-auto min-h-screen">

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



      <div id="detailView" class="hidden">

        <div id="patientHeader" class="mb-4 sticky top-[64px] bg-white/80 backdrop-blur-md py-2 border-b border-gray-100 z-40 transition-colors"></div>

        <nav class="flex border-b border-gray-100 mb-6 overflow-x-auto text-sm no-scrollbar">

          <button onclick="switchTab('tab-identity')" class="tab-link px-4 py-2 border-b-2 border-black font-semibold whitespace-nowrap" id="link-tab-identity"><i class="fa-solid fa-id-card mr-1"></i>Identité & ATCD</button>

          <button onclick="switchTab('tab-clinique')" class="tab-link px-4 py-2 text-gray-400 whitespace-nowrap" id="link-tab-clinique"><i class="fa-solid fa-chart-line mr-1"></i>Évolution</button>

          <button onclick="switchTab('tab-traitements')" class="tab-link px-4 py-2 text-gray-400 whitespace-nowrap" id="link-tab-traitements"><i class="fa-solid fa-pills mr-1"></i>Traitements</button>

          <button onclick="switchTab('tab-paraclinique')" class="tab-link px-4 py-2 text-gray-400 whitespace-nowrap" id="link-tab-paraclinique"><i class="fa-solid fa-microscope mr-1"></i>Para-clinique</button>

          <button onclick="switchTab('tab-tasks')" class="tab-link px-4 py-2 text-gray-400 whitespace-nowrap" id="link-tab-tasks"><i class="fa-solid fa-list-check mr-1"></i>Planification</button>

        </nav>

        <div id="detailForm" class="max-w-2xl mx-auto"></div>

        <div class="mt-8 pt-4 flex space-x-3 max-w-2xl mx-auto">

          <button onclick="saveCurrentPatient()" class="flex-1 bg-gray-900 text-white py-3 rounded-xl font-medium shadow-sm hover:bg-black transition"><i class="fa-solid fa-floppy-disk mr-2"></i>Enregistrer</button>

          <button onclick="openShareModal(currentPatientId)" class="bg-blue-50 text-blue-600 px-4 py-3 rounded-xl hover:bg-blue-100 transition" title="Partager / Télécharger"><i class="fa-solid fa-share-nodes"></i></button>

          <button onclick="deleteCurrentPatient()" class="bg-white border border-red-100 text-red-500 px-4 py-3 rounded-xl hover:bg-red-50 transition"><i class="fa-solid fa-trash"></i></button>

        </div>

      </div>

    </main>



    <footer class="text-center py-8 text-gray-400 text-[10px] uppercase tracking-widest border-t border-gray-50 mt-10">App créée par RAHARIMANANTSOA Herivola-Copyright©-2026</footer>



    <div id="modalExpand" class="flex flex-col transition-colors">

      <header class="p-4 border-b flex justify-between items-center bg-gray-50 transition-colors">

        <div id="modalTitle" class="font-bold text-sm uppercase text-gray-500">Champ</div>

        <div class="flex items-center space-x-4">

          <div class="flex bg-gray-200 p-1 rounded-lg text-[10px] font-bold transition-colors">

            <button id="btnViewMode" onclick="setModalMode('view')" class="px-3 py-1 rounded-md">LECTURE</button>

            <button id="btnEditMode" onclick="setModalMode('edit')" class="px-3 py-1 rounded-md">ÉDITION</button>

          </div>

          <button onclick="closeModal()" class="text-2xl text-gray-500 hover:text-black">&times;</button>

        </div>

      </header>

      <div class="flex-1 p-4 overflow-y-auto max-w-3xl mx-auto w-full">

        <textarea id="modalTextarea" class="w-full h-full border-none resize-none focus:ring-0 p-0 text-lg hidden" placeholder="Saisir ici..." onkeydown="handleSmartBullet(event)"></textarea>

        <div id="modalPreview" class="w-full h-full prose prose-sm max-w-none whitespace-pre-wrap text-lg"></div>

      </div>

      <footer class="p-4 border-t bg-gray-50 transition-colors"><button onclick="closeModal()" class="max-w-md mx-auto w-full block bg-black text-white py-3 rounded-xl font-bold">Valider & Fermer</button></footer>

    </div>



    <div id="signesPhysiquesModal">

      <header class="sp-modal-header p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center sticky top-0 z-10 transition-colors">

        <div class="flex items-center gap-3">

          <i class="fa-solid fa-stethoscope text-teal-500 text-base"></i>

          <div>

            <div class="font-bold text-sm text-gray-800" id="spModalTitle">Signes Physiques — Examen Clinique</div>

            <div class="text-[9px] text-gray-400 uppercase font-bold" id="spModalDateLabel"></div>

          </div>

        </div>

        <div class="flex items-center gap-2">

          <div class="flex bg-gray-200 p-1 rounded-lg text-[10px] font-bold">

            <button id="spBtnEdit" onclick="setSpMode('edit')" class="px-3 py-1 rounded-md bg-white shadow-sm text-gray-800">ÉDITION</button>

            <button id="spBtnRead" onclick="setSpMode('read')" class="px-3 py-1 rounded-md text-gray-500">LECTURE</button>

          </div>

          <button onclick="closeSpModal()" class="text-2xl text-gray-500 hover:text-black ml-2">&times;</button>

        </div>

      </header>

      <div id="spModalContent" class="flex-1 overflow-y-auto p-4 max-w-3xl mx-auto w-full"></div>

      <footer class="p-4 border-t border-gray-100 bg-gray-50 transition-colors"><button onclick="closeSpModal()" class="max-w-md mx-auto w-full block bg-black text-white py-3 rounded-xl font-bold">Valider & Fermer</button></footer>

    </div>



    <div id="importModal" style="display:none; position:fixed; inset:0; z-index:250; background:rgba(0,0,0,0.5); backdrop-filter:blur(4px); align-items:center; justify-content:center; padding:16px;">

      <div style="background:#fff; border-radius:20px; width:100%; max-width:420px; overflow:hidden; box-shadow:0 30px 60px rgba(0,0,0,0.25);" class="dark-modal-box">

        <div style="padding:16px 20px; border-bottom:1px solid #f0f0f0; display:flex; justify-content:space-between; align-items:center;">

          <div>

            <div style="font-size:13px; font-weight:800; color:#111827;"><i class="fa-solid fa-file-import mr-2 text-gray-500"></i>Importer un dossier</div>

            <div style="font-size:10px; color:#9ca3af; margin-top:2px;">Choisissez la méthode d'importation</div>

          </div>

          <button onclick="closeImportModal()" style="font-size:22px; color:#9ca3af; background:none; border:none; cursor:pointer;">&times;</button>

        </div>

        <div style="padding:20px; display:flex; flex-direction:column; gap:12px;">

          <button onclick="triggerJsonUpload()" style="display:flex; align-items:center; gap:14px; padding:14px 16px; border:1.5px solid #e5e7eb; border-radius:14px; background:#f9fafb; cursor:pointer; transition:all 0.2s; text-align:left; width:100%;" onmouseover="this.style.borderColor='#3b82f6';this.style.background='#eff6ff'" onmouseout="this.style.borderColor='#e5e7eb';this.style.background='#f9fafb'">

            <div style="width:40px; height:40px; background:#dbeafe; border-radius:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0;"><i class="fa-solid fa-file-arrow-up" style="color:#3b82f6; font-size:16px;"></i></div>

            <div><div style="font-size:12px; font-weight:800; color:#111827;">Uploader un dossier JSON</div><div style="font-size:10px; color:#6b7280; margin-top:2px;">Sélectionner un fichier .json depuis votre stockage</div></div>

          </button>

          <input type="file" id="jsonFileInput" accept=".json" style="display:none;" onchange="handleJsonFileUpload(event)">

          <button onclick="openPasteModal()" style="display:flex; align-items:center; gap:14px; padding:14px 16px; border:1.5px solid #e5e7eb; border-radius:14px; background:#f9fafb; cursor:pointer; transition:all 0.2s; text-align:left; width:100%;" onmouseover="this.style.borderColor='#10b981';this.style.background='#f0fdf4'" onmouseout="this.style.borderColor='#e5e7eb';this.style.background='#f9fafb'">

            <div style="width:40px; height:40px; background:#dcfce7; border-radius:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0;"><i class="fa-solid fa-clipboard" style="color:#10b981; font-size:16px;"></i></div>

            <div><div style="font-size:12px; font-weight:800; color:#111827;">Coller depuis le presse-papier</div><div style="font-size:10px; color:#6b7280; margin-top:2px;">Coller le JSON reçu par WhatsApp ou autre</div></div>

          </button>

        </div>

      </div>

    </div>



    <div id="pasteModal" style="display:none; position:fixed; inset:0; z-index:260; background:rgba(0,0,0,0.55); backdrop-filter:blur(4px); align-items:center; justify-content:center; padding:16px;">

      <div style="background:#fff; border-radius:20px; width:100%; max-width:480px; overflow:hidden; box-shadow:0 30px 60px rgba(0,0,0,0.25);">

        <div style="padding:16px 20px; border-bottom:1px solid #f0f0f0; display:flex; justify-content:space-between; align-items:center;">

          <div style="font-size:13px; font-weight:800; color:#111827;"><i class="fa-solid fa-clipboard mr-2 text-green-500"></i>Coller le JSON</div>

          <button onclick="closePasteModal()" style="font-size:22px; color:#9ca3af; background:none; border:none; cursor:pointer;">&times;</button>

        </div>

        <div style="padding:16px 20px;"><textarea id="pasteJsonInput" placeholder="Collez le JSON ici (transmission WhatsApp ou autre)..." style="width:100%; height:160px; font-size:11px; border:1.5px solid #e5e7eb; border-radius:10px; padding:10px; resize:none; font-family:monospace; box-sizing:border-box;"></textarea><button onclick="importFromPaste()" style="margin-top:10px; width:100%; background:#111827; color:#fff; border:none; border-radius:12px; padding:12px; font-size:13px; font-weight:700; cursor:pointer;"><i class="fa-solid fa-file-import mr-2"></i>Importer</button></div>

      </div>

    </div>



    <div id="shareModal" style="display:none; position:fixed; inset:0; z-index:250; background:rgba(0,0,0,0.5); backdrop-filter:blur(4px); align-items:center; justify-content:center; padding:16px;">

      <div style="background:#fff; border-radius:20px; width:100%; max-width:420px; overflow:hidden; box-shadow:0 30px 60px rgba(0,0,0,0.25);">

        <div style="padding:16px 20px; border-bottom:1px solid #f0f0f0; display:flex; justify-content:space-between; align-items:center;">

          <div><div style="font-size:13px; font-weight:800; color:#111827;"><i class="fa-solid fa-share-nodes mr-2 text-blue-500"></i>Partager le dossier</div><div style="font-size:10px; color:#9ca3af; margin-top:2px;">Choisissez la méthode d'envoi</div></div>

          <button onclick="closeShareModal()" style="font-size:22px; color:#9ca3af; background:none; border:none; cursor:pointer;">&times;</button>

        </div>

        <div style="padding:20px; display:flex; flex-direction:column; gap:12px;">

          <button onclick="downloadPatientJson()" style="display:flex; align-items:center; gap:14px; padding:14px 16px; border:1.5px solid #e5e7eb; border-radius:14px; background:#f9fafb; cursor:pointer; transition:all 0.2s; text-align:left; width:100%;" onmouseover="this.style.borderColor='#3b82f6';this.style.background='#eff6ff'" onmouseout="this.style.borderColor='#e5e7eb';this.style.background='#f9fafb'">

            <div style="width:40px; height:40px; background:#dbeafe; border-radius:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0;"><i class="fa-solid fa-file-arrow-down" style="color:#3b82f6; font-size:16px;"></i></div>

            <div><div style="font-size:12px; font-weight:800; color:#111827;">Télécharger le fichier JSON</div><div style="font-size:10px; color:#6b7280; margin-top:2px;">Enregistre sur votre téléphone — puis envoyez par WhatsApp</div></div>

          </button>

          <button onclick="sharePatientClipboard()" style="display:flex; align-items:center; gap:14px; padding:14px 16px; border:1.5px solid #e5e7eb; border-radius:14px; background:#f9fafb; cursor:pointer; transition:all 0.2s; text-align:left; width:100%;" onmouseover="this.style.borderColor='#10b981';this.style.background='#f0fdf4'" onmouseout="this.style.borderColor='#e5e7eb';this.style.background='#f9fafb'">

            <div style="width:40px; height:40px; background:#dcfce7; border-radius:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0;"><i class="fa-solid fa-clipboard" style="color:#10b981; font-size:16px;"></i></div>

            <div><div style="font-size:12px; font-weight:800; color:#111827;">Copier dans le presse-papier</div><div style="font-size:10px; color:#6b7280; margin-top:2px;">Pour coller directement dans WhatsApp ou autre</div></div>

          </button>

        </div>

      </div>

    </div>

  `;



  document.getElementById('searchInput').addEventListener('input', renderList);

  document.getElementById('sortCriteria').addEventListener('change', renderList);

  renderList();

  if (storage.get('theme') === 'dark') {

    document.body.classList.add('dark-mode');

    document.getElementById('themeIcon').classList.replace('fa-moon', 'fa-sun');

  }

}



setInterval(() => {

  const now = new Date();

  patients.forEach((p) => {

    if (p.tasks) {

      p.tasks.forEach((task) => {

        if (!task.completed && !task.reminded) {

          const dateStr = task.dueDate || task.date;

          const timeStr = task.dueTime || task.time;

          if (!dateStr || !timeStr) return;

          const taskDate = new Date(`${dateStr}T${timeStr}`);

          const diffMinutes = (taskDate - now) / (1000 * 60);

          if (diffMinutes <= 30 && diffMinutes > 0) {

            showReminderPopup(p.identity.name || 'Patient', task.text, `${dateStr} à ${timeStr}`);

            task.reminded = true;

            saveToStorage();

          }

        }

      });

    }

  });

}, 30000);



function initializeApp() {

  renderApp();

  if (patients.length) {

    currentPatientId = patients[0].id;

    renderDetail();

  }

}



Object.assign(window, {

  toggleDarkMode,

  showListView,

  showDetailView,

  createNewPatient,

  openImportModal,

  closeImportModal,

  triggerJsonUpload,

  handleJsonFileUpload,

  openPasteModal,

  closePasteModal,

  importFromPaste,

  sharePatient,

  openShareModal,

  closeShareModal,

  downloadPatientJson,

  sharePatientClipboard,

  copyToClipboard,

  handleSmartBullet,

  setModalMode,

  closeModal,

  openSpModal,

  closeSpModal,

  setSpMode,

  updateSignesPhysiques,

  switchTab,

  setEvolutionMode,

  addTask,

  updateTask,

  removeTask,

  toggleAdherence,

  toggleStopTr,

  addEvolution,

  addTreatment,

  addPara,

  addVitalEntry,

  updateParaTag,

  liveRefresh,

  refreshBioRef,

  updatePADisplay,

  updateTabac,

  setParaSort,

  setParaFilter,

  updatePa,

  updateVit,

  updateP,

  updateIdentity,

  updateHistory,

  updateGPA,

  updateAdmission,

  updateEv,

  updateExam,

  updateTr,

  removeTr,

  removeVital,

  removeEv,

  removePa,

  saveCurrentPatient,

  deleteCurrentPatient,

  openModal,

  renderList,

  renderDetail,

});



initializeApp();




