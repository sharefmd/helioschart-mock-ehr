import type { Patient, Medication, LabResult } from '../types';

// A PatientChart bundles demographics with the clinical data used to seed the
// per-patient encounter state in the store.
export interface PatientChart extends Patient {
  seedMeds: Medication[];
  seedResults: LabResult[];
}

const r = (
  id: string, name: string, value: string, unit: string, refRange: string,
  flag: LabResult['flag'], collected: string, trend: number[],
): LabResult => ({
  id, name, value, unit, refRange, flag, collected, reviewed: false,
  trend: trend.map((v, i) => ({ date: ['2025-06', '2025-12', '2026-06'][i] ?? `t${i}`, value: v })),
});

const med = (
  id: string, name: string, dose: string, frequency: string,
  status: Medication['status'] = 'active', startedDate = '2022-01-01', route = 'PO',
): Medication => ({ id, name, dose, route, frequency, status, startedDate, orderedFrom: 'history' });

export const PATIENTS: PatientChart[] = [
  // ---------------------------------------------------------------- MARIA (demo star)
  {
    id: 'FT-483920', name: 'Thompson, Maria', age: 67, dob: '1959-04-12', sex: 'Female', mrn: 'FT-483920',
    pcp: 'Okafor, James MD', insurance: 'Medicare Part B + AARP Suppl. (BCBS)', pharmacy: 'Walgreens #4821 — 220 Main St',
    riskFlags: ['CKD', 'Fall Risk', 'HCC: DM w/ complication'],
    allergies: [{ substance: 'Penicillin', reaction: 'Rash', severity: 'Moderate' }],
    problems: [
      { id: 'p1', name: 'Essential hypertension', icd10: 'I10', status: 'Active', onsetDate: '2014-06-02' },
      { id: 'p2', name: 'Type 2 diabetes mellitus', icd10: 'E11.9', status: 'Active', onsetDate: '2016-09-18' },
      { id: 'p3', name: 'Chronic kidney disease, stage 2', icd10: 'N18.2', status: 'Chronic', onsetDate: '2020-02-11' },
      { id: 'p4', name: 'Hyperlipidemia', icd10: 'E78.5', status: 'Active', onsetDate: '2015-03-27' },
    ],
    vitals: [
      { label: 'BP', value: '152 / 88', flag: 'H', date: '2026-06-23' },
      { label: 'HR', value: '74', date: '2026-06-23' },
      { label: 'Temp', value: '98.2 °F', date: '2026-06-23' },
      { label: 'Wt', value: '188 lb', date: '2026-06-23' },
      { label: 'BMI', value: '31.4', flag: 'H', date: '2026-06-23' },
      { label: 'SpO2', value: '97%', date: '2026-06-23' },
    ],
    seedMeds: [
      med('m1', 'Metformin', '500 mg', 'BID', 'active', '2016-09-18'),
      med('m2', 'Atorvastatin', '20 mg', 'Daily', 'active', '2015-03-27'),
      med('m3', 'Lisinopril', '10 mg', 'Daily', 'discontinued', '2018-01-10'),
    ],
    seedResults: [
      r('r1', 'Hemoglobin A1c', '7.4', '%', '4.0–5.6', 'H', '2026-06-10', [7.1, 7.3, 7.4]),
      r('r2', 'eGFR', '72', 'mL/min/1.73', '>60', 'normal', '2026-06-10', [78, 75, 72]),
      r('r3', 'Potassium', '4.4', 'mmol/L', '3.5–5.1', 'normal', '2026-06-10', [4.2, 4.3, 4.4]),
      r('r4', 'Creatinine', '1.1', 'mg/dL', '0.6–1.1', 'normal', '2026-06-10', [1.0, 1.05, 1.1]),
      r('r5', 'Urine Albumin/Creatinine', '38', 'mg/g', '<30', 'H', '2026-06-10', [22, 31, 38]),
      r('r6', 'LDL Cholesterol', '96', 'mg/dL', '<100', 'normal', '2026-06-10', [118, 104, 96]),
    ],
  },

  // ---------------------------------------------------------------- ALVAREZ
  {
    id: 'GT-100201', name: 'Alvarez, Robert', age: 77, dob: '1948-11-02', sex: 'Male', mrn: 'GT-100201',
    pcp: 'Okafor, James MD', insurance: 'Medicare Part B', pharmacy: 'CVS #1180 — 45 Oak Ave',
    riskFlags: ['Fall Risk', 'CAD'],
    allergies: [{ substance: 'Sulfa drugs', reaction: 'Hives', severity: 'Moderate' }],
    problems: [
      { id: 'p1', name: 'Coronary artery disease', icd10: 'I25.10', status: 'Chronic', onsetDate: '2011-04-15' },
      { id: 'p2', name: 'Essential hypertension', icd10: 'I10', status: 'Active', onsetDate: '2009-02-01' },
      { id: 'p3', name: 'Osteoarthritis, knee', icd10: 'M17.0', status: 'Active', onsetDate: '2018-07-22' },
    ],
    vitals: [
      { label: 'BP', value: '128 / 76', date: '2026-06-23' }, { label: 'HR', value: '66', date: '2026-06-23' },
      { label: 'Wt', value: '174 lb', date: '2026-06-23' }, { label: 'SpO2', value: '96%', date: '2026-06-23' },
    ],
    seedMeds: [
      med('m1', 'Aspirin', '81 mg', 'Daily', 'active', '2011-04-20'),
      med('m2', 'Metoprolol succinate', '50 mg', 'Daily', 'active', '2011-04-20'),
      med('m3', 'Rosuvastatin', '10 mg', 'QHS', 'active', '2012-03-01'),
    ],
    seedResults: [
      r('r1', 'LDL Cholesterol', '71', 'mg/dL', '<70', 'H', '2026-05-30', [88, 79, 71]),
      r('r2', 'Hemoglobin A1c', '5.5', '%', '4.0–5.6', 'normal', '2026-05-30', [5.6, 5.5, 5.5]),
      r('r3', 'Potassium', '4.1', 'mmol/L', '3.5–5.1', 'normal', '2026-05-30', [4.0, 4.2, 4.1]),
    ],
  },

  // ---------------------------------------------------------------- NGUYEN
  {
    id: 'GT-100455', name: 'Nguyen, Linh', age: 34, dob: '1991-07-19', sex: 'Female', mrn: 'GT-100455',
    pcp: 'Okafor, James MD', insurance: 'BCBS PPO', pharmacy: 'Walgreens #4821 — 220 Main St',
    riskFlags: [],
    allergies: [],
    problems: [
      { id: 'p1', name: 'Mild intermittent asthma', icd10: 'J45.20', status: 'Active', onsetDate: '2005-09-01' },
      { id: 'p2', name: 'Acute upper respiratory infection', icd10: 'J06.9', status: 'Active', onsetDate: '2026-06-20' },
    ],
    vitals: [
      { label: 'BP', value: '118 / 72', date: '2026-06-23' }, { label: 'HR', value: '88', date: '2026-06-23' },
      { label: 'Temp', value: '99.6 °F', flag: 'H', date: '2026-06-23' }, { label: 'SpO2', value: '98%', date: '2026-06-23' },
    ],
    seedMeds: [
      med('m1', 'Albuterol HFA', '90 mcg', 'PRN', 'active', '2005-09-01', 'INH'),
    ],
    seedResults: [
      r('r1', 'WBC', '11.2', 'K/uL', '4.0–11.0', 'H', '2026-06-21', [6.8, 7.2, 11.2]),
      r('r2', 'Rapid Strep', 'Negative', '', 'Neg', 'normal', '2026-06-21', [0, 0, 0]),
    ],
  },

  // ---------------------------------------------------------------- PATEL
  {
    id: 'GT-100789', name: 'Patel, Devang', age: 54, dob: '1972-01-30', sex: 'Male', mrn: 'GT-100789',
    pcp: 'Okafor, James MD', insurance: 'UnitedHealthcare', pharmacy: 'Costco Pharmacy — Northgate',
    riskFlags: ['OSA', 'Obesity'],
    allergies: [],
    problems: [
      { id: 'p1', name: 'Type 2 diabetes mellitus', icd10: 'E11.65', status: 'Active', onsetDate: '2013-11-04' },
      { id: 'p2', name: 'Obstructive sleep apnea', icd10: 'G47.33', status: 'Chronic', onsetDate: '2019-02-18' },
      { id: 'p3', name: 'Morbid obesity', icd10: 'E66.01', status: 'Active', onsetDate: '2010-01-01' },
    ],
    vitals: [
      { label: 'BP', value: '134 / 84', date: '2026-06-23' }, { label: 'HR', value: '78', date: '2026-06-23' },
      { label: 'Wt', value: '262 lb', flag: 'H', date: '2026-06-23' }, { label: 'BMI', value: '37.6', flag: 'H', date: '2026-06-23' },
    ],
    seedMeds: [
      med('m1', 'Metformin', '1000 mg', 'BID', 'active', '2013-11-04'),
      med('m2', 'Empagliflozin', '10 mg', 'Daily', 'active', '2021-06-15'),
      med('m3', 'Lisinopril', '20 mg', 'Daily', 'active', '2015-01-01'),
    ],
    seedResults: [
      r('r1', 'Hemoglobin A1c', '8.9', '%', '4.0–5.6', 'H', '2026-06-12', [8.1, 8.5, 8.9]),
      r('r2', 'eGFR', '88', 'mL/min/1.73', '>60', 'normal', '2026-06-12', [92, 90, 88]),
      r('r3', 'Triglycerides', '210', 'mg/dL', '<150', 'H', '2026-06-12', [180, 195, 210]),
    ],
  },

  // ---------------------------------------------------------------- WALSH
  {
    id: 'GT-100912', name: 'Walsh, Eleanor', age: 71, dob: '1955-03-08', sex: 'Female', mrn: 'GT-100912',
    pcp: 'Okafor, James MD', insurance: 'Medicare Advantage (Humana)', pharmacy: 'Mail Order — OptumRx',
    riskFlags: ['Anticoagulation', 'Fall Risk'],
    allergies: [{ substance: 'Codeine', reaction: 'Nausea', severity: 'Low' }],
    problems: [
      { id: 'p1', name: 'Atrial fibrillation', icd10: 'I48.91', status: 'Chronic', onsetDate: '2017-10-09' },
      { id: 'p2', name: 'Essential hypertension', icd10: 'I10', status: 'Active', onsetDate: '2008-05-01' },
      { id: 'p3', name: 'Hypothyroidism', icd10: 'E03.9', status: 'Chronic', onsetDate: '2002-01-01' },
    ],
    vitals: [
      { label: 'BP', value: '142 / 80', flag: 'H', date: '2026-06-23' }, { label: 'HR', value: '92', flag: 'H', date: '2026-06-23' },
      { label: 'Wt', value: '146 lb', date: '2026-06-23' }, { label: 'SpO2', value: '97%', date: '2026-06-23' },
    ],
    seedMeds: [
      med('m1', 'Apixaban', '5 mg', 'BID', 'active', '2017-10-12'),
      med('m2', 'Metoprolol tartrate', '25 mg', 'BID', 'active', '2017-10-12'),
      med('m3', 'Levothyroxine', '75 mcg', 'Daily', 'active', '2002-01-01'),
    ],
    seedResults: [
      r('r1', 'INR', '2.4', '', '2.0–3.0', 'normal', '2026-06-15', [2.1, 2.6, 2.4]),
      r('r2', 'TSH', '5.8', 'mIU/L', '0.4–4.0', 'H', '2026-06-15', [3.2, 4.5, 5.8]),
      r('r3', 'Potassium', '4.0', 'mmol/L', '3.5–5.1', 'normal', '2026-06-15', [4.2, 4.1, 4.0]),
    ],
  },

  // ---------------------------------------------------------------- BROOKS
  {
    id: 'GT-101044', name: 'Brooks, Terrence', age: 42, dob: '1983-12-14', sex: 'Male', mrn: 'GT-101044',
    pcp: 'Okafor, James MD', insurance: 'Aetna HMO', pharmacy: 'CVS #1180 — 45 Oak Ave',
    riskFlags: ['New Patient'],
    allergies: [],
    problems: [
      { id: 'p1', name: 'Essential hypertension', icd10: 'I10', status: 'Active', onsetDate: '2024-03-01' },
      { id: 'p2', name: 'Generalized anxiety disorder', icd10: 'F41.1', status: 'Active', onsetDate: '2021-06-01' },
    ],
    vitals: [
      { label: 'BP', value: '148 / 94', flag: 'H', date: '2026-06-23' }, { label: 'HR', value: '80', date: '2026-06-23' },
      { label: 'Wt', value: '205 lb', date: '2026-06-23' }, { label: 'BMI', value: '29.4', date: '2026-06-23' },
    ],
    seedMeds: [
      med('m1', 'Sertraline', '50 mg', 'Daily', 'active', '2021-06-01'),
    ],
    seedResults: [
      r('r1', 'Basic Metabolic Panel', 'See components', '', '—', 'normal', '2026-06-01', [0, 0, 0]),
      r('r2', 'Hemoglobin A1c', '5.9', '%', '4.0–5.6', 'H', '2026-06-01', [5.7, 5.8, 5.9]),
    ],
  },

  // ---------------------------------------------------------------- ROMERO
  {
    id: 'GT-101188', name: 'Romero, Gabriela', age: 25, dob: '2001-05-22', sex: 'Female', mrn: 'GT-101188',
    pcp: 'Okafor, James MD', insurance: 'BCBS PPO', pharmacy: 'Walgreens #4821 — 220 Main St',
    riskFlags: [],
    allergies: [{ substance: 'Latex', reaction: 'Contact dermatitis', severity: 'Low' }],
    problems: [
      { id: 'p1', name: 'Encounter for annual physical', icd10: 'Z00.00', status: 'Active', onsetDate: '2026-06-23' },
    ],
    vitals: [
      { label: 'BP', value: '110 / 68', date: '2026-06-23' }, { label: 'HR', value: '64', date: '2026-06-23' },
      { label: 'Wt', value: '138 lb', date: '2026-06-23' }, { label: 'BMI', value: '22.1', date: '2026-06-23' },
    ],
    seedMeds: [],
    seedResults: [
      r('r1', 'Lipid Panel', 'See components', '', '—', 'normal', '2026-06-23', [0, 0, 0]),
    ],
  },

  // ---------------------------------------------------------------- FISCHER
  {
    id: 'GT-101300', name: 'Fischer, Karl', age: 57, dob: '1968-09-09', sex: 'Male', mrn: 'GT-101300',
    pcp: 'Okafor, James MD', insurance: 'Cigna PPO', pharmacy: 'Costco Pharmacy — Northgate',
    riskFlags: [],
    allergies: [],
    problems: [
      { id: 'p1', name: 'Essential hypertension', icd10: 'I10', status: 'Active', onsetDate: '2019-01-01' },
      { id: 'p2', name: 'GERD', icd10: 'K21.9', status: 'Chronic', onsetDate: '2016-01-01' },
    ],
    vitals: [
      { label: 'BP', value: '150 / 92', flag: 'H', date: '2026-05-01' }, { label: 'HR', value: '76', date: '2026-05-01' },
    ],
    seedMeds: [
      med('m1', 'Amlodipine', '5 mg', 'Daily', 'active', '2019-01-01'),
      med('m2', 'Omeprazole', '20 mg', 'Daily', 'active', '2016-01-01'),
    ],
    seedResults: [
      r('r1', 'Basic Metabolic Panel', 'See components', '', '—', 'normal', '2026-04-30', [0, 0, 0]),
    ],
  },

  // ---------------------------------------------------------------- OSEI
  {
    id: 'GT-101455', name: 'Osei, Ama', age: 47, dob: '1979-02-17', sex: 'Female', mrn: 'GT-101455',
    pcp: 'Okafor, James MD', insurance: 'Kaiser', pharmacy: 'Walgreens #4821 — 220 Main St',
    riskFlags: ['Anemia'],
    allergies: [],
    problems: [
      { id: 'p1', name: 'Hypothyroidism', icd10: 'E03.9', status: 'Chronic', onsetDate: '2014-01-01' },
      { id: 'p2', name: 'Iron deficiency anemia', icd10: 'D50.9', status: 'Active', onsetDate: '2025-11-01' },
    ],
    vitals: [
      { label: 'BP', value: '116 / 70', date: '2026-06-23' }, { label: 'HR', value: '82', date: '2026-06-23' },
      { label: 'Wt', value: '151 lb', date: '2026-06-23' },
    ],
    seedMeds: [
      med('m1', 'Levothyroxine', '100 mcg', 'Daily', 'active', '2014-01-01'),
      med('m2', 'Ferrous sulfate', '325 mg', 'Daily', 'active', '2025-11-01'),
    ],
    seedResults: [
      r('r1', 'Hemoglobin', '10.8', 'g/dL', '12.0–15.5', 'L', '2026-06-08', [11.9, 11.2, 10.8]),
      r('r2', 'Ferritin', '14', 'ng/mL', '15–150', 'L', '2026-06-08', [22, 18, 14]),
      r('r3', 'TSH', '2.1', 'mIU/L', '0.4–4.0', 'normal', '2026-06-08', [2.4, 2.2, 2.1]),
    ],
  },

  // ---------------------------------------------------------------- DELGADO
  {
    id: 'GT-101677', name: 'Delgado, Hector', age: 81, dob: '1944-08-25', sex: 'Male', mrn: 'GT-101677',
    pcp: 'Okafor, James MD', insurance: 'Medicare Part B + Medicaid', pharmacy: 'Mail Order — OptumRx',
    riskFlags: ['CHF', 'CKD', 'Fall Risk', 'Polypharmacy'],
    allergies: [{ substance: 'Penicillin', reaction: 'Anaphylaxis', severity: 'High' }],
    problems: [
      { id: 'p1', name: 'Congestive heart failure (HFrEF)', icd10: 'I50.22', status: 'Chronic', onsetDate: '2020-03-01' },
      { id: 'p2', name: 'Atrial fibrillation', icd10: 'I48.91', status: 'Chronic', onsetDate: '2018-01-01' },
      { id: 'p3', name: 'Chronic kidney disease, stage 3', icd10: 'N18.3', status: 'Chronic', onsetDate: '2021-01-01' },
      { id: 'p4', name: 'Type 2 diabetes mellitus', icd10: 'E11.9', status: 'Active', onsetDate: '2005-01-01' },
    ],
    vitals: [
      { label: 'BP', value: '108 / 64', date: '2026-06-23' }, { label: 'HR', value: '70', date: '2026-06-23' },
      { label: 'Wt', value: '169 lb', flag: 'H', date: '2026-06-23' }, { label: 'SpO2', value: '94%', flag: 'L', date: '2026-06-23' },
    ],
    seedMeds: [
      med('m1', 'Furosemide', '40 mg', 'BID', 'active', '2020-03-01'),
      med('m2', 'Carvedilol', '12.5 mg', 'BID', 'active', '2020-03-01'),
      med('m3', 'Sacubitril/Valsartan', '49/51 mg', 'BID', 'active', '2021-05-01'),
      med('m4', 'Apixaban', '2.5 mg', 'BID', 'active', '2018-01-05'),
      med('m5', 'Insulin glargine', '20 units', 'QHS', 'active', '2010-01-01', 'SubQ'),
    ],
    seedResults: [
      r('r1', 'NT-proBNP', '1840', 'pg/mL', '<450', 'H', '2026-06-18', [980, 1320, 1840]),
      r('r2', 'eGFR', '41', 'mL/min/1.73', '>60', 'L', '2026-06-18', [52, 47, 41]),
      r('r3', 'Potassium', '5.0', 'mmol/L', '3.5–5.1', 'normal', '2026-06-18', [4.6, 4.8, 5.0]),
    ],
  },
];

export const MARIA = PATIENTS[0];
export const getPatient = (id: string): PatientChart | undefined =>
  PATIENTS.find((p) => p.id === id);
