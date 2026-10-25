const test = require('node:test');
const assert = require('node:assert/strict');

const { getProteinTarget } = require('../nutrition-targets.js');

test('stable peritoneal dialysis uses the KDOQI 1.0–1.2 g/kg/day range', () => {
  assert.deepEqual(getProteinTarget('pd', 'stable'), {
    min: 1.0,
    max: 1.2,
    label: '1.0~1.2g',
  });
});

test('peritoneal dialysis with ongoing dialysate protein loss uses 1.2–1.3 g/kg/day', () => {
  assert.deepEqual(getProteinTarget('pd', 'protein_loss'), {
    min: 1.2,
    max: 1.3,
    label: '1.2~1.3g',
  });
});

test('peritoneal dialysis with PEW, peritonitis, or catabolism uses 1.3–1.5 g/kg/day', () => {
  assert.deepEqual(getProteinTarget('pd', 'catabolic'), {
    min: 1.3,
    max: 1.5,
    label: '1.3~1.5g',
  });
});

test('hemodialysis keeps its existing target regardless of the PD modifier', () => {
  assert.deepEqual(getProteinTarget('hd', 'catabolic'), {
    min: 1.2,
    max: 1.4,
    label: '1.2~1.4g',
  });
});

test('non-dialysis CKD keeps its existing low-protein target', () => {
  assert.deepEqual(getProteinTarget('ndd', 'stable'), {
    min: 0.6,
    max: 0.8,
    label: '0.6~0.8g',
  });
});

const E = require('../nutrition-targets.js');

const baseState = (over = {}) => {
  const dialysis = over.dialysis || 'ndd';
  const pdProteinStatus = over.pdProteinStatus || 'stable';
  const proteinTarget = E.getProteinTarget(dialysis, pdProteinStatus);
  const body = E.computeBody('male', 165, 60);
  return {
    dialysis, pdProteinStatus, proteinTarget, body,
    needs: E.computeNeeds(body.ibw, proteinTarget),
    appetite: 'decreased', dm: 'no', hba1c: null, alb: null, na: null, k: null, ca: null, p: null,
    ...over,
  };
};
const texts = s => E.buildAlerts(s).map(a => a.text).join('\n');
const dmText = s => E.buildAlerts(s).map(a => a.text).filter(t => t.includes('糖尿病')).join('\n');

test('blank input is null, not a silent default', () => {
  assert.equal(E.num(''), null);
  assert.equal(E.num('  '), null);
  assert.equal(E.num('abc'), null);
  assert.equal(E.num('0'), 0);
  assert.equal(E.num('4.2'), 4.2);
});

test('body: IBW, BMI and invalid height', () => {
  assert.deepEqual(E.computeBody('male', 165, 60), { valid: true, bmi: 22, ibw: 59.5, pctIbw: 101 });
  assert.equal(E.computeBody('female', 158, 48).ibw, 52.8);
  assert.equal(E.computeBody('male', 70, 60).valid, false);
  assert.equal(E.computeBody('male', 165, null).valid, false);
});

test('needs scale with IBW and protein target', () => {
  assert.deepEqual(E.computeNeeds(59.5, E.getProteinTarget('hd')), {
    energyMin: 1785, energyMax: 2083, proteinMin: 71.4, proteinMax: 83.3,
  });
});

test('ranking is deterministic: preferred form first, original order kept', () => {
  assert.deepEqual(E.rankProducts('ndd', 'decreased', null, null).map(p => p.id),
    ['fresubin_renal', 'suplena', 'shenxuan1', 'yinengchong']);
  assert.deepEqual(E.rankProducts('ndd', 'normal', null, null).map(p => p.id),
    ['yinengchong', 'fresubin_renal', 'suplena', 'shenxuan1']);
  assert.deepEqual(E.rankProducts('hd', 'decreased', null, null).map(p => p.id),
    ['shengli2', 'nepro', 'fresubin_protein', 'yuanqiqiang']);
});

test('hyperkalemia sorts liquids by potassium', () => {
  assert.deepEqual(E.rankProducts('hd', 'decreased', 5.6, null).map(p => p.id),
    ['shengli2', 'fresubin_protein', 'nepro', 'yuanqiqiang']);
});

test('PD uses the dialysis product line', () => {
  assert.ok(E.productsFor('pd').every(p => p.type === 'dd'));
});

test('NDD combo totals are computed (Na max is 303, not <288)', () => {
  const c = E.computeCombo('ndd');
  assert.deepEqual(c.kcal, [600, 625]);
  assert.deepEqual(c.protein, [6.8, 11.4]);
  assert.deepEqual(c.na, [253, 303]);
  assert.deepEqual(c.k, [248, 378]);
  assert.deepEqual(c.p, [152, 212]);
});

test('DD combo includes Nepro + 元氣強 = 529 kcal / 27.5 g / K 310.8', () => {
  const c = E.computeCombo('hd');
  assert.equal(c.addon.id, 'yuanqiqiang');
  assert.equal(c.kcal[1], 529);
  assert.ok(c.protein[0] <= 27.5 && c.protein[1] >= 27.5);
  assert.equal(c.k[1], 310.8);
});

test('high K alert only lists products truly below 200 mg in the patient\'s product line', () => {
  const hd = texts(baseState({ dialysis: 'hd', k: 5.4 }));
  assert.match(hd, /元氣強 40.8mg/);
  assert.doesNotMatch(hd, /勝力2 230mg/);
  assert.doesNotMatch(hd, /倍速力/);
  const ndd = texts(baseState({ k: 5.4 }));
  assert.match(ndd, /易能充 108mg、倍速力 140mg/);
  assert.doesNotMatch(ndd, /元氣強/);
});

test('K ≥ 6.0 asks for immediate physician review', () => {
  assert.match(texts(baseState({ k: 6.2 })), /立即通知醫師/);
  assert.doesNotMatch(texts(baseState({ k: 5.5 })), /立即通知醫師/);
});

test('DM alert is dialysis-aware and names only low-GI products', () => {
  const ndd = dmText(baseState({ dm: 'yes', hba1c: 7.8 }));
  assert.match(ndd, /勝補納、思耐得慎選1/);
  assert.doesNotMatch(ndd, /倍速力/);
  const hd = dmText(baseState({ dialysis: 'hd', dm: 'yes', hba1c: 7.8 }));
  assert.match(hd, /透析專用配方<\/b>（普寧勝）/);
  assert.doesNotMatch(hd, /未透析患者/);
  assert.match(hd, /低估/);
});

test('blank labs raise no lab alerts', () => {
  const t = texts(baseState());
  assert.doesNotMatch(t, /Serum K|Serum P|Albumin|Na:|血鈣|HbA1c/);
});

test('Na and corrected Ca are now evaluated', () => {
  assert.match(texts(baseState({ na: 130 })), /低血鈉/);
  assert.equal(E.correctedCa(8.0, 3.0), 8.8);
  assert.equal(E.correctedCa(8.0, 4.2), 8.0);
  assert.match(texts(baseState({ ca: 7.6, alb: 3.5 })), /低血鈣 \(校正鈣 8 mg\/dL/);
  assert.doesNotMatch(texts(baseState({ ca: 8.0, alb: 3.0 })), /低血鈣/);
});

test('BMI < 23 flags the ISRNM PEW body-mass criterion', () => {
  const s = baseState({ body: E.computeBody('female', 158, 48) });
  assert.match(texts(s), /ISRNM/);
});
