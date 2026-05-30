export function renderCGUModal() {
  return `
    <div id="cguModal" class="fixed inset-0 z-[999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4" style="display: flex;">
      <div class="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        
        <!-- Header -->
        <div class="bg-gradient-to-r from-blue-600 to-teal-600 px-6 py-6 text-white">
          <h2 class="text-2xl font-black tracking-tight">CGU & Mentions Légales</h2>
          <p class="text-blue-100 text-sm mt-2">Veuillez lire et accepter les conditions d'utilisation</p>
        </div>

        <!-- Scrollable Content -->
        <div class="overflow-y-auto flex-1 px-6 py-6 space-y-6 text-sm leading-relaxed text-gray-700">
          
          <!-- MENTIONS LÉGALES -->
          <section>
            <h3 class="text-lg font-black text-gray-900 mb-3 flex items-center gap-2">
              <i class="fa-solid fa-file-contract text-blue-600"></i>
              Mentions Légales
            </h3>
            
            <div class="space-y-4 text-xs">
              <div>
                <h4 class="font-bold text-gray-900 mb-1">1. Édition de l'application</h4>
                <p class="text-gray-600">L'application <strong>Ashboard</strong> est développée, éditée et propulsée par la team <strong>Ash-Code</strong>, dirigée par RAHARIMANANTSOA Herivola.</p>
                <p class="text-gray-600 mt-1"><strong>Contact :</strong> herivolapro@gmail.com</p>
              </div>

              <div>
                <h4 class="font-bold text-gray-900 mb-1">2. Parrainage scientifique</h4>
                <p class="text-gray-600">L'architecture logique et la méthodologie d'entraînement clinique intégrées à l'Application sont approuvées et parrainées par le <strong>Pr Rakototiana Auberlin</strong>.</p>
              </div>

              <div>
                <h4 class="font-bold text-gray-900 mb-1">3. Hébergement et données</h4>
                <ul class="list-disc list-inside space-y-1 text-gray-600">
                  <li><strong>Authentification :</strong> Google OAuth</li>
                  <li><strong>Données Cliniques :</strong> Exclusivement stockées localement (LocalStorage) — aucun serveur centralisé</li>
                </ul>
              </div>

              <div>
                <h4 class="font-bold text-gray-900 mb-1">4. Propriété intellectuelle</h4>
                <p class="text-gray-600">Tous les composants de l'Application (code, design, marque) sont la propriété exclusive de la team <strong>Ash-Code</strong>. Toute reproduction non autorisée est strictement interdite.</p>
              </div>
            </div>
          </section>

          <hr class="border-gray-200">

          <!-- CONDITIONS GÉNÉRALES D'UTILISATION -->
          <section>
            <h3 class="text-lg font-black text-gray-900 mb-3 flex items-center gap-2">
              <i class="fa-solid fa-gavel text-teal-600"></i>
              Conditions Générales d'Utilisation
            </h3>

            <div class="space-y-4 text-xs">
              <div>
                <h4 class="font-bold text-gray-900 mb-1">Article 1 : Acceptation des CGU</h4>
                <p class="text-gray-600">L'accès et l'utilisation de l'Application entraînent l'acceptation expresse, pleine et entière des présentes CGU. En vous connectant, vous reconnaissez avoir pris connaissance de ces conditions et vous y conformer.</p>
              </div>

              <div>
                <h4 class="font-bold text-gray-900 mb-1">Article 2 : Objet de l'Application (Avertissement Légal)</h4>
                <p class="text-gray-600"><strong>Ashboard est un outil exclusivement pédagogique.</strong></p>
                <ul class="list-disc list-inside space-y-1 text-gray-600 mt-2">
                  <li><strong>Absence de Responsabilité Médicale :</strong> L'Application ne constitue pas un dispositif médical homologué.</li>
                  <li><strong>Responsabilité de l'Utilisateur :</strong> Vous restez seul responsable juridique et déontologique des décisions cliniques en milieu hospitalier.</li>
                  <li>L'Application ou ses concepteurs ne sauraient être tenus responsables d'erreurs médicales commises sur le terrain.</li>
                </ul>
              </div>

              <div>
                <h4 class="font-bold text-gray-900 mb-1">Article 3 : Confidentialité et Secret Médical</h4>
                <ul class="list-disc list-inside space-y-1 text-gray-600">
                  <li>Utilisez des <strong>identifiants anonymisés</strong> pour l'entraînement.</li>
                  <li>Aucune donnée nominative ne transite sur les serveurs d'Ash-Code.</li>
                  <li>La sécurité physique de votre terminal relève de votre seule responsabilité.</li>
                </ul>
              </div>

              <div>
                <h4 class="font-bold text-gray-900 mb-1">Article 4 : Évolution du Service</h4>
                <p class="text-gray-600">Ash-Code se réserve le droit de modifier ou interrompre l'accès à l'Application sans préavis ni indemnité.</p>
              </div>

              <div>
                <h4 class="font-bold text-gray-900 mb-1">Article 5 : Droit Applicable</h4>
                <p class="text-gray-600">Les présentes CGU sont régies par le droit en vigueur. En cas de litige, les tribunaux compétents seront saisis.</p>
              </div>
            </div>
          </section>

        </div>

        <!-- Footer with Buttons -->
        <div class="border-t border-gray-100 px-6 py-4 bg-gray-50 flex gap-3">
          <button onclick="acceptCGU()" class="flex-1 bg-teal-600 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-teal-700 transition-all active:scale-[0.98]">
            <i class="fa-solid fa-check mr-2"></i>
            J'accepte les CGU
          </button>
          <button onclick="rejectCGU()" class="flex-1 bg-gray-200 text-gray-900 px-6 py-3 rounded-2xl font-bold text-sm hover:bg-gray-300 transition-all active:scale-[0.98]">
            <i class="fa-solid fa-xmark mr-2"></i>
            Refuser
          </button>
        </div>
      </div>
    </div>
  `;
}

export function renderLegalPage() {
  return `
    <section class="space-y-6 pb-24">
      <div class="px-1">
        <h2 class="text-2xl font-black text-gray-900 tracking-tight"><i class="fa-solid fa-scale-balanced text-blue-600 mr-2"></i>Mentions Légales & CGU</h2>
        <p class="text-[10px] text-gray-500 font-bold mt-1 uppercase tracking-wider">Dernière mise à jour : 30 mai 2026</p>
      </div>

      <!-- MENTIONS LÉGALES -->
      <div class="medical-card p-6 space-y-4">
        <h3 class="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
          <i class="fa-solid fa-file-contract text-blue-600"></i>
          Mentions Légales
        </h3>

        <div class="space-y-4 text-sm leading-relaxed text-gray-700">
          <div>
            <h4 class="font-bold text-gray-900 mb-2">1. Édition de l'application</h4>
            <p>L'application <strong>Ashboard</strong> est développée, éditée et propulsée par la team <strong>Ash-Code</strong>, dirigée par RAHARIMANANTSOA Herivola.</p>
            <p class="mt-2 text-gray-600"><strong>Contact Support & Partenariats :</strong> herivolapro@gmail.com</p>
          </div>

          <div>
            <h4 class="font-bold text-gray-900 mb-2">2. Parrainage et Validation Scientifique</h4>
            <p>L'architecture logique, la structure de gestion des dossiers patients et la méthodologie de simulation clinique intégrées à l'Application sont officiellement approuvées et parrainées par le <strong>Pr Rakototiana Auberlin</strong>.</p>
          </div>

          <div>
            <h4 class="font-bold text-gray-900 mb-2">3. Hébergement et Stockage des Données</h4>
            <ul class="list-disc list-inside space-y-2 ml-2">
              <li><strong>Authentification :</strong> L'infrastructure d'authentification sécurisée utilise les services de Google OAuth.</li>
              <li><strong>Données Cliniques :</strong> Fidèle au principe du secret médical et de la souveraineté des données de santé, l'Application n'héberge aucune donnée patient sur un serveur centralisé tiers. Toutes les données cliniques, dossiers, notes et diagnostics saisis par l'utilisateur sont <strong>exclusivement stockés localement</strong> dans la mémoire du navigateur ou du terminal de l'utilisateur (Local Auth / LocalStorage).</li>
            </ul>
          </div>

          <div>
            <h4 class="font-bold text-gray-900 mb-2">4. Propriété Intellectuelle</h4>
            <p>L'ensemble des composants de l'Application (code source JavaScript, architecture Tailwind CSS, design des interfaces, marque, logos et algorithmes) est la propriété exclusive de la team <strong>Ash-Code</strong>. Toute reproduction, modification ou distribution non autorisée du code ou des interfaces est strictement interdite.</p>
          </div>

          <div>
            <h4 class="font-bold text-gray-900 mb-2">5. Évolution et Disponibilité du Service</h4>
            <p>Ash-Code se réserve le droit de modifier, d'interrompre temporairement ou définitivement l'accès à tout ou partie de l'Application pour des raisons de maintenance technique ou de mise à jour clinique, sans préavis ni indemnité.</p>
          </div>

          <div>
            <h4 class="font-bold text-gray-900 mb-2">6. Droit Applicable</h4>
            <p>Les présentes mentions légales et CGU sont régies par le droit en vigueur. En cas de litige relatif à l'interprétation ou à l'exécution des présentes, et à défaut de résolution amiable, les tribunaux compétents seront saisis.</p>
          </div>
        </div>
      </div>

      <!-- CONDITIONS GÉNÉRALES D'UTILISATION -->
      <div class="medical-card p-6 space-y-4">
        <h3 class="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
          <i class="fa-solid fa-gavel text-teal-600"></i>
          Conditions Générales d'Utilisation
        </h3>
        <p class="text-xs text-gray-500 font-semibold">En vigueur au 30 mai 2026</p>

        <div class="space-y-4 text-sm leading-relaxed text-gray-700">
          <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <h4 class="font-bold text-red-900 mb-2">⚠️ Article 2 : Objet de l'Application – Avertissement Légal Strict</h4>
            <p class="text-red-800 mb-3"><strong>Ashboard est un outil à vocation exclusivement pédagogique, d'aide au raisonnement clinique et d'optimisation des études médicales.</strong></p>
            <ul class="list-disc list-inside space-y-2 ml-2 text-red-800">
              <li><strong>Absence de Responsabilité Médicale :</strong> L'Application ne constitue en aucun cas un dispositif médical homologué. Les suggestions de prise en charge, arbres décisionnels ou outils de suivi n'ont pas valeur de prescription ou de protocole officiel absolu.</li>
              <li><strong>Responsabilité de l'Utilisateur :</strong> L'utilisateur (externe, interne ou étudiant en médecine) reste seul et unique responsable juridique et déontologique des décisions cliniques, diagnostics et prescriptions qu'il pose lors de ses stages en salle de soins et de ses gardes réelles en milieu hospitalier. L'Application ou ses concepteurs ne sauraient être tenus responsables d'une quelconque erreur médicale commise sur le terrain.</li>
            </ul>
          </div>

          <div>
            <h4 class="font-bold text-gray-900 mb-2">Article 1 : Acceptation des CGU</h4>
            <p>L'accès et l'utilisation de l'Application entraînent l'acceptation expresse, pleine et entière des présentes CGU par l'utilisateur. En se connectant via son compte ou Google OAuth, l'utilisateur reconnaît avoir pris connaissance de ces conditions et s'y conformer.</p>
          </div>

          <div>
            <h4 class="font-bold text-gray-900 mb-2">Article 3 : Confidentialité et Secret Médical</h4>
            <p class="mb-3">Conformément au serment d'Hippocrate et aux lois en vigueur sur le secret médical :</p>
            <ul class="list-disc list-inside space-y-2 ml-2">
              <li>L'utilisateur est fortement encouragé à utiliser des <strong>identifiants anonymisés</strong> ou des initiales fictives pour l'entraînement sur les dossiers patients.</li>
              <li>Aucune donnée nominative de patient ne transite sur le réseau ou sur les serveurs d'Ash-Code. La sécurité physique du terminal (smartphone ou ordinateur) et la protection de l'accès local à l'Application relèvent de la responsabilité exclusive de l'utilisateur.</li>
            </ul>
          </div>

          <div>
            <h4 class="font-bold text-gray-900 mb-2">Article 4 : Propriété Intellectuelle</h4>
            <p>L'ensemble des composants de l'Application (code source, marque, logos et algorithmes) est la propriété exclusive de la team <strong>Ash-Code</strong>. Toute reproduction, modification ou distribution non autorisée du code ou des interfaces est strictement interdite.</p>
          </div>

          <div>
            <h4 class="font-bold text-gray-900 mb-2">Article 5 : Évolution et Disponibilité du Service</h4>
            <p>Ash-Code se réserve le droit de modifier, d'interrompre temporairement ou définitivement l'accès à tout ou partie de l'Application pour des raisons de maintenance technique ou de mise à jour clinique, sans préavis ni indemnité.</p>
          </div>

          <div>
            <h4 class="font-bold text-gray-900 mb-2">Article 6 : Droit Applicable</h4>
            <p>Les présentes CGU sont régies par le droit en vigueur. En cas de litige relatif à l'interprétation ou à l'exécution des présentes, et à défaut de résolution amiable, les tribunaux compétents seront saisis.</p>
          </div>
        </div>
      </div>

    </section>
  `;
}
