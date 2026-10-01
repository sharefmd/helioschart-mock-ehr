import { useNavigate } from 'react-router-dom';
import { CornerDownLeft, ExternalLink } from 'lucide-react';
import { useVisit, SCENARIOS } from './VisitStore';

/**
 * Presenter crib sheet. Hidden from the clinician-facing UI — these are the
 * asks that make Freedo build a net-new surface. Clicking one switches
 * specialty and fires the ask.
 */
export default function DemoSheet({ onDone }: { onDone: () => void }) {
  const { scenario, setScenario, ask } = useVisit();
  const nav = useNavigate();

  const run = (id: string, prompt: string) => {
    if (id !== scenario.id) setScenario(id);
    // let the scenario swap land before asking
    window.setTimeout(() => ask(prompt), 60);
    onDone();
  };

  return (
    <div className="d-sheet">
      <div className="d-sheet-h">
        <span className="t">Demo crib sheet</span>
        <span className="s">Not shown to the clinician</span>
      </div>

      <div className="d-list">
        {SCENARIOS.map((s) => {
          const a = s.asks[0];
          if (!a) return null;
          return (
            <button
              key={s.id}
              className={`d-row ${s.id === scenario.id ? 'on' : ''}`}
              onClick={() => run(s.id, a.prompt)}
            >
              <span className="sp">{s.specialty}</span>
              <span className="q">“{a.prompt}”</span>
              <span className="b">
                builds <b>{a.script.find((x) => x.k === 'surface')?.tab ?? 'a draft'}</b>
                <CornerDownLeft size={11} />
              </span>
            </button>
          );
        })}
      </div>

      <div className="d-sheet-f">
        <span>Each one streams tool calls, then creates the surface.</span>
        <button className="d-link" onClick={() => nav('/schedule')}>
          HeliosChart <ExternalLink size={11} />
        </button>
      </div>
    </div>
  );
}
