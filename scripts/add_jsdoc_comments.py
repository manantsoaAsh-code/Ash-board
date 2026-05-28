import re
from pathlib import Path

root = Path('src')
js_files = list(root.rglob('*.js'))

short_desc = {
    'saveToken': 'Stocke le token d’authentification dans le stockage local.',
    'getToken': 'Récupère le token d’authentification.',
    'clearToken': 'Supprime le token d’authentification du stockage local.',
    'isAuthenticated': 'Vérifie si l’utilisateur est authentifié.',
    'login': 'Effectue une tentative de connexion utilisateur.',
    'register': 'Effectue une tentative d’inscription utilisateur.',
    'logout': 'Déconnecte l’utilisateur en supprimant le token.',
    'apiRequest': 'Exécute une requête HTTP vers l’API.',
    'renderList': 'Rend la liste des patients dans l’interface.',
    'renderSettingsView': 'Génère le HTML de la page de paramètres.',
    'navigateTo': 'Gère la navigation interne vers une vue.',
    'renderProfileView': 'Génère le HTML de la page profil.',
    'openEmergencySimulator': 'Ouvre le simulateur d’urgence.',
    'openConstantsModal': 'Ouvre le modal des constantes cliniques.',
    'renderPerformanceChart': 'Génère le composant de performance.',
    'renderPatientCard': 'Génère le composant de carte patient.',
    'createAIChat': 'Crée un objet de chat IA de base.',
    'toMgDl': 'Convertit la créatinine de µmol/L en mg/dL.',
    'calculateCKDEPI': 'Calcule le DFG selon la formule CKD-EPI.',
    'calculateCockcroftGault': 'Calcule la clairance selon Cockcroft-Gault.',
    'calculateMDRD': 'Calcule le DFG selon la formule MDRD.',
    'calculatePAM': 'Calcule la pression artérielle moyenne (PAM).',
    'getParaclinicNumber': 'Récupère une valeur paraclinique à partir de synonymes.',
    'getLastWeight': 'Récupère le dernier poids enregistré pour un patient.',
    'calcClearance': 'Calcule les estimations de clairance rénale.',
    'renderBioRefBlock': 'Affiche le bloc de référence biologique pour un résultat.',
    'renderClearanceBlock': 'Affiche les résultats de clairance rénale.',
    'autoResize': 'Ajuste automatiquement la hauteur d’une zone de texte.',
    'initAutoResize': 'Active le redimensionnement automatique des textareas.',
    'checkVitalNormal': 'Vérifie si une constante vitale est hors normes.',
    'vitalClass': 'Retourne la classe CSS pour une valeur vitale.',
    'formatDateDisplay': 'Formate une date ISO en format français.',
    'getJn': 'Calcule le jour d’hospitalisation relatif.',
    'handleSmartBullet': 'Gère l’ajout automatique de puces dans un textarea.',
    'getParaTagStyle': 'Récupère le style associé à un tag paraclinique.',
    'renderParaSortBar': 'Affiche la barre de tri des examens paracliniques.',
    'renderParaList': 'Affiche la liste des examens paracliniques.',
    'renderAdherence': 'Affiche le suivi d’observance des traitements.',
    'renderVitals': 'Affiche les entrées de constantes vitales.',
}

name_desc = {
    'token': 'Jeton à stocker.',
    'credentials': 'Données de connexion de l’utilisateur.',
    'userData': 'Données d’inscription de l’utilisateur.',
    'endpoint': 'URL de l’endpoint API.',
    'options': 'Options de la requête HTTP.',
    'patients': 'Liste des patients.',
    'TAGS': 'Liste de tags à afficher.',
    'settings': 'Configuration des paramètres.',
    'viewName': 'Nom de la vue cible.',
    'payload': 'Données envoyées lors de la navigation.',
    'user': 'Objet utilisateur.',
    'message': 'Message ou texte à transmettre.',
    'creatinine': 'Taux de créatinine.',
    'age': 'Âge du patient.',
    'sex': 'Sexe du patient.',
    'weight': 'Poids du patient.',
    'race': 'Origine ethnique.',
    'systolic': 'Tension systolique.',
    'diastolic': 'Tension diastolique.',
    'aliases': 'Liste de synonymes biologiques.',
    'p': 'Objet patient.',
    'el': 'Élément DOM.',
    'key': 'Clé ou champ à mettre à jour.',
    'val': 'Valeur à affecter.',
    'event': 'Objet événement.',
    'e': 'Objet événement.',
    'category': 'Catégorie de données.',
    'tagValue': 'Valeur du tag.',
    'list': 'Liste d’éléments.',
    'patientObj': 'Objet patient associé.',
    't': 'Objet traitement.',
    'trIdx': 'Indice du traitement.',
    'evIdx': 'Indice de l’évolution.',
    'vIdx': 'Indice de la valeur vitale.',
    'realIdx': 'Indice réel dans le tableau.',
    'idx': 'Indice dans le tableau.',
    'mode': 'Mode d’affichage ou d’édition.',
    'id': 'Identifiant du patient.',
    'dateStr': 'Date sous forme de chaîne.',
    'admissionDate': 'Date d’admission.',
    'targetDate': 'Date cible.',
}

patterns = [
    re.compile(r'^(\s*export\s+async\s+function\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*\(([^)]*)\)\s*\{)'),
    re.compile(r'^(\s*export\s+function\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*\(([^)]*)\)\s*\{)'),
    re.compile(r'^(\s*async\s+function\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*\(([^)]*)\)\s*\{)'),
    re.compile(r'^(\s*function\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*\(([^)]*)\)\s*\{)'),
    re.compile(r'^(\s*(?:export\s+)?const\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*async\s*\(([^)]*)\)\s*=>\s*\{)'),
    re.compile(r'^(\s*(?:export\s+)?const\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*\(([^)]*)\)\s*=>\s*\{)'),
]


def get_param_desc(param):
    name = param.split('=')[0].strip()
    return name_desc.get(name, 'Paramètre.')


def build_comment(name, params_text, indent=''):
    short = short_desc.get(name, f'Exécute la fonction `{name}`.')
    comment = [f'{indent}/**', f'{indent} * {short}', f'{indent} *']
    params_text = params_text.strip()
    if params_text:
        params = [p.strip() for p in params_text.split(',') if p.strip()]
        for p in params:
            param_name = p.split('=')[0].split(':')[0].strip()
            if param_name:
                comment.append(f'{indent} * @param {{any}} {param_name} - {get_param_desc(param_name)}')
    comment.append(f'{indent} * @returns {{any}}')
    comment.append(f'{indent} */')
    return '\n'.join(comment)

for file in js_files:
    text = file.read_text(encoding='utf-8')
    lines = text.splitlines()
    output = []
    changed = False
    for i, line in enumerate(lines):
        added = False
        for pat in patterns:
            m = pat.match(line)
            if m:
                name = m.group(2)
                params = m.group(3)
                prev = output[-1].strip() if output else ''
                if prev.startswith('/**'):
                    break
                indent = re.match(r'^(\s*)', line).group(1)
                output.append(build_comment(name, params, indent))
                changed = True
                break
        output.append(line)
    if changed:
        file.write_text('\n'.join(output) + '\n', encoding='utf-8')
        print(f'Updated {file}')
