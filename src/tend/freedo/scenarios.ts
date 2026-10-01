// ============================================================
// SCENARIOS — one per specialty. Each has a patient, a plain
// note, and a scripted "hard ask" that streams in and ends by
// creating a net-new surface.
// ============================================================

import type { SurfaceId } from './surfaces';

/** The guideline behind an insight — one clickable reference. */
export interface Ref { label: string; href: string }

export type ItemKind = 'you' | 'tool' | 'thought' | 'say' | 'table' | 'surface' | 'insight';

export interface ScriptItem {
  k: ItemKind;
  text?: string;
  /** thought */
  secs?: number;
  body?: string;
  /** table */
  title?: string;
  rows?: [string, string][];
  /** surface */
  surface?: SurfaceId;
  meta?: string;
  /** short name used if the clinician pins this surface as a tab */
  tab?: string;
  /** the guideline behind an insight */
  ref?: Ref;
}

export interface Ask {
  /** what the clinician types / taps */
  prompt: string;
  /** short label for the suggestion chip */
  chip: string;
  /** the streamed response */
  script: ScriptItem[];
}

export interface NoteSectionData { h: string; p?: string; items?: string[] }

/** One step on the path to closing the visit. */
export interface CloseStep {
  /** the verb — PRESCRIBE, ORDER LAB, REFER, SUBMIT BILL */
  verb: string;
  /** what it is, once drafted */
  what: string;
  /** the specifics + where it goes */
  detail: string;
  /** past tense, shown once complete */
  done: string;
  /** the exact payload, field by field, with where each value came from */
  review: { k: string; v: string; src?: string }[];
}

export interface Scenario {
  id: string;
  specialty: string;
  patient: string;
  meta: string;
  noteTitle: string;
  byline: string;
  /** the opening thing Freedo says before anything is asked */
  opening: string;
  /** the guideline behind that opening insight */
  ref: Ref;
  note: NoteSectionData[];
  /** thread tree: condition → request */
  thread: { condition: string; request: string };
  /** the ordered steps required to close this visit */
  close: CloseStep[];
  asks: Ask[];
}

export const SCENARIOS: Scenario[] = [
  // ---------------------------------------------------------- OB/GYN
  {
    id: 'obgyn',
    specialty: 'OB/GYN',
    patient: 'Renata Cole',
    meta: '32 · F · MRN TND-100294',
    noteTitle: 'Abnormal Pap follow-up',
    byline: 'Dr. Alanna Reyes · 25 Jun 2026',
    opening: 'ASC-US with high-risk HPV, 16/18 negative. Immediate CIN3+ risk sits at 4.4% against a 4.0% threshold, so colposcopy is favoured.',
    ref: { label: 'ACOG Guidelines 2026', href: 'https://www.acog.org/clinical/clinical-guidance' },
    thread: { condition: 'Abnormal cervical cytology', request: 'Colposcopy referral + OCP refill' },
    note: [
      { h: 'Subjective', p: 'Returns for abnormal Pap follow-up. ASC-US with positive high-risk HPV. Mild breakthrough spotting on her current pill for about two months; otherwise well. No pelvic pain.' },
      { h: 'Objective', items: [
        'Pap 10 Jun: ASC-US · hrHPV positive · 16/18 not detected',
        'Pelvic US 2 Apr: 3.2 cm simple left ovarian cyst',
        'BP 118/72 · HR 68 · weight 138 lb · BMI 22.1',
        'Combined OCP 1 mg / 20 mcg daily · folic acid 400 mcg',
        'NKDA · never-smoker',
      ] },
      { h: 'Assessment', items: [
        'Abnormal cervical cytology (R87.610) — new, meets ASCCP colposcopy threshold',
        'Contraception (Z30.9) — stable, breakthrough spotting',
        'Simple ovarian cyst (N83.20) — surveillance, interval lapsed',
      ] },
      { h: 'Plan', items: [
        'Refer for colposcopy; rationale discussed',
        'Continue combined OCP, refill ×3',
        'Surveillance pelvic ultrasound within two weeks',
        'Return in two weeks for colposcopy findings',
      ] },
    ],
    close: [
      {
        verb: 'Prescribe', what: 'Norethindrone / EE 1 mg / 20 mcg',
        detail: '1 tablet daily · 3 packs, 3 refills → Walgreens #4821', done: 'e-Rx sent to Walgreens #4821',
        review: [
          { k: 'Drug', v: 'Norethindrone / EE 1 mg / 20 mcg', src: 'RxNorm 748962 · unchanged from her active list' },
          { k: 'Sig', v: 'Take 1 tablet by mouth daily', src: 'same as current prescription' },
          { k: 'Quantity', v: '3 packs · 84 days', src: 'matches her last two fills' },
          { k: 'Refills', v: '3' },
          { k: 'Pharmacy', v: 'Walgreens #4821 — 220 Main St', src: 'marked primary on her record' },
          { k: 'Contraindications', v: 'None identified', src: 'never-smoker · BP 118/72 today' },
        ],
      },
      {
        verb: 'Order imaging', what: 'Pelvic ultrasound',
        detail: 'Simple cyst surveillance, interval lapsed → Bay Imaging', done: 'Order placed — imaging will schedule',
        review: [
          { k: 'Study', v: 'Transvaginal pelvic ultrasound' },
          { k: 'Indication', v: 'Simple ovarian cyst, surveillance', src: 'N83.20 from her problem list' },
          { k: 'Comparison', v: 'Pelvic US 2 Apr 2026', src: 'pulled for the radiologist' },
          { k: 'Timing', v: 'Within 2 weeks', src: '8–12 week interval expired 28 May' },
          { k: 'Facility', v: 'Bay Imaging Center', src: 'where her April study was done' },
        ],
      },
      {
        verb: 'Make referral', what: 'Colposcopy',
        detail: 'ASC-US with high-risk HPV · cytology attached → Gyn procedures', done: 'Referral sent — scheduling will call her',
        review: [
          { k: 'To', v: 'Gyn procedures — this practice' },
          { k: 'Indication', v: 'ASC-US with positive high-risk HPV', src: 'cytology 10 Jun, Quest' },
          { k: 'Attached', v: 'Cytology report · HPV result', src: 'auto-pulled from the lab feed' },
          { k: 'Guideline', v: 'ASCCP 2019 risk-based', src: '4.4% immediate risk vs 4.0% threshold' },
          { k: 'Authorisation', v: 'Not required', src: 'BCBS PPO · in-network' },
        ],
      },
      {
        verb: 'Submit bill', what: '99214 · moderate MDM',
        detail: 'R87.610 · Z30.9 · N83.20 → billing', done: '99214 queued for billing',
        review: [
          { k: 'Level', v: '99214', src: 'two of three elements reach moderate' },
          { k: 'Problems', v: 'Moderate', src: '1 new with uncertain prognosis + 2 stable chronic' },
          { k: 'Data', v: 'Moderate', src: '3 Category 1 elements — ext. cytology, ext. imaging, US ordered' },
          { k: 'Risk', v: 'Moderate', src: 'prescription drug management' },
          { k: 'Diagnoses', v: 'R87.610 · Z30.9 · N83.20', src: 'ordered by relevance to today' },
          { k: 'Time', v: '28 min on date of encounter', src: 'from the encounter timer' },
        ],
      },
    ],
    asks: [
      {
        prompt: 'Refill her pill and get the colposcopy moving.',
        chip: 'Draft the orders',
        script: [
          { k: 'tool', text: 'Ran search_medications' },
          { k: 'tool', text: 'Fetched patient data' },
          { k: 'thought', secs: 1, body: 'Found norethindrone/EE 1 mg / 20 mcg, ID 20114. No allergies on file. Checking contraindications before I draft — she is a never-smoker with a normal BP, so no restriction.' },
          { k: 'tool', text: 'Ran check_contraindications' },
          { k: 'thought', secs: 2, body: 'Clear. Pharmacy is Walgreens #4821, marked primary. Colposcopy is in-network with no prior authorisation, so the referral can go as routine. Drafting both now.' },
          { k: 'say', text: 'Drafting prescription…' },
          {
            k: 'table', title: 'Norethindrone / EE 1 mg / 20 mcg',
            rows: [
              ['Sig', 'Take 1 tablet by mouth daily'],
              ['Allergies', 'None on file'],
              ['Quantity', '3 packs'],
              ['Refills', '3'],
              ['Days supply', '84'],
              ['Pharmacy', 'Walgreens #4821 — 220 Main St'],
              ['Notes', 'Continue current pill. Breakthrough spotting ~2 months; reassess if persists past 3.'],
            ],
          },
          {
            k: 'table', title: 'Colposcopy referral',
            rows: [
              ['To', 'Gyn procedures — this practice'],
              ['Indication', 'ASC-US with positive high-risk HPV'],
              ['Attached', 'Cytology report · HPV result'],
              ['Priority', 'Routine — within 12 weeks'],
              ['Authorisation', 'Not required · in-network'],
            ],
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------- Peds
  {
    id: 'peds',
    specialty: 'Pediatrics',
    patient: 'Mateo Rivera',
    meta: '2 y 4 m · M · MRN TND-100417',
    noteTitle: 'Two-year check — weight faltering',
    byline: 'Dr. Alanna Reyes · 1 Oct 2026',
    opening: 'He has crossed two centile lines for weight since 15 months. Height is holding, which points at intake rather than a systemic cause.',
    ref: { label: 'AAP Guidelines 2026', href: 'https://publications.aap.org/clinical-practice-guidelines' },
    thread: { condition: 'Weight faltering', request: 'Growth review + iron studies' },
    note: [
      { h: 'Subjective', p: 'Routine two-year check. Mother reports fussy eating and roughly 900 mL of cow’s milk daily with refusal of most solids. No vomiting, diarrhoea or blood in stool. Energy and development reported as normal.' },
      { h: 'Objective', items: [
        'Weight 11.1 kg (9th centile; 25th at 15 months)',
        'Height 88 cm (40th) · head circumference 49 cm (45th)',
        'Alert, interactive, no dysmorphic features, no organomegaly',
        'Developmental screen age-appropriate; expressive language low-normal',
        'MMR and varicella due',
      ] },
      { h: 'Assessment', items: [
        'Weight faltering (R62.51) — most consistent with excessive milk intake displacing solids',
        'Routine two-year surveillance — development otherwise appropriate',
      ] },
      { h: 'Plan', items: [
        'Reduce cow’s milk to 500 mL daily; offer solids before milk',
        'Full blood count and ferritin for iron deficiency',
        'MMR and varicella given today, left and right thigh',
        'Weight recheck in six weeks; dietitian if no gain',
      ] },
    ],
    close: [
      {
        verb: 'Order labs', what: 'Full blood count + ferritin',
        detail: 'Iron deficiency workup for weight faltering → lab', done: 'Orders placed — phlebotomy before she leaves',
        review: [
          { k: 'Panels', v: 'FBC · ferritin' },
          { k: 'Indication', v: 'Weight faltering with high milk intake', src: 'R62.51' },
          { k: 'Rationale', v: 'Cow’s milk displacing iron-rich solids', src: '900 mL/day reported today' },
          { k: 'Draw', v: 'Today, before discharge', src: 'phlebotomy open until 17:00' },
        ],
      },
      {
        verb: 'Record vaccines', what: 'MMR + varicella',
        detail: 'Given today, left and right thigh → immunisation registry', done: 'Both recorded and reported',
        review: [
          { k: 'Vaccines', v: 'MMR · varicella', src: 'both due per schedule' },
          { k: 'Sites', v: 'Left thigh · right thigh', src: 'as administered' },
          { k: 'Lots', v: 'MM-4417 · VZ-2208', src: 'scanned at administration' },
          { k: 'Registry', v: 'State IIS submission', src: 'automatic within 24 h' },
        ],
      },
      {
        verb: 'Book recheck', what: 'Six-week weight check',
        detail: 'Dietitian if no gain → front desk', done: 'Recheck booked for 12 Nov',
        review: [
          { k: 'Interval', v: '6 weeks', src: 'standard for weight faltering' },
          { k: 'Purpose', v: 'Weight and intake review' },
          { k: 'Escalation', v: 'Dietitian if no gain', src: 'conditional referral pre-drafted' },
          { k: 'Slot', v: '12 Nov, 09:20', src: 'first available with you' },
        ],
      },
      {
        verb: 'Submit bill', what: '99392 + 90707, 90716',
        detail: 'R62.51 · Z00.129 → billing', done: 'Claim queued with vaccine administration',
        review: [
          { k: 'Preventive', v: '99392', src: 'established patient, age 1–4' },
          { k: 'Vaccines', v: '90707 · 90716', src: 'product codes' },
          { k: 'Administration', v: '90460 ×2', src: 'counselling documented' },
          { k: 'Diagnoses', v: 'R62.51 · Z00.129' },
        ],
      },
    ],
    asks: [
      {
        prompt: 'I need his weight on percentile curves, not a number.',
        chip: 'Plot his growth',
        script: [
          { k: 'tool', text: 'Fetched anthropometrics · 5 timepoints' },
          { k: 'thought', secs: 2, body: 'A single weight tells you nothing here — the signal is the trajectory. I have five measurements from 12 to 28 months. WHO boys reference is the right standard under two, CDC after; I will use WHO and label it.' },
          { k: 'tool', text: 'Loaded WHO weight-for-age reference' },
          { k: 'thought', secs: 1, body: 'Building a first-class view rather than a chart image, so it stays live as new weights land.' },
          { k: 'say', text: 'Built you a growth surface. It will update itself at each weigh-in.' },
          { k: 'surface', surface: 'growth', tab: 'Growth chart', title: 'Growth curves', meta: 'new surface · weight-for-age · WHO' },
        ],
      },
    ],
  },

  // ---------------------------------------------------------- Derm
  {
    id: 'derm',
    specialty: 'Dermatology',
    patient: 'Jordan Alvarez',
    meta: '34 · M · MRN TND-100388',
    noteTitle: 'Changing nevus, left upper back',
    byline: 'Dr. Alanna Reyes · 1 Oct 2026',
    opening: 'The lesion has grown 2 mm in the long axis since March. Dermoscopy shows an atypical network, so documented change is the thing that matters here.',
    ref: { label: 'AAD Guidelines 2026', href: 'https://www.aad.org/member/clinical-quality/guidelines' },
    thread: { condition: 'Atypical melanocytic nevus', request: 'Punch biopsy + lesion mapping' },
    note: [
      { h: 'Subjective', p: 'Presents for a mole on the left upper back that his partner noticed has darkened over roughly four months. Denies itching, bleeding or pain. Maternal aunt with melanoma in her fifties. Fitzpatrick II, two blistering childhood burns.' },
      { h: 'Objective', items: [
        'Left upper back, 4 cm inferomedial to scapular spine: 8 × 7 mm asymmetric macule',
        'Irregular notched border; two-tone brown with peripheral darker rim',
        'Dermoscopy: atypical pigment network, irregular peripheral globules, no blue-white veil',
        'Total body skin exam: 31 nevi, three additional atypical',
        'No palpable axillary or cervical lymphadenopathy',
      ] },
      { h: 'Assessment', items: [
        'Atypical melanocytic nevus — dysplastic nevus most likely',
        'Early melanoma in situ cannot be excluded on clinical grounds',
      ] },
      { h: 'Plan', items: [
        'Punch biopsy 4 mm under 1% lidocaine with epinephrine — consent obtained',
        'Specimen to dermatopathology with dermoscopic impression',
        'Photograph and map for interval comparison',
        'Sun protection counselling; results in 7–10 days',
      ] },
    ],
    close: [
      {
        verb: 'Log procedure', what: 'Punch biopsy, 4 mm',
        detail: 'Left upper back · consent documented → chart', done: 'Procedure logged against 11104',
        review: [
          { k: 'Procedure', v: 'Punch biopsy, 4 mm' },
          { k: 'Site', v: 'Left upper back, 4 cm inferomedial to scapular spine', src: 'from the lesion map' },
          { k: 'Anaesthetic', v: '1% lidocaine with epinephrine' },
          { k: 'Consent', v: 'Verbal and written, documented', src: 'timestamped 10:31' },
        ],
      },
      {
        verb: 'Send specimen', what: 'Dermatopathology',
        detail: 'Requisition with dermoscopic impression → lab courier', done: 'Specimen routed — courier 4pm',
        review: [
          { k: 'Lab', v: 'Regional dermatopathology' },
          { k: 'Clinical history', v: 'Changing nevus, 6 → 8 mm since March', src: 'from the calibrated series' },
          { k: 'Impression', v: 'Atypical network, irregular peripheral globules', src: 'your dermoscopy note' },
          { k: 'Courier', v: '16:00 pickup today' },
        ],
      },
      {
        verb: 'Set call-back', what: 'Results in 7–10 days',
        detail: 'Nurse to call with pathology → task queue', done: 'Call-back task created',
        review: [
          { k: 'Owner', v: 'Nursing team' },
          { k: 'Window', v: '7–10 days from 1 Oct', src: 'lab’s stated turnaround' },
          { k: 'Escalation', v: 'Same-day call if melanoma reported', src: 'flagged on the task' },
        ],
      },
      {
        verb: 'Submit bill', what: '99204 + 11104',
        detail: 'D48.5 · Z80.8 → billing', done: 'Claim queued with the biopsy',
        review: [
          { k: 'Visit', v: '99204', src: 'new patient, moderate complexity' },
          { k: 'Procedure', v: '11104', src: 'punch biopsy, single lesion' },
          { k: 'Modifier', v: '25 on the visit', src: 'significant separate E/M' },
          { k: 'Diagnoses', v: 'D48.5 · Z80.8', src: 'neoplasm of uncertain behaviour; family hx' },
        ],
      },
    ],
    asks: [
      {
        prompt: 'Show me his moles on a body map with the photos over time.',
        chip: 'Map the lesions',
        script: [
          { k: 'tool', text: 'Fetched 4 tracked lesions' },
          { k: 'tool', text: 'Fetched 11 clinical photographs' },
          { k: 'thought', secs: 3, body: 'Photos alone do not answer the question — what matters is the same lesion at the same site across time. I have coordinates for four tracked lesions and calibrated images from four visits, so I can measure rather than eyeball.' },
          { k: 'tool', text: 'Ran measure_calibrated · 4 series' },
          { k: 'thought', secs: 1, body: 'Long axis 6 → 8 mm between March and October. That is a documented change, which is the biopsy justification.' },
          { k: 'say', text: 'Spatial and longitudinal in one surface. The biopsied lesion is highlighted.' },
          { k: 'surface', surface: 'bodymap', tab: 'Body map', title: 'Body map + photo timeline', meta: 'new surface · 4 tracked · calibrated' },
        ],
      },
    ],
  },

  // ---------------------------------------------------------- Oncology
  {
    id: 'onc',
    specialty: 'Oncology',
    patient: 'Yusuf Demir',
    meta: '61 · M · MRN TND-100502',
    noteTitle: 'Colorectal adenocarcinoma — cycle 3',
    byline: 'Dr. Alanna Reyes · 1 Oct 2026',
    opening: 'Counts are adequate for cycle 3. The one thing to watch is grade 1 neuropathy — it is new since cycle 2.',
    ref: { label: 'NCCN Guidelines 2026', href: 'https://www.nccn.org/guidelines/category_1' },
    thread: { condition: 'Colorectal adenocarcinoma', request: 'Cycle 3 clearance' },
    note: [
      { h: 'Subjective', p: 'Returns for cycle 3 of adjuvant FOLFOX. Reports mild tingling in fingertips starting about a week after cycle 2, no functional impairment. Nausea controlled on ondansetron. No fevers, no diarrhoea.' },
      { h: 'Objective', items: [
        'ANC 2.1 ×10⁹/L · platelets 142 ×10⁹/L · Hb 11.4 g/dL',
        'Creatinine 0.9 · LFTs within normal limits',
        'Weight stable at 74.2 kg · ECOG 1',
        'Neuropathy grade 1 by CTCAE — fingertips only',
      ] },
      { h: 'Assessment', items: [
        'Stage III colorectal adenocarcinoma — adjuvant FOLFOX, cycle 3 of 6',
        'Oxaliplatin-induced peripheral neuropathy, grade 1 — new',
      ] },
      { h: 'Plan', items: [
        'Proceed with cycle 3 at full dose',
        'Reduce oxaliplatin 25% if neuropathy reaches grade 2',
        'Pre-cycle labs 48 hours before each subsequent cycle',
        'Toxicity call-back at day 7',
      ] },
    ],
    close: [
      {
        verb: 'Clear the cycle', what: 'Cycle 3 FOLFOX',
        detail: 'ANC 2.1 · platelets 142 · auth approved → regimen', done: 'Cycle 3 cleared at full dose',
        review: [
          { k: 'Regimen', v: 'FOLFOX, q14d, cycle 3 of 6' },
          { k: 'ANC', v: '2.1 ×10⁹/L', src: 'gate ≥1.5 — pass' },
          { k: 'Platelets', v: '142 ×10⁹/L', src: 'gate ≥100 — pass' },
          { k: 'Neuropathy', v: 'Grade 1', src: 'full dose holds; reduce 25% at grade 2' },
          { k: 'Authorisation', v: 'Approved through cycle 6', src: 'payer response 12 Aug' },
        ],
      },
      {
        verb: 'Book infusion', what: 'Chemo chair, 3 Sep',
        detail: 'Two-day regimen, day 1 infusion → chemo unit', done: 'Chair booked for 3 Sep',
        review: [
          { k: 'Date', v: '3 Sep', src: '14 days from cycle 2' },
          { k: 'Duration', v: 'Day 1 infusion, 4 h', src: 'per regimen template' },
          { k: 'Premedication', v: 'Ondansetron · dexamethasone', src: 'carried from cycle 2' },
          { k: 'Chair', v: 'Unit 2, chair 6', src: 'first available matching duration' },
        ],
      },
      {
        verb: 'Set toxicity call', what: 'Day 7 call-back',
        detail: 'Grade 1 neuropathy to recheck → nurse', done: 'Day-7 call scheduled',
        review: [
          { k: 'Owner', v: 'Chemo nursing' },
          { k: 'Day', v: '7 post-infusion', src: 'nadir window' },
          { k: 'Script', v: 'Neuropathy grade · nausea · fever', src: 'grade-2 triggers a dose review' },
        ],
      },
      {
        verb: 'Submit bill', what: '99214 + 96413, 96415',
        detail: 'C18.9 · Z51.11 → billing', done: 'Claim queued with infusion time',
        review: [
          { k: 'Visit', v: '99214', src: 'assessment prior to chemotherapy' },
          { k: 'Infusion', v: '96413 first hour · 96415 ×3 additional', src: 'from the chair record' },
          { k: 'Diagnoses', v: 'C18.9 · Z51.11' },
          { k: 'Note', v: 'Drug J-codes bill from the unit, not here' },
        ],
      },
    ],
    asks: [
      {
        prompt: 'Put his regimen on a cycle calendar with the pre-cycle gating.',
        chip: 'Build cycle calendar',
        script: [
          { k: 'tool', text: 'Fetched regimen · FOLFOX q14d ×6' },
          { k: 'tool', text: 'Fetched pre-cycle labs · 3 sets' },
          { k: 'thought', secs: 2, body: 'A list of appointments is not a regimen view. What the clinic needs is cycle, day, and whether the gate opened — counts, toxicity grade and financial clearance all have to clear before infusion is booked.' },
          { k: 'tool', text: 'Ran check_gating · ANC, platelets, CTCAE, auth' },
          { k: 'thought', secs: 3, body: 'All four gates pass for cycle 3. Neuropathy is grade 1 so full dose holds, but I am surfacing the grade-2 rule on the surface itself so the decision is visible at the point of booking rather than buried in the note.' },
          { k: 'say', text: 'Cycle calendar built. Gating is on the surface, not in a sub-tab.' },
          { k: 'surface', surface: 'chemo', tab: 'Cycle calendar', title: 'Chemo cycle calendar', meta: 'new surface · FOLFOX · gated' },
        ],
      },
    ],
  },

  // ---------------------------------------------------------- Endo
  {
    id: 'endo',
    specialty: 'Endocrinology',
    patient: 'Aisha Bello',
    meta: '29 · F · MRN TND-100455',
    noteTitle: 'Type 1 diabetes — CGM review',
    byline: 'Dr. Alanna Reyes · 1 Oct 2026',
    opening: 'Time in range is 68%, just under target, and almost all of the excursion is overnight. Her A1c looks fine and hides it.',
    ref: { label: 'ADA Standards of Care 2026', href: 'https://diabetesjournals.org/care/issue' },
    thread: { condition: 'Type 1 diabetes mellitus', request: 'Basal adjustment' },
    note: [
      { h: 'Subjective', p: 'Routine review. Reports two episodes of symptomatic hypoglycaemia overnight in the last fortnight, both self-treated. No severe events, no seizures. Using a hybrid closed-loop pump with a Dexcom G7.' },
      { h: 'Objective', items: [
        'CGM 14-day: time in range 68% · below range 7% · above 25%',
        'Coefficient of variation 38% · GMI 7.1%',
        'HbA1c 6.9% — discordant with CGM pattern',
        'Weight 64 kg · BP 112/70',
      ] },
      { h: 'Assessment', items: [
        'Type 1 diabetes (E10.9) — time in range below target with nocturnal hypoglycaemia',
        'Glycaemic variability elevated at CV 38%',
      ] },
      { h: 'Plan', items: [
        'Reduce overnight basal 10% between 00:00 and 04:00',
        'Raise low alert threshold to 80 mg/dL',
        'Repeat CGM download in four weeks',
        'Hypoglycaemia action plan reviewed',
      ] },
    ],
    close: [
      {
        verb: 'Adjust pump', what: 'Basal −10%, 00:00–04:00',
        detail: 'Overnight hypoglycaemia → her pump', done: 'Basal profile pushed to pump',
        review: [
          { k: 'Change', v: 'Basal rate −10%', src: '0.85 → 0.77 U/h' },
          { k: 'Window', v: '00:00 – 04:00', src: 'where every low sits' },
          { k: 'Basis', v: '2 symptomatic lows in 14 days', src: 'plus 7% time below range' },
          { k: 'Delivery', v: 'Pushed to pump at next sync' },
        ],
      },
      {
        verb: 'Change alert', what: 'Low threshold 70 → 80 mg/dL',
        detail: 'Earlier warning overnight → Dexcom', done: 'Alert threshold updated',
        review: [
          { k: 'Setting', v: 'Low alert 70 → 80 mg/dL' },
          { k: 'Rationale', v: 'Earlier warning while asleep' },
          { k: 'Scope', v: 'Overnight schedule only', src: 'daytime unchanged at 70' },
        ],
      },
      {
        verb: 'Set recall', what: 'Four-week CGM download',
        detail: 'Reassess time in range → recall list', done: 'Recall set for 29 Oct',
        review: [
          { k: 'Interval', v: '4 weeks', src: 'enough data to judge the basal change' },
          { k: 'Measure', v: 'Time in range · CV · overnight lows' },
          { k: 'Target', v: '>70% in range', src: 'ADA consensus' },
        ],
      },
      {
        verb: 'Submit bill', what: '99214 + 95251',
        detail: 'E10.9 · E10.649 → billing', done: 'Claim queued with CGM interpretation',
        review: [
          { k: 'Visit', v: '99214', src: 'moderate MDM with medication adjustment' },
          { k: 'CGM', v: '95251', src: 'interpretation, ≥72 h of data' },
          { k: 'Diagnoses', v: 'E10.9 · E10.649', src: 'type 1 with hypoglycaemia' },
          { k: 'Evidence', v: '4,032 readings over 14 days', src: 'supports the 95251' },
        ],
      },
    ],
    asks: [
      {
        prompt: 'Show me her CGM time in range, not another A1c.',
        chip: 'CGM view',
        script: [
          { k: 'tool', text: 'Pulled 14 days · 4,032 glucose readings' },
          { k: 'thought', secs: 2, body: 'A1c of 6.9% looks reassuring and is actively misleading here — it averages away a 25% high fraction against a 7% low fraction. The density profile is what shows that.' },
          { k: 'tool', text: 'Ran compute_agp · percentile bands' },
          { k: 'thought', secs: 1, body: 'Overnight is where the lows cluster, between midnight and four. That localises the fix to basal rather than bolus ratios.' },
          { k: 'say', text: 'Time in range with the ambulatory profile. The lows are all overnight.' },
          { k: 'surface', surface: 'cgm', tab: 'Time in range', title: 'CGM time in range', meta: 'new surface · 14 days · AGP' },
        ],
      },
    ],
  },

  // ---------------------------------------------------------- Nephrology
  {
    id: 'nephro',
    specialty: 'Nephrology',
    patient: 'Walter Nkemelu',
    meta: '58 · M · MRN TND-100611',
    noteTitle: 'ESRD on haemodialysis — intradialytic hypotension',
    byline: 'Dr. Alanna Reyes · 1 Oct 2026',
    opening: 'Two hypotensive episodes since 30 September, when 4.2 litres came off a 2 kg gain. His dry weight is probably set too low.',
    ref: { label: 'KDIGO Guidelines 2026', href: 'https://kdigo.org/guidelines/' },
    thread: { condition: 'End-stage renal disease', request: 'Dry weight reassessment' },
    note: [
      { h: 'Subjective', p: 'Reports cramping and light-headedness in the last hour of his last two sessions, resolving with saline and chair recline. Adherent to fluid restriction most days; admits a heavy weekend. No chest pain or dyspnoea.' },
      { h: 'Objective', items: [
        'Pre-dialysis weight 78.9 kg · post 75.8 kg · prescribed dry weight 75.5 kg',
        'Nadir BP 92/54 on 30 Sep and 96/58 on 25 Sep',
        'Kt/V 1.28 — down from 1.42',
        'AVF left forearm, no recirculation, bruit and thrill intact',
      ] },
      { h: 'Assessment', items: [
        'ESRD on thrice-weekly haemodialysis (N18.6)',
        'Intradialytic hypotension — likely excessive ultrafiltration against an optimistic dry weight',
        'Falling Kt/V — adequacy needs review',
      ] },
      { h: 'Plan', items: [
        'Raise dry weight to 76.5 kg and reassess in two weeks',
        'Cap ultrafiltration rate at 13 mL/kg/hr',
        'Dietitian review of interdialytic weight gain',
        'Repeat adequacy studies next month',
      ] },
    ],
    close: [
      {
        verb: 'Change prescription', what: 'Dry weight 75.5 → 76.5 kg',
        detail: 'Reassess in two weeks → dialysis unit', done: 'Unit prescription updated',
        review: [
          { k: 'Change', v: 'Target dry weight +1.0 kg' },
          { k: 'Basis', v: '2 hypotensive nadirs in 5 sessions', src: '92/54 and 96/58' },
          { k: 'Reassess', v: '2 weeks', src: '6 sessions of data' },
          { k: 'Risk if unchanged', v: 'Further intradialytic hypotension' },
        ],
      },
      {
        verb: 'Cap ultrafiltration', what: '13 mL/kg/hr maximum',
        detail: 'Prevent further hypotension → dialysis unit', done: 'UF cap in force from next session',
        review: [
          { k: 'Cap', v: '13 mL/kg/hr', src: '≈1.0 L/h at 76.5 kg' },
          { k: 'Exceeded on', v: '30 Sep — 4.2 L in 4 h', src: '≈13.7 mL/kg/hr' },
          { k: 'Effect', v: 'May require longer sessions', src: 'flagged to the unit' },
        ],
      },
      {
        verb: 'Make referral', what: 'Renal dietetics',
        detail: 'Interdialytic weight gain → scheduling', done: 'Referral sent to dietetics',
        review: [
          { k: 'To', v: 'Renal dietetics' },
          { k: 'Reason', v: 'Interdialytic gain up to 2 kg', src: 'driving the UF requirement' },
          { k: 'Attached', v: 'Last 5 session weights' },
        ],
      },
      {
        verb: 'Submit bill', what: '90960 · monthly ESRD',
        detail: 'N18.6 · I95.3 → billing', done: 'Monthly capitation queued',
        review: [
          { k: 'Code', v: '90960', src: '4+ visits this month, age 20+' },
          { k: 'Visits', v: '4 face-to-face this month', src: 'from the unit log' },
          { k: 'Diagnoses', v: 'N18.6 · I95.3', src: 'ESRD; intradialytic hypotension' },
        ],
      },
    ],
    asks: [
      {
        prompt: 'Give me his sessions as a flowsheet grid — I need to see the pattern.',
        chip: 'Session flowsheet',
        script: [
          { k: 'tool', text: 'Fetched 5 sessions · MWF schedule' },
          { k: 'thought', secs: 2, body: 'Per-session notes bury this. The pattern only appears when sessions sit side by side as columns — pre and post weight against ultrafiltration volume and nadir pressure.' },
          { k: 'tool', text: 'Ran flag_outliers · UF rate, nadir BP' },
          { k: 'thought', secs: 3, body: '30 September is the outlier: a 2 kg interdialytic gain met with 4.2 L of ultrafiltration, and both hypotensive nadirs sit adjacent to the highest UF volumes. Kt/V falling alongside is consistent with shortened effective time from the hypotension.' },
          { k: 'say', text: 'Recurring-session matrix, outliers flagged.' },
          { k: 'surface', surface: 'dialysis', tab: 'Flowsheet', title: 'Dialysis flowsheet', meta: 'new surface · 5 sessions · flagged' },
        ],
      },
    ],
  },

  // ---------------------------------------------------------- EP
  {
    id: 'ep',
    specialty: 'Cardiology · EP',
    patient: 'Ruth Okonkwo',
    meta: '68 · F · MRN TND-100208',
    noteTitle: 'Device check — rising AF burden',
    byline: 'Dr. Alanna Reyes · 1 Oct 2026',
    opening: 'AF burden has climbed from 2% to 14% over six months. With her risk factors that moves anticoagulation from optional to indicated.',
    ref: { label: 'ACC/AHA Guidelines 2026', href: 'https://www.acc.org/Guidelines' },
    thread: { condition: 'Paroxysmal atrial fibrillation', request: 'Anticoagulation decision' },
    note: [
      { h: 'Subjective', p: 'Routine device clinic follow-up. Reports occasional fluttering lasting minutes, no syncope or pre-syncope. No bleeding. Hypertension and type 2 diabetes both treated.' },
      { h: 'Objective', items: [
        'Medtronic Azure XT DR, implanted 2021 · interrogated 1 Oct',
        'Battery 7.2 years estimated · RV impedance 512 Ω · RA 441 Ω',
        'AF burden 14%, up from 2% six months ago',
        'Ventricular pacing 38% · no ventricular arrhythmia episodes',
        'Creatinine 0.9 (eGFR 68) · Hb 12.9 g/dL',
      ] },
      { h: 'Assessment', items: [
        'Paroxysmal atrial fibrillation (I48.0) — burden rising',
        'CHA₂DS₂-VASc 4 — hypertension, diabetes, age 65–74, female',
        'Device functioning normally; no lead concerns',
      ] },
      { h: 'Plan', items: [
        'Start apixaban 5 mg twice daily — dose confirmed against age, weight, creatinine',
        'Discussed stroke and bleeding risk explicitly',
        'Remote monitoring interval shortened to 30 days',
        'Return in three months or sooner if burden rises further',
      ] },
    ],
    close: [
      {
        verb: 'Prescribe', what: 'Apixaban 5 mg twice daily',
        detail: 'Dose checked against age, weight, eGFR 68 → pharmacy', done: 'e-Rx sent to her pharmacy',
        review: [
          { k: 'Drug', v: 'Apixaban 5 mg', src: 'RxNorm 1364445' },
          { k: 'Sig', v: '1 tablet twice daily' },
          { k: 'Dose check', v: 'Full dose appropriate', src: 'none of: age ≥80, wt ≤60 kg, Cr ≥1.5' },
          { k: 'Indication', v: 'CHA₂DS₂-VASc 4', src: 'HTN · DM · age 65–74 · female' },
          { k: 'Interactions', v: 'None with her current list', src: 'checked against 4 active meds' },
        ],
      },
      {
        verb: 'Reprogram monitoring', what: 'Remote interval 90 → 30 days',
        detail: 'Rising AF burden → CareLink', done: 'Monitoring window shortened',
        review: [
          { k: 'Change', v: 'Remote transmission 90 → 30 days' },
          { k: 'Trigger', v: 'AF burden 2% → 14% over 6 months' },
          { k: 'Alerts', v: 'AF >6 h/day · lead impedance out of range' },
        ],
      },
      {
        verb: 'Book recall', what: 'Three-month device clinic',
        detail: 'Sooner if burden climbs → front desk', done: 'Recall booked for 2 Jan',
        review: [
          { k: 'Interval', v: '3 months' },
          { k: 'Purpose', v: 'Burden recheck and bleeding review' },
          { k: 'Conditional', v: 'Pull forward if remote alert fires' },
        ],
      },
      {
        verb: 'Submit bill', what: '99214 + 93294',
        detail: 'I48.0 · Z95.0 → billing', done: 'Claim queued with remote interrogation',
        review: [
          { k: 'Visit', v: '99214', src: 'moderate MDM with anticoagulation decision' },
          { k: 'Remote', v: '93294', src: 'dual-chamber, 90-day interrogation' },
          { k: 'Diagnoses', v: 'I48.0 · Z95.0' },
        ],
      },
    ],
    asks: [
      {
        prompt: 'Pull her device interrogation trends.',
        chip: 'Device trends',
        script: [
          { k: 'tool', text: 'Fetched 6 interrogations · Medtronic CareLink' },
          { k: 'thought', secs: 2, body: 'A single interrogation report is a PDF nobody trends. The decision-relevant thing is the slope — AF burden, lead impedance and battery over the last six checks.' },
          { k: 'tool', text: 'Ran trend_device · 5 channels' },
          { k: 'thought', secs: 3, body: 'Leads and battery are stable, so this is not a hardware conversation. AF burden has gone 2 → 3 → 4 → 6 → 9 → 14%. Paired with CHA₂DS₂-VASc 4 and eGFR 68, apixaban at full dose is the indicated step.' },
          { k: 'say', text: 'Six checks, five channels. Only burden is moving.' },
          { k: 'surface', surface: 'device', tab: 'Device trends', title: 'Device interrogation viewer', meta: 'new surface · 6-month trend' },
        ],
      },
    ],
  },

  // ---------------------------------------------------------- Home health
  {
    id: 'home',
    specialty: 'Home health',
    patient: 'Today · 5 visits',
    meta: 'Dr. Alanna Reyes · field schedule',
    noteTitle: 'Day plan — 1 Oct 2026',
    byline: 'Home health · 34 miles',
    opening: 'Your five visits are booked in intake order, which has you crossing the river twice. There is a better sequence.',
    ref: { label: 'CMS Conditions of Participation 2026', href: 'https://www.cms.gov/medicare/provider-enrollment-and-certification' },
    thread: { condition: 'Field schedule', request: 'Route optimisation' },
    note: [
      { h: 'Today', items: [
        'E. Walsh — OASIS recertification due, window closes 3 Oct',
        'H. Delgado — wound check, day 12 post-debridement',
        'A. Osei — post-discharge visit, 48-hour requirement',
        'K. Fischer — IV antibiotics, dose 6 of 14',
        'L. Nguyen — PT evaluation, new referral',
      ] },
      { h: 'Constraints', items: [
        'A. Osei must be seen before 12:00 to meet the 48-hour rule',
        'K. Fischer’s infusion is time-locked to the afternoon',
        'Two physician orders need signature before end of day',
      ] },
      { h: 'Plan', items: [
        'Resequence to a single loop; recert first while the window is open',
        'Sign both outstanding physician orders between visits',
        'Flag L. Nguyen for a second PT slot next week',
      ] },
    ],
    close: [
      {
        verb: 'Sign orders', what: 'Two physician orders',
        detail: 'Outstanding from Walsh and Delgado → signature queue', done: 'Both orders signed',
        review: [
          { k: 'Order 1', v: 'E. Walsh — wound care frequency change', src: 'pending since 26 Sep' },
          { k: 'Order 2', v: 'H. Delgado — PT frequency increase', src: 'pending since 28 Sep' },
          { k: 'Deadline', v: 'Unsigned orders block billing', src: 'both inside the 30-day window' },
        ],
      },
      {
        verb: 'Publish route', what: 'Optimised loop, 5 stops',
        detail: 'Both time locks held · −41 min → your phone', done: 'Route pushed to your phone',
        review: [
          { k: 'Stops', v: '5 · 34 miles' },
          { k: 'Locks held', v: 'Osei before 12:00 · Fischer afternoon', src: '48-hour rule and infusion window' },
          { k: 'Saving', v: '41 minutes of driving', src: 'versus intake order' },
          { k: 'Delivery', v: 'Pushed to your phone' },
        ],
      },
      {
        verb: 'Make referral', what: 'Second PT slot for L. Nguyen',
        detail: 'New referral needs a follow-on → scheduling', done: 'Second slot requested',
        review: [
          { k: 'For', v: 'L. Nguyen — PT evaluation today' },
          { k: 'Reason', v: 'Eval needs a follow-on within 7 days' },
          { k: 'Window', v: 'By 8 Oct' },
        ],
      },
      {
        verb: 'Submit OASIS', what: 'Recertification, E. Walsh',
        detail: 'Window closes 3 Oct — unbillable if missed → billing', done: 'OASIS recert submitted',
        review: [
          { k: 'Assessment', v: 'OASIS-E recertification' },
          { k: 'Patient', v: 'E. Walsh' },
          { k: 'Window', v: 'Closes 3 Oct', src: 'day 56–60 of the episode' },
          { k: 'Consequence', v: 'Missed window is unbillable' },
        ],
      },
    ],
    asks: [
      {
        prompt: 'Plan my route for today.',
        chip: 'Plan the route',
        script: [
          { k: 'tool', text: 'Fetched 5 scheduled visits · addresses geocoded' },
          { k: 'thought', secs: 2, body: 'Visits are in intake order, not geographic order. Two are time-locked — the post-discharge 48-hour rule and the afternoon infusion — so this is a constrained problem, not just shortest path.' },
          { k: 'tool', text: 'Ran optimise_route · 2 hard constraints' },
          { k: 'thought', secs: 3, body: 'A single loop satisfies both locks and drops 41 minutes of driving. Recert goes first because the window closes on 3 October and a miss is unbillable.' },
          { k: 'say', text: 'Resequenced. Both time locks hold and you save 41 minutes.' },
          { k: 'surface', surface: 'route', tab: 'Route', title: 'Route view', meta: 'new surface · 5 stops · optimised' },
        ],
      },
    ],
  },
];

export const byId = (id: string) => SCENARIOS.find((s) => s.id === id) ?? SCENARIOS[0];
