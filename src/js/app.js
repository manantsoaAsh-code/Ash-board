import { BIO_STANDARDS, checkBioStatus, getBioRef, normalizeBioName } from './config/bio-standards.js';
import { calculateCKDEPI, calculateCockcroftGault, calculateMDRD, calculatePAM } from './core/medical-math.js';
import { renderBioRefBlock, renderClearanceBlock, autoResize, initAutoResize, formatDateDisplay, getJn, handleSmartBullet, renderParaSortBar, renderParaList, renderAdherence, renderVitals } from './modules/detail-view.js';
import { renderDashboardPage } from './modules/dashboard-page.js';
import { renderProfilePage } from './modules/profile-page.js';
import { renderSettingsPage } from './modules/settings-page.js';
import { renderLoginPage, renderRegisterPage } from './modules/login-page.js';
import { renderAboutPage } from './modules/about-page.js';
import { renderCGUModal, renderLegalPage } from './components/cgu-modal.js';
import { apiRequest } from './core/api-client.js';
import { isAuthenticated, saveToken, clearToken } from './core/auth.js';
import { storage } from './core/storage.js';

const API_BASE = window.API_BASE || '';

let patients = storage.get('med_dashboard_data_v2', []);
let currentPatientId = null;
let currentView = 'dashboard';
let activeTabId = 'tab-identity';
let evolutionViewMode = 'edit';
let currentModalCtx = { idx: null, key: null, subKey: null };
let modalViewMode = 'edit';
let spModalEvIdx = null;
let spModalMode = 'edit';
let paraSortOrder = 'recent';
let paraFilterTag = 'all';
let currentUserData = null;
let showCGUModal = false;

const PARA_TAGS_LIST = [
  { value: '', label: 'Sans tag', color: 'bg-gray-100 text-gray-500', border: '#e5e7eb' },
  { value: 'controle', label: '✅ Contrôle', color: 'bg-green-100 text-green-700', border: '#86efac' },
  { value: 'a-controler', label: '🔁 À contrôler', color: 'bg-blue-100 text-blue-700', border: '#93c5fd' },
];

const SP_SYSTEMS = [
  {key: 'general', label: 'Général', color: 'text-gray-500', icon: 'fa-hospital-user' },
  { key: 'cardiovasculaire', label: 'Cardiovasculaire', color: 'text-red-500', icon: 'fa-heart' },
  { key: 'respiratoire', label: 'Respiratoire', color: 'text-blue-500', icon: 'fa-lungs' },
  { key: 'neurologique', label: 'Neurologique', color: 'text-purple-500', icon: 'fa-brain' },
  { key: 'abdominal', label: 'Abdominal', color: 'text-orange-500', icon: 'fa-stomach' },
  { key: 'orl', label: 'ORL', color: 'text-pink-500', icon: 'fa-ear' },
  {key:'ophtalmologique', label: 'Ophtalmologique', color: 'text-sky-500', icon: 'fa-eye' },
  { key: 'peau', label: 'Peau', color: 'text-amber-500', icon: 'fa-hand-holding-medical' },
  { key: 'locomoteur', label: 'Locomoteur', color: 'text-emerald-500', icon: 'fa-bone' },
  {key:'urologique', label: 'Urologique', color: 'text-cyan-500', icon: 'fa-kidneys' },
  {key:'gynécologique', label: 'Gynécologique', color: 'text-fuchsia-500', icon: 'fa-venus' },
  {key:'autres', label: 'Autres', color: 'text-gray-400', icon: 'fa-asterisk' },
];

const TAGS = ['Hospitalisé', 'Décédé', 'Sorti', 'Décharge', 'Fuite', 'Au bloc'];
const AUTH_USER_KEY = 'ashboard_user';
const SAVED_LOGIN_KEY = 'ashboard_saved_login';

let currentUserEmail = localStorage.getItem(AUTH_USER_KEY) || null;
let loginEmailPrefill = '';

function saveToStorage() { storage.set('med_dashboard_data_v2', patients); }

function getSavedLoginCredentials() {
  return storage.get(SAVED_LOGIN_KEY, null);
}

function saveLoginCredentials(email, password) {
  storage.set(SAVED_LOGIN_KEY, { email, password });
}

function clearSavedLoginCredentials() {
  storage.remove(SAVED_LOGIN_KEY);
}

function getCurrentUserEmail() { return localStorage.getItem(AUTH_USER_KEY) || null; }

function setCurrentUser(email) {
  currentUserEmail = email;
  localStorage.setItem(AUTH_USER_KEY, email);
}

function clearCurrentUser() {
  currentUserEmail = null;
  localStorage.removeItem(AUTH_USER_KEY);
  clearToken();
}

function getStoredAccounts() {
  return storage.get('ashboard_accounts', {});
}

function saveLocalAccount(email, password) {
  const accounts = getStoredAccounts();
  accounts[email.toLowerCase()] = password;
  storage.set('ashboard_accounts', accounts);
}

function validateLocalAccount(email, password) {
  const accounts = getStoredAccounts();
  return accounts[email.toLowerCase()] === password;
}

function calcPA(nbCig, anneeDebut) {
  const n = parseFloat(nbCig);
  const y = parseInt(anneeDebut, 10);
  if (!Number.isFinite(n) || !Number.isFinite(y) || y <= 0) return '';
  const years = new Date().getFullYear() - y;
  if (years <= 0) return '';
  const pa = (n / 20) * years;
  return Math.round(pa);
}

function openModal(evIdx, fieldKey) {
  const p = patients.find((x) => x.id === currentPatientId);
  if (!p || !p.evolution || !p.evolution[evIdx]) return;
  
  const ev = p.evolution[evIdx];
  const value = ev[fieldKey] || '';
  
  // Store context
  currentModalCtx = { idx: evIdx, key: fieldKey, subKey: null };
  modalViewMode = 'edit';
  
  // Update modal title
  const titleMap = {
    functional: 'Signes Fonctionnels',
    cat: 'Conclusion & CAT',
  };
  document.getElementById('modalTitle').textContent = titleMap[fieldKey] || 'Édition';
  
  // Set textarea value
  const textarea = document.getElementById('modalTextarea');
  textarea.value = value;
  textarea.classList.remove('hidden');
  
  // Set preview
  const preview = document.getElementById('modalPreview');
  preview.textContent = value;
  preview.classList.add('hidden');
  
  // Update button styles
  setModalMode('edit');
  
  // Show modal
  document.getElementById('modalExpand').classList.add('open');
}

function closeModal() {
  const p = patients.find((x) => x.id === currentPatientId);
  if (!p) return;
  
  // Save changes
  if (currentModalCtx.idx !== null && currentModalCtx.key) {
    const textarea = document.getElementById('modalTextarea');
    if (p.evolution && p.evolution[currentModalCtx.idx]) {
      p.evolution[currentModalCtx.idx][currentModalCtx.key] = textarea.value;
      saveToStorage();
      renderDetail();
    }
  }
  
  // Reset context
  currentModalCtx = { idx: null, key: null, subKey: null };
  
  // Hide modal
  document.getElementById('modalExpand').classList.remove('open');
}

function setModalMode(mode) {
  modalViewMode = mode;
  const textarea = document.getElementById('modalTextarea');
  const preview = document.getElementById('modalPreview');
  const btnEdit = document.getElementById('btnEditMode');
  const btnRead = document.getElementById('btnViewMode');
  
  if (mode === 'edit') {
    textarea.classList.remove('hidden');
    preview.classList.add('hidden');
    
    btnEdit.classList.add('bg-white', 'shadow-sm', 'text-gray-800');
    btnEdit.classList.remove('text-gray-500');
    btnRead.classList.remove('bg-white', 'shadow-sm', 'text-gray-800');
    btnRead.classList.add('text-gray-500');
  } else {
    textarea.classList.add('hidden');
    preview.classList.remove('hidden');
    preview.textContent = textarea.value;
    
    btnRead.classList.add('bg-white', 'shadow-sm', 'text-gray-800');
    btnRead.classList.remove('text-gray-500');
    btnEdit.classList.remove('bg-white', 'shadow-sm', 'text-gray-800');
    btnEdit.classList.add('text-gray-500');
  }
}

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

function showListView() {
  currentView = 'dashboard';
  renderCurrentView();
}

function showDetailView(id) {
  currentView = 'detail';
  currentPatientId = id;
  renderCurrentView();
  renderDetail();
}

function toggleMenu() {
  const menu = document.getElementById('mainMenu');
  const hamburger = document.querySelector('.hamburger-icon');
  if (!menu) return;
  
  const isVisible = menu.style.opacity === '1';
  
  if (isVisible) {
    menu.style.opacity = '0';
    menu.style.pointerEvents = 'none';
  } else {
    menu.style.opacity = '1';
    menu.style.pointerEvents = 'auto';
  }
  
  if (hamburger) {
    hamburger.classList.toggle('active');
  }
}

function openPage(page) {
  console.log('[openPage] Called with page:', page);
  if (!isAuthenticated() && page !== 'login' && page !== 'register') {
    page = 'login';
  }
  currentView = page;
  console.log('[openPage] currentView updated to:', currentView);
  renderCurrentView();
  
  const menu = document.getElementById('mainMenu');
  const hamburger = document.querySelector('.hamburger-icon');
  
  if (menu && menu.style.opacity === '1') {
    menu.style.opacity = '0';
    menu.style.pointerEvents = 'none';
    if (hamburger) {
      hamburger.classList.remove('active');
    }
  }
}

async function handleLoginSubmit() {
  const emailInput = document.getElementById('loginEmail');
  const passwordInput = document.getElementById('loginPassword');
  const rememberCheckbox = document.getElementById('rememberMe');
  const errorEl = document.getElementById('authError');
  if (!emailInput || !passwordInput || !errorEl) return;

  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;
  const remember = rememberCheckbox?.checked;

  if (!email || !password) {
    errorEl.textContent = 'Veuillez fournir votre e-mail et votre mot de passe.';
    return;
  }

  try {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await fetch(`/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Identifiants invalides');
    }

    const result = await response.json();
    saveToken(result.access_token);
    setCurrentUser(email);
    if (remember) {
      saveLoginCredentials(email, password);
    } else {
      clearSavedLoginCredentials();
    }
    
    // Load user data and check CGU status
    try {
      const profile = await apiRequest('/api/user/profile');
      currentUserData = profile;
      if (!profile.cgu_accepted) {
        showCGUModal = true;
      }
    } catch (err) {
      console.warn('Impossible de charger le profil utilisateur', err);
    }
    
    currentView = 'dashboard';
    loginEmailPrefill = '';
    renderCurrentView();
  } catch (err) {
    errorEl.textContent = 'Identifiant ou mot de passe incorrect.';
  }
}

async function handleRegisterSubmit() {
  const emailInput = document.getElementById('registerEmail');
  const passwordInput = document.getElementById('registerPassword');
  const confirmInput = document.getElementById('registerConfirmPassword');
  const errorEl = document.getElementById('authError');
  if (!emailInput || !passwordInput || !confirmInput || !errorEl) return;

  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;
  const confirmPassword = confirmInput.value;

  if (!email || !password || !confirmPassword) {
    errorEl.textContent = 'Veuillez remplir tous les champs.';
    return;
  }

  if (password !== confirmPassword) {
    errorEl.textContent = 'Les mots de passe ne correspondent pas.';
    return;
  }

  try {
    const result = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name: email }),
    });

    loginEmailPrefill = email;
    currentView = 'login';
    renderCurrentView();

    const loginErrorEl = document.getElementById('authError');
    if (loginErrorEl) {
      const message = result.detail || 'Votre compte a été créé. Vérifiez votre e-mail pour activer votre compte.';
      loginErrorEl.classList.remove('text-red-500');
      loginErrorEl.classList.add('text-teal-700');
      if (result.verification_url) {
        loginErrorEl.innerHTML = `${message} <a href="${result.verification_url}" class="text-teal-700 underline">Cliquez ici pour vérifier votre compte</a>`;
      } else {
        loginErrorEl.textContent = message;
      }
    }
  } catch (err) {
    errorEl.classList.remove('text-teal-700');
    errorEl.classList.add('text-red-500');
    errorEl.textContent = err.message || 'Impossible de créer le compte.';
  }
}

async function loadProfile() {
  try {
    const profile = await apiRequest('/api/user/profile');
    currentUserData = profile;
    
    // Check if CGU needs to be accepted
    if (!profile.cgu_accepted) {
      showCGUModal = true;
      displayCGUModal();
    }

    const nameInput = document.getElementById('profileName');
    const emailInput = document.getElementById('profileEmail');
    const studyLevel = document.getElementById('profileStudyLevel');
    const institution = document.getElementById('profileInstitution');

    if (nameInput) nameInput.value = profile.full_name || '';
    if (emailInput) emailInput.value = profile.email || '';
    if (studyLevel) studyLevel.value = profile.study_level || '6ème année';
    if (institution) institution.value = profile.institution || '';
  } catch (err) {
    console.error('Impossible de charger le profil', err);
  }
}

async function saveProfile() {
  const messageEl = document.getElementById('profileMessage');
  const nameInput = document.getElementById('profileName');
  const studyLevel = document.getElementById('profileStudyLevel');
  const institution = document.getElementById('profileInstitution');

  if (!nameInput || !studyLevel || !institution || !messageEl) return;

  try {
    const updated = await apiRequest('/api/user/profile', {
      method: 'PATCH',
      body: JSON.stringify({
        full_name: nameInput.value.trim(),
        study_level: studyLevel.value,
        institution: institution.value.trim(),
      }),
    });

    messageEl.textContent = 'Profil mis à jour avec succès.';
    messageEl.classList.remove('hidden');
    messageEl.classList.remove('text-red-500');
    messageEl.classList.add('text-teal-700');
    setTimeout(() => messageEl.classList.add('hidden'), 3000);
  } catch (err) {
    messageEl.textContent = err.message || 'Impossible de sauvegarder le profil.';
    messageEl.classList.remove('hidden');
    messageEl.classList.remove('text-teal-700');
    messageEl.classList.add('text-red-500');
  }
}

function displayCGUModal() {
  const app = document.getElementById('app');
  if (!app) return;
  const modalHtml = renderCGUModal();
  const modalDiv = document.createElement('div');
  modalDiv.id = 'cguModalContainer';
  modalDiv.innerHTML = modalHtml;
  app.appendChild(modalDiv);
}

async function acceptCGU() {
  try {
    await apiRequest('/api/user/accept-cgu', { method: 'POST' });
    if (currentUserData) {
      currentUserData.cgu_accepted = true;
    }
    const modalContainer = document.getElementById('cguModalContainer');
    if (modalContainer) {
      modalContainer.remove();
    }
    showCGUModal = false;
  } catch (err) {
    alert('Erreur lors de l\'enregistrement de votre consentement.');
    console.error(err);
  }
}

function rejectCGU() {
  alert('Vous devez accepter les CGU pour continuer.');
  handleLogout();
}

function openLegalPage() {
  currentView = 'legal';
  renderCurrentView();
}

function showLoginPage() {
  loginEmailPrefill = loginEmailPrefill || '';
  currentView = 'login';
  renderCurrentView();
}

function showRegisterPage() {
  currentView = 'register';
  renderCurrentView();
}

function handleGoogleLogin() {
  const redirectUri = window.location.origin;
  window.location.href = `/api/auth/google/login?redirect_uri=${encodeURIComponent(redirectUri)}`;
}

async function processGoogleAuthCode() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  if (!code) {
    return;
  }

  const errorEl = document.getElementById('authError');
  try {
    const response = await fetch(`/api/auth/google/callback?code=${encodeURIComponent(code)}&redirect_uri=${encodeURIComponent(window.location.origin)}`);
    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      throw new Error(payload?.detail || 'La connexion Google a échoué.');
    }

    const result = await response.json();
    if (!result.access_token || !result.email) {
      throw new Error('Réponse invalide du serveur de connexion.');
    }

    saveToken(result.access_token);
    setCurrentUser(result.email);
    window.history.replaceState({}, document.title, window.location.pathname);
    currentView = 'dashboard';
    renderCurrentView();
    // If server returned a temporary password (created at signup), show it to the user
    if (result.temp_password) {
      const msg = `Compte créé avec succès. Mot de passe temporaire : ${result.temp_password} — changez-le dans les paramètres.`;
      const errorEl = document.getElementById('authError');
      if (errorEl) {
        errorEl.textContent = msg;
      } else {
        alert(msg);
      }
    }
  } catch (err) {
    if (errorEl) {
      errorEl.textContent = err.message || 'La connexion Google a échoué.';
    }
  }
}

function togglePasswordVisibility(inputId = 'loginPassword', toggleButtonId = 'togglePasswordButton') {
  const passwordInput = document.getElementById(inputId);
  const toggleButton = document.getElementById(toggleButtonId);
  if (!passwordInput || !toggleButton) return;

  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    toggleButton.textContent = 'Masquer';
  } else {
    passwordInput.type = 'password';
    toggleButton.textContent = 'Afficher';
  }
}

function handleLogout() {
  clearCurrentUser();
  currentView = 'login';
  renderCurrentView();
}

function handleBackButton() {
  if (currentView === 'detail') {
    showListView();
  } else {
    openPage('dashboard');
  }
}

function renderCurrentView() {
  console.log('[renderCurrentView] Starting, currentView:', currentView);
  const list = document.getElementById('listView');
  const detail = document.getElementById('detailView');
  const pageView = document.getElementById('pageView');
  const backBtn = document.getElementById('backBtn');
  const appHeader = document.getElementById('appHeader');
  const mainMenu = document.getElementById('mainMenu');
  if (!list || !detail || !pageView || !backBtn || !appHeader || !mainMenu) {
    console.error('[renderCurrentView] Missing DOM elements:', {
      list: !!list,
      detail: !!detail,
      pageView: !!pageView,
      backBtn: !!backBtn,
      appHeader: !!appHeader,
      mainMenu: !!mainMenu,
    });
    return;
  }

  list.classList.add('hidden');
  detail.classList.add('hidden');
  pageView.classList.add('hidden');
  appHeader.classList.toggle('hidden', currentView === 'login' || currentView === 'register');
  if (currentView === 'login' || currentView === 'register') {
    mainMenu.style.opacity = '0';
    mainMenu.style.pointerEvents = 'none';
  }

  if (!isAuthenticated() && currentView !== 'login' && currentView !== 'register') {
    currentView = 'login';
  }

  if (currentView === 'dashboard') {
    console.log('[renderCurrentView] Showing dashboard');
    list.classList.remove('hidden');
    backBtn.classList.add('hidden');
    renderList();
    return;
  }

  if (currentView === 'detail') {
    console.log('[renderCurrentView] Showing detail');
    detail.classList.remove('hidden');
    backBtn.classList.remove('hidden');
    backBtn.innerHTML = '<i class="fa-solid fa-arrow-left mr-1"></i> RETOUR';
    return;
  }

  if (currentView === 'login') {
    console.log('[renderCurrentView] Showing login page');
    pageView.classList.remove('hidden');
    backBtn.classList.add('hidden');
    const savedLogin = getSavedLoginCredentials();
    const prefillEmail = loginEmailPrefill || savedLogin?.email || getCurrentUserEmail() || '';
    const prefillPassword = savedLogin?.password || '';
    const remember = Boolean(savedLogin?.email && savedLogin?.password);
    pageView.innerHTML = renderLoginPage(prefillEmail, prefillPassword, remember);
    return;
  }

  if (currentView === 'register') {
    console.log('[renderCurrentView] Showing register page');
    pageView.classList.remove('hidden');
    backBtn.classList.add('hidden');
    pageView.innerHTML = renderRegisterPage();
    return;
  }

  console.log('[renderCurrentView] Showing page:', currentView);
  pageView.classList.remove('hidden');
  backBtn.classList.remove('hidden');
  backBtn.innerHTML = '<i class="fa-solid fa-arrow-left mr-1"></i> RETOUR';
  if (currentView === 'profile') {
    console.log('[renderCurrentView] Rendering profile page');
    pageView.innerHTML = renderProfilePage();
    loadProfile();
  } else if (currentView === 'settings') {
    console.log('[renderCurrentView] Rendering settings page');
    pageView.innerHTML = renderSettingsPage();
  } else if (currentView === 'legal') {
    console.log('[renderCurrentView] Rendering legal page');
    pageView.innerHTML = renderLegalPage();
  } else {
    console.log('[renderCurrentView] Rendering about page');
    pageView.innerHTML = renderAboutPage();
  }

  // Show CGU modal if needed
  if (showCGUModal) {
    displayCGUModal();
  }
}

function createNewPatient() {
  const id = Date.now();
  const today = new Date().toISOString().split('T')[0];
  const newPatient = {
    id,
    room: '',
    bed: '',
    tag: 'Hospitalisé',
    clinicalPriority: 3,
    assignedTo: '',
    identity: { name: '', sex: 'M', age: '' },
    admission: { date: today, reason: '', histoireMaladie: '' },
    history: {
      medical: '',
      allergic: '',
      tabac: { nbCig: '', anneeDebut: '' },
      alcool: '',
      drogues: '',
      gpa: { g: '', p: '', a: '', living: '' },
    },
    diagnostics: '',
    diagnosticsDiff: ['', '', ''],
    diagnosticsDiffPrecision: [null, null, null],
    evolution: [],
    treatments: [],
    paraclinics: [],
    tasks: [],
  };
  patients.push(newPatient);
  saveToStorage();
  showDetailView(id);
}

function switchTab(tabId) { activeTabId = tabId; renderDetail(); }

function setEvolutionMode(mode) { evolutionViewMode = mode; renderDetail(); }



function addTask() {

  const p = patients.find((x) => x.id === currentPatientId);

  if (!p.tasks) p.tasks = [];

  p.tasks.unshift({ id: Date.now(), text: '', date: new Date().toISOString().split('T')[0], time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), dueDate: '', dueTime: '', completed: false, reminded: false });

  saveToStorage();
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

function openShareCurrentPatient() { openShareModal(currentPatientId); }

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






function updateP(key, val) { patients.find((x) => x.id === currentPatientId)[key] = val; saveToStorage(); }

function updateIdentity(key, val) { patients.find((x) => x.id === currentPatientId).identity[key] = val; saveToStorage(); }

function updateHistory(key, val) { patients.find((x) => x.id === currentPatientId).history[key] = val; saveToStorage(); }

function updateGPA(key, val) { patients.find((x) => x.id === currentPatientId).history.gpa[key] = val; saveToStorage(); }

function updateAdmission(key, val) { patients.find((x) => x.id === currentPatientId).admission[key] = val; saveToStorage(); }

function updateEv(idx, key, val) { patients.find((x) => x.id === currentPatientId).evolution[idx][key] = val; saveToStorage(); }

function updateExam(idx, sys, val) { patients.find((x) => x.id === currentPatientId).evolution[idx].exam[sys] = val; saveToStorage(); }

function updateTr(idx, key, val) { patients.find((x) => x.id === currentPatientId).treatments[idx][key] = val; saveToStorage(); }

function updatePa(idx, key, val) { patients.find((x) => x.id === currentPatientId).paraclinics[idx][key] = val; saveToStorage(); }

function updateDiff(idx, val) { const p = patients.find((x) => x.id === currentPatientId); if (!p.diagnosticsDiff) p.diagnosticsDiff = ['', '', '']; p.diagnosticsDiff[idx] = val; saveToStorage(); }



function addVitalEntry(evIdx) {

  const p = patients.find((x) => x.id === currentPatientId);
  p.evolution[evIdx].vitals.push({ time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), temp: '', fc: '', fr: '', tasG: '', tadG: '', tasD: '', tadD: '', spo2: '', spo2Mode: 'aa', debitO2: '', diurese: '', poids: '', taille: '' });

  saveToStorage();
  renderDetail();

}



function updateVit(evIdx, vIdx, key, val) { patients.find((x) => x.id === currentPatientId).evolution[evIdx].vitals[vIdx][key] = val; saveToStorage(); }



function addEvolution() {

  const p = patients.find((x) => x.id === currentPatientId);
  p.evolution.unshift({ date: new Date().toISOString().split('T')[0], time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), vitals: [], functional: '', signesPhysiques: { general: '', neuro: '', cardio: '', pneumo: '', digestif: '', autre: '' }, exam: {}, complications: '', conclusion: '', cat: '' });

  saveToStorage();
  renderDetail();

}



function addTreatment() {

  const p = patients.find((x) => x.id === currentPatientId);
  p.treatments.unshift({ name: '', dosage: '', form: '', stopped: false, stoppedDate: null, startDate: new Date().toISOString().split('T')[0], endDate: '', adherence: [] });

  saveToStorage();
  renderDetail();

}



function addPara(cat) { const p = patients.find((x) => x.id === currentPatientId); p.paraclinics.unshift({ type: '', val: '', date: new Date().toISOString().split('T')[0], isBio: cat === 'bio', paraTag: '' }); saveToStorage(); renderDetail(); }

function removeTr(idx) { patients.find((x) => x.id === currentPatientId).treatments.splice(idx, 1); saveToStorage(); renderDetail(); }

function removeVital(evIdx, vIdx) { patients.find((x) => x.id === currentPatientId).evolution[evIdx].vitals.splice(vIdx, 1); saveToStorage(); renderDetail(); }

function removeEv(idx) { if (confirm('Supprimer ?')) { patients.find((x) => x.id === currentPatientId).evolution.splice(idx, 1); saveToStorage(); renderDetail(); } }

function removePa(idx) { patients.find((x) => x.id === currentPatientId).paraclinics.splice(idx, 1); saveToStorage(); renderDetail(); }

function saveCurrentPatient() { saveToStorage(); }

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

<header id="appHeader" class="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100/80 px-3 sm:px-4 py-3 transition-colors duration-300 w-full">
  <div class="max-w-4xl mx-auto flex justify-between items-center gap-2 sm:gap-4">
    
    <div class="flex-1 min-w-0">
      <h1 class="text-base font-bold tracking-tight text-gray-900 flex items-center gap-1.5 sm:gap-2">
        <span class="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-50 text-blue-600 shadow-sm border border-blue-100/50 shrink-0">
          <i class="fa-solid fa-staff-snake text-sm"></i>
        </span>
        <span class="font-black tracking-tight truncate text-sm sm:text-base">Ash-board</span>
        <span class="text-[9px] sm:text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded shrink-0">V1.0.0</span>
      </h1>
      <p class="hidden md:block text-[10px] text-gray-400 font-semibold tracking-wide uppercase mt-1">
        Outils de gestion et de prise en charge optimale des patients
      </p>
      <p class="block md:hidden text-[9px] text-gray-400 font-bold tracking-wide uppercase mt-0.5 truncate">
        Gestion clinique
      </p>
    </div>

    <div class="flex items-center gap-1 sm:gap-2 shrink-0">
      
      <button onclick="handleBackButton()" id="backBtn" class="hidden h-9 sm:h-10 px-2.5 sm:px-3 items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-black uppercase tracking-wider text-gray-500 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 active:scale-[0.97]" title="Retour">
        <i class="fa-solid fa-arrow-left text-xs"></i>
        <span class="hidden xs:inline">Retour</span>
      </button>

      <button onclick="toggleDarkMode()" class="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all duration-200 active:scale-[0.95]" title="Mode Sombre">
        <i id="themeIcon" class="fa-solid fa-moon text-base sm:text-lg"></i>
      </button>

      <button onclick="toggleMenu()" id="menuButton" class="relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all duration-200 active:scale-[0.95]" title="Menu">
        <span class="hamburger-icon">
          <span></span>
          <span></span>
          <span></span>
        </span>
      </button>
      
    </div>

  </div>
</header>



    <div id="mainMenu" class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" style="opacity: 0; pointer-events: none; transition: opacity 0.3s ease;">
      <!-- Backdrop Overlay (MUST be before menu-sidebar for proper z-order) -->
      <button onclick="toggleMenu()" class="absolute inset-0 bg-transparent cursor-default"></button>

      <div class="absolute left-0 top-0 h-full w-[280px] bg-white menu-sidebar" style="box-shadow: 0 0 0 transparent; transition: box-shadow 0.3s ease;">
        <!-- Menu Header -->
        <div class="menu-header py-6 px-4 border-b border-gray-100">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <div class="text-xs font-bold uppercase tracking-[0.24em] text-gray-400 mb-1">Navigation</div>
              <h2 class="text-lg font-bold text-gray-900">Menu</h2>
            </div>
            <button onclick="toggleMenu()" class="ml-4 p-2 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors">
              <i class="fa-solid fa-xmark text-xl"></i>
            </button>
          </div>
        </div>

        <!-- Menu Navigation -->
        <nav class="menu-nav py-6 px-2 space-y-2">
  <button data-page="dashboard" class="menu-link w-full text-left p-3 rounded-2xl flex items-center gap-4 group hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100 transition-all active:scale-[0.98]">
    <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center group-hover:shadow-inner transition-all border border-blue-50/50">
      <i class="fa-solid fa-hospital-user text-blue-600 text-lg group-hover:scale-110 transition-transform"></i>
    </div>
    <div class="flex-1">
      <span class="block text-sm font-black text-gray-800 tracking-tight">Tableau de bord</span>
      <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Gérer les patients</span>
    </div>
    <i class="fa-solid fa-chevron-right text-gray-300 text-xs opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"></i>
  </button>

  <button data-page="profile" class="menu-link w-full text-left p-3 rounded-2xl flex items-center gap-4 group hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100 transition-all active:scale-[0.98]">
    <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center group-hover:shadow-inner transition-all border border-teal-50/50">
      <i class="fa-solid fa-user-doctor text-teal-600 text-lg group-hover:scale-110 transition-transform"></i>
    </div>
    <div class="flex-1">
      <span class="block text-sm font-black text-gray-800 tracking-tight">Mon profil</span>
      <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Statistiques & Ego</span>
    </div>
    <i class="fa-solid fa-chevron-right text-gray-300 text-xs opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"></i>
  </button>

  <button data-page="settings" class="menu-link w-full text-left p-3 rounded-2xl flex items-center gap-4 group hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100 transition-all active:scale-[0.98]">
    <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center group-hover:shadow-inner transition-all border border-amber-50/50">
      <i class="fa-solid fa-gears text-amber-600 text-lg group-hover:rotate-90 transition-transform duration-500"></i>
    </div>
    <div class="flex-1">
      <span class="block text-sm font-black text-gray-800 tracking-tight">Paramètres</span>
      <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Configuration système</span>
    </div>
    <i class="fa-solid fa-chevron-right text-gray-300 text-xs opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"></i>
  </button>

  <button data-page="about" class="menu-link w-full text-left p-3 rounded-2xl flex items-center gap-4 group hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100 transition-all active:scale-[0.98]">
    <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center group-hover:shadow-inner transition-all border border-purple-50/50">
      <i class="fa-solid fa-staff-snake text-purple-600 text-lg group-hover:scale-110 transition-transform"></i>
    </div>
    <div class="flex-1">
      <span class="block text-sm font-black text-gray-800 tracking-tight">À propos</span>
      <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Mentions légales</span>
    </div>
    <i class="fa-solid fa-chevron-right text-gray-300 text-xs opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"></i>
  </button>
</nav>

        <!-- Menu Footer -->
        <div class="absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-gray-50 p-4">
          <p class="text-[10px] text-gray-500 text-center uppercase tracking-[0.16em]">© 2026 Ash-board</p>
        </div>
      </div>
    </div>

    <main class="p-4 max-w-4xl mx-auto min-h-screen">

      ${renderDashboardPage()}

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

          <button onclick="openShareCurrentPatient()" class="bg-blue-50 text-blue-600 px-4 py-3 rounded-xl hover:bg-blue-100 transition" title="Partager / Télécharger"><i class="fa-solid fa-share-nodes"></i></button>

          <button onclick="deleteCurrentPatient()" class="bg-white border border-red-100 text-red-500 px-4 py-3 rounded-xl hover:bg-red-50 transition"><i class="fa-solid fa-trash"></i></button>

        </div>

      </div>

      <div id="pageView" class="hidden"></div>

    </main>




   <footer class="text-center py-10 border-t border-gray-100 mt-12 space-y-2">
  <div class="flex items-center justify-center gap-2">
    <span class="w-6 h-[1px] bg-gray-200"></span>
    <i class="fa-solid fa-terminal text-gray-300 text-[10px]"></i>
    <span class="w-6 h-[1px] bg-gray-200"></span>
  </div>
  <p class="text-[9px] font-black uppercase tracking-[0.25em] text-gray-400">
    &copy; 2026 &bull; Propulsé par <span class="text-gray-700 font-black tracking-tight hover:text-teal-500 transition-colors cursor-pointer">Ash-Code</span>
  </p>
 
</footer>



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

  renderCurrentView();

  attachMenuHandlers();

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



function attachMenuHandlers() {
  const mainMenu = document.getElementById('mainMenu');
  console.log('[attachMenuHandlers] mainMenu element found:', !!mainMenu);
  if (!mainMenu) {
    console.error('[attachMenuHandlers] mainMenu element NOT found!');
    return;
  }

  mainMenu.addEventListener('click', (event) => {
    console.log('[menu click event]', event.target.tagName, event.target.getAttribute('data-page'));
    
    const pageButton = event.target.closest('[data-page]');
    if (pageButton) {
      const page = pageButton.dataset.page;
      console.log('[menu] Page button clicked:', page);
      if (page) {
        console.log('[menu] Calling openPage with:', page);
        openPage(page);
      }
      return;
    }

    const actionButton = event.target.closest('[data-action="toggle-menu"]');
    if (actionButton) {
      toggleMenu();
    }
  });
  console.log('[attachMenuHandlers] Event listener attached successfully');
}

async function initializeApp() {

  renderApp();
  attachMenuHandlers();

  await processGoogleAuthCode();
  currentView = isAuthenticated() ? 'dashboard' : 'login';

  if (patients.length) {
    currentPatientId = patients[0].id;
    renderDetail();
  }

  renderCurrentView();
}



Object.assign(window, {

  toggleDarkMode,

  toggleMenu,

  openPage,

  handleBackButton,

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

  openShareCurrentPatient,

  handleLoginSubmit,
  handleRegisterSubmit,
  showLoginPage,
  showRegisterPage,
  handleGoogleLogin,
  handleLogout,
  togglePasswordVisibility,
  saveProfile,
  acceptCGU,
  rejectCGU,
  openLegalPage,
  displayCGUModal,

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




