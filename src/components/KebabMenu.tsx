import { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';

export interface MenuAction {
  label: string;
  onClick: () => void;
  sep?: boolean; // render separator above this item
}

export default function KebabMenu({ actions, size = 14 }: { actions: MenuAction[]; size?: number }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <span
        className="link"
        title="More actions"
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        style={{ display: 'inline-flex', cursor: 'pointer' }}
      >
        <MoreVertical size={size} />
      </span>
      {open && (
        <div className="menu" style={{ right: 0, top: '100%' }}>
          {actions.map((act, i) => (
            <div key={i}>
              {act.sep && <div className="menu-sep" />}
              <div
                className="menu-item"
                onClick={(e) => { e.stopPropagation(); setOpen(false); act.onClick(); }}
              >
                {act.label}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
