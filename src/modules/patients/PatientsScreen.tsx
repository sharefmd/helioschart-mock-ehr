import { useNavigate } from 'react-router-dom';
import { Search, Users } from 'lucide-react';
import { PATIENTS } from '../../data/patient';
import { useEhr } from '../../store/EhrStore';

export default function PatientsScreen() {
  const nav = useNavigate();
  const { dispatch, toast } = useEhr();
  return (
    <>
      <div className="toolbar">
        <Search size={13} />
        <input type="search" placeholder="Search by name or MRN…" style={{ width: 240 }} />
        <button className="btn-xs" onClick={() => toast('Search executed.', 'info')}>Search</button>
        <span className="spacer" />
        <button className="btn-xs btn-primary" onClick={() => toast('Register new patient (demo).', 'info')}>+ Register Patient</button>
      </div>
      <div className="content-scroll">
        <div className="panel">
          <div className="panel-head"><Users size={13} /> Recent Patients</div>
          <table className="dense">
            <thead><tr><th>Name</th><th style={{ width: 110 }}>MRN</th><th style={{ width: 90 }}>DOB</th><th style={{ width: 60 }}>Age</th><th>PCP</th><th style={{ width: 90 }} /></tr></thead>
            <tbody>
              {PATIENTS.map((p) => (
                <tr key={p.id} className="clickable" onClick={() => { dispatch({ t: 'selectPatient', id: p.id }); nav(`/chart/${p.id}/summary`); }}>
                  <td className="link bold">{p.name}</td>
                  <td>{p.mrn}</td>
                  <td>{p.dob}</td>
                  <td>{p.age}</td>
                  <td>{p.pcp}</td>
                  <td><button className="btn-xs" onClick={(e) => { e.stopPropagation(); dispatch({ t: 'selectPatient', id: p.id }); nav(`/chart/${p.id}/summary`); }}>Open Chart</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="xsmall muted mt8">Demo includes one patient. Click to open the chart.</p>
      </div>
    </>
  );
}
