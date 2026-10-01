import { useVisit } from './VisitStore';

export default function VisitNote() {
  const { scenario, closed } = useVisit();
  return (
    <div className="f-note">
      <div className="f-note-top">
        <div>
          <div className="f-note-title">{scenario.noteTitle}</div>
          <div className="f-note-by">{scenario.byline} · {scenario.patient}, {scenario.meta}</div>
        </div>
        <span className={`f-note-state ${closed ? 'signed' : ''}`}>{closed ? 'Closed' : 'Open'}</span>
      </div>

      {scenario.note.map((s) => (
        <section key={s.h}>
          <h4 className="f-h">{s.h}</h4>
          {s.p && <p className="f-p">{s.p}</p>}
          {s.items && (
            <ul className="f-ul">{s.items.map((x, i) => <li key={i}>{x}</li>)}</ul>
          )}
        </section>
      ))}

      <div className="f-sig">{scenario.byline}</div>
    </div>
  );
}
