/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { test } from 'node:test';
import assert from 'node:assert';
import {
  filterLibraryResources,
  computeLibraryStats,
  formatResourceCitation,
  generateResourceDownload,
} from './resourceLibrary';
import { LibraryResource } from '../types';

const sampleResources: LibraryResource[] = [
  {
    id: 'res-01',
    title: 'CSC 301 Data Structures & Algorithms Syllabus',
    category: 'course_material',
    subcategory: 'Course Syllabus',
    courseCode: 'CSC 301',
    authorOrAuthority: 'Dr. Moses S. Doe',
    publishedDate: '2026-10-02',
    academicYear: '2026/2027',
    version: 'v2.1',
    fileFormat: 'PDF',
    fileSizeKB: 245,
    description: 'Senate approved syllabus covering asymptotic complexity and trees.',
    contentSummary: 'Week-by-week curriculum covering Big-O, AVL trees, and sorting algorithms.',
    keyHighlights: ['Weekly laboratory assignments', 'Midterm examination rules', 'NCHE 3-credit alignment'],
    isPinned: true,
    tags: ['algorithms', 'python', 'syllabus'],
  },
  {
    id: 'res-02',
    title: 'NCHE Institutional Accreditation & Program Recognition Manual',
    category: 'nche_guideline',
    subcategory: 'Accreditation Standard',
    authorOrAuthority: 'National Commission on Higher Education (NCHE)',
    publishedDate: '2026-08-15',
    academicYear: '2026/2027',
    version: 'Gazette 2026 Rev',
    fileFormat: 'PDF',
    fileSizeKB: 820,
    statutoryReference: 'NCHE Act Sec. 4',
    description: 'Mandates minimum 120-132 credits for 4-year Baccalaureate degrees.',
    contentSummary: 'Statutory criteria for higher education licensing in Liberia.',
    keyHighlights: ['120-132 credits minimum', '30% terminal PhD faculty rule', 'Semester credit bounds 12-21'],
    isPinned: true,
    tags: ['accreditation', 'standards', 'baccalaureate'],
  },
  {
    id: 'res-03',
    title: "Gwoah's University Undergraduate Student Handbook",
    category: 'institutional_handbook',
    subcategory: 'Student Handbook',
    authorOrAuthority: 'Office of the Dean of Students',
    publishedDate: '2026-09-01',
    academicYear: '2026/2027',
    version: '2026/2027 Ed',
    fileFormat: 'PDF',
    fileSizeKB: 410,
    description: 'Official student code of conduct, grading rules, and academic honor code.',
    contentSummary: 'Comprehensive guide covering examination conduct, student welfare, and campus housing.',
    keyHighlights: ['Honor code and academic integrity', 'Add/Drop procedures', 'Dean list criteria'],
    isPinned: false,
    tags: ['handbook', 'student code', 'conduct'],
  },
];

test('filterLibraryResources filters accurately by category', () => {
  const courseOnly = filterLibraryResources(sampleResources, { category: 'course_material' });
  assert.strictEqual(courseOnly.length, 1);
  assert.strictEqual(courseOnly[0].id, 'res-01');

  const ncheOnly = filterLibraryResources(sampleResources, { category: 'nche_guideline' });
  assert.strictEqual(ncheOnly.length, 1);
  assert.strictEqual(ncheOnly[0].id, 'res-02');

  const all = filterLibraryResources(sampleResources, { category: 'all' });
  assert.strictEqual(all.length, 3);
});

test('filterLibraryResources searches keywords across title, description, and statutory ref', () => {
  const matchSearch = filterLibraryResources(sampleResources, { search: 'NCHE Act Sec. 4' });
  assert.strictEqual(matchSearch.length, 1);
  assert.strictEqual(matchSearch[0].id, 'res-02');

  const matchTag = filterLibraryResources(sampleResources, { search: 'python' });
  assert.strictEqual(matchTag.length, 1);
  assert.strictEqual(matchTag[0].id, 'res-01');
});

test('filterLibraryResources respects maxFileSizeKB for low-bandwidth environments', () => {
  const lowBandwidth = filterLibraryResources(sampleResources, { maxFileSizeKB: 500 });
  // Should include res-01 (245 KB) and res-03 (410 KB), but exclude res-02 (820 KB)
  assert.strictEqual(lowBandwidth.length, 2);
  assert.ok(!lowBandwidth.some((r) => r.id === 'res-02'));
});

test('filterLibraryResources respects pinnedOnly filter', () => {
  const pinned = filterLibraryResources(sampleResources, { pinnedOnly: true });
  assert.strictEqual(pinned.length, 2);
  assert.ok(pinned.every((r) => r.isPinned));
});

test('computeLibraryStats aggregates counts correctly', () => {
  const stats = computeLibraryStats(sampleResources);
  assert.strictEqual(stats.total, 3);
  assert.strictEqual(stats.courseMaterials, 1);
  assert.strictEqual(stats.ncheGuidelines, 1);
  assert.strictEqual(stats.institutionalHandbooks, 1);
  assert.strictEqual(stats.pinnedCount, 2);
  assert.strictEqual(stats.lowBandwidthCount, 2);
  assert.strictEqual(stats.totalStorageKB, 1475);
});

test('formatResourceCitation formats proper academic citation string', () => {
  const citation = formatResourceCitation(sampleResources[1]);
  assert.ok(citation.includes('National Commission on Higher Education (NCHE) (2026)'));
  assert.ok(citation.includes('NCHE Act Sec. 4'));
  assert.ok(citation.includes("Gwoah's University"));
});

test('generateResourceDownload produces downloadable markdown with metadata and contents', () => {
  const doc = generateResourceDownload(sampleResources[0]);
  assert.ok(doc.filename.endsWith('.md'));
  assert.ok(doc.content.includes('# CSC 301 Data Structures & Algorithms Syllabus'));
  assert.ok(doc.content.includes('Dr. Moses S. Doe'));
  assert.ok(doc.content.includes('CSC 301'));
  assert.ok(doc.content.includes('OFFICIAL CITATION:'));
});
