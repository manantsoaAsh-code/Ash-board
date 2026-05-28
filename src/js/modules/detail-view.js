import { calculateCKDEPI, calculateCockcroftGault, calculateMDRD, calculatePAM } from '../core/medical-math.js';
import { checkBioStatus, getBioRef, normalizeBioName } from '../config/bio-standards.js';

const PARA_TAGS_LIST = [
  { value: '', label: 'Sans tag', color: 'bg-gray-100 text-gray-500', border: '#e5e7eb' },
  { value: 'controle', label: '✅ Contrôle', color: 'bg-green-100 text-green-700', border: '#86efac' },
  { value: 'a-controler', label: '🔁 À contrôler', color: 'bg-blue-100 text-blue-700', border: '#93c5fd' },
];

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
  const parsed = vitals.map((vital) => Number.parseFloat(vital?.poids)).filter((value) => Number.isFinite(value));
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

export function renderBioRefBlock(testName, val) {
  if (!val || val.trim() === '') return '';
  const numVal = parseFloat(val);
  if (isNaN(numVal)) return '';

  const refObj = getBioRef(testName);
  if (!refObj) {
    return `<div class="bio-ref-block"><span class="bio-ref-label"><i class="fa-solid fa-circle-question mr-1 text-gray-300"></i>Référence non trouvée pour "<b>${testName}</b>"</span></div>`;
  }

  let tagClass = 'normal';
  let tagIcon = 'fa-check';
  let tagLabel = 'NORMAL';

  if (numVal < refObj.min) { tagClass = 'low'; tagIcon = 'fa-arrow-down'; tagLabel = 'BAS'; }
  else if (numVal > refObj.max) { tagClass = 'high'; tagIcon = 'fa-arrow-up'; tagLabel = 'ÉLEVÉ'; }

  const delta = numVal < refObj.min
    ? `${(refObj.min - numVal).toFixed(2)} en dessous du seuil`
    : numVal > refObj.max
      ? `${(numVal - refObj.max).toFixed(2)} au-dessus du seuil`
      : 'dans les normes';

  return `<div class="bio-ref-block"><span class="bio-tag ${tagClass}"><i class="fa-solid ${tagIcon} mr-1"></i>${tagLabel}</span><span class="bio-ref-range">${refObj.min}–${refObj.max} ${refObj.unite}</span><span class="bio-ref-label">| ${delta}</span>${refObj.note ? `<span class="text-[8px] text-gray-400 italic">(${refObj.note})</span>` : ''}</div>`;
}

export function renderClearanceBlock(p) {
  const cl = calcClearance(p);
  if (!cl.egfr && !cl.cg && !cl.mdrd && !cl.uree) return '';

  let html = '<div class="clearance-block mt-3"><div class="clearance-title"><i class="fa-solid fa-kidneys mr-1"></i>Calcul Clairance Rénale</div>';

  if (cl.egfr !== undefined) {
    const stageColorClass = cl.stage.css === 'normal'
      ? 'text-green-600'
      : cl.stage.css === 'mild'
        ? 'text-amber-600'
        : cl.stage.css === 'moderate'
          ? 'text-orange-600'
          : 'text-red-600';

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

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = `${el.scrollHeight}px`;
}

export function initAutoResize() {
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

function formatDateDisplay(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y.substring(2)}`;
}

function getJn(admissionDate, targetDate) {
  const d1 = new Date(admissionDate);
  const d2 = new Date(targetDate);
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  return `J${Math.floor((d2 - d1) / 86400000)}`;
}

function handleSmartBullet(e) {
  if (e.key === 'Enter') {
    const el = e.target;
    const start = el.selectionStart;
    const before = el.value.slice(0, start);
    const lineStart = before.lastIndexOf('\n') + 1;
    const currentLine = before.slice(lineStart).trim();
    const needsBullet = !(currentLine.startsWith('-') || currentLine.startsWith('•'));
    const insert = '\n' + (needsBullet ? '- ' : '');
    setTimeout(() => {
      const val = el.value;
      el.value = val.slice(0, start) + insert + val.slice(start);
      el.selectionStart = el.selectionEnd = start + insert.length;
      autoResize(el);
    }, 0);
    e.preventDefault();
  }
}

function getParaTagStyle(tagValue) {
  return PARA_TAGS_LIST.find((t) => t.value === tagValue) || PARA_TAGS_LIST[0];
}

export function renderParaSortBar(category) {
  const stateKey = category === 'bio' ? 'paraSortOrderBio' : 'paraSortOrderOther';
  const filterKey = category === 'bio' ? 'paraFilterTagBio' : 'paraFilterTagOther';
  const sortOrder = window[stateKey] || 'recent';
  const filterTag = window[filterKey] || 'all';
  const tagOptions = `<option value="all">Tous les tags</option>` + PARA_TAGS_LIST.filter((t) => t.value !== '').map((t) => `<option value="${t.value}" ${filterTag === t.value ? 'selected' : ''}>${t.label}</option>`).join('');
  return `<div class="flex items-center gap-2 flex-wrap"><div class="flex bg-gray-100 p-0.5 rounded-lg text-[9px] font-bold"><button onclick="setParaSort('${category}', 'recent')" class="px-2 py-1 rounded-md transition ${sortOrder === 'recent' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400'}"><i class="fa-solid fa-arrow-down-wide-short mr-1"></i>Récents</button><button onclick="setParaSort('${category}', 'oldest')" class="px-2 py-1 rounded-md transition ${sortOrder === 'oldest' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400'}"><i class="fa-solid fa-arrow-up-wide-short mr-1"></i>Anciens</button></div><select onchange="setParaFilter('${category}', this.value)" class="para-tag-select text-[9px]" style="font-size:9px;">${tagOptions}</select></div>`;
}

export function renderParaList(list, category, patientObj) {
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

export function renderAdherence(t, trIdx) {
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

export function renderVitals(evIdx, vitals) {
  return vitals.map((v, vIdx) => {
    const pamVal = Math.round(calculatePAM({ systolic: v.tasG, diastolic: v.tadG }));
    const pamNum = parseInt(pamVal, 10);
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
              let imcLabel = '';
              let imcColor = '';
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

export { autoResize, formatDateDisplay, getJn, handleSmartBullet };
