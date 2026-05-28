export const BIO_STANDARDS = {

  // ─────────────────────────────────────────────────────────────────
  // NFS — HÉMOGRAMME COMPLET
  // ─────────────────────────────────────────────────────────────────
  'hemoglobine':              { min: 12.0,  max: 17.5,   unite: 'g/dL',      note: 'H: 13.5–17.5 | F: 12–16' },
  'nfs - hemoglobine':        { min: 12.0,  max: 17.5,   unite: 'g/dL',      note: 'H: 13.5–17.5 | F: 12–16' },
  'nfs- hemoglobine':         { min: 12.0,  max: 17.5,   unite: 'g/dL',      note: 'H: 13.5–17.5 | F: 12–16' },
  'nfs hemoglobine':          { min: 12.0,  max: 17.5,   unite: 'g/dL',      note: 'H: 13.5–17.5 | F: 12–16' },
  "taux d'hemoglobine":       { min: 12.0,  max: 17.5,   unite: 'g/dL',      note: 'H: 13.5–17.5 | F: 12–16' },
  'hb':                       { min: 12.0,  max: 17.5,   unite: 'g/dL',      note: 'H: 13.5–17.5 | F: 12–16' },
  'hgb':                      { min: 12.0,  max: 17.5,   unite: 'g/dL',      note: 'H: 13.5–17.5 | F: 12–16' },
  'globules rouges':          { min: 4.2,   max: 5.9,    unite: 'T/L',       note: 'H: 4.5–5.9 | F: 4.2–5.4' },
  'erythrocytes':             { min: 4.2,   max: 5.9,    unite: 'T/L',       note: 'H: 4.5–5.9 | F: 4.2–5.4' },
  'gr':                       { min: 4.2,   max: 5.9,    unite: 'T/L',       note: 'H: 4.5–5.9 | F: 4.2–5.4' },
  'rbc':                      { min: 4.2,   max: 5.9,    unite: 'T/L',       note: 'H: 4.5–5.9 | F: 4.2–5.4' },
  'hematocrite':              { min: 36,    max: 52,     unite: '%',         note: 'H: 40–52 | F: 36–48' },
  'ht':                       { min: 36,    max: 52,     unite: '%',         note: 'H: 40–52 | F: 36–48' },
  'hct':                      { min: 36,    max: 52,     unite: '%',         note: 'H: 40–52 | F: 36–48' },
  'vgm':                      { min: 80,    max: 100,    unite: 'fL',        note: '' },
  'mcv':                      { min: 80,    max: 100,    unite: 'fL',        note: '' },
  'tcmh':                     { min: 27,    max: 33,     unite: 'pg',        note: '' },
  'mch':                      { min: 27,    max: 33,     unite: 'pg',        note: '' },
  'ccmh':                     { min: 320,   max: 360,    unite: 'g/L',       note: 'Concentration corpusculaire moyenne en Hb' },
  'mchc':                     { min: 320,   max: 360,    unite: 'g/L',       note: '' },
  'idre':                     { min: 11.5,  max: 14.5,   unite: '%',         note: 'Index de distribution des GR (RDW)' },
  'rdw':                      { min: 11.5,  max: 14.5,   unite: '%',         note: '' },
  'reticulocytes':            { min: 25,    max: 100,    unite: 'G/L',       note: 'ou 0.5–1.5%' },
  'reticulocytes %':          { min: 0.5,   max: 1.5,    unite: '%',         note: '' },
  'leucocytes':               { min: 4.0,   max: 10.0,   unite: 'G/L',       note: '' },
  'nfs - leucocytes':         { min: 4.0,   max: 10.0,   unite: 'G/L',       note: '' },
  'nfs leucocytes':           { min: 4.0,   max: 10.0,   unite: 'G/L',       note: '' },
  'gb':                       { min: 4.0,   max: 10.0,   unite: 'G/L',       note: '' },
  'globules blancs':          { min: 4.0,   max: 10.0,   unite: 'G/L',       note: '' },
  'wbc':                      { min: 4.0,   max: 10.0,   unite: 'G/L',       note: '' },
  'neutrophiles':             { min: 1.8,   max: 7.7,    unite: 'G/L',       note: '' },
  'pnn':                      { min: 1.8,   max: 7.7,    unite: 'G/L',       note: 'Polynucléaires neutrophiles' },
  'neutrophiles %':           { min: 45,    max: 75,     unite: '%',         note: '' },
  'lymphocytes':              { min: 1.0,   max: 4.0,    unite: 'G/L',       note: '' },
  'lymphocytes %':            { min: 20,    max: 40,     unite: '%',         note: '' },
  'monocytes':                { min: 0.2,   max: 1.0,    unite: 'G/L',       note: '' },
  'monocytes %':              { min: 2,     max: 10,     unite: '%',         note: '' },
  'eosinophiles':             { min: 0.05,  max: 0.5,    unite: 'G/L',       note: '' },
  'eosinophiles %':           { min: 1,     max: 5,      unite: '%',         note: '' },
  'basophiles':               { min: 0.0,   max: 0.1,    unite: 'G/L',       note: '' },
  'basophiles %':             { min: 0,     max: 1,      unite: '%',         note: '' },
  'plaquettes':               { min: 150,   max: 400,    unite: 'G/L',       note: '' },
  'nfs - plaquettes':         { min: 150,   max: 400,    unite: 'G/L',       note: '' },
  'nfs plaquettes':           { min: 150,   max: 400,    unite: 'G/L',       note: '' },
  'plq':                      { min: 150,   max: 400,    unite: 'G/L',       note: '' },
  'plt':                      { min: 150,   max: 400,    unite: 'G/L',       note: '' },
  'thrombocytes':             { min: 150,   max: 400,    unite: 'G/L',       note: '' },
  'vpm':                      { min: 7.5,   max: 12.5,   unite: 'fL',        note: 'Volume plaquettaire moyen (MPV)' },
  'mpv':                      { min: 7.5,   max: 12.5,   unite: 'fL',        note: '' },

  // ─────────────────────────────────────────────────────────────────
  // HÉMOSTASE / COAGULATION
  // ─────────────────────────────────────────────────────────────────
  'tp':                       { min: 70,    max: 100,    unite: '%',         note: '' },
  'taux de prothrombine':     { min: 70,    max: 100,    unite: '%',         note: '' },
  'tq':                       { min: 70,    max: 100,    unite: '%',         note: '' },
  'inr':                      { min: 0.8,   max: 1.2,    unite: 'ratio',     note: 'Sous AVK: 2–3 selon indication' },
  'tca':                      { min: 28,    max: 40,     unite: 's',         note: 'Ratio patient/témoin <1.2' },
  'aptt':                     { min: 28,    max: 40,     unite: 's',         note: '' },
  'temps de thrombine':       { min: 14,    max: 21,     unite: 's',         note: '' },
  'tt':                       { min: 14,    max: 21,     unite: 's',         note: '' },
  'fibrinogene':              { min: 2.0,   max: 4.0,    unite: 'g/L',       note: '' },
  'd-dimeres':                { min: 0,     max: 500,    unite: 'ng/mL',     note: '<500 (seuil PE/TVP)' },
  'd dimeres':                { min: 0,     max: 500,    unite: 'ng/mL',     note: '<500 (seuil PE/TVP)' },
  'dimeres':                  { min: 0,     max: 500,    unite: 'ng/mL',     note: '<500 (seuil PE/TVP)' },
  'facteur v':                { min: 70,    max: 120,    unite: '%',         note: '' },
  'facteur viii':             { min: 70,    max: 150,    unite: '%',         note: '' },
  'facteur ix':               { min: 70,    max: 120,    unite: '%',         note: '' },
  'facteur xi':               { min: 70,    max: 120,    unite: '%',         note: '' },
  'facteur ii':               { min: 70,    max: 120,    unite: '%',         note: 'Prothrombine' },
  'facteur vii':              { min: 70,    max: 120,    unite: '%',         note: '' },
  'facteur x':                { min: 70,    max: 120,    unite: '%',         note: '' },
  'antithrombine iii':        { min: 80,    max: 120,    unite: '%',         note: 'AT III' },
  'at iii':                   { min: 80,    max: 120,    unite: '%',         note: '' },
  'proteine c':               { min: 70,    max: 140,    unite: '%',         note: '' },
  'proteine s':               { min: 60,    max: 140,    unite: '%',         note: 'H: 74–146 | F: 55–123' },
  'resistance a la pca':      { min: 2.0,   max: 4.0,    unite: 'ratio',     note: 'Test APC-R' },
  'agregation plaquettaire':  { min: 60,    max: 100,    unite: '%',         note: "À l'ADP ou collagène" },
  'pdw':                      { min: 9,     max: 17,     unite: '%',         note: 'Distribution width plaquettes' },

  // ─────────────────────────────────────────────────────────────────
  // BIOCHIMIE — FONCTION RÉNALE
  // ─────────────────────────────────────────────────────────────────
  'creatinine':               { min: 44,    max: 97,     unite: 'µmol/L',    note: 'H: 62–106 | F: 44–80', isClearanceBase: true },
  'uree':                     { min: 2.5,   max: 7.5,    unite: 'mmol/L',    note: '', isClearanceBase: true },
  'acide urique':             { min: 200,   max: 420,    unite: 'µmol/L',    note: 'H: 240–420 | F: 150–360' },
  'uricemie':                 { min: 200,   max: 420,    unite: 'µmol/L',    note: 'H: 240–420 | F: 150–360' },
  'egfr':                     { min: 60,    max: 999,    unite: 'mL/min',    note: '>60 normal' },
  'dfg':                      { min: 60,    max: 999,    unite: 'mL/min',    note: '>60 normal' },
  'cystatine c':              { min: 0.63,  max: 1.03,   unite: 'mg/L',      note: 'Marqueur GFR précoce' },
  'microalbuminurie':         { min: 0,     max: 30,     unite: 'mg/24h',    note: '<30 normal; 30–300 micro-albuminurie' },
  'proteinurie 24h':          { min: 0,     max: 150,    unite: 'mg/24h',    note: '<150 normal' },
  'rapport albumine creatinine': { min: 0,  max: 3,      unite: 'mg/mmol',   note: '<3 normal; >30 pathologique' },
  'clairance creatinine':     { min: 90,    max: 130,    unite: 'mL/min',    note: 'Cockroft-Gault' },
  'beta2 microglobuline':     { min: 1.0,   max: 2.4,    unite: 'mg/L',      note: '' },

  // ─────────────────────────────────────────────────────────────────
  // BIOCHIMIE — ÉLECTROLYTES & ÉQUILIBRE ACIDO-BASIQUE
  // ─────────────────────────────────────────────────────────────────
  'natremie':                 { min: 136,   max: 145,    unite: 'mmol/L',    note: '' },
  'sodium':                   { min: 136,   max: 145,    unite: 'mmol/L',    note: '' },
  'na+':                      { min: 136,   max: 145,    unite: 'mmol/L',    note: '' },
  'kaliemie':                 { min: 3.5,   max: 5.0,    unite: 'mmol/L',    note: '' },
  'potassium':                { min: 3.5,   max: 5.0,    unite: 'mmol/L',    note: '' },
  'k+':                       { min: 3.5,   max: 5.0,    unite: 'mmol/L',    note: '' },
  'chloremie':                { min: 98,    max: 107,    unite: 'mmol/L',    note: '' },
  'cl-':                      { min: 98,    max: 107,    unite: 'mmol/L',    note: '' },
  'calcemie':                 { min: 2.15,  max: 2.55,   unite: 'mmol/L',    note: '' },
  'calcium':                  { min: 2.15,  max: 2.55,   unite: 'mmol/L',    note: '' },
  'ca2+':                     { min: 2.15,  max: 2.55,   unite: 'mmol/L',    note: '' },
  'calcium ionise':           { min: 1.15,  max: 1.35,   unite: 'mmol/L',    note: 'Ca2+ libre' },
  'phosphoremie':             { min: 0.87,  max: 1.45,   unite: 'mmol/L',    note: '' },
  'phosphore':                { min: 0.87,  max: 1.45,   unite: 'mmol/L',    note: '' },
  'magnesemie':               { min: 0.70,  max: 1.05,   unite: 'mmol/L',    note: '' },
  'magnesium':                { min: 0.70,  max: 1.05,   unite: 'mmol/L',    note: '' },
  'bicarbonates':             { min: 22,    max: 29,     unite: 'mmol/L',    note: '' },
  'hco3-':                    { min: 22,    max: 29,     unite: 'mmol/L',    note: '' },
  'hco3':                     { min: 22,    max: 29,     unite: 'mmol/L',    note: '' },
  'trou anionique':           { min: 8,     max: 16,     unite: 'mmol/L',    note: 'Na – (Cl + HCO3)' },
  'anion gap':                { min: 8,     max: 16,     unite: 'mmol/L',    note: '' },
  'osmolalite plasmatique':   { min: 275,   max: 295,    unite: 'mOsm/kg',   note: '' },
  'osmolalite':               { min: 275,   max: 295,    unite: 'mOsm/kg',   note: '' },
  'trou osmolaire':           { min: 0,     max: 10,     unite: 'mOsm/kg',   note: '<10 normal' },
  'cupremia':                 { min: 11,    max: 22,     unite: 'µmol/L',    note: 'Cuivre sérique' },
  'cuivre':                   { min: 11,    max: 22,     unite: 'µmol/L',    note: '' },
  'ceruloplasmine':           { min: 0.20,  max: 0.60,   unite: 'g/L',       note: '' },
  'zinc':                     { min: 10,    max: 18,     unite: 'µmol/L',    note: '' },
  'zincemie':                 { min: 10,    max: 18,     unite: 'µmol/L',    note: '' },
  'selenium':                 { min: 0.7,   max: 1.7,    unite: 'µmol/L',    note: '' },
  'manganese':                { min: 0.07,  max: 0.26,   unite: 'µmol/L',    note: '' },

  // ─────────────────────────────────────────────────────────────────
  // GAZOMÉTRIE ARTÉRIELLE
  // ─────────────────────────────────────────────────────────────────
  'ph':                       { min: 7.35,  max: 7.45,   unite: '',          note: 'Sang artériel' },
  'pao2':                     { min: 80,    max: 100,    unite: 'mmHg',      note: 'Artériel, AA' },
  'paco2':                    { min: 35,    max: 45,     unite: 'mmHg',      note: 'Artériel' },
  'lactates':                 { min: 0.5,   max: 2.0,    unite: 'mmol/L',    note: '>4 choc' },
  'sao2':                     { min: 95,    max: 100,    unite: '%',         note: 'Saturation artérielle O2' },
  'spo2':                     { min: 95,    max: 100,    unite: '%',         note: 'Saturation pouls oxymètre' },
  'svo2':                     { min: 65,    max: 75,     unite: '%',         note: 'Saturation veineuse mixte (KT pulmonaire)' },
  'scvo2':                    { min: 70,    max: 80,     unite: '%',         note: 'Saturation veineuse centrale' },
  'fio2':                     { min: 21,    max: 100,    unite: '%',         note: 'Fraction inspirée O2' },
  'gradient aa o2':           { min: 0,     max: 15,     unite: 'mmHg',      note: 'AA: <15; augmente avec âge' },
  'be':                       { min: -2,    max: 2,      unite: 'mmol/L',    note: 'Excès de base' },
  'base excess':              { min: -2,    max: 2,      unite: 'mmol/L',    note: '' },
  'pression arterielle co2':  { min: 35,    max: 45,     unite: 'mmHg',      note: '' },

  // ─────────────────────────────────────────────────────────────────
  // BIOCHIMIE — MÉTABOLISME GLUCIDIQUE
  // ─────────────────────────────────────────────────────────────────
  'glycemie':                 { min: 3.9,   max: 6.1,    unite: 'mmol/L',    note: 'À jeun' },
  'glucose':                  { min: 3.9,   max: 6.1,    unite: 'mmol/L',    note: 'À jeun' },
  'hba1c':                    { min: 0,     max: 6.5,    unite: '%',         note: 'Objectif DT2: <7%' },
  'hemoglobine glycquee':     { min: 0,     max: 6.5,    unite: '%',         note: 'Objectif DT2: <7%' },
  'fructosamine':             { min: 200,   max: 285,    unite: 'µmol/L',    note: 'Glycémie 2–3 sem' },
  'insuline':                 { min: 2.6,   max: 24.9,   unite: 'µUI/mL',    note: 'À jeun' },
  'peptide c':                { min: 0.5,   max: 2.0,    unite: 'nmol/L',    note: 'À jeun' },
  'glucagon':                 { min: 20,    max: 100,    unite: 'ng/L',      note: 'À jeun' },
  'index homa ir':            { min: 0,     max: 2.5,    unite: '',          note: '<2.5 normal; >3.0 résistance insuline' },

  // ─────────────────────────────────────────────────────────────────
  // BIOCHIMIE — LIPIDES
  // ─────────────────────────────────────────────────────────────────
  'cholesterol total':        { min: 0,     max: 5.2,    unite: 'mmol/L',    note: '<5.2 souhaitable' },
  'ldl':                      { min: 0,     max: 3.4,    unite: 'mmol/L',    note: 'Variable selon risque CV' },
  'hdl':                      { min: 1.0,   max: 99,     unite: 'mmol/L',    note: '>1.0 H | >1.3 F' },
  'triglycerides':            { min: 0,     max: 1.7,    unite: 'mmol/L',    note: '' },
  'tg':                       { min: 0,     max: 1.7,    unite: 'mmol/L',    note: '' },
  'apolipoproteine a1':       { min: 1.10,  max: 2.05,   unite: 'g/L',       note: 'H: 1.05–1.75 | F: 1.10–2.05' },
  'apo a1':                   { min: 1.10,  max: 2.05,   unite: 'g/L',       note: '' },
  'apolipoproteine b':        { min: 0.60,  max: 1.20,   unite: 'g/L',       note: '' },
  'apo b':                    { min: 0.60,  max: 1.20,   unite: 'g/L',       note: '' },
  'lipoproteine a':           { min: 0,     max: 300,    unite: 'mg/L',      note: '<300 souhaitable' },
  'lpa':                      { min: 0,     max: 300,    unite: 'mg/L',      note: '' },
  'vldl':                     { min: 0.1,   max: 0.7,    unite: 'mmol/L',    note: '' },
  'non hdl cholesterol':      { min: 0,     max: 4.2,    unite: 'mmol/L',    note: '' },
  'rapport ldl hdl':          { min: 0,     max: 3.5,    unite: 'ratio',     note: '<3.5 souhaitable' },

  // ─────────────────────────────────────────────────────────────────
  // BIOCHIMIE — BILAN HÉPATIQUE
  // ─────────────────────────────────────────────────────────────────
  'asat':                     { min: 0,     max: 40,     unite: 'UI/L',      note: '' },
  'sgot':                     { min: 0,     max: 40,     unite: 'UI/L',      note: '' },
  'alat':                     { min: 0,     max: 41,     unite: 'UI/L',      note: 'H: <41 | F: <31' },
  'sgpt':                     { min: 0,     max: 41,     unite: 'UI/L',      note: '' },
  'ggt':                      { min: 0,     max: 55,     unite: 'UI/L',      note: 'H: <55 | F: <38' },
  'pal':                      { min: 40,    max: 130,    unite: 'UI/L',      note: '' },
  'phosphatases alcalines':   { min: 40,    max: 130,    unite: 'UI/L',      note: '' },
  'bilirubine totale':        { min: 0,     max: 17,     unite: 'µmol/L',    note: '' },
  'bilirubine directe':       { min: 0,     max: 5,      unite: 'µmol/L',    note: '' },
  'bilirubine conjuguee':     { min: 0,     max: 5,      unite: 'µmol/L',    note: '' },
  'bilirubine indirecte':     { min: 0,     max: 12,     unite: 'µmol/L',    note: '' },
  'bilirubine non conjuguee': { min: 0,     max: 12,     unite: 'µmol/L',    note: '' },
  'albumine':                 { min: 35,    max: 50,     unite: 'g/L',       note: '' },
  'proteines totales':        { min: 60,    max: 80,     unite: 'g/L',       note: '' },
  'ldh':                      { min: 135,   max: 225,    unite: 'UI/L',      note: '' },
  'lactate deshydrogenase':   { min: 135,   max: 225,    unite: 'UI/L',      note: '' },
  'gamma globulines':         { min: 6,     max: 13,     unite: 'g/L',       note: '' },
  'alpha 1 globulines':       { min: 1,     max: 3,      unite: 'g/L',       note: '' },
  'alpha 2 globulines':       { min: 5,     max: 9,      unite: 'g/L',       note: '' },
  'beta globulines':          { min: 5,     max: 11,     unite: 'g/L',       note: '' },
  'cholinesterase':           { min: 5000,  max: 12000,  unite: 'UI/L',      note: 'Pseudocholinestérase; H: 5000–12000 | F: 4500–11000' },
  'prealbumine':              { min: 0.20,  max: 0.40,   unite: 'g/L',       note: 'Transthyrétine; marqueur nutritionnel précoce' },
  'transthyretine':           { min: 0.20,  max: 0.40,   unite: 'g/L',       note: '' },
  'ammoniemie':               { min: 11,    max: 35,     unite: 'µmol/L',    note: '' },
  'ammoniaque':               { min: 11,    max: 35,     unite: 'µmol/L',    note: '' },
  'acides biliaires':         { min: 0,     max: 10,     unite: 'µmol/L',    note: 'À jeun' },
  'score child pugh':         { min: 5,     max: 6,      unite: 'pts',       note: 'A: 5–6 | B: 7–9 | C: 10–15' },
  'afp':                      { min: 0,     max: 7,      unite: 'ng/mL',     note: 'Alpha-foetoprotéine; >200 évocateur CHC' },
  'alpha foetoproteine':      { min: 0,     max: 7,      unite: 'ng/mL',     note: '' },

  // ─────────────────────────────────────────────────────────────────
  // PANCRÉAS
  // ─────────────────────────────────────────────────────────────────
  'lipase':                   { min: 0,     max: 60,     unite: 'UI/L',      note: '>3x LSN = pancréatite' },
  'amylase':                  { min: 25,    max: 115,    unite: 'UI/L',      note: '' },
  'amylase pancreatique':     { min: 13,    max: 53,     unite: 'UI/L',      note: '' },
  'elastase 1 fecale':        { min: 200,   max: 9999,   unite: 'µg/g',      note: '>200 normale; <100 insuff. exocrine sévère' },
  'ca 19-9':                  { min: 0,     max: 37,     unite: 'UI/mL',     note: '' },
  'ca19-9':                   { min: 0,     max: 37,     unite: 'UI/mL',     note: '' },

  // ─────────────────────────────────────────────────────────────────
  // INFLAMMATION / INFECTIOLOGIE
  // ─────────────────────────────────────────────────────────────────
  'crp':                      { min: 0,     max: 5.0,    unite: 'mg/L',      note: '<5 normal' },
  'proteine c reactive':      { min: 0,     max: 5.0,    unite: 'mg/L',      note: '<5 normal' },
  'crp us':                   { min: 0,     max: 3.0,    unite: 'mg/L',      note: 'CRP ultrasensible; risque CV: >3' },
  'procalcitonine':           { min: 0,     max: 0.5,    unite: 'ng/mL',     note: "<0.5 pas d'infection bact." },
  'pct':                      { min: 0,     max: 0.5,    unite: 'ng/mL',     note: "<0.5 pas d'infection bact." },
  'vs':                       { min: 0,     max: 20,     unite: 'mm/h',      note: 'H: <15 | F: <20 (varie avec âge)' },
  'interleukine 6':           { min: 0,     max: 7,      unite: 'pg/mL',     note: 'IL-6' },
  'il-6':                     { min: 0,     max: 7,      unite: 'pg/mL',     note: '' },
  'haptoglobine':             { min: 0.30,  max: 2.00,   unite: 'g/L',       note: 'Basse en hémolyse' },
  'orosomucoide':             { min: 0.55,  max: 1.40,   unite: 'g/L',       note: 'Alpha-1 glycoprotéine acide' },
  'alpha 1 antitrypsine':     { min: 0.90,  max: 2.00,   unite: 'g/L',       note: '' },
  'complement c3':            { min: 0.90,  max: 1.80,   unite: 'g/L',       note: '' },
  'complement c4':            { min: 0.16,  max: 0.47,   unite: 'g/L',       note: '' },
  'ch50':                     { min: 60,    max: 140,    unite: '%',         note: 'Complément hémolytique total' },
  'neopterin':                { min: 0,     max: 10,     unite: 'nmol/L',    note: '' },
  'ferritine':                { min: 15,    max: 200,    unite: 'µg/L',      note: 'H: 30–300 | F: 15–200' },

  // ─────────────────────────────────────────────────────────────────
  // FER & MÉTABOLISME
  // ─────────────────────────────────────────────────────────────────
  'fer serique':              { min: 10,    max: 30,     unite: 'µmol/L',    note: '' },
  'fer':                      { min: 10,    max: 30,     unite: 'µmol/L',    note: '' },
  'transferrine':             { min: 2.0,   max: 3.6,    unite: 'g/L',       note: '' },
  'css transferrine':         { min: 20,    max: 45,     unite: 'µmol/L',    note: 'Capacité saturation sidérophiline' },
  'ctf':                      { min: 45,    max: 75,     unite: 'µmol/L',    note: 'Capacité totale fixation fer' },
  'css':                      { min: 20,    max: 45,     unite: '%',         note: 'Taux saturation transferrine' },

  // ─────────────────────────────────────────────────────────────────
  // VITAMINES & NUTRIMENTS
  // ─────────────────────────────────────────────────────────────────
  'vitamine b12':             { min: 190,   max: 900,    unite: 'ng/L',      note: '' },
  'cobalamine':               { min: 190,   max: 900,    unite: 'ng/L',      note: '' },
  'folates':                  { min: 3,     max: 20,     unite: 'ng/mL',     note: '' },
  'acide folique':            { min: 3,     max: 20,     unite: 'ng/mL',     note: '' },
  'vitamine d':               { min: 75,    max: 250,    unite: 'nmol/L',    note: '>50 suffisant' },
  '25-oh vitamine d':         { min: 75,    max: 250,    unite: 'nmol/L',    note: '>50 suffisant' },
  'vitamine a':               { min: 1.05,  max: 2.27,   unite: 'µmol/L',    note: '' },
  'retinol':                  { min: 1.05,  max: 2.27,   unite: 'µmol/L',    note: '' },
  'vitamine e':               { min: 12,    max: 46,     unite: 'µmol/L',    note: 'Alpha-tocophérol' },
  'alpha tocopherol':         { min: 12,    max: 46,     unite: 'µmol/L',    note: '' },
  'vitamine k1':              { min: 0.15,  max: 1.50,   unite: 'nmol/L',    note: 'Phylloquinone' },
  'vitamine b1':              { min: 70,    max: 180,    unite: 'nmol/L',    note: 'Thiamine' },
  'thiamine':                 { min: 70,    max: 180,    unite: 'nmol/L',    note: '' },
  'vitamine b6':              { min: 20,    max: 150,    unite: 'nmol/L',    note: 'Pyridoxine' },
  'vitamine b9':              { min: 7,     max: 45,     unite: 'nmol/L',    note: 'Folates érythrocytaires' },
  'homocysteine':             { min: 5,     max: 15,     unite: 'µmol/L',    note: '<15 normal; risque CV si >15' },
  'acide methylmalonique':    { min: 0,     max: 0.4,    unite: 'µmol/L',    note: 'Carence B12 fonctionnelle' },

  // ─────────────────────────────────────────────────────────────────
  // ENDOCRINOLOGIE — THYROÏDE
  // ─────────────────────────────────────────────────────────────────
  'tsh':                      { min: 0.27,  max: 4.20,   unite: 'mUI/L',     note: '' },
  't4 libre':                 { min: 12,    max: 22,     unite: 'pmol/L',    note: '' },
  't3 libre':                 { min: 3.1,   max: 6.8,    unite: 'pmol/L',    note: '' },
  'ft4':                      { min: 12,    max: 22,     unite: 'pmol/L',    note: '' },
  'ft3':                      { min: 3.1,   max: 6.8,    unite: 'pmol/L',    note: '' },
  't4 totale':                { min: 60,    max: 160,    unite: 'nmol/L',    note: '' },
  't3 totale':                { min: 1.2,   max: 2.7,    unite: 'nmol/L',    note: '' },
  'tg thyroglobuline':        { min: 0,     max: 35,     unite: 'ng/mL',     note: 'Suivi cancer thyroïde' },
  'ac anti tpo':              { min: 0,     max: 34,     unite: 'UI/mL',     note: '<34 normal' },
  'ac anti thyroglobuline':   { min: 0,     max: 115,    unite: 'UI/mL',     note: '' },
  'ac anti rtsh':             { min: 0,     max: 1.75,   unite: 'UI/L',      note: 'TRAK; <1.75 normal' },
  'calcitonine':              { min: 0,     max: 10,     unite: 'ng/L',      note: 'H: <9.52 | F: <6.4' },

  // ─────────────────────────────────────────────────────────────────
  // ENDOCRINOLOGIE — SURRÉNALES / CORTICOTROPE
  // ─────────────────────────────────────────────────────────────────
  'cortisol':                 { min: 170,   max: 540,    unite: 'nmol/L',    note: 'Matin (8h)' },
  'acth':                     { min: 7.2,   max: 63,     unite: 'ng/L',      note: 'Matin (8h)' },
  'cortisol libre urinaire': { min: 30,    max: 145,    unite: 'µg/24h',    note: 'CLU / 24h' },
  'dhea':                     { min: 1.8,   max: 9.4,    unite: 'µmol/L',    note: 'H: 2.2–15.2 | F: 1.8–9.4' },
  'dhea-s':                   { min: 1.8,   max: 9.4,    unite: 'µmol/L',    note: 'DHEA sulfate; variable âge' },
  'aldosterone':              { min: 100,   max: 800,    unite: 'pmol/L',    note: 'Couché 1h; debout: 200–900' },
  'renine active':            { min: 7,     max: 76,     unite: 'mUI/L',     note: 'Debout' },
  'ratio aldosterone renine': { min: 0,    max: 30,     unite: '',          note: '>30 évocateur hyperaldostéronisme primaire' },
  'androstenedione':          { min: 1.0,   max: 11.5,   unite: 'nmol/L',    note: 'H: 1.0–11.5 | F: 1.3–10.7' },
  '17-oh progesterone':       { min: 0.15,  max: 2.0,    unite: 'nmol/L',    note: 'Folliculaire: 0.15–2.0' },
  'metanephrines plasmatiques': { min: 0,   max: 90,     unite: 'ng/L',      note: 'Métanéphrines libres < 90 phéo peu probable' },
  'normetanephrines plasmatiques': { min: 0, max: 200,   unite: 'ng/L',      note: '' },
  'catecholamines urinaires adrenaline': { min: 0, max: 109, unite: 'nmol/24h', note: '' },
  'catecholamines urinaires noradrenaline': { min: 89, max: 473, unite: 'nmol/24h', note: '' },
  'catecholamines urinaires dopamine': { min: 420, max: 2630, unite: 'nmol/24h', note: '' },

  // ─────────────────────────────────────────────────────────────────
  // ENDOCRINOLOGIE — GONADOTROPES / REPRODUCTION
  // ─────────────────────────────────────────────────────────────────
  'fsh':                      { min: 1.5,   max: 12.4,   unite: 'UI/L',      note: 'H: 1.5–12.4 | F phase folliculaire: 3.5–12.5' },
  'lh':                       { min: 1.7,   max: 8.6,    unite: 'UI/L',      note: 'H: 1.7–8.6 | F phase folliculaire: 2.4–12.6' },
  'testosterone totale':      { min: 0.5,   max: 35,     unite: 'nmol/L',    note: 'H: 9.9–27.8 | F: 0.5–2.6' },
  'testosterone':             { min: 0.5,   max: 35,     unite: 'nmol/L',    note: 'H: 9.9–27.8 | F: 0.5–2.6' },
  'testosterone libre':       { min: 0.01,  max: 0.17,   unite: 'nmol/L',    note: '' },
  'oestradiol':               { min: 40,    max: 400,    unite: 'pmol/L',    note: 'H: 40–180 | F phase folliculaire: 110–400' },
  'e2':                       { min: 40,    max: 400,    unite: 'pmol/L',    note: '' },
  'progesterone':             { min: 0.3,   max: 2.0,    unite: 'nmol/L',    note: 'Folliculaire: 0.3–2.0; Lutéale: 15–100' },
  'prolactine':               { min: 70,    max: 530,    unite: 'mUI/L',     note: 'H: 70–530 | F: 70–700' },
  'prl':                      { min: 70,    max: 530,    unite: 'mUI/L',     note: '' },
  'shbg':                     { min: 13,    max: 71,     unite: 'nmol/L',    note: 'H: 13–71 | F: 18–144' },
  'amh':                      { min: 1.0,   max: 10.6,   unite: 'pmol/L',    note: 'Anti-Müllerienne; âge-dépendant' },
  'hormone anti mullerienne': { min: 1.0,   max: 10.6,   unite: 'pmol/L',    note: '' },
  'inhibine b':               { min: 80,    max: 350,    unite: 'ng/L',      note: 'H (adulte)' },
  'beta-hcg':                 { min: 0,     max: 5,      unite: 'mUI/mL',    note: 'Non enceinte: <5' },
  'hcg':                      { min: 0,     max: 5,      unite: 'mUI/mL',    note: 'Non enceinte: <5' },

  // ─────────────────────────────────────────────────────────────────
  // ENDOCRINOLOGIE — AXE GH / IGF
  // ─────────────────────────────────────────────────────────────────
  'igf1':                     { min: 115,   max: 307,    unite: 'µg/L',      note: 'Adulte 25–45 ans; âge-dépendant' },
  'gh':                       { min: 0,     max: 5,      unite: 'ng/mL',     note: 'À jeun; <5 normal' },
  'hormone de croissance':    { min: 0,     max: 5,      unite: 'ng/mL',     note: '' },

  // ─────────────────────────────────────────────────────────────────
  // ENDOCRINOLOGIE — PARATHYROÏDES & OS
  // ─────────────────────────────────────────────────────────────────
  'pth':                      { min: 15,    max: 65,     unite: 'ng/L',      note: '' },
  'parathormone':             { min: 15,    max: 65,     unite: 'ng/L',      note: '' },
  'osteocalcine':             { min: 10,    max: 40,     unite: 'µg/L',      note: 'Marqueur formation osseuse; âge-dépendant' },
  'ctx':                      { min: 0,     max: 0.573,  unite: 'ng/mL',     note: 'Cross-laps (résorption osseuse); H <0.573' },
  'beta-crosslaps':           { min: 0,     max: 0.573,  unite: 'ng/mL',     note: '' },
  'ntx':                      { min: 5,     max: 65,     unite: 'nM BCE/L',  note: 'N-Télopeptides collagène' },
  'phosphatases alcalines osseuses': { min: 11, max: 43, unite: 'µg/L',    note: 'H: 11–43 | F: 11–43' },
  'bone alp':                 { min: 11,    max: 43,     unite: 'µg/L',      note: '' },
  'dpd':                      { min: 2.3,   max: 7.4,    unite: 'nmol/µmol créat.', note: 'Déoxypyridinoline urinaire' },

  // ─────────────────────────────────────────────────────────────────
  // CARDIOLOGIE
  // ─────────────────────────────────────────────────────────────────
  'troponine':                { min: 0,     max: 14,     unite: 'ng/L',      note: '<14 (hs-TnT) / <16 (hs-TnI)' },
  'troponine t':              { min: 0,     max: 14,     unite: 'ng/L',      note: '' },
  'troponine i':              { min: 0,     max: 16,     unite: 'ng/L',      note: '' },
  'bnp':                      { min: 0,     max: 100,    unite: 'pg/mL',     note: '<100 peu probable IC' },
  'nt-probnp':                { min: 0,     max: 125,    unite: 'pg/mL',     note: '<125 peu probable IC' },
  'nt probnp':                { min: 0,     max: 125,    unite: 'pg/mL',     note: '<125 peu probable IC' },
  'ck':                       { min: 0,     max: 190,    unite: 'UI/L',      note: 'H: <190 | F: <170' },
  'cpk':                      { min: 0,     max: 190,    unite: 'UI/L',      note: 'Creatine phosphokinase' },
  'ck-mb':                    { min: 0,     max: 25,     unite: 'UI/L',      note: 'Fraction myocardique; ou <5% de la CK totale' },
  'myoglobine':               { min: 0,     max: 85,     unite: 'µg/L',      note: 'H: <85 | F: <70' },
  'aslo':                     { min: 0,     max: 200,    unite: 'UI/mL',     note: 'Antistreptolysines O; RAA' },

  // ─────────────────────────────────────────────────────────────────
  // IMMUNOLOGIE / RHUMATOLOGIE
  // ─────────────────────────────────────────────────────────────────
  'facteur rhumatoide':       { min: 0,     max: 14,     unite: 'UI/mL',     note: 'FR; <14 normal' },
  'fr':                       { min: 0,     max: 14,     unite: 'UI/mL',     note: '' },
  'anti-ccp':                 { min: 0,     max: 5,      unite: 'UI/mL',     note: 'Anti-peptides cycliques citrullinés' },
  'ac anti ccp':              { min: 0,     max: 5,      unite: 'UI/mL',     note: '' },
  'aan':                      { min: 0,     max: 80,     unite: 'titre',     note: 'Anticorps anti-nucléaires (ANA); <1/80' },
  'ana':                      { min: 0,     max: 80,     unite: 'titre',     note: '' },
  'anti-dna double brin':     { min: 0,     max: 10,     unite: 'UI/mL',     note: 'Lupus érythémateux disséminé' },
  'iga serique':              { min: 0.7,   max: 4.0,    unite: 'g/L',       note: '' },
  'igg serique':              { min: 7.0,   max: 16.0,   unite: 'g/L',       note: '' },
  'igm serique':              { min: 0.4,   max: 2.3,    unite: 'g/L',       note: '' },
  'ige totales':              { min: 0,     max: 100,    unite: 'kU/L',      note: 'Terrain atopique / parasitoses' },

  // ─────────────────────────────────────────────────────────────────
  // ONCOLOGIE (MARQUEURS TUMORAUX EXTRA)
  // ─────────────────────────────────────────────────────────────────
  'psa total':                { min: 0,     max: 4.0,    unite: 'ng/mL',     note: 'Dépistage hypertrophie/cancer prostate' },
  'psa libre':                { min: 0,     max: 0.5,    unite: 'ng/mL',     note: 'Rapport PSA L/T utilisé si PSA entre 4 et 10' },
  'ace':                      { min: 0,     max: 5.0,    unite: 'ng/mL',     note: 'Antigène carcino-embryonnaire (non-fumeur)' },
  'ca 125':                   { min: 0,     max: 35,     unite: 'UI/mL',     note: 'Marqueur ovarien' },
  'ca125':                    { min: 0,     max: 35,     unite: 'UI/mL',     note: '' },
  'ca 15-3':                  { min: 0,     max: 30,     unite: 'UI/mL',     note: 'Marqueur mammaire' },
  'ca15-3':                   { min: 0,     max: 30,     unite: 'UI/mL',     note: '' },
  'cyfra 21-1':               { min: 0,     max: 3.3,    unite: 'ng/mL',     note: 'Marqueur cancer poumon (non à petites cellules)' },
  's100':                     { min: 0,     max: 0.10,   unite: 'µg/L',      note: 'Protéine S100B; mélanome / TC' },
  'nse':                      { min: 0,     max: 16.3,   unite: 'µg/L',      note: 'Enolase neuro-spécifique' },

  // ─────────────────────────────────────────────────────────────────
  // TOXICOLOGIE & SUIVI THÉRAPEUTIQUE (PHARMACOLOGIE)
  // ─────────────────────────────────────────────────────────────────
  'lithium':                  { min: 0.6,   max: 1.2,    unite: 'mmol/L',    note: 'Zone thérapeutique (lithémie)' },
  'digoxine':                 { min: 0.5,   max: 2.0,    unite: 'ng/mL',     note: 'Seuil toxique >2.0 ng/mL' },
  'vancomycine residuelle':   { min: 15,    max: 20,     unite: 'mg/L',      note: 'Infections sévères (creux)' },
  'ciclosporine':             { min: 100,   max: 400,    unite: 'ng/mL',     note: 'Selon délai post-greffe et organe' },
  'tacrolimus':               { min: 5,     max: 20,     unite: 'ng/mL',     note: 'Suivi immunosuppresseur' },
  'paracetamol':              { min: 10,    max: 30,     unite: 'mg/L',      note: 'Zone thérapeutique; Toxique si >150 à H4 (Nomogramme)' },
  'alcoolémie':               { min: 0,     max: 0,      unite: 'g/L',       note: 'Seuil légal de conduite variable selon pays' },
  'ethanol':                  { min: 0,     max: 0,      unite: 'g/L',       note: '' },
  'plombémie':                { min: 0,     max: 50,     unite: 'µg/L',      note: 'Saturnisme; Seuil d\'alerte de plus en plus bas' },

  // ─────────────────────────────────────────────────────────────────
  // LIQUIDE CÉPHALO-RACHIDIEN (LCR) / NEUROLOGIE
  // ─────────────────────────────────────────────────────────────────
  'lcr proteines':            { min: 0.15,  max: 0.45,   unite: 'g/L',       note: 'Protéinorachie' },
  'proteinorachie':           { min: 0.15,  max: 0.45,   unite: 'g/L',       note: '' },
  'lcr glucose':              { min: 2.2,   max: 4.4,    unite: 'mmol/L',    note: 'Glycorachie; environ 60% de la glycémie' },
  'glycorachie':              { min: 2.2,   max: 4.4,    unite: 'mmol/L',    note: '' },
  'lcr lactates':             { min: 1.1,   max: 2.4,    unite: 'mmol/L',    note: 'Élevé en méningites bactériennes' },
  'lcr leucocytes':           { min: 0,     max: 5,      unite: '/mm3',      note: 'Pathologique si >5' },

};

export function normalizeBioName(name) {
  return (name || '').toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ');
}

export function getBioRef(testName) {
  const normalized = normalizeBioName(testName);
  if (BIO_STANDARDS[normalized]) return BIO_STANDARDS[normalized];
  for (const key of Object.keys(BIO_STANDARDS)) {
    if (normalized.includes(key) || key.includes(normalized)) return BIO_STANDARDS[key];
  }
  return null;
}

export function checkBioStatus(testName, value) {
  if (value === null || value === undefined || value === '' || Number.isNaN(parseFloat(value))) {
    return { label: '', color: 'text-gray-400', ref: 'Néant', status: 'unknown' };
  }

  const refObj = getBioRef(testName);
  if (!refObj) {
    return { label: '', color: 'text-gray-400', ref: 'Inconnu', status: 'unknown' };
  }

  const val = parseFloat(value);
  if (val < refObj.min) {
    return { label: 'BAS', color: 'text-blue-600', ref: `${refObj.min}–${refObj.max} ${refObj.unite}`, status: 'low', note: refObj.note || '', unite: refObj.unite };
  }
  if (val > refObj.max) {
    return { label: 'HAUT', color: 'text-red-600', ref: `${refObj.min}–${refObj.max} ${refObj.unite}`, status: 'high', note: refObj.note || '', unite: refObj.unite };
  }

  return { label: 'NORMAL', color: 'text-green-500', ref: `${refObj.min}–${refObj.max} ${refObj.unite}`, status: 'normal', note: refObj.note || '', unite: refObj.unite };
}
