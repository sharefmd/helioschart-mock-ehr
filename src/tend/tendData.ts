// Seed content for the Tend "Visit" page (single demo patient).

export const TEND_PROVIDER = { name: 'Dr. Alanna Reyes', role: 'OB/GYN', initials: 'AR' };

export const RENATA = {
  name: 'Renata Cole',
  age: 32,
  sex: 'F',
  problems: 'Abnormal cervical cytology (ASC-US, HPV+), Contraception, Simple ovarian cyst',
  tags: ['HPV positive', 'Colposcopy decision'],
  lastSeen: 'Last seen 1 year ago · Jun 25, 2025',
};

export const VISIT_REASONS = [
  'Abnormal Pap follow-up',
  'Contraception management',
  'Annual well-woman exam',
  'Acute / problem visit',
];
export const VISIT_TYPES = ['Office visit', 'Telehealth visit', 'Nurse visit'];

export const VISIT_SUMMARY =
  '32-year-old with an ASC-US / HPV-positive Pap. The main decision today is colposcopy versus repeat testing. ' +
  'Contraception is stable (refill due, some breakthrough spotting), and a small simple ovarian cyst likely just ' +
  'needs surveillance.';

export interface PlanItem { term: string; text: string; note?: string }

// Note reads as "what to think through / ask today," not a finalized directive.
export const NOTE = {
  title: 'Office visit',
  byline: 'Dr. Alanna Reyes · Jun 25, 2026',
  id: VISIT_SUMMARY,
  interval:
    'Returns for abnormal Pap follow-up. ASC-US with positive high-risk HPV. Reports mild breakthrough spotting ' +
    'on her current pill; otherwise well. No pelvic pain.',
  exam: 'To be documented during the visit.',
  planTitle: 'What to think through today',
  previousAnpDate: 'last visit · Jun 25, 2025',
  previousAnp:
    'Annual well-woman exam. Pap collected (co-testing). Contraception: continued combined OCP, tolerating well. ' +
    'Counseled on cycle regulation and HPV vaccination history. Return for results / routine follow-up.',
  plan: [
    {
      term: 'Abnormal Pap (ASC-US, HPV+)',
      text: 'Colposcopy vs. repeat cytology? Risk-based guidance leans toward colposcopy — worth deciding today.',
      note: 'ASCCP: ASC-US with positive high-risk HPV generally meets the threshold for colposcopy.',
    },
    { term: 'Contraception', text: 'Refill is due and she reports some spotting. Continue the current OCP, or adjust?' },
    { term: 'Simple ovarian cyst', text: 'Small and simple — surveillance ultrasound is the usual next step.' },
  ] as PlanItem[],
  normalPE:
    'Gen: well-appearing, no acute distress. Abdomen: soft, non-tender, no masses. ' +
    'Pelvic: external genitalia normal; cervix visualized without gross lesion; uterus normal size and mobile; ' +
    'no adnexal mass or tenderness.',
  labsSource: 'Quest Diagnostics',
  labs: [
    { name: 'Cervical cytology (Pap)', value: 'ASC-US', abnormal: true, date: 'Jun 10, 2026' },
    { name: 'HPV, high-risk', value: 'Positive', abnormal: true, date: 'Jun 10, 2026' },
    { name: 'HPV 16 / 18 genotype', value: 'Not detected', abnormal: false, date: 'Jun 10, 2026' },
  ],
  medications: [
    { name: 'Combined OCP (norethindrone/EE) 1 mg / 20 mcg', detail: '1 tablet PO daily · for Contraception' },
  ],
};

// ---- Automation workspace (right panel) ----
export const PHARMACIES = ['Walgreens #4821 — 220 Main St', 'CVS #1180 — 45 Oak Ave', 'Mail order — OptumRx'];

export const MED_SEED = {
  id: 'ocp',
  name: 'Combined OCP (norethindrone/EE 1 mg / 20 mcg)',
  sig: '1 tab PO daily',
  refills: 3,
};

export interface OrderAction {
  id: string; title: string; detail: string; trace: string; done: string; included: boolean;
}

export const ORDER_SEED: OrderAction[] = [
  { id: 'colpo', title: 'Schedule colposcopy', detail: 'Gyn procedure · per ASCCP risk-based guidance', trace: 'Routes to procedure scheduling', done: 'Colposcopy requested — scheduling will reach out to book', included: true },
  { id: 'us', title: 'Order pelvic ultrasound', detail: 'Surveillance for simple ovarian cyst', trace: 'Routes to imaging', done: 'Ultrasound order placed — imaging will schedule', included: true },
];

export const FOLLOWUP_SEED = {
  id: 'fu', title: 'Book follow-up', detail: '2 weeks · review colposcopy plan & results',
  trace: 'Routes to scheduling', done: 'Follow-up task created (2 weeks)', included: true,
};

// ============================================================
// CHART TAB — horizontal category nav. Seeded for Renata Cole.
// Categories: Demographics · History · Medications · Objective ·
// Rads · Visits/Notes · Documents.
// ============================================================

export type ChartBlock =
  | { kind: 'text'; text: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'kv'; items: { k: string; v: string }[] }
  | { kind: 'meds'; items: { name: string; sig: string; status?: string }[] }
  | { kind: 'vitals'; items: { label: string; value: string; abnormal?: boolean }[] }
  | { kind: 'labs'; source?: string; items: { name: string; value: string; date: string; abnormal?: boolean }[] }
  | { kind: 'rads'; items: { study: string; date: string; impression: string; abnormal?: boolean }[] }
  | { kind: 'visits'; items: { date: string; type: string; provider: string; summary: string; current?: boolean }[] }
  | { kind: 'docs'; items: { name: string; date: string; source: string; type: string; outside?: boolean }[] };

// A section renders within a category. `tag` marks specialty-conditional
// sections (peds / ob / psych); `empty` sections show a placeholder.
export interface ChartSection { id: string; title: string; tag?: string; block?: ChartBlock; empty?: boolean; }
export interface ChartCategory { id: string; label: string; count?: number; sections: ChartSection[]; }

export const CHART_CATEGORIES: ChartCategory[] = [
  {
    id: 'demographics', label: 'Demographics',
    sections: [
      { id: 'demo', title: 'Demographics',
        block: { kind: 'kv', items: [
          { k: 'Legal name', v: 'Renata Cole' },
          { k: 'Date of birth', v: 'Mar 14, 1994 (age 32)' },
          { k: 'Sex', v: 'Female' },
          { k: 'MRN', v: 'TND-100294' },
          { k: 'Phone', v: '(415) 555-0182' },
          { k: 'Address', v: '1847 Fillmore St, San Francisco, CA 94115' },
          { k: 'Preferred language', v: 'English' },
          { k: 'Insurance', v: 'BCBS PPO · Member 8841-002' },
          { k: 'Pharmacy', v: 'Walgreens #4821 — 220 Main St' },
          { k: 'Provider', v: 'Dr. Alanna Reyes (OB/GYN)' },
          { k: 'Emergency contact', v: 'Marcus Cole (partner) — (415) 555-0147' },
        ] } },
    ],
  },
  {
    id: 'history', label: 'History',
    sections: [
      { id: 'meds-hx', title: 'Current / Past Medications and Supplements',
        block: { kind: 'meds', items: [
          { name: 'Combined OCP (norethindrone/EE 1 mg / 20 mcg)', sig: '1 tab PO daily', status: 'Active' },
          { name: 'Folic acid 400 mcg', sig: '1 tab PO daily (OTC)', status: 'Active' },
          { name: 'Ferrous sulfate 325 mg', sig: '1 tab PO daily', status: 'Discontinued 2023' },
        ] } },
      { id: 'allergies', title: 'Allergies',
        block: { kind: 'text', text: 'No known drug allergies (NKDA).' } },
      { id: 'pmh', title: 'Medical History',
        block: { kind: 'list', items: [
          'Abnormal cervical cytology (ASC-US, HPV positive) — 2026',
          'Iron-deficiency anemia — resolved 2023',
          'Otherwise healthy',
        ] } },
      { id: 'psh', title: 'Surgical History',
        block: { kind: 'list', items: [
          'Laparoscopic appendectomy — 2015',
          'No prior gynecologic surgery',
        ] } },
      { id: 'fhx', title: 'Family History',
        block: { kind: 'list', items: [
          'Mother — breast cancer, diagnosed age 58',
          'Maternal grandmother — cervical cancer',
          'Father — hypertension',
          'No known family history of ovarian cancer',
        ] } },
      { id: 'shx', title: 'Social History',
        block: { kind: 'text', text: 'Works as a graphic designer; lives with partner. Never-smoker. Alcohol 2–3 drinks/week. No recreational drug use. Sexually active, single partner. Exercises ~3×/week.' } },
      { id: 'imm', title: 'Immunizations',
        block: { kind: 'list', items: [
          'HPV (Gardasil 9) — 3-dose series completed 2012',
          'Tdap — 2021',
          'Influenza — 2025–26 season',
          'COVID-19 — up to date',
        ] } },
      { id: 'devhx', title: 'Developmental History', tag: 'peds', empty: true },
      { id: 'obhx', title: 'Obstetric History', tag: 'ob',
        block: { kind: 'kv', items: [
          { k: 'Gravida / Para', v: 'G2 P1011' },
          { k: 'Deliveries', v: '1 spontaneous vaginal delivery, full-term (2019)' },
          { k: 'Losses', v: '1 first-trimester miscarriage (2017)' },
          { k: 'Last menstrual period', v: 'Jun 2, 2026' },
        ] } },
    ],
  },
  {
    id: 'medications', label: 'Medications', count: 2,
    sections: [
      { id: 'meds-active', title: 'Active Medications',
        block: { kind: 'meds', items: [
          { name: 'Combined OCP (norethindrone/EE 1 mg / 20 mcg)', sig: '1 tab PO daily · for Contraception', status: 'Active' },
          { name: 'Folic acid 400 mcg', sig: '1 tab PO daily (OTC)', status: 'Active' },
        ] } },
    ],
  },
  {
    id: 'objective', label: 'Objective',
    sections: [
      { id: 'vitals', title: 'Vitals',
        block: { kind: 'vitals', items: [
          { label: 'BP', value: '118 / 72' },
          { label: 'HR', value: '68' },
          { label: 'Temp', value: '98.4 °F' },
          { label: 'Wt', value: '138 lb' },
          { label: 'BMI', value: '22.1' },
          { label: 'SpO₂', value: '99%' },
        ] } },
      { id: 'labs', title: 'Labs',
        block: { kind: 'labs', source: 'Quest Diagnostics', items: [
          { name: 'Cervical cytology (Pap)', value: 'ASC-US', date: 'Jun 10, 2026', abnormal: true },
          { name: 'HPV, high-risk', value: 'Positive', date: 'Jun 10, 2026', abnormal: true },
          { name: 'HPV 16 / 18 genotype', value: 'Not detected', date: 'Jun 10, 2026' },
          { name: 'Hemoglobin', value: '12.8 g/dL', date: 'Jun 10, 2026' },
        ] } },
      { id: 'scales', title: 'Rating Scales', tag: 'psych', empty: true },
    ],
  },
  {
    id: 'rads', label: 'Rads', count: 2,
    sections: [
      { id: 'imaging', title: 'Imaging / Radiology',
        block: { kind: 'rads', items: [
          { study: 'Pelvic ultrasound (transvaginal)', date: 'Apr 2, 2026', impression: '3.2 cm simple left ovarian cyst; benign appearance. Normal uterus and right ovary.' },
          { study: 'Pelvic ultrasound', date: 'Nov 12, 2024', impression: 'Normal pelvic ultrasound. No adnexal mass.' },
        ] } },
    ],
  },
  {
    id: 'visits', label: 'Visits / Notes', count: 4,
    sections: [
      { id: 'notes', title: 'Visit & Note Repository',
        block: { kind: 'visits', items: [
          { date: 'Jun 25, 2026', type: 'Office visit', provider: 'Dr. Alanna Reyes', summary: 'Abnormal Pap follow-up — colposcopy decision.', current: true },
          { date: 'Jun 25, 2025', type: 'Annual well-woman', provider: 'Dr. Alanna Reyes', summary: 'Pap co-testing collected; contraception continued.' },
          { date: 'Nov 12, 2024', type: 'Telehealth', provider: 'Dr. Alanna Reyes', summary: 'Contraception refill; pelvic ultrasound ordered.' },
          { date: 'Aug 3, 2019', type: 'Delivery note', provider: 'Dr. P. Nomura', summary: 'Spontaneous vaginal delivery, full-term, uncomplicated.' },
        ] } },
    ],
  },
  {
    id: 'documents', label: 'Documents', count: 5,
    sections: [
      { id: 'docs', title: 'All Documents & Outside Records',
        block: { kind: 'docs', items: [
          { name: 'Colposcopy referral', date: 'Jun 25, 2026', source: 'This practice', type: 'Referral' },
          { name: 'Cervical cytology report', date: 'Jun 10, 2026', source: 'Quest Diagnostics', type: 'Lab report' },
          { name: 'Pelvic ultrasound report', date: 'Apr 2, 2026', source: 'Bay Imaging Center', type: 'Radiology', outside: true },
          { name: 'Prior OB records — 2019 delivery', date: 'Aug 2019', source: 'Mercy Women’s Hospital', type: 'Outside record', outside: true },
          { name: 'Insurance card (front/back)', date: 'Jan 4, 2026', source: 'Patient upload', type: 'Scan' },
        ] } },
    ],
  },
];
