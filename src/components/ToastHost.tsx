import { useEhr } from '../store/EhrStore';
import { Info, CheckCircle2, AlertTriangle, XCircle, X } from 'lucide-react';

const ICON = {
  info: Info, ok: CheckCircle2, warn: AlertTriangle, danger: XCircle,
};

export default function ToastHost() {
  const { toasts, dispatch } = useEhr();
  return (
    <div className="toast-host">
      {toasts.map((t) => {
        const Icon = ICON[t.kind];
        return (
          <div key={t.id} className={`toast toast-${t.kind}`}>
            <Icon size={14} style={{ flexShrink: 0, marginTop: 1 }} />
            <span className="grow">{t.text}</span>
            <X size={12} className="link" onClick={() => dispatch({ t: 'dismissToast', id: t.id })} />
          </div>
        );
      })}
    </div>
  );
}
