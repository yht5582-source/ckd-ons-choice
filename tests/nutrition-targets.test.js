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
