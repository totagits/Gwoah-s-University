import React, { useEffect, useState } from 'react';
import {
  GraduationCap,
  LayoutDashboard,
  Settings,
  Users,
  BookOpen,
  ClipboardCheck,
  Wallet,
  UserRound,
  LogOut,
  RefreshCw,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { PortalLoginModal } from './components/portal/PortalLoginModal';
import {
  AccountCenter,
  HistoricalPrediction,
} from './components/portal/AccountCenter';
import { Panel, Empty } from './components/portal/Common';
import { setSessionCsrf } from './services/session';
import { LanguagePicker, useLocalization } from './i18n/Localization';
import type { UserProfile } from './types';
import './styles/workspaces.css';

type Field = {
  name: string;
  label: string;
  type?: string;
  options?: { value: string; label: string }[];
  optional?: boolean;
  value?: string;
  multiple?: boolean;
};
const currency = (cents: number | null | undefined) =>
  cents == null
    ? '—'
    : new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(cents / 100);
const date = (value: string) =>
  value ? new Date(value).toLocaleString() : '—';
const options = (rows: any[], label: (row: any) => string) =>
  rows.map((row) => ({ value: row.id, label: label(row) }));
function Badge({ children }: any) {
  return (
    <span className="ws-badge">
      {String(children || '—').replaceAll('_', ' ')}
    </span>
  );
}
function Table({
  rows,
  columns,
  empty = 'No records yet. Add a record using the form above.',
}: any) {
  return rows?.length ? (
    <div className="ws-table">
      <table>
        <thead>
          <tr>
            {columns.map((c: any) => (
              <th key={c.label}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row: any) => (
            <tr key={row.id || row.user_id}>
              {columns.map((c: any) => (
                <td key={c.label}>
                  {c.render ? c.render(row) : (row[c.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <Empty>{empty}</Empty>
  );
}
function Form({
  title,
  action,
  fields,
  onAction,
  defaults = {},
  label = 'Save record',
  detail,
}: any) {
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const missing = fields.some(
    (f: Field) => f.options && !f.optional && !f.options.length,
  );
  return (
    <details className="ws-form-details" open={false}>
      <summary>{title}</summary>
      {detail && <p className="campus-muted">{detail}</p>}
      <form
        className="campus-form"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setMessage('');
          const form = e.currentTarget;
          try {
            const body: any = {
              ...defaults,
              ...Object.fromEntries(new FormData(form)),
            };
            for (const field of fields) {
              if (field.multiple)
                body[field.name] = new FormData(form)
                  .getAll(field.name)
                  .filter(Boolean);
            }
            await onAction(action, body);
            form.reset();
            setMessage('Saved. Workspace records have been refreshed.');
          } catch (error) {
            setMessage(
              error instanceof Error ? error.message : 'Could not save.',
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        {fields.map((f: Field) => (
          <label key={f.name}>
            {f.label}
            {f.optional ? ' (optional)' : ''}
            {f.options ? (
              <select
                name={f.name}
                required={!f.optional}
                multiple={f.multiple}
                defaultValue={f.multiple ? [] : f.value || ''}
              >
                <option value="" disabled={!f.optional}>
                  {f.optional ? 'None' : 'Choose a record'}
                </option>
                {f.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            ) : f.type === 'textarea' ? (
              <textarea
                name={f.name}
                required={!f.optional}
                maxLength={2000}
                defaultValue={f.value}
              />
            ) : (
              <input
                name={f.name}
                type={f.type || 'text'}
                required={!f.optional}
                step={f.type === 'number' ? 'any' : undefined}
                defaultValue={f.value}
                maxLength={f.type === 'text' || !f.type ? 200 : undefined}
              />
            )}
          </label>
        ))}
        <button className="campus-button" disabled={busy || missing}>
          {busy ? 'Saving…' : label}
        </button>
        {missing && (
          <p className="campus-muted">
            Create the required parent records first.
          </p>
        )}
        <p role="status" className="campus-status">
          {message}
        </p>
      </form>
    </details>
  );
}
function ScaleEditor({ onAction }: any) {
  const [rows, setRows] = useState([
    { min: '', letter: '', points: '', passed: true },
    { min: '0', letter: '', points: '', passed: false },
  ]);
  const [title, setTitle] = useState('');
  const [msg, setMsg] = useState('');
  return (
    <details className="ws-form-details">
      <summary>Approve a grading scale</summary>
      <p className="campus-muted">
        Enter your institution’s actual scale, highest boundary first. No grades
        can be published until a scale is approved. Published grades retain the
        scale used at publication.
      </p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            await onAction('gradeScheme', {
              title,
              definition: rows.map((r) => ({
                ...r,
                min: Number(r.min),
                points: Number(r.points),
              })),
            });
            setMsg('Grading scale approved.');
          } catch (e) {
            setMsg(e instanceof Error ? e.message : 'Could not approve.');
          }
        }}
      >
        <label>
          Scale title
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <div className="ws-table">
          <table>
            <thead>
              <tr>
                <th>Minimum score</th>
                <th>Letter</th>
                <th>Quality points (0–4)</th>
                <th>Passing</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  <td>
                    <input
                      aria-label={'Minimum score ' + (i + 1)}
                      type="number"
                      min={0}
                      max={100}
                      required
                      value={row.min}
                      onChange={(e) =>
                        setRows(
                          rows.map((r, j) =>
                            i === j ? { ...r, min: e.target.value } : r,
                          ),
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      aria-label={'Grade letter ' + (i + 1)}
                      required
                      maxLength={5}
                      value={row.letter}
                      onChange={(e) =>
                        setRows(
                          rows.map((r, j) =>
                            i === j ? { ...r, letter: e.target.value } : r,
                          ),
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      aria-label={'Quality points ' + (i + 1)}
                      type="number"
                      min={0}
                      max={4}
                      step=".01"
                      required
                      value={row.points}
                      onChange={(e) =>
                        setRows(
                          rows.map((r, j) =>
                            i === j ? { ...r, points: e.target.value } : r,
                          ),
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      aria-label={'Passing band ' + (i + 1)}
                      type="checkbox"
                      checked={row.passed}
                      onChange={(e) =>
                        setRows(
                          rows.map((r, j) =>
                            i === j ? { ...r, passed: e.target.checked } : r,
                          ),
                        )
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="campus-actions">
          <button
            type="button"
            className="campus-button secondary"
            onClick={() =>
              setRows([
                ...rows.slice(0, -1),
                { min: '', letter: '', points: '', passed: true },
                rows.at(-1)!,
              ])
            }
          >
            Add grade band
          </button>
          <button className="campus-button">Approve scale</button>
        </div>
        <p role="status">{msg}</p>
      </form>
    </details>
  );
}

export default function WorkspaceApp() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [state, setState] = useState<any>(null);
  const [screen, setScreen] = useState('overview');
  const [login, setLogin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const { t } = useLocalization();
  const load = async () => {
    setRefreshing(true);
    try {
      const response = await fetch('/api/workspaces/state');
      const body = await response.json();
      if (!response.ok) throw Error(body.error || 'Could not load records.');
      setState(body);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Workspace unavailable.');
    } finally {
      setRefreshing(false);
    }
  };
  useEffect(() => {
    fetch('/api/auth/me')
      .then(async (r) => {
        if (r.ok) {
          const s = await r.json();
          setSessionCsrf(s.csrf);
          setUser(s.user);
          await load();
        } else if (
          location.search.includes('portal') ||
          location.search.includes('activate')
        )
          setLogin(true);
      })
      .catch(() => setError('Could not contact the university server.'))
      .finally(() => setLoading(false));
    const expire = () => {
      setUser(null);
      setState(null);
      setSessionCsrf('');
      setLogin(true);
    };
    window.addEventListener('gu:session-expired', expire);
    return () => window.removeEventListener('gu:session-expired', expire);
  }, []);
  const act = async (action: string, data: any) => {
    const response = await fetch('/api/workspaces/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, data }),
    });
    const result = await response.json();
    if (!response.ok)
      throw Error(result.error || 'Could not commit the transaction.');
    await load();
    return result.result;
  };
  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setSessionCsrf('');
    setState(null);
    setUser(null);
    setScreen('overview');
  };
  if (loading)
    return (
      <div className="ws-loading">Connecting to university operations…</div>
    );
  const permissions = state?.permissions || {};
  const navigation = [
    {
      id: 'overview',
      label: 'Workspace overview',
      icon: LayoutDashboard,
      show: true,
    },
    {
      id: 'setup',
      label: 'Academic setup',
      icon: BookOpen,
      show: permissions.setup,
    },
    {
      id: 'admissions',
      label: 'Admissions',
      icon: Users,
      show: permissions.admissions,
    },
    {
      id: 'registry',
      label: 'Registrar',
      icon: ClipboardCheck,
      show: permissions.registrar,
    },
    {
      id: 'faculty',
      label: 'Faculty',
      icon: GraduationCap,
      show: permissions.faculty,
    },
    {
      id: 'student',
      label: 'My studies',
      icon: UserRound,
      show: permissions.student,
    },
    {
      id: 'finance',
      label: 'Finance & reconciliation',
      icon: Wallet,
      show: permissions.finance,
    },
    {
      id: 'alumni',
      label: 'Alumni services',
      icon: GraduationCap,
      show: permissions.alumni,
    },
    { id: 'tasks', label: 'Assigned work', icon: ClipboardCheck, show: true },
    {
      id: 'audit',
      label: 'Audit trail',
      icon: ShieldCheck,
      show: permissions.audit,
    },
    {
      id: 'account',
      label: 'Account & integrations',
      icon: Settings,
      show: true,
    },
  ].filter((n) => n.show);
  const field = (
    name: string,
    label: string,
    type?: string,
    optional = false,
  ): Field => ({ name, label, type, optional });
  const select = (
    name: string,
    label: string,
    rows: any[],
    describe: (r: any) => string,
    optional = false,
  ): Field => ({ name, label, options: options(rows, describe), optional });
  const studentField = select(
    'studentId',
    'Student',
    state?.students || [],
    (s) => s.student_number + ' · ' + s.full_name,
  );
  const termField = select(
    'termId',
    'Academic term',
    state?.terms || [],
    (v) => v.code + ' · ' + v.title,
  );
  const forms = (props: any) => <Form {...props} onAction={act} />;
  const gradeFor = (id: string) =>
    state?.grades.find((g: any) => g.registration_id === id);
  const profile = state?.ownStudent;
  const academicRecord = async (studentId: string) => {
    try {
      const response = await fetch('/api/workspaces/transcript/' + studentId);
      const data = await response.json();
      if (!response.ok) throw Error(data.error);
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF();
      let y = 22;
      pdf.setFontSize(19);
      pdf.text('Gwoah’s University', 18, y);
      y += 12;
      pdf.setFontSize(11);
      for (const line of [
        'Academic record · generated from published grades',
        data.student.full_name,
        data.student.student_number,
        data.program.title,
        ...data.grades.map(
          (g: any) =>
            `${g.term} | ${g.code} | ${g.credits} credits | ${g.letter} | ${g.score}`,
        ),
      ]) {
        if (y > 275) {
          pdf.addPage();
          y = 20;
        }
        pdf.text(pdf.splitTextToSize(line, 175), 18, y);
        y += 10;
      }
      pdf.save('academic-record.pdf');
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Could not generate academic record.',
      );
    }
  };
  return (
    <>
      <div className="ws-app">
        {!user ? (
          <main className="ws-welcome">
            <div className="ws-brand">
              <GraduationCap size={34} />
              <strong>Gwoah’s University</strong>
            </div>
            <span className="ws-eyebrow">UNIVERSITY OPERATIONS</span>
            <h1>
              One connected
              <br />
              university workspace.
            </h1>
            <p>
              Admissions, academic records, finance, and institutional
              processes—with accountable access and connected records.
            </p>
            <button className="campus-button" onClick={() => setLogin(true)}>
              Sign in to your workspace <ArrowRight size={17} />
            </button>
            <p className="campus-muted">
              Accounts are issued by your university administrator.
            </p>
            {error && <p role="alert">{error}</p>}
          </main>
        ) : (
          <>
            <header className="ws-header">
              <div className="ws-brand">
                <GraduationCap />
                <strong>
                  Gwoah’s University <small>Operations</small>
                </strong>
              </div>
              <div className="ws-user">
                <span>
                  {user.name}
                  <small>{user.role.replaceAll('_', ' ')}</small>
                </span>
                <button className="campus-button secondary" onClick={logout}>
                  <LogOut size={15} />
                  Sign out
                </button>
              </div>
            </header>
            <aside className="ws-sidebar">
              <p className="ws-eyebrow">YOUR WORKSPACES</p>
              {navigation.map((n) => (
                <button
                  key={n.id}
                  className={screen === n.id ? 'active' : ''}
                  onClick={() => {
                    setScreen(n.id);
                    window.scrollTo({ top: 0 });
                  }}
                >
                  <n.icon size={18} />
                  {t(n.label)}
                </button>
              ))}
              <div className="ws-sidebar-note">
                Staging environment
                <br />
                Records are created through actual workflows. No sample records
                are loaded.
              </div>
            </aside>
            <main className="ws-main">
              <div className="ws-mobile-nav">
                <label>
                  Workspace
                  <select
                    value={screen}
                    onChange={(e) => setScreen(e.target.value)}
                  >
                    {navigation.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="ws-page-head">
                <div>
                  <span className="ws-eyebrow">
                    {user.role.replaceAll('_', ' ')} WORKSPACE
                  </span>
                  <h1>
                    {navigation.find((n) => n.id === screen)?.label ||
                      'Workspace'}
                  </h1>
                </div>
                <button
                  className="campus-button secondary"
                  onClick={load}
                  disabled={refreshing}
                >
                  <RefreshCw size={15} />
                  {refreshing ? 'Refreshing…' : 'Refresh records'}
                </button>
              </div>
              {error && (
                <div role="alert" className="ws-error">
                  {error}
                </div>
              )}
              {!state ? (
                <Panel title="Workspace unavailable">
                  <p>Records have not loaded. Refresh to retry.</p>
                </Panel>
              ) : (
                <>
                  {screen === 'overview' && (
                    <>
                      <div className="ws-metrics">
                        {[
                          ['Programs', state.counts.programs],
                          ['Courses', state.counts.courses],
                          ['Student records', state.counts.students],
                          ['Course sections', state.counts.sections],
                        ].map(([label, count]) => (
                          <div key={String(label)}>
                            <span>{label}</span>
                            <strong>{count}</strong>
                          </div>
                        ))}
                      </div>
                      <Panel
                        title="Build your university’s operational records"
                        detail="This environment starts empty. Workspaces show only records created by authorized users."
                      >
                        <ol className="ws-steps">
                          <li>
                            <strong>Establish academic setup</strong>
                            <p>
                              Create programs, terms, courses, faculty accounts,
                              sections, and an approved grading scale.
                            </p>
                          </li>
                          <li>
                            <strong>Process admissions and registration</strong>
                            <p>
                              Review applications, admit students, invite their
                              accounts using the same email, and enroll them in
                              open sections.
                            </p>
                          </li>
                          <li>
                            <strong>
                              Complete finance and academic reviews
                            </strong>
                            <p>
                              Post invoices, reconcile receipts, publish
                              reviewed grades, and assess graduation
                              requirements.
                            </p>
                          </li>
                        </ol>
                        <p className="campus-muted">
                          Only use records you intentionally create for workflow
                          testing. Live email, banking, AI, and storage
                          integrations remain separate configuration steps.
                        </p>
                      </Panel>
                      <Panel title="Your recent activity">
                        <Table
                          rows={state.audit.slice(0, 8)}
                          columns={[
                            { key: 'action', label: 'Action' },
                            { key: 'entity', label: 'Record' },
                            {
                              label: 'Time',
                              render: (r: any) => date(r.created_at),
                            },
                          ]}
                          empty="No account activity has been recorded yet."
                        />
                      </Panel>
                    </>
                  )}
                  {screen === 'setup' && permissions.setup && (
                    <>
                      <Panel title="Programs">
                        {forms({
                          title: 'Create program',
                          action: 'program',
                          fields: [
                            field('code', 'Program code'),
                            field('title', 'Program title'),
                            field(
                              'requiredCredits',
                              'Required graduation credits',
                              'number',
                            ),
                          ],
                        })}
                        <Table
                          rows={state.programs}
                          columns={[
                            { key: 'code', label: 'Code' },
                            { key: 'title', label: 'Program' },
                            {
                              key: 'required_credits',
                              label: 'Required credits',
                            },
                          ]}
                        />
                      </Panel>
                      <Panel title="Academic terms">
                        {forms({
                          title: 'Create term',
                          action: 'term',
                          fields: [
                            field('code', 'Term code'),
                            field('title', 'Term title'),
                            field('startDate', 'Start date', 'date'),
                            field('endDate', 'End date', 'date'),
                            field(
                              'maxCredits',
                              'Maximum registration credits',
                              'number',
                            ),
                            {
                              name: 'status',
                              label: 'Registration status',
                              options: ['draft', 'open', 'closed'].map(
                                (value) => ({ value, label: value }),
                              ),
                            },
                          ],
                        })}
                        <Table
                          rows={state.terms}
                          columns={[
                            { key: 'code', label: 'Code' },
                            { key: 'title', label: 'Term' },
                            { key: 'start_date', label: 'Starts' },
                            { key: 'end_date', label: 'Ends' },
                            {
                              label: 'Registration',
                              render: (r: any) => <Badge>{r.status}</Badge>,
                            },
                            {
                              label: 'Change status',
                              render: (r: any) =>
                                forms({
                                  title: 'Change registration status',
                                  action: 'termStatus',
                                  defaults: { id: r.id },
                                  fields: [
                                    {
                                      name: 'status',
                                      label: 'Status',
                                      options: ['draft', 'open', 'closed'].map(
                                        (value) => ({ value, label: value }),
                                      ),
                                    },
                                  ],
                                }),
                            },
                          ]}
                        />
                      </Panel>
                      <Panel title="Course catalog">
                        {forms({
                          title: 'Create course',
                          action: 'course',
                          fields: [
                            field('code', 'Course code'),
                            field('title', 'Course title'),
                            field('credits', 'Credits', 'number'),
                            field(
                              'feePerCredit',
                              'Tuition per credit (USD)',
                              'number',
                            ),
                            select(
                              'programId',
                              'Required by program',
                              state.programs,
                              (r) => r.code + ' · ' + r.title,
                              true,
                            ),
                            {
                              ...select(
                                'prerequisites',
                                'Prerequisites',
                                state.courses,
                                (r) => r.code + ' · ' + r.title,
                                true,
                              ),
                              multiple: true,
                            },
                          ],
                        })}
                        <Table
                          rows={state.courses}
                          columns={[
                            { key: 'code', label: 'Code' },
                            { key: 'title', label: 'Course' },
                            { key: 'credits', label: 'Credits' },
                            {
                              label: 'Tuition / credit',
                              render: (r: any) => currency(r.fee_cents),
                            },
                            {
                              label: 'Prerequisites',
                              render: (r: any) =>
                                state.prerequisites
                                  .filter((p: any) => p.course_id === r.id)
                                  .map(
                                    (p: any) =>
                                      state.courses.find(
                                        (c: any) => c.id === p.requires_id,
                                      )?.code,
                                  )
                                  .join(', ') || 'None',
                            },
                          ]}
                        />
                      </Panel>
                      <Panel
                        title="Teaching sections"
                        detail="Invite faculty accounts in Account & integrations before assigning a section."
                      >
                        {forms({
                          title: 'Create section',
                          action: 'section',
                          fields: [
                            select(
                              'courseId',
                              'Course',
                              state.courses,
                              (r) => r.code + ' · ' + r.title,
                            ),
                            termField,
                            select(
                              'lecturerId',
                              'Assigned faculty',
                              state.users.filter((u: any) =>
                                ['lecturer', 'dean', 'super_admin'].includes(
                                  u.role,
                                ),
                              ),
                              (u) => u.name,
                            ),
                            field('code', 'Section code'),
                            field('capacity', 'Capacity', 'number'),
                            field('location', 'Room / location'),
                            field('schedule', 'Teaching schedule'),
                          ],
                        })}
                        <Table
                          rows={state.sections}
                          columns={[
                            {
                              label: 'Course / section',
                              render: (s: any) =>
                                s.course_code + ' · ' + s.code,
                            },
                            { key: 'term_title', label: 'Term' },
                            { key: 'lecturer_name', label: 'Faculty' },
                            {
                              label: 'Places',
                              render: (s: any) =>
                                s.enrolled + ' / ' + s.capacity,
                            },
                            { key: 'schedule', label: 'Schedule' },
                          ]}
                        />
                      </Panel>
                      <Panel title="Grading policies">
                        <ScaleEditor onAction={act} />
                        <Table
                          rows={state.gradeSchemes}
                          columns={[
                            { key: 'title', label: 'Scale' },
                            {
                              label: 'Bands',
                              render: (s: any) =>
                                JSON.parse(s.definition)
                                  .map(
                                    (v: any) => v.letter + ': ' + v.min + '+',
                                  )
                                  .join(' · '),
                            },
                            {
                              label: 'Approved',
                              render: (s: any) => date(s.approved_at),
                            },
                          ]}
                        />
                      </Panel>
                    </>
                  )}
                  {screen === 'admissions' && permissions.admissions && (
                    <Panel
                      title="Applications & review"
                      detail="Record an actual application, review its evidence, and approve or reject it. Admission into a student record is a separate registrar action."
                    >
                      {forms({
                        title: 'Record application',
                        action: 'application',
                        fields: [
                          field('fullName', 'Applicant full name'),
                          field('email', 'Applicant email', 'email'),
                          field('phone', 'Phone', 'text', true),
                          select(
                            'programId',
                            'Program applied for',
                            state.programs,
                            (r) => r.code + ' · ' + r.title,
                          ),
                        ],
                      })}
                      <Table
                        rows={state.applications}
                        columns={[
                          { key: 'number', label: 'Application' },
                          {
                            label: 'Applicant',
                            render: (r: any) => (
                              <>
                                {r.full_name}
                                <small>{r.email}</small>
                              </>
                            ),
                          },
                          { key: 'program_title', label: 'Program' },
                          {
                            label: 'Status',
                            render: (r: any) => <Badge>{r.status}</Badge>,
                          },
                          { key: 'decision_note', label: 'Review note' },
                          {
                            label: 'Review',
                            render: (r: any) =>
                              r.status === 'admitted'
                                ? 'Admitted'
                                : forms({
                                    title: 'Review application',
                                    action: 'reviewApplication',
                                    defaults: { id: r.id },
                                    fields: [
                                      {
                                        name: 'status',
                                        label: 'Decision',
                                        options: [
                                          'under_review',
                                          'approved',
                                          'rejected',
                                        ].map((value) => ({
                                          value,
                                          label: value.replaceAll('_', ' '),
                                        })),
                                      },
                                      field(
                                        'note',
                                        'Evidence / decision note',
                                        'textarea',
                                      ),
                                    ],
                                  }),
                          },
                        ]}
                      />
                    </Panel>
                  )}
                  {screen === 'registry' && permissions.registrar && (
                    <>
                      <Panel title="Approved applications → student admission">
                        {forms({
                          title: 'Admit approved applicant',
                          action: 'admit',
                          fields: [
                            select(
                              'applicationId',
                              'Approved application',
                              state.applications.filter(
                                (a: any) => a.status === 'approved',
                              ),
                              (a) => a.number + ' · ' + a.full_name,
                            ),
                            termField,
                            field('studentNumber', 'Assigned student number'),
                          ],
                        })}
                        <Table
                          rows={state.students}
                          columns={[
                            { key: 'student_number', label: 'Student number' },
                            {
                              label: 'Student',
                              render: (s: any) => (
                                <>
                                  {s.full_name}
                                  <small>{s.email}</small>
                                </>
                              ),
                            },
                            { key: 'program_title', label: 'Program' },
                            {
                              label: 'Account',
                              render: (s: any) =>
                                s.user_id
                                  ? 'Linked'
                                  : 'Awaiting student invitation',
                            },
                            {
                              label: 'Status',
                              render: (s: any) => <Badge>{s.status}</Badge>,
                            },
                            {
                              label: 'Record',
                              render: (s: any) => (
                                <button
                                  className="campus-button secondary"
                                  onClick={() => academicRecord(s.id)}
                                >
                                  Academic record
                                </button>
                              ),
                            },
                          ]}
                        />
                        <p className="campus-muted">
                          Invite a student account using the admitted student’s
                          email to link the workspace automatically.
                        </p>
                      </Panel>
                      <Panel title="Registrar-assisted registration">
                        {forms({
                          title: 'Register student in a section',
                          action: 'register',
                          fields: [
                            studentField,
                            select(
                              'sectionId',
                              'Open section',
                              state.sections.filter(
                                (s: any) => s.term_status === 'open',
                              ),
                              (s) =>
                                s.course_code +
                                ' · ' +
                                s.code +
                                ' · ' +
                                s.term_title,
                            ),
                          ],
                        })}
                        <Table
                          rows={state.registrations}
                          columns={[
                            {
                              label: 'Student',
                              render: (r: any) =>
                                state.students.find(
                                  (s: any) => s.id === r.student_id,
                                )?.student_number,
                            },
                            { key: 'course_code', label: 'Course' },
                            { key: 'term_title', label: 'Term' },
                            {
                              label: 'Status',
                              render: (r: any) => <Badge>{r.status}</Badge>,
                            },
                            {
                              label: 'Add/drop',
                              render: (r: any) =>
                                r.status === 'enrolled'
                                  ? forms({
                                      title: 'Drop registration',
                                      action: 'drop',
                                      defaults: { id: r.id },
                                      detail:
                                        'A billed registration produces a credit note. Published grades are locked.',
                                      fields: [
                                        field('reason', 'Reason', 'textarea'),
                                      ],
                                    })
                                  : '—',
                            },
                          ]}
                        />
                      </Panel>
                      <Panel title="Submitted grades → publication">
                        <Table
                          rows={state.grades.filter(
                            (g: any) => g.status === 'submitted',
                          )}
                          columns={[
                            {
                              label: 'Student / course',
                              render: (g: any) => {
                                const r = state.registrations.find(
                                  (r: any) => r.id === g.registration_id,
                                );
                                return (
                                  (state.students.find(
                                    (s: any) => s.id === r?.student_id,
                                  )?.student_number || '') +
                                  ' · ' +
                                  (r?.course_code || '')
                                );
                              },
                            },
                            { key: 'score', label: 'Score' },
                            {
                              label: 'Publish',
                              render: (g: any) =>
                                forms({
                                  title: 'Publish reviewed grade',
                                  action: 'publishGrade',
                                  defaults: { id: g.id },
                                  fields: [],
                                  label: 'Publish grade',
                                }),
                            },
                          ]}
                          empty="No submitted grades await publication."
                        />
                      </Panel>
                      <Panel title="Graduation reviews">
                        <Table
                          rows={state.graduation}
                          columns={[
                            { key: 'student_number', label: 'Student' },
                            {
                              label: 'Credits',
                              render: (g: any) =>
                                g.eligibility.earnedCredits +
                                ' / ' +
                                g.eligibility.requiredCredits,
                            },
                            {
                              label: 'Balance',
                              render: (g: any) =>
                                currency(g.eligibility.balanceCents),
                            },
                            {
                              label: 'Missing required courses',
                              render: (g: any) =>
                                g.eligibility.missingCourses.join(', ') ||
                                'None',
                            },
                            {
                              label: 'Status',
                              render: (g: any) => <Badge>{g.status}</Badge>,
                            },
                            {
                              label: 'Review',
                              render: (g: any) =>
                                g.status === 'requested'
                                  ? forms({
                                      title: 'Review graduation',
                                      action: 'graduationReview',
                                      defaults: { id: g.id },
                                      fields: [
                                        {
                                          name: 'status',
                                          label: 'Decision',
                                          options: [
                                            {
                                              value: 'approved',
                                              label: 'Approve',
                                            },
                                            {
                                              value: 'rejected',
                                              label: 'Reject',
                                            },
                                          ],
                                        },
                                        field(
                                          'note',
                                          'Registrar decision note',
                                          'textarea',
                                        ),
                                      ],
                                    })
                                  : g.note,
                            },
                          ]}
                        />
                      </Panel>
                      <TranscriptQueue state={state} forms={forms} />
                    </>
                  )}
                  {screen === 'faculty' && permissions.faculty && (
                    <Panel
                      title="Teaching roster & grade submission"
                      detail="Faculty may enter grades only for assigned sections. Draft and submitted grades are not visible to students. The registrar publishes reviewed grades."
                    >
                      <Table
                        rows={state.registrations.filter(
                          (r: any) => r.status === 'enrolled',
                        )}
                        columns={[
                          {
                            label: 'Student',
                            render: (r: any) =>
                              state.students.find(
                                (s: any) => s.id === r.student_id,
                              )?.full_name,
                          },
                          {
                            label: 'Course',
                            render: (r: any) =>
                              r.course_code + ' · ' + r.section_code,
                          },
                          { key: 'term_title', label: 'Term' },
                          {
                            label: 'Current grade',
                            render: (r: any) => {
                              const g = gradeFor(r.id);
                              return g ? (
                                <>
                                  {g.score}
                                  <small>{g.status}</small>
                                </>
                              ) : (
                                'Not entered'
                              );
                            },
                          },
                          {
                            label: 'Enter / submit',
                            render: (r: any) =>
                              gradeFor(r.id)?.status === 'published' ? (
                                <Badge>Published · locked</Badge>
                              ) : (
                                <>
                                  {forms({
                                    title: 'Save draft',
                                    action: 'grade',
                                    defaults: {
                                      registrationId: r.id,
                                      submit: false,
                                    },
                                    fields: [
                                      field('score', 'Score (0–100)', 'number'),
                                    ],
                                    label: 'Save draft',
                                  })}
                                  {forms({
                                    title: 'Submit for registrar review',
                                    action: 'grade',
                                    defaults: {
                                      registrationId: r.id,
                                      submit: true,
                                    },
                                    fields: [
                                      field('score', 'Score (0–100)', 'number'),
                                    ],
                                    label: 'Submit grade',
                                  })}
                                </>
                              ),
                          },
                        ]}
                        empty="No registered students are assigned to your teaching sections."
                      />
                    </Panel>
                  )}
                  {screen === 'student' &&
                    permissions.student &&
                    (!profile ? (
                      <Panel title="Student record not linked">
                        <p>
                          Your account is active, but the registrar has not
                          linked an admitted student record to your email yet.
                        </p>
                      </Panel>
                    ) : (
                      <>
                        <Panel
                          title={profile.full_name}
                          detail={profile.student_number}
                        >
                          <div className="ws-metrics">
                            <div>
                              <span>Earned credits</span>
                              <strong>
                                {state.eligibility.earnedCredits} /{' '}
                                {state.eligibility.requiredCredits}
                              </strong>
                            </div>
                            <div>
                              <span>Account balance</span>
                              <strong>{currency(profile.balance_cents)}</strong>
                            </div>
                            <div>
                              <span>Student status</span>
                              <strong className="ws-small-number">
                                {profile.status}
                              </strong>
                            </div>
                          </div>
                          {!!profile.financial_hold && (
                            <p className="ws-error">
                              A financial hold is active. Contact the bursar.
                            </p>
                          )}
                        </Panel>
                        <Panel title="Course registration">
                          {forms({
                            title: 'Register in an open section',
                            action: 'register',
                            fields: [
                              select(
                                'sectionId',
                                'Section',
                                state.sections.filter(
                                  (s: any) => s.term_status === 'open',
                                ),
                                (s) =>
                                  s.course_code +
                                  ' · ' +
                                  s.course_title +
                                  ' · ' +
                                  s.enrolled +
                                  '/' +
                                  s.capacity +
                                  ' places',
                              ),
                            ],
                          })}
                          <Table
                            rows={state.registrations}
                            columns={[
                              { key: 'course_code', label: 'Course' },
                              { key: 'course_title', label: 'Title' },
                              { key: 'term_title', label: 'Term' },
                              { key: 'credits', label: 'Credits' },
                              {
                                label: 'Registration',
                                render: (r: any) => <Badge>{r.status}</Badge>,
                              },
                              {
                                label: 'Published grade',
                                render: (r: any) =>
                                  gradeFor(r.id)
                                    ? gradeFor(r.id).letter
                                    : 'Not published',
                              },
                              {
                                label: 'Drop',
                                render: (r: any) =>
                                  r.status === 'enrolled' && !gradeFor(r.id)
                                    ? forms({
                                        title: 'Request course drop',
                                        action: 'drop',
                                        defaults: { id: r.id },
                                        fields: [
                                          field('reason', 'Reason', 'textarea'),
                                        ],
                                      })
                                    : '—',
                              },
                            ]}
                          />
                        </Panel>
                        <InvoiceList state={state} />
                        <Panel title="Graduation & transcripts">
                          {forms({
                            title: 'Request graduation review',
                            action: 'graduationRequest',
                            fields: [],
                            label: 'Submit review request',
                          })}
                          <Table
                            rows={state.graduation}
                            columns={[
                              {
                                label: 'Review status',
                                render: (g: any) => <Badge>{g.status}</Badge>,
                              },
                              { key: 'note', label: 'Registrar note' },
                            ]}
                          />
                          {forms({
                            title: 'Request a transcript',
                            action: 'transcriptRequest',
                            fields: [
                              field(
                                'purpose',
                                'Purpose and delivery instructions',
                                'textarea',
                              ),
                            ],
                          })}
                          <Table
                            rows={state.transcripts}
                            columns={[
                              { key: 'purpose', label: 'Request' },
                              {
                                label: 'Status',
                                render: (r: any) => <Badge>{r.status}</Badge>,
                              },
                              { key: 'note', label: 'Registrar note' },
                            ]}
                          />
                          <button
                            className="campus-button secondary"
                            onClick={() => academicRecord(profile.id)}
                          >
                            Download academic record
                          </button>
                        </Panel>
                      </>
                    ))}
                  {screen === 'finance' && permissions.finance && (
                    <>
                      <Panel
                        title="Tuition billing"
                        detail="Invoices are calculated from unbilled registrations and course tuition rates. Repeated billing cannot charge the same registration twice."
                      >
                        {forms({
                          title: 'Post tuition invoice',
                          action: 'invoice',
                          fields: [
                            studentField,
                            termField,
                            field('dueDate', 'Payment due date', 'date'),
                          ],
                          label: 'Post invoice',
                        })}
                        <InvoiceList state={state} nested />
                      </Panel>
                      <Panel
                        title="Receipts & reconciliation"
                        detail="A recorded receipt does not settle an invoice. A second bursar or administrator must reconcile it against bank or receipt evidence."
                      >
                        {forms({
                          title: 'Record received payment',
                          action: 'payment',
                          fields: [
                            select(
                              'invoiceId',
                              'Invoice',
                              state.invoices.filter(
                                (i: any) => i.balance_cents > 0,
                              ),
                              (i) =>
                                i.number +
                                ' · ' +
                                i.full_name +
                                ' · ' +
                                currency(i.balance_cents),
                            ),
                            field(
                              'reference',
                              'Unique bank / receipt reference',
                            ),
                            field('amount', 'Received amount (USD)', 'number'),
                            {
                              name: 'method',
                              label: 'Receipt method',
                              options: ['bank', 'mobile_money', 'cash'].map(
                                (value) => ({
                                  value,
                                  label: value.replaceAll('_', ' '),
                                }),
                              ),
                            },
                            field('receivedDate', 'Receipt date', 'date'),
                          ],
                          label: 'Record receipt',
                        })}
                        <Table
                          rows={state.payments}
                          columns={[
                            { key: 'reference', label: 'Reference' },
                            { key: 'invoice_number', label: 'Invoice' },
                            { key: 'full_name', label: 'Student' },
                            {
                              label: 'Amount',
                              render: (p: any) => currency(p.amount_cents),
                            },
                            {
                              label: 'Status',
                              render: (p: any) => <Badge>{p.status}</Badge>,
                            },
                            {
                              label: 'Review',
                              render: (p: any) =>
                                p.status === 'recorded'
                                  ? forms({
                                      title: 'Reconcile receipt',
                                      action: 'reconcilePayment',
                                      defaults: { id: p.id },
                                      fields: [
                                        {
                                          name: 'status',
                                          label: 'Decision',
                                          options: [
                                            {
                                              value: 'reconciled',
                                              label: 'Verified — reconcile',
                                            },
                                            {
                                              value: 'cancelled',
                                              label: 'Cancel receipt',
                                            },
                                          ],
                                        },
                                        field(
                                          'note',
                                          'Verification evidence / reason',
                                          'textarea',
                                        ),
                                      ],
                                    })
                                  : p.review_note,
                            },
                          ]}
                        />
                      </Panel>
                      <Panel title="Student account holds">
                        {forms({
                          title: 'Set or release a financial hold',
                          action: 'hold',
                          fields: [
                            studentField,
                            {
                              name: 'hold',
                              label: 'Account hold',
                              options: [
                                { value: 'true', label: 'Set hold' },
                                { value: 'false', label: 'Release hold' },
                              ],
                            },
                            field('reason', 'Reason', 'textarea'),
                          ],
                        })}
                        <Table
                          rows={state.students}
                          columns={[
                            { key: 'student_number', label: 'Student' },
                            { key: 'full_name', label: 'Name' },
                            {
                              label: 'Balance',
                              render: (s: any) => currency(s.balance_cents),
                            },
                            {
                              label: 'Hold',
                              render: (s: any) =>
                                s.financial_hold ? 'Active' : 'None',
                            },
                          ]}
                        />
                      </Panel>
                    </>
                  )}
                  {screen === 'alumni' &&
                    permissions.alumni &&
                    (!profile ? (
                      <Panel title="Graduate record not linked">
                        <p>
                          The registrar must link your graduated student record
                          to your account email.
                        </p>
                      </Panel>
                    ) : (
                      <>
                        <Panel title="Professional profile">
                          {forms({
                            title: 'Update professional details',
                            action: 'alumniProfile',
                            fields: [
                              field('profession', 'Profession'),
                              field('employer', 'Employer'),
                            ],
                          })}
                          {state.alumniProfile ? (
                            <p>
                              {state.alumniProfile.profession} ·{' '}
                              {state.alumniProfile.employer}
                            </p>
                          ) : (
                            <Empty>
                              No professional profile has been submitted.
                            </Empty>
                          )}
                        </Panel>
                        <Panel title="Academic records">
                          {forms({
                            title: 'Request transcript',
                            action: 'transcriptRequest',
                            fields: [
                              field(
                                'purpose',
                                'Purpose and delivery instructions',
                                'textarea',
                              ),
                            ],
                          })}
                          <Table
                            rows={state.transcripts}
                            columns={[
                              { key: 'purpose', label: 'Purpose' },
                              {
                                label: 'Status',
                                render: (r: any) => <Badge>{r.status}</Badge>,
                              },
                              { key: 'note', label: 'Registrar note' },
                            ]}
                          />
                          <button
                            className="campus-button secondary"
                            onClick={() => academicRecord(profile.id)}
                          >
                            Download academic record
                          </button>
                        </Panel>
                      </>
                    ))}
                  {screen === 'tasks' && (
                    <Panel title="Assigned work">
                      {!['student', 'alumni'].includes(user.role) &&
                        forms({
                          title: 'Assign a task',
                          action: 'task',
                          fields: [
                            field('title', 'Task title'),
                            field('description', 'Instructions', 'textarea'),
                            select(
                              'assigneeId',
                              'Assignee',
                              state.users,
                              (u) => u.name + ' · ' + u.role,
                            ),
                            field('dueDate', 'Due date', 'date'),
                          ],
                        })}
                      <Table
                        rows={state.tasks}
                        columns={[
                          { key: 'title', label: 'Task' },
                          { key: 'description', label: 'Instructions' },
                          { key: 'assignee_name', label: 'Assignee' },
                          { key: 'due_date', label: 'Due' },
                          {
                            label: 'Status',
                            render: (r: any) => <Badge>{r.status}</Badge>,
                          },
                          {
                            label: 'Update',
                            render: (r: any) =>
                              forms({
                                title: 'Update task',
                                action: 'taskStatus',
                                defaults: { id: r.id },
                                fields: [
                                  {
                                    name: 'status',
                                    label: 'Status',
                                    options: [
                                      'todo',
                                      'in_progress',
                                      'completed',
                                    ].map((value) => ({
                                      value,
                                      label: value.replaceAll('_', ' '),
                                    })),
                                  },
                                ],
                              }),
                          },
                        ]}
                      />
                    </Panel>
                  )}
                  {screen === 'audit' && permissions.audit && (
                    <Panel
                      title="Institutional audit trail"
                      detail="Committed workflow changes are appended with the acting account and before/after values. Audit entries cannot be edited or deleted through the database API."
                    >
                      <Table
                        rows={state.audit}
                        columns={[
                          {
                            label: 'Time',
                            render: (r: any) => date(r.created_at),
                          },
                          {
                            label: 'Actor',
                            render: (r: any) => r.actor_name || r.actor_id,
                          },
                          { key: 'action', label: 'Action' },
                          { key: 'entity', label: 'Record' },
                          {
                            label: 'Change details',
                            render: (r: any) => (
                              <details>
                                <summary>View values</summary>
                                <pre>
                                  {JSON.stringify(
                                    {
                                      before: r.before_json
                                        ? JSON.parse(r.before_json)
                                        : null,
                                      after: r.after_json
                                        ? JSON.parse(r.after_json)
                                        : null,
                                    },
                                    null,
                                    2,
                                  )}
                                </pre>
                              </details>
                            ),
                          },
                        ]}
                      />
                    </Panel>
                  )}
                  {screen === 'account' && (
                    <>
                      <AccountCenter user={user} />
                      {permissions.accounts && <HistoricalPrediction />}
                    </>
                  )}
                </>
              )}
            </main>
          </>
        )}
      </div>
      <PortalLoginModal
        isOpen={login}
        onClose={() => setLogin(false)}
        onLoginSuccess={async (u) => {
          setUser(u);
          setLogin(false);
          setScreen(
            u.role === 'student'
              ? 'student'
              : u.role === 'alumni'
                ? 'alumni'
                : u.role === 'lecturer' || u.role === 'dean'
                  ? 'faculty'
                  : u.role === 'bursar'
                    ? 'finance'
                    : u.role === 'admissions_officer'
                      ? 'admissions'
                      : 'overview',
          );
          await load();
        }}
      />
    </>
  );
}
function InvoiceList({ state, nested = false }: any) {
  const content = (
    <>
      <Table
        rows={state.invoices}
        columns={[
          { key: 'number', label: 'Invoice' },
          { key: 'full_name', label: 'Student' },
          { key: 'term_title', label: 'Term' },
          {
            label: 'Original amount',
            render: (i: any) => currency(i.amount_cents),
          },
          {
            label: 'Open balance',
            render: (i: any) => currency(i.balance_cents),
          },
          { key: 'due_date', label: 'Due date' },
          {
            label: 'Lines',
            render: (i: any) => (
              <details>
                <summary>Invoice lines</summary>
                {state.invoiceLines
                  .filter((l: any) => l.invoice_id === i.id)
                  .map((l: any) => (
                    <p key={l.id}>
                      {l.description} · {currency(l.amount_cents)}
                    </p>
                  ))}
                {state.creditNotes
                  .filter((c: any) => c.invoice_id === i.id)
                  .map((c: any) => (
                    <p key={c.id}>
                      Credit note: {currency(c.amount_cents)} · {c.reason}
                    </p>
                  ))}
              </details>
            ),
          },
        ]}
        empty="No invoices have been posted."
      />
      <p className="campus-muted">
        Only reconciled receipts reduce the balance. Credit notes retain the
        original invoice and registration history.
      </p>
    </>
  );
  return nested ? (
    content
  ) : (
    <Panel title="Tuition invoices & account statements">{content}</Panel>
  );
}
function TranscriptQueue({ state, forms }: any) {
  return (
    <Panel title="Transcript requests">
      <Table
        rows={state.transcripts}
        columns={[
          { key: 'full_name', label: 'Student' },
          { key: 'purpose', label: 'Purpose' },
          { label: 'Status', render: (r: any) => <Badge>{r.status}</Badge> },
          {
            label: 'Review',
            render: (r: any) =>
              forms({
                title: 'Review request',
                action: 'transcriptReview',
                defaults: { id: r.id },
                fields: [
                  {
                    name: 'status',
                    label: 'Status',
                    options: ['under_review', 'issued', 'declined'].map(
                      (value) => ({ value, label: value.replaceAll('_', ' ') }),
                    ),
                  },
                  {
                    name: 'note',
                    label: 'Issuance / delivery note',
                    type: 'textarea',
                  },
                ],
              }),
          },
        ]}
      />
    </Panel>
  );
}
