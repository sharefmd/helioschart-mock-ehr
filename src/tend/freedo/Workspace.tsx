import {
  useCallback, useEffect, useRef, useState,
  type CSSProperties, type KeyboardEvent, type PointerEvent,
} from 'react';
import VisitNote from './VisitNote';
import FreedoPanel from './FreedoPanel';

const KEY = 'tend.split';
const MIN = 26;
const MAX = 76;
const DEFAULT = 50;

function stored(): number {
  const v = Number(window.localStorage.getItem(KEY));
  return Number.isFinite(v) && v >= MIN && v <= MAX ? v : DEFAULT;
}

/** Note on the left, Freedo on the right, with a draggable divider between them. */
export default function Workspace() {
  const host = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const [pct, setPct] = useState(stored);

  const apply = useCallback((clientX: number) => {
    const el = host.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (!r.width) return;
    const next = ((clientX - r.left) / r.width) * 100;
    setPct(Math.min(MAX, Math.max(MIN, next)));
  }, []);

  useEffect(() => {
    const move = (e: globalThis.PointerEvent) => {
      if (!dragging.current) return;
      e.preventDefault();
      apply(e.clientX);
    };
    const end = () => {
      if (!dragging.current) return;
      dragging.current = false;
      document.body.classList.remove('f-dragging');
      window.localStorage.setItem(KEY, String(Math.round(pct)));
    };
    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
    };
  }, [apply, pct]);

  const start = (e: PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragging.current = true;
    document.body.classList.add('f-dragging');
  };

  const nudge = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 8 : 2;
    if (e.key === 'ArrowLeft') { e.preventDefault(); setPct((p) => Math.max(MIN, p - step)); }
    if (e.key === 'ArrowRight') { e.preventDefault(); setPct((p) => Math.min(MAX, p + step)); }
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setPct(DEFAULT); }
  };

  const reset = () => {
    setPct(DEFAULT);
    window.localStorage.setItem(KEY, String(DEFAULT));
  };

  return (
    <div
      className="f-workspace"
      ref={host}
      style={{ '--split': `${pct}%` } as CSSProperties}
    >
      <VisitNote />
      <div
        className="f-divider"
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize note and assistant"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={MIN}
        aria-valuemax={MAX}
        tabIndex={0}
        onPointerDown={start}
        onDoubleClick={reset}
        onKeyDown={nudge}
        title="Drag to resize · double-click to reset"
      >
        <span className="f-grip" />
      </div>
      <FreedoPanel />
    </div>
  );
}
