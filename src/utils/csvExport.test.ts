import test from 'node:test';
import assert from 'node:assert/strict';
import { generateAnalyticsCSV } from './csvExport';
import { AnalyticsOverview } from '../services/api';

const mockAnalytics: AnalyticsOverview = {
  taskMetrics: {
    totalTasks: 10,
    completedTasks: 4,
    inProgressTasks: 3,
    reviewTasks: 2,
    todoTasks: 1,
    backlogTasks: 0,
    completionRate: 40,
    urgentCount: 2,
    highCount: 3,
    overdueTasksCount: 1,
    byCategory: { accreditation_nche: 4, finance: 3, admissions: 3 },
    byDepartment: { Registry: 4, Engineering: 3, Finance: 3 },
    slaComplianceRate: 85,
  },
  admissionsFunnel: {
    totalApplications: 120,
    admitted: 45,
    underReview: 60,
    conditional: 15,
    conversionRate: 38,
  },
  academics: {
    activeStudents: 1850,
    totalCourseSections: 24,
    totalEnrolledSeats: 820,
    totalCapacitySeats: 1000,
    capacityUtilization: 82,
    averageCGPA: 3.25,
    attendanceRate: 93.5,
  },
  finance: {
    tuitionBilledUSD: 150000,
    tuitionCollectedUSD: 120000,
    scholarshipSubsidyUSD: 18000,
    outstandingReceivablesUSD: 12000,
    collectionRate: 92,
  },
  collegeEnrollment: [
    { college: 'Engineering & Computing', enrolled: 500, color: '#2563eb' },
    { college: 'Health & Medical Sciences', enrolled: 450, color: '#059669' },
  ],
  compliance: {
    ncheScore: 100,
    totalPoliciesTracked: 4,
    auditLogCount: 18,
  },
};

test('generateAnalyticsCSV formats valid CSV lines with headers and values', () => {
  const csv = generateAnalyticsCSV(mockAnalytics);

  assert.ok(csv.includes("Gwoah's University - Institutional Analytics Report"));
  assert.ok(csv.includes("National Commission on Higher Education (NCHE)"));
  assert.ok(csv.includes("Task Completion Rate,40,%"));
  assert.ok(csv.includes("Admissions Conversion Yield,38,%"));
  assert.ok(csv.includes("Tuition Billed USD,150000.00,USD"));
  assert.ok(csv.includes('"Engineering & Computing",500,27.0%'));
  assert.ok(csv.includes('"Registry",4'));
});
