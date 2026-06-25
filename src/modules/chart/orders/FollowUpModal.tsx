import { useState } from 'react';
import { useEhr } from '../../../store/EhrStore';
import Modal from '../../../components/Modal';
import { nextOrderId } from './orderUtils';

export default function FollowUpModal({ onClose }: { onClose: () => void }) {
  const { dispatch, toast } = useEhr();
  const [interval, setInterval] = useState('4 weeks');
  const [visitType, setVisitType] = useState('HTN / DM Follow-up');
  const [routeTo, setRouteTo] = useState('Front Desk — Scheduling');
  const [reason, setReason] = useState('Recheck BP after ramipril initiation; review BMP.');

  const create = () => {
    dispatch({ t: 'addTask', task: {
      id: nextOrderId(),
      queue: 'scheduling',
      title: `Schedule ${visitType} in ${interval} — route to ${routeTo}`,
      patient: 'Thompson, Maria',
      status: 'open',
      due: '2026-07-21',
      routedTo: routeTo,
    }});
    toast(`Follow-up task created (${interval}) and routed to ${routeTo}.`, 'ok');
    onClose();
  };

  return (
    <Modal title="Create Follow-up / Return Visit" onClose={onClose} width={460}
      footer={<>
        <button onClick={onClose}>Cancel</button>
        <button className="btn-sign" onClick={create}>Create Follow-up Task</button>
      </>}>
      <div className="form-grid">
        <label className="req">Interval</label>
        <select value={interval} onChange={(e) => setInterval(e.target.value)}>
          <option>1 week</option><option>2 weeks</option><option>4 weeks</option><option>3 months</option>
        </select>
        <label className="req">Visit Type</label>
        <select value={visitType} onChange={(e) => setVisitType(e.target.value)}>
          <option>HTN / DM Follow-up</option><option>BP Check (nurse)</option><option>Lab Review</option>
        </select>
        <label className="req">Route To</label>
        <select value={routeTo} onChange={(e) => setRouteTo(e.target.value)}>
          <option>Front Desk — Scheduling</option><option>Patient (self-schedule portal)</option><option>Care Coordinator</option>
        </select>
        <label>Reason</label>
        <textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} style={{ gridColumn: '2 / -1' }} />
      </div>
      <p className="xsmall muted mt8">
        This does not book an actual slot — it creates a task for the front desk. The follow-up
        you wrote in the note did not generate this; you re-entered it here.
      </p>
    </Modal>
  );
}
