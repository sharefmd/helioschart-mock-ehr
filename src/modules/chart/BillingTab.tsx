import { useState, useEffect } from 'react';
import { Receipt, BadgeCheck, Plus, Send, Info, Inbox, AlertTriangle } from 'lucide-react';
import { useEhr } from '../../store/EhrStore';
import { getPatient } from '../../data/patient';
import { Pill } from '../../components/StatusPill';
import KebabMenu from '../../components/KebabMenu';
import Modal from '../../components/Modal';
import type { ChargeLine, BillingClaim, ClaimEdit, ClaimEvent, ClaimStage } from '../../types';

type Tone = 'ok' | 'warn' | 'danger' | 'info' | 'pend' | 'mute';
const SUBS = ['Charges', 'Claims', 'Remittance', 'Denials', 'Statements', 'Eligibility', 'EDI Log'] as const;
type Sub = typeof SUBS[number];

const CPT_CATALOG: { cpt: string; desc: string; charge: number }[] = [
  { cpt: '99213', desc: 'Office visit, est, low', charge: 165 },
  { cpt: '99214', desc: 'Office visit, est, moderate', charge: 245 },
  { cpt: '99215', desc: 'Office visit, est, high', charge: 330 },
  { cpt: '99396', desc: 'Preventive visit, est 40–64', charge: 280 },
  { cpt: '93000', desc: 'Electrocardiogram, complete', charge: 52 },
  { cpt: '36415', desc: 'Venipuncture', charge: 18 },
  { cpt: '80048', desc: 'Basic metabolic panel', charge: 47 },
  { cpt: '85025', desc: 'CBC with differential', charge: 38 },
  { cpt: '70450', desc: 'CT head/brain w/o contrast', charge: 410 },
  { cpt: '71250', desc: 'CT chest w/o contrast', charge: 520 },
  { cpt: 'G0008', desc: 'Admin influenza vaccine', charge: 30 },
];
const AUTH_REQUIRED = ['70450', '71250', '72148'];
const PROC_CODES = ['93000', '36415', '80048', '85025', '70450', '71250', 'G0008'];

let cSeq = 1, clSeq = 1, evMin = 12 * 60 + 4;
const stamp = () => { const h = Math.floor(evMin / 60), m = evMin % 60; evMin += 3; return `2026-06-23 ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`; };
const ev = (text: string, tone: ClaimEvent['tone'] = 'info'): ClaimEvent => ({ ts: stamp(), text, tone });

function genEdits(charges: ChargeLine[]): ClaimEdit[] {
  const edits: ClaimEdit[] = [
    { id: 'e-elig', kind: 'eligibility', text: 'Eligibility not verified for date of service (270/271 required before submission).', resolved: false },
    { id: 'e-tax', kind: 'taxonomy', text: 'Payer edit: rendering provider taxonomy code missing.', resolved: false },
  ];
  const hasEM = charges.some((c) => /^9921/.test(c.cpt));
  const hasProc = charges.some((c) => PROC_CODES.includes(c.cpt));
  const hasMod25 = charges.some((c) => c.mod === '25');
  if (hasEM && hasProc && !hasMod25) edits.push({ id: 'e-mod25', kind: 'mod25', text: 'NCCI edit: E/M billed same day as a procedure without modifier 25.', resolved: false });
  if (charges.some((c) => c.dx === '—')) edits.push({ id: 'e-dx', kind: 'dxptr', text: 'Charge line(s) missing a diagnosis pointer — medical necessity not established.', resolved: false });
  if (charges.some((c) => AUTH_REQUIRED.includes(c.cpt))) edits.push({ id: 'e-auth', kind: 'auth', text: 'Prior authorization required for advanced imaging — no auth number on file.', resolved: false });
  return edits;
}

const EDIT_ACTION: Record<ClaimEdit['kind'], string> = {
  eligibility: 'Run 270/271', taxonomy: 'Add taxonomy', mod25: 'Append modifier 25',
  dxptr: 'Link diagnoses', auth: 'Enter prior auth', subscriber: 'Correct subscriber ID',
};

const STAGE_RANK: Record<ClaimStage, number> = {
  charge_review: 0, ready: 1, sent_837: 2, ack_999: 3, ack_277: 4, denied: 5, appeal: 5, paid: 6, patient: 7,
};
const CHIPS = [
  { label: 'Charge Review', rank: 0 }, { label: 'Ready', rank: 1 }, { label: '837P', rank: 2 },
  { label: '999', rank: 3 }, { label: '277CA', rank: 4 }, { label: '835 / Denial', rank: 5 },
  { label: 'Paid', rank: 6 }, { label: 'Patient', rank: 7 },
];

function Panel({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return <div className="panel"><div className="panel-head"><span>{title}</span>{action}</div><div className="panel-body">{children}</div></div>;
}
function Empty({ children }: { children: React.ReactNode }) {
  return <div className="panel-body center muted" style={{ padding: 22 }}><Inbox size={20} style={{ opacity: 0.4 }} /><div className="mt8">{children}</div></div>;
}

export default function BillingTab() {
  const s = useEhr();
  const p = getPatient(s.activePatientId)!;
  const [sub, setSub] = useState<Sub>('Charges');
  const openDenials = s.claims.filter((c) => c.denial && (c.stage === 'denied' || c.stage === 'appeal')).length;

  return (
    <div className="stack8">
      <div className="alert alert-info">
        <Info size={13} />
        <span className="grow">
          <b>Revenue Cycle.</b> Capture charges → scrub edits → submit <b>837P</b> via the <b>Availity</b> clearinghouse → <b>999/277CA</b> acknowledgments →
          payer adjudication (<b>835 ERA</b>) → work denials (CARC/RARC) / appeal → secondary → patient statement. Each gate can bounce it back.
        </span>
      </div>

      <div className="tabstrip" style={{ padding: '4px 6px 0' }}>
        {SUBS.map((x) => {
          const n = x === 'Charges' ? s.charges.length : x === 'Claims' ? s.claims.length : x === 'Denials' ? openDenials : 0;
          return (
            <div key={x} className={sub === x ? 'tab active' : 'tab'} onClick={() => setSub(x)}>
              {x}{n > 0 && <span className={x === 'Denials' ? 'badge' : 'badge badge-mute'}>{n}</span>}
            </div>
          );
        })}
      </div>

      {sub === 'Charges' && <Charges payer={p.insurance} />}
      {sub === 'Claims' && <Claims />}
      {sub === 'Remittance' && <Remittance />}
      {sub === 'Denials' && <Denials />}
      {sub === 'Statements' && <Statements name={p.name} />}
      {sub === 'Eligibility' && <Eligibility payer={p.insurance} mrn={p.mrn} patientId={p.id} />}
      {sub === 'EDI Log' && <EdiLog />}
    </div>
  );
}

/* ===================================================== CHARGES */
function Charges({ payer }: { payer: string }) {
  const s = useEhr();
  const [add, setAdd] = useState(false);
  const [cpt, setCpt] = useState(CPT_CATALOG[1].cpt);
  const [mod, setMod] = useState('');
  const [units, setUnits] = useState(1);
  const [dx, setDx] = useState('');
  const sel = CPT_CATALOG.find((c) => c.cpt === cpt)!;
  const total = s.charges.reduce((a, l) => a + l.charge * l.units, 0);

  const addCharge = () => {
    s.dispatch({ t: 'addCharge', line: { id: `chg${cSeq++}`, cpt: sel.cpt, mod, desc: sel.desc, units, dx: dx || '—', charge: sel.charge } });
    s.toast(`Charge ${sel.cpt} captured.`, 'ok'); setAdd(false); setMod(''); setUnits(1); setDx('');
  };
  const dropClaim = () => {
    const claim: BillingClaim = {
      id: `CLM-${100500 + clSeq++}`, payer: payer.split('(')[0].trim(), dos: '2026-06-23', billed: total,
      stage: 'charge_review', edits: genEdits(s.charges), events: [ev('Charges dropped to claim; entered charge review.', 'info')],
    };
    s.dispatch({ t: 'dropClaim', claim });
    s.toast(`Claim ${claim.id} created with ${claim.edits.length} scrubber edit(s) to clear.`, 'warn');
  };

  return (
    <>
      <div className="toolbar">
        <Receipt size={13} /><span className="xsmall">DOS 2026-06-23 · POS 11 · NPI 1487654321 · 837P</span>
        <span className="spacer" />
        <button className="btn-xs btn-primary" onClick={() => setAdd(true)}><Plus size={10} /> Add Charge</button>
        <button className="btn-xs btn-sign" disabled={s.charges.length === 0} onClick={dropClaim}><Send size={10} /> Drop to Claim</button>
      </div>
      <Panel title="Charge Capture (CPT/HCPCS)">
        {s.charges.length === 0 ? <Empty>No charges captured. Click <b>Add Charge</b> — charges are <b>not</b> pulled from the note or orders.</Empty> : (
          <table className="dense">
            <thead><tr><th>CPT</th><th>Mod</th><th>Description</th><th>Units</th><th>Dx</th><th className="right">Charge</th><th /></tr></thead>
            <tbody>
              {s.charges.map((l) => (
                <tr key={l.id}><td className="bold">{l.cpt}</td><td>{l.mod ? <Pill tone="info">{l.mod}</Pill> : <span className="muted">—</span>}</td>
                  <td>{l.desc}</td><td>{l.units}</td><td className="muted">{l.dx}</td><td className="right">${(l.charge * l.units).toFixed(2)}</td>
                  <td><KebabMenu actions={[{ label: 'Remove line', onClick: () => s.dispatch({ t: 'removeCharge', id: l.id }) }]} /></td></tr>
              ))}
              <tr><td colSpan={5} className="right bold">Total</td><td className="right bold">${total.toFixed(2)}</td><td /></tr>
            </tbody>
          </table>
        )}
      </Panel>
      {add && (
        <Modal title="Add Charge" onClose={() => setAdd(false)} width={480}
          footer={<><button onClick={() => setAdd(false)}>Cancel</button><button className="btn-sign" onClick={addCharge}>Add Charge</button></>}>
          <div className="form-grid">
            <label className="req">CPT / HCPCS</label>
            <select value={cpt} onChange={(e) => setCpt(e.target.value)}>{CPT_CATALOG.map((c) => <option key={c.cpt} value={c.cpt}>{c.cpt} — {c.desc}</option>)}</select>
            <label>Modifier</label>
            <select value={mod} onChange={(e) => setMod(e.target.value)}><option value="">none</option><option>25</option><option>59</option><option>LT</option><option>RT</option></select>
            <label>Units</label><input type="number" value={units} min={1} onChange={(e) => setUnits(Number(e.target.value))} style={{ width: 70 }} />
            <label>Dx pointer</label>
            <select value={dx} onChange={(e) => setDx(e.target.value)}>
              <option value="">— none —</option>
              {s.problems.map((pr, i) => <option key={pr.id} value={String.fromCharCode(65 + i)}>{String.fromCharCode(65 + i)} — {pr.name} ({pr.icd10})</option>)}
            </select>
            <label>Charge</label><div className="small">${sel.charge.toFixed(2)} <span className="muted">(fee schedule)</span></div>
          </div>
          {AUTH_REQUIRED.includes(cpt) && <div className="alert alert-warn mt8"><AlertTriangle size={12} /><span className="xsmall">This code typically requires prior authorization — expect a scrubber edit.</span></div>}
        </Modal>
      )}
    </>
  );
}

/* ===================================================== CLAIMS (lifecycle) */
function Claims() {
  const s = useEhr();
  const [selId, setSelId] = useState<string | null>(null);
  const selected = s.claims.find((c) => c.id === selId) ?? s.claims[s.claims.length - 1] ?? null;

  const upd = (c: BillingClaim, patch: Partial<BillingClaim>, event?: ClaimEvent) =>
    s.dispatch({ t: 'updateClaim', id: c.id, patch: { ...patch, events: event ? [...c.events, event] : c.events } });

  const allResolved = (c: BillingClaim) => c.edits.every((e) => e.resolved);

  const resolveEdit = (c: BillingClaim, edit: ClaimEdit) => {
    const edits = c.edits.map((x) => (x.id === edit.id ? { ...x, resolved: true } : x));
    const patch: Partial<BillingClaim> = { edits };
    let txt = '';
    switch (edit.kind) {
      case 'eligibility': patch.eligibilityChecked = true; txt = '270 sent → 271 received: coverage Active.'; break;
      case 'taxonomy': txt = 'Added rendering taxonomy 207Q00000X.'; break;
      case 'mod25': txt = 'Appended modifier 25 to the E/M line.'; break;
      case 'dxptr': txt = 'Linked diagnosis pointers to charge lines.'; break;
      case 'auth': patch.authNumber = 'AUTH-' + c.id.slice(-5); txt = `Entered prior authorization ${'AUTH-' + c.id.slice(-5)}.`; break;
      case 'subscriber': patch.rejectionCleared = true; txt = 'Corrected subscriber ID per 277CA; ready to resubmit.'; break;
    }
    upd(c, patch, ev(txt, 'info'));
  };

  const stageAction = (c: BillingClaim) => {
    switch (c.stage) {
      case 'ready': return { label: 'Transmit 837P to Availity', run: () => upd(c, { stage: 'sent_837' }, ev('837P transmitted to Availity (ISA13 0001847).', 'info')) };
      case 'sent_837': return { label: 'Retrieve 999 acknowledgment', run: () => upd(c, { stage: 'ack_999' }, ev('999 Functional Acknowledgment: Accepted.', 'ok')) };
      case 'ack_999': return {
        label: 'Retrieve 277CA (payer front-end)',
        run: () => {
          if (!c.rejectionCleared) {
            upd(c, { stage: 'charge_review', edits: [...c.edits, { id: 'e-sub', kind: 'subscriber', text: '277CA REJECTED (A7/562): subscriber ID format invalid for this payer.', resolved: false }] }, ev('277CA: REJECTED — subscriber ID invalid (A7:562). Returned to charge review.', 'danger'));
          } else {
            upd(c, { stage: 'ack_277' }, ev('277CA: Accepted by payer — claim in adjudication.', 'ok'));
          }
        },
      };
      case 'ack_277': return {
        label: 'Post 835 remittance (adjudicate)',
        run: () => {
          const contractualAdj = Math.round(c.billed * 0.38);
          const allowed = c.billed - contractualAdj;
          const deniedAmt = Math.max(20, Math.round(c.billed * 0.35));
          const net = Math.max(0, allowed - deniedAmt);
          const paid = Math.round(net * 0.8);
          const patientResp = net - paid;
          upd(c, {
            stage: 'denied', eraPosted: true, contractualAdj, paidAmount: paid, patientResp,
            denial: { carc: 'CO-50', rarc: 'M127', reason: 'These services are not deemed medically necessary — documentation insufficient.', amount: deniedAmt },
          }, ev(`835 ERA posted: allowed $${allowed}, paid $${paid}, contractual adj $${contractualAdj}; 1 line DENIED CO-50 ($${deniedAmt}).`, 'danger'));
        },
      };
      case 'appeal': return {
        label: 'Post 835 (appeal outcome)',
        run: () => {
          const recovered = Math.round((c.denial?.amount ?? 0) * 0.8);
          upd(c, { stage: 'paid', paidAmount: (c.paidAmount ?? 0) + recovered }, ev(`Appeal OVERTURNED — payer reprocessed, additional $${recovered} paid.`, 'ok'));
        },
      };
      case 'paid': return { label: 'Generate patient statement', run: () => upd(c, { stage: 'patient' }, ev(`Patient statement generated: $${c.patientResp ?? 0} patient responsibility.`, 'info')) };
      default: return null;
    }
  };

  return (
    <>
      <div className="panel">
        <div className="panel-head">Claims Worklist</div>
        {s.claims.length === 0 ? <Empty>No claims yet. Capture charges and <b>Drop to Claim</b>.</Empty> : (
          <table className="dense">
            <thead><tr><th>Claim #</th><th>Payer</th><th className="right">Billed</th><th>Stage</th><th>Blocking</th><th /></tr></thead>
            <tbody>
              {s.claims.map((c) => {
                const open = c.edits.filter((e) => !e.resolved).length;
                return (
                  <tr key={c.id} className={`clickable ${selected?.id === c.id ? 'selected' : ''}`} onClick={() => setSelId(c.id)}>
                    <td className="link bold">{c.id}</td><td>{c.payer}</td><td className="right">${c.billed.toFixed(2)}</td>
                    <td><StagePill stage={c.stage} /></td>
                    <td>{open > 0 ? <span className="flag-h">{open} edit(s)</span> : c.denial && (c.stage === 'denied') ? <span className="flag-h">denial</span> : <span className="muted">—</span>}</td>
                    <td><Send size={12} className="muted" /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {selected && <ClaimDetail c={selected} allResolved={allResolved} resolveEdit={resolveEdit} stageAction={stageAction} upd={upd} />}
    </>
  );
}

function StagePill({ stage }: { stage: ClaimStage }) {
  const map: Record<ClaimStage, [Tone, string]> = {
    charge_review: ['warn', 'Charge Review'], ready: ['pend', 'Ready'], sent_837: ['info', '837P Sent'],
    ack_999: ['info', '999 Ack'], ack_277: ['info', '277CA OK'], denied: ['danger', 'Denied'],
    appeal: ['warn', 'Appeal'], paid: ['ok', 'Paid'], patient: ['mute', 'Patient'],
  };
  const [tone, label] = map[stage];
  return <Pill tone={tone}>{label}</Pill>;
}

function ClaimDetail({ c, allResolved, resolveEdit, stageAction, upd }: {
  c: BillingClaim;
  allResolved: (c: BillingClaim) => boolean;
  resolveEdit: (c: BillingClaim, e: ClaimEdit) => void;
  stageAction: (c: BillingClaim) => { label: string; run: () => void } | null;
  upd: (c: BillingClaim, patch: Partial<BillingClaim>, event?: ClaimEvent) => void;
}) {
  const rank = STAGE_RANK[c.stage];
  const denied = c.stage === 'denied' || c.stage === 'appeal';
  const action = stageAction(c);

  return (
    <div className="panel">
      <div className="panel-head"><span>{c.id} — lifecycle</span><span className="xsmall muted">Timely filing: 90-day window · billed ${c.billed.toFixed(2)}</span></div>
      <div className="panel-body">
        {/* stepper */}
        <div className="row" style={{ flexWrap: 'wrap', gap: 3, marginBottom: 8 }}>
          {CHIPS.map((chip, i) => {
            const isDenialChip = chip.rank === 5;
            const done = rank > chip.rank || (chip.rank < 5 && rank >= 5);
            const current = chip.rank === rank || (isDenialChip && denied);
            const tone: Tone = current ? (isDenialChip && denied ? 'danger' : 'info') : done ? 'ok' : 'mute';
            return (
              <span key={i} className="row gap4" style={{ alignItems: 'center' }}>
                <Pill tone={tone}>{done ? '✓ ' : ''}{chip.label}</Pill>
                {i < CHIPS.length - 1 && <span className="muted">›</span>}
              </span>
            );
          })}
        </div>

        {/* action card */}
        <div className="grid-2" style={{ alignItems: 'start' }}>
          <div className="box" style={{ padding: 8 }}>
            <div className="bold mb4">{stageTitle(c)}</div>

            {c.stage === 'charge_review' && (
              <>
                {c.edits.map((e) => (
                  <div key={e.id} className="row" style={{ alignItems: 'flex-start', marginBottom: 4 }}>
                    {e.resolved
                      ? <Pill tone="ok">✓</Pill>
                      : <Pill tone="danger">!</Pill>}
                    <span className="grow xsmall">{e.text}</span>
                    {!e.resolved && <button className="btn-xs" onClick={() => resolveEdit(c, e)}>{EDIT_ACTION[e.kind]}</button>}
                  </div>
                ))}
                <div className="divider" />
                <button className="btn-sign btn-xs" disabled={!allResolved(c)} onClick={() => upd(c, { stage: 'ready' }, ev('Claim scrubber: 0 errors. Marked ready to submit.', 'ok'))}>
                  Pass scrubber → Mark Ready
                </button>
                {!allResolved(c) && <div className="xsmall muted mt4">{c.edits.filter((e) => !e.resolved).length} edit(s) still blocking submission.</div>}
              </>
            )}

            {denied && (
              <>
                <div className="alert alert-danger mb8"><AlertTriangle size={12} /><span className="xsmall"><b>{c.denial?.carc} / {c.denial?.rarc}</b> — {c.denial?.reason} (${c.denial?.amount})</span></div>
                {c.stage === 'denied' && (
                  <div className="row gap4" style={{ flexWrap: 'wrap' }}>
                    <button className="btn-xs btn-primary" onClick={() => upd(c, { stage: 'appeal', appealed: true }, ev('Appeal (Level 1) submitted with medical records (275). Deadline: 60 days.', 'warn'))}>Appeal w/ records</button>
                    <button className="btn-xs" onClick={() => upd(c, { stage: 'ready', edits: c.edits.map((e) => ({ ...e, resolved: true })) }, ev('Corrected claim (CLM05=7: replacement) queued for resubmission.', 'info'))}>Correct &amp; resubmit</button>
                    <button className="btn-xs" onClick={() => upd(c, { stage: 'paid' }, ev(`Contractual write-off posted ($${c.denial?.amount}).`, 'warn'))}>Write off</button>
                  </div>
                )}
                {c.stage === 'appeal' && action && <button className="btn-sign btn-xs" onClick={action.run}>{action.label}</button>}
              </>
            )}

            {!denied && c.stage !== 'charge_review' && c.stage !== 'patient' && action && (
              <button className="btn-sign btn-xs" onClick={action.run}>{action.label}</button>
            )}

            {c.stage === 'paid' && (
              <div className="mt8">
                <button className="btn-xs" onClick={() => upd(c, {}, ev('Checked COB: no active secondary coverage on file.', 'info'))}>Bill Secondary (COB)</button>
              </div>
            )}

            {c.stage === 'patient' && <div className="alert alert-ok"><span className="xsmall">Claim closed. ${c.patientResp ?? 0} billed to patient (see Statements). Paid by insurer: ${c.paidAmount ?? 0}.</span></div>}
          </div>

          {/* financials + event log */}
          <div>
            <div className="box" style={{ padding: 8, marginBottom: 8 }}>
              <div className="bold mb4">Financials</div>
              <div className="kv xsmall">
                <dt>Billed</dt><dd>${c.billed.toFixed(2)}</dd>
                <dt>Contractual adj</dt><dd>{c.contractualAdj != null ? `-$${c.contractualAdj}` : '—'}</dd>
                <dt>Insurer paid</dt><dd>{c.paidAmount != null ? `$${c.paidAmount}` : '—'}</dd>
                <dt>Denied</dt><dd>{c.denial ? <span className="flag-h">${c.denial.amount}</span> : '—'}</dd>
                <dt>Patient resp</dt><dd>{c.patientResp != null ? `$${c.patientResp}` : '—'}</dd>
              </div>
            </div>
            <div className="box" style={{ padding: 8 }}>
              <div className="bold mb4">Event / EDI Log</div>
              <div style={{ maxHeight: 150, overflow: 'auto' }}>
                {c.events.slice().reverse().map((e, i) => (
                  <div key={i} className="xsmall" style={{ marginBottom: 2, color: e.tone === 'danger' ? 'var(--danger)' : e.tone === 'ok' ? 'var(--ink)' : 'var(--ink-soft)' }}>
                    <span className="muted">{e.ts}</span> — {e.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function stageTitle(c: BillingClaim): string {
  switch (c.stage) {
    case 'charge_review': return 'Charge review — clear scrubber edits to submit';
    case 'ready': return 'Scrubbed — ready to transmit';
    case 'sent_837': return '837P transmitted — awaiting clearinghouse';
    case 'ack_999': return '999 accepted — retrieve payer 277CA';
    case 'ack_277': return '277CA accepted — adjudicate';
    case 'denied': return 'DENIED — work the denial';
    case 'appeal': return 'Appeal submitted — awaiting outcome';
    case 'paid': return 'Primary paid — secondary & patient';
    case 'patient': return 'Closed — patient responsibility';
    default: return '';
  }
}

/* ===================================================== DERIVED TABS */
function Remittance() {
  const s = useEhr();
  const posted = s.claims.filter((c) => c.eraPosted);
  return (
    <div className="panel"><div className="panel-head">Remittances (835 / ERA)</div>
      {posted.length === 0 ? <Empty>No remittances. ERAs post here after you adjudicate a submitted claim.</Empty> : (
        <table className="dense">
          <thead><tr><th>Claim</th><th>Payer</th><th className="right">Billed</th><th className="right">Contractual</th><th className="right">Paid</th><th className="right">Denied</th><th className="right">Pt Resp</th><th>CARC</th></tr></thead>
          <tbody>{posted.map((c) => (
            <tr key={c.id}><td className="bold">{c.id}</td><td>{c.payer}</td><td className="right">${c.billed.toFixed(2)}</td>
              <td className="right">-${c.contractualAdj}</td><td className="right">${c.paidAmount}</td>
              <td className="right">{c.denial ? <span className="flag-h">${c.denial.amount}</span> : '$0'}</td>
              <td className="right">${c.patientResp}</td><td>{c.denial ? <Pill tone="danger">{c.denial.carc}</Pill> : <Pill tone="mute">CO-45</Pill>}</td></tr>
          ))}</tbody>
        </table>
      )}
    </div>
  );
}

function Denials() {
  const s = useEhr();
  const rows = s.claims.filter((c) => c.denial && (c.stage === 'denied' || c.stage === 'appeal'));
  return (
    <div className="panel"><div className="panel-head">Denials & Appeals Worklist</div>
      {rows.length === 0 ? <Empty>No open denials. Denials (CARC/RARC) land here after adjudication.</Empty> : (
        <table className="dense">
          <thead><tr><th>Claim</th><th>CARC</th><th>RARC</th><th>Reason</th><th className="right">Amt</th><th>Status</th></tr></thead>
          <tbody>{rows.map((c) => (
            <tr key={c.id}><td className="bold">{c.id}</td><td><Pill tone="danger">{c.denial!.carc}</Pill></td><td><Pill tone="mute">{c.denial!.rarc}</Pill></td>
              <td className="xsmall">{c.denial!.reason}</td><td className="right">${c.denial!.amount}</td>
              <td><Pill tone={c.stage === 'appeal' ? 'warn' : 'danger'}>{c.stage === 'appeal' ? 'Appealed' : 'Needs work'}</Pill></td></tr>
          ))}</tbody>
        </table>
      )}
      <p className="xsmall muted" style={{ padding: '0 8px 8px' }}>Work denials from the claim's lifecycle panel (Claims tab): appeal with records, correct &amp; resubmit, or write off — each with its own timely-filing deadline.</p>
    </div>
  );
}

function Statements({ name }: { name: string }) {
  const s = useEhr();
  const rows = s.claims.filter((c) => c.stage === 'patient');
  const balance = rows.reduce((a, c) => a + (c.patientResp ?? 0), 0);
  return (
    <div className="panel"><div className="panel-head"><span>Account — {name}</span><span className="bold">Balance: ${balance.toFixed(2)}</span></div>
      {rows.length === 0 ? <Empty>No statements. Patient responsibility appears only after insurance adjudicates and the claim closes.</Empty> : (
        <table className="dense">
          <thead><tr><th>Claim</th><th>DOS</th><th className="right">Patient Resp</th><th>Status</th><th /></tr></thead>
          <tbody>{rows.map((c) => (
            <tr key={c.id}><td className="bold">{c.id}</td><td>{c.dos}</td><td className="right">${c.patientResp}</td><td><Pill tone="warn">Statement due</Pill></td>
              <td><button className="btn-xs" onClick={() => s.toast('Statement sent to patient.', 'ok')}>Send</button></td></tr>
          ))}</tbody>
        </table>
      )}
    </div>
  );
}

function Eligibility({ payer, mrn, patientId }: { payer: string; mrn: string; patientId: string }) {
  const s = useEhr();
  const [checked, setChecked] = useState(false);
  useEffect(() => { setChecked(false); }, [patientId]);
  return (
    <>
      <div className="toolbar"><BadgeCheck size={13} /><span className="xsmall">270/271 real-time eligibility</span><span className="spacer" />
        <button className="btn-xs btn-primary" onClick={() => { setChecked(true); s.toast('270 sent → 271 received: coverage Active.', 'ok'); }}>Run 270 Inquiry</button></div>
      <div className="panel"><div className="panel-head">Eligibility (271 Response)</div>
        {!checked ? <Empty>No eligibility on file. Click <b>Run 270 Inquiry</b>.</Empty> : (
          <div className="panel-body grid-2">
            <div className="kv"><dt>Payer</dt><dd>{payer.split('(')[0].trim()}</dd><dt>Member ID</dt><dd>XEH{mrn.slice(-6)}</dd><dt>Coverage</dt><dd><Pill tone="ok">Active</Pill></dd></div>
            <div className="kv"><dt>Office copay</dt><dd>$25</dd><dt>Deductible</dt><dd>$680 / $1,500</dd><dt>Coinsurance</dt><dd>20%</dd></div>
          </div>
        )}
      </div>
    </>
  );
}

function EdiLog() {
  const s = useEhr();
  const rows = s.claims.flatMap((c) => c.events.map((e) => ({ claim: c.id, ...e }))).reverse();
  return (
    <div className="panel"><div className="panel-head"><span>X12 EDI / Event Log</span><span className="xsmall muted">Clearinghouse: Availity</span></div>
      {rows.length === 0 ? <Empty>No EDI transactions yet. 837P/999/277CA/835 records appear once you submit a claim.</Empty> : (
        <table className="dense">
          <thead><tr><th style={{ width: 130 }}>Timestamp</th><th style={{ width: 90 }}>Claim</th><th>Event</th></tr></thead>
          <tbody>{rows.map((r, i) => (
            <tr key={i}><td className="nowrap xsmall">{r.ts}</td><td className="bold">{r.claim}</td>
              <td className="xsmall" style={{ color: r.tone === 'danger' ? 'var(--danger)' : 'var(--ink)' }}>{r.text}</td></tr>
          ))}</tbody>
        </table>
      )}
      <p className="xsmall muted" style={{ padding: '0 8px 8px' }}>Standards: 837P, 835, 270/271, 276/277, 999/277CA, 275. HIPAA X12 005010.</p>
    </div>
  );
}
