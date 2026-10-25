import { AnalyticsOverview } from '../services/api';

/**
 * Generates a clean, comprehensive CSV document string from university analytics data.
 * Formatted for offline reporting and spreadsheet analysis.
 */
export function generateAnalyticsCSV(analytics: AnalyticsOverview): string {
  const lines: string[] = [];

  // Header and Metadata
  lines.push('Gwoah\'s University - Institutional Analytics Report');
  lines.push(`Generated Date,${new Date().toISOString()}`);
  lines.push('Accreditation Body,National Commission on Higher Education (NCHE) - Republic of Liberia');
  lines.push('Reporting Period,Semester I 2026/2027');
  lines.push('');

  // 1. Executive KPIs Section
  lines.push('--- EXECUTIVE PERFORMANCE INDICATORS ---');
  lines.push('Indicator,Value,Unit / Status');
  lines.push(`Task Completion Rate,${analytics.taskMetrics.completionRate},%`);
  lines.push(`Task SLA Compliance Rate,${analytics.taskMetrics.slaComplianceRate},%`);
  lines.push(`Total Institutional Tasks,${analytics.taskMetrics.totalTasks},Tasks`);
  lines.push(`Tasks Completed,${analytics.taskMetrics.completedTasks},Tasks`);
  lines.push(`Tasks In Progress,${analytics.taskMetrics.inProgressTasks},Tasks`);
  lines.push(`Tasks in Senate/Dept Review,${analytics.taskMetrics.reviewTasks},Tasks`);
  lines.push(`Overdue Tasks,${analytics.taskMetrics.overdueTasksCount},Tasks`);
  lines.push(`Admissions Conversion Yield,${analytics.admissionsFunnel.conversionRate},%`);
  lines.push(`Total Applicants,${analytics.admissionsFunnel.totalApplications},Candidates`);
  lines.push(`Admitted Students,${analytics.admissionsFunnel.admitted},Students`);
  lines.push(`Applications Under Review,${analytics.admissionsFunnel.underReview},Candidates`);
  lines.push(`Conditional Admissions,${analytics.admissionsFunnel.conditional},Candidates`);
  lines.push(`Tuition Billed USD,${analytics.finance.tuitionBilledUSD.toFixed(2)},USD`);
  lines.push(`Tuition Collected USD,${analytics.finance.tuitionCollectedUSD.toFixed(2)},USD`);
  lines.push(`Scholarship & Grant Subsidy USD,${analytics.finance.scholarshipSubsidyUSD.toFixed(2)},USD`);
  lines.push(`Outstanding Receivables USD,${analytics.finance.outstandingReceivablesUSD.toFixed(2)},USD`);
  lines.push(`Bursar Collection Rate,${analytics.finance.collectionRate},%`);
  lines.push(`NCHE Regulatory Compliance Score,${analytics.compliance.ncheScore},%`);
  lines.push(`Active Enrolled Scholars,${analytics.academics.activeStudents},Students`);
  lines.push(`Class Section Capacity Utilization,${analytics.academics.capacityUtilization},%`);
  lines.push(`Institutional Average CGPA,${analytics.academics.averageCGPA},GPA (4.0 Scale)`);
  lines.push(`Campus Attendance Rate,${analytics.academics.attendanceRate},%`);
  lines.push('');

  // 2. College Enrollment Breakdown
  lines.push('--- UNDERGRADUATE ENROLLMENT BY COLLEGE ---');
  lines.push('Faculty / College,Enrolled Students,Percentage Share (%)');
  const totalEnrolled = analytics.academics.activeStudents || 1850;
  for (const col of analytics.collegeEnrollment) {
    const share = ((col.enrolled / totalEnrolled) * 100).toFixed(1);
    lines.push(`"${col.college}",${col.enrolled},${share}%`);
  }
  lines.push('');

  // 3. Departmental Task Workload
  lines.push('--- DEPARTMENTAL TASK WORKLOAD ALLOCATION ---');
  lines.push('Department,Assigned Active Tasks');
  for (const [dept, count] of Object.entries(analytics.taskMetrics.byDepartment)) {
    lines.push(`"${dept}",${count}`);
  }
  lines.push('');

  // 4. Task Category Breakdown
  lines.push('--- TASK CATEGORY DISTRIBUTION ---');
  lines.push('Category,Count');
  for (const [cat, count] of Object.entries(analytics.taskMetrics.byCategory)) {
    lines.push(`"${cat}",${count}`);
  }

  return lines.join('\n');
}

/**
 * Initiates client-side file download of CSV content.
 */
export function downloadCSV(csvContent: string, fileName: string = 'Gwoahs_University_Analytics_Report.csv') {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
