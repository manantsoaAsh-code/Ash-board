function toMgDl(creatinine) {
  return Number(creatinine) / 88.4;
}

export function calculateCKDEPI({ creatinine, age, sex }) {
  if (!creatinine || !age || !sex) {
    throw new Error('Paramètres insuffisants pour CKD-EPI');
  }

  const scr = toMgDl(creatinine);
  const normalizedSex = sex.toUpperCase();
  const kappa = normalizedSex === 'F' ? 0.7 : 0.9;
  const alpha = normalizedSex === 'F' ? -0.241 : -0.302;
  const sexFactor = normalizedSex === 'F' ? 1.012 : 1;
  const minRatio = Math.min(scr / kappa, 1);
  const maxRatio = Math.max(scr / kappa, 1);

  return Number((141 * Math.pow(minRatio, alpha) * Math.pow(maxRatio, -1.209) * Math.pow(0.993, age) * sexFactor).toFixed(2));
}

export function calculateCockcroftGault({ creatinine, age, weight, sex }) {
  if (!creatinine || !age || !weight || !sex) {
    throw new Error('Paramètres insuffisants pour Cockcroft');
  }

  const scr = toMgDl(creatinine);
  const normalizedSex = sex.toUpperCase();

  return Number((((140 - age) * weight) / (72 * scr) * (normalizedSex === 'F' ? 0.85 : 1)).toFixed(2));
}

export function calculateMDRD({ creatinine, age, sex, race = 'white' }) {
  if (!creatinine || !age || !sex) {
    throw new Error('Paramètres insuffisants pour MDRD');
  }

  const scr = toMgDl(creatinine);
  const normalizedSex = sex.toUpperCase();
  const sexFactor = normalizedSex === 'F' ? 0.742 : 1;
  const raceFactor = race.toLowerCase() === 'black' ? 1.212 : 1;

  return Number((175 * Math.pow(scr, -1.154) * Math.pow(age, -0.203) * sexFactor * raceFactor).toFixed(2));
}

export function calculatePAM({ systolic, diastolic }) {
  const systolicValue = Number(systolic);
  const diastolicValue = Number(diastolic);

  if (!Number.isFinite(systolicValue) || !Number.isFinite(diastolicValue)) {
    throw new Error('Paramètres insuffisants pour PAM');
  }

  return Number((diastolicValue + ((systolicValue - diastolicValue) / 3)).toFixed(2));
}
