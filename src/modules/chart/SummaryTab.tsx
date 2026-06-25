import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, Info, ShieldAlert, RefreshCw, Maximize2, Lock, Star,
} from 'lucide-react';
import { useEhr } from '../../store/EhrStore';
import { getPatient } from '../../data/patient';
import { Pill } from '../../components/StatusPill';
import KebabMenu from '../../components/KebabMenu';

// Intentionally dense, noisy "summary" — the kind of overstuffed overview real
// EHRs throw at you, full of extra info nobody asked for. Masonry of mini-panels.
function P({ title, children, stamp, tone }: { title: string; children: React.ReactNode; stamp?: string; tone?: 'warn' | 'danger' }) {
  return (
    <div className="panel" style={{ breakInside: 'avoid', marginBottom: 7, borderTopColor: tone === 'danger' ? 'var(--danger)' : tone === 'warn' ? 'var(--warn)' : undefined, borderTopWidth: tone ? 2 : 1 }}>
      <div className="panel-head" style={{ padding: '2px 6px' }}>
        <span className="row gap4"><Star size={9} className="muted" />{title}</span>
        <span className="row gap4">
          <Maximize2 size={9} className="muted" />
          <KebabMenu size={11} actions={[{ label: 'Refresh', onClick: () => {} }, { label: 'Move to top', onClick: () => {} }, { label: 'Hide section', onClick: () => {} }, { label: 'Properties…', sep: true, onClick: () => {} }]} />
        </span>
      </div>
      <div className="panel-body" style={{ padding: '5px 6px' }}>
        {children}
        {stamp && <div className="xsmall muted" style={{ marginTop: 4, borderTop: '1px dotted var(--border-light)', paddingTop: 2 }}>{stamp}</div>}
      </div>
    </div>
  );
}

const KV = ({ rows }: { rows: [string, React.ReactNode][] }) => (
  <div className="kv" style={{ fontSize: 'var(--fs-xs)' }}>
    {rows.map(([k, v], i) => <div key={i} style={{ display: 'contents' }}><dt>{k}</dt><dd>{v}</dd></div>)}
  </div>
);

export default function SummaryTab() {
  const s = useEhr();
  const nav = useNavigate();
  const p = getPatient(s.activePatientId)!;
  const id = s.activePatientId;
  const unrev = s.results.filter((r) => !r.reviewed).length;

  return (
    <div>
      {/* Stacked Best Practice Advisories — the wall of pop-up nags, inline */}
      <div className="stack8" style={{ marginBottom: 7 }}>
        <div className="alert alert-danger"><ShieldAlert size={13} /><span className="grow"><b>BPA:</b> Pneumococcal vaccine OVERDUE for patient ≥65. Order PCV20? </span><button className="btn-xs" onClick={() => s.toast('BPA acknowledged.', 'info')}>Acknowledge</button><button className="btn-xs" onClick={() => nav(`/chart/${id}/orders`)}>Order</button></div>
        <div className="alert alert-warn"><AlertTriangle size={13} /><span className="grow"><b>BPA:</b> Diabetic eye exam not on file in 12 months. </span><button className="btn-xs" onClick={() => s.toast('Deferred.', 'info')}>Defer</button><button className="btn-xs" onClick={() => nav(`/chart/${id}/referrals`)}>Refer</button></div>
        <div className="alert alert-warn"><AlertTriangle size={13} /><span className="grow"><b>BPA:</b> BP above goal (≥140/90) at last 2 visits. Consider intensification.</span><button className="btn-xs" onClick={() => s.toast('Acknowledged with reason.', 'info')}>Acknowledge</button></div>
        <div className="alert alert-info"><Info size={13} /><span className="grow"><b>Reminder:</b> Allergies, medications, and problem list require review this encounter. </span><button className="btn-xs" onClick={() => s.toast('Marked all reviewed.', 'ok')}>Mark Reviewed</button></div>
      </div>

      {/* sub toolbar */}
      <div className="toolbar" style={{ marginBottom: 7 }}>
        <span className="bold small">Summary</span>
        <select defaultValue="prov"><option value="prov">Provider view</option><option>Nursing view</option><option>Specialist view</option><option>Hospitalist view</option></select>
        <span className="sep" />
        <button className="btn-xs" onClick={() => s.toast('Layout reset to default.', 'info')}>Reset Layout</button>
        <button className="btn-xs" onClick={() => s.toast('All sections refreshed.', 'info')}><RefreshCw size={10} /> Refresh All</button>
        <span className="spacer" />
        <span className="xsmall muted">Last refreshed 09:25:11 · {unrev} results pending · 7 BPAs (4 shown)</span>
      </div>

      {/* masonry of mini-panels */}
      <div style={{ columnWidth: 250, columnGap: 7 }}>
        <P title="Problem List" stamp="Last reviewed: 2025-12-11 by Okafor, J MD">
          <table className="dense" style={{ fontSize: 'var(--fs-xs)' }}><tbody>
            {s.problems.map((pr) => <tr key={pr.id}><td className="bold">{pr.name}</td><td>{pr.icd10}</td><td><Pill tone="info">{pr.status}</Pill></td></tr>)}
          </tbody></table>
          <div className="xsmall link mt4" onClick={() => nav(`/chart/${id}/problems`)}>Manage problem list →</div>
        </P>

        <P title="Allergies" tone="danger" stamp="Reconciled this encounter">
          {p.allergies.map((a) => <div key={a.substance} className="small bold" style={{ color: 'var(--danger)' }}>⚠ {a.substance} — {a.reaction} ({a.severity})</div>)}
          {p.allergies.length === 0 && <div className="muted small">NKDA</div>}
        </P>

        <P title="Medications" stamp="Last reconciled: 2025-12-11">
          {s.meds.filter((m) => m.status === 'active').map((m) => <div key={m.id} className="xsmall">• <b>{m.name}</b> {m.dose} {m.route} {m.frequency}</div>)}
          <div className="xsmall muted mt4">Active: {s.meds.filter((m) => m.status === 'active').length} · Discontinued: {s.meds.filter((m) => m.status !== 'active').length} · Pended: 0</div>
        </P>

        <P title="Vitals (latest)" stamp="Filed 09:24 by Reyes, C RN">
          <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
            {p.vitals.map((v) => <span key={v.label} className="xsmall"><span className="muted">{v.label}</span> <b className={v.flag === 'H' ? 'flag-h' : v.flag === 'L' ? 'flag-l' : ''}>{v.value}</b></span>)}
          </div>
        </P>

        <P title="Recent Results" tone="warn" stamp={`${unrev} unreviewed`}>
          <table className="dense" style={{ fontSize: 'var(--fs-xs)' }}><tbody>
            {s.results.slice(0, 5).map((r) => <tr key={r.id}><td>{r.name}</td><td className="bold">{r.value}{r.unit && ` ${r.unit}`}</td><td>{r.flag === 'H' && <span className="flag-h">H</span>}{r.flag === 'L' && <span className="flag-l">L</span>}</td></tr>)}
          </tbody></table>
          <div className="xsmall link mt4" onClick={() => nav(`/chart/${id}/results`)}>All results →</div>
        </P>

        <P title="Care Gaps" tone="warn">
          <div className="xsmall"><Pill tone="danger">OVERDUE</Pill> Pneumococcal vaccine</div>
          <div className="xsmall"><Pill tone="warn">DUE</Pill> Diabetic eye exam</div>
          <div className="xsmall"><Pill tone="warn">DUE</Pill> Urine ACR recheck</div>
          <div className="xsmall"><Pill tone="ok">MET</Pill> Statin therapy</div>
        </P>

        <P title="Health Maintenance" stamp="Auto-calculated nightly">
          <KV rows={[['Colorectal', <Pill tone="warn">Due 08/26</Pill>], ['Mammogram', <Pill tone="ok">Current</Pill>], ['DEXA', <Pill tone="mute">2027</Pill>], ['Foot exam', <Pill tone="warn">Due</Pill>]]} />
        </P>

        <P title="Immunizations Due">
          <div className="xsmall">• PCV20 — <span className="flag-h">overdue</span></div>
          <div className="xsmall">• Shingrix #2 — <span className="flag-h">overdue</span></div>
          <div className="xsmall">• Influenza — current (2025-10)</div>
          <div className="xsmall link mt4" onClick={() => nav(`/chart/${id}/immunizations`)}>Immunization record →</div>
        </P>

        <P title="Care Team">
          <KV rows={[['PCP', p.pcp], ['Cardiology', 'Hahn, M MD'], ['Nephrology', '— unassigned —'], ['RN', 'Reyes, Carla'], ['MA', 'Tran, Bao'], ['Care Mgr', 'Ellis, D LCSW']]} />
        </P>

        <P title="Coverage / Eligibility" stamp="Eligibility last checked: 2026-06-01">
          <KV rows={[['Primary', p.insurance], ['Copay', '$25'], ['Deductible', '$680 / $1,500'], ['Auth pending', '1 (Empagliflozin)']]} />
          <div className="xsmall link mt4" onClick={() => nav(`/chart/${id}/coverage`)}>Coverage details →</div>
        </P>

        <P title="Account / Balance" tone="warn">
          <KV rows={[['Statement balance', <b style={{ color: 'var(--danger)' }}>$142.50</b>], ['Copay due today', '$25.00'], ['Last payment', '$50 on 2026-04-02'], ['In collections', 'No']]} />
          <button className="btn-xs mt4" onClick={() => s.toast('Collect copay — POS not connected.', 'info')}>Collect Copay</button>
        </P>

        <P title="Recent Encounters">
          <div className="xsmall">• 2026-06-23 Office Visit (this)</div>
          <div className="xsmall">• 2026-03-19 Telephone</div>
          <div className="xsmall">• 2025-12-11 Office Visit</div>
          <div className="xsmall link mt4" onClick={() => nav(`/chart/${id}/chart-review`)}>Chart review →</div>
        </P>

        <P title="Upcoming Appointments">
          <div className="xsmall muted">No future appointments scheduled.</div>
          <button className="btn-xs mt4" onClick={() => s.toast('Open scheduling grid — front desk.', 'info')}>Schedule</button>
        </P>

        <P title="Risk & Quality Scores" stamp="Model run: 2026-06-21">
          <KV rows={[['HCC RAF', '1.284'], ['Readmit risk', <Pill tone="warn">0.42 (Med)</Pill>], ['Fall risk (Morse)', '45 — Moderate'], ['ED visits (12mo)', '1'], ['Cost percentile', '78th']]} />
        </P>

        <P title="Smart Data Elements">
          <KV rows={[['Smoking status asked', 'Yes'], ['AUA/alcohol screen', 'Yes — negative'], ['Depression (PHQ-2)', '1 (neg)'], ['Advance directive', 'On file'], ['Code status', 'Full code'], ['Interpreter needed', 'No']]} />
        </P>

        <P title="Social Determinants (SDOH)" stamp="Screened 2025-12-11">
          <KV rows={[['Food insecurity', 'No'], ['Housing', 'Stable'], ['Transportation', 'No barrier'], ['Financial strain', 'Some'], ['Social isolation', 'Low']]} />
        </P>

        <P title="Goals">
          <div className="xsmall">• A1c &lt; 7.0% (current 7.4%)</div>
          <div className="xsmall">• BP &lt; 130/80</div>
          <div className="xsmall">• Walk 30 min, 5x/week</div>
        </P>

        <P title="Documents / Forms Pending" tone="warn">
          <div className="xsmall">• FMLA — signature needed</div>
          <div className="xsmall">• Home BP log — to review</div>
          <div className="xsmall link mt4" onClick={() => nav('/documents')}>Documents →</div>
        </P>

        <P title="Patient Portal (MyChart)" stamp="Last login: 2026-06-21 19:14">
          <KV rows={[['Status', <Pill tone="ok">Active</Pill>], ['Unread msgs', '1'], ['Proxy access', 'Spouse'], ['Preferred contact', 'Mornings'], ['eVisit eligible', 'Yes']]} />
        </P>

        <P title="Synopsis Note" stamp="Free-text, not part of legal record">
          <div className="xsmall" style={{ fontStyle: 'italic' }}>"Pleasant, adherent. Prefers to avoid adding meds if possible. Daughter usually attends visits."</div>
          <div className="row gap4 mt4"><Lock size={9} className="muted" /><span className="xsmall muted">Provider-private</span></div>
        </P>
      </div>

      <p className="xsmall muted mt8" style={{ borderTop: '1px solid var(--border-light)', paddingTop: 4 }}>
        Showing 20 of 34 available summary sections · <span className="link" onClick={() => s.toast('Section chooser not built in demo.', 'info')}>Add/remove sections</span> · <span className="link" onClick={() => s.toast('Layout saved.', 'ok')}>Save layout</span> · Report SmartForm v9.4
      </p>
    </div>
  );
}
