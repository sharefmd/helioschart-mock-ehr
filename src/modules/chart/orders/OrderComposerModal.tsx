import { useState } from 'react';
import { useEhr } from '../../../store/EhrStore';
import Modal from '../../../components/Modal';
import WarningBanner from '../../../components/WarningBanner';
import { computeMedWarnings, nextOrderId } from './orderUtils';
import { PHARMACIES, ICD_PICKER } from '../../../data/clinical';
import type { FormularyItem, LabCatalogItem, Order, OrderType, OrderWarning } from '../../../types';

export type ComposerTarget = { type: OrderType; item: FormularyItem | LabCatalogItem };

const TYPE_LABEL: Record<OrderType, string> = {
  med: 'Medication', lab: 'Lab', imaging: 'Imaging', referral: 'Referral', procedure: 'Procedure',
};

export default function OrderComposerModal({ target, onClose }: { target: ComposerTarget; onClose: () => void }) {
  const { dispatch, toast } = useEhr();
  const isMed = target.type === 'med';
  const medItem = target.item as FormularyItem;
  const catItem = target.item as LabCatalogItem;

  // --- med fields ---
  const [dose, setDose] = useState(isMed ? medItem.commonDoses[0] : '');
  const [route, setRoute] = useState(isMed ? medItem.defaultRoute : '');
  const [freq, setFreq] = useState(isMed ? medItem.defaultFreq : '');
  const [qty, setQty] = useState('30');
  const [refills, setRefills] = useState('3');
  const [pharmacy, setPharmacy] = useState(PHARMACIES[0]);
  // --- non-med fields ---
  const [interval, setInterval] = useState(!isMed ? catItem.commonIntervals[0] : '');
  const [priority, setPriority] = useState('Routine');
  // --- shared ---
  const [indication, setIndication] = useState('');   // required, starts blank
  const [notes, setNotes] = useState('');
  const [overridden, setOverridden] = useState<Set<number>>(new Set());
  const [signing, setSigning] = useState(false);

  const warnings: OrderWarning[] = isMed ? computeMedWarnings(target.item.name) : [];
  const missingIndication = !indication;
  const hardStop = signing || missingIndication
    || warnings.some((w, i) => !w.overridable && w.severity === 'High' && !overridden.has(i));

  const intervalLabel = target.type === 'referral' ? 'Urgency'
    : target.type === 'procedure' ? 'When' : 'Collect When';
  const catLabel = target.type === 'referral' ? 'Specialty type'
    : target.type === 'procedure' ? 'Setting' : 'Specimen';

  const buildOrder = (status: Order['status']): Order => {
    if (isMed) {
      const cleanName = medItem.name.replace(/\s*\(.*\)$/, '');
      return {
        id: nextOrderId(), type: 'med',
        display: `${cleanName} ${dose}`,
        details: `${route} ${freq} · Disp ${qty}, ${refills} refills · ${pharmacy} · for ${indication}`,
        status, warnings,
        medData: { name: cleanName, dose, route, frequency: freq },
      };
    }
    return {
      id: nextOrderId(), type: target.type,
      display: catItem.name,
      details: `${catItem.specimen} · ${priority} · ${intervalLabel}: ${interval} · for ${indication}`,
      status, warnings: [],
    };
  };

  const finish = (status: Order['status'], label: string, kind: 'ok' | 'info') => {
    const order = buildOrder(status);
    const commit = () => {
      dispatch({ t: 'addOrder', order });
      if (status === 'signed') dispatch({ t: 'signOrder', id: order.id });
      toast(`${order.display} — ${label}.`, kind);
      onClose();
    };
    // Signing goes through a brief "processing" delay — the system feels sluggish.
    if (status === 'signed') { setSigning(true); setTimeout(commit, 700); }
    else commit();
  };

  return (
    <Modal
      title={`Order Composer — ${TYPE_LABEL[target.type]}`}
      onClose={onClose}
      width={580}
      footer={<>
        <span className="grow xsmall muted" style={{ alignSelf: 'center' }}>
          {signing ? <span className="row gap4"><span className="spinner" /> Processing…</span>
            : missingIndication ? 'Indication is required to sign.'
            : 'Required fields complete.'}
        </span>
        <button disabled={signing} onClick={() => finish('draft', 'saved as draft', 'info')}>Save Draft</button>
        <button disabled={signing} onClick={() => finish('pended', 'pended (unsigned)', 'info')}>Pend Order</button>
        <button className="btn-sign" disabled={hardStop} onClick={() => finish('signed', 'signed', 'ok')}>Sign Order</button>
      </>}
    >
      <div className="box mb8" style={{ padding: '5px 8px', background: 'var(--info-bg)' }}>
        <span className="bold">{target.item.name}</span>
        {isMed
          ? <span className="muted small"> · {medItem.class}</span>
          : <span className="muted small"> · {catItem.specimen}</span>}
      </div>

      {warnings.map((w, i) => (
        <WarningBanner key={i} warning={overridden.has(i) ? { ...w, text: `${w.text} [OVERRIDDEN]` } : w}
          onOverride={() => { setOverridden((s) => new Set(s).add(i)); toast('Override reason recorded (demo).', 'warn'); }} />
      ))}

      <div className="form-grid mt8">
        {isMed ? (
          <>
            <label className="req">Dose</label>
            <select value={dose} onChange={(e) => setDose(e.target.value)}>
              {medItem.commonDoses.map((d) => <option key={d}>{d}</option>)}
            </select>
            <label className="req">Route</label>
            <select value={route} onChange={(e) => setRoute(e.target.value)}>
              <option>PO</option><option>IV</option><option>SubQ</option><option>INH</option><option>Topical</option>
            </select>
            <label className="req">Frequency</label>
            <select value={freq} onChange={(e) => setFreq(e.target.value)}>
              <option>Daily</option><option>BID</option><option>TID</option><option>QHS</option><option>PRN</option><option>Weekly</option>
            </select>
            <label className="req">Dispense / Refills</label>
            <div className="row">
              <input type="number" value={qty} onChange={(e) => setQty(e.target.value)} style={{ width: 64 }} />
              <span className="muted">·</span>
              <input type="number" value={refills} onChange={(e) => setRefills(e.target.value)} style={{ width: 48 }} />
              <span className="muted">refills</span>
            </div>
            <label className="req">Pharmacy</label>
            <select value={pharmacy} onChange={(e) => setPharmacy(e.target.value)}>
              {PHARMACIES.map((p) => <option key={p}>{p}</option>)}
            </select>
          </>
        ) : (
          <>
            <label>{catLabel}</label>
            <input type="text" value={catItem.specimen} disabled />
            <label className="req">Priority</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option>Routine</option><option>STAT</option><option>Urgent</option>
            </select>
            <label className="req">{intervalLabel}</label>
            <select value={interval} onChange={(e) => setInterval(e.target.value)}>
              {catItem.commonIntervals.map((iv) => <option key={iv}>{iv}</option>)}
            </select>
          </>
        )}

        <label className="req">Indication</label>
        <select value={indication} onChange={(e) => setIndication(e.target.value)}
          style={missingIndication ? { borderColor: 'var(--danger)' } : undefined}>
          <option value="">— Select indication —</option>
          {ICD_PICKER.map((d) => <option key={d}>{d}</option>)}
        </select>

        <label>Order Notes</label>
        <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes…" style={{ gridColumn: '2 / -1' }} />
      </div>
    </Modal>
  );
}
