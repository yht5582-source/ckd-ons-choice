const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const E = require('../nutrition-targets.js');
const { SOURCES, CASES, QUIZ, MAP, runCase } = require('../teach-content.js');

const root = join(__dirname, '..');
const caseById = (id) => CASES.find((item) => item.id === id);
const fullState = (over) => runCase(E, caseById('ndd-dm').base, over);
const alertText = (r) => E.buildAlerts(r.state).map((a) => a.text).join('\n');

test('six cases: every scenario table matches the engine', () => {
    assert.equal(CASES.length, 6);
    for (const item of CASES) {
        assert.ok(item.scenarios.length >= 2, item.id);
        for (const scenario of item.scenarios) {
            const r = runCase(E, item.base, scenario.patch);
            const label = `${item.id} ${scenario.label}`;
            assert.deepEqual([r.state.needs.energyMin, r.state.needs.energyMax], scenario.expect.energy, `${label} energy`);
            assert.deepEqual([r.state.needs.proteinMin, r.state.needs.proteinMax], scenario.expect.protein, `${label} protein`);
            assert.equal(r.ranked[0].id, scenario.expect.top, `${label} top`);
            assert.equal(r.red, scenario.expect.red, `${label} red`);
            assert.equal(r.amber, scenario.expect.amber, `${label} amber`);
            assert.equal(r.urgent, scenario.expect.urgent, `${label} urgent`);
        }
        for (const key of item.src) assert.ok(SOURCES[key], `${item.id} source ${key}`);
    }
});

test('every field a case sets exists in the form', () => {
    const html = readFileSync(join(root, 'index.html'), 'utf8');
    for (const item of CASES) {
        for (const patch of [item.base, ...item.scenarios.map((s) => s.patch)]) {
            for (const key of Object.keys(patch)) assert.ok(html.includes(`id="${key}"`), `${item.id}: #${key}`);
        }
    }
});

test('quiz: 10 basic + 10 advanced, A–D 5 each, valid sources', () => {
    assert.equal(QUIZ.length, 20);
    assert.equal(QUIZ.filter((q) => q.level === '基礎').length, 10);
    assert.equal(QUIZ.filter((q) => q.level === '高階').length, 10);
    for (let i = 0; i < 4; i += 1) assert.equal(QUIZ.filter((q) => q.answer === i).length, 5, `answer ${i}`);
    for (const q of QUIZ) {
        assert.equal(q.options.length, 4);
        for (const key of q.src) assert.ok(SOURCES[key], key);
    }
});

test('quiz calculations hold in the engine', () => {
    assert.equal(E.computeBody('male', 165, 60).ibw, 59.5);
    assert.deepEqual(QUIZ[0].options[QUIZ[0].answer], '59.5 kg');

    const hd = E.computeNeeds(E.computeBody('female', 158, 48).ibw, E.getProteinTarget('hd'));
    assert.equal(QUIZ[1].options[QUIZ[1].answer], `${hd.proteinMin}–${hd.proteinMax} g`);

    assert.equal(QUIZ[11].options[QUIZ[11].answer], '倍速力（6 g）');
    const list = E.productsFor('ndd');
    const by = (id) => list.find((p) => p.id === id);
    assert.ok(42 + by('fresubin_renal').protein <= 49.3);
    assert.ok(42 + by('suplena').protein > 49.3);
    assert.ok(42 + by('shenxuan1').protein > 49.3);

    assert.equal(E.correctedCa(7.6, 3.0), 8.4);
    const lowCa = runCase(E, caseById('ndd-dm').base, { ca: 7.6, alb: 3.0 });
    assert.doesNotMatch(alertText(lowCa), /低血鈣/);

    const hyperK = runCase(E, caseById('hd-pew').base, { k: 5.6 });
    assert.equal(hyperK.ranked[0].id, 'shengli2');
    assert.ok(hyperK.ranked[0].k >= E.LOW_K_PER_SERVING);
    assert.deepEqual(E.productsFor('hd').filter((p) => p.k < E.LOW_K_PER_SERVING).map((p) => p.id), ['yuanqiqiang']);

    const dd = E.productsFor('hd');
    const a = dd.find((p) => p.id === 'shengli2');
    const b = dd.find((p) => p.id === 'yuanqiqiang');
    assert.equal(a.kcal + b.kcal, 529);
    assert.equal(Math.round((a.protein + b.protein) * 10) / 10, 27.5);
    assert.equal(Math.round((a.k + b.k) * 10) / 10, 270.8);
    assert.equal(a.p + b.p, 236);

    const pd = E.computeNeeds(63, E.getProteinTarget('pd', 'stable'));
    assert.deepEqual([pd.energyMin - 400, pd.energyMax - 400], [1490, 1805]);
});

test('quiz rule statements hold in the engine', () => {
    const lastK = runCase(E, caseById('ndd-dm').base, { k: 6.0 });
    assert.equal(lastK.urgent, true);
    assert.equal(runCase(E, caseById('ndd-dm').base, { k: 5.9 }).urgent, false);

    const pdLowK = runCase(E, caseById('pd-peritonitis').base);
    assert.match(alertText(pdLowK), /不需刻意選擇極低鉀配方/);
    assert.ok(pdLowK.ranked.every((p) => p.type === 'dd'));

    const a1c = runCase(E, caseById('hd-pew').base, { dm: 'yes', hba1c: 6.4 });
    assert.match(alertText(a1c), /可能低估/);
    assert.match(alertText(a1c), /普寧勝/);
    assert.match(alertText(runCase(E, caseById('hd-pew').base, { dm: 'no', hba1c: 7.2 })), /血糖偏高/);
});

test('teaching claims in the cases hold in the engine', () => {
    const dm = fullState({});
    assert.equal(dm.ranked[0].id, 'fresubin_renal');
    assert.equal(dm.ranked[0].lowGI, false);
    assert.match(alertText(dm), /勝補納、思耐得慎選1/);
    assert.equal(dm.ranked[0].kcal, 400);

    const low = runCase(E, caseById('ndd-k').base);
    assert.equal(low.ranked[0].kcal, 200);
    assert.equal(low.ranked[0].protein, 0.8);
    assert.equal(low.ranked[0].k, 108);
    const ibw = low.state.body.ibw;
    assert.equal(ibw, 51);
    assert.deepEqual([Math.round(ibw * 0.55 * 10) / 10, Math.round(ibw * 0.6 * 10) / 10], [28.1, 30.6]);
    assert.deepEqual([ibw * 25, ibw * 35], [1275, 1785]);

    const pew = runCase(E, caseById('hd-pew').base);
    assert.equal(E.correctedCa(8.8, 3.2), 9.4);
    assert.equal(pew.state.body.bmi, 19.2);
    assert.deepEqual([Math.round(52.8 * 1.0 * 10) / 10, Math.round(52.8 * 1.2 * 10) / 10], [52.8, 63.4]);
    assert.equal(Math.round(52.8 * 22), 1162);
    assert.equal(Math.round(52.8 * 0.7), 37);

    assert.equal(E.correctedCa(7.8, 2.9), 8.7);
    const lowGI = E.productsFor('pd').filter((p) => p.lowGI).map((p) => p.id);
    assert.deepEqual(lowGI, ['nepro']);

    const obese = runCase(E, caseById('hd-hyperk').base);
    assert.equal(obese.state.body.pctIbw, 121);
    assert.equal(obese.ranked[0].preferred, true);

    const frail = runCase(E, caseById('ndd-refeeding').base);
    assert.equal(frail.state.body.bmi, 16.9);
    assert.equal(frail.ranked[0].kcal, 400);
    assert.match(alertText(frail), /再餵食/);
});

test('mind map has six branches and renders text in every leaf', () => {
    assert.equal(MAP.branches.length, 6);
    for (const branch of MAP.branches) assert.ok(branch.leaves.length >= 3, branch.title);
});

test('page wires up teach files with the same version', () => {
    const html = readFileSync(join(root, 'index.html'), 'utf8');
    const versions = [...html.matchAll(/(?:nutrition-targets|teach-content|teach)\.(?:js|css)\?v=([\d.]+)/g)].map((m) => m[1]);
    assert.equal(versions.length, 4);
    assert.equal(new Set(versions).size, 1);
    for (const view of ['tool', 'cases', 'quiz', 'map']) {
        assert.ok(html.includes(`id="view-${view}"`), view);
        assert.ok(html.includes(`id="tab-${view}"`), view);
    }
});
