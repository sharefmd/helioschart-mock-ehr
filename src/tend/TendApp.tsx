import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, Search, Home, Inbox, ChevronDown, ChevronLeft, ChevronsUpDown,
  Check, PenLine, LayoutGrid, FolderClosed, Pill, Plus, CornerDownRight,
  Stethoscope, Scan, CalendarClock, X,
} from 'lucide-react';
import './tend.css';
import {
  TEND_PROVIDER, RENATA, VISIT_REASONS, VISIT_TYPES, VISIT_SUMMARY, NOTE,
  PHARMACIES, MED_SEED, ORDER_SEED, FOLLOWUP_SEED, type OrderAction,
} from './tendData';

type Tab = 'overview' | 'visit' | 'chart';

export default function TendApp() {
  const [tab, setTab] = useState<Tab>('visit');
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (m: string) => { setToast(m); window.setTimeout(() => setToast(null), 2800); };

  return (
    <div className="tend-app">
      <span className="t-demo">Demo — fictional patient</span>
      <Rail onToast={showToast} />

      <div className="t-center">
        <PatientHeader />
        <div className="t-tabsrow">
          <div className="t-tabs">
            <button className={`t-tab ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>
              <LayoutGrid size={15} /> Overview
            </button>
            <button className={`t-tab ${tab === 'visit' ? 'active' : ''}`} onClick={() => setTab('visit')}>
              <Sparkles size={15} /> Visit {tab === 'visit' && <span className="dot" />}
            </button>
            <button className={`t-tab ${tab === 'chart' ? 'active' : ''}`} onClick={() => setTab('chart')}>
              <FolderClosed size={15} /> Chart
            </button>
          </div>
        </div>

        <div className="t-scroll">
          {tab === 'visit' ? <VisitPage onToast={showToast} />
            : <div className="t-stub">{tab === 'overview' ? 'Overview' : 'Chart'} — coming soon.</div>}
        </div>
      </div>

      {tab === 'visit' && <ReadyToSign onToast={showToast} />}

      {toast && <div className="t-toast"><Check size={15} /> {toast}</div>}
    </div>
  );
}

/* ----------------------------------------------------------- Rail */
function Rail({ onToast }: { onToast: (m: string) => void }) {
  const nav = useNavigate();
  return (
    <aside className="t-rail">
      <div className="t-logo"><span className="tile">T</span> Tend</div>
      <div className="t-search"><Search size={16} /><input placeholder="Search patients" /></div>
      <nav className="t-nav">
        <button className="t-nav-item" onClick={() => onToast('Home — not built in this demo.')}><Home size={17} /> Home</button>
        <button className="t-nav-item" onClick={() => onToast('Inbox — not built in this demo.')}><Inbox size={17} /> Inbox</button>
      </nav>
      <div className="t-rail-spacer" />
      <button className="t-show-around" onClick={() => onToast('“Show me around” — guided tour coming soon.')}>
        <Sparkles size={16} /> Show me around
      </button>
      <button className="t-user" onClick={() => nav('/schedule')} title="Back to HeliosChart demo">
        <span className="t-avatar" style={{ background: '#cfe0f5', color: '#2a5b8a' }}>{TEND_PROVIDER.initials}</span>
        <span style={{ textAlign: 'left' }}>
          <span className="name" style={{ display: 'block' }}>{TEND_PROVIDER.name}</span>
          <span className="role">{TEND_PROVIDER.role} <ChevronsUpDown size={12} /></span>
        </span>
      </button>
    </aside>
  );
}

/* ----------------------------------------------------------- Patient header */
function PatientHeader() {
  const nav = useNavigate();
  return (
    <div className="t-pthead">
      <button className="t-back" onClick={() => nav('/schedule')}><ChevronLeft size={18} /></button>
      <span className="t-ptname">{RENATA.name}</span>
      <span className="t-ptmeta">{RENATA.age} · {RENATA.sex} · {RENATA.problems}</span>
      <div className="t-tags">{RENATA.tags.map((t) => <span key={t} className="t-tag">{t}</span>)}</div>
    </div>
  );
}

/* ----------------------------------------------------------- Editable chip */
function Chip({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  return (
    <span className="t-chip" ref={ref} onClick={() => setOpen((o) => !o)}>
      {value} <ChevronDown size={14} />
      {open && (
        <span className="t-menu" onClick={(e) => e.stopPropagation()}>
          {options.map((o) => (
            <span key={o} className={`t-menu-item ${o === value ? 'sel' : ''}`}
              onClick={() => { onChange(o); setOpen(false); }}>{o}</span>
          ))}
        </span>
      )}
    </span>
  );
}

/* ----------------------------------------------------------- Visit page (center) */
function VisitPage({ onToast }: { onToast: (m: string) => void }) {
  const [reason, setReason] = useState(VISIT_REASONS[0]);
  const [vtype, setVtype] = useState(VISIT_TYPES[0]);
  return (
    <>
      <div className="t-prep-label"><Sparkles size={13} /> Visit prep</div>
      <p className="t-prep-sentence">
        {RENATA.name.split(' ')[0]} is here for <Chip value={reason} options={VISIT_REASONS} onChange={setReason} />
        {' '}— charting it as a <Chip value={vtype} options={VISIT_TYPES} onChange={setVtype} /> visit.
      </p>
      <p className="t-prep-summary">{VISIT_SUMMARY}</p>

      <div className="t-note">
        <div className="t-note-head">
          <span className="t-note-title">{vtype}</span>
          <span className="t-ready"><Sparkles size={12} /> Draft</span>
        </div>
        <div className="t-note-byline">{NOTE.byline}</div>

        <div className="t-sec"><div className="t-sec-h">Interval</div><p className="t-sec-p">{NOTE.interval}</p></div>
        <div className="t-sec"><div className="t-sec-h">Exam</div><p className="t-sec-p">{NOTE.exam}</p></div>

        <div className="t-sec">
          <div className="t-sec-h">{NOTE.planTitle}</div>
          <ul className="t-plan">
            {NOTE.plan.map((p) => (
              <li className="t-plan-item" key={p.term}>
                <span className="t-term">{p.term}</span> <span>{p.text}</span>
                {p.note && <div className="t-callout">{p.note}</div>}
              </li>
            ))}
          </ul>
        </div>

        <div className="t-sec">
          <div className="t-sec-h">Current medications</div>
          <ul className="t-plan">
            {NOTE.medications.map((m) => (
              <li className="t-med" key={m.name}>
                <span className="mn">{m.name}</span> <span className="md">{m.detail}</span>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ marginTop: 18 }}>
          <button className="t-chip" style={{ borderBottom: 'none' }} onClick={() => onToast('Editing the note — not wired in this demo.')}>
            <PenLine size={14} /> Edit note
          </button>
        </div>
      </div>
    </>
  );
}

/* ----------------------------------------------------------- Trace line */
function Trace({ done, children }: { done?: boolean; children: React.ReactNode }) {
  return (
    <div className={`t-trace ${done ? 'done' : ''}`}>
      {done ? <Check size={13} /> : <CornerDownRight size={13} />} {children}
    </div>
  );
}

/* ----------------------------------------------------------- Right automation workspace */
function ReadyToSign({ onToast }: { onToast: (m: string) => void }) {
  // medication state — the deep, editable part
  const [medIncluded, setMedIncluded] = useState(true);
  const [medMode, setMedMode] = useState<'refill' | 'discontinue'>('refill');
  const [refills, setRefills] = useState(MED_SEED.refills);
  const [pharmacy, setPharmacy] = useState(PHARMACIES[0]);
  const [newMeds, setNewMeds] = useState<{ id: string; name: string; sig: string }[]>([]);
  const [adding, setAdding] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftSig, setDraftSig] = useState('1 tab PO daily');

  // orders + follow-up
  const [orders, setOrders] = useState<OrderAction[]>(ORDER_SEED);
  const [followup, setFollowup] = useState({ ...FOLLOWUP_SEED });
  const [signed, setSigned] = useState(false);

  const toggleOrder = (id: string) => setOrders((o) => o.map((x) => (x.id === id ? { ...x, included: !x.included } : x)));
  const count =
    (medIncluded ? 1 : 0) + newMeds.length +
    orders.filter((o) => o.included).length + (followup.included ? 1 : 0);

  const addMed = () => {
    if (!draftName.trim()) return;
    setNewMeds((m) => [...m, { id: `nm${m.length}`, name: draftName.trim(), sig: draftSig.trim() }]);
    setDraftName(''); setDraftSig('1 tab PO daily'); setAdding(false);
  };

  const medTrace = medMode === 'refill'
    ? { pending: `Will e-prescribe — refill ×${refills} → ${pharmacy.split(' —')[0]}`, done: `e-Rx sent — refill ×${refills} → ${pharmacy.split(' —')[0]}` }
    : { pending: `Will discontinue ${MED_SEED.name.split(' (')[0]}`, done: `Discontinued — removed from active medications` };

  return (
    <aside className="t-right">
      <div className="t-right-top">{RENATA.lastSeen}</div>
      <div className="t-right-body">
        <div className="t-right-head"><Sparkles size={18} color="#6d3bec" /> Ready to sign</div>
        <p className="t-right-intro">
          I've drafted the close-out for this visit. Review or adjust each action — I'll carry it out and leave a trace.
        </p>

        {/* MEDICATIONS — the deep, editable area */}
        <div className="t-ws-group">Medications</div>

        <div className={`t-acard ${medIncluded ? '' : 'excluded'}`}>
          <div className="t-acard-body">
            <button className={`t-toggle ${medIncluded ? 'on' : ''}`} onClick={() => setMedIncluded((v) => !v)}><Check size={13} /></button>
            <div style={{ flex: 1 }}>
              <div className="t-acard-h"><span className="ic"><Pill size={16} /></span><span className="ttl">{MED_SEED.name}</span></div>
              <div className="t-acard-sub">Current sig: {MED_SEED.sig}</div>

              <div className="t-med-row">
                <div className="t-seg">
                  <button className={medMode === 'refill' ? 'on' : ''} onClick={() => setMedMode('refill')}>Refill</button>
                  <button className={`${medMode === 'discontinue' ? 'on danger' : ''}`} onClick={() => setMedMode('discontinue')}>Discontinue</button>
                </div>

                {medMode === 'refill' && (
                  <div className="t-fieldrow">
                    <div className="t-field">
                      <label>Refills</label>
                      <input className="t-input" type="number" min={0} value={refills} onChange={(e) => setRefills(Number(e.target.value))} />
                    </div>
                    <div className="t-field" style={{ flex: 1, minWidth: 180 }}>
                      <label>Pharmacy</label>
                      <select className="t-select" value={pharmacy} onChange={(e) => setPharmacy(e.target.value)} style={{ width: '100%' }}>
                        {PHARMACIES.map((p) => <option key={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>
                )}
              </div>
              <Trace done={signed}>{signed ? medTrace.done : medTrace.pending}</Trace>
            </div>
          </div>
        </div>

        {/* newly added meds */}
        {newMeds.map((m) => (
          <div className="t-acard" key={m.id}>
            <div className="t-acard-body">
              <button className="t-toggle on"><Check size={13} /></button>
              <div style={{ flex: 1 }}>
                <div className="t-acard-h">
                  <span className="ic"><Pill size={16} /></span><span className="ttl">{m.name}</span>
                  <button className="t-back" onClick={() => setNewMeds((x) => x.filter((y) => y.id !== m.id))}><X size={14} /></button>
                </div>
                <div className="t-acard-sub">New · {m.sig}</div>
                <Trace done={signed}>{signed ? `e-Rx sent — ${m.name}` : `Will e-prescribe — ${m.name}, ${m.sig}`}</Trace>
              </div>
            </div>
          </div>
        ))}

        {adding ? (
          <div className="t-acard">
            <div className="t-field" style={{ marginBottom: 8 }}>
              <label>Medication</label>
              <input className="t-select" value={draftName} onChange={(e) => setDraftName(e.target.value)} placeholder="e.g. Tranexamic acid 650 mg" style={{ width: '100%' }} autoFocus />
            </div>
            <div className="t-field" style={{ marginBottom: 10 }}>
              <label>Sig</label>
              <input className="t-select" value={draftSig} onChange={(e) => setDraftSig(e.target.value)} style={{ width: '100%' }} />
            </div>
            <div className="row" style={{ display: 'flex', gap: 8 }}>
              <button className="t-addmed" onClick={addMed}><Plus size={14} /> Add to Rx</button>
              <button className="t-addmed" style={{ color: 'var(--ink-3)' }} onClick={() => setAdding(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <button className="t-addmed" onClick={() => setAdding(true)}><Plus size={15} /> Add medication</button>
        )}

        {/* ORDERS */}
        <div className="t-ws-group">Orders</div>
        {orders.map((o) => (
          <div className={`t-acard ${o.included ? '' : 'excluded'}`} key={o.id}>
            <div className="t-acard-body">
              <button className={`t-toggle ${o.included ? 'on' : ''}`} onClick={() => toggleOrder(o.id)}><Check size={13} /></button>
              <div style={{ flex: 1 }}>
                <div className="t-acard-h"><span className="ic">{o.id === 'us' ? <Scan size={16} /> : <Stethoscope size={16} />}</span><span className="ttl">{o.title}</span></div>
                <div className="t-acard-sub">{o.detail}</div>
                <Trace done={signed && o.included}>{signed && o.included ? o.done : o.trace}</Trace>
              </div>
            </div>
          </div>
        ))}

        {/* FOLLOW-UP */}
        <div className="t-ws-group">Follow-up</div>
        <div className={`t-acard ${followup.included ? '' : 'excluded'}`}>
          <div className="t-acard-body">
            <button className={`t-toggle ${followup.included ? 'on' : ''}`} onClick={() => setFollowup((f) => ({ ...f, included: !f.included }))}><Check size={13} /></button>
            <div style={{ flex: 1 }}>
              <div className="t-acard-h"><span className="ic"><CalendarClock size={16} /></span><span className="ttl">{followup.title}</span></div>
              <div className="t-acard-sub">{followup.detail}</div>
              <Trace done={signed && followup.included}>{signed && followup.included ? followup.done : followup.trace}</Trace>
            </div>
          </div>
        </div>
      </div>

      <div className="t-right-foot">
        <button className={`t-signbtn ${signed ? 'done' : ''}`}
          onClick={() => { if (signed) return; setSigned(true); onToast(`Approved · ${count} action${count === 1 ? '' : 's'} carried out`); }}>
          {signed ? <><Check size={16} /> Done · {count} actions filed</> : <>Approve &amp; file · {count}</>}
        </button>
      </div>
    </aside>
  );
}
