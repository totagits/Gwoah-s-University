export const featureNames = [
  'priorGpa',
  'attendance',
  'recentAverage',
  'scoreTrend',
  'missingAssignments',
] as const;
export type HistoryRow = {
  studentId: string;
  cohort: number;
  needsSupport?: number;
} & Record<(typeof featureNames)[number], number>;
type Model = {
  weights: number[];
  trainedAt: string;
  trainingSize: number;
  validationSize: number;
  cutoffCohort: number;
  metrics: {
    accuracy: number;
    brier: number;
    auc: number | null;
    precision: number;
    recall: number;
  };
  version: string;
};
const scaled = (r: HistoryRow) => [
  1,
  r.priorGpa / 4,
  r.attendance / 100,
  r.recentAverage / 100,
  r.scoreTrend / 100,
  Math.min(r.missingAssignments, 20) / 20,
];
const sigmoid = (v: number) =>
  1 / (1 + Math.exp(-Math.max(-30, Math.min(30, v))));
export function validateRows(
  input: unknown,
  historical: boolean,
): HistoryRow[] {
  if (!Array.isArray(input) || input.length < 1 || input.length > 20000)
    throw Error('Import between 1 and 20,000 rows.');
  const seen = new Set<string>();
  return input.map((raw: any, index) => {
    const row: HistoryRow = {
      studentId: String(raw.studentId || '').trim(),
      cohort: Number(raw.cohort),
      priorGpa: Number(raw.priorGpa),
      attendance: Number(raw.attendance),
      recentAverage: Number(raw.recentAverage),
      scoreTrend: Number(raw.scoreTrend),
      missingAssignments: Number(raw.missingAssignments),
    };
    if (
      !row.studentId ||
      row.studentId.length > 100 ||
      !Number.isInteger(row.cohort) ||
      row.cohort < 200001 ||
      featureNames.some((k) => raw[k] == null || !['number','string'].includes(typeof raw[k]) || (typeof raw[k]==='string'&&!raw[k].trim()) || !Number.isFinite(row[k])) ||
      row.priorGpa < 0 ||
      row.priorGpa > 4 ||
      row.attendance < 0 ||
      row.attendance > 100 ||
      row.recentAverage < 0 ||
      row.recentAverage > 100 ||
      Math.abs(row.scoreTrend) > 100 ||
      !Number.isInteger(row.missingAssignments) ||
      row.missingAssignments < 0
    )
      throw Error(
        `Row ${index + 2}: invalid student, cohort or feature values.`,
      );
    const key = `${row.studentId}:${row.cohort}`;
    if (seen.has(key))
      throw Error(`Row ${index + 2}: duplicate student/cohort.`);
    seen.add(key);
    if (historical) {
      row.needsSupport = Number(raw.needsSupport);
      if (raw.needsSupport == null || !['number','string'].includes(typeof raw.needsSupport) || (typeof raw.needsSupport==='string'&&!raw.needsSupport.trim()) || ![0, 1].includes(row.needsSupport))
        throw Error(`Row ${index + 2}: needsSupport must be 0 or 1.`);
    }
    return row;
  });
}
export function predict(model: Pick<Model, 'weights'>, row: HistoryRow) {
  return sigmoid(
    scaled(row).reduce((sum, x, i) => sum + x * model.weights[i], 0),
  );
}
export function trainHistorical(rows: HistoryRow[]): Model {
  if (rows.length < 60)
    throw Error('At least 60 labeled historical records are required.');
  const cohorts = [...new Set(rows.map((r) => r.cohort))].sort((a, b) => a - b);
  if (cohorts.length < 2)
    throw Error('Provide at least two cohorts for a chronological holdout.');
  const cutoff = cohorts[cohorts.length - 1];
  const validation = rows.filter((r) => r.cohort === cutoff);
  const heldoutStudents = new Set(validation.map((r) => r.studentId));
  const training = rows.filter(
    (r) => r.cohort < cutoff && !heldoutStudents.has(r.studentId),
  );
  if (training.length < 40 || validation.length < 10)
    throw Error(
      'After excluding held-out students, at least 40 training and 10 newest-cohort validation records are required.',
    );
  for (const set of [training, validation]) {
    if (
      set.filter((r) => r.needsSupport === 1).length < 5 ||
      set.filter((r) => r.needsSupport === 0).length < 5
    )
      throw Error(
        'Both training and validation sets need at least five records of each outcome.',
      );
  }
  const weights = Array(6).fill(0);
  for (let epoch = 0; epoch < 1800; epoch++) {
    const gradients = Array(6).fill(0);
    for (const row of training) {
      const x = scaled(row);
      const error =
        sigmoid(x.reduce((v, a, i) => v + a * weights[i], 0)) -
        row.needsSupport!;
      for (let i = 0; i < 6; i++) gradients[i] += error * x[i];
    }
    for (let i = 0; i < 6; i++)
      weights[i] -=
        0.35 * (gradients[i] / training.length + (i ? 0.01 * weights[i] : 0));
  }
  const result = validation.map((row) => ({
    p: predict({ weights }, row),
    label: row.needsSupport!,
  }));
  let tp = 0,
    fp = 0,
    fn = 0,
    correct = 0,
    brier = 0;
  for (const { p, label } of result) {
    const predicted = p >= 0.5 ? 1 : 0;
    if (predicted === label) correct++;
    if (predicted && label) tp++;
    if (predicted && !label) fp++;
    if (!predicted && label) fn++;
    brier += (p - label) ** 2;
  }
  const positive = result.filter((r) => r.label === 1),
    negative = result.filter((r) => r.label === 0);
  let concordance = 0;
  for (const a of positive)
    for (const b of negative)
      concordance += a.p > b.p ? 1 : a.p === b.p ? 0.5 : 0;
  return {
    weights,
    trainedAt: new Date().toISOString(),
    trainingSize: training.length,
    validationSize: validation.length,
    cutoffCohort: cutoff,
    metrics: {
      accuracy: correct / result.length,
      brier: brier / result.length,
      auc:
        positive.length && negative.length
          ? concordance / (positive.length * negative.length)
          : null,
      precision: tp / (tp + fp || 1),
      recall: tp / (tp + fn || 1),
    },
    version: 'logistic-regression-v1',
  };
}
