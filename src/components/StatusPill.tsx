import type { ApptStatus, OrderStatus, TaskStatus } from '../types';

type PillTone = 'warn' | 'danger' | 'ok' | 'info' | 'pend' | 'mute';

const APPT_TONE: Record<ApptStatus, PillTone> = {
  scheduled: 'mute', arrived: 'info', roomed: 'info', ready: 'ok',
  'in-progress': 'warn', late: 'warn', 'no-show': 'danger', complete: 'ok',
};
const APPT_LABEL: Record<ApptStatus, string> = {
  scheduled: 'Scheduled', arrived: 'Arrived', roomed: 'Roomed', ready: 'Ready',
  'in-progress': 'In Progress', late: 'Late', 'no-show': 'No-Show', complete: 'Complete',
};

const ORDER_TONE: Record<OrderStatus, PillTone> = {
  draft: 'mute', pended: 'pend', signed: 'ok',
};

export function Pill({ tone, children }: { tone: PillTone; children: React.ReactNode }) {
  return <span className={`pill pill-${tone}`}>{children}</span>;
}

export function ApptStatusPill({ status }: { status: ApptStatus }) {
  return <Pill tone={APPT_TONE[status]}>{APPT_LABEL[status]}</Pill>;
}

export function OrderStatusPill({ status }: { status: OrderStatus }) {
  return <Pill tone={ORDER_TONE[status]}>{status}</Pill>;
}

export function TaskStatusPill({ status }: { status: TaskStatus }) {
  const tone: PillTone = status === 'done' ? 'ok' : status === 'deferred' ? 'pend' : 'warn';
  return <Pill tone={tone}>{status}</Pill>;
}
