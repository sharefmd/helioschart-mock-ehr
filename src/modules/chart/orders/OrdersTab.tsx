import { useState } from 'react';
import { Search, Plus, CalendarPlus, Inbox } from 'lucide-react';
import { useEhr } from '../../../store/EhrStore';
import {
  FORMULARY, LAB_CATALOG, IMAGING_CATALOG, REFERRAL_CATALOG, PROCEDURE_CATALOG,
} from '../../../data/clinical';
import { OrderStatusPill } from '../../../components/StatusPill';
import KebabMenu from '../../../components/KebabMenu';
import OrderComposerModal, { type ComposerTarget } from './OrderComposerModal';
import FollowUpModal from './FollowUpModal';
import type { FormularyItem, LabCatalogItem, OrderType } from '../../../types';

const SUBTABS: { key: OrderType; label: string }[] = [
  { key: 'med', label: 'Medications' },
  { key: 'lab', label: 'Labs' },
  { key: 'imaging', label: 'Imaging' },
  { key: 'referral', label: 'Referrals' },
  { key: 'procedure', label: 'Procedures' },
];

const PLACEHOLDER: Record<OrderType, string> = {
  med: 'Search medications (try "ramipril")…',
  lab: 'Search labs (try "BMP")…',
  imaging: 'Search imaging (try "x-ray")…',
  referral: 'Search referrals (try "nephrology")…',
  procedure: 'Search procedures (try "EKG")…',
};

export default function OrdersTab() {
  const s = useEhr();
  const [sub, setSub] = useState<OrderType>('med');
  const [q, setQ] = useState('');
  const [target, setTarget] = useState<ComposerTarget | null>(null);
  const [followUp, setFollowUp] = useState(false);

  const ql = q.trim().toLowerCase();

  const catalog: (FormularyItem | LabCatalogItem)[] =
    sub === 'med' ? FORMULARY
    : sub === 'lab' ? LAB_CATALOG
    : sub === 'imaging' ? IMAGING_CATALOG
    : sub === 'referral' ? REFERRAL_CATALOG
    : PROCEDURE_CATALOG;

  const results = ql
    ? catalog.filter((c) => {
        const extra = 'class' in c ? c.class : c.specimen;
        const aliases = (c as { aliases?: string[] }).aliases?.join(' ') ?? '';
        return `${c.name} ${extra} ${aliases}`.toLowerCase().includes(ql);
      })
    : [];

  const col2 = (c: FormularyItem | LabCatalogItem) => ('class' in c ? c.class : c.specimen);

  return (
    <div className="stack8">
      <div className="tabstrip" style={{ padding: '4px 6px 0' }}>
        {SUBTABS.map((t) => {
          const n = s.orders.filter((o) => o.type === t.key).length;
          return (
            <div key={t.key} className={sub === t.key ? 'tab active' : 'tab'} onClick={() => { setSub(t.key); setQ(''); }}>
              {t.label}{n > 0 && <span className="badge badge-mute">{n}</span>}
            </div>
          );
        })}
      </div>

      <div className="toolbar">
        <Search size={13} />
        <input type="search" placeholder={PLACEHOLDER[sub]} value={q} onChange={(e) => setQ(e.target.value)} style={{ width: 280 }} />
        <span className="sep" />
        <button className="btn-xs" onClick={() => setFollowUp(true)}><CalendarPlus size={11} /> Follow-up</button>
        <button className="btn-xs" onClick={() => s.toast('Order sets are not configured in this demo.', 'info')}>Order Sets ▾</button>
        <span className="spacer" />
        <span className="xsmall muted">Catalog: {catalog.length} {sub} items</span>
      </div>

      <div className="panel">
        <div className="panel-head">{SUBTABS.find((t) => t.key === sub)?.label} Search</div>
        {!ql ? (
          <div className="panel-body center muted" style={{ padding: 24 }}>
            <Search size={22} style={{ opacity: 0.4 }} />
            <div className="mt8">No search entered.</div>
            <div className="xsmall">Type a name or code to begin a new order.</div>
          </div>
        ) : (
          <table className="dense">
            <thead><tr><th>{sub === 'med' ? 'Medication' : 'Item'}</th><th>{sub === 'med' ? 'Class' : 'Category'}</th><th style={{ width: 90 }} /></tr></thead>
            <tbody>
              {results.map((c) => (
                <tr key={c.id} className="clickable" onClick={() => setTarget({ type: sub, item: c })}>
                  <td className="link bold">{c.name}</td>
                  <td className="muted">{col2(c)}</td>
                  <td><button className="btn-xs btn-primary" onClick={(e) => { e.stopPropagation(); setTarget({ type: sub, item: c }); }}><Plus size={10} /> Add</button></td>
                </tr>
              ))}
              {results.length === 0 && <tr><td colSpan={3} className="center muted" style={{ padding: 12 }}>No matches for "{q}".</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      <div className="panel">
        <div className="panel-head">
          <span>Orders this Encounter</span>
          <span>{s.unsignedOrderCount > 0
            ? <span className="pill pill-warn">{s.unsignedOrderCount} unsigned</span>
            : <span className="pill pill-mute">all signed</span>}</span>
        </div>
        {s.orders.length === 0 ? (
          <div className="panel-body center muted" style={{ padding: 18 }}>
            <Inbox size={20} style={{ opacity: 0.4 }} />
            <div className="mt8">No orders for this encounter.</div>
          </div>
        ) : (
          <table className="dense">
            <thead><tr><th style={{ width: 78 }}>Type</th><th>Order</th><th>Details</th><th style={{ width: 80 }}>Status</th><th style={{ width: 150 }} /></tr></thead>
            <tbody>
              {s.orders.map((o) => (
                <tr key={o.id}>
                  <td><span className="pill pill-info">{o.type}</span></td>
                  <td className="bold">{o.display}</td>
                  <td className="xsmall muted">{o.details}</td>
                  <td><OrderStatusPill status={o.status} /></td>
                  <td>
                    {o.status !== 'signed'
                      ? <button className="btn-xs btn-sign" onClick={() => { s.dispatch({ t: 'signOrder', id: o.id }); s.toast(`${o.display} signed.`, 'ok'); }}>Sign</button>
                      : <span className="xsmall muted">signed {o.signedAt}</span>}
                    <KebabMenu actions={[
                      { label: 'Pend', onClick: () => s.dispatch({ t: 'setOrderStatus', id: o.id, status: 'pended' }) },
                      { label: 'Set to draft', onClick: () => s.dispatch({ t: 'setOrderStatus', id: o.id, status: 'draft' }) },
                      { label: 'Discontinue', sep: true, onClick: () => s.toast(`${o.display} discontinued (demo).`, 'warn') },
                    ]} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {target && <OrderComposerModal target={target} onClose={() => { setTarget(null); setQ(''); }} />}
      {followUp && <FollowUpModal onClose={() => setFollowUp(false)} />}
    </div>
  );
}
