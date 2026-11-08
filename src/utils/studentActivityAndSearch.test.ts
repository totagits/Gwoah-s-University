/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  matchesSearchCriteria,
  filterUnifiedItems,
  computeActivitySummary,
} from './studentActivityAndSearch';

test('matchesSearchCriteria matches query against title, description, or courseCode', () => {
  const item = {
    title: 'CSC 301 Data Structures Exam',
    description: 'Final examination in Fendall Hall',
    courseCode: 'CSC 301',
  };

  assert.equal(
    matchesSearchCriteria(item.title, item.description, item.courseCode, {
      query: 'structures',
      type: 'all',
      courseCode: 'all',
    }),
    true
  );

  assert.equal(
    matchesSearchCriteria(item.title, item.description, item.courseCode, {
      query: 'fendall',
      type: 'all',
      courseCode: 'all',
    }),
    true
  );

  assert.equal(
    matchesSearchCriteria(item.title, item.description, item.courseCode, {
      query: 'CSC 301',
      type: 'all',
      courseCode: 'CSC 301',
    }),
    true
  );

  assert.equal(
    matchesSearchCriteria(item.title, item.description, item.courseCode, {
      query: 'chemistry',
      type: 'all',
      courseCode: 'all',
    }),
    false
  );
});

test('filterUnifiedItems filters collection by courseCode and query string', () => {
  const items = [
    { title: 'AVL Trees Lecture', description: 'Self-balancing trees', courseCode: 'CSC 301' },
    { title: 'OOP Polymorphism', description: 'Java inheritance', courseCode: 'CSC 201' },
    { title: 'Calculus Integration', description: 'Definite integrals', courseCode: 'MAT 201' },
  ];

  const cscOnly = filterUnifiedItems(items, '', 'CSC 301');
  assert.equal(cscOnly.length, 1);
  assert.equal(cscOnly[0].title, 'AVL Trees Lecture');

  const treesQuery = filterUnifiedItems(items, 'balancing', 'all');
  assert.equal(treesQuery.length, 1);
  assert.equal(treesQuery[0].courseCode, 'CSC 301');
});

test('computeActivitySummary correctly categorizes timeline events', () => {
  const events = [
    { type: 'submission', status: 'completed' },
    { type: 'submission', status: 'completed' },
    { type: 'grade', status: 'verified' },
    { type: 'library', status: 'borrowed' },
    { type: 'work_order', status: 'pending' },
  ];

  const summary = computeActivitySummary(events);
  assert.equal(summary.total, 5);
  assert.equal(summary.submissions, 2);
  assert.equal(summary.grades, 1);
  assert.equal(summary.library, 1);
  assert.equal(summary.orders, 1);
});
