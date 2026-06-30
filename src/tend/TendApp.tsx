import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, Search, Home, Inbox, ChevronDown, ChevronLeft, ChevronsUpDown,
  FileText, CalendarClock, Check, PenLine, LayoutGrid, FolderClosed,
} from 'lucide-react';
import './tend.css';
import {
  TEND_PROVIDER, RENATA, VISIT_REASONS, VISIT_TYPES, VISIT_SUMMARY, NOTE, SIGN_ACTIONS,
  type SignAction,
} from './tendData';

type Tab = 'overview' | 'visit' | 'chart';

export default function TendApp() {
  const [tab, setTab] = useState<Tab>('visit');
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (m: string) => { setToast(m); window.setTimeout(() => setToast(null), 2600); };

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
          <span className="t-ready"><Sparkles size={12} /> Ready to sign</span>
        </div>
        <div className="t-note-byline">{NOTE.byline}</div>

        <div className="t-sec"><div className="t-sec-h">Interval</div><p className="t-sec-p">{NOTE.interval}</p></div>
        <div className="t-sec"><div className="t-sec-h">Exam</div><p className="t-sec-p">{NOTE.exam}</p></div>

        <div className="t-sec">
          <div className="t-sec-h">Plan</div>
          <ul className="t-plan">
            {NOTE.plan.map((p) => (
              <li className="t-plan-item" key={p.term}>
                <span className="t-term">{p.term}</span> <span>{p.text}</span>
                {p.callout && (
                  <div className="t-callout"><b>{p.callout.label}</b> {p.callout.body}</div>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="t-sec">
          <div className="t-sec-h">Medications</div>
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

/* ----------------------------------------------------------- Right "Ready to sign" panel */
function ReadyToSign({ onToast }: { onToast: (m: string) => void }) {
  const [actions, setActions] = useState<SignAction[]>(SIGN_ACTIONS);
  const [signed, setSigned] = useState(false);
  const toggle = (id: string) => setActions((a) => a.map((x) => (x.id === id ? { ...x, checked: !x.checked } : x)));
  const count = 1 + actions.filter((a) => a.checked).length;

  // group actions in declared order
  const groups: { label: string; items: SignAction[] }[] = [];
  for (const a of actions) {
    let g = groups.find((x) => x.label === a.group);
    if (!g) { g = { label: a.group, items: [] }; groups.push(g); }
    g.items.push(a);
  }

  const Icon = ({ k }: { k: SignAction['icon'] }) => (k === 'calendar' ? <CalendarClock size={16} /> : <FileText size={16} />);

  return (
    <aside className="t-right">
      <div className="t-right-top">{RENATA.lastSeen}</div>
      <div className="t-right-body">
        <div className="t-right-head"><Sparkles size={18} color="#6d3bec" /> Ready to sign</div>
        <p className="t-right-intro">
          Visit complete. I finalized the note — here's the full close-out. Uncheck anything to exclude, then sign once.
        </p>

        <div className="t-sign-card">
          <PenLine size={17} className="ic" />
          <div>
            <div className="title">Sign &amp; file the visit note</div>
            <div className="sub">Coding 99213 · your coding agent will file it</div>
          </div>
        </div>

        {groups.map((g) => (
          <div key={g.label}>
            <div className="t-group-label">{g.label}</div>
            {g.items.map((a) => (
              <div className={`t-action ${a.checked ? '' : 'off'}`} key={a.id}>
                <button className={`t-check ${a.checked ? 'on' : ''}`} onClick={() => toggle(a.id)}>
                  <Check size={14} />
                </button>
                <span className="ic"><Icon k={a.icon} /></span>
                <span className="lbl">{a.label}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="t-right-foot">
        <button className={`t-signbtn ${signed ? 'done' : ''}`}
          onClick={() => { if (signed) return; setSigned(true); onToast(`Signed & filed · ${count} item${count === 1 ? '' : 's'} queued to your agents.`); }}>
          {signed ? <><Check size={16} /> Filed</> : <>Sign &amp; file · {count}</>}
        </button>
      </div>
    </aside>
  );
}
