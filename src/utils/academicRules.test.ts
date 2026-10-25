import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateGPA,
  evaluateAcademicStanding,
  validateCourseAdd,
  validateCourseDrop,
  calculateDegreeProgress,
  scoreToLetterGrade,
} from './academicRules';

test('scoreToLetterGrade accurately maps percentage scores to NCHE grade boundaries', () => {
  assert.equal(scoreToLetterGrade(95), 'A');
  assert.equal(scoreToLetterGrade(90), 'A');
  assert.equal(scoreToLetterGrade(88), 'B+');
  assert.equal(scoreToLetterGrade(82), 'B');
  assert.equal(scoreToLetterGrade(77), 'C+');
  assert.equal(scoreToLetterGrade(72), 'C');
  assert.equal(scoreToLetterGrade(65), 'D');
  assert.equal(scoreToLetterGrade(45), 'F');
});

test('calculateGPA calculates standard Liberian university quality points correctly', () => {
  const grades = [
    { courseCode: 'CSC 101', credits: 3, letterGrade: 'A' }, // 4.0 * 3 = 12
    { courseCode: 'ENG 101', credits: 3, letterGrade: 'B+' }, // 3.5 * 3 = 10.5
    { courseCode: 'MAT 101', credits: 4, letterGrade: 'B' }, // 3.0 * 4 = 12
    { courseCode: 'PHY 101', credits: 4, letterGrade: 'C' }, // 2.0 * 4 = 8
  ];
  // Total Quality Points = 12 + 10.5 + 12 + 8 = 42.5
  // Total Credits = 14
  // GPA = 42.5 / 14 = 3.0357... -> 3.04
  const gpa = calculateGPA(grades);
  assert.equal(gpa, 3.04);
});

test('calculateGPA returns 0.0 for empty grade array', () => {
  assert.equal(calculateGPA([]), 0.0);
});

test('evaluateAcademicStanding categorizes honors and probation correctly', () => {
  assert.equal(evaluateAcademicStanding(3.85), 'Dean\'s List');
  assert.equal(evaluateAcademicStanding(3.50), 'Dean\'s List');
  assert.equal(evaluateAcademicStanding(3.20), 'Good Standing');
  assert.equal(evaluateAcademicStanding(2.00), 'Good Standing');
  assert.equal(evaluateAcademicStanding(1.85), 'Academic Probation');
});

test('validateCourseAdd blocks students with financial hold', () => {
  const result = validateCourseAdd({
    currentCredits: 15,
    courseCredits: 3,
    enrolledStudents: 10,
    capacity: 35,
    studentCompletedPrereqs: ['MAT 101'],
    coursePrereqs: ['MAT 101'],
    hasFinancialHold: true,
  });
  assert.equal(result.allowed, false);
  assert.match(result.error || '', /financial hold/i);
});

test('validateCourseAdd blocks enrollment when section is full', () => {
  const result = validateCourseAdd({
    currentCredits: 12,
    courseCredits: 3,
    enrolledStudents: 40,
    capacity: 40,
    studentCompletedPrereqs: ['MAT 101'],
    coursePrereqs: ['MAT 101'],
    hasFinancialHold: false,
  });
  assert.equal(result.allowed, false);
  assert.match(result.error || '', /maximum capacity/i);
});

test('validateCourseAdd blocks enrollment exceeding maximum semester credit load', () => {
  const result = validateCourseAdd({
    currentCredits: 19,
    courseCredits: 3, // 19 + 3 = 22 > 21
    maxCreditsLimit: 21,
    enrolledStudents: 15,
    capacity: 40,
    studentCompletedPrereqs: ['MAT 101'],
    coursePrereqs: ['MAT 101'],
    hasFinancialHold: false,
  });
  assert.equal(result.allowed, false);
  assert.match(result.error || '', /credit load/i);
});

test('validateCourseDrop blocks drop if student falls below minimum full-time credits', () => {
  const result = validateCourseDrop({
    currentCredits: 14,
    courseCredits: 3, // 14 - 3 = 11 < 12
    courseFeeUSD: 150,
    minCreditsLimit: 12,
    semesterWeek: 1,
  });
  assert.equal(result.allowed, false);
  assert.equal(result.resultingCredits, 11);
});

test('validateCourseDrop gives full refund in week 2 and partial refund in week 4', () => {
  // Week 2: 100% refund
  const week2 = validateCourseDrop({
    currentCredits: 18,
    courseCredits: 3,
    courseFeeUSD: 180,
    minCreditsLimit: 12,
    semesterWeek: 2,
  });
  assert.equal(week2.allowed, true);
  assert.equal(week2.financialAdjustmentUSD, -180);
  assert.equal(week2.recordedStatus, 'dropped');

  // Week 4: 50% refund, recorded as withdrawn
  const week4 = validateCourseDrop({
    currentCredits: 18,
    courseCredits: 3,
    courseFeeUSD: 180,
    minCreditsLimit: 12,
    semesterWeek: 4,
  });
  assert.equal(week4.allowed, true);
  assert.equal(week4.financialAdjustmentUSD, -90);
  assert.equal(week4.recordedStatus, 'withdrawn');
});

test('calculateDegreeProgress accurately measures progression', () => {
  assert.equal(calculateDegreeProgress(64, 128), 50.0);
  assert.equal(calculateDegreeProgress(96, 128), 75.0);
  assert.equal(calculateDegreeProgress(130, 128), 100);
});
