import React, { useEffect, useState } from 'react';
import { Inbox, Search, RefreshCw, AlertCircle, GraduationCap, Mail, Phone } from 'lucide-react';
import type { PublicApplicationIntake, UserProfile } from '../../types';
import { api } from '../../services/api';

interface AdmissionsReviewModuleProps {
  currentUser: UserProfile;
}

/** Staging public intake only. Formal decisions are handled by the separately
 * audited registrar/admissions ERP workflow, not by this read-only view. */
export const AdmissionsReviewModule: React.FC<AdmissionsReviewModuleProps> = ({ currentUser }) => {
  const [applications, setApplications] = useState<PublicApplicationIntake[]>([]);
  const [selected, setSelected] = useState<PublicApplicationIntake | null>(null);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const permitted = ['super_admin', 'registrar', 'admissions_officer'].includes(currentUser.role);
  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getApplications();
      if (!Array.isArray(res.applications)) throw new Error('The intake queue is unavailable.');
      setApplications(res.applications);
      setSelected(previous => previous ? res.applications.find(a => a.id === previous.id) || null : null);
    } catch {
      setApplications([]);
      setSelected(null);
      setError('Unable to load received applications. Check your staff permissions and retry.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { if (permitted) void load(); else setLoading(false); }, [permitted]);

  if (!permitted) return (
    <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
      Your university account is not authorized to view applicant records.
    </div>
  );

  const filtered = applications.filter(item =>
    [item.applicantName,item.applicationNumber,item.programDesired,item.email]
      .some(value => value.toLowerCase().includes(query.trim().toLowerCase())));

  return (
    <section className="space-y-6 text-[#2A1930]">
      <header className="rounded-xl border border-[#E4DCE8] bg-white p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#98723A]">Secure admissions operations</p>
            <h2 className="mt-2 text-2xl font-bold text-[#4A1249]">Public Application Intake</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Review received online application details and scholarship-interest requests.
              This is an intake queue, not a decision or tuition-payment system.
            </p>
          </div>
          <button type="button" onClick={() => void load()} disabled={loading}
            className="inline-flex items-center gap-2 rounded-md border border-[#DCD2E1] px-3 py-2 text-sm font-semibold text-[#4A1249] hover:bg-[#F7F1F8] disabled:opacity-50">
            <RefreshCw className="h-4 w-4" /> Refresh queue
          </button>
        </div>
        {error && <div role="alert" className="mt-5 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>}
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.9fr)]">
        <section aria-label="Received application list" className="rounded-xl border border-[#E4DCE8] bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-base font-bold text-[#4A1249]">Received applications ({applications.length})</h3>
          </div>
          <label className="mt-4 block">
            <span className="sr-only">Search received applications</span>
            <span className="relative block">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <input type="search" value={query} onChange={event => setQuery(event.target.value)}
                placeholder="Search name, reference or program"
                className="w-full rounded-md border border-[#DCD2E1] bg-white py-2.5 pl-10 pr-3 text-sm text-[#2A1930]" />
            </span>
          </label>
          <div className="mt-4 space-y-2">
            {loading && <p className="py-8 text-center text-sm text-slate-600">Loading applications…</p>}
            {!loading && filtered.length === 0 && (
              <p className="rounded-lg bg-[#F9F6FA] p-7 text-center text-sm text-slate-600">
                {query ? 'No matching applications.' : 'No public applications have been received yet.'}
              </p>
            )}
            {!loading && filtered.map(item => (
              <button type="button" key={item.id} onClick={() => setSelected(item)}
                aria-pressed={selected?.id === item.id}
                className={`w-full rounded-lg border p-4 text-left transition-colors hover:border-[#C39A53] ${
                  selected?.id === item.id ? 'border-[#C39A53] bg-[#FCF8F0]' : 'border-[#E8E0EA] bg-white'
                }`}>
                <span className="flex flex-wrap items-start justify-between gap-2">
                  <span className="font-semibold text-[#4A1249]">{item.applicantName}</span>
                  <span className="font-mono text-xs text-slate-600">{item.applicationNumber}</span>
                </span>
                <span className="mt-2 block text-sm text-slate-700">{item.programDesired}</span>
                {item.applyingForScholarship && (
                  <span className="mt-2 inline-block rounded bg-[#F4E9D4] px-2 py-1 text-xs font-medium text-[#664519]">
                    Requests financial-aid information
                  </span>
                )}
              </button>
            ))}
          </div>
        </section>

        <section aria-label="Selected application details" className="rounded-xl border border-[#E4DCE8] bg-white p-5">
          {!selected ? (
            <div className="flex min-h-64 flex-col items-center justify-center text-center">
              <Inbox className="h-9 w-9 text-[#98723A]" />
              <p className="mt-4 text-sm text-slate-600">Select an applicant to inspect their received information.</p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="border-b border-[#EEE8F0] pb-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#98723A]">Application received</p>
                <h3 className="mt-2 text-xl font-bold text-[#4A1249]">{selected.applicantName}</h3>
                <p className="mt-1 text-sm text-slate-600">{selected.applicationNumber}</p>
              </div>
              <dl className="space-y-3 text-sm">
                <div><dt className="font-semibold text-slate-700">Program</dt><dd>{selected.programDesired}</dd></div>
                <div><dt className="font-semibold text-slate-700">College</dt><dd>{selected.faculty}</dd></div>
                <div><dt className="font-semibold text-slate-700">County</dt><dd>{selected.county}</dd></div>
                <div><dt className="font-semibold text-slate-700">Email</dt><dd className="break-all"><Mail className="mr-1 inline h-4 w-4 text-[#98723A]" />{selected.email}</dd></div>
                <div><dt className="font-semibold text-slate-700">Telephone</dt><dd><Phone className="mr-1 inline h-4 w-4 text-[#98723A]" />{selected.phone}</dd></div>
                <div><dt className="font-semibold text-slate-700">WASSCE index (self-reported)</dt><dd>{selected.wassceIndex || 'Not provided'}</dd></div>
                <div><dt className="font-semibold text-slate-700">Grades (self-reported, not verified)</dt>
                  <dd className="mt-1 space-y-1">{selected.wassceCoreSubjects.map(item=>
                    <p key={item.subject}>{item.subject}: <span className="font-semibold">{item.grade}</span></p>)}
                  </dd>
                </div>
                <div><dt className="font-semibold text-slate-700">Scholarship interest</dt>
                  <dd>{selected.applyingForScholarship ? 'Yes — information requested' : 'No'}</dd>
                </div>
                <div><dt className="font-semibold text-slate-700">Received</dt><dd>{new Date(selected.applicationDate).toLocaleString()}</dd></div>
              </dl>
              <div className="flex items-start gap-2 rounded-lg border border-[#E5D7B7] bg-[#FCF7EA] p-4 text-sm leading-6 text-[#5B4627]">
                <GraduationCap className="mt-1 h-4 w-4 shrink-0" />
                No admissions decision, scholarship award, identity verification or fee payment is represented by this record.
                Official evaluation and acceptance remain subject to the secure ERP workflow.
              </div>
            </div>
          )}
        </section>
      </div>
    </section>
  );
};
