import type { FormularyItem, LabCatalogItem } from '../types';

// --- Searchable medication formulary (Orders > Meds) ---
export const FORMULARY: FormularyItem[] = [
  { id: 'f1', name: 'Ramipril (Altace)', commonDoses: ['1.25 mg', '2.5 mg', '5 mg', '10 mg'], defaultRoute: 'PO', defaultFreq: 'Daily', class: 'ACE Inhibitor' },
  { id: 'f2', name: 'Lisinopril (Prinivil)', commonDoses: ['5 mg', '10 mg', '20 mg', '40 mg'], defaultRoute: 'PO', defaultFreq: 'Daily', class: 'ACE Inhibitor' },
  { id: 'f3', name: 'Amlodipine (Norvasc)', commonDoses: ['2.5 mg', '5 mg', '10 mg'], defaultRoute: 'PO', defaultFreq: 'Daily', class: 'Calcium Channel Blocker' },
  { id: 'f4', name: 'Losartan (Cozaar)', commonDoses: ['25 mg', '50 mg', '100 mg'], defaultRoute: 'PO', defaultFreq: 'Daily', class: 'ARB' },
  { id: 'f5', name: 'Hydrochlorothiazide', commonDoses: ['12.5 mg', '25 mg'], defaultRoute: 'PO', defaultFreq: 'Daily', class: 'Thiazide Diuretic' },
  { id: 'f6', name: 'Metoprolol succinate', commonDoses: ['25 mg', '50 mg', '100 mg'], defaultRoute: 'PO', defaultFreq: 'Daily', class: 'Beta Blocker' },
  { id: 'f7', name: 'Empagliflozin (Jardiance)', commonDoses: ['10 mg', '25 mg'], defaultRoute: 'PO', defaultFreq: 'Daily', class: 'SGLT2 Inhibitor' },
  { id: 'f8', name: 'Ramipril/HCTZ (Altace HCT)', commonDoses: ['2.5/12.5 mg', '5/25 mg'], defaultRoute: 'PO', defaultFreq: 'Daily', class: 'ACE/Diuretic Combo' },
  { id: 'f9', name: 'Metformin', commonDoses: ['500 mg', '850 mg', '1000 mg'], defaultRoute: 'PO', defaultFreq: 'BID', class: 'Biguanide' },
  { id: 'f10', name: 'Atorvastatin (Lipitor)', commonDoses: ['10 mg', '20 mg', '40 mg', '80 mg'], defaultRoute: 'PO', defaultFreq: 'QHS', class: 'Statin' },
  { id: 'f11', name: 'Furosemide (Lasix)', commonDoses: ['20 mg', '40 mg', '80 mg'], defaultRoute: 'PO', defaultFreq: 'Daily', class: 'Loop Diuretic' },
];

// --- Searchable lab catalog (Orders > Labs) ---
const LBL = ['Today', 'In 1–2 weeks', 'In 4 weeks', 'In 3 months'];
export const LAB_CATALOG: LabCatalogItem[] = [
  { id: 'l1', name: 'Basic Metabolic Panel (BMP)', specimen: 'Serum', commonIntervals: ['Today', 'In 1 week', 'In 1–2 weeks', 'In 4 weeks'], aliases: ['bmp', 'chem 7', 'basic metabolic'] },
  { id: 'l2', name: 'Comprehensive Metabolic Panel (CMP)', specimen: 'Serum', commonIntervals: LBL, aliases: ['cmp', 'comprehensive metabolic', 'chem 14'] },
  { id: 'l3', name: 'Hemoglobin A1c (HbA1c)', specimen: 'Whole Blood', commonIntervals: ['Today', 'In 3 months'], aliases: ['a1c', 'hba1c', 'glycohemoglobin', 'glucose control'] },
  { id: 'l4', name: 'Lipid Panel', specimen: 'Serum', commonIntervals: ['Today', 'In 3 months'], aliases: ['lipids', 'cholesterol', 'ldl', 'hdl', 'triglycerides'] },
  { id: 'l5', name: 'Urine Albumin/Creatinine Ratio', specimen: 'Urine', commonIntervals: ['Today', 'In 1–2 weeks'], aliases: ['acr', 'uacr', 'microalbumin'] },
  { id: 'l6', name: 'Electrolyte Panel (Na/K/Cl/CO₂)', specimen: 'Serum', commonIntervals: ['Today', 'In 1–2 weeks'], aliases: ['lytes', 'electrolytes', 'na', 'k', 'sodium', 'potassium', 'chloride'] },
  { id: 'l7', name: 'Creatinine, serum', specimen: 'Serum', commonIntervals: ['Today', 'In 1–2 weeks', 'In 4 weeks'], aliases: ['creatinine', 'cr', 'renal function', 'egfr'] },
  { id: 'l8', name: 'Glucose, fasting', specimen: 'Serum', commonIntervals: ['Today'], aliases: ['glucose', 'fasting glucose', 'fbg', 'blood sugar'] },
  { id: 'l9', name: 'TSH', specimen: 'Serum', commonIntervals: ['Today', 'In 6 weeks'], aliases: ['tsh', 'thyroid', 'thyroid stimulating hormone'] },
  { id: 'l10', name: 'Free T4', specimen: 'Serum', commonIntervals: ['Today', 'In 6 weeks'], aliases: ['t4', 'free t4', 'thyroxine'] },
  { id: 'l11', name: 'CBC with Differential', specimen: 'Whole Blood', commonIntervals: ['Today', 'In 2 weeks'], aliases: ['cbc', 'complete blood count', 'differential', 'wbc', 'hemoglobin', 'platelets'] },
  { id: 'l12', name: 'Ferritin', specimen: 'Serum', commonIntervals: ['Today', 'In 6 weeks'], aliases: ['ferritin', 'iron stores'] },
  { id: 'l13', name: 'Iron + TIBC', specimen: 'Serum', commonIntervals: ['Today'], aliases: ['iron', 'tibc', 'iron panel', 'transferrin', 'iron saturation'] },
  { id: 'l14', name: 'Vitamin B12 (Cobalamin)', specimen: 'Serum', commonIntervals: ['Today'], aliases: ['b12', 'cobalamin', 'vitamin b12'] },
  { id: 'l15', name: 'Folate', specimen: 'Serum', commonIntervals: ['Today'], aliases: ['folate', 'folic acid'] },
  { id: 'l16', name: 'Hepatic Function Panel (LFTs)', specimen: 'Serum', commonIntervals: ['Today', 'In 1–2 weeks', 'In 4 weeks'], aliases: ['lft', 'lfts', 'liver', 'hepatic', 'ast', 'alt', 'bilirubin', 'alk phos'] },
  { id: 'l17', name: 'Creatine Kinase (CK)', specimen: 'Serum', commonIntervals: ['Today', 'In 1–2 weeks'], aliases: ['ck', 'cpk', 'creatine kinase', 'muscle'] },
  { id: 'l18', name: 'Magnesium', specimen: 'Serum', commonIntervals: ['Today', 'In 1–2 weeks'], aliases: ['mag', 'magnesium', 'mg'] },
  { id: 'l19', name: 'Phosphorus', specimen: 'Serum', commonIntervals: ['Today'], aliases: ['phos', 'phosphate', 'phosphorus'] },
  { id: 'l20', name: 'Calcium', specimen: 'Serum', commonIntervals: ['Today'], aliases: ['calcium', 'ca'] },
  { id: 'l21', name: 'Uric Acid', specimen: 'Serum', commonIntervals: ['Today'], aliases: ['uric acid', 'urate', 'gout'] },
  { id: 'l22', name: 'Vitamin D, 25-OH', specimen: 'Serum', commonIntervals: ['Today'], aliases: ['vitamin d', 'vit d', '25-oh', '25 hydroxy'] },
  { id: 'l23', name: 'hs-CRP', specimen: 'Serum', commonIntervals: ['Today'], aliases: ['crp', 'c-reactive', 'inflammation'] },
  { id: 'l24', name: 'ESR (Sed Rate)', specimen: 'Whole Blood', commonIntervals: ['Today'], aliases: ['esr', 'sed rate', 'sedimentation'] },
  { id: 'l25', name: 'PT / INR', specimen: 'Plasma', commonIntervals: ['Today', 'In 1 week'], aliases: ['inr', 'pt', 'protime', 'coag', 'warfarin'] },
  { id: 'l26', name: 'Urinalysis (UA)', specimen: 'Urine', commonIntervals: ['Today'], aliases: ['ua', 'urinalysis', 'urine'] },
  { id: 'l27', name: 'NT-proBNP', specimen: 'Serum', commonIntervals: ['Today'], aliases: ['bnp', 'natriuretic', 'heart failure'] },
  { id: 'l28', name: 'Basic Metabolic Panel + Magnesium', specimen: 'Serum', commonIntervals: ['Today', 'In 1–2 weeks'], aliases: ['bmp mag'] },
];

// --- Imaging catalog (Orders > Imaging) ---
export const IMAGING_CATALOG: LabCatalogItem[] = [
  { id: 'im1', name: 'Chest X-ray (PA/Lateral)', specimen: 'Radiology', commonIntervals: ['Today', 'This week'] },
  { id: 'im2', name: 'Renal Ultrasound', specimen: 'Radiology', commonIntervals: ['This week', 'Within 30 days'] },
  { id: 'im3', name: 'Echocardiogram (TTE)', specimen: 'Cardiology', commonIntervals: ['Within 2 weeks', 'Within 30 days'] },
  { id: 'im4', name: 'CT Abdomen/Pelvis w/ contrast', specimen: 'Radiology', commonIntervals: ['Today', 'This week'] },
  { id: 'im5', name: 'DEXA Bone Density', specimen: 'Radiology', commonIntervals: ['Within 30 days'] },
];

// --- Referral catalog (Orders > Referrals) ---
export const REFERRAL_CATALOG: LabCatalogItem[] = [
  { id: 're1', name: 'Nephrology', specimen: 'Specialist', commonIntervals: ['Routine', 'Urgent'] },
  { id: 're2', name: 'Cardiology', specimen: 'Specialist', commonIntervals: ['Routine', 'Urgent'] },
  { id: 're3', name: 'Ophthalmology (Diabetic Eye Exam)', specimen: 'Specialist', commonIntervals: ['Routine'] },
  { id: 're4', name: 'Endocrinology', specimen: 'Specialist', commonIntervals: ['Routine'] },
  { id: 're5', name: 'Registered Dietitian', specimen: 'Ancillary', commonIntervals: ['Routine'] },
];

// --- Procedure catalog (Orders > Procedures) ---
export const PROCEDURE_CATALOG: LabCatalogItem[] = [
  { id: 'pr1', name: 'EKG, 12-lead', specimen: 'In-office', commonIntervals: ['Today'] },
  { id: 'pr2', name: 'Pneumococcal vaccine (PCV20)', specimen: 'In-office', commonIntervals: ['Today'] },
  { id: 'pr3', name: 'Influenza vaccine', specimen: 'In-office', commonIntervals: ['Today'] },
  { id: 'pr4', name: 'Spirometry', specimen: 'In-office', commonIntervals: ['Today', 'This week'] },
];

export const PHARMACIES = [
  'Walgreens #4821 — 220 Main St',
  'CVS #1180 — 45 Oak Ave',
  'Costco Pharmacy — Northgate',
  'Mail Order — OptumRx',
];

export const ICD_PICKER = [
  'Essential hypertension (I10)',
  'Type 2 diabetes mellitus (E11.9)',
  'Type 2 diabetes w/ CKD (E11.22)',
  'Chronic kidney disease, stage 2 (N18.2)',
  'Chronic kidney disease, stage 3 (N18.3)',
  'Hyperlipidemia (E78.5)',
  'Atrial fibrillation (I48.91)',
  'Hypothyroidism (E03.9)',
  'Obstructive sleep apnea (G47.33)',
  'Generalized anxiety disorder (F41.1)',
  'GERD (K21.9)',
  'Osteoarthritis, knee (M17.0)',
];
