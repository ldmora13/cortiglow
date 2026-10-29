import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

// Tooltip con retardo renderizado en un portal: las listas de productos tienen
// overflow y recortarían cualquier tooltip posicionado dentro de su caja.
export function Tooltip({ label, children, delay = 400 }: {
  label: string;
  children: ReactNode;
  delay?: number;
}) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const timer = useRef<number | null>(null);
  const [tip, setTip] = useState<{ top: number; left: number } | null>(null);

  const cancel = () => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
    setTip(null);
  };

  useEffect(() => cancel, []);

  const schedule = () => {
    timer.current = window.setTimeout(() => {
      const rect = anchorRef.current?.getBoundingClientRect();
      if (rect) setTip({ top: rect.bottom + 8, left: Math.min(rect.left, window.innerWidth - 296) });
    }, delay);
  };

  return (
    <div
      ref={anchorRef}
      className="min-w-0"
      onMouseEnter={schedule}
      onMouseLeave={cancel}
      onFocus={schedule}
      onBlur={cancel}
    >
      {children}
      {tip && createPortal(
        <div
          role="tooltip"
          style={{ top: tip.top, left: tip.left }}
          className="fixed z-[100] px-3 py-2 bg-zinc-900 text-white rounded-xl shadow-lg pointer-events-none w-max max-w-[280px]"
        >
          <p className="text-xs font-bold break-words">{label}</p>
        </div>,
        document.body
      )}
    </div>
  );
}
