import type { Express, Response } from 'express';
import { Operations, WorkflowError } from './operations';
import { actorOf } from './identity';

export function workspacePermissions(role: string) {
  return {
    setup: ['super_admin', 'registrar'].includes(role),
    admissions: ['super_admin', 'registrar', 'admissions_officer'].includes(
      role,
    ),
    registrar: ['super_admin', 'registrar'].includes(role),
    faculty: ['super_admin', 'lecturer', 'dean'].includes(role),
    finance: ['super_admin', 'bursar'].includes(role),
    student: role === 'student',
    alumni: role === 'alumni',
    audit: ['super_admin', 'registrar'].includes(role),
    accounts: role === 'super_admin',
  };
}
export function installWorkspaces(app: Express, store: Operations) {
  const state = (res: Response) => {
    const actor = actorOf(res)!;
    const permission = workspacePermissions(actor.role);
    const own = store.one('SELECT * FROM students WHERE user_id=?', actor.id);
    const studentScope =
      permission.registrar || permission.finance
        ? '1=1'
        : permission.faculty
          ? 'EXISTS(SELECT 1 FROM registrations r JOIN sections z ON r.section_id=z.id WHERE r.student_id=s.id AND z.lecturer_id=?)'
          : 's.user_id=?';
    const scopeParams = studentScope === '1=1' ? [] : [actor.id];
    const students = store
      .all(
        `SELECT s.*,p.title AS program_title FROM students s JOIN programs p ON p.id=s.program_id WHERE ${studentScope} ORDER BY s.full_name`,
        ...scopeParams,
      )
      .map((s) => ({
        ...s,
        balance_cents:
          permission.finance || permission.registrar || s.user_id === actor.id
            ? store.balance(s.id)
            : null,
      }));
    const studentIds = students.map((s) => s.id);
    const marks = studentIds.map(() => '?').join(',') || 'NULL';
    const registrations = store.all(
      `SELECT r.*,s.term_id,s.lecturer_id,c.code AS course_code,c.title AS course_title,c.credits,t.title AS term_title,s.code AS section_code FROM registrations r JOIN sections s ON r.section_id=s.id JOIN courses c ON c.id=s.course_id JOIN terms t ON t.id=s.term_id WHERE r.student_id IN(${marks})${permission.faculty && !permission.registrar ? ' AND s.lecturer_id=?' : ''} ORDER BY r.created_at DESC`,
      ...studentIds,
      ...(permission.faculty && !permission.registrar ? [actor.id] : []),
    );
    const ids = registrations.map((r) => r.id);
    const gradeIds = ids.map(() => '?').join(',') || 'NULL';
    const grades =
      permission.finance && !permission.registrar
        ? []
        : store.all(
            `SELECT * FROM grades WHERE registration_id IN(${gradeIds})${permission.registrar || permission.faculty ? '' : " AND status='published'"}`,
            ...ids,
          );
    const financeAllowed = permission.finance || permission.registrar || !!own;
    const invoices = financeAllowed
      ? store
          .all(
            `SELECT i.*,s.full_name,s.student_number,t.title AS term_title FROM invoices i JOIN students s ON i.student_id=s.id JOIN terms t ON i.term_id=t.id WHERE i.student_id IN(${marks}) ORDER BY i.created_at DESC`,
            ...studentIds,
          )
          .map((i) => ({ ...i, balance_cents: store.invoiceBalance(i.id) }))
      : [];
    const invoiceIds = invoices.map((i) => i.id);
    const invoiceMarks = invoiceIds.map(() => '?').join(',') || 'NULL';
    const payments = financeAllowed
      ? store.all(
          `SELECT p.*,i.number AS invoice_number,s.full_name FROM payments p JOIN invoices i ON p.invoice_id=i.id JOIN students s ON i.student_id=s.id WHERE p.invoice_id IN(${invoiceMarks}) ORDER BY p.created_at DESC`,
          ...invoiceIds,
        )
      : [];
    const transcripts = permission.registrar
      ? store.all(
          'SELECT t.*,s.full_name FROM transcript_requests t JOIN students s ON t.student_id=s.id ORDER BY t.created_at DESC',
        )
      : own
        ? store.all(
            'SELECT * FROM transcript_requests WHERE student_id=? ORDER BY created_at DESC',
            own.id,
          )
        : [];
    const graduation = permission.registrar
      ? store.all(
          'SELECT g.*,s.full_name,s.student_number FROM graduation_reviews g JOIN students s ON g.student_id=s.id ORDER BY g.created_at DESC',
        )
      : own
        ? store.all(
            'SELECT * FROM graduation_reviews WHERE student_id=?',
            own.id,
          )
        : [];
    const users = store
      .users()
      .filter((u) => !['student', 'alumni'].includes(actor.role) || u.id === actor.id || !['student', 'alumni'].includes(u.role))
      .map((u) =>
        permission.accounts || permission.registrar
          ? u
          : { id: u.id, name: u.name, role: u.role },
      );
    return {
      actor,
      permissions: permission,
      users,
      programs: store.all('SELECT * FROM programs ORDER BY code'),
      terms: store.all('SELECT * FROM terms ORDER BY start_date DESC'),
      courses: store.all('SELECT * FROM courses ORDER BY code'),
      prerequisites: store.all('SELECT * FROM course_prerequisites'),
      requirements: store.all('SELECT * FROM program_requirements'),
      sections: store.all(
        "SELECT s.*,c.code AS course_code,c.title AS course_title,c.credits,t.title AS term_title,t.status AS term_status,u.name AS lecturer_name,(SELECT COUNT(*) FROM registrations r WHERE r.section_id=s.id AND r.status='enrolled') AS enrolled FROM sections s JOIN courses c ON c.id=s.course_id JOIN terms t ON t.id=s.term_id JOIN users u ON u.id=s.lecturer_id ORDER BY t.start_date DESC,c.code",
      ),
      applications: permission.admissions
        ? store.all(
            'SELECT a.*,p.title AS program_title FROM applications a JOIN programs p ON a.program_id=p.id ORDER BY a.created_at DESC',
          )
        : [],
      students,
      ownStudent: own ? { ...own, balance_cents: store.balance(own.id) } : null,
      registrations,
      grades,
      invoices,
      payments,
      invoiceLines: financeAllowed
        ? store.all(
            `SELECT * FROM invoice_lines WHERE invoice_id IN(${invoiceMarks})`,
            ...invoiceIds,
          )
        : [],
      creditNotes: financeAllowed
        ? store.all(
            `SELECT * FROM credit_notes WHERE invoice_id IN(${invoiceMarks})`,
            ...invoiceIds,
          )
        : [],
      gradeSchemes: permission.registrar
        ? store.all('SELECT * FROM grade_schemes ORDER BY approved_at DESC')
        : [],
      graduation: graduation.map((g) => ({
        ...g,
        eligibility: store.eligibility(g.student_id),
      })),
      transcripts,
      eligibility: own ? store.eligibility(own.id) : null,
      alumniProfile:
        store.one('SELECT * FROM alumni_profiles WHERE user_id=?', actor.id) ||
        null,
      tasks: store.all(
        'SELECT t.*,u.name AS assignee_name FROM tasks t JOIN users u ON t.assignee_id=u.id WHERE t.assignee_id=? OR t.created_by=? OR ? ORDER BY t.created_at DESC',
        actor.id,
        actor.id,
        permission.registrar ? 1 : 0,
      ),
      audit: permission.audit
        ? store.all(
            'SELECT a.*,u.name AS actor_name FROM audit a LEFT JOIN users u ON a.actor_id=u.id ORDER BY a.created_at DESC,a.rowid DESC LIMIT 300',
          )
        : store.all(
            'SELECT * FROM audit WHERE actor_id=? ORDER BY created_at DESC,rowid DESC LIMIT 30',
            actor.id,
          ),
      storage: { engine: 'SQLite', schemaVersion: 1, singleInstance: true },
      counts: {
        programs: store.one('SELECT COUNT(*) AS n FROM programs').n,
        courses: store.one('SELECT COUNT(*) AS n FROM courses').n,
        students:
          permission.registrar || permission.finance
            ? store.one(
                "SELECT COUNT(*) AS n FROM students WHERE status='active'",
              ).n
            : students.length,
        sections: store.one('SELECT COUNT(*) AS n FROM sections').n,
      },
    };
  };
  app.get('/api/workspaces/state', (_req, res) => {
    try {
      return res.json(state(res));
    } catch {
      return res
        .status(500)
        .json({ error: 'Could not load workspace records.' });
    }
  });
  app.post('/api/workspaces/action', (req, res) => {
    try {
      const result = store.execute(
        actorOf(res)!,
        req.body.action,
        req.body.data || {},
      );
      return res.json({ success: true, result });
    } catch (error: any) {
      if (error instanceof WorkflowError)
        return res.status(error.status).json({ error: error.message });
      if (/UNIQUE constraint/.test(error.message || ''))
        return res
          .status(409)
          .json({
            error:
              'A record with that identifier already exists. No changes were committed.',
          });
      if (/FOREIGN KEY constraint/.test(error.message || ''))
        return res
          .status(400)
          .json({
            error:
              'A referenced record does not exist. Refresh the workspace and choose a valid record.',
          });
      return res
        .status(500)
        .json({
          error:
            'The transaction could not be committed. No partial changes were saved.',
        });
    }
  });
  app.get('/api/workspaces/transcript/:id', (req, res) => {
    try {
      const actor = actorOf(res)!;
      if (
        !['super_admin', 'registrar', 'student', 'alumni'].includes(actor.role)
      )
        throw new WorkflowError('Not authorized.', 403);
      const student = store.studentFor(actor, req.params.id);
      const rows = store.all(
        "SELECT c.code,c.title,c.credits,t.title AS term,g.score,g.letter,g.points,g.passed,g.updated_at FROM grades g JOIN registrations r ON g.registration_id=r.id JOIN sections s ON r.section_id=s.id JOIN courses c ON s.course_id=c.id JOIN terms t ON s.term_id=t.id WHERE r.student_id=? AND r.status='enrolled' AND g.status='published' ORDER BY t.start_date,c.code",
        student.id,
      );
      return res.json({
        student,
        program: store.one(
          'SELECT * FROM programs WHERE id=?',
          student.program_id,
        ),
        grades: rows,
        eligibility: store.eligibility(student.id),
        issuedRequests: store.all(
          "SELECT id,created_at,note FROM transcript_requests WHERE student_id=? AND status='issued'",
          student.id,
        ),
      });
    } catch (e: any) {
      return res
        .status(e.status || 400)
        .json({ error: e.message || 'Could not load academic record.' });
    }
  });
}
