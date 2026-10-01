import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, ChevronLeft, Check, LayoutGrid, FolderClosed,
  Stethoscope, RefreshCw, FileText, Gauge,
  ScrollText, Columns3, ListTree, ChevronDown, MessageSquare, ClipboardCheck, Search,
} from 'lucide-react';
import './tend.css';
import './freedo/freedo.css';
import TendRail from './TendRail';
import { VisitProvider } from './freedo/VisitStore';
import Workspace from './freedo/Workspace';
import DemoSheet from './freedo/DemoSheet';
import {
  RENATA, CHART_CATEGORIES, PROBLEMS,
  AI_ONELINER, FOCUS, ASK, BRIEF,
  type ChartSection, type AskQA,
} from './tendData';

type Tab = 'overview' | 'visit' | 'chart';

export default function TendApp() {
  return (
    <VisitProvider>
      <TendInner />
    </VisitProvider>
  );
}

function TendInner() {
  const [tab, setTab] = useState<Tab>('visit');
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (m: string) => { setToast(m); window.setTimeout(() => setToast(null), 2800); };

  return (
    <div className="tend-app">
      <span className="t-demo">Demo — fictional patient</span>
      <TendRail
        active="home"
        onToast={showToast}
        onTour={() => setTab('visit')}
        userPanel={(close) => <DemoSheet onDone={close} />}
      />

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

        {tab === 'visit' ? (
          <Workspace />
        ) : (
          <div className="t-scroll">
            {tab === 'chart' ? <ChartPage /> : <div className="t-stub">Overview — coming soon.</div>}
          </div>
        )}
      </div>

      {toast && <div className="t-toast"><Check size={15} /> {toast}</div>}
    </div>
  );
}


/* ----------------------------------------------------------- Patient header */
function PatientHeader() {
  const nav = useNavigate();
  return (
    <div className="t-pthead">
      <button className="t-back" onClick={() => nav('/schedule')}><ChevronLeft size={18} /></button>
      <span className="t-ptname">{RENATA.name}</span>
      <span className="t-ptmeta">{RENATA.age} · {RENATA.sex}</span>
    </div>
  );
}

/* ----------------------------------------------------------- Chart page */
type IconT = typeof Sparkles;
type ChartMode = 'focus' | 'ask' | 'brief' | 'categories' | 'problems' | 'snapshot' | 'document' | 'board' | 'outline';
const CHART_MODES: { id: ChartMode; label: string; icon: IconT; group: 'ai' | 'detail' }[] = [
  { id: 'focus', label: 'Focus', icon: Sparkles, group: 'ai' },
  { id: 'ask', label: 'Ask', icon: MessageSquare, group: 'ai' },
  { id: 'brief', label: 'Brief', icon: ClipboardCheck, group: 'ai' },
  { id: 'categories', label: 'Categories', icon: LayoutGrid, group: 'detail' },
  { id: 'problems', label: 'By Problem', icon: Stethoscope, group: 'detail' },
  { id: 'snapshot', label: 'Snapshot', icon: Gauge, group: 'detail' },
  { id: 'document', label: 'Document', icon: ScrollText, group: 'detail' },
  { id: 'board', label: 'Board', icon: Columns3, group: 'detail' },
  { id: 'outline', label: 'Outline', icon: ListTree, group: 'detail' },
];

function ChartPage() {
  const [mode, setMode] = useState<ChartMode>('focus');
  return (
    <div className="t-chart">
      <div className="t-modebar">
        {CHART_MODES.map((m, i) => {
          const Icon = m.icon;
          const sep = i > 0 && CHART_MODES[i - 1].group !== m.group;
          return (
            <span key={m.id} style={{ display: 'contents' }}>
              {sep && <span className="t-mode-sep" />}
              <button className={`t-mode ${mode === m.id ? 'active' : ''}`} onClick={() => setMode(m.id)}>
                <Icon size={14} /> {m.label}
              </button>
            </span>
          );
        })}
      </div>
      {mode === 'focus' && <FocusView />}
      {mode === 'ask' && <AskView />}
      {mode === 'brief' && <BriefView />}
      {mode === 'categories' && <CategoriesView />}
      {mode === 'problems' && <ProblemsView />}
      {mode === 'snapshot' && <SnapshotView />}
      {mode === 'document' && <DocumentView />}
      {mode === 'board' && <BoardView />}
      {mode === 'outline' && <OutlineView />}
    </div>
  );
}

/* A collapsible "complete chart" so the minimalist views stay lossless. */
function FullRecordDisclosure() {
  const [open, setOpen] = useState(false);
  return (
    <div className="t-fullrec">
      <button className="t-fullrec-btn" onClick={() => setOpen((o) => !o)}>
        <ChevronDown size={15} className={`t-ol-chev ${open ? '' : 'closed'}`} />
        {open ? 'Hide complete chart' : 'Open complete chart'}
      </button>
      {open && <div className="t-fullrec-body"><AllSections /></div>}
    </div>
  );
}

/* ---- Mode: Focus (the one decision + a little context) ---- */
function FocusView() {
  return (
    <div className="t-focus">
      <div className="t-focus-kicker"><Sparkles size={13} /> Focus · what matters now</div>
      <p className="t-focus-one">{AI_ONELINER}</p>

      <div className="t-decide">
        <div className="t-decide-tag">Decide today</div>
        <div className="t-decide-title">{FOCUS.decision.title}</div>
        <div className="t-decide-why">{FOCUS.decision.why}</div>
        <div className="t-cite-row">
          {FOCUS.decision.evidence.map((c, i) => <span className="t-cite" key={i}>{c}</span>)}
        </div>
      </div>

      <div className="t-ak-h">Also worth knowing</div>
      <div className="t-ak-list">
        {FOCUS.alsoKnow.map((a, i) => (
          <div className="t-ak-row" key={i}><span className="t-ak-label">{a.label}</span><span>{a.text}</span></div>
        ))}
      </div>

      <FullRecordDisclosure />
    </div>
  );
}

/* ---- Mode: Ask (conversational Q&A over the chart) ---- */
function AskView() {
  const [q, setQ] = useState('');
  const [answer, setAnswer] = useState<AskQA | null>(null);

  const run = (text: string) => {
    const t = text.toLowerCase();
    const ranked = ASK
      .map((a) => ({ a, score: a.q.toLowerCase().split(/\W+/).filter((w) => w.length > 3 && t.includes(w)).length }))
      .sort((x, y) => y.score - x.score)[0];
    setAnswer(ranked && ranked.score > 0 ? ranked.a
      : { q: text, a: 'I can answer from anything in Renata’s chart. Try a suggested question below, or open the complete chart.' });
  };

  return (
    <div className="t-readcol">
      <div className="t-ask-head"><Sparkles size={16} /> Ask this chart</div>
      <form className="t-ask-input" onSubmit={(e) => { e.preventDefault(); if (q.trim()) run(q); }}>
        <Search size={15} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask anything about Renata…" />
      </form>

      <div className="t-ask-suggest">
        {ASK.map((qa, i) => (
          <button className={`t-ask-chip ${answer?.q === qa.q ? 'active' : ''}`} key={i}
            onClick={() => { setQ(qa.q); setAnswer(qa); }}>{qa.q}</button>
        ))}
      </div>

      {answer && (
        <div className="t-ask-answer">
          <div className="t-ask-q"><MessageSquare size={14} /> {answer.q}</div>
          <p className="t-ask-a">{answer.a}</p>
          {answer.cites && (
            <div className="t-cite-row">{answer.cites.map((c, i) => <span className="t-cite" key={i}>{c}</span>)}</div>
          )}
        </div>
      )}

      <FullRecordDisclosure />
    </div>
  );
}

/* ---- Mode: Brief (the 20-second pre-visit read) ---- */
function BriefBlock({ title, items, accent }: { title: string; items: string[]; accent?: boolean }) {
  return (
    <div className={`t-brief-block ${accent ? 'accent' : ''}`}>
      <div className="t-brief-h">{title}</div>
      <ul className="t-clist">{items.map((x, i) => <li key={i}>{x}</li>)}</ul>
    </div>
  );
}
function BriefView() {
  return (
    <div className="t-readcol">
      <div className="t-brief">
        <div className="t-brief-top">
          <span className="t-brief-kick"><ClipboardCheck size={14} /> Pre-visit brief</span>
          <span className="t-brief-sub">20-second read</span>
        </div>
        <p className="t-brief-one">{AI_ONELINER}</p>
        <BriefBlock title={`Since last visit · ${BRIEF.sinceLast.date}`} items={BRIEF.sinceLast.items} accent />
        <BriefBlock title="Decide today" items={BRIEF.decideToday} />
        <BriefBlock title="Pending" items={BRIEF.pending} />
        <BriefBlock title="Ask her" items={BRIEF.askHer} />
      </div>
      <FullRecordDisclosure />
    </div>
  );
}

/* Renders EVERY section of the chart (single source of truth) so the
   By Problem and Snapshot formats stay lossless. */
function AllSections() {
  return (
    <>
      {CHART_CATEGORIES.map((c) => (
        <section className="t-allsec" key={c.id}>
          <div className="t-group-hdr">{c.label}</div>
          {c.sections.map((s) => (
            <div className="t-sec" key={s.id}>
              <div className="t-sec-h">{s.title}{s.tag && <span className="t-tagpill">{s.tag}</span>}</div>
              <SectionBody section={s} />
            </div>
          ))}
        </section>
      ))}
    </>
  );
}

/* ---- Mode 1: Categories (horizontal category nav) ---- */
function CategoriesView() {
  const [active, setActive] = useState(CHART_CATEGORIES[0].id);
  const cat = CHART_CATEGORIES.find((c) => c.id === active) ?? CHART_CATEGORIES[0];
  return (
    <>
      <div className="t-catbar">
        {CHART_CATEGORIES.map((c) => (
          <button key={c.id} className={`t-cat ${c.id === active ? 'active' : ''}`} onClick={() => setActive(c.id)}>
            {c.label}
            {c.count != null && <span className="t-cat-count">{c.count}</span>}
          </button>
        ))}
      </div>
      <div className="t-cat-body">
        {cat.sections.map((s) => (
          <div className="t-sec" key={s.id}>
            <div className="t-sec-h">
              {s.title}
              {s.tag && <span className="t-tagpill">{s.tag}</span>}
            </div>
            <SectionBody section={s} />
          </div>
        ))}
      </div>
    </>
  );
}

/* ---- Mode 2: By Problem (dx-clustered lens + the full record below) ---- */
function ProbMini({ label, items, accent }: { label: string; items: string[]; accent?: boolean }) {
  return (
    <div className="t-prob-mini">
      <div className="t-mini-h">{label}</div>
      <ul className={accent ? 't-plan-list' : 't-clist'}>{items.map((x, i) => <li key={i}>{x}</li>)}</ul>
    </div>
  );
}
function ProblemsView() {
  return (
    <div className="t-readcol">
      <div className="t-group-hdr">Active Problems</div>
      {PROBLEMS.map((p, i) => (
        <div className="t-prob" key={i}>
          <div className="t-prob-head">
            <span className="t-prob-name">{p.name}</span>
            <span className={`t-prob-status s-${p.status.toLowerCase()}`}>{p.status}</span>
          </div>
          <div className="t-prob-meta">{[p.icd, p.onset && `since ${p.onset}`].filter(Boolean).join(' · ')}</div>
          <p className="t-prob-assess">{p.assessment}</p>
          {p.meds && <ProbMini label="Medications" items={p.meds} />}
          {p.results && (
            <div className="t-prob-mini">
              <div className="t-mini-h">Results</div>
              <div className="t-labs">
                {p.results.map((r, j) => (
                  <div className="t-lab-row" key={j}>
                    <span className="t-lab-name">{r.name}</span>
                    <span className={`t-lab-val ${r.abnormal ? 'abn' : ''}`}>{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {p.imaging && <ProbMini label="Imaging" items={p.imaging} />}
          {p.plan && <ProbMini label="Plan" items={p.plan} accent />}
        </div>
      ))}

      {/* everything else in the chart, so this format stays lossless */}
      <div className="t-complete-note">Full record below — every chart section, unabridged.</div>
      <AllSections />
    </div>
  );
}

/* ---- Mode 3: Snapshot (dense one-page — every section as a compact card) ---- */
function SnapshotView() {
  const sections = CHART_CATEGORIES.flatMap((c) => c.sections);
  return (
    <div className="t-snapgrid">
      {sections.map((s) => (
        <div className="t-snapcard" key={s.id}>
          <div className="t-snapcard-h">{s.title}{s.tag && <span className="t-tagpill">{s.tag}</span>}</div>
          <SectionBody section={s} />
        </div>
      ))}
    </div>
  );
}

/* ---- Mode 4: Document (formal longform "paper" chart) ---- */
function DocumentView() {
  return (
    <div className="t-doc">
      <div className="t-doc-head">
        <div className="t-doc-title">Comprehensive Chart</div>
        <div className="t-doc-by">{RENATA.name} · 32 · Female · MRN TND-100294 · Dr. Alanna Reyes (OB/GYN)</div>
      </div>
      {CHART_CATEGORIES.map((c) => (
        <div className="t-doc-cat" key={c.id}>
          <div className="t-doc-cat-h">{c.label}</div>
          {c.sections.map((s) => (
            <div className="t-doc-sec" key={s.id}>
              <div className="t-doc-sec-h">{s.title}{s.tag && <span className="t-tagpill">{s.tag}</span>}</div>
              <SectionBody section={s} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ---- Mode 5: Board (horizontal kanban — one column per category) ---- */
function BoardView() {
  return (
    <div className="t-board">
      {CHART_CATEGORIES.map((c) => (
        <div className="t-board-col" key={c.id}>
          <div className="t-board-col-h">{c.label}{c.count != null && <span className="t-cat-count">{c.count}</span>}</div>
          {c.sections.map((s) => (
            <div className="t-board-card" key={s.id}>
              <div className="t-board-card-h">{s.title}{s.tag && <span className="t-tagpill">{s.tag}</span>}</div>
              <SectionBody section={s} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ---- Mode 6: Outline (collapsible drill-down tree of every section) ---- */
function OutlineView() {
  const allIds = CHART_CATEGORIES.flatMap((c) => c.sections.map((s) => s.id));
  const [open, setOpen] = useState<Record<string, boolean>>(() => Object.fromEntries(allIds.map((id) => [id, true])));
  const allOpen = allIds.every((id) => open[id]);
  const toggleAll = () => setOpen(Object.fromEntries(allIds.map((id) => [id, !allOpen])));
  const toggle = (id: string) => setOpen((o) => ({ ...o, [id]: !o[id] }));

  return (
    <div className="t-readcol">
      <div className="t-outline-bar">
        <button className="t-inline-action" onClick={toggleAll}>{allOpen ? 'Collapse all' : 'Expand all'}</button>
      </div>
      {CHART_CATEGORIES.map((c) => (
        <div className="t-ol-cat" key={c.id}>
          <div className="t-group-hdr">{c.label}</div>
          {c.sections.map((s) => (
            <div className="t-ol-node" key={s.id}>
              <button className="t-ol-row" onClick={() => toggle(s.id)}>
                <ChevronDown size={14} className={`t-ol-chev ${open[s.id] ? '' : 'closed'}`} />
                <span className="t-ol-title">{s.title}</span>
                {s.tag && <span className="t-tagpill">{s.tag}</span>}
              </button>
              {open[s.id] && <div className="t-ol-body"><SectionBody section={s} /></div>}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function SectionBody({ section }: { section: ChartSection }) {
  if (section.empty || !section.block) {
    const reason = section.tag === 'peds' ? 'Pediatric section — not applicable to this patient'
      : section.tag === 'psych' ? 'Behavioral-health section — not used this encounter'
      : 'Not documented for this encounter';
    return <div className="t-placeholder">{reason}</div>;
  }
  const b = section.block;
  switch (b.kind) {
    case 'text':
      return <p className="t-sec-p">{b.text}</p>;
    case 'list':
      return <ul className="t-clist">{b.items.map((x, i) => <li key={i}>{x}</li>)}</ul>;
    case 'kv':
      return (
        <div className="t-kv">
          {b.items.map((x, i) => (
            <div className="t-kv-row" key={i}><span className="k">{x.k}</span><span className="v">{x.v}</span></div>
          ))}
        </div>
      );
    case 'meds':
      return (
        <div className="t-mlist">
          {b.items.map((m, i) => (
            <div className="t-med" key={i}>
              <span className="mn">{m.name}</span> <span className="md">· {m.sig}{m.status ? ` · ${m.status}` : ''}</span>
            </div>
          ))}
        </div>
      );
    case 'grid':
      return (
        <div>
          {b.source && (
            <div className="t-sub-h" style={{ marginBottom: 6 }}>
              <span className="t-synced"><RefreshCw size={11} /> Synced from {b.source}</span>
            </div>
          )}
          <div className="t-gridscroll">
            <table className="t-grid">
              <thead>
                <tr>
                  <th className="rowh" />
                  {b.dates.map((d, i) => <th key={i}>{d}</th>)}
                </tr>
              </thead>
              <tbody>
                {b.rows.map((r, i) => (
                  <tr key={i}>
                    <td className="rowh">{r.label}</td>
                    {r.cells.map((c, j) => <td key={j} className={c.abn ? 'abn' : ''}>{c.v}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    case 'rads':
      return (
        <div className="t-think">
          {b.items.map((rx, i) => (
            <div className="t-think-item" key={i}>
              <div className="t-think-top" style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <span>{rx.study}</span><span className="t-lab-date">{rx.date}</span>
              </div>
              <div className="t-think-body">{rx.impression}</div>
            </div>
          ))}
        </div>
      );
    case 'visits':
      return (
        <div className="t-vlist">
          {b.items.map((v, i) => (
            <div className={`t-vrow ${v.current ? 'current' : ''}`} key={i}>
              <div className="t-vdate">{v.date}</div>
              <div className="t-vmain">
                <div className="t-vtype">{v.type}{v.current && <span className="t-badge-now">Today</span>}</div>
                <div className="t-vsum">{v.summary}</div>
                <div className="t-vprov">{v.provider}</div>
              </div>
            </div>
          ))}
        </div>
      );
    case 'docs':
      return (
        <div className="t-doclist">
          {b.items.map((d, i) => (
            <div className="t-docrow" key={i}>
              <FileText size={15} className="t-docic" />
              <div className="t-docmain">
                <div className="t-docname">{d.name}{d.outside && <span className="t-badge-out">Outside</span>}</div>
                <div className="t-docmeta">{d.type} · {d.source} · {d.date}</div>
              </div>
            </div>
          ))}
        </div>
      );
    default:
      return null;
  }
}
