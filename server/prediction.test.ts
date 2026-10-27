import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateRows,
  trainHistorical,
  predict,
  type HistoryRow,
} from './prediction';
// Synthetic fixtures are used only to test numerical behavior; no demo model is shipped to the application.
const fixture = () =>
  Array.from({ length: 100 }, (_, i) => ({
    studentId: 'fixture-' + i,
    cohort: i < 70 ? 202501 : 202601,
    priorGpa: i % 2 ? 1.8 : 3.7,
    attendance: i % 2 ? 55 : 98,
    recentAverage: i % 2 ? 42 : 92,
    scoreTrend: i % 2 ? -15 : 8,
    missingAssignments: i % 2 ? 7 : 0,
    needsSupport: i % 2,
  })) as HistoryRow[];
test('model reports a student-disjoint newer-cohort validation set', () => {
  const model = trainHistorical(validateRows(fixture(), true));
  assert.equal(model.trainingSize, 70);
  assert.equal(model.validationSize, 30);
  assert.equal(model.cutoffCohort, 202601);
  assert.ok(model.metrics.auc! > 0.8);
  assert.ok(model.metrics.brier >= 0 && model.metrics.brier <= 1);
  assert.ok(predict(model, fixture()[1]) > predict(model, fixture()[0]));
});
test('training refuses insufficient records, invalid values, and missing outcome diversity', () => {
  assert.throws(() => trainHistorical(fixture().slice(0, 30)), /60/);
  assert.throws(
    () => validateRows([{ ...fixture()[0], priorGpa: 8 }], true),
    /invalid/,
  );
  assert.throws(
    () => trainHistorical(fixture().map((r) => ({ ...r, needsSupport: 1 }))),
    /each outcome/,
  );
});
test('repeated students are excluded from the training population', () => {
  const rows = fixture();
  rows[70].studentId = rows[0].studentId;
  const model = trainHistorical(rows);
  assert.equal(model.trainingSize, 69);
});
