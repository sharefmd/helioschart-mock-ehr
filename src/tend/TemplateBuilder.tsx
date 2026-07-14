import { useState, useRef, useEffect } from 'react';
import {
  LayoutTemplate, ChevronDown, Check, SlidersHorizontal, Save,
} from 'lucide-react';
import './tend.css';
import TendRail from './TendRail';
import {
  KIND_META, SPECIALTIES, SPECIALTY_ORDER, autoNormalEligible,
  type Kind, type Section, type Sample, type Grid, type LabelValue, type Specialty,
} from './templateData';

const KCLASS: Record<Kind, { badge: string; dot: string; tint: string }> = {
  'free-form': { badge: 'k-blue', dot: 'k-blue-dot', tint: 'tb-t-blue' },
  structured: { badge: 'k-green', dot: 'k-green-dot', tint: 'tb-t-green' },
  form: { badge: 'k-violet', dot: 'k-violet-dot', tint: 'tb-t-violet' },
  mixed: { badge: 'k-amber', dot: 'k-amber-dot', tint: 'tb-t-amber' },
};

function isGrid(s: Sample): s is Grid { return typeof s === 'object' && !Array.isArray(s) && 'cols' in s; }
function isStringList(s: Sample): s is string[] { return Array.isArray(s) && (s.length === 0 || typeof s[0] === 'string'); }
function splitItem(item: string): [string, string] {
  const idx = item.search(/[—:]/);
  return idx === -1 ? [item, ''] : [item.slice(0, idx).trim(), item.slice(idx + 1).trim()];
}

function KindBadge({ kind }: { kind: Kind }) {
  return <span className={`tb-badge ${KCLASS[kind].badge}`}>{KIND_META[kind].label}</span>;
}

function SampleRender({ section }: { section: Section }) {
  const s = section.sample;
  const tint = KCLASS[section.kind].tint;

  if (isGrid(s)) {
    return (
      <div className={`tb-table ${tint}`}>
        <table>
          <thead>
            <tr><th className="lab">Measure</th>{s.cols.map((c) => <th key={c}>{c}</th>)}</tr>
          </thead>
          <tbody>
            {s.rows.map((r) => (
              <tr key={r.label}><td className="lab">{r.label}</td>{r.values.map((v, i) => <td key={i} className="tb-cell-muted">{v}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  if (typeof s === 'string') {
    return <div className={`tb-block tb-t-blue`}>{s}</div>;
  }
  if (isStringList(s)) {
    return (
      <div className="tb-table tb-t-green">
        <table><tbody>
          {s.map((item) => {
            const [l, v] = splitItem(item);
            return <tr key={item}><td className="lab">{l}</td><td>{v || <span className="tb-cell-muted">—</span>}</td></tr>;
          })}
        </tbody></table>
      </div>
    );
  }
  const pairs = s as LabelValue[];
  return (
    <div className={`tb-table ${tint}`}>
      <table><tbody>
        {pairs.map((p) => <tr key={p.label}><td className="lab">{p.label}</td><td>{p.value}</td></tr>)}
      </tbody></table>
    </div>
  );
}

export default function TemplateBuilder() {
  const [specialty, setSpecialty] = useState<Specialty>('Psychiatry');
  const sections = SPECIALTIES[specialty].sections;
  const [selectedId, setSelectedId] = useState<string>(sections[0].id);
  const [autoNormal, setAutoNormal] = useState<Record<string, boolean>>({});
  const [tab, setTab] = useState<'build' | 'preview'>('build');
  const [dropOpen, setDropOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const showToast = (m: string) => { setToast(m); window.setTimeout(() => setToast(null), 2600); };
  const selected = sections.find((s) => s.id === selectedId) ?? sections[0];
  const anKey = (id: string) => `${specialty}::${id}`;

  useEffect(() => {
    const h = (e: MouseEvent) => { if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const changeSpecialty = (next: Specialty) => {
    setSpecialty(next);
    setSelectedId(SPECIALTIES[next].sections[0].id);
    setDropOpen(false);
  };
  const toggleAutoNormal = (section: Section) => {
    const key = anKey(section.id);
    const on = !autoNormal[key];
    setAutoNormal((prev) => ({ ...prev, [key]: on }));
    showToast(on ? `Auto-normal on for ${section.title}` : `Auto-normal off for ${section.title}`);
  };

  const counts = (Object.keys(KIND_META) as Kind[]).map((k) => ({ kind: k, n: sections.filter((s) => s.kind === k).length }));

  return (
    <div className="tend-app">
      <span className="t-demo">Demo — fictional patient</span>
      <TendRail active="templates" onToast={showToast} />

      <div className="tb-main">
        {/* header */}
        <header className="tb-head">
          <div className="h-left">
            <span className="h-logo"><LayoutTemplate size={18} /></span>
            <h1>Specialty Note Template</h1>
          </div>
          <div className="h-right">
            <div ref={dropRef} style={{ position: 'relative' }}>
              <button className="tb-specialty" onClick={() => setDropOpen((o) => !o)}>
                <span>
                  <span className="s-name" style={{ display: 'block' }}>{specialty}</span>
                  <span className="s-tag">{SPECIALTIES[specialty].tagline}</span>
                </span>
                <ChevronDown size={15} style={{ color: 'var(--ink-3)' }} />
              </button>
              {dropOpen && (
                <div className="t-menu" style={{ right: 0, left: 'auto', top: '110%', minWidth: 280 }}>
                  {SPECIALTY_ORDER.map((s) => (
                    <div key={s} className="t-menu-item" onClick={() => changeSpecialty(s)}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 600 }}>{s}</span>
                        {s === specialty && <Check size={15} style={{ color: 'var(--violet)' }} />}
                      </div>
                      <div className="s-tag">{SPECIALTIES[s].tagline}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button className="tb-btn" onClick={() => showToast('Section-level customization is coming soon.')}>
              <SlidersHorizontal size={15} /> Customize
            </button>
            <button className="tb-btn primary" onClick={() => showToast(`${specialty} note template saved.`)}>
              <Save size={15} /> Save template
            </button>
          </div>
        </header>

        <div className="tb-scroll">
          {/* legend */}
          <div className="tb-legend">
            <div className="lg-title">Every section has a format that fits how it's read:</div>
            <div className="tb-legend-grid">
              {counts.map(({ kind, n }) => (
                <div key={kind} className="tb-legend-item">
                  <KindBadge kind={kind} />
                  <div>
                    <div className="lg-desc">{KIND_META[kind].desc}</div>
                    <div className="lg-count">{n} section{n === 1 ? '' : 's'} in this specialty</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* tabs */}
          <div className="t-tabs" style={{ marginBottom: 16 }}>
            <button className={`t-tab ${tab === 'build' ? 'active' : ''}`} onClick={() => setTab('build')}>Build</button>
            <button className={`t-tab ${tab === 'preview' ? 'active' : ''}`} onClick={() => setTab('preview')}>Preview note</button>
          </div>

          {tab === 'build' ? (
            <div className="tb-cols">
              {/* section list */}
              <aside className="tb-side">
                <div className="side-title">{specialty} sections</div>
                {sections.map((s) => {
                  const on = autoNormal[anKey(s.id)];
                  return (
                    <button key={s.id} className={`tb-side-item ${s.id === selectedId ? 'active' : ''}`} onClick={() => setSelectedId(s.id)}>
                      <span className={`tb-dot ${KCLASS[s.kind].dot}`} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</span>
                      {s.optional && <span className="opt">opt</span>}
                      {autoNormalEligible(s.id) && on && <span className="an-on" title="Auto-normal on" />}
                    </button>
                  );
                })}
              </aside>

              {/* detail */}
              <section className="tb-detail">
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
                  <h2>{selected.title}</h2>
                  <KindBadge kind={selected.kind} />
                  {selected.optional && <span className="tb-badge k-blue" style={{ background: '#eef0f3', color: 'var(--ink-2)', borderColor: 'var(--border)' }}>Optional</span>}
                </div>
                <p className="tb-why">{selected.why}</p>

                {autoNormalEligible(selected.id) && (
                  <div className="tb-autonormal">
                    <button className={`tb-switch ${autoNormal[anKey(selected.id)] ? 'on' : ''}`} onClick={() => toggleAutoNormal(selected)} aria-label="Toggle auto-normal">
                      <span className="knob" />
                    </button>
                    <div>
                      <div className="an-label">Assume normal unless the transcript says otherwise</div>
                      <div className="an-sub">When on, we auto-populate normal findings and only change the items your transcript specifically describes as abnormal or positive.</div>
                    </div>
                  </div>
                )}

                <div className="tb-sub">Sample output</div>
                <SampleRender section={selected} />
              </section>
            </div>
          ) : (
            <article className="tb-note">
              <div className="tb-note-head">
                <div className="tb-note-kicker">{specialty} · sample note</div>
                <h2 style={{ fontSize: 17, fontWeight: 700, marginTop: 3 }}>Progress Note</h2>
              </div>
              {sections.map((s) => (
                <div className="tb-note-sec" key={s.id}>
                  <div className="ns-head">
                    <span className="ns-title">{s.title}</span>
                    <KindBadge kind={s.kind} />
                    {s.optional && <span className="s-tag">(optional)</span>}
                  </div>
                  <SampleRender section={s} />
                </div>
              ))}
            </article>
          )}
        </div>
      </div>

      {toast && <div className="t-toast"><Check size={15} /> {toast}</div>}
    </div>
  );
}
