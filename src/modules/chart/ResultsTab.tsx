import { useState } from 'react';
import { useEhr } from '../../store/EhrStore';
import Modal from '../../components/Modal';
import { Pill } from '../../components/StatusPill';
import type { LabResult } from '../../types';

function flagCell(r: LabResult) {
  if (r.flag === 'H') return <span className="flag-h">H</span>;
  if (r.flag === 'L') return <span className="flag-l">L</span>;
  if (r.flag === 'abnormal') return <span className="flag-h">A</span>;
  return <span className="muted">—</span>;
}

function Sparkline({ data }: { data: { date: string; value: number }[] }) {
  const vals = data.map((d) => d.value);
  const min = Math.min(...vals), max = Math.max(...vals);
  const span = max - min || 1;
  const w = 220, h = 44, pad = 4;
  const pts = data.map((d, i) => {
    const x = pad + (i * (w - 2 * pad)) / (data.length - 1);
    const y = h - pad - ((d.value - min) / span) * (h - 2 * pad);
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={w} height={h} style={{ border: '1px solid var(--grid)', background: '#fff' }}>
      <polyline points={pts} fill="none" stroke="#5b6065" strokeWidth={1.5} />
      {data.map((d, i) => {
        const x = pad + (i * (w - 2 * pad)) / (data.length - 1);
        const y = h - pad - ((d.value - min) / span) * (h - 2 * pad);
        return <circle key={i} cx={x} cy={y} r={2} fill="#5b6065" />;
      })}
    </svg>
  );
}

export default function ResultsTab() {
  const { results, dispatch, toast } = useEhr();
  const [detail, setDetail] = useState<LabResult | null>(null);
  const [view, setView] = useState<'all' | 'unreviewed' | 'abnormal'>('all');
  const [q, setQ] = useState('');

  const ql = q.trim().toLowerCase();
  const rows = results.filter((r) => {
    if (view === 'unreviewed' && r.reviewed) return false;
    if (view === 'abnormal' && (r.flag === 'normal')) return false;
    if (ql && !r.name.toLowerCase().includes(ql)) return false;
    return true;
  });

  return (
    <div className="panel">
      <div className="toolbar">
        <button className="btn-xs" onClick={() => { results.filter((r) => !r.reviewed).forEach((r) => dispatch({ t: 'reviewResult', id: r.id })); toast('All results marked reviewed.', 'ok'); }}>Mark All Reviewed</button>
        <span className="sep" />
        <input type="search" placeholder="Filter by test name…" value={q} onChange={(e) => setQ(e.target.value)} style={{ width: 160 }} />
        <label>Show:</label>
        <select value={view} onChange={(e) => setView(e.target.value as typeof view)}>
          <option value="all">All results</option>
          <option value="unreviewed">Unreviewed only</option>
          <option value="abnormal">Abnormal only</option>
        </select>
        <span className="spacer" />
        <span className="xsmall muted">{rows.length} shown · {results.filter((r) => !r.reviewed).length} unreviewed</span>
      </div>

      <table className="dense">
        <thead>
          <tr><th>Test</th><th style={{ width: 110 }}>Value</th><th style={{ width: 90 }}>Ref Range</th><th style={{ width: 44 }}>Flag</th><th style={{ width: 100 }}>Collected</th><th style={{ width: 90 }}>Status</th><th style={{ width: 150 }} /></tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="clickable" onClick={() => setDetail(r)}>
              <td className="link bold">{r.name}</td>
              <td className={r.flag === 'H' || r.flag === 'abnormal' ? 'flag-h bold' : r.flag === 'L' ? 'flag-l bold' : 'bold'}>{r.value} {r.unit}</td>
              <td className="muted">{r.refRange}</td>
              <td>{flagCell(r)}</td>
              <td>{r.collected}</td>
              <td>{r.reviewed ? <Pill tone="ok">Reviewed</Pill> : <Pill tone="warn">New</Pill>}</td>
              <td onClick={(e) => e.stopPropagation()}>
                {!r.reviewed && <button className="btn-xs" onClick={() => { dispatch({ t: 'reviewResult', id: r.id }); toast(`Marked "${r.name}" reviewed.`, 'ok'); }}>Mark Reviewed</button>}
                <button className="btn-xs" style={{ marginLeft: 4 }} onClick={() => setDetail(r)}>Open</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {detail && (
        <Modal title={`Result — ${detail.name}`} onClose={() => setDetail(null)} width={420}
          footer={<>
            {!detail.reviewed && <button className="btn-sign" onClick={() => { dispatch({ t: 'reviewResult', id: detail.id }); toast('Result reviewed.', 'ok'); setDetail(null); }}>Mark Reviewed</button>}
            <button onClick={() => setDetail(null)}>Close</button>
          </>}>
          <div className="kv mb8">
            <dt>Value</dt><dd className="bold">{detail.value} {detail.unit} {flagCell(detail)}</dd>
            <dt>Reference</dt><dd>{detail.refRange}</dd>
            <dt>Collected</dt><dd>{detail.collected}</dd>
            <dt>Status</dt><dd>{detail.reviewed ? 'Reviewed' : 'Awaiting review'}</dd>
          </div>
          <div className="panel-head" style={{ border: '1px solid var(--border)' }}>Trend</div>
          <Sparkline data={detail.trend} />
          <div className="row" style={{ justifyContent: 'space-between', marginTop: 2 }}>
            {detail.trend.map((t) => <span key={t.date} className="xsmall muted">{t.date}: {t.value}</span>)}
          </div>
        </Modal>
      )}
    </div>
  );
}
