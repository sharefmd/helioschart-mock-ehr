import { Printer, Send, Upload, Paperclip, CheckCircle2, FileText } from 'lucide-react';
import { useEhr } from '../../store/EhrStore';
import { Pill } from '../../components/StatusPill';
import KebabMenu from '../../components/KebabMenu';
import type { FormDoc } from '../../types';

function tone(status: FormDoc['status']) {
  return status === 'Completed' ? 'ok' : status === 'Faxed' ? 'info' : status === 'New' ? 'warn' : 'pend';
}

export default function DocumentsScreen() {
  const { forms, dispatch, toast } = useEhr();
  const incoming = forms.filter((f) => f.direction === 'incoming');
  const outgoing = forms.filter((f) => f.direction === 'outgoing');

  const Table = ({ rows, dir }: { rows: FormDoc[]; dir: string }) => (
    <table className="dense">
      <thead><tr><th>Document</th><th style={{ width: 150 }}>Source</th><th style={{ width: 90 }}>Date</th><th style={{ width: 90 }}>Status</th><th style={{ width: 230 }}>Actions</th><th style={{ width: 28 }} /></tr></thead>
      <tbody>
        {rows.map((f) => (
          <tr key={f.id}>
            <td className="row"><FileText size={12} className="muted" /><span className="bold">{f.name}</span></td>
            <td className="muted">{f.source}</td>
            <td>{f.receivedDate}</td>
            <td><Pill tone={tone(f.status)}>{f.status}</Pill></td>
            <td><div className="row gap4">
              <button className="btn-xs" onClick={() => { dispatch({ t: 'setFormStatus', id: f.id, status: 'Completed' }); toast(`${f.name} completed.`, 'ok'); }}><CheckCircle2 size={10} /> Complete</button>
              <button className="btn-xs" onClick={() => toast(`Printing ${f.name}…`, 'info')}><Printer size={10} /> Print</button>
              <button className="btn-xs" onClick={() => { dispatch({ t: 'setFormStatus', id: f.id, status: 'Faxed' }); toast(`${f.name} faxed.`, 'ok'); }}><Send size={10} /> Fax</button>
              {dir === 'incoming'
                ? <button className="btn-xs" onClick={() => toast(`${f.name} attached to chart.`, 'ok')}><Paperclip size={10} /> Attach</button>
                : <button className="btn-xs" onClick={() => toast('Upload dialog (demo).', 'info')}><Upload size={10} /> Upload</button>}
            </div></td>
            <td><KebabMenu actions={[
              { label: 'Open', onClick: () => toast(`Opening ${f.name} (demo).`, 'info') },
              { label: 'Route to staff', onClick: () => toast('Routed to staff.', 'ok') },
              { label: 'Delete', sep: true, onClick: () => toast('Delete requires records role.', 'warn') },
            ]} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <>
      <div className="toolbar">
        <FileText size={14} />
        <button className="btn-xs btn-primary" onClick={() => toast('Upload document (demo).', 'info')}><Upload size={11} /> Upload</button>
        <button className="btn-xs" onClick={() => toast('Scan from device (demo).', 'info')}>Scan</button>
        <span className="spacer" />
        <label>Filter:</label>
        <select defaultValue="all"><option value="all">All documents</option><option>Needs action</option><option>Completed</option></select>
      </div>
      <div className="content-scroll stack8">
        <div className="panel">
          <div className="panel-head">Incoming — Forms come in ({incoming.length})</div>
          <Table rows={incoming} dir="incoming" />
        </div>
        <div className="panel">
          <div className="panel-head">Outgoing — Forms must go out ({outgoing.length})</div>
          <Table rows={outgoing} dir="outgoing" />
        </div>
        <p className="xsmall muted">Forms come in, forms must go out — and none of it is connected to the visit note or orders.</p>
      </div>
    </>
  );
}
