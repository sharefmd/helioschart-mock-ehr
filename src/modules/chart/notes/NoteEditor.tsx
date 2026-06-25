import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Save, PenLine, Wand2, ArrowDownToLine, FileStack, Plus, Link2,
} from 'lucide-react';
import { useEhr } from '../../../store/EhrStore';
import Modal from '../../../components/Modal';
import { ICD_PICKER } from '../../../data/clinical';
import type { NoteDraft } from '../../../types';

const DEMO_PLAN = `Assessment & Plan:
1. Essential hypertension (I10) — BP remains above goal (152/88 today; elevated x2 visits).
   - Start ramipril 2.5 mg PO daily.
   - Check BMP in 1–2 weeks (monitor K/Cr after ACE initiation).
   - Recheck BP at follow-up.
2. Type 2 diabetes (E11.9) — A1c 7.4%, at goal. Continue metformin 500 mg BID.
3. CKD stage 2 (N18.2) — eGFR 72, urine ACR mildly elevated/rising. ACE inhibitor appropriate.
4. Follow up in 4 weeks.`;

const SECTIONS: { key: keyof NoteDraft; label: string; rows: number }[] = [
  { key: 'hpi', label: 'HPI (Subjective)', rows: 4 },
  { key: 'exam', label: 'Exam (Objective)', rows: 3 },
  { key: 'assessmentPlan', label: 'Assessment & Plan', rows: 9 },
  { key: 'patientInstructions', label: 'Patient Instructions', rows: 4 },
];

export default function NoteEditor() {
  const s = useEhr();
  const nav = useNavigate();
  const note = s.note;
  const signed = note.status === 'signed';
  const [focused, setFocused] = useState<keyof NoteDraft>('assessmentPlan');
  const [linkModal, setLinkModal] = useState(false);
  const [signWarn, setSignWarn] = useState<string | null>(null);
  const [dxModal, setDxModal] = useState(false);
  const [dxPick, setDxPick] = useState(ICD_PICKER[0]);

  // This is the seam where Intelligent mode will later detect intent. In
  // Conventional mode it intentionally does nothing downstream.
  const onPlanTextChange = (_value: string) => { /* no-op: notes do not talk to orders */ };

  const setSection = (key: keyof NoteDraft, value: string) => {
    s.dispatch({ t: 'setNoteSection', section: key, value });
    if (key === 'assessmentPlan') onPlanTextChange(value);
  };
  const append = (key: keyof NoteDraft, value: string) => {
    s.dispatch({ t: 'appendNoteSection', section: key, value });
  };

  const trySign = () => {
    if (!note.assessmentPlan.trim()) { setSignWarn('The Assessment & Plan section is empty. Document a plan before signing.'); return; }
    if (s.unsignedOrderCount > 0) {
      setSignWarn(`This note references a plan, but there ${s.unsignedOrderCount === 1 ? 'is' : 'are'} ${s.unsignedOrderCount} unsigned order(s) in the Orders tab. The note will NOT create or sign these for you.`);
      return;
    }
    doSign();
  };
  const doSign = () => {
    s.dispatch({ t: 'signNote' });
    s.toast('Progress note signed.', 'ok');
    setSignWarn(null);
  };

  return (
    <div className="panel">
      {/* Note header */}
      <div className="panel-head">
        <span>Progress Note · Office Visit · 2026-06-23 09:25 · Okafor, James MD</span>
        {signed
          ? <span className="pill pill-ok">Signed {note.signedAt}</span>
          : <span className="pill pill-warn">Unsigned — draft</span>}
      </div>

      {/* Note toolbar (lots of buttons that "do something") */}
      <div className="toolbar">
        <button className="btn-xs" disabled={signed} onClick={() => s.toast('Draft saved 09:48.', 'info')}><Save size={11} /> Save Draft</button>
        <button className="btn-xs" disabled={signed} onClick={() => append('hpi', '.ros — 10-point review of systems otherwise negative.')}><Wand2 size={11} /> SmartPhrase</button>
        <button className="btn-xs" disabled={signed} onClick={() => { append('hpi', 'Patient returns for routine follow-up of HTN and T2DM. Reports home BP readings ~150/90. No chest pain, no edema.'); append('exam', 'Gen: NAD. CV: RRR, no murmur. Lungs: CTA. Ext: no edema.'); s.toast('Pulled forward from last visit.', 'info'); }}><ArrowDownToLine size={11} /> Pull Forward</button>
        <button className="btn-xs" disabled={signed} onClick={() => { setSection('assessmentPlan', DEMO_PLAN); s.toast('Inserted A&P template.', 'info'); }}><FileStack size={11} /> Insert Template</button>
        <button className="btn-xs" disabled={signed} onClick={() => setDxModal(true)}><Plus size={11} /> Add Diagnosis</button>
        <button className="btn-xs" disabled={signed} onClick={() => setLinkModal(true)}><Link2 size={11} /> Link Orders</button>
        <span className="spacer" />
        <button className="btn-sign" disabled={signed} onClick={trySign}><PenLine size={11} /> Sign Note</button>
      </div>

      <div className="panel-body stack8">
        {SECTIONS.map((sec) => (
          <div key={sec.key}>
            <label className="bold" style={{ color: 'var(--ink-soft)' }}>{sec.label}</label>
            <textarea
              style={{ width: '100%', marginTop: 2 }}
              rows={sec.rows}
              value={note[sec.key] as string}
              disabled={signed}
              onFocus={() => setFocused(sec.key)}
              onChange={(e) => setSection(sec.key, e.target.value)}
              placeholder={sec.key === 'assessmentPlan'
                ? 'e.g. BP remains above goal. Start ramipril 2.5 mg daily. Check BMP in 1–2 weeks. Follow up in 4 weeks.'
                : sec.key === 'patientInstructions'
                  ? 'Type instructions for the patient (these do NOT auto-populate from the plan)…'
                  : `Document ${sec.label}…`}
            />
          </div>
        ))}
        <div className="xsmall muted">Focused section: {SECTIONS.find((x) => x.key === focused)?.label}</div>
      </div>

      {/* "Link Orders" — confusing empty modal (the disconnect, made literal) */}
      {linkModal && (
        <Modal title="Link Orders to Note" onClose={() => setLinkModal(false)} width={460}
          footer={<>
            <button onClick={() => { setLinkModal(false); nav(`/chart/${s.activePatientId}/orders`); }}>Go to Orders</button>
            <button className="btn-primary" onClick={() => setLinkModal(false)}>Close</button>
          </>}>
          <div className="alert alert-warn mb8">
            <span><b>No linked orders found.</b> This note does not have any associated orders.</span>
          </div>
          <p className="small">
            The system did not detect any orders associated with this encounter note.
            To create orders, navigate to the <b>Orders</b> module and enter them manually.
            Orders entered there are <b>not</b> linked back to note text.
          </p>
          <table className="dense mt8">
            <thead><tr><th>Order</th><th>Status</th><th>Linked?</th></tr></thead>
            <tbody><tr><td colSpan={3} className="center muted" style={{ padding: 14 }}>— No records to display —</td></tr></tbody>
          </table>
        </Modal>
      )}

      {/* Add Diagnosis picker — appends to A&P AND adds to problem list */}
      {dxModal && (
        <Modal title="Add Diagnosis" onClose={() => setDxModal(false)} width={440}
          footer={<>
            <button onClick={() => setDxModal(false)}>Cancel</button>
            <button className="btn-sign" onClick={() => {
              const m = dxPick.match(/^(.*)\s\(([^)]+)\)$/);
              append('assessmentPlan', `- ${dxPick}: `);
              s.dispatch({ t: 'addProblem', problem: { id: `dx${Date.now() % 100000}`, name: m ? m[1] : dxPick, icd10: m ? m[2] : '—', status: 'Active', onsetDate: '2026-06-23' } });
              s.toast(`Diagnosis added to note & problem list: ${m ? m[1] : dxPick}.`, 'ok');
              setDxModal(false);
            }}>Add Diagnosis</button>
          </>}>
          <div className="form-grid">
            <label className="req">Diagnosis</label>
            <select value={dxPick} onChange={(e) => setDxPick(e.target.value)}>
              {ICD_PICKER.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <p className="xsmall muted mt8">This adds a line to the Assessment &amp; Plan and the problem list — but still creates no orders.</p>
        </Modal>
      )}

      {/* Sign validation gate */}
      {signWarn && (
        <Modal title="Cannot complete — items outstanding" onClose={() => setSignWarn(null)} width={460}
          footer={<>
            <button onClick={() => { setSignWarn(null); nav(`/chart/${s.activePatientId}/orders`); }}>Review Orders</button>
            <button className="btn-danger" onClick={doSign}>Sign Anyway</button>
            <button onClick={() => setSignWarn(null)}>Cancel</button>
          </>}>
          <div className="alert alert-warn"><span>{signWarn}</span></div>
        </Modal>
      )}
    </div>
  );
}
