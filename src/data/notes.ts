// Historical, signed SOAP notes per patient. Read-only in the Notes tab; the
// current encounter draft (in the store) is the editable one for the demo.

export interface SoapNote {
  id: string;
  date: string;
  type: string;
  author: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export const PATIENT_NOTES: Record<string, SoapNote[]> = {
  // ----------------------------------------------------------- MARIA THOMPSON
  'FT-483920': [
    {
      id: 'n-mt-1', date: '2026-03-19', type: 'Telephone Encounter', author: 'Reyes, Carla RN',
      subjective: 'Patient called reporting home BP readings of 148–156/86–92 over the past 2 weeks. Denies headache, chest pain, vision changes, or dyspnea. Taking metformin and atorvastatin as prescribed; no missed doses. Asks whether her blood pressure medicine needs adjusting.',
      objective: 'Telephone encounter; no exam performed. Home BP log reviewed: average 151/89 over 14 readings. Last in-office BP 150/88 (2025-12-11).',
      assessment: 'Essential hypertension (I10) — suboptimal control by home readings. Type 2 diabetes (E11.9) — stable per patient. CKD stage 2 (N18.2).',
      plan: '1. Reviewed readings with Dr. Okafor. Continue current regimen for now. 2. Scheduled in-office follow-up to evaluate for medication intensification. 3. Advised to continue home BP log and bring it to the visit. 4. Reinforced low-sodium diet. 5. Call back for BP >180/110 or any chest pain/neuro symptoms.',
    },
    {
      id: 'n-mt-2', date: '2025-12-11', type: 'Office Visit — Follow-up', author: 'Okafor, James MD',
      subjective: 'Established 66 y/o female with HTN, T2DM, CKD2, and hyperlipidemia here for routine 6-month follow-up. Feels well overall. No polyuria/polydipsia. No chest pain, dyspnea, edema, or claudication. Adherent to metformin 500 mg BID and atorvastatin 20 mg daily. Checks fingersticks 2–3x/week, mostly 120s–140s fasting.',
      objective: 'Vitals: BP 150/88, HR 72, Wt 190 lb, BMI 31.7. Gen: well-appearing, NAD. CV: RRR, no murmurs/gallops. Lungs: clear. Ext: no peripheral edema, pulses intact. Labs (12/05): A1c 7.3%, eGFR 75, K 4.3, LDL 104, urine ACR 31.',
      assessment: '1. Essential hypertension — above goal today. 2. Type 2 diabetes mellitus — A1c 7.3%, near goal. 3. CKD stage 2 — stable eGFR, albuminuria mildly elevated. 4. Hyperlipidemia — LDL 104 on moderate-intensity statin.',
      plan: '1. HTN: continue lifestyle; recheck BP next visit, consider adding agent if persistently elevated. 2. DM: continue metformin; A1c in 6 months. 3. CKD: monitor; repeat urine ACR. 4. Lipids: continue atorvastatin 20 mg. 5. RTC 6 months or sooner. Pneumococcal vaccine discussed — patient deferred.',
    },
  ],

  // ----------------------------------------------------------- ALVAREZ ROBERT
  'GT-100201': [
    {
      id: 'n-ra-1', date: '2026-01-22', type: 'Office Visit — CAD Follow-up', author: 'Okafor, James MD',
      subjective: '77 y/o male with CAD (s/p PCI 2011), HTN, and knee OA. Denies angina, dyspnea on exertion, orthopnea, or PND. Walks 30 min daily without chest pain. Knee pain stable, managed with acetaminophen PRN. Adherent to aspirin, metoprolol, rosuvastatin.',
      objective: 'Vitals: BP 130/74, HR 64, SpO2 97%. CV: RRR, no murmur. Lungs: clear. Ext: no edema; mild crepitus right knee, full ROM. Labs: LDL 79, A1c 5.6.',
      assessment: '1. CAD, stable — no anginal symptoms. 2. Essential hypertension — at goal. 3. Osteoarthritis of knee — stable.',
      plan: '1. Continue aspirin 81 mg, metoprolol succ 50 mg, rosuvastatin 10 mg. 2. Consider statin uptitration to reach LDL <70 — discussed, will recheck lipids. 3. Knee OA: continue acetaminophen, home exercises; refer PT if worsens. 4. RTC 6 months.',
    },
  ],

  // ----------------------------------------------------------- NGUYEN LINH
  'GT-100455': [
    {
      id: 'n-ln-1', date: '2026-06-20', type: 'Acute Visit — URI', author: 'Okafor, James MD',
      subjective: '34 y/o female with mild intermittent asthma presents with 3 days of sore throat, nasal congestion, and dry cough. Low-grade fevers to 99.8°F. No dyspnea or wheeze. Using albuterol 1–2x. No sick contacts with strep. No dysphagia or drooling.',
      objective: 'Vitals: T 99.6, BP 118/72, HR 88, SpO2 98%. HEENT: mild pharyngeal erythema, no exudate; boggy nasal turbinates. Neck: no lymphadenopathy. Lungs: clear, no wheeze. Rapid strep negative.',
      assessment: '1. Acute viral upper respiratory infection (J06.9). 2. Mild intermittent asthma (J45.20) — currently well controlled.',
      plan: '1. Supportive care: fluids, rest, acetaminophen/ibuprofen, saline nasal spray. 2. No antibiotics indicated (viral, strep negative). 3. Albuterol PRN; return if wheezing/dyspnea. 4. Return or call if symptoms >10 days, high fever, or SOB.',
    },
  ],

  // ----------------------------------------------------------- PATEL DEVANG
  'GT-100789': [
    {
      id: 'n-dp-1', date: '2026-03-04', type: 'Office Visit — Diabetes Follow-up', author: 'Okafor, James MD',
      subjective: '54 y/o male with T2DM, OSA, and obesity for diabetes follow-up. Reports fatigue and snoring; not consistently using CPAP (3–4 nights/week). Fingersticks frequently 160–200 fasting. Diet inconsistent, limited exercise. No vision changes, foot ulcers, or numbness.',
      objective: 'Vitals: BP 134/84, HR 78, Wt 264 lb, BMI 37.9. Gen: obese, NAD. CV: RRR. Lungs: clear. Ext: no edema; monofilament intact bilaterally. Labs: A1c 8.7%, eGFR 90, triglycerides 198.',
      assessment: '1. Type 2 diabetes mellitus — uncontrolled, A1c 8.7%. 2. Obstructive sleep apnea — suboptimal CPAP adherence. 3. Morbid obesity.',
      plan: '1. DM: increase metformin to 1000 mg BID; continue empagliflozin; reinforce diet/exercise; consider GLP-1 if A1c not improving. 2. OSA: counseled on CPAP adherence; sleep medicine follow-up. 3. Obesity: referral to dietitian; discuss weight-management options. 4. Repeat A1c in 3 months.',
    },
  ],

  // ----------------------------------------------------------- WALSH ELEANOR
  'GT-100912': [
    {
      id: 'n-ew-1', date: '2026-02-15', type: 'Office Visit — Anticoag/AFib', author: 'Okafor, James MD',
      subjective: '71 y/o female with atrial fibrillation on apixaban, HTN, and hypothyroidism. Reports occasional palpitations, no syncope or chest pain. No bleeding, melena, or easy bruising. Adherent to apixaban, metoprolol, levothyroxine. Mild fatigue.',
      objective: 'Vitals: BP 142/80, HR 92 irregular. CV: irregularly irregular rhythm, no murmur. Lungs: clear. Ext: no edema. Labs: INR n/a (on DOAC), TSH 5.6, K 4.0.',
      assessment: '1. Atrial fibrillation — rate slightly elevated; CHA2DS2-VASc supports anticoagulation. 2. Hypertension — mildly above goal. 3. Hypothyroidism — TSH elevated, likely under-replaced.',
      plan: '1. AFib: continue apixaban 5 mg BID; increase metoprolol tartrate to 50 mg BID for rate control; ECG today. 2. HTN: recheck; consider adding agent. 3. Hypothyroid: increase levothyroxine to 88 mcg; recheck TSH in 6 weeks. 4. RTC 6 weeks.',
    },
  ],

  // ----------------------------------------------------------- BROOKS TERRENCE
  'GT-101044': [
    {
      id: 'n-tb-1', date: '2026-05-01', type: 'New Patient Visit', author: 'Okafor, James MD',
      subjective: '42 y/o male establishing care. History of hypertension (untreated x months) and generalized anxiety on sertraline. Reports work stress, intermittent palpitations, poor sleep. No chest pain or dyspnea. Family history of early CAD (father, MI at 55). Sedentary, occasional alcohol.',
      objective: 'Vitals: BP 150/96 (repeat 146/92), HR 80. Gen: anxious-appearing, NAD. CV: RRR. Lungs: clear. Labs ordered today: BMP, A1c, lipid panel.',
      assessment: '1. Essential hypertension (I10) — newly addressing, stage 2. 2. Generalized anxiety disorder (F41.1) — on sertraline 50 mg. 3. Cardiovascular risk — strong family history.',
      plan: '1. HTN: lifestyle counseling; start antihypertensive after baseline labs; home BP monitoring. 2. Anxiety: continue sertraline; assess response, consider uptitration. 3. Labs pending; will review and contact patient. 4. RTC 4 weeks for BP recheck.',
    },
  ],

  // ----------------------------------------------------------- ROMERO GABRIELA
  'GT-101188': [
    {
      id: 'n-gr-1', date: '2025-06-30', type: 'Annual Physical', author: 'Okafor, James MD',
      subjective: '24 y/o female (at time of visit) for annual wellness exam. No complaints. Up to date on most preventive care. Exercises regularly, non-smoker, occasional alcohol. LMP regular. No chronic medications.',
      objective: 'Vitals: BP 110/68, HR 64, BMI 22.0. Exam: unremarkable, normal cardiopulmonary and abdominal exam. Screening labs and age-appropriate screening discussed.',
      assessment: '1. Encounter for adult health exam — healthy adult. 2. No active chronic conditions.',
      plan: '1. Continue healthy lifestyle. 2. Lipid panel today; cervical cancer screening per guidelines. 3. Immunizations reviewed/updated. 4. RTC 1 year or PRN.',
    },
  ],

  // ----------------------------------------------------------- FISCHER KARL
  'GT-101300': [
    {
      id: 'n-kf-1', date: '2026-05-01', type: 'Office Visit — BP / GERD', author: 'Okafor, James MD',
      subjective: '57 y/o male with HTN and GERD for follow-up. Reports occasional reflux, improved on omeprazole. Home BP readings 140s–150s/90s. No chest pain or dysphagia. Adherent to amlodipine and omeprazole.',
      objective: 'Vitals: BP 150/92, HR 76. CV: RRR. Lungs: clear. Abd: soft, non-tender. Labs: BMP within normal limits.',
      assessment: '1. Essential hypertension — above goal. 2. GERD — controlled on PPI.',
      plan: '1. HTN: increase amlodipine to 10 mg daily; continue home monitoring; recheck in 4 weeks. 2. GERD: continue omeprazole 20 mg; lifestyle measures; attempt step-down in 8 weeks. 3. RTC 4 weeks for BP.',
    },
  ],

  // ----------------------------------------------------------- OSEI AMA
  'GT-101455': [
    {
      id: 'n-ao-1', date: '2026-06-08', type: 'Office Visit — Anemia/Thyroid', author: 'Okafor, James MD',
      subjective: '47 y/o female with hypothyroidism and newly diagnosed iron deficiency anemia. Reports fatigue and reduced exercise tolerance over several months. Heavy menses noted. Started ferrous sulfate ~1 month ago with mild GI upset. Adherent to levothyroxine.',
      objective: 'Vitals: BP 116/70, HR 82, Wt 151 lb. Gen: mild conjunctival pallor. CV: soft systolic flow murmur. Labs: Hgb 10.8, ferritin 14, TSH 2.1.',
      assessment: '1. Iron deficiency anemia (D50.9) — likely menstrual blood loss. 2. Hypothyroidism — well controlled, TSH 2.1.',
      plan: '1. Anemia: continue ferrous sulfate 325 mg daily with vitamin C; take with food to reduce GI upset; recheck CBC/ferritin in 6–8 weeks. 2. Consider gynecology referral for menorrhagia. 3. Thyroid: continue levothyroxine 100 mcg; routine TSH. 4. RTC 8 weeks.',
    },
  ],

  // ----------------------------------------------------------- DELGADO HECTOR
  'GT-101677': [
    {
      id: 'n-hd-1', date: '2026-04-18', type: 'Office Visit — CHF Follow-up', author: 'Okafor, James MD',
      subjective: '81 y/o male with HFrEF, AFib, CKD3, and T2DM for heart failure follow-up. Reports mild increase in lower-extremity swelling and 3 lb weight gain over the week. Mild dyspnea on exertion (1 flight). Orthopnea with 2 pillows. Adherent to furosemide, carvedilol, sacubitril/valsartan, apixaban, insulin glargine. PCN allergy (anaphylaxis) noted.',
      objective: 'Vitals: BP 110/66, HR 72, Wt 168 lb (up from 165), SpO2 95%. CV: irregular, no new murmur. Lungs: bibasilar crackles. Ext: 1+ pitting edema bilaterally, JVP ~9 cm. Labs: NT-proBNP 1320, eGFR 47, K 4.8.',
      assessment: '1. CHF (HFrEF) — mild volume overload. 2. Atrial fibrillation — rate controlled, anticoagulated. 3. CKD stage 3. 4. Type 2 diabetes.',
      plan: '1. CHF: increase furosemide to 40 mg BID x5 days then reassess; daily weights; low-sodium diet; call for >3 lb gain. 2. Continue GDMT (carvedilol, sacubitril/valsartan); monitor K/Cr closely given CKD. 3. AFib: continue apixaban 2.5 mg BID (renal-dosed). 4. DM: continue glargine; monitor. 5. RTC 2 weeks; labs prior.',
    },
  ],
};

export const getNotes = (patientId: string): SoapNote[] => PATIENT_NOTES[patientId] ?? [];
