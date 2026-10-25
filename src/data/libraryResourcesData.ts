/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LibraryResource } from '../types';

export const INITIAL_LIBRARY_RESOURCES: LibraryResource[] = [
  // ==========================================
  // 1. DIGITIZED COURSE MATERIALS
  // ==========================================
  {
    id: 'res-course-csc301-syl',
    title: 'CSC 301 Data Structures & Algorithms: Official Senate Syllabus & Lab Rubrics',
    category: 'course_material',
    subcategory: 'Course Syllabus',
    courseCode: 'CSC 301',
    authorOrAuthority: 'Dr. Moses S. Doe (Department of Computer Science)',
    publishedDate: '2026-10-02',
    academicYear: '2026/2027',
    version: 'v2.4 (Senate Accredited)',
    fileFormat: 'PDF',
    fileSizeKB: 245,
    statutoryReference: 'NCHE-ENG-CSC-2024 Standards',
    description: 'Comprehensive curriculum specification for advanced data structures, asymptotic notation, balanced search trees, graph theory, and laboratory assignments aligned with NCHE computer science standards.',
    contentSummary: `COURSE OVERVIEW:
CSC 301 provides in-depth exposure to data representation, complexity analysis, and tree/graph structures for mission-critical software systems.

KEY MODULES COVERED:
1. Module 1: Asymptotic Complexity (Big-O, Big-Omega, Big-Theta, Master Theorem, recursion trees).
2. Module 2: Self-Balancing Trees (AVL node rotations, Red-Black color invariants, B-trees for disk blocks).
3. Module 3: Priority Queues & Heaps (Binary heaps, Fibonacci heaps, Dijkstra's algorithm optimization).
4. Module 4: Graph Algorithms (Breadth-First Search, Depth-First Search, Minimum Spanning Trees, Topological Sorting).
5. Module 5: Hash Tables & Dynamic Programming (Collision resolution strategies, memoization vs tabulation).

ASSESSMENT BREAKDOWN:
- Weekly Laboratory Implementations: 25%
- Midterm Senate Moderated Exam: 25%
- Term Project (Low-Bandwidth Mobile Offline Cache Algorithm): 20%
- Final University Comprehensive Examination: 30%`,
    keyHighlights: [
      'Senate Exam Board verified for Academic Year 2026/2027',
      'Mandatory 3 hours lecture + 2 hours supervised lab per week (3 Credits)',
      'Includes complete rubrics for Python and C++ assignments',
    ],
    isPinned: true,
    tags: ['CSC 301', 'algorithms', 'data structures', 'syllabus', 'computer science'],
  },
  {
    id: 'res-course-csc301-wk1',
    title: 'CSC 301 Week 1: Asymptotic Complexity & Master Theorem Study Notes',
    category: 'course_material',
    subcategory: 'Lecture Notes & Slides',
    courseCode: 'CSC 301',
    authorOrAuthority: 'Dr. Moses S. Doe (Department of Computer Science)',
    publishedDate: '2026-10-05',
    academicYear: '2026/2027',
    version: '1.0',
    fileFormat: 'PDF',
    fileSizeKB: 380,
    courseCode: 'CSC 301',
    description: 'Digitized lecture notes on time-space complexity, formal mathematical limit proofs, recurrence relations, and algorithm performance in resource-constrained infrastructure.',
    contentSummary: `LECTURE SUMMARY - WEEK 1:
In this lecture, students examine formal definitions of computational complexity and worst-case runtime bounds.

CORE CONCEPTS:
- Asymptotic Notations: f(n) = O(g(n)) implies existence of constants c > 0 and n0 >= 0 such that 0 <= f(n) <= c * g(n) for all n >= n0.
- Master Theorem: T(n) = aT(n/b) + f(n). Analysis of Cases 1, 2, and 3 with divide-and-conquer recurrences.
- Low-Resource Optimization: Why O(n log n) sorting is essential over slow cellular networks and low-RAM devices in rural university labs.
- Problem Set 1: 8 proof problems with step-by-step solutions for practice.`,
    keyHighlights: [
      'Full mathematical proofs with step-by-step limit derivations',
      'Worked examples for Merge Sort, Binary Search, and Strassen matrix multiplication',
      'Includes 10 self-assessment review questions',
    ],
    isPinned: false,
    tags: ['CSC 301', 'complexity', 'asymptotic notation', 'lecture notes'],
  },
  {
    id: 'res-course-csc301-wk2',
    title: 'CSC 301 Week 2: AVL Tree Rotations & Balanced Search Structures',
    category: 'course_material',
    subcategory: 'Lecture Notes & Slides',
    courseCode: 'CSC 301',
    authorOrAuthority: 'Dr. Moses S. Doe (Department of Computer Science)',
    publishedDate: '2026-10-12',
    academicYear: '2026/2027',
    version: '1.1',
    fileFormat: 'PDF',
    fileSizeKB: 460,
    courseCode: 'CSC 301',
    description: 'Detailed analysis of self-balancing binary search trees, balance factor calculations, single and double rotations (LL, RR, LR, RL), and deletion rebalancing.',
    contentSummary: `LECTURE SUMMARY - WEEK 2:
AVL trees guarantee logarithmic height O(log n) for all search, insert, and delete operations by maintaining a strict balance factor difference of at most 1.

ROTATION ALGORITHMS:
- Left-Left Case (LL): Right rotation around node k2.
- Right-Right Case (RR): Left rotation around node k1.
- Left-Right Case (LR): Left rotation on left child followed by right rotation on parent.
- Right-Left Case (RL): Right rotation on right child followed by left rotation on parent.
- Balance Factor calculation: BF = Height(LeftSubtree) - Height(RightSubtree) in {-1, 0, 1}.`,
    keyHighlights: [
      'Includes rotation visual state diagrams',
      'Complete Python and Java implementation code snippets',
      'Proof of AVL height upper bound: H < 1.4404 log2(N + 2) - 0.328',
    ],
    isPinned: false,
    tags: ['CSC 301', 'trees', 'AVL', 'rotations', 'lecture notes'],
  },
  {
    id: 'res-course-csc301-lab',
    title: 'CSC 301 Laboratory Manual: Low-Bandwidth Data Structures Benchmarking',
    category: 'course_material',
    subcategory: 'Laboratory Manual',
    courseCode: 'CSC 301',
    authorOrAuthority: 'Department of Computer Science & ICT Services',
    publishedDate: '2026-10-04',
    academicYear: '2026/2027',
    version: '2.0',
    fileFormat: 'PDF',
    fileSizeKB: 320,
    courseCode: 'CSC 301',
    description: 'Practical lab instructions for building, profiling, and benchmarking data structures in Unix terminal environments with memory footprint analysis.',
    contentSummary: `LAB MANUAL INSTRUCTIONS:
Lab 1: Memory alignment and cache locality of C-style contiguous arrays vs linked lists.
Lab 2: Implementing an AVL Tree from scratch without standard template libraries.
Lab 3: Benchmarking search latency with 100,000 student index records under limited RAM conditions.
Lab 4: Building a graph traversal engine for Liberian county transportation route planning.`,
    keyHighlights: [
      'Command-line profiling instructions using Linux tools (valgrind, gprof)',
      'Automated grading test harnesses provided on campus git server',
      'Compliant with NCHE 2-hour weekly laboratory contact requirement',
    ],
    isPinned: false,
    tags: ['CSC 301', 'lab manual', 'terminal', 'profiling'],
  },
  {
    id: 'res-course-csc201-syl',
    title: 'CSC 201 Object-Oriented Software Engineering: Course Syllabus & Design Patterns',
    category: 'course_material',
    subcategory: 'Course Syllabus',
    courseCode: 'CSC 201',
    authorOrAuthority: 'Dr. Moses S. Doe & Prof. Joseph Flomo',
    publishedDate: '2026-10-03',
    academicYear: '2026/2027',
    version: '3.0',
    fileFormat: 'PDF',
    fileSizeKB: 290,
    statutoryReference: 'NCHE Curricular Framework for Computing',
    description: 'Foundational object-oriented design principles (SOLID), UML class modeling, GoF design patterns, unit testing frameworks, and multi-tier architectural patterns.',
    contentSummary: `COURSE OVERVIEW:
CSC 201 prepares students for professional software engineering practices through hands-on architecture, code refactoring, and test-driven development.

MODULES:
- Object-Oriented Principles: Encapsulation, inheritance, polymorphism, and interface abstraction.
- SOLID Architecture: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion.
- Gang of Four Patterns: Factory, Singleton, Observer, Strategy, Adapter, and Decorator.
- Automated Testing: Writing testable code with JUnit/PyTest and measuring branch code coverage.`,
    keyHighlights: [
      'Senate approved 3-credit curriculum for sophomore software engineering students',
      'Term project includes building a multi-tier records management prototype',
      'Covers Git version control workflow and pull request review protocols',
    ],
    isPinned: false,
    tags: ['CSC 201', 'OOP', 'software engineering', 'design patterns', 'syllabus'],
  },
  {
    id: 'res-course-mat201-notes',
    title: 'MAT 201 Discrete Mathematical Structures: Induction, Logic & Graph Theory',
    category: 'course_material',
    subcategory: 'Lecture Notes & Slides',
    courseCode: 'MAT 201',
    authorOrAuthority: 'Prof. Joseph Flomo (Department of Mathematics)',
    publishedDate: '2026-10-08',
    academicYear: '2026/2027',
    version: '1.2',
    fileFormat: 'PDF',
    fileSizeKB: 410,
    courseCode: 'MAT 201',
    description: 'Comprehensive study packet on propositional calculus, predicate logic, mathematical induction, set theory, combinatorics, and discrete probability.',
    contentSummary: `DIGITIZED LECTURE PACKET:
Chapter 1: Logic, propositions, connectives, truth tables, and equivalence laws.
Chapter 2: Methods of proof: direct proof, proof by contraposition, proof by contradiction.
Chapter 3: Principle of Mathematical Induction (weak and strong forms) with algorithmic verification proofs.
Chapter 4: Relations and Functions: equivalence relations, partial orderings, and Hasse diagrams.
Chapter 5: Graph Theory Fundamentals: Euler paths, Hamiltonian circuits, planar graphs, and graph coloring.`,
    keyHighlights: [
      'Standard reference text for all computing, mathematics, and engineering majors',
      'Contains 60 solved proof exercises and practice exam questions',
      'Directly links formal logic to hardware circuit synthesis and boolean algebra',
    ],
    isPinned: false,
    tags: ['MAT 201', 'discrete mathematics', 'logic', 'induction', 'proofs'],
  },
  {
    id: 'res-course-eng101-guide',
    title: 'ENG 101 Advanced Academic Writing & Research Communication Guide',
    category: 'course_material',
    subcategory: 'Reference Reading',
    courseCode: 'ENG 101',
    authorOrAuthority: 'Department of Languages & General Studies',
    publishedDate: '2026-10-02',
    academicYear: '2026/2027',
    version: '4.1',
    fileFormat: 'PDF',
    fileSizeKB: 340,
    statutoryReference: 'NCHE Baccalaureate Core General Education Requirement',
    description: 'Guidelines on scholarly rhetoric, peer-reviewed literature reviews, APA 7th edition citation standards, plagiarism prevention, and thesis statement formulation.',
    contentSummary: `INSTRUCTIONAL HANDBOOK:
Section 1: Structuring Baccalaureate Research Papers (Abstract, Introduction, Literature Review, Methodology, Analysis, Discussion).
Section 2: Citations and Bibliography: APA 7th Edition rules for journals, government gazettes, and digital repositories.
Section 3: Academic Honesty: University Senate plagiarism detection thresholds, proper paraphrasing versus verbatim quotation.`,
    keyHighlights: [
      'Mandatory general education text for all freshmen and transfer students',
      'Detailed citation formatting examples for Liberian statutory and historical sources',
      'Includes academic paper template conforming to university guidelines',
    ],
    isPinned: false,
    tags: ['ENG 101', 'academic writing', 'APA style', 'research', 'general education'],
  },

  // ==========================================
  // 2. NCHE GUIDELINES & STATUTORY STANDARDS
  // ==========================================
  {
    id: 'res-nche-accreditation-manual',
    title: 'NCHE Institutional Accreditation & Program Recognition Manual',
    category: 'nche_guideline',
    subcategory: 'Statutory Accreditation Standard',
    authorOrAuthority: 'National Commission on Higher Education (NCHE), Republic of Liberia',
    publishedDate: '2026-08-15',
    academicYear: '2026/2027',
    version: 'Official Gazette 2026 Revised Standard',
    fileFormat: 'PDF',
    fileSizeKB: 820,
    statutoryReference: 'NCHE Act of 1989 (Amended) & Curricular Regulations',
    description: 'The statutory higher education standard defining licensing criteria, degree credit ceilings, institutional governance, faculty credentials, and physical infrastructure requirements in the Republic of Liberia.',
    contentSummary: `REPUBLIC OF LIBERIA - NATIONAL COMMISSION ON HIGHER EDUCATION (NCHE)
MANDATORY STATUTORY STANDARDS SUMMARY:

1. BACCALAUREATE DEGREE REQUIREMENTS:
All accredited 4-year undergraduate degree programs must mandate between 120 and 132 credit hours of Senate-approved coursework. General education must comprise at least 30-36 credits.

2. SEMESTER CREDIT LOAD REGULATIONS:
- Full-time student status: Minimum 12 credits per semester.
- Standard academic load: 15-18 credits per semester.
- Maximum allowable load: 21 credits per semester. Any overload beyond 18 credits requires a 3.50+ CGPA and formal Senate Academic Board waiver.

3. FACULTY CREDENTIALS AND TERMINAL DEGREES:
- At least 30% of permanent full-time faculty in degree-granting colleges must possess terminal doctoral degrees (Ph.D., D.Sc., or M.D.).
- Master's degree holders may instruct undergraduate courses up to 300-level under departmental supervision.

4. ACCREDITATION REVIEW CYCLE:
Institutions undergo statutory quinquennial (5-year) comprehensive audits and annual data compliance synchronization via the MoE EMIS tertiary portal.`,
    keyHighlights: [
      'Governing authority for all degrees conferred by Gwoah\'s University',
      'Mandates 120-132 credits graduation threshold and 12-credit full-time enrollment floor',
      'Sets standards for faculty-to-student ratios (maximum 1:35 in classroom, 1:20 in laboratories)',
    ],
    isPinned: true,
    tags: ['NCHE', 'accreditation', 'standards', 'credit hours', 'degree audit', 'Liberia'],
  },
  {
    id: 'res-nche-grading-scale',
    title: 'NCHE Standard Grading Scale & Quality Point Assessment Directives',
    category: 'nche_guideline',
    subcategory: 'Academic Assessment Directive',
    authorOrAuthority: 'National Commission on Higher Education (NCHE)',
    publishedDate: '2026-07-20',
    academicYear: '2026/2027',
    version: 'Circular NCHE/REG/2026-04',
    fileFormat: 'PDF',
    fileSizeKB: 290,
    statutoryReference: 'NCHE Academic Standards Circular 2026',
    description: 'Official Liberian university 4.0 grading scale, numerical score conversion bands, quality point multipliers, grade appeal mechanisms, and academic probation thresholds.',
    contentSummary: `NCHE UNIFIED GRADING SCALE DIRECTIVE:
Grade A: 90 - 100% | Quality Points: 4.00 | Excellent Distinction
Grade B+: 85 - 89% | Quality Points: 3.50 | Very Good
Grade B: 80 - 84% | Quality Points: 3.00 | Good / Above Average
Grade C+: 75 - 79% | Quality Points: 2.50 | Satisfactory / Average
Grade C: 70 - 74% | Quality Points: 2.00 | Fair / Minimum Pass for Major Course
Grade D: 60 - 69% | Quality Points: 1.00 | Conditional Pass / Electives Only
Grade F: 0 - 59% | Quality Points: 0.00 | Fail / Mandatory Retake

ACADEMIC STANDING DIRECTIVES:
- Dean's List Honor: Semester GPA of 3.50 or higher with zero grades below B.
- Good Standing: Cumulative GPA (CGPA) of 2.00 or higher.
- Academic Probation: CGPA below 2.00 triggers a restricted 12-credit registration limit and mandatory academic counseling.
- Academic Dismissal: Failure to elevate CGPA above 2.00 after two consecutive probationary semesters.`,
    keyHighlights: [
      'Prescribes the exact 4.0 scale implemented in Gwoah\'s University grade engine',
      'Defines prerequisite grade C floor required for all major and concentration courses',
      'Provides statutory timetable for grade appeal petitions (within 14 working days of publishing)',
    ],
    isPinned: true,
    tags: ['NCHE', 'grading scale', 'quality points', 'GPA', 'probation', 'dean list'],
  },
  {
    id: 'res-nche-heqaf-qa',
    title: 'Liberia Higher Education Quality Assurance Framework (HEQAF)',
    category: 'nche_guideline',
    subcategory: 'Quality Assurance Protocol',
    authorOrAuthority: 'NCHE Quality Assurance Directorate',
    publishedDate: '2026-05-18',
    academicYear: '2026/2027',
    version: 'HEQAF Framework 2026',
    fileFormat: 'PDF',
    fileSizeKB: 610,
    statutoryReference: 'HEQAF Pillar II: Institutional Assessment & Exam Security',
    description: 'Guidelines on external examiner moderation of semester final examinations, student course evaluations, library holdings verification, and ICT lab certifications.',
    contentSummary: `HEQAF PROTOCOLS:
1. Examination Moderation: All final examination questions and marking schemes must undergo independent departmental peer review and external moderation by appointed senior scholars.
2. Examination Integrity: Question papers must be deposited in encrypted university safes 72 hours prior to examination dates.
3. Student Feedback Mechanisms: At the conclusion of Week 14, every enrolled student completes an anonymous course and lecturer evaluation rubric.
4. Laboratory and Library Minimums: 1 workstation per 4 computer science scholars, access to licensed digital scholarly databases, and backup electrical generation for uninterrupted study.`,
    keyHighlights: [
      'Establishes internal audit procedures for semester examinations',
      'Enforces anonymous student course evaluation procedures',
      'Mandates digital cataloging of all university academic materials',
    ],
    isPinned: false,
    tags: ['NCHE', 'quality assurance', 'HEQAF', 'audit', 'exam moderation'],
  },
  {
    id: 'res-nche-moe-dei-policy',
    title: 'Liberia’s Diversity, Equity, and Inclusion (DEI) Policy in Higher Education',
    category: 'nche_guideline',
    subcategory: 'National Policy Directive',
    authorOrAuthority: 'Ministry of Education (MoE), Republic of Liberia',
    publishedDate: '2024-10-31',
    academicYear: '2026/2027',
    version: 'MoE DEI Directive (Oct 2024)',
    fileFormat: 'PDF',
    fileSizeKB: 520,
    statutoryReference: 'MoE DEI Higher Ed Policy 2024 (Section 3: Universal Accessibility)',
    description: 'National higher education directive mandating non-discriminatory access, gender-sensitive learning accommodations, physical and digital accessibility aids for disabled scholars, and transparent grievance channels.',
    contentSummary: `MINISTRY OF EDUCATION DEI MANDATE:
Promulgated 31 October 2024 to guarantee equitable access across all tertiary learning institutions in the Republic of Liberia.

STATUTORY ARTICLES:
- Article 3.1: Non-Discrimination on basis of ethnicity, gender, disability, county of origin, or economic status.
- Article 3.2: Universal Learning Accessibility: Digital portals and lecture materials must conform to modern accessibility standards (WCAG 2.2 AA) with text-to-speech compatibility and offline-first download capabilities.
- Article 3.3: Gender Parity in STEM: Institutional incentives and grants for female enrollment in Computer Science, Engineering, and Health Sciences.
- Article 3.4: Accommodations for Disabled Scholars: Accessible campus ramps, exam time extensions (1.5x) for certified visual or motor impairments, and assistive reader hardware.`,
    keyHighlights: [
      'National policy enacted on 31 October 2024',
      'Gwoah\'s University ERP accessibility features comply directly with Section 3.2',
      'Governs the 42 currently accommodated students with documented accessibility profiles',
    ],
    isPinned: false,
    tags: ['Ministry of Education', 'DEI', 'equity', 'accessibility', 'diversity', 'Liberia'],
  },
  {
    id: 'res-nche-emis-standards',
    title: 'National EMIS Tertiary Data Exchange Standards & Harmonization Directives',
    category: 'nche_guideline',
    subcategory: 'Data Exchange Protocol',
    authorOrAuthority: 'Ministry of Education (MoE) & NCHE EMIS Taskforce',
    publishedDate: '2026-09-29',
    academicYear: '2026/2027',
    version: 'EMIS-TERTIARY-2026-V1',
    fileFormat: 'PDF',
    fileSizeKB: 480,
    statutoryReference: 'Liberia Education Sector Plan 2022/23–2026/27 (Pillar III)',
    description: 'Technical standard governing annual reporting schema for student enrollment by county, faculty, gender parity indices, and institutional compliance.',
    contentSummary: `EMIS TERTIARY DATA HARMONIZATION DIRECTIVE:
Directs all higher education institutions to maintain synchronized data exchange pipelines with the Ministry of Education EMIS central database.

REPORTING FIELDS:
1. Institution Identifier: LR-GU-084 (Gwoah's University)
2. Total Enrollment by Gender and 15 Liberian Counties of origin
3. STEM Enrollment Share and Graduation Projection Indices
4. Teacher-Scholar Ratios and Certified Laboratories
5. One-Click Verified CSV / JSON Export Schema specifications`,
    keyHighlights: [
      'Validated during the National Education Consultation on 28-29 September 2026',
      'Directly links to the ERP\'s Integrated Analytics Hub MoE EMIS Export feature',
      'Ensures institution eligibility for national higher education research grants',
    ],
    isPinned: false,
    tags: ['EMIS', 'Ministry of Education', 'reporting', 'data standard', 'education sector plan'],
  },

  // ==========================================
  // 3. INSTITUTIONAL HANDBOOKS & CHARTERS
  // ==========================================
  {
    id: 'res-handbook-student-official',
    title: 'Gwoah\'s University Undergraduate Student Handbook (2026/2027 Official Edition)',
    category: 'institutional_handbook',
    subcategory: 'Institutional Student Handbook',
    authorOrAuthority: 'Office of the Dean of Students & University Senate',
    publishedDate: '2026-09-01',
    academicYear: '2026/2027',
    version: '2026/2027 Official Senate Edition',
    fileFormat: 'PDF',
    fileSizeKB: 750,
    statutoryReference: 'GU Senate Resolution SR-2026-004',
    description: 'The definitive guide for all undergraduate scholars covering academic integrity, honor code, exam hall regulations, grade appeals, student governance, campus housing, and convocation requirements.',
    contentSummary: `GWOAH'S UNIVERSITY UNDERGRADUATE STUDENT HANDBOOK
ACADEMIC YEAR 2026/2027

TABLE OF CONTENTS:
Chapter 1: History, Mission, and Core Values of Gwoah's University.
Chapter 2: Academic Regulations (Add/Drop deadlines, withdrawal, prerequisite sequences, degree audit verification).
Chapter 3: The Student Honor Code & Academic Integrity (Definitions of plagiarism, unauthorized collaboration, disciplinary sanctions).
Chapter 4: Grading System, Transcripts, and Degree Conferral (Official 4.0 scale, Dean's List, Cum Laude, Magna Cum Laude, Summa Cum Laude).
Chapter 5: Student Rights, Welfare & Support Services (Health Clinic, Mental Health Counseling, DEI Accommodations).
Chapter 6: Campus Facilities, ICT Commons & Low-Bandwidth Learning Mirrors.
Chapter 7: Student Organizations, Senate Representation & Extracurricular Activities.

SENATE MANDATE ON ACADEMIC HONESTY:
"Scholars of Gwoah's University commit to upholding uncompromised truth in research and scholarship. Plagiarism or fraudulent exam conduct shall result in disciplinary referral, grade forfeiture, or suspension."`,
    keyHighlights: [
      'Essential reference guide distributed to every matriculating scholar',
      'Outlines step-by-step grade dispute procedure through Departmental Review Panels',
      'Details convocation requirements (minimum 126 credits, 2.00 CGPA, clearance of bursar accounts)',
    ],
    isPinned: true,
    tags: ['handbook', 'regulations', 'honor code', 'student life', 'convocation', 'senate'],
  },
  {
    id: 'res-handbook-student-rights-dei',
    title: 'Campus Code of Conduct, Student Rights & Anti-Harassment Charter',
    category: 'institutional_handbook',
    subcategory: 'Rights & Conduct Charter',
    authorOrAuthority: 'Office of Student Welfare & Legal Affairs Directorate',
    publishedDate: '2026-09-10',
    academicYear: '2026/2027',
    version: 'Charter Rev 2026',
    fileFormat: 'PDF',
    fileSizeKB: 390,
    statutoryReference: 'GU Disciplinary Bylaws & Liberia MoE DEI Policy 2024',
    description: 'University policies guaranteeing student safety, freedom of inquiry, zero tolerance for harassment or hazing, confidential reporting channels, and disciplinary tribunal proceedings.',
    contentSummary: `STUDENT RIGHTS CHARTER:
Every student at Gwoah's University possesses fundamental rights to a safe, respectful, and academically supportive campus environment.

KEY ARTICLES:
- Freedom from Harassment: Strict prohibition of quid pro quo sexual harassment, cyber-bullying, or physical intimidation.
- Confidential Reporting Hotline: 24/7 reporting via portal or campus welfare officer with whistleblower protection.
- Due Process: Any scholar summoned before the University Disciplinary Committee is entitled to written notice of charges, representation, and right of appeal to the President.
- Accessible Campus Guarantee: Priority scheduling and accommodations for students with documented mobility or sensory impairments.`,
    keyHighlights: [
      'Zero-tolerance policy for academic coercion and sexual harassment',
      'Confidential reporting and protective measures for student complainants',
      'Defines the student disciplinary appellate procedure',
    ],
    isPinned: false,
    tags: ['rights', 'code of conduct', 'harassment prevention', 'welfare', 'safety'],
  },
  {
    id: 'res-handbook-bursar-fees',
    title: 'Bursar Fee Schedule, Refund Policies & Digital Payment Guide',
    category: 'institutional_handbook',
    subcategory: 'Financial & Bursar Guide',
    authorOrAuthority: 'Office of the University Bursar & Financial Aid Directorate',
    publishedDate: '2026-09-15',
    academicYear: '2026/2027',
    version: 'Bursar Guide 2026/27',
    fileFormat: 'PDF',
    fileSizeKB: 310,
    statutoryReference: 'GU Board of Trustees Financial Resolution 2026',
    description: 'Comprehensive schedule of undergraduate tuition rates per credit, laboratory fees, Add/Drop refund schedules (100% week 1-2, 50% week 3-4), and mobile money deposit procedures.',
    contentSummary: `BURSAR FINANCIAL REGULATIONS:
1. TUITION & REGISTRATION FEES:
- Undergraduate Credit Rate: $45.00 USD per credit hour.
- Semester Registration Fee: $50.00 USD.
- Laboratory & Science Fee (STEM majors): $45.00 USD per semester.
- ICT & Digital Commons Connectivity Fee: $25.00 USD.

2. OFFICIAL PAYMENT METHODS:
- Lonestar MTN Mobile Money: Merchant Code 883921 (Instant portal ledger clearance)
- Orange Money: Merchant Code 774102
- Bank Deposit Slip: EcoBank Liberia & United Bank for Africa (UBA)

3. ADD/DROP REFUND SCHEDULE:
- Week 1 - 2: 100% refund of dropped course tuition.
- Week 3 - 4: 50% partial credit toward subsequent semester tuition.
- After Week 4: 0% refund (Course recorded as Withdrawn 'W').`,
    keyHighlights: [
      'Details official mobile money payment numbers to prevent cashier fraud',
      'Outlines financial clearance requirements for midterm and final examination admission',
      'Explains Ministry of Education STEM subsidy application steps',
    ],
    isPinned: false,
    tags: ['bursar', 'tuition', 'fees', 'refund policy', 'mobile money', 'financial aid'],
  },
  {
    id: 'res-handbook-advising-manual',
    title: 'Academic Advising & Course Add/Drop Procedural Manual',
    category: 'institutional_handbook',
    subcategory: 'Academic Advising Manual',
    authorOrAuthority: 'Office of the Registrar & Academic Advising Council',
    publishedDate: '2026-09-20',
    academicYear: '2026/2027',
    version: 'Advising Manual v3.2',
    fileFormat: 'PDF',
    fileSizeKB: 360,
    statutoryReference: 'Senate Academic Regulations Sec. 12',
    description: 'Operational manual detailing course prerequisite chains, academic advisor sign-off workflows, full-time credit boundaries (12 to 21 credits), and withdrawal protocols.',
    contentSummary: `ACADEMIC ADVISING WORKFLOW:
1. Mandatory Advising Conference: Every scholar meets with their assigned departmental faculty advisor prior to semester registration.
2. Degree Audit Review: Advisor and scholar verify completed credits against NCHE 120-132 requirement.
3. Prerequisite Enforcement: Automated system checks prevent registration into advanced courses without completing required foundational courses with a grade of C or better.
4. Add/Drop Window: Commences the first day of class and concludes at the end of Week 2. Any drop requiring reduction below 12 credits must receive Dean's clearance.`,
    keyHighlights: [
      'Step-by-step guide on how to register and drop courses via the student portal',
      'Explains prerequisite waiver procedure and academic advisor approval stages',
      'Includes 4-year recommended curriculum plans for all five colleges',
    ],
    isPinned: false,
    tags: ['academic advising', 'add/drop', 'prerequisites', 'registrar', 'curriculum'],
  },
  {
    id: 'res-handbook-library-guide',
    title: 'University Digital Commons & Campus Library Guide',
    category: 'institutional_handbook',
    subcategory: 'Library & Learning Commons Guide',
    authorOrAuthority: 'University Librarian & ICT Directorate',
    publishedDate: '2026-09-05',
    academicYear: '2026/2027',
    version: '2026 Edition',
    fileFormat: 'PDF',
    fileSizeKB: 280,
    statutoryReference: 'NCHE Institutional Resource Standards',
    description: 'User guide for accessing physical and digital library collections at Monrovia and Fendall campuses, low-bandwidth offline digital caches, e-journal access, and quiet study room reservations.',
    contentSummary: `LIBRARY & DIGITAL COMMONS SERVICES:
1. Physical Libraries:
- Monrovia Main Campus: 8:00 AM - 9:00 PM (Monday - Saturday)
- Fendall Science & Technology Center: 8:00 AM - 8:00 PM
2. Digital Repositories:
- Local Campus Mirror: Offline intranet cache containing 50,000+ open-access textbooks, IEEE articles, and digitized lecture notes accessible even during national internet disruptions.
- Inter-Library Loan: Agreements with regional universities across West Africa (WAUA consortium).
3. Laptop Loan Program: 48-hour emergency laptop lending for registered low-income scholars.`,
    keyHighlights: [
      'Covers both Monrovia and Fendall campus library facilities',
      'Explains how to connect to the local low-bandwidth offline digital cache on campus Wi-Fi',
      'Instructions for borrowing physical reserve texts and group study rooms',
    ],
    isPinned: false,
    tags: ['library', 'digital commons', 'offline repository', 'textbooks', 'Fendall', 'Monrovia'],
  },
];
