import { useState } from 'react';
import { ListChecks, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useEhr } from '../store/EhrStore';

interface Step { n: number; text: string; done?: boolean; }

export default function DemoGuide() {
  const [open, setOpen] = useState(false);
  const [min, setMin] = useState(false);
  const s = useEhr();

  const hasPlan = !!s.note.assessmentPlan.trim();
  const hasMed = s.meds.some((m) => m.orderedFrom === 'orders-tab');
  const hasLab = s.orders.some((o) => o.type === 'lab' && o.status === 'signed');
  const hasFollowup = s.tasks.some((t) => t.queue === 'scheduling');
  const hasInstr = !!s.note.patientInstructions.trim();
  const noteSigned = s.note.status === 'signed';

  const steps: Step[] = [
    { n: 1, text: 'Open Schedule → select Maria Thompson (9:20)' },
    { n: 2, text: 'Open Chart → review Summary' },
    { n: 3, text: 'Open Notes → type/insert the plan ("Start ramipril 2.5 mg daily…")', done: hasPlan },
    { n: 4, text: 'Go to Orders — note the workspace is EMPTY (the disconnect)' },
    { n: 5, text: 'Search "ramipril" → fill dose/route/freq/pharmacy → Sign', done: hasMed },
    { n: 6, text: 'Search "BMP" → set interval 1–2 weeks → Sign lab order', done: hasLab },
    { n: 7, text: 'Click Follow-up → create 4-week return task', done: hasFollowup },
    { n: 8, text: 'Back to Notes → manually type Patient Instructions', done: hasInstr },
    { n: 9, text: 'Sign the progress note', done: noteSigned },
    { n: 10, text: 'Close Encounter → see remaining inbox tasks linger' },
  ];
  const doneCount = steps.filter((x) => x.done).length;

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{ position: 'fixed', left: 10, bottom: 26, zIndex: 1100 }}
        className="btn-primary"
        title="Show guided demo script"
      >
        <ListChecks size={12} /> Demo Script
      </button>
    );
  }

  return (
    <div style={{ position: 'fixed', left: 10, bottom: 26, zIndex: 1100, width: 320 }} className="panel">
      <div className="panel-head" style={{ background: 'linear-gradient(var(--chrome-top), var(--chrome-top-2))', color: '#fff' }}>
        <span><ListChecks size={12} /> Guided Demo — Conventional EHR</span>
        <span className="row gap4">
          <span title={min ? 'Expand' : 'Collapse'} className="link" style={{ color: '#d3d5d7' }} onClick={() => setMin((m) => !m)}>
            {min ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </span>
          <X size={13} className="link" style={{ color: '#d3d5d7' }} onClick={() => setOpen(false)} />
        </span>
      </div>
      {!min && (
        <div className="panel-body" style={{ maxHeight: 320, overflow: 'auto' }}>
          <div className="alert alert-info mb8 xsmall">
            <span><b>Thesis:</b> the note stores the plan but is disconnected from action — every step below is re-entered by hand.</span>
          </div>
          <ol style={{ paddingLeft: 0 }}>
            {steps.map((st) => (
              <li key={st.n} className="row" style={{ alignItems: 'flex-start', marginBottom: 5 }}>
                <span className={st.done ? 'pill pill-ok' : 'pill pill-mute'} style={{ minWidth: 18 }}>{st.done ? '✓' : st.n}</span>
                <span className="small" style={{ color: st.done ? 'var(--ink-mute)' : 'var(--ink)' }}>{st.text}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
      <div className="footer" style={{ borderTop: '1px solid var(--border)' }}>
        <span>{doneCount}/{steps.filter((x) => x.done !== undefined).length} tracked steps done</span>
        <span className="grow" />
        <span className="muted">friction: {s.orders.length} orders · {s.openTaskCount} tasks</span>
      </div>
    </div>
  );
}
