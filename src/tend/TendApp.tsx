import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, ChevronLeft,
  Check, PenLine, LayoutGrid, FolderClosed, Pill, Plus, CornerDownRight,
  Stethoscope, Scan, CalendarClock, X, RefreshCw, FileText, Gauge,
  ScrollText, Columns3, ListTree, ChevronDown, MessageSquare, ClipboardCheck, Search,
} from 'lucide-react';
import './tend.css';
import TendRail from './TendRail';
import {
  RENATA, NOTE, PHARMACIES, MED_SEED, ORDER_SEED, FOLLOWUP_SEED, CHART_CATEGORIES, PROBLEMS,
  AI_ONELINER, FOCUS, ASK, BRIEF,
  type OrderAction, type ChartSection, type AskQA,
} from './tendData';

type Tab = 'overview' | 'visit' | 'chart';

export default function TendApp() {
  const [tab, setTab] = useState<Tab>('visit');
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (m: string) => { setToast(m); window.setTimeout(() => setToast(null), 2800); };

  return (
    <div className="tend-app">
      <span className="t-demo">Demo — fictional patient</span>
      <TendRail active="home" onToast={showToast} />

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
            : tab === 'chart' ? <ChartPage />
            : <div className="t-stub">Overview — coming soon.</div>}
        </div>
      </div>

      {tab === 'visit' && <ReadyToSign onToast={showToast} />}

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

/* ----------------------------------------------------------- Visit page (center note) */
function VisitPage({ onToast }: { onToast: (m: string) => void }) {
  const [examPE, setExamPE] = useState(false);
  const [carried, setCarried] = useState(false);

  return (
    <div className="t-note" style={{ marginTop: 4 }}>
      <div className="t-note-head">
        <span className="t-note-title">{NOTE.title}</span>
        <span className="t-ready"><Sparkles size={12} /> Draft</span>
      </div>
      <div className="t-note-byline">{NOTE.byline}</div>

      <div className="t-sec"><p><span className="t-idlabel">ID:</span> {NOTE.id}</p></div>

      <div className="t-sec"><div className="t-sec-h">Interval</div><p className="t-sec-p">{NOTE.interval}</p></div>

      <div className="t-sec">
        <div className="t-sec-h">Objective</div>

        <div className="t-sub">
          <div className="t-sub-h">Exam</div>
          {examPE ? (
            <p className="t-sec-p">{NOTE.normalPE} <button className="t-inline-action" onClick={() => setExamPE(false)}>clear</button></p>
          ) : (
            <div className="t-placeholder" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <span>To be documented during the visit</span>
              <button className="t-inline-action" onClick={() => setExamPE(true)}>Insert normal PE</button>
            </div>
          )}
        </div>

        <div className="t-sub">
          <div className="t-sub-h">
            Labs
            <span className="t-synced"><RefreshCw size={11} /> Synced from {NOTE.labsSource}</span>
          </div>
          <div className="t-labs">
            {NOTE.labs.map((l) => (
              <div className="t-lab-row" key={l.name}>
                <span className="t-lab-name">{l.name}</span>
                <span className={`t-lab-val ${l.abnormal ? 'abn' : ''}`}>{l.value}</span>
                <span className="t-lab-date">{l.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="t-sec">
        <div className="t-sec-h" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>{NOTE.planTitle}</span>
          {!carried && <button className="t-inline-action" onClick={() => setCarried(true)}>Carry forward previous A&amp;P</button>}
        </div>
        {carried && (
          <div className="t-think-item" style={{ borderStyle: 'dashed', marginBottom: 8 }}>
            <div className="t-think-guide" style={{ marginTop: 0 }}>
              <span className="lab">Carried forward · {NOTE.previousAnpDate}</span>
              <button className="t-inline-action" style={{ marginLeft: 'auto' }} onClick={() => setCarried(false)}>remove</button>
            </div>
            <div className="t-think-body" style={{ marginTop: 7 }}>{NOTE.previousAnp}</div>
          </div>
        )}
        <div className="t-think">
          {NOTE.plan.map((p) => (
            <div className="t-think-item" key={p.term}>
              <div className="t-think-top">{p.term}</div>
              <div className="t-think-body">{p.text}</div>
              {p.note && <div className="t-think-guide"><span className="lab">Guideline</span><span>{p.note}</span></div>}
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <button className="t-chip" style={{ borderBottom: 'none' }} onClick={() => onToast('Editing the note — not wired in this demo.')}>
          <PenLine size={14} /> Edit note
        </button>
      </div>
    </div>
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
  const [medIncluded, setMedIncluded] = useState(true);
  const [medMode, setMedMode] = useState<'refill' | 'discontinue'>('refill');
  const [refills, setRefills] = useState(MED_SEED.refills);
  const [pharmacy, setPharmacy] = useState(PHARMACIES[0]);
  const [newMeds, setNewMeds] = useState<{ id: string; name: string; sig: string }[]>([]);
  const [adding, setAdding] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftSig, setDraftSig] = useState('1 tab PO daily');

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

  const ph = pharmacy.split(' —')[0];
  const medTrace = medMode === 'refill'
    ? { pending: `Will e-prescribe — refill ×${refills} → ${ph}`, done: `e-Rx sent — refill ×${refills} → ${ph}` }
    : { pending: `Will discontinue ${MED_SEED.name.split(' (')[0]}`, done: 'Discontinued — removed from active medications' };

  return (
    <aside className="t-right">
      <div className="t-right-body">
        <div className="t-right-head"><Sparkles size={18} color="#6d3bec" /> Ready to sign</div>
        <p className="t-right-intro">
          I've drafted the close-out for this visit. Review or adjust each action — I'll carry it out and leave a trace.
        </p>

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
                  <button className={medMode === 'discontinue' ? 'on danger' : ''} onClick={() => setMedMode('discontinue')}>Discontinue</button>
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
            <div style={{ display: 'flex', gap: 14 }}>
              <button className="t-addmed" onClick={addMed}><Plus size={14} /> Add to Rx</button>
              <button className="t-addmed" style={{ color: 'var(--ink-3)' }} onClick={() => setAdding(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <button className="t-addmed" onClick={() => setAdding(true)}><Plus size={15} /> Add medication</button>
        )}

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
