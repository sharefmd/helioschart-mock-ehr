import { AlertTriangle, Info, ShieldAlert } from 'lucide-react';
import type { OrderWarning } from '../types';

const ICON = { High: ShieldAlert, Moderate: AlertTriangle, Info: Info };
const ALERT_CLASS = { High: 'alert-danger', Moderate: 'alert-warn', Info: 'alert-info' };

export default function WarningBanner({
  warning, onOverride,
}: { warning: OrderWarning; onOverride?: () => void }) {
  const Icon = ICON[warning.severity];
  return (
    <div className={`alert ${ALERT_CLASS[warning.severity]}`} style={{ marginBottom: 4 }}>
      <Icon size={14} style={{ flexShrink: 0 }} />
      <span className="grow">
        <span className="bold">{warning.kind.toUpperCase()} CHECK:</span> {warning.text}
      </span>
      {warning.overridable && onOverride && (
        <button className="btn-xs" onClick={onOverride}>Override…</button>
      )}
    </div>
  );
}
