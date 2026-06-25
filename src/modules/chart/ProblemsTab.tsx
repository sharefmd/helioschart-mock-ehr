import { useState } from 'react';
import { useEhr } from '../../store/EhrStore';
import { Pill } from '../../components/StatusPill';
import KebabMenu from '../../components/KebabMenu';
import Modal from '../../components/Modal';
import { ICD_PICKER } from '../../data/clinical';
import type { Problem } from '../../types';

let pSeq = 50;

export default function ProblemsTab() {
  const { problems, dispatch, toast } = useEhr();
  const [show, setShow] = useState<'active' | 'all'>('active');
  const [addOpen, setAddOpen] = useState(false);
  const [pick, setPick] = useState(ICD_PICKER[0]);
  const [status, setStatus] = useState<Problem['status']>('Active');

  const rows = problems.filter((p) => (show === 'active' ? p.status !== 'Resolved' : true));

  const addProblem = () => {
    const m = pick.match(/^(.*)\s\(([^)]+)\)$/);
    dispatch({ t: 'addProblem', problem: {
      id: `np${pSeq++}`,
      name: m ? m[1] : pick,
      icd10: m ? m[2] : '—',
      status,
      onsetDate: '2026-06-23',
    }});
    toast(`Added problem: ${m ? m[1] : pick}.`, 'ok');
    setAddOpen(false);
  };

  return (
    <div className="panel">
      <div className="toolbar">
        <button className="btn-xs btn-primary" onClick={() => setAddOpen(true)}>+ Add Problem</button>
        <button className="btn-xs" onClick={() => toast('Problem list reconciled — no conflicts.', 'ok')}>Reconcile</button>
        <span className="spacer" />
        <label>Show:</label>
        <select value={show} onChange={(e) => setShow(e.target.value as 'active' | 'all')}>
          <option value="active">Active only</option><option value="all">All</option>
        </select>
        <span className="xsmall muted">{rows.length} shown</span>
      </div>
      <table className="dense">
        <thead>
          <tr><th>Problem</th><th style={{ width: 80 }}>ICD-10</th><th style={{ width: 90 }}>Status</th><th style={{ width: 100 }}>Onset</th><th style={{ width: 120 }}>Last Addressed</th><th style={{ width: 30 }} /></tr>
        </thead>
        <tbody>
          {rows.map((pr) => (
            <tr key={pr.id}>
              <td className="bold">{pr.name}</td>
              <td>{pr.icd10}</td>
              <td><Pill tone={pr.status === 'Resolved' ? 'mute' : 'info'}>{pr.status}</Pill></td>
              <td>{pr.onsetDate}</td>
              <td className="muted">2026-06-23</td>
              <td><KebabMenu actions={[
                { label: 'Address in note', onClick: () => toast(`"${pr.name}" — open the Notes tab to document.`, 'info') },
                { label: 'Mark resolved', onClick: () => toast(`Marked "${pr.name}" resolved (demo).`, 'ok') },
                { label: 'Set chronic', onClick: () => toast('Updated (demo).', 'ok') },
              ]} /></td>
            </tr>
          ))}
        </tbody>
      </table>

      {addOpen && (
        <Modal title="Add Problem" onClose={() => setAddOpen(false)} width={440}
          footer={<>
            <button onClick={() => setAddOpen(false)}>Cancel</button>
            <button className="btn-sign" onClick={addProblem}>Add to Problem List</button>
          </>}>
          <div className="form-grid">
            <label className="req">Diagnosis</label>
            <select value={pick} onChange={(e) => setPick(e.target.value)}>
              {ICD_PICKER.map((d) => <option key={d}>{d}</option>)}
            </select>
            <label className="req">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as Problem['status'])}>
              <option>Active</option><option>Chronic</option><option>Resolved</option>
            </select>
          </div>
          <p className="xsmall muted mt8">Adding a problem here does not link it to the note or to billing — those are separate steps in separate tabs.</p>
        </Modal>
      )}
    </div>
  );
}
