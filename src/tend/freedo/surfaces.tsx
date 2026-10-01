// ============================================================
// NET-NEW SURFACES — the expensive end of the customization
// spectrum. These are not reorderings of the chart; each is
// closer to an app. Freedo hosts them and fills them with data.
// ============================================================

import type { FC } from 'react';

const V = '#6d3bec';
const INK = '#6b6b73';
const FAINT = '#c9c7c2';

export type SurfaceId =
  | 'growth' | 'bodymap' | 'chemo' | 'cgm' | 'dialysis' | 'device' | 'route';

/* ---------------------------------------------- peds · growth curves */
function Growth() {
  return (
    <svg viewBox="0 0 300 168" className="s-svg" role="img"
      aria-label="Weight for age fell from the 25th to the 9th centile over nine months">
      <g fill="none" stroke={FAINT} strokeWidth="1.2">
        <path d="M32 118 C92 98 160 76 272 44" />
        <path d="M32 130 C92 114 160 96 272 66" />
        <path d="M32 142 C92 130 160 116 272 90" />
      </g>
      <g fontSize="7.5" fill={INK} opacity="0.75">
        <text x="276" y="44">50th</text><text x="276" y="68">25th</text><text x="276" y="92">3rd</text>
      </g>
      <g stroke={FAINT} strokeWidth="1"><line x1="32" y1="152" x2="272" y2="152" /></g>
      <polyline fill="none" stroke={V} strokeWidth="2.2" strokeLinecap="round"
        points="58,132 104,126 150,124 196,125 248,127" />
      <g fill={V}>
        <circle cx="58" cy="132" r="3.2" /><circle cx="104" cy="126" r="3.2" />
        <circle cx="150" cy="124" r="3.2" /><circle cx="196" cy="125" r="3.2" />
        <circle cx="248" cy="127" r="4.2" />
      </g>
      <text x="244" y="118" fontSize="8.5" fontWeight="700" fill={V} textAnchor="end">11.1 kg · 9th</text>
      <g fontSize="7.5" fill={INK} opacity="0.75" textAnchor="middle">
        <text x="58" y="163">12 m</text><text x="104" y="163">15 m</text><text x="150" y="163">18 m</text>
        <text x="196" y="163">21 m</text><text x="248" y="163">28 m</text>
      </g>
      <text x="32" y="22" fontSize="8.5" fill={INK}>Weight for age · boys · WHO</text>
    </svg>
  );
}

/* ---------------------------------------------- derm · body map + photo timeline */
function BodyMap() {
  const photos = [
    { d: 'Mar', mm: '6 mm' }, { d: 'May', mm: '7 mm' },
    { d: 'Jul', mm: '7 mm' }, { d: 'Oct', mm: '8 mm' },
  ];
  return (
    <div className="s-split">
      <svg viewBox="0 0 120 172" className="s-body" role="img"
        aria-label="Posterior body map, four tracked lesions, one biopsied today">
        <g fill="none" stroke={FAINT} strokeWidth="1.3" strokeLinejoin="round">
          <circle cx="60" cy="18" r="11" />
          <path d="M49 31h22l13 7 5 31-8 3-4-20v37H49V52l-4 20-8-3 5-31z" />
          <path d="M44 92h32l4 40-5 35H68l-3-37-4 37H48l-5-35z" />
        </g>
        <circle cx="48" cy="58" r="3" fill="none" stroke={FAINT} strokeWidth="1.3" />
        <circle cx="76" cy="74" r="3" fill="none" stroke={FAINT} strokeWidth="1.3" />
        <circle cx="54" cy="110" r="3" fill="none" stroke={FAINT} strokeWidth="1.3" />
        <circle cx="45" cy="48" r="6.5" fill="none" stroke={V} strokeWidth="2" />
        <circle cx="45" cy="48" r="2.2" fill={V} />
        <text x="60" y="166" fontSize="7.5" fill={INK} textAnchor="middle">posterior · right</text>
      </svg>
      <div className="s-strip">
        <div className="s-strip-h">Left upper back · long axis</div>
        {photos.map((p, i) => (
          <div className={`s-shot ${i === photos.length - 1 ? 'now' : ''}`} key={p.d}>
            <span className="px" />
            <span className="d">{p.d}</span>
            <span className="mm">{p.mm}</span>
          </div>
        ))}
        <div className="s-strip-f">+2 mm since March</div>
      </div>
    </div>
  );
}

/* ---------------------------------------------- oncology · cycle calendar */
function Chemo() {
  const cycles = [1, 2, 3, 4, 5, 6];
  const done = 2;
  return (
    <div className="s-chemo">
      <div className="s-chemo-h">FOLFOX · q14d · cycle 3 of 6</div>
      <div className="s-cycles">
        {cycles.map((c) => (
          <div className={`s-cyc ${c <= done ? 'done' : c === done + 1 ? 'next' : ''}`} key={c}>
            <span className="n">C{c}</span>
            <span className="days">
              {[1, 2, 3].map((dd) => <i key={dd} className={dd === 1 ? 'inf' : ''} />)}
            </span>
            <span className="dt">{['6 Aug', '20 Aug', '3 Sep', '17 Sep', '1 Oct', '15 Oct'][c - 1]}</span>
          </div>
        ))}
      </div>
      <div className="s-gate">
        <div className="s-gate-h">Pre-cycle gating · C3</div>
        <div className="s-gate-row"><span className="k">ANC</span><span className="v ok">2.1 ×10⁹/L</span></div>
        <div className="s-gate-row"><span className="k">Platelets</span><span className="v ok">142 ×10⁹/L</span></div>
        <div className="s-gate-row"><span className="k">Neuropathy</span><span className="v warn">Grade 1</span></div>
        <div className="s-gate-row"><span className="k">Financial clearance</span><span className="v ok">Approved</span></div>
        <div className="s-gate-f">Cleared to proceed · reduce oxaliplatin if grade 2</div>
      </div>
    </div>
  );
}

/* ---------------------------------------------- endo · CGM time in range */
function Cgm() {
  const bands = [
    { k: 'Very high · >250', pct: 4, cls: 'vh' },
    { k: 'High · 181–250', pct: 21, cls: 'h' },
    { k: 'In range · 70–180', pct: 68, cls: 'tir' },
    { k: 'Low · 54–69', pct: 6, cls: 'l' },
    { k: 'Very low · <54', pct: 1, cls: 'vl' },
  ];
  return (
    <div className="s-cgm">
      <div className="s-cgm-top">
        <span className="big">68%</span>
        <span className="lab">time in range · 14 days · target &gt;70%</span>
      </div>
      <svg viewBox="0 0 300 88" className="s-svg" role="img"
        aria-label="Ambulatory glucose profile over 24 hours with target range shaded">
        <rect x="30" y="34" width="248" height="28" fill={V} opacity="0.1" />
        <g stroke={FAINT} strokeWidth="1"><line x1="30" y1="76" x2="278" y2="76" /></g>
        <path d="M30 56 C70 30 96 22 124 34 C152 46 176 64 206 58 C236 52 258 40 278 46"
          fill="none" stroke={V} strokeWidth="2" strokeLinecap="round" />
        <path d="M30 66 C70 44 96 36 124 48 C152 60 176 74 206 70 C236 66 258 54 278 58"
          fill="none" stroke={V} strokeWidth="1" opacity="0.35" />
        <path d="M30 44 C70 18 96 10 124 22 C152 34 176 52 206 46 C236 40 258 28 278 34"
          fill="none" stroke={V} strokeWidth="1" opacity="0.35" />
        <g fontSize="7.5" fill={INK} opacity="0.75">
          <text x="4" y="37">180</text><text x="8" y="65">70</text>
        </g>
        <g fontSize="7.5" fill={INK} opacity="0.75" textAnchor="middle">
          <text x="30" y="86">12a</text><text x="92" y="86">6a</text><text x="154" y="86">12p</text>
          <text x="216" y="86">6p</text><text x="278" y="86">12a</text>
        </g>
      </svg>
      <div className="s-bands">
        {bands.map((b) => (
          <div className="s-band" key={b.k}>
            <span className="k">{b.k}</span>
            <span className="bar"><i className={b.cls} style={{ width: `${b.pct}%` }} /></span>
            <span className="p">{b.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------- nephrology · dialysis flowsheet */
function Dialysis() {
  const dates = ['23 Sep', '25 Sep', '27 Sep', '30 Sep', '2 Oct'];
  const rows: { l: string; c: (string | [string, 'abn'])[] }[] = [
    { l: 'Pre weight (kg)', c: ['78.4', '79.1', '78.2', ['80.3', 'abn'], '78.9'] },
    { l: 'Post weight (kg)', c: ['75.6', '75.9', '75.4', '76.1', '75.8'] },
    { l: 'UF volume (L)', c: ['2.8', '3.2', '2.8', ['4.2', 'abn'], '3.1'] },
    { l: 'Pre BP', c: ['148/82', '152/86', '144/80', ['168/94', 'abn'], '150/84'] },
    { l: 'Nadir BP', c: ['112/68', ['96/58', 'abn'], '110/66', ['92/54', 'abn'], '108/64'] },
    { l: 'Blood flow (mL/min)', c: ['400', '400', '380', '400', '400'] },
    { l: 'Access', c: ['AVF L', 'AVF L', 'AVF L', 'AVF L', 'AVF L'] },
    { l: 'Kt/V', c: ['1.42', '—', '—', '—', ['1.28', 'abn']] },
  ];
  return (
    <div className="s-grid-wrap">
      <div className="s-grid-h">Haemodialysis · MWF · last 5 sessions</div>
      <table className="s-grid">
        <thead>
          <tr><th className="rh" />{dates.map((d) => <th key={d}>{d}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.l}>
              <td className="rh">{r.l}</td>
              {r.c.map((c, i) => {
                const abn = Array.isArray(c);
                return <td key={i} className={abn ? 'abn' : ''}>{abn ? c[0] : c}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="s-grid-f">
        30 Sep ran 4.2 L off a 2 kg gain — two intradialytic hypotensive episodes since. Dry weight likely set too low.
      </div>
    </div>
  );
}

/* ---------------------------------------------- EP · device interrogation */
function Device() {
  const t = [
    { l: 'Battery', v: '7.2 yr est.', spark: '92,88,84,80,76,72', ok: true },
    { l: 'RV lead impedance', v: '512 Ω', spark: '520,516,514,512,510,512', ok: true },
    { l: 'RA lead impedance', v: '441 Ω', spark: '470,466,460,452,446,441', ok: true },
    { l: 'AF burden', v: '14% ↑', spark: '2,3,4,6,9,14', ok: false },
    { l: 'Ventricular pacing', v: '38%', spark: '34,35,36,37,37,38', ok: true },
  ];
  return (
    <div className="s-dev">
      <div className="s-dev-h">Medtronic Azure XT DR · interrogated 1 Oct · 6-month trend</div>
      {t.map((r) => (
        <div className="s-dev-row" key={r.l}>
          <span className="l">{r.l}</span>
          <svg viewBox="0 0 100 22" className="sp" preserveAspectRatio="none" aria-hidden="true">
            <polyline fill="none" stroke={r.ok ? FAINT : V} strokeWidth="2" strokeLinecap="round"
              points={r.spark.split(',').map((y, i) => `${i * 20},${22 - (Number(y) / 100) * 20}`).join(' ')} />
          </svg>
          <span className={`v ${r.ok ? '' : 'warn'}`}>{r.v}</span>
        </div>
      ))}
      <div className="s-dev-f">AF burden up from 2% to 14% over six months — anticoagulation decision now due.</div>
    </div>
  );
}

/* ---------------------------------------------- home health · route */
function Route() {
  const stops = [
    { n: 1, t: '8:30', who: 'E. Walsh', why: 'OASIS recert' },
    { n: 2, t: '10:00', who: 'H. Delgado', why: 'Wound check' },
    { n: 3, t: '11:45', who: 'A. Osei', why: 'Post-discharge' },
    { n: 4, t: '1:30', who: 'K. Fischer', why: 'IV antibiotics' },
    { n: 5, t: '3:00', who: 'L. Nguyen', why: 'PT eval' },
  ];
  return (
    <div className="s-split">
      <svg viewBox="0 0 130 168" className="s-map" role="img" aria-label="Optimized route with five stops">
        <rect x="0" y="0" width="130" height="168" rx="8" fill="#f1efe9" />
        <g stroke={FAINT} strokeWidth="1" opacity="0.8">
          <path d="M0 48h130M0 104h130M38 0v168M90 0v168" />
        </g>
        <path d="M24 148 L38 104 L76 92 L62 48 L102 30" fill="none" stroke={V}
          strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        {[[24, 148], [38, 104], [76, 92], [62, 48], [102, 30]].map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="7.5" fill={V} />
            <text x={x} y={y + 3} fontSize="8" fontWeight="700" fill="#fff" textAnchor="middle">{i + 1}</text>
          </g>
        ))}
      </svg>
      <div className="s-stops">
        <div className="s-strip-h">Today · 5 visits · 34 mi</div>
        {stops.map((s) => (
          <div className="s-stop" key={s.n}>
            <span className="n">{s.n}</span>
            <span className="t">{s.t}</span>
            <span className="w"><b>{s.who}</b>{s.why}</span>
          </div>
        ))}
        <div className="s-strip-f">Reordered from intake sequence — saves 41 min of driving</div>
      </div>
    </div>
  );
}

const MAP: Record<SurfaceId, FC> = {
  growth: Growth, bodymap: BodyMap, chemo: Chemo, cgm: Cgm,
  dialysis: Dialysis, device: Device, route: Route,
};

export default function Surface({ id }: { id: SurfaceId }) {
  const C = MAP[id];
  return C ? <div className="s-host"><C /></div> : null;
}
