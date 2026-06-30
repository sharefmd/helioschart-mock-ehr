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
  '32-year-old with an ASC-US / HPV-positive Pap — the decision today is colposcopy versus repeat testing. ' +
  'Contraception is stable (refill due) and a small simple ovarian cyst just needs a surveillance ultrasound.';

export interface PlanItem { term: string; text: string; callout?: { label: string; body: string } }

export const NOTE = {
  title: 'Office visit',
  byline: 'Dr. Alanna Reyes · Jun 25, 2026',
  interval:
    '32-year-old with an ASC-US / HPV-positive Pap — the decision today is colposcopy versus repeat testing. ' +
    'Contraception is stable (refill due) and a small simple ovarian cyst just needs a surveillance ultrasound.',
  exam: 'Focused exam performed today; pertinent findings reviewed and reflected in the assessment & plan below.',
  plan: [
    {
      term: 'Cytology',
      text: '— Recommended and scheduled colposcopy; counseled on HPV.',
      callout: {
        label: 'ASCCP risk-based guidance:',
        body: 'ASC-US with positive high-risk HPV generally meets the threshold for colposcopy.',
      },
    },
    { term: 'Contraception', text: '— Continued OCP; refilled; reassured on spotting.' },
    { term: 'Ovarian cyst', text: '— Ordered a repeat pelvic ultrasound.' },
  ] as PlanItem[],
  medications: [
    { name: 'Combined OCP (norethindrone/EE) 1 mg', detail: '/20 mcg · 1 tablet po daily · for Contraception' },
  ],
};

export type ActionIcon = 'doc' | 'calendar';
export interface SignAction { id: string; group: string; label: string; icon: ActionIcon; checked: boolean }

export const SIGN_ACTIONS: SignAction[] = [
  { id: 'plan', group: 'UPDATES TO THE CHART', label: "Update today's plan", icon: 'doc', checked: true },
  { id: 'followup', group: 'FOLLOW-UPS FREEDA WILL QUEUE', label: 'Book a follow-up', icon: 'calendar', checked: true },
];
