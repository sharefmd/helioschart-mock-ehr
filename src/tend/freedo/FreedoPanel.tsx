import { useEffect, useRef, useState } from 'react';
import {
  ChevronUp, ChevronRight, ArrowUp, PenLine,
  Check, RotateCcw, ShieldCheck, X, ArrowUpRight,
} from 'lucide-react';
import { useVisit, SCENARIOS, type Item } from './VisitStore';
import Surface from './surfaces';

/* ---------------------------------------------- one streamed item */

function Thought({ secs, body }: { secs: number; body: string }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="f-th">
      <button className="f-th-h" onClick={() => setOpen((o) => !o)}>
        <span>Thought for {secs} second{secs === 1 ? '' : 's'}</span>
        {open ? <ChevronUp size={13} /> : <ChevronRight size={13} />}
      </button>
      {open && <p className="f-th-b">{body}</p>}
    </div>
  );
}

function Table({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <div className="f-tbl">
      <div className="f-tbl-h">
        <span className="t">{title}</span>
        <button className="f-edit"><PenLine size={12} /> Edit</button>
      </div>
      <dl className="f-tbl-rows">
        {rows.map(([k, v]) => (
          <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
        ))}
      </dl>
    </div>
  );
}

function SurfaceBlock({ item }: { item: Item }) {
  const { scenario, kept, keep } = useVisit();
  if (!item.surface) return null;
  const pinned = kept.some((k) => k.id === item.surface);
  return (
    <div className="f-surf">
      <div className="f-surf-h">
        <span className="t">{item.title}</span>
        <span className="m">{item.meta}</span>
        <button className="f-edit"><PenLine size={12} /> Edit</button>
      </div>
      <Surface id={item.surface} />
      <div className="f-surf-f">
        <span>
          {pinned
            ? <>Pinned as <b>{item.tab}</b> — reusable for every {scenario.specialty.toLowerCase()} patient.</>
            : <>New surface — not a reordered chart.</>}
        </span>
        <button
          className={`f-keep ${pinned ? 'on' : ''}`}
          onClick={() => keep(item.surface!, item.tab ?? item.title ?? 'Surface')}
        >
          {pinned ? <><Check size={12} /> Kept</> : `Keep for ${scenario.specialty}`}
        </button>
      </div>
    </div>
  );
}

function Row({ item }: { item: Item }) {
  switch (item.k) {
    case 'you':
      return <div className="f-you">{item.text}</div>;
    case 'tool':
      return <div className="f-tool">{item.text}</div>;
    case 'thought':
      return <Thought secs={item.secs ?? 1} body={item.body ?? ''} />;
    case 'say':
      return <p className="f-say">{item.text}</p>;
    case 'insight':
      return (
        <div className="f-insight">
          <p className="f-insight-t">{item.text}</p>
          {item.ref && (
            <a className="f-ref" href={item.ref.href} target="_blank" rel="noreferrer">
              {item.ref.label}
              <ArrowUpRight size={13} />
            </a>
          )}
        </div>
      );
    case 'table':
      return <Table title={item.title ?? ''} rows={item.rows ?? []} />;
    case 'surface':
      return <SurfaceBlock item={item} />;
    default:
      return null;
  }
}

/* ---------------------------------------------- "this visit" rail */

/** The path to closing the visit. Four actionable steps, ending in the bill. */
function CloseRail() {
  const { scenario, step, skipped, closed, complete, skipStep } = useVisit();
  const [reviewing, setReviewing] = useState(false);
  const steps = scenario.close;

  return (
    <div className="f-rail">
      <div className="f-rail-h">
        <span>Closing this visit</span>
        <span className="f-rail-n">
          {closed ? 'all done' : `${step} of ${steps.length}`}
        </span>
      </div>

      {steps.map((c, i) => {
        const was = skipped.includes(i);
        const state = i < step ? (was ? 'skipped' : 'done') : i === step ? 'now' : 'next';
        return (
          <div className={`f-rung ${state} ${i === steps.length - 1 ? 'last' : ''}`} key={c.verb}>
            <span className="f-dot">{state === 'done' && <Check size={9} strokeWidth={3.5} />}</span>
            <div className="f-rung-b">
              <span className="f-rung-v">{c.verb}</span>
              <div className="f-rung-ti">{c.what}</div>
              <div className="f-rung-d">{state === 'done' ? c.done : was ? 'Skipped' : c.detail}</div>
              {state === 'now' && !reviewing && (
                <div className="f-rung-a">
                  <button className="f-approve" onClick={complete}>Approve</button>
                  <button className="f-review" onClick={() => setReviewing(true)}>Review</button>
                  <button className="f-skipstep" onClick={skipStep}>Skip</button>
                </div>
              )}

              {state === 'now' && reviewing && (
                <div className="f-prev">
                  <div className="f-prev-h">
                    <ShieldCheck size={13} />
                    <span>Exactly what will be sent</span>
                    <button className="f-prev-x" onClick={() => setReviewing(false)} aria-label="Close preview">
                      <X size={13} />
                    </button>
                  </div>
                  <dl className="f-prev-rows">
                    {c.review.map((r) => (
                      <div key={r.k}>
                        <dt>{r.k}</dt>
                        <dd>
                          <span className="v">{r.v}</span>
                          {r.src && <span className="s">{r.src}</span>}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  <div className="f-prev-f">
                    <button className="f-approve" onClick={() => { setReviewing(false); complete(); }}>
                      Confirm &amp; approve
                    </button>
                    <button className="f-review" onClick={() => setReviewing(false)}>Back</button>
                    <span className="f-prev-note">Nothing has been sent yet.</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {closed && (
        <div className="f-closed"><Check size={14} /> Visit closed — everything routed</div>
      )}
    </div>
  );
}

/* ---------------------------------------------- panel */

export default function FreedoPanel() {
  const {
    scenario, items, streaming, ask, closed, reset, setScenario, remaining,
    kept, tab, setTab, unkeep,
  } = useVisit();

  const [text, setText] = useState('');
  const scroll = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scroll.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [items.length]);

  const send = (t = text) => {
    const v = t.trim();
    if (!v) return;
    ask(v);
    setText('');
  };

  const suggestion = scenario.asks[0];
  const used = items.some((i) => i.k === 'you');

  return (
    <section className="f-panel">
      <header className="f-top">
        <span className="f-brand">Freedo</span>
        <div className="f-tabs">
          <button className={tab === 'visit' ? 'on' : ''} onClick={() => setTab('visit')}>Visit</button>
          {kept.map((k) => (
            <button key={k.id} className={`pin ${tab === k.id ? 'on' : ''}`} onClick={() => setTab(k.id)}>
              {k.label}
            </button>
          ))}
          <button className={tab === 'followups' ? 'on' : ''} onClick={() => setTab('followups')}>Follow-ups</button>
          <button className={tab === 'internal' ? 'on' : ''} onClick={() => setTab('internal')}>Internal</button>
        </div>
        <div className="f-top-end">
          <select
            className="f-spec"
            value={scenario.id}
            onChange={(e) => setScenario(e.target.value)}
            aria-label="Specialty"
          >
            {SCENARIOS.map((s) => <option key={s.id} value={s.id}>{s.specialty}</option>)}
          </select>
          <button className="f-icon" onClick={reset} title="Start over"><RotateCcw size={13} /></button>
        </div>
      </header>

      {tab === 'visit' && (
        <div className="f-scroll" ref={scroll}>
          <CloseRail />
          {items.length > 1 && <div className="f-streamh">Conversation</div>}
          {items.map((i) => <Row item={i} key={i.id} />)}
          {streaming && <div className="f-tool pulse">Working…</div>}
        </div>
      )}

      {kept.map((k) => tab === k.id && (
        <div className="f-scroll" key={k.id}>
          <div className="f-pinhead">
            <div>
              <div className="f-pinhead-t">{k.label}</div>
              <div className="f-pinhead-s">
                Pinned surface · runs the same way for every {scenario.specialty.toLowerCase()} patient
              </div>
            </div>
            <button className="f-edit" onClick={() => unkeep(k.id)}>Remove</button>
          </div>
          <div className="f-pinbody"><Surface id={k.id as never} /></div>
        </div>
      ))}

      {tab === 'followups' && (
        <div className="f-scroll"><p className="f-say">Nothing outstanding yet. Follow-ups appear here once the visit closes.</p></div>
      )}
      {tab === 'internal' && (
        <div className="f-scroll"><p className="f-say">Internal notes are visible to your team and never leave the practice.</p></div>
      )}

      <div className="f-foot">
        {suggestion && !used && (
          <button className="f-suggest" onClick={() => send(suggestion.prompt)}>
            <span className="q">“{suggestion.prompt}”</span>
            <span className="go">{suggestion.chip}</span>
          </button>
        )}
        <div className="f-composer">
          <textarea
            rows={1}
            value={text}
            placeholder="Ask Freedo"
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          />
          <button className="f-send" onClick={() => send()} aria-label="Send"><ArrowUp size={14} /></button>
        </div>
        <div className="f-chips">
          <button onClick={() => send('Draft the orders.')}>Orders</button>
          <button onClick={() => send('What should I follow up on?')}>Follow Ups</button>
          <button onClick={() => send('Add an internal note.')}>Internal Notes</button>
          <span className={`f-status ${closed ? 'done' : ''}`}>
            {closed ? <><Check size={12} /> Visit closed</> : `${remaining} step${remaining === 1 ? '' : 's'} to close`}
          </span>
        </div>
      </div>
    </section>
  );
}
