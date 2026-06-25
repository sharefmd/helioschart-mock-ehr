import { AlertTriangle } from 'lucide-react';
import type { Patient } from '../types';

export default function PatientBanner({ patient }: { patient: Patient }) {
  const seg = (lbl: string, val: React.ReactNode) => (
    <div className="seg"><span className="lbl">{lbl}</span><span className="val">{val}</span></div>
  );
  return (
    <div className="pt-banner">
      <span className="pt-name">{patient.name}</span>
      {seg('Age / Sex', `${patient.age} / ${patient.sex[0]}`)}
      {seg('DOB', patient.dob)}
      {seg('MRN', patient.mrn)}
      <div className="vline" />
      <div className="seg">
        <span className="lbl">Allergies</span>
        <span className="val allergy">
          <AlertTriangle size={10} style={{ verticalAlign: -1 }} />{' '}
          {patient.allergies.map((a) => `${a.substance} (${a.reaction})`).join(', ')}
        </span>
      </div>
      <div className="vline" />
      {seg('PCP', patient.pcp)}
      {seg('Insurance', patient.insurance)}
      {seg('Pharmacy', patient.pharmacy)}
      <div className="vline" />
      <div className="seg">
        <span className="lbl">Risk Flags</span>
        <span className="val">
          {patient.riskFlags.map((f) => (
            <span key={f} className="pill pill-warn" style={{ marginRight: 3 }}>{f}</span>
          ))}
        </span>
      </div>
    </div>
  );
}
