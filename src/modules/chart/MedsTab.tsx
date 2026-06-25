import { useNavigate } from 'react-router-dom';
import { Pill as PillIcon } from 'lucide-react';
import { useEhr } from '../../store/EhrStore';
import { Pill } from '../../components/StatusPill';
import KebabMenu from '../../components/KebabMenu';

export default function MedsTab() {
  const s = useEhr();
  const nav = useNavigate();
  const active = s.meds.filter((m) => m.status === 'active');
  const historical = s.meds.filter((m) => m.status !== 'active');

  return (
    <div className="stack8">
      <div className="toolbar">
        <PillIcon size={14} />
        <button className="btn-xs btn-primary" onClick={() => nav(`/chart/${s.activePatientId}/orders`)}>+ Add via Orders</button>
        <button className="btn-xs" onClick={() => s.toast('Medication reconciliation complete (demo).', 'ok')}>Reconcile</button>
        <button className="btn-xs" onClick={() => s.toast('Printed medication list (demo).', 'info')}>Print</button>
        <span className="spacer" />
        <span className="xsmall muted">Active: {active.length} · Discontinued: {historical.length}</span>
      </div>

      <div className="panel">
        <div className="panel-head">Active Medications</div>
        <table className="dense">
          <thead>
            <tr><th>Medication</th><th style={{ width: 80 }}>Dose</th><th style={{ width: 60 }}>Route</th><th style={{ width: 70 }}>Freq</th><th style={{ width: 100 }}>Started</th><th style={{ width: 130 }}>Source</th><th style={{ width: 30 }} /></tr>
          </thead>
          <tbody>
            {active.map((m) => (
              <tr key={m.id} className={m.orderedFrom === 'orders-tab' ? 'selected' : undefined}>
                <td className="bold">{m.name}</td>
                <td>{m.dose}</td>
                <td>{m.route}</td>
                <td>{m.frequency}</td>
                <td>{m.startedDate}</td>
                <td>{m.orderedFrom === 'orders-tab'
                  ? <Pill tone="ok">Signed this visit</Pill>
                  : <span className="xsmall muted">Med history</span>}</td>
                <td><KebabMenu actions={[
                  { label: 'Refill', onClick: () => s.toast(`Refill requested for ${m.name}.`, 'ok') },
                  { label: 'Discontinue', onClick: () => s.toast(`${m.name} discontinued (demo).`, 'warn') },
                  { label: 'View details', onClick: () => s.toast(`${m.name} ${m.dose} ${m.route} ${m.frequency}`, 'info') },
                ]} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="panel">
        <div className="panel-head">Discontinued / Historical</div>
        <table className="dense">
          <tbody>
            {historical.map((m) => (
              <tr key={m.id}>
                <td className="bold">{m.name}</td>
                <td>{m.dose}</td>
                <td>{m.route} {m.frequency}</td>
                <td><Pill tone="mute">{m.status}</Pill></td>
                <td className="muted">since {m.startedDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
