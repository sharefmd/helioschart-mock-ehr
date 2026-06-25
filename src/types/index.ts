// Shared domain types for the mock EHR.

export interface Allergy {
  substance: string;
  reaction: string;
  severity: 'High' | 'Moderate' | 'Low';
}

export interface Problem {
  id: string;
  name: string;
  icd10: string;
  status: 'Active' | 'Resolved' | 'Chronic';
  onsetDate: string;
}

export interface Vital {
  label: string;
  value: string;
  flag?: 'H' | 'L';
  date: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  dob: string;
  sex: string;
  mrn: string;
  pcp: string;
  insurance: string;
  pharmacy: string;
  riskFlags: string[];
  allergies: Allergy[];
  problems: Problem[];
  vitals: Vital[];
}

export type MedStatus = 'active' | 'historical' | 'pended' | 'discontinued';

export interface Medication {
  id: string;
  name: string;
  dose: string;
  route: string;
  frequency: string;
  status: MedStatus;
  startedDate?: string;
  // provenance — proves the med never came from note text, only from a signed order
  orderedFrom?: 'orders-tab' | 'history';
}

export type OrderType = 'med' | 'lab' | 'imaging' | 'referral' | 'procedure';
export type OrderStatus = 'draft' | 'pended' | 'signed';

export interface OrderWarning {
  kind: 'allergy' | 'interaction' | 'renal' | 'duplicate';
  severity: 'High' | 'Moderate' | 'Info';
  text: string;
  overridable: boolean;
}

export interface Order {
  id: string;
  type: OrderType;
  display: string;
  details: string;
  status: OrderStatus;
  warnings: OrderWarning[];
  signedAt?: string;
  // For med orders: structured payload that derives a Medication when signed.
  medData?: { name: string; dose: string; route: string; frequency: string };
}

export type ResultFlag = 'H' | 'L' | 'normal' | 'abnormal';

export interface LabResult {
  id: string;
  name: string;
  value: string;
  unit: string;
  refRange: string;
  flag: ResultFlag;
  collected: string;
  reviewed: boolean;
  trend: { date: string; value: number }[];
}

export type TaskStatus = 'open' | 'deferred' | 'done';

export interface Task {
  id: string;
  queue: 'scheduling' | 'orders' | 'note' | 'inbox' | 'general';
  title: string;
  patient?: string;
  status: TaskStatus;
  due?: string;
  routedTo?: string;
}

export type ApptStatus = 'scheduled' | 'arrived' | 'roomed' | 'ready' | 'in-progress' | 'late' | 'no-show' | 'complete';

export interface Appointment {
  id: string;
  time: string;
  patientId: string;
  patientName: string;
  dob: string;
  age: number;
  visitType: string;
  status: ApptStatus;
  provider: string;
  location: string;
}

export interface NoteDraft {
  hpi: string;
  exam: string;
  assessmentPlan: string;
  patientInstructions: string;
  status: 'unsigned' | 'signed';
  signedAt?: string;
}

export interface Attachment {
  id: string;
  name: string;
  kind: 'fax' | 'scan' | 'ekg' | 'card' | 'form';
  pages: number;
}

export interface InboxItem {
  id: string;
  queue: InboxQueueKey;
  from: string;
  subject: string;
  preview: string;
  body: string;
  received: string;
  priority?: 'High' | 'Routine';
  reviewed: boolean;
  patientId?: string;   // links the item to a chart (absent for system notices)
  patientName?: string; // display label for the linked patient
  attachments?: Attachment[];
}

export type InboxQueueKey =
  | 'results' | 'refills' | 'messages' | 'forms' | 'priorauth' | 'staff'
  | 'cosign' | 'cc' | 'system' | 'orders' | 'coding';

export interface FormDoc {
  id: string;
  direction: 'incoming' | 'outgoing';
  name: string;
  source: string;
  status: 'New' | 'Pending' | 'Completed' | 'Faxed';
  receivedDate: string;
}

export interface FormularyItem {
  id: string;
  name: string;
  commonDoses: string[];
  defaultRoute: string;
  defaultFreq: string;
  class: string;
}

export interface LabCatalogItem {
  id: string;
  name: string;
  specimen: string;
  commonIntervals: string[];
  aliases?: string[];   // search shorthands (e.g. "lytes", "hba1c", "lfts")
}

export interface ChargeLine {
  id: string;
  cpt: string;
  mod: string;
  desc: string;
  units: number;
  dx: string;
  charge: number;
}

export type ClaimStage =
  | 'charge_review' | 'ready' | 'sent_837' | 'ack_999' | 'ack_277'
  | 'denied' | 'appeal' | 'paid' | 'patient';

export interface ClaimEdit {
  id: string;
  kind: 'mod25' | 'dxptr' | 'auth' | 'eligibility' | 'taxonomy' | 'subscriber';
  text: string;
  resolved: boolean;
}

export interface ClaimEvent {
  ts: string;
  text: string;
  tone?: 'ok' | 'warn' | 'danger' | 'info';
}

export interface ClaimDenial {
  carc: string;
  rarc: string;
  reason: string;
  amount: number;
}

export interface BillingClaim {
  id: string;
  payer: string;
  dos: string;
  billed: number;
  stage: ClaimStage;
  edits: ClaimEdit[];
  events: ClaimEvent[];
  authNumber?: string;
  eligibilityChecked?: boolean;
  rejectionCleared?: boolean;   // 277CA rejection resolved
  eraPosted?: boolean;
  paidAmount?: number;
  contractualAdj?: number;
  patientResp?: number;
  denial?: ClaimDenial;
  appealed?: boolean;
}

export type EhrMode = 'conventional' | 'intelligent';
export type ToastKind = 'info' | 'ok' | 'warn' | 'danger';

export interface ToastMsg {
  id: number;
  kind: ToastKind;
  text: string;
}
