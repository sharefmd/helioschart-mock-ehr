import { useState } from 'react';
import {
  Syringe, ShieldCheck, FileText, Camera, History, Eye, Printer, Plus,
} from 'lucide-react';
import { useEhr } from '../../store/EhrStore';
import { getPatient } from '../../data/patient';
import { getNotes } from '../../data/notes';
import { Pill } from '../../components/StatusPill';
import KebabMenu from '../../components/KebabMenu';

function Panel({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="panel">
      <div className="panel-head"><span>{title}</span>{action}</div>
      <div className="panel-body">{children}</div>
    </div>
  );
}

/* ----------------------------------------------------------- SNAPSHOT */
export function SnapshotTab() {
  const s = useEhr();
  const p = getPatient(s.activePatientId)!;
  return (
    <div className="grid-3 stack8" style={{ display: 'grid' }}>
      <Panel title="Demographics">
        <div className="kv">
          <dt>Age/Sex</dt><dd>{p.age} / {p.sex}</dd>
          <dt>DOB</dt><dd>{p.dob}</dd>
          <dt>MRN</dt><dd>{p.mrn}</dd>
          <dt>PCP</dt><dd>{p.pcp}</dd>
          <dt>Pharmacy</dt><dd>{p.pharmacy}</dd>
        </div>
      </Panel>
      <Panel title="Allergies"><ul className="small">{p.allergies.length ? p.allergies.map((a) => <li key={a.substance} className="bold" style={{ color: 'var(--danger)' }}>⚠ {a.substance} — {a.reaction}</li>) : <li className="muted">NKDA</li>}</ul></Panel>
      <Panel title="Vitals">
        <div className="kv">{p.vitals.map((v) => <div key={v.label} style={{ display: 'contents' }}><dt>{v.label}</dt><dd className={v.flag === 'H' ? 'flag-h' : v.flag === 'L' ? 'flag-l' : ''}>{v.value}</dd></div>)}</div>
      </Panel>
      <Panel title="Problems"><ul className="small">{s.problems.map((pr) => <li key={pr.id}>• {pr.name} <span className="muted">({pr.icd10})</span></li>)}</ul></Panel>
      <Panel title="Active Meds"><ul className="small">{s.meds.filter((m) => m.status === 'active').map((m) => <li key={m.id}>• {m.name} {m.dose} {m.frequency}</li>)}</ul></Panel>
      <Panel title="Recent Results"><ul className="small">{s.results.slice(0, 5).map((r) => <li key={r.id}>• {r.name}: <b>{r.value} {r.unit}</b> {r.flag === 'H' && <span className="flag-h">H</span>}{r.flag === 'L' && <span className="flag-l">L</span>}</li>)}</ul></Panel>
    </div>
  );
}

/* ----------------------------------------------------------- CHART REVIEW (with sub-tabs) */
const CR_SUBS = ['Encounters', 'Notes', 'Labs', 'Imaging', 'Meds'] as const;
export function ChartReviewTab() {
  const s = useEhr();
  const [sub, setSub] = useState<typeof CR_SUBS[number]>('Encounters');
  const notes = getNotes(s.activePatientId);

  return (
    <div className="stack8">
      <div className="toolbar">
        <input type="search" placeholder="Filter chart review…" style={{ width: 200 }} />
        <label>From:</label><input type="date" defaultValue="2024-01-01" />
        <label>To:</label><input type="date" defaultValue="2026-06-23" />
        <span className="spacer" />
        <button className="btn-xs" onClick={() => s.toast('Filters applied.', 'info')}>Apply</button>
        <button className="btn-xs" onClick={() => s.toast('Printed chart review.', 'info')}><Printer size={10} /> Print</button>
      </div>
      <div className="tabstrip" style={{ padding: '4px 6px 0' }}>
        {CR_SUBS.map((t) => <div key={t} className={sub === t ? 'tab active' : 'tab'} onClick={() => setSub(t)}>{t}</div>)}
      </div>
      <div className="panel">
        {sub === 'Encounters' && (
          <table className="dense"><thead><tr><th>Date</th><th>Type</th><th>Provider</th><th>Dept</th><th /></tr></thead><tbody>
            {[['2026-06-23', 'Office Visit', 'Okafor, James MD', 'Clinic A'], ['2026-03-19', 'Telephone', 'Reyes, Carla RN', 'Clinic A'], ['2025-12-11', 'Office Visit', 'Okafor, James MD', 'Clinic A'], ['2025-06-30', 'Annual Physical', 'Okafor, James MD', 'Clinic A']].map((r, i) => (
              <tr key={i} className="clickable" onClick={() => s.toast(`Opening ${r[1]} ${r[0]}…`, 'info')}><td>{r[0]}</td><td className="link">{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td><td><KebabMenu actions={[{ label: 'Open', onClick: () => s.toast('Opening encounter…', 'info') }]} /></td></tr>
            ))}
          </tbody></table>
        )}
        {sub === 'Notes' && (
          <table className="dense"><thead><tr><th>Date</th><th>Type</th><th>Author</th><th>Status</th></tr></thead><tbody>
            {notes.map((n) => <tr key={n.id} className="clickable" onClick={() => s.toast(`Open "${n.type}" in Notes tab.`, 'info')}><td>{n.date}</td><td className="link">{n.type}</td><td>{n.author}</td><td><Pill tone="ok">Signed</Pill></td></tr>)}
          </tbody></table>
        )}
        {sub === 'Labs' && (
          <table className="dense"><thead><tr><th>Test</th><th>Value</th><th>Flag</th><th>Collected</th></tr></thead><tbody>
            {s.results.map((r) => <tr key={r.id}><td>{r.name}</td><td className="bold">{r.value} {r.unit}</td><td>{r.flag === 'H' ? <span className="flag-h">H</span> : r.flag === 'L' ? <span className="flag-l">L</span> : <span className="muted">—</span>}</td><td>{r.collected}</td></tr>)}
          </tbody></table>
        )}
        {sub === 'Imaging' && (
          <table className="dense"><thead><tr><th>Date</th><th>Study</th><th>Status</th></tr></thead><tbody>
            <tr><td>2025-11-02</td><td className="link">Renal US</td><td><Pill tone="ok">Final</Pill></td></tr>
            <tr><td>2024-08-14</td><td className="link">CXR PA/Lat</td><td><Pill tone="ok">Final</Pill></td></tr>
          </tbody></table>
        )}
        {sub === 'Meds' && (
          <table className="dense"><thead><tr><th>Medication</th><th>Sig</th><th>Status</th></tr></thead><tbody>
            {s.meds.map((m) => <tr key={m.id}><td className="bold">{m.name} {m.dose}</td><td>{m.route} {m.frequency}</td><td><Pill tone={m.status === 'active' ? 'ok' : 'mute'}>{m.status}</Pill></td></tr>)}
          </tbody></table>
        )}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------- FLOWSHEETS */
export function FlowsheetsTab() {
  const s = useEhr();
  const p = getPatient(s.activePatientId)!;
  const cols = ['2025-12-11', '2026-03-19', '2026-06-23'];
  const find = (lbl: string) => p.vitals.find((v) => v.label === lbl)?.value ?? '—';
  const rows = [
    ['BP (mmHg)', '150/88', '151/89', find('BP')],
    ['HR (bpm)', '72', '—', find('HR')],
    ['Temp (°F)', '98.4', '—', find('Temp')],
    ['Weight (lb)', '190', '189', find('Wt')],
    ['BMI', '31.7', '31.6', find('BMI')],
    ['SpO2 (%)', '98', '—', find('SpO2')],
    ['Pain (0–10)', '0', '2', '1'],
  ];
  return (
    <Panel title="Vitals Flowsheet" action={<button className="btn-xs" onClick={() => s.toast('Add reading — not built.', 'info')}><Plus size={10} /> Add Column</button>}>
      <table className="dense"><thead><tr><th>Measure</th>{cols.map((c) => <th key={c}>{c}</th>)}</tr></thead>
        <tbody>{rows.map((r) => <tr key={r[0]}><td className="bold">{r[0]}</td>{r.slice(1).map((v, i) => <td key={i}>{v}</td>)}</tr>)}</tbody>
      </table>
      <p className="xsmall muted mt8">Filed flowsheet rows: 1,204 (showing 7). Template: Adult Ambulatory Vitals.</p>
    </Panel>
  );
}

/* ----------------------------------------------------------- HISTORY */
export function HistoryTab() {
  const s = useEhr();
  return (
    <div className="grid-2 stack8" style={{ display: 'grid' }}>
      <Panel title="Past Medical History"><ul className="small">{s.problems.map((p) => <li key={p.id}>• {p.name} <span className="muted">since {p.onsetDate}</span></li>)}</ul></Panel>
      <Panel title="Past Surgical History"><ul className="small"><li>• Appendectomy (1989)</li><li>• Cholecystectomy (2011)</li><li className="muted">— Reviewed 2026-06-23 —</li></ul></Panel>
      <Panel title="Family History"><ul className="small"><li>• Father — CAD, MI at 60</li><li>• Mother — Type 2 diabetes</li><li>• Sibling — Hypertension</li></ul></Panel>
      <Panel title="Social History"><div className="kv"><dt>Tobacco</dt><dd>Never</dd><dt>Alcohol</dt><dd>Occasional</dd><dt>Occupation</dt><dd>Retired teacher</dd><dt>Exercise</dt><dd>Walks 2x/week</dd></div></Panel>
    </div>
  );
}

/* ----------------------------------------------------------- IMMUNIZATIONS */
export function ImmunizationsTab() {
  const { toast } = useEhr();
  const rows = [
    ['Influenza (IIV4)', '2025-10-14', 'Administered', 'ok'],
    ['COVID-19 (2025–26)', '2025-09-30', 'Administered', 'ok'],
    ['Tdap', '2019-05-02', 'Administered', 'ok'],
    ['Pneumococcal (PCV20)', '—', 'Due', 'warn'],
    ['Shingles (RZV) #2', '—', 'Overdue', 'danger'],
  ] as const;
  return (
    <Panel title="Immunizations" action={<button className="btn-xs btn-primary" onClick={() => toast('Administer vaccine — order from Orders › Procedures.', 'info')}><Syringe size={10} /> Administer</button>}>
      <table className="dense"><thead><tr><th>Vaccine</th><th>Last Given</th><th>Status</th><th /></tr></thead><tbody>
        {rows.map((r) => <tr key={r[0]}><td className="bold">{r[0]}</td><td>{r[1]}</td><td><Pill tone={r[3]}>{r[2]}</Pill></td><td><KebabMenu actions={[{ label: 'History', onClick: () => toast('Vaccine history (demo).', 'info') }, { label: 'Record external', onClick: () => toast('Recorded external dose.', 'ok') }]} /></td></tr>)}
      </tbody></table>
    </Panel>
  );
}

/* ----------------------------------------------------------- ALLERGIES */
export function AllergiesTab() {
  const s = useEhr();
  const p = getPatient(s.activePatientId)!;
  return (
    <Panel title="Allergies & Intolerances" action={<button className="btn-xs btn-primary" onClick={() => s.toast('Add allergy — not built in demo.', 'info')}><Plus size={10} /> Add</button>}>
      {p.allergies.length === 0
        ? <div className="alert alert-ok"><ShieldCheck size={13} /> No Known Drug Allergies (NKDA)</div>
        : <table className="dense"><thead><tr><th>Allergen</th><th>Reaction</th><th>Severity</th><th>Noted</th><th /></tr></thead><tbody>
            {p.allergies.map((a) => <tr key={a.substance}><td className="bold" style={{ color: 'var(--danger)' }}>{a.substance}</td><td>{a.reaction}</td><td><Pill tone={a.severity === 'High' ? 'danger' : a.severity === 'Moderate' ? 'warn' : 'mute'}>{a.severity}</Pill></td><td className="muted">2020-01-01</td><td><KebabMenu actions={[{ label: 'Edit', onClick: () => s.toast('Edit allergy (demo).', 'info') }, { label: 'Mark entered-in-error', onClick: () => s.toast('Flagged.', 'warn') }]} /></td></tr>)}
          </tbody></table>}
      <p className="xsmall muted mt8">Allergy review status: <b>Reviewed this encounter</b>.</p>
    </Panel>
  );
}

/* ----------------------------------------------------------- HEALTH MAINTENANCE */
export function HealthMaintenanceTab() {
  const { toast } = useEhr();
  const rows = [
    ['Colorectal cancer screening', 'Due 2026-08', 'warn'],
    ['Diabetic eye exam', 'Overdue (14 mo)', 'danger'],
    ['Diabetic foot exam', 'Due now', 'warn'],
    ['Nephropathy screening (urine ACR)', 'Due now', 'warn'],
    ['Pneumococcal vaccine', 'Overdue', 'danger'],
    ['Mammogram', 'Up to date (2026-02)', 'ok'],
    ['Bone density (DEXA)', 'Due 2027', 'mute'],
    ['BP control < 140/90', 'Not met', 'warn'],
  ] as const;
  return (
    <Panel title="Health Maintenance / Preventive Care">
      <table className="dense"><thead><tr><th>Topic</th><th style={{ width: 180 }}>Status</th><th style={{ width: 160 }} /></tr></thead><tbody>
        {rows.map((r) => <tr key={r[0]}><td className="bold">{r[0]}</td><td><Pill tone={r[2]}>{r[1]}</Pill></td><td>{r[2] !== 'ok' && r[2] !== 'mute' && <><button className="btn-xs" onClick={() => toast(`Ordered to satisfy: ${r[0]}.`, 'ok')}>Order</button> <button className="btn-xs" onClick={() => toast('Marked not applicable.', 'info')}>N/A</button></>}</td></tr>)}
      </tbody></table>
    </Panel>
  );
}

/* ----------------------------------------------------------- DEMOGRAPHICS */
export function DemographicsTab() {
  const s = useEhr();
  const p = getPatient(s.activePatientId)!;
  return (
    <div className="grid-2 stack8" style={{ display: 'grid' }}>
      <Panel title="Patient Information" action={<button className="btn-xs" onClick={() => s.toast('Edit demographics — front-desk role required.', 'warn')}>Edit</button>}>
        <div className="kv">
          <dt>Legal Name</dt><dd>{p.name}</dd>
          <dt>Preferred</dt><dd>{p.name.split(',')[1]?.trim()}</dd>
          <dt>DOB</dt><dd>{p.dob} ({p.age} yo)</dd>
          <dt>Sex</dt><dd>{p.sex}</dd>
          <dt>MRN</dt><dd>{p.mrn}</dd>
          <dt>SSN</dt><dd>•••-••-{p.mrn.slice(-4)}</dd>
          <dt>Language</dt><dd>English</dd>
          <dt>Race/Ethnicity</dt><dd>Declined</dd>
        </div>
      </Panel>
      <Panel title="Contact & Address">
        <div className="kv">
          <dt>Home Phone</dt><dd>(555) 014-{p.mrn.slice(-4)}</dd>
          <dt>Mobile</dt><dd>(555) 770-{p.mrn.slice(-4)}</dd>
          <dt>Email</dt><dd>patient{p.mrn.slice(-3)}@example.com</dd>
          <dt>Address</dt><dd>418 Maple Street, Springfield</dd>
          <dt>Emergency</dt><dd>Spouse — (555) 992-1145</dd>
          <dt>Portal</dt><dd><Pill tone="ok">Active</Pill></dd>
        </div>
      </Panel>
    </div>
  );
}

/* ----------------------------------------------------------- COVERAGE */
export function CoverageTab() {
  const s = useEhr();
  const p = getPatient(s.activePatientId)!;
  return (
    <Panel title="Coverage & Insurance" action={<button className="btn-xs" onClick={() => s.toast('Eligibility check not available in demo.', 'info')}>Verify Eligibility</button>}>
      <table className="dense"><thead><tr><th>Priority</th><th>Payer / Plan</th><th>Subscriber ID</th><th>Group</th><th>Status</th></tr></thead><tbody>
        <tr><td>Primary</td><td className="bold">{p.insurance}</td><td>XEH{p.mrn.slice(-6)}</td><td>GRP-4471</td><td><Pill tone="ok">Active</Pill></td></tr>
        <tr><td>Secondary</td><td>Self-pay</td><td>—</td><td>—</td><td><Pill tone="mute">Inactive</Pill></td></tr>
      </tbody></table>
      <div className="grid-2 mt8">
        <div className="box" style={{ padding: 8 }}><div className="bold mb4">Copay</div><div className="kv"><dt>Office Visit</dt><dd>$25</dd><dt>Specialist</dt><dd>$45</dd><dt>Deductible met</dt><dd>$680 / $1,500</dd></div></div>
        <div className="box" style={{ padding: 8 }}><div className="bold mb4">Authorizations</div><div className="small muted">No active prior authorizations on file. 1 pending (Empagliflozin).</div></div>
      </div>
    </Panel>
  );
}

/* ----------------------------------------------------------- LETTERS */
export function LettersTab() {
  const { toast } = useEhr();
  const rows = [
    ['2026-06-23', 'Visit Summary', 'Patient', 'Draft', 'pend'],
    ['2026-06-18', 'Referral letter — Nephrology', 'Mercy Nephrology', 'Draft', 'pend'],
    ['2026-03-19', 'Work/School excuse', 'Patient', 'Sent', 'ok'],
    ['2025-12-11', 'Results letter (normal)', 'Patient', 'Sent', 'ok'],
  ] as const;
  return (
    <Panel title="Letters & Correspondence" action={<button className="btn-xs btn-primary" onClick={() => toast('New letter — template picker not built.', 'info')}><FileText size={10} /> New Letter</button>}>
      <table className="dense"><thead><tr><th>Date</th><th>Letter</th><th>Recipient</th><th>Status</th><th style={{ width: 150 }} /></tr></thead><tbody>
        {rows.map((r, i) => <tr key={i}><td>{r[0]}</td><td className="link bold">{r[1]}</td><td>{r[2]}</td><td><Pill tone={r[4]}>{r[3]}</Pill></td><td><button className="btn-xs" onClick={() => toast('Printed.', 'info')}><Printer size={10} /> Print</button> <button className="btn-xs" onClick={() => toast('Faxed.', 'ok')}>Fax</button></td></tr>)}
      </tbody></table>
    </Panel>
  );
}

/* ----------------------------------------------------------- MEDIA */
export function MediaTab() {
  const { toast } = useEhr();
  const items = ['ID card (front)', 'ID card (back)', 'Insurance card', 'Home BP log (scan)', 'Outside EKG', 'Consent form'];
  return (
    <Panel title="Scanned Media & Images" action={<button className="btn-xs btn-primary" onClick={() => toast('Scan/upload — not built in demo.', 'info')}><Camera size={10} /> Capture</button>}>
      <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
        {items.map((it) => (
          <div key={it} className="box clickable" style={{ width: 120, padding: 6, cursor: 'pointer' }} onClick={() => toast(`Opening "${it}"…`, 'info')}>
            <div className="center" style={{ height: 70, background: '#dfe6ec', border: '1px solid var(--grid)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Camera size={22} className="muted" /></div>
            <div className="xsmall mt4">{it}</div>
            <div className="xsmall muted">2026-06-23</div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* ----------------------------------------------------------- AUDIT TRAIL */
export function AuditTab() {
  const s = useEhr();
  const rows = [
    ['2026-06-23 09:25', 'Okafor, James MD', 'Opened chart', 'Workstation CLINIC-A-04'],
    ['2026-06-23 09:24', 'Reyes, Carla RN', 'Filed vitals', 'Workstation CLINIC-A-RM4'],
    ['2026-06-22 14:02', 'System (HL7)', 'Result filed: A1c', 'Interface QUEST-IN'],
    ['2026-06-20 15:30', 'Reyes, Carla RN', 'Created telephone note', 'Workstation CLINIC-A-02'],
    ['2026-06-15 11:20', 'System (HL7)', 'Result filed: Renal US', 'Interface RAD-IN'],
  ];
  return (
    <Panel title="Access & Audit Log" action={<span className="row gap4 muted xsmall"><History size={11} /> Last 30 days</span>}>
      <table className="dense"><thead><tr><th>Timestamp</th><th>User</th><th>Action</th><th>Source</th><th /></tr></thead><tbody>
        {rows.map((r, i) => <tr key={i}><td className="nowrap">{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td className="muted">{r[3]}</td><td><Eye size={12} className="link" onClick={() => s.toast('Audit detail (demo).', 'info')} /></td></tr>)}
      </tbody></table>
      <p className="xsmall muted mt8">This chart has been accessed 41 times in the last 30 days by 6 users.</p>
    </Panel>
  );
}
