import {
  createContext, useContext, useReducer, useCallback, useMemo,
  type ReactNode,
} from 'react';
import type {
  EhrMode, Medication, Order, Task, NoteDraft, LabResult, Problem,
  InboxItem, FormDoc, ToastMsg, ToastKind, ApptStatus, ChargeLine, BillingClaim,
} from '../types';
import { PATIENTS } from '../data/patient';
import { SEED_INBOX, SEED_FORMS } from '../data/inbox';
import { SCHEDULE } from '../data/schedule';

// Per-patient working state for the open encounter.
interface PatientEncounter {
  problems: Problem[];
  meds: Medication[];
  results: LabResult[];
  note: NoteDraft;
  orders: Order[];
  tasks: Task[];
  charges: ChargeLine[];
  claims: BillingClaim[];
  encounterClosed: boolean;
}

interface EhrState {
  mode: EhrMode;
  activePatientId: string;
  apptStatus: Record<string, ApptStatus>;
  enc: Record<string, PatientEncounter>;
  inbox: InboxItem[];
  forms: FormDoc[];
  toasts: ToastMsg[];
}

const EMPTY_NOTE: NoteDraft = {
  hpi: '', exam: '', assessmentPlan: '', patientInstructions: '', status: 'unsigned',
};

function initState(): EhrState {
  const apptStatus: Record<string, ApptStatus> = {};
  SCHEDULE.forEach((a) => { apptStatus[a.id] = a.status; });
  const enc: Record<string, PatientEncounter> = {};
  PATIENTS.forEach((p) => {
    enc[p.id] = {
      problems: p.problems.map((x) => ({ ...x })),
      meds: p.seedMeds.map((x) => ({ ...x })),
      results: p.seedResults.map((x) => ({ ...x })),
      note: { ...EMPTY_NOTE },
      orders: [],
      tasks: [],
      charges: [],
      claims: [],
      encounterClosed: false,
    };
  });
  return {
    mode: 'conventional',
    activePatientId: 'FT-483920',
    apptStatus,
    enc,
    inbox: [...SEED_INBOX],
    forms: [...SEED_FORMS],
    toasts: [],
  };
}

type Action =
  | { t: 'setMode'; mode: EhrMode }
  | { t: 'selectPatient'; id: string }
  | { t: 'setApptStatus'; id: string; status: ApptStatus }
  | { t: 'setNoteSection'; section: keyof NoteDraft; value: string }
  | { t: 'appendNoteSection'; section: keyof NoteDraft; value: string }
  | { t: 'signNote' }
  | { t: 'addOrder'; order: Order }
  | { t: 'setOrderStatus'; id: string; status: Order['status'] }
  | { t: 'signOrder'; id: string }
  | { t: 'addTask'; task: Task }
  | { t: 'setTaskStatus'; id: string; status: Task['status'] }
  | { t: 'addProblem'; problem: Problem }
  | { t: 'addCharge'; line: ChargeLine }
  | { t: 'removeCharge'; id: string }
  | { t: 'dropClaim'; claim: BillingClaim }
  | { t: 'updateClaim'; id: string; patch: Partial<BillingClaim> }
  | { t: 'reviewResult'; id: string }
  | { t: 'reviewInbox'; id: string }
  | { t: 'setFormStatus'; id: string; status: FormDoc['status'] }
  | { t: 'closeEncounter' }
  | { t: 'toast'; toast: ToastMsg }
  | { t: 'dismissToast'; id: number };

let toastSeq = 1;
let medSeq = 1000;

function reducer(state: EhrState, a: Action): EhrState {
  // Helper: update the active patient's encounter immutably.
  const upd = (fn: (e: PatientEncounter) => PatientEncounter): EhrState => {
    const id = state.activePatientId;
    return { ...state, enc: { ...state.enc, [id]: fn(state.enc[id]) } };
  };

  switch (a.t) {
    case 'setMode':
      return { ...state, mode: a.mode };
    case 'selectPatient':
      return { ...state, activePatientId: a.id };
    case 'setApptStatus':
      return { ...state, apptStatus: { ...state.apptStatus, [a.id]: a.status } };
    case 'setNoteSection':
      // NB: editing the note has NO downstream effect. That is the whole point.
      return upd((e) => ({ ...e, note: { ...e.note, [a.section]: a.value } }));
    case 'appendNoteSection':
      return upd((e) => {
        const cur = e.note[a.section] as string;
        return { ...e, note: { ...e.note, [a.section]: cur ? `${cur}\n${a.value}` : a.value } };
      });
    case 'signNote':
      return upd((e) => ({ ...e, note: { ...e.note, status: 'signed', signedAt: '2026-06-23 09:54' } }));
    case 'addOrder':
      return upd((e) => ({ ...e, orders: [...e.orders, a.order] }));
    case 'setOrderStatus':
      return upd((e) => ({ ...e, orders: e.orders.map((o) => (o.id === a.id ? { ...o, status: a.status } : o)) }));
    case 'signOrder':
      return upd((e) => {
        const order = e.orders.find((o) => o.id === a.id);
        const orders = e.orders.map((o) => (o.id === a.id ? { ...o, status: 'signed' as const, signedAt: '2026-06-23 09:50' } : o));
        let meds = e.meds;
        // Signing a MED order is the ONLY way a med reaches the Medications tab.
        if (order && order.type === 'med' && order.medData) {
          meds = [...e.meds, {
            id: `m${medSeq++}`,
            name: order.medData.name, dose: order.medData.dose,
            route: order.medData.route, frequency: order.medData.frequency,
            status: 'active', startedDate: '2026-06-23', orderedFrom: 'orders-tab',
          }];
        }
        return { ...e, orders, meds };
      });
    case 'addTask':
      return upd((e) => ({ ...e, tasks: [...e.tasks, a.task] }));
    case 'setTaskStatus':
      return upd((e) => ({ ...e, tasks: e.tasks.map((t) => (t.id === a.id ? { ...t, status: a.status } : t)) }));
    case 'addProblem':
      return upd((e) => ({ ...e, problems: [...e.problems, a.problem] }));
    case 'addCharge':
      return upd((e) => ({ ...e, charges: [...e.charges, a.line] }));
    case 'removeCharge':
      return upd((e) => ({ ...e, charges: e.charges.filter((c) => c.id !== a.id) }));
    case 'dropClaim':
      return upd((e) => ({ ...e, claims: [...e.claims, a.claim] }));
    case 'updateClaim':
      return upd((e) => ({ ...e, claims: e.claims.map((c) => (c.id === a.id ? { ...c, ...a.patch } : c)) }));
    case 'reviewResult':
      return upd((e) => ({ ...e, results: e.results.map((r) => (r.id === a.id ? { ...r, reviewed: true } : r)) }));
    case 'closeEncounter':
      return upd((e) => ({ ...e, encounterClosed: true }));
    case 'reviewInbox':
      return { ...state, inbox: state.inbox.map((i) => (i.id === a.id ? { ...i, reviewed: true } : i)) };
    case 'setFormStatus':
      return { ...state, forms: state.forms.map((f) => (f.id === a.id ? { ...f, status: a.status } : f)) };
    case 'toast':
      return { ...state, toasts: [...state.toasts, a.toast].slice(-5) };
    case 'dismissToast':
      return { ...state, toasts: state.toasts.filter((t) => t.id !== a.id) };
    default:
      return state;
  }
}

interface EhrContextValue {
  mode: EhrMode;
  activePatientId: string;
  apptStatus: Record<string, ApptStatus>;
  inbox: InboxItem[];
  forms: FormDoc[];
  toasts: ToastMsg[];
  // active-patient encounter (flattened for convenience)
  problems: Problem[];
  meds: Medication[];
  results: LabResult[];
  note: NoteDraft;
  orders: Order[];
  tasks: Task[];
  charges: ChargeLine[];
  claims: BillingClaim[];
  encounterClosed: boolean;
  // api
  dispatch: React.Dispatch<Action>;
  toast: (text: string, kind?: ToastKind) => void;
  // derived counts (active patient)
  openTaskCount: number;
  unsignedOrderCount: number;
  unreviewedInboxCount: number;
}

const Ctx = createContext<EhrContextValue | null>(null);

export function EhrProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initState);

  const toast = useCallback((text: string, kind: ToastKind = 'info') => {
    const t: ToastMsg = { id: toastSeq++, kind, text };
    dispatch({ t: 'toast', toast: t });
    setTimeout(() => dispatch({ t: 'dismissToast', id: t.id }), 4200);
  }, []);

  const value = useMemo<EhrContextValue>(() => {
    const e = state.enc[state.activePatientId];
    return {
      mode: state.mode,
      activePatientId: state.activePatientId,
      apptStatus: state.apptStatus,
      inbox: state.inbox,
      forms: state.forms,
      toasts: state.toasts,
      problems: e.problems,
      meds: e.meds,
      results: e.results,
      note: e.note,
      orders: e.orders,
      tasks: e.tasks,
      charges: e.charges,
      claims: e.claims,
      encounterClosed: e.encounterClosed,
      dispatch,
      toast,
      openTaskCount: e.tasks.filter((t) => t.status === 'open').length,
      unsignedOrderCount: e.orders.filter((o) => o.status !== 'signed').length,
      unreviewedInboxCount: state.inbox.filter((i) => !i.reviewed).length,
    };
  }, [state, toast]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useEhr(): EhrContextValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useEhr must be used within EhrProvider');
  return v;
}
