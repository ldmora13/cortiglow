import clsx from 'clsx';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'warning',
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const config = {
    danger: {
      iconBg: 'bg-rose-100 text-rose-700',
      iconPath: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
      confirmBg: 'bg-rose-600 hover:bg-rose-700',
    },
    warning: {
      iconBg: 'bg-amber-100 text-amber-700',
      iconPath: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
      confirmBg: 'bg-zinc-900 hover:bg-zinc-700',
    },
    info: {
      iconBg: 'bg-zinc-100 text-zinc-700',
      iconPath: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      confirmBg: 'bg-zinc-900 hover:bg-zinc-700',
    }
  };

  const style = config[type];

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-zinc-950/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-zinc-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5">
          <div className="flex items-start gap-3.5">
            <span className={clsx('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', style.iconBg)}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={style.iconPath} />
              </svg>
            </span>
            <div className="min-w-0 pt-0.5">
              <h2 id="confirm-title" className="text-base font-bold text-zinc-900 tracking-tight">
                {title}
              </h2>
              <p className="mt-1 text-sm font-medium leading-relaxed text-zinc-500">
                {message}
              </p>
            </div>
          </div>
        </div>

        <div className="px-5 pb-5 flex gap-2.5">
          <button
            onClick={onCancel}
            className="flex-1 min-h-[44px] px-4 py-2.5 text-sm text-zinc-700 bg-white border border-zinc-300 font-semibold rounded-xl hover:bg-zinc-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            autoFocus
            className={clsx(
              'flex-1 min-h-[44px] px-4 py-2.5 text-sm text-white font-semibold rounded-xl shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 transition-colors',
              style.confirmBg
            )}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
