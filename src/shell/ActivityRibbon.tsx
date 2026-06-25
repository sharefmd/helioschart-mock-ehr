import { useNavigate } from 'react-router-dom';
import {
  LayoutGrid, FileSearch, Stethoscope, ClipboardList, Pill, FlaskRound,
  Activity, PhoneCall, Mail, GraduationCap, CheckSquare, Syringe, Camera, ListChecks,
} from 'lucide-react';
import { useEhr } from '../store/EhrStore';

export default function ActivityRibbon() {
  const { activePatientId, toast } = useEhr();
  const nav = useNavigate();
  const go = (t: string) => () => nav(`/chart/${activePatientId}/${t}`);

  const acts: { icon: typeof LayoutGrid; label: string; run: () => void; sep?: boolean }[] = [
    { icon: LayoutGrid, label: 'Snapshot', run: go('snapshot') },
    { icon: FileSearch, label: 'Chart Review', run: go('chart-review') },
    { icon: Activity, label: 'Synopsis', run: go('summary') },
    { icon: Stethoscope, label: 'Rooming', run: () => toast('Rooming activity — vitals entry not built.', 'info'), sep: true },
    { icon: ClipboardList, label: 'Order Entry', run: go('orders') },
    { icon: Pill, label: 'Meds', run: go('meds') },
    { icon: FlaskRound, label: 'Results', run: go('results') },
    { icon: Activity, label: 'Flowsheets', run: go('flowsheets'), sep: true },
    { icon: CheckSquare, label: 'Note Writer', run: go('notes') },
    { icon: Syringe, label: 'Immunize', run: go('immunizations') },
    { icon: Mail, label: 'Letters', run: go('letters') },
    { icon: PhoneCall, label: 'Telephone', run: () => toast('Telephony module not connected.', 'info') },
    { icon: GraduationCap, label: 'Pt Education', run: () => toast('Patient education handouts not loaded.', 'info') },
    { icon: Camera, label: 'Media', run: go('media'), sep: true },
    { icon: ListChecks, label: 'Wrap-Up', run: () => toast('Wrap-Up: review charges, level of service, follow-up.', 'info') },
  ];

  return (
    <div className="ribbon">
      {acts.map((a) => {
        const Icon = a.icon;
        return (
          <div key={a.label} style={{ display: 'flex' }}>
            {a.sep && <div className="rsep" />}
            <div className="act" onClick={a.run} title={a.label}>
              <Icon className="ico" size={16} />
              <span>{a.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
