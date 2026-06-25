import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, CheckCircle2, AlertTriangle, Printer, CopyPlus, Lock } from 'lucide-react';
import { useEhr } from '../../../store/EhrStore';
import NoteEditor from './NoteEditor';
import Modal from '../../../components/Modal';
import { Pill } from '../../../components/StatusPill';
import { getNotes, type SoapNote } from '../../../data/notes';

function SoapNoteView({ note }: { note: SoapNote }) {
  const s = useEhr();
  const Section = ({ label, body }: { label: string; body: string }) => (
    <div className="mb8">
      <div className="bold" style={{ color: 'var(--ink-soft)', borderBottom: '1px solid var(--border-light)', marginBottom: 3 }}>{label}</div>
      <div className="small" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>{body}</div>
    </div>
  );
  return (
    <div className="panel">
      <div className="panel-head">
        <span>{note.type} · {note.date} · {note.author}</span>
        <span className="pill pill-ok"><Lock size={9} style={{ verticalAlign: -1 }} /> Signed</span>
      </div>
      <div className="toolbar">
        <button className="btn-xs" onClick={() => s.toast('Note sent to printer (demo).', 'info')}><Printer size={11} /> Print</button>
        <button className="btn-xs" onClick={() => { s.dispatch({ t: 'appendNoteSection', section: 'assessmentPlan', value: `(Pulled from ${note.date}) ${note.plan}` }); s.toast('Plan copied into the current encounter note.', 'ok'); }}><CopyPlus size={11} /> Copy Plan to Current Note</button>
        <span className="spacer" />
        <span className="xsmall muted">Read-only — signed notes cannot be edited</span>
      </div>
      <div className="panel-body">
        <Section label="S — Subjective" body={note.subjective} />
        <Section label="O — Objective" body={note.objective} />
        <Section label="A — Assessment" body={note.assessment} />
        <Section label="P — Plan" body={note.plan} />
        <div className="divider" />
        <div className="xsmall muted">Electronically signed by {note.author} on {note.date}.</div>
      </div>
    </div>
  );
}

export default function NotesTab() {
  const s = useEhr();
  const nav = useNavigate();
  const [closeModal, setCloseModal] = useState(false);
  const [selected, setSelected] = useState<string>('current'); // 'current' | note id
  const history = getNotes(s.activePatientId);
  const activeNote = history.find((n) => n.id === selected);

  const outstanding = [
    s.note.status !== 'signed' && 'Progress note is unsigned',
    s.unsignedOrderCount > 0 && `${s.unsignedOrderCount} unsigned order(s)`,
    s.unreviewedInboxCount > 0 && `${s.unreviewedInboxCount} unreviewed inbox item(s)`,
    !s.tasks.some((t) => t.queue === 'scheduling') && 'No follow-up scheduled',
  ].filter(Boolean) as string[];

  const NoteListItem = ({ id, title, sub, badge, active }: { id: string; title: string; sub: string; badge: React.ReactNode; active: boolean }) => (
    <div className={active ? 'box selected' : 'box'} style={{ padding: '4px 6px', marginBottom: 3, cursor: 'pointer' }} onClick={() => setSelected(id)}>
      <div className="row"><FileText size={12} /><span className={active ? 'bold small' : 'small'}>{title}</span><span className="grow" />{badge}</div>
      <div className="xsmall muted">{sub}</div>
    </div>
  );

  return (
    <div className="grid-2" style={{ gridTemplateColumns: '210px 1fr', alignItems: 'start' }}>
      <div className="panel">
        <div className="panel-head">Encounter Notes</div>
        <div style={{ padding: 4 }}>
          <NoteListItem
            id="current"
            title="Office Visit (current)"
            sub={`2026-06-23 · ${s.note.status === 'signed' ? 'Signed' : 'Draft'} · Okafor, James MD`}
            badge={s.note.status === 'signed' ? <Pill tone="ok">Signed</Pill> : <Pill tone="warn">Draft</Pill>}
            active={selected === 'current'}
          />
          <div className="xsmall muted" style={{ margin: '6px 2px 2px' }}>PRIOR NOTES</div>
          {history.length === 0 && <div className="xsmall muted" style={{ padding: 4 }}>No prior notes on file.</div>}
          {history.map((n) => (
            <NoteListItem
              key={n.id}
              id={n.id}
              title={n.type}
              sub={`${n.date} · ${n.author}`}
              badge={<Pill tone="ok">Signed</Pill>}
              active={selected === n.id}
            />
          ))}
          <button className="btn-xs mt8" style={{ width: '100%' }} onClick={() => s.toast('Only one draft per encounter in this demo.', 'info')}>+ New Note</button>
        </div>
        <div className="panel-head" style={{ borderTop: '1px solid var(--border-dark)' }}>Close-out</div>
        <div style={{ padding: 6 }}>
          <button className="btn-xs btn-primary" style={{ width: '100%' }} onClick={() => setCloseModal(true)}>Close Encounter</button>
        </div>
      </div>

      {selected === 'current' ? <NoteEditor /> : activeNote ? <SoapNoteView note={activeNote} /> : <NoteEditor />}

      {closeModal && (
        <Modal title={`Close Encounter — ${s.activePatientId}`} onClose={() => setCloseModal(false)} width={480}
          footer={<>
            <button onClick={() => setCloseModal(false)}>Keep Working</button>
            <button className="btn-danger"
              disabled={outstanding.length > 0}
              title={outstanding.length ? 'Resolve outstanding items first' : ''}
              onClick={() => { s.dispatch({ t: 'closeEncounter' }); s.toast('Encounter closed.', 'ok'); setCloseModal(false); nav('/inbox'); }}>
              Close Encounter
            </button>
          </>}>
          {outstanding.length === 0 ? (
            <div className="alert alert-ok"><CheckCircle2 size={14} /><span>All encounter items complete. Safe to close.</span></div>
          ) : (
            <>
              <div className="alert alert-warn mb8"><AlertTriangle size={14} /><span>This encounter has <b>{outstanding.length}</b> outstanding item(s). You must resolve them before closing.</span></div>
              <ul className="small">
                {outstanding.map((o) => (
                  <li key={o} className="row" style={{ marginBottom: 2 }}>
                    <AlertTriangle size={11} style={{ color: 'var(--warn)' }} /> {o}
                  </li>
                ))}
              </ul>
              <p className="xsmall muted mt8">Even after closing, related inbox tasks (results to sign, refill requests, forms) remain in your queue — work never fully ends.</p>
            </>
          )}
        </Modal>
      )}
    </div>
  );
}
