import test from 'node:test';
import assert from 'node:assert/strict';
import { computeTaskAnalytics, filterTasks } from './taskAnalytics';
import { UniversityTask } from '../types';

const mockTasks: UniversityTask[] = [
  {
    id: 't-1',
    title: 'NCHE Self-Study Curriculum Review for B.Sc. Mining Engineering',
    description: 'Ensure compliance with NCHE engineering standard',
    category: 'accreditation_nche',
    priority: 'urgent',
    status: 'in_progress',
    assigneeName: 'Dr. Joseph Flomo',
    assigneeRole: 'dean',
    assigneeEmail: 'j.flomo@university.edu.lr',
    dueDate: '2026-11-15T00:00:00Z',
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-10T00:00:00Z',
    tags: ['NCHE', 'Engineering', 'Curriculum'],
    department: 'Engineering',
    slaDays: 14,
  },
  {
    id: 't-2',
    title: 'Admissions WASSCE Verification Batch 1',
    description: 'Verify senior high school credentials',
    category: 'admissions',
    priority: 'high',
    status: 'completed',
    assigneeName: 'Helena Kollie',
    assigneeRole: 'admissions_officer',
    assigneeEmail: 'h.kollie@university.edu.lr',
    dueDate: '2026-10-20T00:00:00Z',
    createdAt: '2026-10-05T00:00:00Z',
    updatedAt: '2026-10-18T00:00:00Z',
    tags: ['WASSCE', 'Admissions'],
    department: 'Registry',
    slaDays: 7,
  },
  {
    id: 't-3',
    title: 'Bursar Reconciliation of EcoBank and MTN Mobile Money Deposits',
    description: 'Daily cash and mobile money reconciliation',
    category: 'finance',
    priority: 'medium',
    status: 'todo',
    assigneeName: 'Samuel Barclay',
    assigneeRole: 'bursar',
    assigneeEmail: 's.barclay@university.edu.lr',
    dueDate: '2026-10-22T00:00:00Z', // past due relative to 2026-10-24
    createdAt: '2026-10-15T00:00:00Z',
    updatedAt: '2026-10-15T00:00:00Z',
    tags: ['Finance', 'Audit', 'Reconciliation'],
    department: 'Bursar',
    slaDays: 3,
  },
];

test('computeTaskAnalytics computes accurate counts and rates', () => {
  const analytics = computeTaskAnalytics(mockTasks, '2026-10-24T20:00:00Z');
  assert.equal(analytics.totalTasks, 3);
  assert.equal(analytics.completedTasks, 1);
  assert.equal(analytics.inProgressTasks, 1);
  assert.equal(analytics.todoTasks, 1);
  assert.equal(analytics.urgentCount, 1);
  assert.equal(analytics.highCount, 1);
  assert.equal(analytics.completionRate, 33);
  // t-3 due on 2026-10-22 is overdue relative to 2026-10-24
  assert.equal(analytics.overdueTasksCount, 1);
  assert.equal(analytics.byDepartment['Engineering'], 1);
  assert.equal(analytics.byDepartment['Registry'], 1);
  assert.equal(analytics.byDepartment['Bursar'], 1);
});

test('filterTasks correctly filters by status, priority, and search query', () => {
  const completed = filterTasks(mockTasks, { status: 'completed' });
  assert.equal(completed.length, 1);
  assert.equal(completed[0].id, 't-2');

  const urgent = filterTasks(mockTasks, { priority: 'urgent' });
  assert.equal(urgent.length, 1);
  assert.equal(urgent[0].id, 't-1');

  const searched = filterTasks(mockTasks, { searchQuery: 'Mobile Money' });
  assert.equal(searched.length, 1);
  assert.equal(searched[0].id, 't-3');
});
