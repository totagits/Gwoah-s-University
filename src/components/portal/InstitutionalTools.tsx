import React, { useEffect, useRef, useState } from 'react';
import { useCampus } from './CampusContext';
import { EncryptedBackups } from './AccountCenter';
import {
  ActionForm,
  Attendance,
  BookingList,
  Empty,
  Panel,
  RecordList,
  courseField,
  timeFields,
} from './CampusServices';
import { DEMO_REGISTRATIONS, INITIAL_COURSES } from '../../data/seedData';

export function parseGradeCSV(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quote = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (quote && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else quote = !quote;
    } else if (ch === ',' && !quote) {
      row.push(cell.trim());
      cell = '';
    } else if ((ch === '\n' || ch === '\r') && !quote) {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = '';
    } else cell += ch;
  }
  if (quote) throw Error('Unclosed quoted field in CSV.');
  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  const headers = rows.shift();
  if (headers?.join(',') !== 'studentId,course,score')
    throw Error('CSV headers must be studentId,course,score.');
  return rows.map((r, i) => {
    if (r.length !== 3) throw Error(`Row ${i + 2}: expected three columns.`);
    return { studentId: r[0], course: r[1], score: r[2] };
  });
}
export function GradeImporter() {
  const { act } = useCampus();
  const [rows, setRows] = useState<any[]>([]);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <Panel
      title="Grade import"
      detail="Upload a CSV with studentId,course,score headers. The entire batch is validated before any grade is changed."
    >
      <input
        aria-label="Import grade CSV"
        type="file"
        accept=".csv,text/csv"
        onChange={async (e) => {
          try {
            const text = await e.target.files?.[0]?.text();
            if (text) {
              setRows(parseGradeCSV(text));
              setMsg('Review the rows before importing.');
            }
          } catch (e) {
            setRows([]);
            setMsg(String(e));
          }
        }}
      />
      {rows.length > 0 && (
        <>
          <div className="campus-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Course</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 50).map((r, i) => (
                  <tr key={i}>
                    <td>{r.studentId}</td>
                    <td>{r.course}</td>
                    <td>{r.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>{rows.length} rows ready for validation.</p>
          <button
            className="campus-button"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                const result = await act('gradeImport', { rows });
                setMsg(`Imported ${result.imported} grades.`);
                setRows([]);
              } catch (e) {
                setMsg(String(e));
              } finally {
                setBusy(false);
              }
            }}
          >
            Validate and import grades
          </button>
        </>
      )}
      <p role="status" style={{ whiteSpace: 'pre-line' }}>
        {msg}
      </p>
    </Panel>
  );
}
export function Proctoring({ faculty = false }: any) {
  const [active, setActive] = useState(false);
  const [msg, setMsg] = useState('');
  const [feeds, setFeeds] = useState<any[]>([]);
  const [consent, setConsent] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const timer = useRef<any>(null);
  const { user } = useCampus();
  const stop = () => {
    clearInterval(timer.current);
    stream.current?.getTracks().forEach((t) => t.stop());
    setActive(false);
  };
  useEffect(
    () => () => {
      clearInterval(timer.current);
      stream.current?.getTracks().forEach((t) => t.stop());
    },
    [],
  );
  useEffect(() => {
    if (!faculty) return;
    const update = () =>
      fetch('/api/campus/proctor')
        .then((r) => r.json())
        .then(setFeeds)
        .catch(() => {});
    update();
    const interval = setInterval(update, 5000);
    return () => clearInterval(interval);
  }, [faculty]);
  const start = async () => {
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      setActive(true);
      if (video.current) {
        video.current.srcObject = stream.current;
        await video.current.play();
      }
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 180;
      timer.current = setInterval(async () => {
        if (video.current && video.current.readyState >= 2) {
          canvas.getContext('2d')!.drawImage(video.current, 0, 0, 320, 180);
          await fetch('/api/campus/proctor', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user,
              image: canvas.toDataURL('image/jpeg', 0.6),
              focused: document.hasFocus(),
            }),
          }).catch(() => {});
        }
      }, 5000);
    } catch (e) {
      stop();
      setMsg('Camera access was unavailable. Check your browser settings.');
    }
  };
  return (
    <Panel
      title="Remote examination supervision"
      detail="Opt-in webcam snapshots every five seconds. Images remain in server memory for up to 30 seconds, with no recording or automated misconduct decisions."
    >
      {faculty ? (
        <div className="campus-grid">
          {feeds.length ? (
            feeds.map((f) => (
              <div key={f.user} className="campus-record">
                <img src={f.image} alt={'Exam webcam for ' + f.user} />
                <strong>{f.user}</strong>
                <p>
                  {f.focused
                    ? 'Exam tab focused'
                    : 'Tab focus lost — review with student'}
                </p>
                <small>{new Date(f.timestamp).toLocaleTimeString()}</small>
              </div>
            ))
          ) : (
            <Empty>No students are currently sharing a webcam.</Empty>
          )}
        </div>
      ) : (
        <>
          <label className="campus-check">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              disabled={active}
            />
            I agree to share webcam snapshots with the faculty staging dashboard
            for this test.
          </label>
          <video
            ref={video}
            className="campus-video"
            hidden={!active}
            muted
            playsInline
          />
          <button
            className="campus-button"
            disabled={!consent}
            onClick={active ? stop : start}
          >
            {active ? 'Stop sharing webcam' : 'Start exam webcam'}
          </button>
          <p role="status">{msg}</p>
        </>
      )}
    </Panel>
  );
}
export function FacultyTools() {
  const { state } = useCampus();
  const [tab, setTab] = useState('Office hours');
  if (!state) return <Empty>Loading faculty tools…</Empty>;
  return (
    <div className="campus-workspace">
      <div className="campus-eyebrow">FACULTY WORKSPACE</div>
      <h2>More time for teaching. More room for discovery.</h2>
      <p className="campus-lead">
        Coordinate student support, research, and the work behind every lecture.
      </p>
      <nav className="campus-tabs">
        {[
          'Office hours',
          'Attendance',
          'Grade import',
          'Research hub',
          'Grants & funding',
          'Exam supervision',
          'Alumni jobs',
          'Reviews & expenses',
        ].map((t) => (
          <button
            key={t}
            aria-current={tab === t ? 'page' : undefined}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </nav>
      {tab === 'Office hours' && (
        <Panel title="Open your door to students">
          <ActionForm
            action="slot"
            label="Publish availability"
            fields={[
              { name: 'title', label: 'Lecturer and appointment topic' },
              courseField,
              ...timeFields,
              {
                name: 'description',
                label: 'Location or meeting instructions',
                optional: true,
              },
            ]}
          />
          <BookingList items={state.slots} />
          <h4>Student reservations</h4>
          <RecordList items={state.bookings} />
        </Panel>
      )}
      {tab === 'Attendance' && <Attendance faculty />}
      {tab === 'Grade import' && <GradeImporter />}
      {tab === 'Exam supervision' && <Proctoring faculty />}
      {tab === 'Research hub' && (
        <div className="campus-grid">
          {[
            ['project', 'Collaborative projects', 'projects'],
            ['ethics', 'Ethics board submissions', 'ethics'],
            ['patent', 'Patents & university IP', 'patents'],
          ].map(([action, title, list]) => (
            <Panel key={action} title={title}>
              <ActionForm
                action={action}
                fields={[
                  { name: 'title', label: 'Title' },
                  {
                    name: 'description',
                    label: 'Collaborators, reference and details',
                    type: 'textarea',
                  },
                  {
                    name: 'status',
                    label: 'Status',
                    options: [
                      'Draft',
                      'Submitted',
                      'Under review',
                      'Approved',
                      'Closed',
                    ],
                  },
                ]}
              />
              <RecordList items={state[list]} />
            </Panel>
          ))}
        </div>
      )}
      {tab === 'Grants & funding' && (
        <Panel title="From proposal to possibility">
          <div className="campus-metrics">
            <div>
              <strong>{state.grants.length}</strong>
              <span>Applications</span>
            </div>
            <div>
              <strong>
                $
                {state.grants
                  .reduce((s: number, g: any) => s + g.amount, 0)
                  .toLocaleString()}
              </strong>
              <span>Funding tracked</span>
            </div>
            <div>
              <strong>
                $
                {state.grants
                  .reduce((s: number, g: any) => s + g.spent, 0)
                  .toLocaleString()}
              </strong>
              <span>Expenditure</span>
            </div>
          </div>
          <ActionForm
            action="grant"
            fields={[
              { name: 'title', label: 'Grant / funding cycle' },
              {
                name: 'description',
                label: 'Funder, deadline and project',
                type: 'textarea',
              },
              {
                name: 'amount',
                label: 'Award / requested USD',
                type: 'number',
                min: 0,
                step: '.01',
              },
              {
                name: 'spent',
                label: 'Expenditure USD',
                type: 'number',
                min: 0,
                step: '.01',
              },
              {
                name: 'status',
                label: 'Application status',
                options: [
                  'Draft',
                  'Submitted',
                  'Under review',
                  'Awarded',
                  'Declined',
                ],
              },
            ]}
          />
          <RecordList
            items={state.grants}
            render={(g: any) => (
              <>
                <strong>{g.title}</strong>
                <p>
                  {g.status} · ${g.spent} spent of ${g.amount}
                </p>
                <p>{g.description}</p>
              </>
            )}
          />
        </Panel>
      )}
      {tab === 'Reviews & expenses' && (
        <div className="campus-grid">
          <Panel title="Tutor eligibility reviews">
            <RecordList
              items={state.tutors}
              render={(i: any) => (
                <>
                  <strong>{i.title}</strong>
                  <p>
                    {i.course} · {i.status}
                  </p>
                  <ActionForm
                    action="reviewTutor"
                    defaults={{ id: i.id }}
                    fields={[
                      {
                        name: 'status',
                        label: 'Review outcome',
                        options: ['Approved', 'Declined'],
                      },
                    ]}
                    label="Save review"
                  />
                </>
              )}
            />
          </Panel>
          <Panel title="Transcript fulfillment">
            <RecordList
              items={state.transcripts}
              render={(i: any) => (
                <>
                  <strong>{i.user}</strong>
                  <p>
                    {i.purpose} · {i.status}
                  </p>
                  <ActionForm
                    action="reviewTranscript"
                    defaults={{ id: i.id }}
                    fields={[
                      {
                        name: 'status',
                        label: 'Request status',
                        options: [
                          'Under review',
                          'Ready for collection',
                          'Issued',
                          'Declined',
                        ],
                      },
                    ]}
                    label="Update request"
                  />
                </>
              )}
            />
          </Panel>
          <Panel title="Grant expenditures">
            <RecordList
              items={state.grants}
              render={(g: any) => (
                <>
                  <strong>{g.title}</strong>
                  <p>
                    USD {g.spent} spent of {g.amount}
                  </p>
                  <ActionForm
                    action="grantExpense"
                    defaults={{ id: g.id }}
                    fields={[
                      {
                        name: 'amount',
                        label: 'Expense amount USD',
                        type: 'number',
                        min: 0.01,
                        step: '.01',
                      },
                      {
                        name: 'description',
                        label: 'Expense reference and purpose',
                      },
                    ]}
                    label="Record expenditure"
                  />
                  <RecordList
                    items={g.expenses}
                    render={(e: any) => (
                      <p>
                        {e.description} · USD {e.amount} · {e.at}
                      </p>
                    )}
                  />
                </>
              )}
            />
          </Panel>
          <Panel title="Research status updates">
            {['grants', 'projects', 'ethics', 'patents'].map((collection) => (
              <RecordList
                key={collection}
                items={state[collection]}
                render={(i: any) => (
                  <>
                    <strong>{i.title}</strong>
                    <p>
                      {collection} · {i.status}
                    </p>
                    <ActionForm
                      action="updateResearch"
                      defaults={{ id: i.id, collection }}
                      fields={[
                        {
                          name: 'status',
                          label: 'Status',
                          options: [
                            'Draft',
                            'Submitted',
                            'Under review',
                            'Approved',
                            'Awarded',
                            'Declined',
                            'Closed',
                          ],
                        },
                      ]}
                      label="Update status"
                    />
                  </>
                )}
              />
            ))}
          </Panel>
        </div>
      )}
      {tab === 'Alumni jobs' && (
        <Panel title="Open doors for your graduates">
          <ActionForm
            action="job"
            fields={[
              { name: 'title', label: 'Role and organisation' },
              {
                name: 'description',
                label: 'Requirements, deadline and application instructions',
                type: 'textarea',
              },
            ]}
          />
          <RecordList items={state.jobs} />
        </Panel>
      )}
    </div>
  );
}

export function SuccessPredictor() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    fetch('/api/students/u-student')
      .then((r) => r.json())
      .then((d) => setRows(d.registrations || DEMO_REGISTRATIONS))
      .catch(() => setRows(DEMO_REGISTRATIONS));
  }, []);
  return (
    <Panel
      title="Student success signals"
      detail="Advisory rule: scores below 60 suggest a support conversation. This is not a trained prediction model and must not determine student eligibility."
    >
      {rows
        .filter((r) => typeof r.score === 'number')
        .map((r) => (
          <div className="campus-signal" key={r.id}>
            <strong>{r.courseCode}</strong>
            <progress max="100" value={r.score} />
            <span>
              {r.score}% · {r.score < 60 ? 'Support suggested' : 'On track'}
            </span>
          </div>
        ))}
      {!rows.some((r) => typeof r.score === 'number') && (
        <Empty>
          Historical assignment data has not been connected. No risk predictions
          are being made.
        </Empty>
      )}
    </Panel>
  );
}
export function InstitutionalControls() {
  return (
    <div className="campus-workspace">
      <div className="campus-eyebrow">INSTITUTIONAL CONTINUITY</div>
      <h2>Preserve the university’s records.</h2>
      <EncryptedBackups />
      <Panel title="Accountability">
        <p>
          Account and access events are available in Account &amp; integrations.
          Institutional record changes remain in NCHE &amp; Audit.
        </p>
      </Panel>
    </div>
  );
}
export function TuitionReminders() {
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <Panel
      title="Tuition billing & reminders"
      detail="Generates an invoice from active registrations and the course fee catalog. Email delivery requires RESEND_API_KEY and a verified sender."
    >
      <button
        className="campus-button"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            const r = await fetch('/api/campus/billing', { method: 'POST' });
            const data = await r.json();
            if (!r.ok) throw Error(data.error);
            setMsg(`Invoice: $${data.billed.toFixed(2)}. ${data.email}`);
          } catch (e) {
            setMsg(String(e));
          } finally {
            setBusy(false);
          }
        }}
      >
        Generate invoice and process reminder
      </button>
      <p role="status">{msg}</p>
    </Panel>
  );
}

export function NcheComplianceMonitor() {
  const { state } = useCampus();
  const [metrics, setMetrics] = useState<any>(null);
  useEffect(() => {
    Promise.all([
      fetch('/api/auth/users').then((r) => r.json()),
      fetch('/api/resources').then((r) => r.json()),
    ])
      .then(([u, r]) => {
        const faculty = u.users.filter((p: any) =>
          ['lecturer', 'dean'].includes(p.role),
        ).length;
        const students = u.users.filter(
          (p: any) => p.role === 'student',
        ).length;
        setMetrics({
          faculty,
          students,
          ratio: faculty ? students / faculty : null,
          resources: (r.resources || []).length,
        });
      })
      .catch(() => {});
  }, []);
  if (!state || !metrics) return <Empty>Loading compliance evidence…</Empty>;
  const standard = state.standards[0];
  return (
    <Panel
      title="NCHE compliance monitor"
      detail="Checks the available staging records against institution-reviewed thresholds. This is a readiness check, not an accreditation determination."
    >
      <div className="campus-metrics">
        <div>
          <strong>
            {metrics.students} : {metrics.faculty}
          </strong>
          <span>Student / faculty records</span>
        </div>
        <div>
          <strong>{metrics.resources + state.documents.length}</strong>
          <span>Library resources</span>
        </div>
      </div>
      {standard ? (
        <>
          <a href={standard.source} target="_blank" rel="noreferrer">
            Reviewed policy source
          </a>
          <div className="campus-record">
            <strong>
              {metrics.ratio === null
                ? 'Cannot assess: no faculty records'
                : metrics.ratio > standard.maxRatio
                  ? 'Action needed: student-to-faculty ratio exceeds reviewed limit'
                  : 'Student-to-faculty ratio within reviewed limit'}
            </strong>
            <p>
              Configured maximum: {standard.maxRatio} students per faculty
              member
            </p>
          </div>
          <div className="campus-record">
            <strong>
              {metrics.resources + state.documents.length <
              standard.minResources
                ? 'Action needed: library resources below reviewed minimum'
                : 'Library resource count meets reviewed minimum'}
            </strong>
            <p>Configured minimum: {standard.minResources} resources</p>
          </div>
        </>
      ) : (
        <Empty>
          University-approved thresholds and source evidence are required before
          compliance can be assessed.
        </Empty>
      )}
      <details>
        <summary>Set institution-reviewed thresholds</summary>
        <ActionForm
          action="standards"
          fields={[
            {
              name: 'maxRatio',
              label: 'Verified maximum students per faculty member',
              type: 'number',
              min: 1,
              step: '.1',
            },
            {
              name: 'minResources',
              label: 'Verified minimum library resources',
              type: 'number',
              min: 0,
            },
            {
              name: 'source',
              label: 'HTTPS source for the reviewed standard',
              type: 'url',
            },
          ]}
          label="Save reviewed thresholds"
        />
      </details>
    </Panel>
  );
}
