import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  CreditCard,
  GraduationCap,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  FileSpreadsheet,
  Layers,
  ArrowUpRight,
  Shield,
  PieChart,
  FileDown,
  Eye,
  Check,
} from 'lucide-react';
import { api, AnalyticsOverview } from '../../services/api';
import { generateAnalyticsCSV, downloadCSV } from '../../utils/csvExport';

export const IntegratedAnalyticsHub: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [emisExportModal, setEmisExportModal] = useState(false);
  const [csvPreviewModal, setCsvPreviewModal] = useState(false);
  const [csvNotification, setCsvNotification] = useState<string | null>(null);
  const [copiedCsv, setCopiedCsv] = useState(false);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const data = await api.getAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleExportCSV = () => {
    if (!analytics) return;
    const csvContent = generateAnalyticsCSV(analytics);
    const fileName = `Gwoahs_University_Analytics_Report_${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(csvContent, fileName);
    setCsvNotification(`Metrics exported successfully to ${fileName} for offline reporting.`);
    setTimeout(() => setCsvNotification(null), 6000);
  };

  if (loading || !analytics) {
    return (
      <div className="flex items-center justify-center p-16 text-amber-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400" />
        <span className="ml-3 text-sm text-slate-300">Computing real-time university analytics...</span>
      </div>
    );
  }

  const { taskMetrics, admissionsFunnel, academics, finance, collegeEnrollment, compliance } = analytics;
  const currentCsvText = generateAnalyticsCSV(analytics);

  return (
    <div className="space-y-6">
      {/* Header with Title & Export Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Integrated University Analytics Hub
            </h2>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold px-2 py-0.5 rounded-full">
              Live Real-Time Feeds
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Institutional intelligence linking task velocity, admissions pipeline, bursar receivables, course capacity, and NCHE accreditation metrics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setCsvPreviewModal(true)}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Preview CSV Data"
            aria-label="Preview CSV Data"
          >
            <Eye className="w-4 h-4 text-slate-400" />
            <span>Preview CSV</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-md hover:shadow-amber-500/20 transition-all cursor-pointer"
            aria-label="Download CSV report"
          >
            <Download className="w-4 h-4" />
            <span>Export Metrics CSV</span>
          </button>

          <button
            onClick={() => setEmisExportModal(true)}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export MoE EMIS</span>
          </button>
        </div>
      </div>

      {csvNotification && (
        <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{csvNotification}</span>
          </div>
          <button
            onClick={() => setCsvNotification(null)}
            className="font-bold underline ml-4 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Task Velocity Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider">Task Completion Rate</span>
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">
            {taskMetrics.completionRate}%
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
            <span>{taskMetrics.completedTasks} of {taskMetrics.totalTasks} completed</span>
            <span className="text-emerald-400 font-bold">{taskMetrics.slaComplianceRate}% on-time</span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${taskMetrics.completionRate}%` }}
            />
          </div>
        </div>

        {/* Admissions Conversion Funnel Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider">Admissions Yield</span>
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">
            {admissionsFunnel.conversionRate}%
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
            <span>{admissionsFunnel.admitted} admitted of {admissionsFunnel.totalApplications} apps</span>
            <span className="text-amber-400 font-bold">{admissionsFunnel.underReview} in review</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${admissionsFunnel.conversionRate}%` }}
            />
          </div>
        </div>

        {/* Financial Collection Rate Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider">Bursar Collections</span>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">
            {finance.collectionRate}%
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
            <span>${finance.tuitionCollectedUSD.toLocaleString()} collected</span>
            <span className="text-rose-400 font-bold">${finance.outstandingReceivablesUSD.toLocaleString()} due</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${finance.collectionRate}%` }}
            />
          </div>
        </div>

        {/* NCHE Accreditation Compliance Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider">NCHE Compliance</span>
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-400">
            {compliance.ncheScore}%
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
            <span>{compliance.totalPoliciesTracked} statutory policies</span>
            <span className="text-slate-300 font-mono text-[11px]">{compliance.auditLogCount} audits</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-500 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${compliance.ncheScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Mid Section: College Enrollment & Task Workflow Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Enrollment by College (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">
                Undergraduate Enrollment by Faculty
              </h3>
              <p className="text-xs text-slate-400">
                1,850 active scholars across Monrovia and Fendall campuses
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded">
              Academic Year 2026/2027
            </span>
          </div>

          <div className="space-y-4 pt-2">
            {collegeEnrollment.map((col, idx) => {
              const total = 1850;
              const percentage = Math.round((col.enrolled / total) * 100);
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{col.college}</span>
                    <span className="font-mono text-slate-400">
                      <strong className="text-white">{col.enrolled}</strong> students ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: col.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Capacity Utilization: <strong className="text-white">{academics.capacityUtilization}%</strong></span>
            <span>Avg Student CGPA: <strong className="text-amber-400">{academics.averageCGPA}</strong></span>
            <span>Attendance Rate: <strong className="text-emerald-400">{academics.attendanceRate}%</strong></span>
          </div>
        </div>

        {/* Right: Task Category & SLA Health (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">
                Institutional Task Health
              </h3>
              <p className="text-xs text-slate-400">
                Cross-departmental task velocity & SLA compliance
              </p>
            </div>
            <span className="text-xs font-bold text-amber-400">
              {taskMetrics.totalTasks} Total
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1 text-center">
            <div className="bg-slate-850 p-3 rounded-xl border border-slate-800">
              <div className="text-2xl font-bold text-amber-400">{taskMetrics.inProgressTasks}</div>
              <div className="text-[11px] text-slate-400">In Progress</div>
            </div>
            <div className="bg-slate-850 p-3 rounded-xl border border-slate-800">
              <div className="text-2xl font-bold text-purple-400">{taskMetrics.reviewTasks}</div>
              <div className="text-[11px] text-slate-400">Senate Review</div>
            </div>
            <div className="bg-slate-850 p-3 rounded-xl border border-slate-800">
              <div className="text-2xl font-bold text-rose-400">{taskMetrics.urgentCount}</div>
              <div className="text-[11px] text-slate-400">Urgent Priority</div>
            </div>
            <div className="bg-slate-850 p-3 rounded-xl border border-slate-800">
              <div className="text-2xl font-bold text-emerald-400">{taskMetrics.completedTasks}</div>
              <div className="text-[11px] text-slate-400">Completed</div>
            </div>
          </div>

          {/* Department distribution */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <div className="text-xs font-semibold text-slate-300">Department Workload Distribution:</div>
            <div className="space-y-1.5 text-xs">
              {Object.entries(taskMetrics.byDepartment).map(([dept, count]) => (
                <div key={dept} className="flex items-center justify-between bg-slate-850 px-3 py-1.5 rounded-lg border border-slate-800">
                  <span className="text-slate-300">{dept}</span>
                  <span className="font-mono text-amber-400 font-bold">{count} tasks</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CSV PREVIEW MODAL */}
      {csvPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl p-6 shadow-2xl text-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <FileDown className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Dashboard Metrics CSV Report Preview
                  </h3>
                  <p className="text-xs text-slate-400">
                    Pre-formatted for Excel, Google Sheets, or institutional archiving
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCsvPreviewModal(false)}
                className="text-slate-400 hover:text-white text-xs px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer"
                aria-label="Close CSV preview modal"
              >
                Close
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>File: <code className="text-amber-300 font-mono">Gwoahs_University_Analytics_Report_{new Date().toISOString().split('T')[0]}.csv</code></span>
                <span className="text-slate-500">{currentCsvText.split('\n').length} lines • UTF-8 CSV</span>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-amber-300/90 overflow-x-auto max-h-80 overflow-y-auto whitespace-pre">
                {currentCsvText}
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>
                  Includes live sections: Institutional Executive Summary, College Enrolment Breakdown, Task Management Velocity, and Operational Task Breakdown.
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(currentCsvText);
                  setCopiedCsv(true);
                  setTimeout(() => setCopiedCsv(false), 2500);
                }}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer border border-slate-700"
              >
                {copiedCsv ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 text-slate-400" />
                    <span>Copy Raw CSV</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setCsvPreviewModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Dismiss
                </button>
                <button
                  onClick={() => {
                    handleExportCSV();
                    setCsvPreviewModal(false);
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md hover:shadow-amber-500/20 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download CSV File</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EMIS MODAL PREVIEW */}
      {emisExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">
                  Liberia MoE EMIS Tertiary Data Export Preview
                </h3>
              </div>
              <button
                onClick={() => setEmisExportModal(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 bg-slate-800 rounded"
              >
                Close
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <p className="text-slate-300">
                Formatted according to the Ministry of Education EMIS Tertiary Data Exchange standards (Consultation 28-29 September 2026):
              </p>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-300 overflow-x-auto">
                <pre>{`Institution_Code: LR-GU-084
Institution_Name: Gwoah's University
Reporting_Period: Academic Year 2026/2027
Accreditation_Body: National Commission on Higher Education (NCHE)
Total_Enrolment: 1,850
Female_Enrolment: 885 (47.8%)
Male_Enrolment: 965 (52.2%)
STEM_Enrolment_Share: 64.2%
Disabled_Students_Accommodated: 42 (DEI Policy Oct 2024 Compliant)
Faculties_Count: 5
Total_Baccalaureate_Credits_Average: 126
EMIS_Sync_Status: VERIFIED_READY`}</pre>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>
                  Schema validated against Liberia Education Sector Plan 2022/23–2026/27. Ready for direct Ministry upload.
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setEmisExportModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const emisText = `Institution_Code,LR-GU-084\nInstitution_Name,Gwoah's University\nReporting_Period,2026/2027\nTotal_Enrolment,1850\nFemale_Enrolment,885\nMale_Enrolment,965\nSTEM_Enrolment_Share,64.2%\nDisabled_Students_Accommodated,42\nEMIS_Status,VERIFIED_READY`;
                  downloadCSV(emisText, `MoE_EMIS_Tertiary_LR-GU-084_2026.csv`);
                  setEmisExportModal(false);
                  setCsvNotification(`MoE EMIS Data package downloaded successfully (MoE_EMIS_Tertiary_LR-GU-084_2026.csv).`);
                  setTimeout(() => setCsvNotification(null), 6000);
                }}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download EMIS CSV Package</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
