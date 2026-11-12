import React, { useCallback, useEffect, useState } from 'react';
import { Activity, RefreshCcw, AlertCircle, FileText } from 'lucide-react';

type LiveOverview = {
  source: 'persisted-records';
  asOf: string;
  tasks: { total: number; completed: number; inProgress: number };
  applications: { total: number; admitted: number; underReview: number };
  academics: { activeStudents: number; activeSections: number; enrolledSeats: number };
  finance: { billedCents: number; creditsCents: number; reconciledCents: number };
  auditCount: number;
  enrollmentByProgram: { program: string; enrolled: number }[];
  unavailable: string[];
};
const money = (cents: number) => (cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const metric = (label: string, value: number | string, hint: string) => (
  <section className="rounded-xl border border-[#ded1e3] bg-white p-5 shadow-sm" key={label}>
    <h3 className="text-sm font-semibold text-[#4a1249]">{label}</h3>
    <p className="mt-2 text-3xl font-bold tabular-nums text-[#35103b]">{value}</p>
    <p className="mt-1 text-sm text-slate-700">{hint}</p>
  </section>
);
export const IntegratedAnalyticsHub: React.FC = () => {
  const [data, setData] = useState<LiveOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const refresh = useCallback(async (signal?: AbortSignal) => {
    setLoading(true); setError('');
    try {
      const response = await fetch('/api/analytics/overview', { credentials: 'same-origin', cache: 'no-store', signal });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Analytics could not load.');
      if (payload.source !== 'persisted-records' || !payload.tasks || !payload.academics || !payload.applications || !payload.finance) {
        throw new Error('Analytics response did not contain verified institutional data.');
      }
      if (!signal?.aborted) setData(payload as LiveOverview);
    } catch (cause) {
      if (!signal?.aborted) { setData(null); setError(cause instanceof Error ? cause.message : 'Analytics could not load.'); }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    void refresh(controller.signal);
    return () => controller.abort();
  }, [refresh]);
  const outstanding = data ? Math.max(0, data.finance.billedCents - data.finance.creditsCents - data.finance.reconciledCents) : 0;
  return <div className="space-y-6 text-[#35103b]">
    <section className="rounded-2xl border border-[#ded1e3] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2"><Activity size={22} aria-hidden="true"/><h2 className="text-xl font-bold">Institutional Analytics</h2></div>
          <p className="mt-1 text-sm text-slate-700">Statistics from authenticated, persisted university records only. No demo values.</p>
        </div>
        <button type="button" onClick={() => void refresh()} disabled={loading}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#4a1249] bg-[#4a1249] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#35103b] disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4a1249]">
          <RefreshCcw size={17} aria-hidden="true"/> Refresh data
        </button>
      </div>
      {data && <p className="mt-3 text-xs text-slate-600">Last loaded: {new Date(data.asOf).toLocaleString()} · Source: institutional database</p>}
    </section>
    {loading && <div role="status" className="rounded-xl border border-[#ded1e3] bg-white p-6 text-sm font-medium text-[#35103b]">Loading university records…</div>}
    {!loading && error && <div role="alert" className="flex items-start gap-3 rounded-xl border border-amber-400 bg-amber-50 p-5 text-sm font-medium text-amber-950"><AlertCircle className="shrink-0" size={20} aria-hidden="true"/> <div><p>Analytics unavailable</p><p className="mt-1 font-normal">{error}</p><p className="mt-2">Check that the latest staging backend was deployed and your session is still valid.</p></div></div>}
    {!loading && data && <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metric('Institutional tasks', data.tasks.total, data.tasks.completed + ' completed · ' + data.tasks.inProgress + ' in progress')}
        {metric('Applications', data.applications.total, data.applications.admitted + ' admitted · ' + data.applications.underReview + ' under review')}
        {metric('Active student records', data.academics.activeStudents, 'From active student records')}
        {metric('Current enrollment', data.academics.enrolledSeats, data.academics.activeSections + ' sections in open terms')}
        {metric('Posted invoice amount', money(data.finance.billedCents), 'Recorded currency amounts; verify institution currency configuration')}
        {metric('Reconciled payments', money(data.finance.reconciledCents), 'Excludes pending or cancelled payments')}
        {metric('Outstanding balance', money(outstanding), 'Invoices minus credit notes and reconciled payments')}
        {metric('Audit entries', data.auditCount, 'Recorded workflow audit events')}
      </div>
      <section className="rounded-xl border border-[#ded1e3] bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2"><FileText size={20} aria-hidden="true"/><h3 className="text-lg font-bold">Active students by academic program</h3></div>
        {data.enrollmentByProgram.length === 0 ? <p className="mt-3 text-sm text-slate-700">No approved program records yet.</p> :
          <div className="mt-4 overflow-x-auto"><table className="w-full border-collapse text-left text-sm">
            <thead><tr className="border-b border-[#ded1e3] text-[#4a1249]"><th scope="col" className="p-3">Program</th><th scope="col" className="p-3 text-right">Active students</th></tr></thead>
            <tbody>{data.enrollmentByProgram.map(row => <tr key={row.program} className="border-b border-slate-200"><td className="p-3 text-slate-800">{row.program}</td><td className="p-3 text-right tabular-nums font-semibold">{row.enrolled}</td></tr>)}</tbody>
          </table></div>}
      </section>
      <p className="rounded-xl border border-[#ded1e3] bg-[#faf8fb] p-4 text-sm text-slate-800"><strong>Not calculated:</strong> {data.unavailable.join(', ')}. These indicators require validated source records or approved methodology and are deliberately not inferred.</p>
    </>}
  </div>;
};
