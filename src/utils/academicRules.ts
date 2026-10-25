/**
 * Pure logic rules for Liberian Higher Education academic standing,
 * GPA calculations, credit caps, and Add/Drop validation.
 */

export interface GradeEntry {
  courseCode: string;
  credits: number;
  letterGrade: string;
}

export const GRADE_POINTS_MAP: Record<string, number> = {
  'A': 4.0,
  'B+': 3.5,
  'B': 3.0,
  'C+': 2.5,
  'C': 2.0,
  'D': 1.0,
  'F': 0.0,
};

/**
 * Maps numeric percentage score (0-100) to standard Liberian university letter grade.
 */
export function scoreToLetterGrade(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 85) return 'B+';
  if (score >= 80) return 'B';
  if (score >= 75) return 'C+';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

/**
 * Calculates semester GPA or CGPA given grade entries.
 */
export function calculateGPA(grades: GradeEntry[]): number {
  if (!grades || grades.length === 0) return 0.0;

  let totalQualityPoints = 0;
  let totalCredits = 0;

  for (const item of grades) {
    const point = GRADE_POINTS_MAP[item.letterGrade.toUpperCase()];
    if (point !== undefined && item.credits > 0) {
      totalQualityPoints += point * item.credits;
      totalCredits += item.credits;
    }
  }

  if (totalCredits === 0) return 0.0;
  return Math.round((totalQualityPoints / totalCredits) * 100) / 100;
}

/**
 * Evaluates academic standing based on CGPA.
 */
export function evaluateAcademicStanding(cgpa: number): 'Dean\'s List' | 'Good Standing' | 'Academic Probation' {
  if (cgpa >= 3.5) return 'Dean\'s List';
  if (cgpa >= 2.0) return 'Good Standing';
  return 'Academic Probation';
}

export interface AddDropValidationResult {
  allowed: boolean;
  reason?: string;
  resultingCredits: number;
  financialAdjustmentUSD: number;
  recordedStatus: 'dropped' | 'withdrawn';
}

/**
 * Validates course addition against credit limits, prerequisites, and capacity.
 */
export function validateCourseAdd(params: {
  currentCredits: number;
  courseCredits: number;
  maxCreditsLimit?: number;
  enrolledStudents: number;
  capacity: number;
  studentCompletedPrereqs: string[];
  coursePrereqs: string[];
  hasFinancialHold: boolean;
}): { allowed: boolean; error?: string } {
  const {
    currentCredits,
    courseCredits,
    maxCreditsLimit = 21,
    enrolledStudents,
    capacity,
    studentCompletedPrereqs,
    coursePrereqs,
    hasFinancialHold,
  } = params;

  if (hasFinancialHold) {
    return {
      allowed: false,
      error: 'Cannot register: Bursar financial hold is active on student account.',
    };
  }

  if (enrolledStudents >= capacity) {
    return {
      allowed: false,
      error: `Section is at maximum capacity (${enrolledStudents}/${capacity} seats). Waitlist required.`,
    };
  }

  if (currentCredits + courseCredits > maxCreditsLimit) {
    return {
      allowed: false,
      error: `Exceeds maximum allowable semester credit load of ${maxCreditsLimit} credits. Special Senate approval required.`,
    };
  }

  const missingPrereqs = coursePrereqs.filter(
    (prereq) => !studentCompletedPrereqs.includes(prereq)
  );

  if (missingPrereqs.length > 0) {
    return {
      allowed: false,
      error: `Prerequisite unsatisfied: Must complete ${missingPrereqs.join(', ')} before enrolling.`,
    };
  }

  return { allowed: true };
}

/**
 * Validates course drop and calculates refund/fee implications according to semester week.
 */
export function validateCourseDrop(params: {
  currentCredits: number;
  courseCredits: number;
  courseFeeUSD: number;
  minCreditsLimit?: number;
  semesterWeek: number; // 1 to 16
}): AddDropValidationResult {
  const {
    currentCredits,
    courseCredits,
    courseFeeUSD,
    minCreditsLimit = 12,
    semesterWeek,
  } = params;

  const resultingCredits = currentCredits - courseCredits;

  if (resultingCredits < minCreditsLimit) {
    return {
      allowed: false,
      reason: `Dropping this course reduces semester load to ${resultingCredits} credits, below the full-time student threshold of ${minCreditsLimit} credits.`,
      resultingCredits,
      financialAdjustmentUSD: 0,
      recordedStatus: 'dropped',
    };
  }

  // Liberian Higher Education Add/Drop policy:
  // Week 1-2: Normal Add/Drop with 100% refund, course dropped without transcript notation.
  // Week 3-4: Late drop with 50% refund, recorded as 'W' (Withdrawn).
  // Week 5+: No refund (0%), recorded as 'W' (Withdrawn).
  if (semesterWeek <= 2) {
    return {
      allowed: true,
      resultingCredits,
      financialAdjustmentUSD: -courseFeeUSD, // Full refund
      recordedStatus: 'dropped',
    };
  } else if (semesterWeek <= 4) {
    return {
      allowed: true,
      resultingCredits,
      financialAdjustmentUSD: -(courseFeeUSD * 0.5), // 50% refund
      recordedStatus: 'withdrawn',
    };
  } else {
    return {
      allowed: true,
      resultingCredits,
      financialAdjustmentUSD: 0, // No refund
      recordedStatus: 'withdrawn',
    };
  }
}

/**
 * Calculates degree progress percentage.
 */
export function calculateDegreeProgress(creditsEarned: number, targetCredits: number): number {
  if (targetCredits <= 0) return 0;
  const progress = (creditsEarned / targetCredits) * 100;
  return Math.min(100, Math.round(progress * 10) / 10);
}
