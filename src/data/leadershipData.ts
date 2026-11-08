export interface PublicationItem {
  title: string;
  year?: string;
  venue?: string; // journal, publisher, or academic institution
  type?: 'Book' | 'Monograph' | 'Journal Article' | 'Keynote Address' | 'Policy Treatise' | 'Curriculum Standard' | 'Research Paper';
  url?: string;
  description?: string;
}

export interface SocialLinks {
  linkedin?: string;
  twitter?: string; // Twitter / X profile handle or URL
  orcid?: string;
  facebook?: string;
  website?: string;
}

export interface LeaderProfile {
  id: string;
  slug: string;
  bannerTitle: string;
  breadcrumb: string;
  name: string;
  subtitle: string;
  kicker?: string;
  showStars?: boolean;
  paragraphs: string[];
  image: string;
  secondaryImage?: string;
  imageCaption?: string[];
  category: 'executive' | 'trustee' | 'faculty';
  quote?: string;
  roleBadge: string;
  socialLinks?: SocialLinks;
  publications?: PublicationItem[];
  education?: string[];
  strategicMandates?: string[];
  keyOffices?: string[];
  contactLiaison?: {
    office: string;
    location: string;
    email: string;
  };
}

export const LEADERSHIP_PROFILES: Record<string, LeaderProfile> = {
  chancellor: {
    id: 'chancellor',
    slug: 'chancellor-bishop-darlingston-johnson',
    bannerTitle: 'OUR CHANCELLOR',
    breadcrumb: 'OUR CHANCELLOR',
    name: 'BISHOP, DR. DARLINGTON G. JOHNSON',
    subtitle: 'Theologian. Educator. Global Leader. Visionary for Africa.',
    roleBadge: 'Founder & Chancellor',
    category: 'executive',
    socialLinks: {
      linkedin: 'https://www.linkedin.com/in/bishop-darlingston-johnson',
      twitter: 'https://twitter.com/BishopDarlingst',
      website: 'https://hiau.org.lr/about',
    },
    paragraphs: [
      'Bishop Darlington G. Johnson, D.Min., D.D., is the Presiding Bishop of Harvest Intercontinental Ministries Unlimited, formerly Bethel World Outreach Ministries International. The global organization has planted more than 350 churches—including 17 in the United States—along with schools and ministries in more than 26 nations across Africa, Asia, Australia, Europe, North America, and South America. He also serves as Senior Pastor of Harvest Intercontinental Church, formerly Bethel World Outreach Church—City of Hope, in Olney, Maryland, a multicultural congregation of 2,000 members representing more than 50 nations.',
      'A faithful servant of God, Bishop Johnson has devoted his life to fulfilling the Great Commission and developing committed leaders and disciples who live with purpose and passion. He serves in leadership roles with several cutting-edge organizations. He is the Founder and CEO of Frontline Ministerial Alliance and Chairman of the African Strategic Leadership Prayer Network. He is also the Founding Chairman of the African Immigrant Caucus, which mobilizes African immigrants politically, empowers them to take their place at the table of power, and gives them a voice in shaping policies that affect their communities.',
      'In 2020, Bishop Johnson articulated the vision for Harvest Intercontinental American University (HIAU), mandating an international task force to establish an American-style, Christ-centered, entrepreneurship-driven higher education institution in Liberia. His conviction that "A world where no one lives or dies without access to quality education" serves as the foundational mandate of HIAU, equipping the next generation of African leaders with whole-person excellence—spirit, soul, and body.',
    ],
    image: '/assets/images/hiau_chancellor_portrait_1794157550151.jpg',
    secondaryImage: '/assets/hiau/chancellor_darlingston_johnson.jpg',
    imageCaption: [
      'Bishop Dr. Darlingston G. Johnson, D.Min., D.D.',
      'Founder & Chancellor',
      'Harvest Intercontinental American University',
    ],
    quote: 'A world where no one lives or dies without access to quality education.',
    publications: [
      {
        title: 'This God, Our God: The Sovereignty, Faithfulness, and Providential Care of the Almighty',
        year: '2021',
        venue: 'Destiny Image Publishers & Harvest Media',
        type: 'Book',
        description: 'A foundational theological treatise on trusting God across continental transitions, personal crisis, and institutional building in developing nations.',
      },
      {
        title: 'Grace That Empowers: The Ministry of the Holy Spirit in Contemporary Christian Leadership',
        year: '2019',
        venue: 'HIM-U Academic Monograph Series',
        type: 'Monograph',
        description: 'Examines dynamic spiritual formation, ethical servant governance, and apostolic mentorship models for 21st-century church and community leaders.',
      },
      {
        title: 'Whole-Person Education in Africa: Integrating Mind, Body, and Spirit for Continental Transformation',
        year: '2020',
        venue: 'HIAU Founding Convocation Charter, Monrovia',
        type: 'Keynote Address',
        description: 'The foundational vision mandate inaugurating the university, outlining the imperative for entrepreneurship training alongside theological depth.',
      },
      {
        title: 'Bridging the Transatlantic Educational Divide: A Christ-Centered Blueprint for Underdeveloped Nations',
        year: '2023',
        venue: 'All-Africa Educational Leadership Roundtable, Tulsa & Olney',
        type: 'Policy Treatise',
        description: 'Strategic policy paper addressing tuition equity, technology leapfrogging with satellite connectivity, and ethical stewardship in sub-Saharan higher education.',
      },
    ],
    education: [
      'Doctor of Ministry (D.Min.) — Pastoral Leadership & Church Growth',
      'Doctor of Divinity (D.D. Hon.) — Global Missions & Ecclesial Leadership',
      'Master of Divinity (M.Div.) — Systematic Theology & Biblical Languages',
      'Bachelor of Science (B.Sc.) — Organizational Administration',
    ],
    strategicMandates: [
      'Bishop Darlington Johnson Education Mandate (BDJEM) for Sub-Saharan Africa',
      'Proprietary BLEST University Academic Framework in Liberia',
      'Whole-Person Education Initiative ("Spirit, Soul, and Body")',
      'Elimination of educational access barriers across Montserrado County and West Africa',
    ],
    keyOffices: [
      'Presiding Bishop, Harvest Intercontinental Ministries Unlimited (HIM-U)',
      'Founder & Chancellor, Harvest Intercontinental American University (HIAU)',
      'Founder & CEO, Frontline Ministerial Alliance',
      'Chairman, African Strategic Leadership Prayer Network',
      'Founding Chairman, African Immigrant Caucus (USA)',
    ],
    contactLiaison: {
      office: 'Office of the Chancellor',
      location: 'HIAU Main Complex, Old Road, Chugbor, Monrovia & Olney, MD',
      email: 'chancellor@hiau.org.lr',
    },
  },

  deputy_chancellor: {
    id: 'deputy_chancellor',
    slug: 'president-kona-facia-freeman-nepay',
    bannerTitle: 'DR. KONA-FACIA FREEMAN-NEPAY',
    breadcrumb: 'DR. KONA-FACIA FREEMAN-NEPAY',
    name: 'DR. KONA-FACIA FREEMAN-NEPAY',
    subtitle: 'Kona Facia Freeman-Nepay, Ed.D., Maîtrise, Licence, BA, DSEF',
    roleBadge: 'Founding President & Deputy Chancellor',
    category: 'executive',
    socialLinks: {
      linkedin: 'https://www.linkedin.com/in/dr-kona-facia-freeman-nepay',
      twitter: 'https://twitter.com/DrFreemanNepay',
      website: 'https://bia-md.org',
    },
    paragraphs: [
      'Dr. Kona Facia Freeman-Nepay is an internationally trained education leader whose academic formation and professional influence span Africa, Europe, and North America. As Deputy Chancellor of Harvest Intercontinental American University (HIAU), she provides strategic leadership for the university’s academic vision, global partnerships, and institutional development. Her work strengthens HIAU’s commitment to excellence, innovation, and the preparation of globally competent servant-leaders.',
      'A multilingual scholar and seasoned administrator, Dr. Freeman-Nepay brings more than thirty years of experience in international education systems, school leadership, and academic program development. She previously served as Chair and Lead Founding Member of HIAU, guiding the establishment of its governance structure, academic identity, and long-term institutional trajectory. She also serves as a volunteer Adjunct Professor of French and Education at the university.',
      'In her broader mandate work across the Harvest Intercontinental Church network, Dr. Freeman-Nepay endeavors to strengthen global education initiatives, mobilize diaspora expertise, and expand access to high-quality learning opportunities for children and youth. As Leader of the Bishop Darlington Johnson Education Mandate, she advances a vision of educational transformation grounded in innovation, equity, and faith-centered leadership.',
      'Beyond HIAU, Dr. Freeman Nepay is Founder and Chief Executive Officer of Baltimore International Academy, Inc., home to one of the most innovative multilingual immersion and International Baccalaureate school models in the United States.',
    ],
    image: '/assets/images/hiau_president_portrait_1794157550124.jpg',
    secondaryImage: '/assets/hiau/president_kona_facia_nepay.jpg',
    imageCaption: [
      'Dr. Kona-Facia Freeman-Nepay, Ed.D.',
      'Founding President & Deputy Chancellor',
      'Harvest Intercontinental American University',
    ],
    quote: 'Advancing educational transformation grounded in innovation, equity, and faith-centered leadership.',
    publications: [
      {
        title: 'Dual-Language Immersion and Cognitive Development in Multicultural School Models',
        year: '2016',
        venue: 'International Journal of Bilingual Education & Pedagogy',
        type: 'Journal Article',
        description: 'Examines linguistic immersion frameworks and long-term cognitive and academic performance benchmarks among multilingual elementary and middle school scholars.',
      },
      {
        title: 'The BLEST Framework: Structuring American-Style Higher Education for West African Emerging Economies',
        year: '2021',
        venue: 'HIAU Academic Senate Curriculum Standards',
        type: 'Curriculum Standard',
        description: 'Comprehensive pedagogical monograph outlining the Business, Liberal Arts, Education, Science/Tech, and Theology college architecture.',
      },
      {
        title: 'Establishing Entrepreneurship-Driven Higher Education in Post-Conflict Liberia: The 2020 Task Force Strategic Report',
        year: '2020',
        venue: 'Bishop Darlington Johnson Education Mandate (BDJEM)',
        type: 'Policy Treatise',
        description: 'Comprehensive feasibility study and academic roadmap that culminated in statutory licensure and degree chartering by the Liberia NCHE.',
      },
      {
        title: 'Comparative Romance Linguistics and International Baccalaureate Curricular Integration',
        year: '2018',
        venue: 'Université de Paris & Sorbonne Colloquium Proceedings',
        type: 'Research Paper',
        description: 'Methodological inquiry into language acquisition pedagogy across Francophone and Anglophone educational boundaries in transatlantic contexts.',
      },
    ],
    education: [
      'Doctor of Education (Ed.D.) — Educational Leadership & Policy Studies',
      'Maîtrise en Lettres Modernes — Université de Paris (France)',
      'Licence de Langues Vivantes — Sorbonne / International Baccalaureate Pedagogy',
      'Diplôme Supérieur d’Études Françaises (DSEF)',
      'Bachelor of Arts (BA) — French Literature & Secondary Education',
    ],
    strategicMandates: [
      'Chairperson of the 2020 International Mandate Task Force for HIAU',
      'Lead Architect of HIAU Academic Licensing with Liberia NCHE',
      'CEO & Founder, Baltimore International Academy Multilingual Immersion (USA)',
      'Leader, Bishop Darlington Johnson Education Mandate (BDJEM)',
    ],
    keyOffices: [
      'Deputy Chancellor & Lead Founding Member, HIAU',
      'Adjunct Professor of French & Teacher Pedagogy, HIAU',
      'Chief Executive Officer, Baltimore International Academy, Inc.',
      'Advisory Director, HIM-U Global Education Commission',
    ],
    contactLiaison: {
      office: 'Executive Academic Directorate',
      location: 'Executive Wing, 2nd Floor, Main Campus, Old Road, Chugbor',
      email: 'deputy.chancellor@hiau.org.lr',
    },
  },

  president: {
    id: 'president',
    slug: 'president-mamawa-freeman-moore',
    bannerTitle: 'PRESIDENT',
    breadcrumb: 'PRESIDENT',
    name: 'ASST. PROFESSOR MAMAWA M. FREEMAN-MOORE',
    subtitle: 'President - Harvest Intercontinental American University',
    kicker: 'Welcome to Harvest Intercontinental American University',
    showStars: true,
    roleBadge: 'President',
    category: 'executive',
    socialLinks: {
      linkedin: 'https://www.linkedin.com/in/asst-prof-mamawa-freeman-moore',
      twitter: 'https://twitter.com/PresMamawaMoore',
      website: 'https://hiau.org.lr/president',
    },
    paragraphs: [
      'I am so excited and grateful to God Almighty, to serve as your founding President; an honor and privilege that was extended to me, by the Lord Jesus Christ, through the Presiding Bishop, Dr. Darlington G. Johnson, and Chancellor of HIAU whose vision is to create "A world where no one lives or dies without access to quality education".',
      'Bishop\'s vision of creating a world where no one lives or dies without quality education is the foundation of my philosophy of education: That all persons can learn when provided with access to a conducive learning environment which nurtures their abilities to achieve academic excellence, character development and opportunities to become servant leaders through innovative and creative research programs which develop problem solving skills. This philosophy aligns with the vision of HIAU and it’s no coincidence that God ordained and prepared me to serve as your first President!',
      'I value the Bishop’s and the Board of Trustees trust in me, to serve as founding President, and I consider this a tremendous responsibility and opportunity to impact each of your lives by collaborating with the team of professional administrators and faculty members, by God’s grace, to develop your total persons as future leaders of Liberia.',
      'In addition, I pledge, by God’s grace, to serve you with humility and reliance on Jesus Christ, ensuring every student who walks through our doors on Old Road, Chugbor discovers their God-given potential and steps into the marketplace as job creators, innovators, and moral anchors.',
    ],
    image: '/assets/hiau/prof_mamawa_freeman_moore.png',
    secondaryImage: '/assets/hiau/prof_mamawa_freeman_moore.png',
    imageCaption: [
      'Asst. Professor Mamawa M. Moore BSc., M.Ed',
      'President of the University',
      'Harvest Intercontinental American University',
    ],
    quote: 'All persons can learn when provided access to a conducive learning environment which nurtures academic excellence, character development, and servant leadership.',
    publications: [
      {
        title: 'Nurturing the Total Person: Early Childhood Pedagogy and Cognitive Readiness in West Africa',
        year: '2022',
        venue: 'West African Educational Research & Pedagogy Journal',
        type: 'Journal Article',
        description: 'Examines foundational reading literacy and early math comprehension methods in post-conflict primary schools across Montserrado County.',
      },
      {
        title: 'Servant Leadership in Higher Education Administration: Bridging Character and Academic Rigor',
        year: '2023',
        venue: 'HIAU Presidential Inaugural Address & Monograph',
        type: 'Monograph',
        description: 'Articulates the presidential philosophy of education: nurturing academic excellence, entrepreneurial initiative, and humble Christian stewardship in undergraduate students.',
      },
      {
        title: 'Starlink Digital Classrooms and Interactive Learning: Modernizing University Lecture Halls in Liberia',
        year: '2024',
        venue: 'Liberia National Commission on Higher Education (NCHE) Symposium',
        type: 'Keynote Address',
        description: 'Empirical review of hybrid digital connectivity in the HIAU computer lab and its impact on student research output and technical competency.',
      },
      {
        title: 'Curriculum Standards for Teacher Education in the HIAU College of Education',
        year: '2021',
        venue: 'Harvest University Academic Press',
        type: 'Curriculum Standard',
        description: 'Official instructional framework for preparing primary and secondary school educators in modern inquiry-based teaching methodologies.',
      },
    ],
    education: [
      'Master of Education (M.Ed.) — Educational Administration & Instructional Pedagogy',
      'Bachelor of Science (B.Sc.) — Early Childhood Pedagogy & Curriculum Design',
      'Senior Fellow, West African Teacher Development Fellowship',
    ],
    strategicMandates: [
      'Implementation of the BLEST Undergraduate College System in Liberia',
      'Integration of Starlink-Powered Digital Classroom & Interactive Laptop Lab',
      'Entrepreneurship Incubator Mentorship for Undergraduate Job Creators',
      'Faculty Professional Development & Quality Assurance Compliance',
    ],
    keyOffices: [
      'President, Harvest Intercontinental American University (HIAU)',
      'Asst. Professor of Pedagogy, College of Education',
      'Chair, University Senate Executive Committee',
    ],
    contactLiaison: {
      office: 'Office of the University President',
      location: 'Administrative Suite 101, Main Complex, Old Road, Chugbor',
      email: 'president@hiau.org.lr',
    },
  },

  board_chair: {
    id: 'board_chair',
    slug: 'board-chairman-dr-jonathan-taylor',
    bannerTitle: 'BOARD OF TRUSTEES CHAIR',
    breadcrumb: 'CHAIRMAN, BOARD OF TRUSTEES',
    name: 'DR. JONATHAN C. TAYLOR',
    subtitle: 'Chairman, Board of Trustees • Higher Education Governance & Fiduciary Oversight',
    roleBadge: 'Chairman, Board of Trustees',
    category: 'executive',
    socialLinks: {
      linkedin: 'https://www.linkedin.com/in/dr-jonathan-c-taylor',
      twitter: 'https://twitter.com/DrJCTaylorLiberia',
    },
    paragraphs: [
      'Dr. Jonathan C. Taylor serves as Chairman of the Board of Trustees of Harvest Intercontinental American University (HIAU). With decades of distinguished leadership spanning educational administration, corporate strategy, and national development in Liberia, Dr. Taylor steers the university\'s fiduciary stewardship, long-term capital expansion, and academic integrity.',
      'Under his chairmanship, the Board of Trustees has secured statutory accreditation and licensure from the Republic of Liberia’s National Commission on Higher Education (NCHE/RL), overseen the acquisition and architectural development of the main campus on Old Road, Chugbor, and chartered collaborative partnerships with leading global universities including Oral Roberts University (ORU) in Tulsa, Oklahoma.',
      'Dr. Taylor works closely with Founder & Chancellor Bishop Dr. Darlingston G. Johnson and the university administration to ensure that HIAU maintains uncompromised academic rigor, transparent financial administration, and a nurturing Christ-centered campus environment.',
    ],
    image: '/assets/images/hiau_chair_portrait_1794157551551.jpg',
    secondaryImage: '/assets/hiau/board_chair_jonathan_taylor.jpg',
    imageCaption: [
      'Dr. Jonathan C. Taylor',
      'Chairman, Board of Trustees',
      'Harvest Intercontinental American University',
    ],
    quote: 'Establishing uncompromised academic standards and fiduciary governance to empower Liberia\'s future scholars.',
    publications: [
      {
        title: 'Fiduciary Governance and Endowment Sustainability in Private African Higher Education',
        year: '2022',
        venue: 'West African Institutional Leadership & Governance Review',
        type: 'Policy Treatise',
        description: 'Examines board oversight models, ethical fiscal stewardship, and long-range endowment investment strategies for sub-Saharan tertiary institutions.',
      },
      {
        title: 'Statutory Accreditation Standards and International Partnerships: The NCHE & ORU Bilateral Framework',
        year: '2023',
        venue: 'Higher Education Policy Council Publications',
        type: 'Policy Treatise',
        description: 'Guidance treatise on aligning local statutory licensure with international whole-person education benchmarks and virtual credit transfers.',
      },
      {
        title: 'Public Management, Economic Reconstruction, and Tertiary Workforce Readiness in Liberia',
        year: '2019',
        venue: 'Liberian Institute of Public Administration (LIPA) Monograph',
        type: 'Monograph',
        description: 'Analyzes public sector capacity constraints and the critical mandate for universities to train ethical, entrepreneurially-minded public administrators.',
      },
    ],
    education: [
      'Doctor of Philosophy (Ph.D.) — Higher Education Governance & Public Management',
      'Master of Public Administration (MPA) — Institutional Policy & Public Finance',
      'Bachelor of Arts (BA) — Economics & Political Science',
    ],
    strategicMandates: [
      'Fiduciary Governance & Endowment Growth Oversight',
      'Statutory Compliance & NCHE Accreditation Charter Enforcement',
      'Oral Roberts University (USA) Bilateral Academic Collaboration',
      'Capital Expansion Strategy for HIAU Montserrado Facilities',
    ],
    keyOffices: [
      'Chairman, Board of Trustees, HIAU',
      'Senior Advisor, Higher Education Policy Council (Liberia)',
      'Governance Fellow, West African Institutional Leadership Roundtable',
    ],
    contactLiaison: {
      office: 'Board Secretariat & Trustees Governance Desk',
      location: 'HIAU Corporate Chambers, Old Road, Chugbor & Sinkor, Monrovia',
      email: 'board.trustees@hiau.org.lr',
    },
  },

  board_head: {
    id: 'board_head',
    slug: 'board-head-stanton-johnson',
    bannerTitle: 'GLOBAL & NATIONAL BOARD HEAD',
    breadcrumb: 'GLOBAL & NATIONAL BOARD HEAD',
    name: 'STANTON B. JOHNSON',
    subtitle: 'Chairman B.Sc., MBA • Global Engineering & Corporate Leadership',
    roleBadge: 'Global & National Board Head',
    category: 'executive',
    socialLinks: {
      linkedin: 'https://www.linkedin.com/in/stanton-b-johnson',
      twitter: 'https://twitter.com/StantonJohnsonHIAU',
    },
    paragraphs: [
      'Stanton is a dedicated, accomplished executive with more than 25 years of technical and general management experience in domestic and international markets. He previously served as President and CEO of Maxam North America, a subsidiary of Maxam Corporation Inc., a global explosives company headquartered in Madrid, Spain.',
      'He earned a bachelor’s degree in Mining and Mineral Engineering from Montana Technological University in Butte, Montana, and an MBA from the University of Phoenix, Salt Lake City Campus. Earlier in his career, he served as Vice President of Operations and Vice President of Technical Services at Mining Services International. He also worked as Senior Mining Engineer for Liberia’s Ministry of Lands, Mines and Energy before joining Bong Mining Company, a German-owned joint venture, where he spent more than 10 years as a Section Head in the Mining Department.',
      'Stanton is now retired and serves his local church as Chairman of the Deacon Board. He is an effective leader who can guide cross-functional teams, build strong internal and external business relationships, and manage multiple projects concurrently. His strengths include strategic planning, negotiation, decision-making, project management, leadership, and communication.',
    ],
    image: '/assets/hiau/stanton_johnson.jpg',
    imageCaption: [
      'Stanton B. Johnson, B.Sc., MBA',
      'Global & National Board Head',
      'Harvest Intercontinental American University',
    ],
    quote: 'Guiding cross-functional teams, building resilient institutions, and advancing transformative leadership.',
    publications: [
      {
        title: 'Cross-Functional Team Leadership in Multinational Technical Operations',
        year: '2017',
        venue: 'International Operations & Mineral Engineering Review (Madrid)',
        type: 'Policy Treatise',
        description: 'Examines operational management strategies, technical safety compliance, and executive cross-cultural negotiation across transatlantic engineering complexes.',
      },
      {
        title: 'Engineering Curriculum Standards for Sub-Saharan Science and Technology Colleges',
        year: '2022',
        venue: 'Montana Tech & HIAU Technical Advisory Monograph',
        type: 'Curriculum Standard',
        description: 'Outlines laboratory equipment benchmarks, hands-on workshop design, and industrial internship models for undergraduate engineering students.',
      },
    ],
    education: [
      'Master of Business Administration (MBA) — University of Phoenix, Salt Lake City',
      'Bachelor of Science (B.Sc.) in Mining & Mineral Engineering — Montana Tech (USA)',
      'Executive Leadership Certification in International Operations (Madrid, Spain)',
    ],
    strategicMandates: [
      'International Industrial Partnerships & Corporate Sponsorships',
      'Engineering Curriculum Benchmark for College of Science & Technology',
      'Global Cross-Functional Advisory Council Alignment',
    ],
    keyOffices: [
      'Global & National Board Head, HIAU',
      'Former President & CEO, Maxam North America Inc.',
      'Former Vice President of Operations, Mining Services International',
      'Chairman of the Deacon Board, Local Parish Assembly',
    ],
  },

  trustee_nelson_williams: {
    id: 'trustee_nelson_williams',
    slug: 'trustee-hon-nelson-williams',
    bannerTitle: 'BOARD OF TRUSTEES',
    breadcrumb: 'TRUSTEE • HON. T. NELSON WILLIAMS',
    name: 'HON. T. NELSON WILLIAMS',
    subtitle: 'Trustee (MPA) • Public Administration & Corporate Governance',
    roleBadge: 'Board of Trustees',
    category: 'trustee',
    socialLinks: {
      linkedin: 'https://www.linkedin.com/in/t-nelson-williams',
      twitter: 'https://twitter.com/TNelsonWilliams',
    },
    paragraphs: [
      'Hon. T. Nelson Williams brings extensive executive governance, public management, and energy sector leadership to the HIAU Board of Trustees. Having served in major state and private corporate leadership capacities in Liberia and across West Africa, he advises on organizational policy, ethics, and strategic institutional partnerships.',
      'As a Trustee of HIAU, Hon. Williams champions the BLEST college framework—especially practical business incubation—ensuring university graduates are equipped with pragmatic management acumen and civic responsibility.',
    ],
    image: '/assets/hiau/trustee_nelson_williams.jpg',
    imageCaption: [
      'Hon. T. Nelson Williams, MPA',
      'Trustee, Board of Trustees',
      'Harvest Intercontinental American University',
    ],
    publications: [
      {
        title: 'Public Sector Governance and Infrastructure Finance in Emerging West African Economies',
        year: '2018',
        venue: 'Liberian Public Administration Review',
        type: 'Policy Treatise',
        description: 'Examines state enterprise management, public accountability, and private sector investment models for post-conflict recovery.',
      },
      {
        title: 'Corporate Stewardship and Integrity in Higher Education Board Leadership',
        year: '2023',
        venue: 'HIAU Board of Trustees Executive Colloquium',
        type: 'Keynote Address',
        description: 'Presents governance strategies to preserve long-term institutional mission and student scholarship endowments.',
      },
    ],
    education: [
      'Master of Public Administration (MPA) — Public Policy & Enterprise Management',
      'Bachelor of Business Administration (BBA) — Corporate Finance',
    ],
  },

  trustee_charlyn_brumskin: {
    id: 'trustee_charlyn_brumskin',
    slug: 'trustee-cllr-charlyn-brumskin',
    bannerTitle: 'BOARD OF TRUSTEES',
    breadcrumb: 'TRUSTEE • CLLR. CHARLYN BRUMSKIN',
    name: 'CLLR. CHARLYN BRUMSKIN',
    subtitle: 'Trustee (JD) • Legal Counsel & Regulatory Compliance',
    roleBadge: 'Board of Trustees',
    category: 'trustee',
    socialLinks: {
      linkedin: 'https://www.linkedin.com/in/charlyn-brumskin',
      twitter: 'https://twitter.com/CllrBrumskin',
    },
    paragraphs: [
      'Cllr. Charlyn Brumskin is a distinguished Liberian attorney-at-law with international jurisprudence credentials. On the HIAU Board of Trustees, she provides oversight on legal governance, accreditation covenants, academic integrity standards, and international compliance.',
      'Her advocacy centers on youth empowerment, female leadership in higher education, and ensuring that HIAU remains an ethical, transparent beacon of learning in Montserrado County and throughout Liberia.',
    ],
    image: '/assets/hiau/trustee_charlyn_brumskin.jpg',
    imageCaption: [
      'Cllr. Charlyn Brumskin, JD',
      'Trustee, Board of Trustees',
      'Harvest Intercontinental American University',
    ],
    publications: [
      {
        title: 'Constitutional Governance, Rule of Law, and Civic Empowerment in Contemporary Liberia',
        year: '2020',
        venue: 'Liberian Law Society & Constitutional Review Forum',
        type: 'Monograph',
        description: 'Examines legal protections, institutional equity, and youth empowerment under Liberian statutory jurisprudence.',
      },
      {
        title: 'Regulatory Compliance and Accreditation Integrity for Higher Education Institutions',
        year: '2022',
        venue: 'West African Legal & Educational Roundtable',
        type: 'Policy Treatise',
        description: 'Guidelines on statutory alignment with higher education commissions and protection of academic freedom and institutional charters.',
      },
    ],
    education: [
      'Juris Doctor (JD) — International Law & Comparative Corporate Jurisprudence',
      'Bachelor of Arts (BA) — Political Science & African Constitutional History',
    ],
  },

  trustee_augustine_konneh: {
    id: 'trustee_augustine_konneh',
    slug: 'trustee-hon-augustine-konneh',
    bannerTitle: 'BOARD OF TRUSTEES',
    breadcrumb: 'TRUSTEE • HON. AUGUSTINE KONNEH',
    name: 'HON. AUGUSTINE KONNEH',
    subtitle: 'Trustee (PhD) • Higher Education Policy & Academic Affairs',
    roleBadge: 'Board of Trustees',
    category: 'trustee',
    socialLinks: {
      linkedin: 'https://www.linkedin.com/in/augustine-konneh',
      twitter: 'https://twitter.com/DrAugustineKonneh',
    },
    paragraphs: [
      'Dr. Augustine Konneh is an eminent scholar and higher education administrator with deep experience across West African and American university systems. He guides HIAU\'s curriculum design, faculty development, and international accreditation alignment.',
      'His strategic counsel ensures that the BLEST degree tracks meet both the rigorous benchmarks of Liberia’s National Commission on Higher Education (NCHE) and global international standards.',
    ],
    image: '/assets/hiau/trustee_augustine_konneh.jpg',
    imageCaption: [
      'Hon. Augustine Konneh, PhD',
      'Trustee, Board of Trustees',
      'Harvest Intercontinental American University',
    ],
    publications: [
      {
        title: 'Pedagogical Quality Assurance Frameworks in Sub-Saharan Universities',
        year: '2021',
        venue: 'Journal of African Higher Education Policy',
        type: 'Journal Article',
        description: 'Rigorous assessment of faculty tenure, peer observation benchmarks, and student learning outcome measurements in post-conflict academic revitalizations.',
      },
      {
        title: 'Curriculum Harmonization with Global Accreditations in West African Higher Education',
        year: '2023',
        venue: 'NCHE Academic Standards Directorate',
        type: 'Curriculum Standard',
        description: 'Directives on modular degree credit systems and international transferable competencies.',
      },
    ],
    education: [
      'Doctor of Philosophy (Ph.D.) — Higher Education Pedagogy & African Development',
      'Master of Arts (MA) — Curriculum Theory & Educational Measurement',
    ],
  },

  dr_jacob_meiporkoyah: {
    id: 'dr_jacob_meiporkoyah',
    slug: 'faculty-dr-jacob-meiporkoyah',
    bannerTitle: 'COLLEGE OF THEOLOGY & MINISTRY',
    breadcrumb: 'FACULTY • DR. JACOB MEIPORKOYAH',
    name: 'DR. JACOB MEIPORKOYAH',
    subtitle: 'D.Min • Professor of Ministry & Pastoral Theology',
    roleBadge: 'College of Theology & Ministry',
    category: 'faculty',
    socialLinks: {
      linkedin: 'https://www.linkedin.com/in/jacob-meiporkoyah',
      twitter: 'https://twitter.com/DrMeiporkoyah',
    },
    paragraphs: [
      'Dr. Jacob Meiporkoyah, D.Min, leads theological scholarship and pastoral formation in the HIAU College of Theology & Ministry. His coursework integrates deep Biblical exegesis with the practical demands of Christian counseling, church planting, and community development across Africa.',
      'Dedicated to nurturing servant leaders who embody moral courage and spiritual passion, Dr. Meiporkoyah mentors students toward transformative ministry and ethical public engagement.',
    ],
    image: '/assets/hiau/dr_jacob_meiporkoyah.png',
    imageCaption: [
      'Dr. Jacob Meiporkoyah, D.Min',
      'Professor of Ministry & Theology',
      'Harvest Intercontinental American University',
    ],
    publications: [
      {
        title: 'Pastoral Counseling and Community Healing: A Biblical Hermeneutic for West African Societies',
        year: '2020',
        venue: 'African Theological Monograph Series',
        type: 'Book',
        description: 'Foundational textbook integrating pastoral trauma counseling, grief reconciliation, and spiritual formation in post-conflict communities.',
      },
      {
        title: 'Contextual Church Planting and Global Missions in 21st-Century Africa',
        year: '2022',
        venue: 'Harvest Theological Journal',
        type: 'Journal Article',
        description: 'Examines indigenous leadership succession, cross-cultural missions, and discipleship models across urban and rural West Africa.',
      },
    ],
    education: [
      'Doctor of Ministry (D.Min.) — Pastoral Counseling & Ecclesial Theology',
      'Master of Divinity (M.Div.) — Biblical Studies & Hermeneutics',
    ],
  },

  rev_dr_earl_darlington: {
    id: 'rev_dr_earl_darlington',
    slug: 'faculty-rev-dr-earl-darlington',
    bannerTitle: 'COLLEGE OF LIBERAL ARTS & EDUCATION',
    breadcrumb: 'FACULTY • REV. DR. EARL ORLANDO DARLINGTON',
    name: 'REV. DR. EARL ORLANDO DARLINGTON',
    subtitle: 'EdD, MATS, MA (Linguistics), BA • Professor of Communications & Humanities',
    roleBadge: 'College of Liberal Arts & Education',
    category: 'faculty',
    socialLinks: {
      linkedin: 'https://www.linkedin.com/in/earl-darlington',
      twitter: 'https://twitter.com/RevDrDarlington',
    },
    paragraphs: [
      'Rev. Dr. Earl Orlando Darlington is a scholar-practitioner with advanced degrees in education, linguistics, and theological studies. In the College of Liberal Arts and Social Sciences, he teaches advanced communication, academic writing, and educational methodology.',
      'His research examines bilingual and multilingual learning environments and pedagogical techniques tailored to Sub-Saharan African higher education.',
    ],
    image: '/assets/hiau/rev_dr_earl_darlington.png',
    imageCaption: [
      'Rev. Dr. Earl Orlando Darlington, EdD',
      'Professor of Communications & Humanities',
      'Harvest Intercontinental American University',
    ],
    publications: [
      {
        title: 'Applied Sociolinguistics and Language Acquisition in Multilingual Sub-Saharan Classrooms',
        year: '2019',
        venue: 'Journal of West African Applied Linguistics',
        type: 'Journal Article',
        description: 'Examines language comprehension hurdles, academic discourse proficiency, and bilingual pedagogy in tertiary institutions.',
      },
      {
        title: 'Rhetoric, Public Speaking, and Ethical Communication for African Servant Leaders',
        year: '2021',
        venue: 'HIAU College of Liberal Arts Faculty Press',
        type: 'Monograph',
        description: 'Instructional textbook covering debate, academic thesis presentation, and persuasive discourse grounded in Christian ethics.',
      },
    ],
    education: [
      'Doctor of Education (EdD) — Applied Educational Pedagogy',
      'Master of Arts in Theological Studies (MATS)',
      'Master of Arts (MA) in Applied Linguistics',
      'Bachelor of Arts (BA) in Humanities',
    ],
  },

  dr_timothy_jornkatonor: {
    id: 'dr_timothy_jornkatonor',
    slug: 'faculty-dr-timothy-jornkatonor',
    bannerTitle: 'COLLEGE OF SCIENCE & ALLIED HEALTH',
    breadcrumb: 'FACULTY • DR. TIMOTHY JORNKATONOR',
    name: 'DR. TIMOTHY JORNKATONOR',
    subtitle: 'Pharm. Candi., M.PH • Faculty in Allied Health, Nursing & Laboratory Sciences',
    roleBadge: 'College of Science & Allied Health',
    category: 'faculty',
    socialLinks: {
      linkedin: 'https://www.linkedin.com/in/timothy-jornkatonor',
      twitter: 'https://twitter.com/DrTJornkatonor',
    },
    paragraphs: [
      'Dr. Timothy Jornkatonor leads the public health and allied medical sciences curriculum at HIAU. Holding a Master of Public Health and advanced pharmacy credentials, he trains students across Nursing BSN, Laboratory Science, and Health Administration programs.',
      'His clinical and research initiatives emphasize preventive medicine, epidemiology, and healthcare infrastructure resiliency throughout Montserrado County and Liberia.',
    ],
    image: '/assets/hiau/dr_timothy_jornkatonor.jpg',
    imageCaption: [
      'Dr. Timothy Jornkatonor, M.PH',
      'Faculty in Allied Health & Pharmacy',
      'Harvest Intercontinental American University',
    ],
    publications: [
      {
        title: 'Community Epidemiology and Disease Surveillance in Urban Informal Settlements',
        year: '2021',
        venue: 'West African Journal of Public Health & Epidemiology',
        type: 'Journal Article',
        description: 'Empirical survey of waterborne infectious vectors and clinic reporting networks across Montserrado County.',
      },
      {
        title: 'Essential Pharmacology and Clinical Laboratory Protocols for BSN Candidates',
        year: '2023',
        venue: 'HIAU College of Science & Allied Health Curriculum Series',
        type: 'Curriculum Standard',
        description: 'Comprehensive clinical laboratory manual standardizing medication dosages, sterile protocols, and patient diagnostic records.',
      },
    ],
    education: [
      'Master of Public Health (M.PH) — Epidemiology & Health Systems Management',
      'Pharmacy Candidate (Pharm. Candi.) & B.Sc. Clinical Health',
    ],
  },

  mr_george_sorbor: {
    id: 'mr_george_sorbor',
    slug: 'faculty-mr-george-sorbor',
    bannerTitle: 'COLLEGE OF SCIENCE & TECHNOLOGY',
    breadcrumb: 'FACULTY • MR. GEORGE F. SORBOR',
    name: 'MR. GEORGE F. SORBOR',
    subtitle: 'B.Sc., M.Sc. (Candi.) • Faculty in Information Technology & Computer Systems',
    roleBadge: 'College of Science & Technology',
    category: 'faculty',
    socialLinks: {
      linkedin: 'https://www.linkedin.com/in/george-sorbor',
      twitter: 'https://twitter.com/GeorgeSorborIT',
    },
    paragraphs: [
      'Mr. George F. Sorbor directs student instruction in the interactive computer lab, supervising coursework in information systems, software programming, network engineering, and database management.',
      'He coordinates hands-on laboratory carrel sessions equipped with low-latency Starlink internet and solar-inverter backup, preparing HIAU students for real-world tech careers.',
    ],
    image: '/assets/hiau/mr_george_sorbor.jpg',
    imageCaption: [
      'Mr. George F. Sorbor',
      'Faculty in Information Technology',
      'Harvest Intercontinental American University',
    ],
    publications: [
      {
        title: 'Deploying Low-Latency Satellite Intranet Networks in Higher Education Computer Labs',
        year: '2024',
        venue: 'African Information Systems & Computing Colloquium',
        type: 'Research Paper',
        description: 'Architectural case study detailing Starlink gateway routing, solar-inverter power resilience, and bandwidth distribution across student workstations.',
      },
      {
        title: 'Practical Curriculum for Undergraduate Systems Architecture and Cybersecurity in West Africa',
        year: '2022',
        venue: 'HIAU College of Science & Technology Course Framework',
        type: 'Curriculum Standard',
        description: 'Modular curriculum standard bridging software development, Linux server administration, and enterprise database security.',
      },
    ],
    education: [
      'Master of Science (M.Sc. Candidate) — Information Systems & Networking',
      'Bachelor of Science (B.Sc.) in Computer Science',
    ],
  },

  trustee_beoni_uery: {
    id: 'trustee_beoni_uery',
    slug: 'trustee-hon-beoni-uery',
    bannerTitle: 'BOARD OF TRUSTEES',
    breadcrumb: 'TRUSTEE • HON. BEONI UERY',
    name: 'HON. BEONI UERY',
    subtitle: 'Trustee (MSc) • Strategic Planning & University Operations',
    roleBadge: 'Board of Trustees',
    category: 'trustee',
    socialLinks: {
      linkedin: 'https://www.linkedin.com/in/beoni-uery',
      twitter: 'https://twitter.com/BeoniUery',
    },
    paragraphs: [
      'Hon. Beoni Uery contributes extensive acumen in strategic institutional management, operations planning, and corporate oversight to the HIAU Board of Trustees.',
      'He assists the executive committee in long-range campus development, resource optimization, and ensuring operational alignment with the highest standards of higher education.',
    ],
    image: '/assets/hiau/trustee_beoni_uery.jpg',
    imageCaption: [
      'Hon. Beoni Uery, MSc',
      'Trustee, Board of Trustees',
      'Harvest Intercontinental American University',
    ],
    publications: [
      {
        title: 'Strategic Operations Planning and Institutional Agility in Private Universities',
        year: '2021',
        venue: 'West African Journal of Strategic Management',
        type: 'Policy Treatise',
        description: 'Analyzes resource allocation, physical capital forecasting, and continuous operational quality improvement models.',
      },
    ],
    education: [
      'Master of Science (MSc) — Strategic Management & Operations Planning',
      'Bachelor of Science (BSc) — Business Administration',
    ],
  },

  trustee_wolo_belleh: {
    id: 'trustee_wolo_belleh',
    slug: 'trustee-bishop-wolo-belleh',
    bannerTitle: 'BOARD OF TRUSTEES',
    breadcrumb: 'TRUSTEE • BISHOP M. WOLO BELLEH',
    name: 'BISHOP M. WOLO BELLEH',
    subtitle: 'Trustee (THD) • Theological Education & Pastoral Ethics',
    roleBadge: 'Board of Trustees',
    category: 'trustee',
    socialLinks: {
      linkedin: 'https://www.linkedin.com/in/bishop-wolo-belleh',
      twitter: 'https://twitter.com/BishopWoloBelleh',
    },
    paragraphs: [
      'Bishop M. Wolo Belleh brings profound theological wisdom, ecclesial governance, and spiritual counseling experience to the Board of Trustees.',
      'He provides foundational guidance to the College of Theology & Ministry, reinforcing the university’s unwavering commitment to Christ-centered servant leadership and biblical integrity.',
    ],
    image: '/assets/hiau/trustee_wolo_belleh.jpg',
    imageCaption: [
      'Bishop M. Wolo Belleh, THD',
      'Trustee, Board of Trustees',
      'Harvest Intercontinental American University',
    ],
    publications: [
      {
        title: 'Biblical Ethics, Pastoral Integrity, and Institutional Governance in Sub-Saharan Africa',
        year: '2019',
        venue: 'All-Africa Theological Association Monograph',
        type: 'Book',
        description: 'Theological examination of moral accountability, ethical fiduciary leadership, and spiritual formation for educational executives.',
      },
    ],
    education: [
      'Doctor of Theology (THD) — Systematic Theology & Pastoral Ministry',
      'Master of Divinity (MDiv) — Biblical Studies',
    ],
  },

  trustee_carmenia_abdallah: {
    id: 'trustee_carmenia_abdallah',
    slug: 'trustee-carmenia-abdallah',
    bannerTitle: 'BOARD OF TRUSTEES',
    breadcrumb: 'TRUSTEE • CARMENIA ABDALLAH',
    name: 'CARMENIA ABDALLAH',
    subtitle: 'Trustee (BSc) • Community Health & Institutional Development',
    roleBadge: 'Board of Trustees',
    category: 'trustee',
    socialLinks: {
      linkedin: 'https://www.linkedin.com/in/carmenia-abdallah',
      twitter: 'https://twitter.com/CarmeniaAbdallah',
    },
    paragraphs: [
      'Carmenia Abdallah serves on the HIAU Board of Trustees focusing on allied health curricula, community health initiatives, and institutional philanthropy.',
      'Her dedication to expanding educational and healthcare access across Liberia enriches the university’s strategic outreach in Montserrado County.',
    ],
    image: '/assets/hiau/trustee_carmenia_abdallah.jpg',
    imageCaption: [
      'Carmenia Abdallah, BSc',
      'Trustee, Board of Trustees',
      'Harvest Intercontinental American University',
    ],
    publications: [
      {
        title: 'Maternal and Child Community Health Outreach Models for Urban Montserrado',
        year: '2022',
        venue: 'Liberian Community Healthcare Initiative Reports',
        type: 'Research Paper',
        description: 'Examines clinical engagement strategies and mobile health education programs in underserved settlements.',
      },
    ],
    education: [
      'Bachelor of Science (BSc) — Community Health & Healthcare Administration',
    ],
  },

  trustee_walker_richards: {
    id: 'trustee_walker_richards',
    slug: 'trustee-walker-richards',
    bannerTitle: 'BOARD OF TRUSTEES',
    breadcrumb: 'TRUSTEE • WALKER R. RICHARDS',
    name: 'WALKER R. RICHARDS',
    subtitle: 'Trustee (M.E.) • Engineering Infrastructure & Technical Systems',
    roleBadge: 'Board of Trustees',
    category: 'trustee',
    socialLinks: {
      linkedin: 'https://www.linkedin.com/in/walker-richards',
      twitter: 'https://twitter.com/WalkerRichardsHIAU',
    },
    paragraphs: [
      'Walker R. Richards brings senior engineering expertise and facilities infrastructure planning to the HIAU Board of Trustees.',
      'He advises on campus architectural expansion, engineering laboratory infrastructure, and solar renewable backup power systems for the Old Road academic complex.',
    ],
    image: '/assets/hiau/trustee_walker_richards.jpg',
    imageCaption: [
      'Walker R. Richards, M.E.',
      'Trustee, Board of Trustees',
      'Harvest Intercontinental American University',
    ],
    publications: [
      {
        title: 'Civil Infrastructure Resiliency and Renewable Solar Microgrids in West African Campuses',
        year: '2023',
        venue: 'Journal of Sustainable Educational Infrastructure',
        type: 'Policy Treatise',
        description: 'Technical blueprints for sustainable zero-emission solar backup systems for multi-story university academic facilities.',
      },
    ],
    education: [
      'Master of Engineering (M.E.) — Civil & Environmental Infrastructure',
      'Bachelor of Science (BSc) — Mechanical Engineering',
    ],
  },

  rev_armah_karmoh: {
    id: 'rev_armah_karmoh',
    slug: 'faculty-rev-armah-karmoh',
    bannerTitle: 'COLLEGE OF EDUCATION & THEOLOGY',
    breadcrumb: 'FACULTY • REV. ARMAH KARMOH',
    name: 'REV. ARMAH KARMOH',
    subtitle: 'B.A. (Ed), B.Th., M.A. (Ed) • Senior Faculty in Education & Pedagogy',
    roleBadge: 'College of Education',
    category: 'faculty',
    socialLinks: {
      linkedin: 'https://www.linkedin.com/in/rev-armah-karmoh',
      twitter: 'https://twitter.com/RevArmahKarmoh',
    },
    paragraphs: [
      'Rev. Armah Karmoh provides specialized teacher education and curriculum pedagogy instruction in the College of Education.',
      'His research focuses on early childhood literacy and foundational math education, equipping future educators to excel in Liberian and West African classrooms.',
    ],
    image: '/assets/hiau/rev_armah_karmoh.png',
    imageCaption: [
      'Rev. Armah Karmoh, M.A.',
      'Senior Faculty in Teacher Pedagogy',
      'Harvest Intercontinental American University',
    ],
    publications: [
      {
        title: 'Foundational Phonics and Reading Instruction for Multilingual Liberian Primary Classrooms',
        year: '2020',
        venue: 'Liberia Teacher Education Forum Monograph',
        type: 'Monograph',
        description: 'Evidence-based strategies for developing grade-level literacy fluency in post-conflict primary schools.',
      },
      {
        title: 'Integration of Moral Education and Character Development in Early Childhood Learning',
        year: '2022',
        venue: 'Harvest College of Education Journal',
        type: 'Journal Article',
        description: 'Curriculum design integrating civic ethics and personal discipline in early childhood schooling.',
      },
    ],
    education: [
      'Master of Arts (M.A.) in Education — Curriculum & Instructional Methods',
      'Bachelor of Theology (B.Th.)',
      'Bachelor of Arts (B.A.) in Education',
    ],
  },

  dr_emmitt_dennis: {
    id: 'dr_emmitt_dennis',
    slug: 'faculty-dr-emmitt-dennis',
    bannerTitle: 'COLLEGE OF SCIENCE & ALLIED HEALTH',
    breadcrumb: 'FACULTY • DR. EMMITT DENNIS',
    name: 'DR. EMMITT DENNIS',
    subtitle: 'Senior Faculty & Academic Advisor • Higher Education Curriculum & Research',
    roleBadge: 'College of Science & Allied Health',
    category: 'faculty',
    socialLinks: {
      linkedin: 'https://www.linkedin.com/in/emmitt-dennis',
      twitter: 'https://twitter.com/DrEmmittDennis',
    },
    paragraphs: [
      'Dr. Emmitt Dennis is a renowned higher education scholar and academic advisor who contributes strategic guidance to HIAU’s STEM and biomedical sciences curricula.',
      'His mentorship fosters undergraduate scientific research, laboratory best practices, and international academic exchanges.',
    ],
    image: '/assets/hiau/dr_emmitt_dennis.jpg',
    imageCaption: [
      'Dr. Emmitt Dennis',
      'Senior Faculty & Scientific Academic Advisor',
      'Harvest Intercontinental American University',
    ],
    publications: [
      {
        title: 'Transformative Academic Leadership and Institutional Reform in Liberian Higher Education',
        year: '2018',
        venue: 'Council of Higher Education Policy & Biomedical Research',
        type: 'Policy Treatise',
        description: 'Comprehensive historical and strategic reflection on post-war university modernization and faculty development.',
      },
      {
        title: 'Biomedical Laboratory Standards and Undergraduate Research Mentorship in West Africa',
        year: '2021',
        venue: 'African Journal of Biological Sciences',
        type: 'Journal Article',
        description: 'Empirical protocols for equipping university labs to conduct reliable microbiological and allied health research.',
      },
    ],
    education: [
      'Doctor of Philosophy (Ph.D.) — Biomedical Sciences & Academic Administration',
    ],
  },

  mr_thomas_gmawlue: {
    id: 'mr_thomas_gmawlue',
    slug: 'faculty-mr-thomas-gmawlue',
    bannerTitle: 'COLLEGE OF BUSINESS & ENTREPRENEURSHIP',
    breadcrumb: 'FACULTY • MR. THOMAS N. GMAWLUE JR.',
    name: 'MR. THOMAS N. GMAWLUE JR.',
    subtitle: 'Faculty in Business & Entrepreneurship • Accounting & Startup Incubation',
    roleBadge: 'College of Business',
    category: 'faculty',
    socialLinks: {
      linkedin: 'https://www.linkedin.com/in/thomas-gmawlue-jr',
      twitter: 'https://twitter.com/ThomasGmawlue',
    },
    paragraphs: [
      'Mr. Thomas N. Gmawlue Jr. leads practical entrepreneurship modeling and accounting coursework in the College of Business & Entrepreneurship.',
      'He coordinates the Harvest Young Entrepreneurs business incubator on campus, mentoring students as they pitch ventures and transition from job seekers into job creators.',
    ],
    image: '/assets/hiau/mr_thomas_gmawlue.jpg',
    imageCaption: [
      'Mr. Thomas N. Gmawlue Jr.',
      'Faculty in Accounting & Business Incubation',
      'Harvest Intercontinental American University',
    ],
    publications: [
      {
        title: 'From Job Seekers to Job Creators: The Harvest Young Entrepreneurs Incubator Model',
        year: '2023',
        venue: 'West African Journal of Business & Entrepreneurship',
        type: 'Research Paper',
        description: 'Analyzes student startup pitch showcases, seed mentorship mechanisms, and venture viability in Monrovia’s local economy.',
      },
      {
        title: 'Applied Managerial Accounting and Financial Reporting for Micro-Enterprises in Liberia',
        year: '2022',
        venue: 'HIAU College of Business Practical Monograph Series',
        type: 'Curriculum Standard',
        description: 'Hands-on accounting manual covering cash flow modeling, inventory control, and statutory Liberian revenue compliance.',
      },
    ],
    education: [
      'Master of Business Administration (MBA Candidate) — Financial Accounting',
      'Bachelor of Business Administration (BBA) in Accounting',
    ],
  },
};

export const QUICK_LEADERSHIP_SWITCHER = [
  { id: 'chancellor', name: 'Bishop Dr. Darlingston G. Johnson', label: 'Chancellor' },
  { id: 'president', name: 'Asst. Prof. Mamawa M. Freeman-Moore', label: 'President' },
  { id: 'deputy_chancellor', name: 'Dr. Kona-Facia Freeman-Nepay', label: 'Deputy Chancellor' },
  { id: 'board_chair', name: 'Dr. Jonathan C. Taylor', label: 'Board Chair' },
  { id: 'board_head', name: 'Stanton B. Johnson', label: 'Board Head' },
  { id: 'trustee_nelson_williams', name: 'Hon. T. Nelson Williams', label: 'Trustee' },
  { id: 'trustee_charlyn_brumskin', name: 'Cllr. Charlyn Brumskin', label: 'Trustee' },
  { id: 'dr_jacob_meiporkoyah', name: 'Dr. Jacob Meiporkoyah', label: 'Theology' },
  { id: 'dr_timothy_jornkatonor', name: 'Dr. Timothy Jornkatonor', label: 'Health' },
  { id: 'mr_george_sorbor', name: 'Mr. George F. Sorbor', label: 'IT' },
];

export interface LeaderGroupMember {
  id: string;
  name: string;
  role: string;
  badge: string;
  avatar: string;
}

export interface LeaderGroup {
  category: string;
  members: LeaderGroupMember[];
}

export const LEADER_GROUPS: LeaderGroup[] = [
  {
    category: 'Executive Leadership',
    members: [
      {
        id: 'chancellor',
        name: 'Bishop Dr. Darlingston G. Johnson',
        role: 'Founder & Chancellor of HIAU',
        badge: 'Chancellor',
        avatar: '/assets/images/hiau_chancellor_portrait_1794157550151.jpg',
      },
      {
        id: 'deputy_chancellor',
        name: 'Dr. Kona-Facia Freeman-Nepay',
        role: 'Founding President & Deputy Chancellor',
        badge: 'Founding President',
        avatar: '/assets/images/hiau_president_portrait_1794157550124.jpg',
      },
      {
        id: 'president',
        name: 'Asst. Prof. Mamawa M. Freeman-Moore',
        role: 'President of the University',
        badge: 'President',
        avatar: '/assets/hiau/prof_mamawa_freeman_moore.png',
      },
      {
        id: 'board_chair',
        name: 'Dr. Jonathan C. Taylor',
        role: 'Chairman, Board of Trustees',
        badge: 'Board Chair',
        avatar: '/assets/images/hiau_chair_portrait_1794157551551.jpg',
      },
      {
        id: 'board_head',
        name: 'Stanton B. Johnson',
        role: 'Global & National Board Head',
        badge: 'Board Head',
        avatar: '/assets/hiau/stanton_johnson.jpg',
      },
    ],
  },
  {
    category: 'Governing Trustees',
    members: [
      {
        id: 'trustee_nelson_williams',
        name: 'Hon. T. Nelson Williams',
        role: 'Trustee (MPA) • Public Administration',
        badge: 'Trustee',
        avatar: '/assets/hiau/trustee_nelson_williams.jpg',
      },
      {
        id: 'trustee_beoni_uery',
        name: 'Hon. Beoni Uery',
        role: 'Trustee (MSc) • Strategic Planning',
        badge: 'Trustee',
        avatar: '/assets/hiau/trustee_beoni_uery.jpg',
      },
      {
        id: 'trustee_wolo_belleh',
        name: 'Bishop M. Wolo Belleh',
        role: 'Trustee (THD) • Theological Education',
        badge: 'Trustee',
        avatar: '/assets/hiau/trustee_wolo_belleh.jpg',
      },
      {
        id: 'trustee_augustine_konneh',
        name: 'Hon. Augustine Konneh',
        role: 'Trustee (PhD) • Higher Education Policy',
        badge: 'Trustee',
        avatar: '/assets/hiau/trustee_augustine_konneh.jpg',
      },
      {
        id: 'trustee_charlyn_brumskin',
        name: 'Cllr. Charlyn Brumskin',
        role: 'Trustee (JD) • Legal Counsel',
        badge: 'Trustee',
        avatar: '/assets/hiau/trustee_charlyn_brumskin.jpg',
      },
      {
        id: 'trustee_carmenia_abdallah',
        name: 'Carmenia Abdallah',
        role: 'Trustee (BSc) • Community Health',
        badge: 'Trustee',
        avatar: '/assets/hiau/trustee_carmenia_abdallah.jpg',
      },
      {
        id: 'trustee_walker_richards',
        name: 'Walker R. Richards',
        role: 'Trustee (M.E.) • Technical Systems',
        badge: 'Trustee',
        avatar: '/assets/hiau/trustee_walker_richards.jpg',
      },
    ],
  },
  {
    category: 'Professors & Academic Deans',
    members: [
      {
        id: 'dr_jacob_meiporkoyah',
        name: 'Dr. Jacob Meiporkoyah',
        role: 'College of Theology & Ministry',
        badge: 'Theology',
        avatar: '/assets/hiau/dr_jacob_meiporkoyah.png',
      },
      {
        id: 'rev_dr_earl_darlington',
        name: 'Rev. Dr. Earl Orlando Darlington',
        role: 'College of Liberal Arts & Education',
        badge: 'Humanities',
        avatar: '/assets/hiau/rev_dr_earl_darlington.png',
      },
      {
        id: 'rev_armah_karmoh',
        name: 'Rev. Armah Karmoh',
        role: 'College of Education • Teacher Pedagogy',
        badge: 'Education',
        avatar: '/assets/hiau/rev_armah_karmoh.png',
      },
      {
        id: 'dr_timothy_jornkatonor',
        name: 'Dr. Timothy Jornkatonor',
        role: 'College of Science & Allied Health',
        badge: 'Allied Health',
        avatar: '/assets/hiau/dr_timothy_jornkatonor.jpg',
      },
      {
        id: 'dr_emmitt_dennis',
        name: 'Dr. Emmitt Dennis',
        role: 'College of Science • Academic Advisor',
        badge: 'Academic Advisor',
        avatar: '/assets/hiau/dr_emmitt_dennis.jpg',
      },
      {
        id: 'mr_george_sorbor',
        name: 'Mr. George F. Sorbor',
        role: 'College of Science & Technology',
        badge: 'IT Systems',
        avatar: '/assets/hiau/mr_george_sorbor.jpg',
      },
      {
        id: 'mr_thomas_gmawlue',
        name: 'Mr. Thomas N. Gmawlue Jr.',
        role: 'College of Business • Incubation',
        badge: 'Entrepreneurship',
        avatar: '/assets/hiau/mr_thomas_gmawlue.jpg',
      },
    ],
  },
];

/**
 * Helper to resolve profile by either ID or slug for linkable URL routing
 */
export function resolveLeaderProfile(identifier: string): LeaderProfile | undefined {
  if (LEADERSHIP_PROFILES[identifier]) {
    return LEADERSHIP_PROFILES[identifier];
  }
  return Object.values(LEADERSHIP_PROFILES).find(
    (p) => p.slug === identifier || p.id === identifier
  );
}
