import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEhr } from '../../store/EhrStore';
import { Pill } from '../../components/StatusPill';
import KebabMenu from '../../components/KebabMenu';
import Modal from '../../components/Modal';

/* Lighter-weight but fully clickable tabs that reinforce the dense, fragmented
   feel of an enterprise chart. Several now have real local interactions. */

function Toolbar({ children }: { children: React.ReactNode }) {
  return <div className="toolbar">{children}</div>;
}

export function ImagingTab() {
  const { toast, activePatientId } = useEhr();
  const nav = useNavigate();
  const rows = [
    { d: '2025-11-02', s: 'Renal US', r: 'No hydronephrosis. Cortical thinning, c/w CKD.', st: 'Final' },
    { d: '2024-08-14', s: 'CXR PA/Lat', r: 'No acute cardiopulmonary process.', st: 'Final' },
    { d: '2023-05-09', s: 'Echocardiogram', r: 'EF 60%. Mild LVH. Diastolic dysfunction grade I.', st: 'Final' },
  ];
  return (
    <div className="panel">
      <Toolbar>
        <button className="btn-xs btn-primary" onClick={() => { toast('Opening Orders → Imaging sub-tab.', 'info'); nav(`/chart/${activePatientId}/orders`); }}>+ Order Imaging</button>
        <span className="spacer" /><label>Modality:</label>
        <select defaultValue="all"><option value="all">All</option><option>US</option><option>XR</option><option>CT</option></select>
      </Toolbar>
      <table className="dense">
        <thead><tr><th style={{ width: 100 }}>Date</th><th style={{ width: 160 }}>Study</th><th>Impression</th><th style={{ width: 70 }}>Status</th><th style={{ width: 30 }} /></tr></thead>
        <tbody>{rows.map((r) => (
          <tr key={r.d} className="clickable" onClick={() => toast(`${r.s}: ${r.r}`, 'info')}>
            <td>{r.d}</td><td className="link bold">{r.s}</td><td className="muted">{r.r}</td><td><Pill tone="ok">{r.st}</Pill></td>
            <td><KebabMenu actions={[{ label: 'View report', onClick: () => toast(r.r, 'info') }, { label: 'Compare prior', onClick: () => toast('No comparable prior.', 'warn') }]} /></td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

export function ChartDocsTab() {
  const nav = useNavigate();
  return (
    <div className="panel">
      <div className="panel-body">
        <p className="small">Chart-level documents are managed in the global <span className="link" onClick={() => nav('/documents')}>Documents module</span>.</p>
        <p className="xsmall muted mt8">(In a real EHR this is yet another place to look — chart docs vs. media vs. the documents inbox vs. scanned forms.)</p>
        <button className="btn-xs btn-primary mt8" onClick={() => nav('/documents')}>Open Documents Module →</button>
      </div>
    </div>
  );
}

interface Msg { f: string; t: string; d: string; new: boolean; }
export function MessagesTab() {
  const { toast } = useEhr();
  const [msgs, setMsgs] = useState<Msg[]>([
    { f: 'Reyes, Carla RN', t: 'Rooming note', d: '09:18', new: true },
    { f: 'Pharmacy (Walgreens)', t: 'Metformin refill request', d: '07:41', new: true },
    { f: 'Thompson, Maria (Portal)', t: 'Question about blood pressure', d: 'Yesterday', new: false },
  ]);
  const [compose, setCompose] = useState(false);
  const [to, setTo] = useState('Reyes, Carla RN');
  const [subj, setSubj] = useState('');

  return (
    <div className="panel">
      <Toolbar>
        <button className="btn-xs btn-primary" onClick={() => { setSubj(''); setCompose(true); }}>+ New Message</button>
        <span className="spacer" /><span className="xsmall muted">Also visible in Inbox → Patient / Staff Messages</span>
      </Toolbar>
      <table className="dense">
        <thead><tr><th style={{ width: 200 }}>From / To</th><th>Subject</th><th style={{ width: 90 }}>When</th><th style={{ width: 120 }} /></tr></thead>
        <tbody>{msgs.map((r, i) => (
          <tr key={i}>
            <td className={r.new ? 'bold' : ''}>{r.f}</td><td>{r.t}</td><td className="muted">{r.d}</td>
            <td><button className="btn-xs" onClick={() => toast(`Replied to ${r.f}.`, 'ok')}>Reply</button> <button className="btn-xs" onClick={() => toast('Routed.', 'ok')}>Route</button></td>
          </tr>
        ))}</tbody>
      </table>

      {compose && (
        <Modal title="New Message" onClose={() => setCompose(false)} width={480}
          footer={<>
            <button onClick={() => setCompose(false)}>Cancel</button>
            <button className="btn-primary" disabled={!subj.trim()} onClick={() => { setMsgs((m) => [{ f: `To: ${to}`, t: subj, d: 'now', new: false }, ...m]); toast(`Message sent to ${to}.`, 'ok'); setCompose(false); }}>Send</button>
          </>}>
          <div className="form-grid">
            <label className="req">To</label>
            <select value={to} onChange={(e) => setTo(e.target.value)}>
              <option>Reyes, Carla RN</option><option>Front Desk</option><option>Pharmacy (Walgreens)</option><option>Patient (Portal)</option>
            </select>
            <label className="req">Subject</label>
            <input type="text" value={subj} onChange={(e) => setSubj(e.target.value)} placeholder="Subject…" />
          </div>
        </Modal>
      )}
    </div>
  );
}

interface Ref { to: string; reason: string; st: 'Draft' | 'Open' | 'Sent'; }
export function ReferralsTab() {
  const { toast } = useEhr();
  const [rows, setRows] = useState<Ref[]>([
    { to: 'Nephrology', reason: 'CKD stage 2, rising albuminuria', st: 'Draft' },
    { to: 'Ophthalmology', reason: 'Diabetic eye exam (care gap)', st: 'Open' },
  ]);
  const [open, setOpen] = useState(false);
  const [to, setTo] = useState('Nephrology');
  const [reason, setReason] = useState('');

  return (
    <div className="panel">
      <Toolbar>
        <button className="btn-xs btn-primary" onClick={() => { setReason(''); setOpen(true); }}>+ New Referral</button>
        <span className="spacer" /><label>Status:</label>
        <select defaultValue="all"><option value="all">All</option><option>Open</option><option>Completed</option></select>
      </Toolbar>
      <table className="dense">
        <thead><tr><th style={{ width: 200 }}>Referred To</th><th>Reason</th><th style={{ width: 80 }}>Status</th><th style={{ width: 150 }} /></tr></thead>
        <tbody>{rows.map((r, i) => (
          <tr key={i}>
            <td className="bold">{r.to}</td><td className="muted">{r.reason}</td>
            <td><Pill tone={r.st === 'Sent' ? 'ok' : r.st === 'Draft' ? 'mute' : 'warn'}>{r.st}</Pill></td>
            <td>{r.st !== 'Sent' && <button className="btn-xs btn-sign" onClick={() => { setRows((rs) => rs.map((x, j) => (j === i ? { ...x, st: 'Sent' } : x))); toast(`Referral to ${r.to} signed & faxed.`, 'ok'); }}>Sign &amp; Send</button>}</td>
          </tr>
        ))}</tbody>
      </table>

      {open && (
        <Modal title="New Referral" onClose={() => setOpen(false)} width={460}
          footer={<>
            <button onClick={() => setOpen(false)}>Cancel</button>
            <button className="btn-sign" disabled={!reason.trim()} onClick={() => { setRows((rs) => [...rs, { to, reason, st: 'Draft' }]); toast(`Referral to ${to} created (draft).`, 'ok'); setOpen(false); }}>Create Referral</button>
          </>}>
          <div className="form-grid">
            <label className="req">Specialty</label>
            <select value={to} onChange={(e) => setTo(e.target.value)}>
              <option>Nephrology</option><option>Cardiology</option><option>Ophthalmology</option><option>Endocrinology</option><option>Registered Dietitian</option>
            </select>
            <label className="req">Reason</label>
            <textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason for referral…" style={{ gridColumn: '2 / -1' }} />
          </div>
          <p className="xsmall muted mt8">Referrals are also orderable from Orders → Referrals — yet another place doing the same thing.</p>
        </Modal>
      )}
    </div>
  );
}

export function CareGapsTab() {
  const { toast } = useEhr();
  const init = [
    { g: 'Diabetic retinal eye exam', due: 'Overdue (14 mo)', tone: 'danger' as const },
    { g: 'Nephropathy screening — urine ACR', due: 'Due now', tone: 'warn' as const },
    { g: 'Pneumococcal vaccination', due: 'Overdue', tone: 'danger' as const },
    { g: 'BP control < 140/90', due: 'Not met (152/88)', tone: 'warn' as const },
    { g: 'Statin therapy (ASCVD)', due: 'Met', tone: 'ok' as const },
  ];
  const [gaps, setGaps] = useState(init);
  return (
    <div className="panel">
      <div className="panel-head">Quality Measures &amp; Care Gaps</div>
      <table className="dense">
        <thead><tr><th>Measure</th><th style={{ width: 160 }}>Status</th><th style={{ width: 200 }} /></tr></thead>
        <tbody>{gaps.map((g, i) => (
          <tr key={i}>
            <td className="bold">{g.g}</td><td><Pill tone={g.tone}>{g.due}</Pill></td>
            <td>{g.tone !== 'ok' && <>
              <button className="btn-xs" onClick={() => { setGaps((gs) => gs.map((x, j) => (j === i ? { ...x, due: 'Addressed', tone: 'ok' } : x))); toast(`Order placed to close gap: ${g.g}.`, 'ok'); }}>Address</button>{' '}
              <button className="btn-xs" onClick={() => toast('Gap deferred.', 'info')}>Defer</button>
            </>}</td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}
