import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Inbox, Reply, Share, Clock, CheckCircle2, PenLine, ListPlus, RefreshCw, FolderOpen, Paperclip, FileImage } from 'lucide-react';
import { useEhr } from '../../store/EhrStore';
import { INBOX_QUEUES, QUEUE_CODE } from '../../data/inbox';
import { Pill } from '../../components/StatusPill';
import Modal from '../../components/Modal';
import DocViewer from '../../components/DocViewer';
import type { InboxItem, Attachment } from '../../types';

export default function InboxScreen() {
  const { inbox, dispatch, toast } = useEhr();
  const nav = useNavigate();
  const [sel, setSel] = useState<InboxItem | null>(null);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [routeOpen, setRouteOpen] = useState(false);
  const [routeTo, setRouteTo] = useState('Nurse pool (RN)');
  const [routeNote, setRouteNote] = useState('');
  const [taskOpen, setTaskOpen] = useState(false);
  const [taskAssignee, setTaskAssignee] = useState('Me (Okafor, J MD)');
  const [taskPriority, setTaskPriority] = useState('Routine');
  const [taskDue, setTaskDue] = useState('2026-06-25');
  const [taskNote, setTaskNote] = useState('');
  const [viewerAtt, setViewerAtt] = useState<Attachment | null>(null);

  // One flat, undifferentiated, never-ending pile — newest first.
  // Reviewed/done items drop off the list (and come back on refresh, since the
  // store re-seeds on reload — nothing is persisted).
  const rows = inbox.filter((i) => !i.reviewed).sort((a, b) => (a.received < b.received ? 1 : -1));

  const unread = rows.length;

  const toggle = (id: string) => setChecked((s) => {
    const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n;
  });

  const triage = (label: string) => {
    if (sel) dispatch({ t: 'reviewInbox', id: sel.id });
    toast(`${label}: "${sel?.subject}".`, 'ok');
    setSel(null);
  };

  return (
    <>
      <div className="toolbar">
        <Inbox size={14} />
        <span className="bold">In Basket</span>
        <span className="pill pill-danger">{unread} unread</span>
        <span className="sep" />
        <button className="btn-xs" disabled={checked.size === 0}
          onClick={() => { checked.forEach((id) => dispatch({ t: 'reviewInbox', id })); toast(`${checked.size} item(s) marked reviewed.`, 'ok'); setChecked(new Set()); }}>
          Mark Selected Reviewed ({checked.size})
        </button>
        <span className="spacer" />
        <span className="xsmall muted">Sorted: newest first (cannot change)</span>
        <button className="btn-xs" onClick={() => toast('Refreshed. 0 new items.', 'info')}><RefreshCw size={11} /></button>
      </div>

      <div className="content-scroll" style={{ padding: 0 }}>
        <div className="alert alert-warn" style={{ borderLeftWidth: 4, margin: 0, borderRadius: 0 }}>
          <span>{rows.length} items in a single list. No saved filters or folders configured for this user. Oldest unread: 6 days.</span>
        </div>
        <table className="dense">
          <thead>
            <tr>
              <th style={{ width: 24 }}><input type="checkbox"
                checked={checked.size === rows.length && rows.length > 0}
                onChange={(e) => setChecked(e.target.checked ? new Set(rows.map((r) => r.id)) : new Set())} /></th>
              <th style={{ width: 58 }}>Type</th>
              <th style={{ width: 30 }} title="Priority">!</th>
              <th style={{ width: 150 }}>From</th>
              <th>Subject</th>
              <th style={{ width: 110 }}>Received</th>
              <th style={{ width: 70 }}>Status</th>
              <th style={{ width: 24 }} />
            </tr>
          </thead>
          <tbody>
            {rows.map((i) => (
              <tr key={i.id} className="clickable" onClick={() => setSel(i)}
                style={{ background: i.reviewed ? undefined : '#faf4f3', fontWeight: i.reviewed ? 'normal' : 'bold' }}>
                <td onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" checked={checked.has(i.id)} onChange={() => toggle(i.id)} />
                </td>
                <td><span className="pill pill-mute">{QUEUE_CODE[i.queue]}</span></td>
                <td className="center">{i.priority === 'High' ? <span className="flag-h" title="High">!</span> : <span className="muted">·</span>}</td>
                <td className="nowrap">{i.from}</td>
                <td>
                  {i.attachments && i.attachments.length > 0 && <Paperclip size={10} style={{ marginRight: 3, verticalAlign: -1 }} className="muted" />}
                  <span className="link">{i.subject}</span>
                  <span className="muted" style={{ fontWeight: 'normal' }}> — {i.preview}</span>
                </td>
                <td className="xsmall nowrap">{i.received}</td>
                <td>{i.reviewed ? <Pill tone="mute">done</Pill> : <Pill tone="warn">new</Pill>}</td>
                <td onClick={(e) => e.stopPropagation()}>
                  <button className="btn-link" title="Open" onClick={() => setSel(i)}>›</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* never-ending pile: an older-items loader that never resolves */}
        {rows.length === 0 ? (
          <div className="center muted" style={{ padding: 24, borderTop: '1px solid var(--border-light)' }}>
            <CheckCircle2 size={20} style={{ opacity: 0.5 }} />
            <div className="mt8">You've cleared every visible item in your In Basket.</div>
            <div className="xsmall">(Reviewed/done items are hidden. Refresh the page to reload the pile.)</div>
          </div>
        ) : (
          <div className="row center muted" style={{ padding: '10px', justifyContent: 'center', gap: 6, borderTop: '1px solid var(--border-light)' }}>
            <span className="spinner" />
            <span className="xsmall">Loading earlier items… (1,284 older messages)</span>
          </div>
        )}
      </div>

      {sel && (
        <Modal title={`${QUEUE_CODE[sel.queue]} · ${sel.subject}`} onClose={() => setSel(null)} width={560}
          footer={<>
            {sel.patientId
              ? <button className="btn-primary" onClick={() => { dispatch({ t: 'selectPatient', id: sel.patientId! }); nav(`/chart/${sel.patientId}/summary`); setSel(null); }}><FolderOpen size={11} /> Open Patient Chart</button>
              : <span className="xsmall muted" style={{ alignSelf: 'center' }}>No patient linked — open the item source to identify.</span>}
            <span className="grow" />
            <button className="btn-sign" onClick={() => triage('Signed')}><PenLine size={11} /> Sign</button>
            <button onClick={() => { setReplyText(''); setReplyOpen(true); }}><Reply size={11} /> Reply</button>
            <button onClick={() => setRouteOpen(true)}><Share size={11} /> Route</button>
            <button onClick={() => { if (sel) dispatch({ t: 'reviewInbox', id: sel.id }); toast('Deferred to tomorrow.', 'info'); setSel(null); }}><Clock size={11} /> Defer</button>
            <button onClick={() => { setTaskNote(''); setTaskOpen(true); }}><ListPlus size={11} /> Task</button>
            <button onClick={() => triage('Marked reviewed')}><CheckCircle2 size={11} /> Done</button>
          </>}>
          <div className="kv mb8">
            <dt>From</dt><dd>{sel.from}</dd>
            <dt>Patient</dt><dd>{sel.patientName ?? <span className="muted">— not specified —</span>}</dd>
            <dt>Received</dt><dd>{sel.received}</dd>
            <dt>Priority</dt><dd>{sel.priority === 'High' ? <span className="flag-h bold">High</span> : 'Routine'}</dd>
            <dt>Type</dt><dd>{INBOX_QUEUES.find((q) => q.key === sel.queue)?.label}</dd>
            <dt>Status</dt><dd>{sel.reviewed ? 'Reviewed' : 'New'}</dd>
          </div>
          <div className="divider" />
          <p className="small">{sel.body}</p>

          {sel.attachments && sel.attachments.length > 0 && (
            <div className="box mt8" style={{ padding: 6 }}>
              <div className="row gap4 bold xsmall" style={{ color: 'var(--ink-soft)' }}><Paperclip size={11} /> Attachments ({sel.attachments.length})</div>
              <div className="divider" style={{ margin: '4px 0' }} />
              {sel.attachments.map((a) => (
                <div key={a.id} className="row" style={{ marginBottom: 3 }}>
                  <FileImage size={13} className="muted" />
                  <span className="grow small">{a.name} <span className="muted xsmall">· {a.kind.toUpperCase()} · {a.pages} pg</span></span>
                  {/* the extra click: you must open it explicitly, then fight the viewer */}
                  <button className="btn-xs" onClick={() => setViewerAtt(a)}>Open attachment</button>
                </div>
              ))}
              <div className="xsmall muted mt4">Attachments open in the image viewer (scanned — may require zoom).</div>
            </div>
          )}
        </Modal>
      )}

      {viewerAtt && <DocViewer att={viewerAtt} onClose={() => setViewerAtt(null)} />}

      {replyOpen && sel && (
        <Modal title={`Reply — ${sel.subject}`} onClose={() => setReplyOpen(false)} width={500}
          footer={<>
            <button onClick={() => setReplyOpen(false)}>Cancel</button>
            <button className="btn-primary" disabled={!replyText.trim()}
              onClick={() => { dispatch({ t: 'reviewInbox', id: sel.id }); toast(`Reply sent to ${sel.from}.`, 'ok'); setReplyOpen(false); setSel(null); }}>Send Reply</button>
          </>}>
          <div className="kv mb8"><dt>To</dt><dd>{sel.from}</dd></div>
          <textarea rows={6} style={{ width: '100%' }} value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Type your reply…" autoFocus />
        </Modal>
      )}

      {routeOpen && sel && (
        <Modal title="Route Message" onClose={() => setRouteOpen(false)} width={440}
          footer={<>
            <button onClick={() => setRouteOpen(false)}>Cancel</button>
            <button className="btn-primary" onClick={() => { dispatch({ t: 'reviewInbox', id: sel.id }); toast(`Routed to ${routeTo}.`, 'ok'); setRouteOpen(false); setRouteNote(''); setSel(null); }}>Route</button>
          </>}>
          <div className="kv mb8"><dt>Item</dt><dd>{sel.subject}</dd></div>
          <div className="form-grid">
            <label className="req">Route to</label>
            <select value={routeTo} onChange={(e) => setRouteTo(e.target.value)}>
              <option>Nurse pool (RN)</option>
              <option>Medical assistant</option>
              <option>Front desk</option>
              <option>Billing / Coding</option>
              <option>Referrals coordinator</option>
              <option>Pharmacy tech</option>
              <option>Another provider…</option>
            </select>
            <label>Priority</label>
            <select defaultValue="Routine"><option>Routine</option><option>High</option></select>
            <label>Note</label>
            <textarea rows={3} value={routeNote} onChange={(e) => setRouteNote(e.target.value)} placeholder="Optional note to recipient…" style={{ gridColumn: '2 / -1' }} />
          </div>
          <p className="xsmall muted mt8">Routing removes this from your In Basket and places it in the recipient's queue.</p>
        </Modal>
      )}

      {taskOpen && sel && (
        <Modal title="Create Task" onClose={() => setTaskOpen(false)} width={440}
          footer={<>
            <button onClick={() => setTaskOpen(false)}>Cancel</button>
            <button className="btn-sign" onClick={() => {
              dispatch({ t: 'addTask', task: { id: `task-${sel.id}`, queue: 'inbox', title: `${sel.subject} — ${taskAssignee}`, status: 'open', patient: sel.patientName, due: taskDue, routedTo: taskAssignee } });
              toast(`Task created for ${taskAssignee} (due ${taskDue}).`, 'ok');
              setTaskOpen(false);
            }}>Create Task</button>
          </>}>
          <div className="kv mb8"><dt>Re</dt><dd>{sel.subject}</dd>{sel.patientName && <><dt>Patient</dt><dd>{sel.patientName}</dd></>}</div>
          <div className="form-grid">
            <label className="req">Assign to</label>
            <select value={taskAssignee} onChange={(e) => setTaskAssignee(e.target.value)}>
              <option>Me (Okafor, J MD)</option>
              <option>Nurse pool (RN)</option>
              <option>Medical assistant</option>
              <option>Front desk</option>
              <option>Billing / Coding</option>
              <option>Care coordinator</option>
            </select>
            <label className="req">Priority</label>
            <select value={taskPriority} onChange={(e) => setTaskPriority(e.target.value)}>
              <option>Routine</option><option>High</option><option>Urgent</option>
            </select>
            <label className="req">Due</label>
            <input type="date" value={taskDue} onChange={(e) => setTaskDue(e.target.value)} />
            <label>Note</label>
            <textarea rows={3} value={taskNote} onChange={(e) => setTaskNote(e.target.value)} placeholder="Task details…" style={{ gridColumn: '2 / -1' }} />
          </div>
        </Modal>
      )}
    </>
  );
}
