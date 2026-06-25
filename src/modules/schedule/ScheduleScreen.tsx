import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { SCHEDULE } from '../../data/schedule';
import { getPatient } from '../../data/patient';
import { useEhr } from '../../store/EhrStore';
import { ApptStatusPill } from '../../components/StatusPill';
import KebabMenu from '../../components/KebabMenu';
import type { ApptStatus } from '../../types';

const STATUS_FILTERS: (ApptStatus | 'all')[] = ['all', 'arrived', 'roomed', 'ready', 'scheduled', 'no-show', 'complete'];

export default function ScheduleScreen() {
  const { apptStatus, dispatch, toast } = useEhr();
  const nav = useNavigate();
  const [statusFilter, setStatusFilter] = useState<ApptStatus | 'all'>('all');
  const [provider, setProvider] = useState('Okafor, James MD');
  const [location, setLocation] = useState('Clinic A');

  const open = (patientId: string, apptId: string) => {
    dispatch({ t: 'selectPatient', id: patientId });
    if (apptStatus[apptId] === 'arrived' || apptStatus[apptId] === 'ready') {
      dispatch({ t: 'setApptStatus', id: apptId, status: 'roomed' });
    }
    nav(`/chart/${patientId}/summary`);
  };

  const startVisit = (patientId: string, apptId: string) => {
    dispatch({ t: 'selectPatient', id: patientId });
    dispatch({ t: 'setApptStatus', id: apptId, status: 'in-progress' });
    toast('Visit started — opening chart.', 'ok');
    nav(`/chart/${patientId}/notes`);
  };

  const rows = SCHEDULE.filter((a) => {
    if (statusFilter !== 'all' && apptStatus[a.id] !== statusFilter) return false;
    if (provider !== 'All Providers' && a.provider !== provider) return false;
    if (location !== 'All' && !a.location.startsWith(location)) return false;
    return true;
  });

  return (
    <>
      <div className="toolbar">
        <Calendar size={14} />
        <button className="btn-xs"><ChevronLeft size={11} /></button>
        <input type="date" defaultValue="2026-06-23" />
        <button className="btn-xs"><ChevronRight size={11} /></button>
        <span className="sep" />
        <label>Provider:</label>
        <select value={provider} onChange={(e) => setProvider(e.target.value)}>
          <option>Okafor, James MD</option>
          <option>Reyes, Carla RN</option>
          <option>All Providers</option>
        </select>
        <label>Location:</label>
        <select value={location} onChange={(e) => setLocation(e.target.value)}>
          <option>All</option>
          <option>Clinic A</option>
          <option>Clinic B</option>
          <option>Telehealth</option>
        </select>
        <label>Status:</label>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as ApptStatus | 'all')}>
          {STATUS_FILTERS.map((s) => <option key={s} value={s}>{s === 'all' ? 'All' : s}</option>)}
        </select>
        <span className="spacer" />
        <button className="btn-xs" onClick={() => toast('Schedule refreshed.', 'info')}><RefreshCw size={11} /> Refresh</button>
      </div>

      <div className="content-scroll">
        <div className="panel">
          <div className="panel-head">
            <span>Daily Schedule — Tuesday, June 23, 2026 ({rows.length} of {SCHEDULE.length})</span>
            <span className="muted xsmall">Double-click handled via Open</span>
          </div>
          <table className="dense">
            <thead>
              <tr>
                <th style={{ width: 56 }}>Time</th>
                <th>Patient</th>
                <th style={{ width: 70 }}>Age/Sex</th>
                <th style={{ width: 92 }}>DOB</th>
                <th>Visit Type</th>
                <th style={{ width: 110 }}>Room</th>
                <th style={{ width: 90 }}>Status</th>
                <th style={{ width: 250 }}>Actions</th>
                <th style={{ width: 28 }} />
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => {
                const st = apptStatus[a.id];
                const isMaria = a.patientId === 'FT-483920';
                return (
                  <tr key={a.id} className="clickable" onClick={() => open(a.patientId, a.id)}>
                    <td className="bold">{a.time}</td>
                    <td>
                      <span className="link">{a.patientName}</span>
                      {isMaria && <span className="pill pill-info" style={{ marginLeft: 6 }}>TODAY'S DEMO</span>}
                      <div className="xsmall muted">MRN {a.patientId}</div>
                    </td>
                    <td>{a.age}/{getPatient(a.patientId)?.sex[0] ?? '—'}</td>
                    <td>{a.dob}</td>
                    <td>{a.visitType}</td>
                    <td>{a.location}</td>
                    <td><ApptStatusPill status={st} /></td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="row gap4">
                        <button className="btn-xs btn-primary" onClick={() => startVisit(a.patientId, a.id)}>Start Visit</button>
                        <button className="btn-xs" onClick={() => { dispatch({ t: 'selectPatient', id: a.patientId }); toast('Opening chart prep…', 'info'); nav(`/chart/${a.patientId}/summary`); }}>Chart Prep</button>
                        <button className="btn-xs" onClick={() => toast(`Message sent to ${a.patientName}.`, 'ok')}>Message</button>
                        <button className="btn-xs" onClick={() => dispatch({ t: 'setApptStatus', id: a.id, status: 'arrived' })}>Check In</button>
                      </div>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <KebabMenu actions={[
                        { label: 'Open chart', onClick: () => open(a.patientId, a.id) },
                        { label: 'Mark roomed', onClick: () => dispatch({ t: 'setApptStatus', id: a.id, status: 'roomed' }) },
                        { label: 'Mark complete', onClick: () => dispatch({ t: 'setApptStatus', id: a.id, status: 'complete' }) },
                        { label: 'Cancel appointment', sep: true, onClick: () => toast('Appointment cancellation requires front-desk role.', 'warn') },
                      ]} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="xsmall muted mt8">
          Tip: click <b>Thompson, Maria</b> (9:20) to begin the demo workflow.
        </p>
      </div>
    </>
  );
}
