import React, { useState, useEffect } from 'react';
import {
  Inbox,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  UserCheck,
  FileText,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { ApplicationRecord, UserProfile } from '../../types';
import { api } from '../../services/api';

interface AdmissionsReviewModuleProps {
  currentUser: UserProfile;
}

export const AdmissionsReviewModule: React.FC<AdmissionsReviewModuleProps> = ({ currentUser }) => {
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<ApplicationRecord | null>(null);
  const [decisionNotes, setDecisionNotes] = useState('');
  const [decisionScore, setDecisionScore] = useState(80);
  const [savingDecision, setSavingDecision] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const fetchApps = async () => {
    setLoading(true);
    try {
      const res = await api.getApplications();
      if (res.applications) setApplications(res.applications);
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleDecision = async (status: 'admitted' | 'conditional' | 'waitlisted' | 'rejected') => {
    if (!selectedApp) return;
    setSavingDecision(true);
    try {
      const res = await api.updateApplication(selectedApp.id, {
        status,
        reviewerNotes: decisionNotes || selectedApp.reviewerNotes,
        scoringTotal: Number(decisionScore),
      });
      if (res.success && res.application) {
        setApplications((prev) =>
          prev.map((a) => (a.id === selectedApp.id ? res.application : a))
        );
        setSelectedApp(res.application);
      }
    } catch (err) {
      console.error('Failed to update decision:', err);
    } finally {
      setSavingDecision(false);
    }
  };

  const filteredApps = applications.filter((a) => {
    if (filterStatus === 'all') return true;
    return a.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Admissions Intake & WASSCE Review Desk
            </h2>
            <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold px-2 py-0.5 rounded-full">
              {applications.length} Direct Applicants
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Evaluate high school transcripts, verify WAEC index numbers, enter interview notes, and issue institutional admission offers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Application Statuses</option>
            <option value="under_review">Under Review</option>
            <option value="admitted">Admitted</option>
            <option value="conditional">Conditional Offer</option>
            <option value="waitlisted">Waitlisted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Applicant list (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider pb-2 border-b border-slate-800">
            Admissions Queue ({filteredApps.length} applicants)
          </div>

          <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
            {filteredApps.map((app) => {
              const isSelected = selectedApp?.id === app.id;
              return (
                <div
                  key={app.id}
                  onClick={() => {
                    setSelectedApp(app);
                    setDecisionNotes(app.reviewerNotes || '');
                    setDecisionScore(app.scoringTotal || 75);
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800 border-amber-500 shadow-md'
                      : 'bg-slate-850 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{app.applicantName}</span>
                        <span className="font-mono text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                          {app.applicationNumber}
                        </span>
                      </div>
                      <div className="text-xs text-amber-400 font-medium mt-0.5">
                        {app.programDesired}
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        app.status === 'admitted'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : app.status === 'conditional'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : app.status === 'rejected'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}
                    >
                      {app.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                    <span className="font-mono">WASSCE: {app.wassceIndex}</span>
                    <span>Score: <strong className="text-white">{app.scoringTotal || 'N/A'}/100</strong></span>
                    <span>Fee: <strong className="text-emerald-400">Paid ($25)</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Applicant Details & Action Form (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          {selectedApp ? (
            <div className="space-y-4">
              <div className="pb-3 border-b border-slate-800">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Admissions Committee Review Panel
                </div>
                <h3 className="text-xl font-bold text-white mt-1">
                  {selectedApp.applicantName}
                </h3>
                <p className="text-xs text-slate-400">
                  Applied for {selectedApp.programDesired}
                </p>
              </div>

              {/* Contact info */}
              <div className="bg-slate-850 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                <div>Email: <strong className="text-slate-200">{selectedApp.email}</strong></div>
                <div>Phone: <strong className="text-slate-200">{selectedApp.phone}</strong></div>
                <div>Faculty: <strong className="text-slate-200">{selectedApp.faculty}</strong></div>
                <div>Application Date: <strong className="text-slate-200">{new Date(selectedApp.applicationDate).toLocaleDateString()}</strong></div>
              </div>

              {/* WASSCE Subject breakdown */}
              <div>
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Verified WASSCE Core Subjects
                </div>
                <div className="space-y-1.5">
                  {selectedApp.wassceCoreSubjects.map((sub, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-slate-850 px-3 py-1.5 rounded-lg border border-slate-800 text-xs"
                    >
                      <span className="text-slate-300">{sub.subject}</span>
                      <span className="font-mono font-bold text-amber-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        {sub.grade}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Committee Decision Form */}
              <div className="pt-2 border-t border-slate-800 space-y-3">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Committee Scoring & Decision
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Academic Aptitude & Interview Score (0 - 100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={decisionScore}
                    onChange={(e) => setDecisionScore(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs font-mono font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Reviewer Evaluation Notes
                  </label>
                  <textarea
                    rows={3}
                    value={decisionNotes}
                    onChange={(e) => setDecisionNotes(e.target.value)}
                    placeholder="Enter observations on science prerequisites, math foundation, interview demeanor..."
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* 4 Decision Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    disabled={savingDecision}
                    onClick={() => handleDecision('admitted')}
                    className="py-2.5 px-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Admit Student</span>
                  </button>

                  <button
                    disabled={savingDecision}
                    onClick={() => handleDecision('conditional')}
                    className="py-2.5 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow cursor-pointer disabled:opacity-50"
                  >
                    <span>Conditional Offer</span>
                  </button>

                  <button
                    disabled={savingDecision}
                    onClick={() => handleDecision('waitlisted')}
                    className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer disabled:opacity-50"
                  >
                    <Clock className="w-4 h-4" />
                    <span>Waitlist</span>
                  </button>

                  <button
                    disabled={savingDecision}
                    onClick={() => handleDecision('rejected')}
                    className="py-2.5 px-3 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-rose-500/40 cursor-pointer disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-slate-500 text-xs italic">
              Select an applicant from the queue to review WASSCE credentials and record committee decision.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
