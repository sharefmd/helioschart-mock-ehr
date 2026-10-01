import {
  createContext, useContext, useReducer, useCallback, useMemo, useRef, useEffect,
  type ReactNode,
} from 'react';
import { SCENARIOS, byId, type ScriptItem, type Scenario } from './scenarios';

export interface Item extends ScriptItem { id: number }

interface State {
  scenarioId: string;
  items: Item[];
  /** queue of script items still streaming in */
  pending: ScriptItem[];
  resolved: boolean;
  /** index of the close step the clinician is on; === close.length when the visit is closed */
  step: number;
  /** steps the clinician chose to skip */
  skipped: number[];
  /** surfaces the clinician pinned as tabs */
  kept: { id: string; label: string }[];
  /** which pane is showing: 'visit' | 'followups' | 'internal' | a kept surface id */
  tab: string;
}

let seq = 1;

function openingFor(s: Scenario): Item[] {
  return [{ id: seq++, k: 'insight', text: s.opening, ref: s.ref }];
}

function init(id = SCENARIOS[0].id): State {
  return {
    scenarioId: id, items: openingFor(byId(id)), pending: [], resolved: false,
    step: 0, skipped: [], kept: [], tab: 'visit',
  };
}

type A =
  | { t: 'scenario'; id: string }
  | { t: 'ask'; prompt: string; script: ScriptItem[] }
  | { t: 'tick' }
  | { t: 'resolve' }
  | { t: 'complete' }
  | { t: 'skipStep' }
  | { t: 'closeAll' }
  | { t: 'keep'; id: string; label: string }
  | { t: 'unkeep'; id: string }
  | { t: 'setTab'; tab: string }
  | { t: 'reset' };

function reducer(s: State, a: A): State {
  switch (a.t) {
    case 'scenario':
      return init(a.id);
    case 'ask':
      return {
        ...s,
        items: [...s.items, { id: seq++, k: 'you', text: a.prompt }],
        pending: a.script,
      };
    case 'tick': {
      if (!s.pending.length) return s;
      const [next, ...rest] = s.pending;
      return { ...s, items: [...s.items, { ...next, id: seq++ }], pending: rest };
    }
    case 'resolve':
      return { ...s, resolved: !s.resolved };
    case 'complete':
      return { ...s, step: s.step + 1 };
    case 'skipStep':
      return { ...s, step: s.step + 1, skipped: [...s.skipped, s.step] };
    case 'closeAll':
      return { ...s, step: byId(s.scenarioId).close.length };
    case 'keep':
      if (s.kept.some((k) => k.id === a.id)) return { ...s, tab: a.id };
      return { ...s, kept: [...s.kept, { id: a.id, label: a.label }], tab: a.id };
    case 'unkeep':
      return { ...s, kept: s.kept.filter((k) => k.id !== a.id), tab: s.tab === a.id ? 'visit' : s.tab };
    case 'setTab':
      return { ...s, tab: a.tab };
    case 'reset':
      return init(s.scenarioId);
    default:
      return s;
  }
}

interface Ctx {
  scenario: Scenario;
  items: Item[];
  streaming: boolean;
  resolved: boolean;
  /** index of the step in progress */
  step: number;
  skipped: number[];
  /** every close step has been settled */
  closed: boolean;
  remaining: number;
  kept: { id: string; label: string }[];
  tab: string;
  setScenario: (id: string) => void;
  ask: (prompt: string) => void;
  toggleResolved: () => void;
  complete: () => void;
  skipStep: () => void;
  closeAll: () => void;
  keep: (id: string, label: string) => void;
  unkeep: (id: string) => void;
  setTab: (tab: string) => void;
  reset: () => void;
}

const C = createContext<Ctx | null>(null);

export function VisitProvider({ children }: { children: ReactNode }) {
  const [s, d] = useReducer(reducer, undefined, () => init());
  const timer = useRef<number | null>(null);

  // stream the pending script in, one item at a time
  useEffect(() => {
    if (!s.pending.length) return;
    timer.current = window.setTimeout(() => d({ t: 'tick' }), 520);
    return () => { if (timer.current) window.clearTimeout(timer.current); };
  }, [s.pending]);

  const scenario = byId(s.scenarioId);

  const ask = useCallback((prompt: string) => {
    const sc = byId(s.scenarioId);
    const q = prompt.toLowerCase();
    const hit = sc.asks.find((a) => {
      const words = a.prompt.toLowerCase().split(/\W+/).filter((w) => w.length > 4);
      return a.prompt.toLowerCase() === q || words.some((w) => q.includes(w));
    });
    d({
      t: 'ask',
      prompt,
      script: hit ? hit.script : [{
        k: 'say',
        text: 'I can draft orders, defend a recommendation, or build a view that does not exist yet. '
          + 'The suggestion under the box is the interesting one for this patient.',
      }],
    });
  }, [s.scenarioId]);

  const value = useMemo<Ctx>(() => ({
    scenario,
    items: s.items,
    streaming: s.pending.length > 0,
    resolved: s.resolved,
    step: s.step,
    skipped: s.skipped,
    closed: s.step >= scenario.close.length,
    remaining: Math.max(0, scenario.close.length - s.step),
    setScenario: (id) => d({ t: 'scenario', id }),
    ask,
    toggleResolved: () => d({ t: 'resolve' }),
    complete: () => d({ t: 'complete' }),
    skipStep: () => d({ t: 'skipStep' }),
    closeAll: () => d({ t: 'closeAll' }),
    kept: s.kept,
    tab: s.tab,
    keep: (id, label) => d({ t: 'keep', id, label }),
    unkeep: (id) => d({ t: 'unkeep', id }),
    setTab: (tab) => d({ t: 'setTab', tab }),
    reset: () => d({ t: 'reset' }),
  }), [scenario, s, ask]);

  return <C.Provider value={value}>{children}</C.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useVisit(): Ctx {
  const v = useContext(C);
  if (!v) throw new Error('useVisit must be used inside VisitProvider');
  return v;
}

export { SCENARIOS };
