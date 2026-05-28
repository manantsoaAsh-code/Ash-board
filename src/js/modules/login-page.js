export function renderLoginPage(email = '') {
  return `
   <section class="max-w-md mx-auto py-16 px-4">
  <div class="bg-white rounded-[32px] border border-gray-100 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.04)] p-8 space-y-6">
    
    <div class="text-center space-y-2">
      <h1 class="text-lg font-semibold tracking-tight text-gray-900"><i class="fa-solid fa-staff-snake text-blue-500 mr-2"></i>Ash-board <span class="text-gray-400">V1.0.0</span></h1>
      <p class="text-xs text-gray-400 font-medium tracking-normal">Portail d'authentification sécurisé. Accédez à votre espace clinique.</p>
    </div>

    <div id="authError" class="min-h-[1.5rem] text-xs font-bold text-red-500 text-center bg-red-50/50 rounded-xl flex items-center justify-center empty:hidden px-3 py-1"></div>

    <div class="space-y-5">
      <div class="space-y-2">
        <label class="block text-[10px] uppercase tracking-[0.25em] text-gray-400 font-black">Adresse e-mail</label>
        <div class="relative">
          <input id="loginEmail" type="email" value="${email}" placeholder="firstuser@gmail.com" class="w-full rounded-2xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm outline-none transition-all duration-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 font-medium text-gray-800" />
        </div>
      </div>

      <div class="space-y-2">
        <label class="block text-[10px] uppercase tracking-[0.25em] text-gray-400 font-black">Mot de passe</label>
        <div class="relative">
          <input id="loginPassword" type="password" placeholder="1234" class="w-full rounded-2xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm outline-none transition-all duration-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 font-medium text-gray-800" />
        </div>
      </div>
    </div>

    <div class="space-y-3 pt-2">
      <button onclick="handleLoginSubmit()" class="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-2xl py-3.5 text-xs font-black uppercase tracking-widest hover:from-blue-700 hover:to-blue-600 transition-all duration-200 shadow-lg shadow-blue-500/15 active:scale-[0.99]">
        Se connecter
      </button>
    </div>

    <div class="relative flex py-2 items-center">
      <div class="flex-grow border-t border-gray-100"></div>
      <span class="flex-shrink mx-4 text-[10px] font-bold text-gray-300 uppercase tracking-widest">ou</span>
      <div class="flex-grow border-t border-gray-100"></div>
    </div>

    <div class="space-y-4">
      <button onclick="handleGoogleLogin()" class="w-full flex items-center justify-center gap-3 border border-gray-200 bg-white rounded-2xl py-3 text-xs font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 active:scale-[0.99]">
        <svg class="w-4 h-4" viewBox="0 0 24 24">
          <path fill="#EA4335" d="M12 5.04c1.64 0 3.12.56 4.28 1.67l3.2-3.2C17.52 1.58 14.96 1 12 1 7.35 1 3.39 3.67 1.5 7.56l3.76 2.92C6.15 7.24 8.85 5.04 12 5.04z"/>
          <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.44c-.28 1.47-1.11 2.71-2.36 3.55l3.66 2.84c2.14-1.97 3.39-4.87 3.39-8.54z"/>
          <path fill="#FBBC05" d="M5.26 14.52c-.24-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29L1.5 7.02C.54 8.94 0 11.07 0 13.33s.54 4.39 1.5 6.31l3.76-3.12z"/>
          <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.92l-3.66-2.84c-1.01.68-2.31 1.08-4.3 1.08-3.15 0-5.85-2.2-6.81-5.44L1.44 15.96C3.33 19.89 7.3 22.5 12 23z"/>
        </svg>
        Continuer avec Google
      </button>
      
      <button onclick="showRegisterPage()" class="w-full text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors py-2 text-center block">
        Créer un nouveau compte
      </button>
    </div>

  </div>
</section>
  `;
}

export function renderRegisterPage() {
  return `
    <section class="max-w-md mx-auto py-16 px-4">
      <div class="bg-white rounded-[32px] shadow-2xl p-8 space-y-6">
        <div class="text-center space-y-2">
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-emerald-50 text-emerald-600 mx-auto">
            <i class="fa-solid fa-user-plus text-2xl"></i>
          </div>
          <h1 class="text-2xl font-black text-gray-900">Créer un compte</h1>
          <p class="text-sm text-gray-500">Enregistrez un compte local pour tester l’application.</p>
        </div>

        <div id="authError" class="min-h-[1.2rem] text-sm font-semibold text-red-500"></div>

        <div class="space-y-4">
          <label class="block text-[10px] uppercase tracking-[0.35em] text-gray-400 font-bold">Adresse e-mail</label>
          <input id="registerEmail" type="email" placeholder="votre@email.com" class="w-full rounded-3xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-200" />
        </div>

        <div class="space-y-4">
          <label class="block text-[10px] uppercase tracking-[0.35em] text-gray-400 font-bold">Mot de passe</label>
          <input id="registerPassword" type="password" placeholder="••••••••" class="w-full rounded-3xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-200" />
        </div>

        <div class="space-y-4">
          <label class="block text-[10px] uppercase tracking-[0.35em] text-gray-400 font-bold">Confirmer le mot de passe</label>
          <input id="registerConfirmPassword" type="password" placeholder="••••••••" class="w-full rounded-3xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-200" />
        </div>

        <button onclick="handleRegisterSubmit()" class="w-full bg-emerald-600 text-white rounded-3xl py-3 text-sm font-bold uppercase tracking-[0.08em] hover:bg-emerald-700 transition">Créer le compte</button>

        <button onclick="showLoginPage()" class="w-full text-sm font-semibold text-blue-600 hover:text-blue-700 transition">Retour à la connexion</button>
      </div>
    </section>
  `;
}
