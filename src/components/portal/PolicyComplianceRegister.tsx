import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  FileCheck,
  History,
  Lock,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Search,
} from 'lucide-react';
import { NchePolicyItem, AuditLogEntry, UserProfile } from '../../types';
import { api } from '../../services/api';

interface PolicyComplianceRegisterProps {
  currentUser: UserProfile;
}

export const PolicyComplianceRegister: React.FC<PolicyComplianceRegisterProps> = ({
  currentUser,
}) => {
  const [policies, setPolicies] = useState<NchePolicyItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'traceability' | 'audit'>('traceability');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [polRes, auditRes] = await Promise.all([
        api.getPolicies(),
        api.getAuditLogs(),
      ]);
      if (polRes.policies) setPolicies(polRes.policies);
      if (auditRes.auditLogs) setAuditLogs(auditRes.auditLogs);
    } catch (err) {
      console.error('Failed to load compliance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Policy Traceability & Audit Center
            </h2>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold px-2 py-0.5 rounded-full">
              Compliance review pending
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Policy references and recorded events for institutional review. Regulatory compliance must be verified by authorized university officers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-wrap gap-2 bg-white p-2 rounded-xl border border-[#d9cadf]">
            <button
              onClick={() => setActiveTab('traceability')}
              className={`min-h-10 px-3 py-2 rounded-lg text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4a1249] ${
                activeTab === 'traceability' ? 'bg-[#4a1249] !text-white font-bold' : 'text-[#4a1249] hover:bg-[#f4edf4]'
              }`}
            >
              Policy Traceability
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`min-h-10 px-3 py-2 rounded-lg text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4a1249] ${
                activeTab === 'audit' ? 'bg-[#4a1249] !text-white font-bold' : 'text-[#4a1249] hover:bg-[#f4edf4]'
              }`}
            >
              Tamper-Evident Audit Log ({auditLogs.length})
            </button>
          </div>

        </div>
      </div>

      {/* POLICY TRACEABILITY VIEW */}
      {activeTab === 'traceability' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {policies.length === 0 && <p className="text-sm text-slate-700">No verified policy records available.</p>}
            {policies.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded">
                      {item.sourceAuthority}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {item.complianceStatus}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mt-2">
                    {item.documentTitle}
                  </h3>

                  <div className="text-[11px] text-amber-400 font-mono mt-0.5">
                    Ref: {item.statutoryReference} • Date: {item.sourceDate}
                  </div>

                  <div className="mt-3 bg-slate-850 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
                    <strong className="text-white block mb-0.5">Statutory Mandate:</strong>
                    {item.mandateDescription}
                  </div>

                  <div className="mt-2.5 bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-xs text-emerald-300 leading-relaxed">
                    <strong className="text-white block mb-0.5">Implemented Platform System Control:</strong>
                    {item.systemControlImplemented}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Responsible: <strong className="text-slate-200">{item.responsibleOffice}</strong></span>
                  <span className="text-amber-400 font-semibold">Review date not confirmed</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* IMMUTABLE AUDIT LOG VIEW */}
      {activeTab === 'audit' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">
                Tamper-Evident System Audit Trail
              </h3>
              <p className="text-xs text-slate-400">
                Server-enforced audit record of all authentication, course registration, Add/Drop changes, payments, and task state updates.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2.5 py-1 rounded-lg">
              <ShieldCheck className="w-4 h-4" />
              <span>Audit integrity verification not displayed</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Timestamp (UTC)</th>
                  <th className="px-4 py-3">Actor & Role</th>
                  <th className="px-4 py-3">Action Event</th>
                  <th className="px-4 py-3">Target Entity</th>
                  <th className="px-4 py-3">Audit Details</th>
                  <th className="px-4 py-3 font-mono">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-850/60 transition-colors">
                    <td className="px-4 py-3 font-mono text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-bold text-white">{log.userName}</div>
                      <div className="text-[10px] text-amber-400">{log.userRole}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-mono text-[11px] font-bold bg-slate-800 text-slate-200 px-2 py-0.5 rounded border border-slate-700">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-400">
                      {log.entityType} ({log.entityId.slice(0, 10)})
                    </td>
                    <td className="px-4 py-3 text-slate-300 max-w-xs truncate">
                      {log.details}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {log.ipAddress}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
