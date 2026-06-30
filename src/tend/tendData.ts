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
