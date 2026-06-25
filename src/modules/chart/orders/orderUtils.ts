import type { OrderWarning } from '../../../types';

let orderSeq = 500;
export const nextOrderId = () => `o${orderSeq++}`;

// Fake clinical decision support. Deterministic from the drug name so the demo
// always shows the same (illustrative, not real) warnings.
export function computeMedWarnings(drugName: string): OrderWarning[] {
  const n = drugName.toLowerCase();
  const w: OrderWarning[] = [];

  // Allergy check (patient is PCN-allergic). Most BP meds are fine -> "info: no conflict".
  if (n.includes('penicillin') || n.includes('amoxicillin') || n.includes('augmentin')) {
    w.push({ kind: 'allergy', severity: 'High', text: 'Patient has a documented PENICILLIN allergy (rash). Do not prescribe.', overridable: false });
  } else {
    w.push({ kind: 'allergy', severity: 'Info', text: 'No conflict with documented allergies (Penicillin — rash).', overridable: false });
  }

  // ACE inhibitors -> renal dosing / monitoring note (Maria has CKD).
  if (n.includes('ramipril') || n.includes('lisinopril') || n.includes('losartan') || n.includes('altace')) {
    w.push({ kind: 'renal', severity: 'Moderate', text: 'Renal: eGFR 72 (CKD stage 2). Recheck BMP (K/Cr) in 1–2 weeks after ACE/ARB initiation.', overridable: true });
  }

  // Duplicate therapy: lisinopril is on the discontinued list -> duplicate-class flag.
  if (n.includes('ramipril') || n.includes('lisinopril') || n.includes('altace')) {
    w.push({ kind: 'duplicate', severity: 'Moderate', text: 'Duplicate therapy: ACE Inhibitor (Lisinopril) on record (discontinued 2018). Verify intent.', overridable: true });
  }

  // Interaction: metformin + ACE -> low-grade info.
  if (n.includes('ramipril') || n.includes('lisinopril') || n.includes('altace')) {
    w.push({ kind: 'interaction', severity: 'Info', text: 'Interaction: ACE inhibitor + metformin — monitor renal function; no action required.', overridable: false });
  }

  return w;
}
