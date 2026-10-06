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
      icon: '🗑️',
      gradient: 'from-red-500 to-rose-500',
      confirmBg: 'from-red-600 to-rose-600',
      confirmHover: 'hover:from-red-700 hover:to-rose-700'
    },
    warning: {
      icon: '⚠️',
      gradient: 'from-orange-500 to-amber-500',
      confirmBg: 'from-orange-600 to-amber-600',
      confirmHover: 'hover:from-orange-700 hover:to-amber-700'
    },
    info: {
      icon: 'ℹ️',
      gradient: 'from-blue-500 to-cyan-500',
      confirmBg: 'from-blue-600 to-cyan-600',
      confirmHover: 'hover:from-blue-700 hover:to-cyan-700'
    }
  };

  const style = config[type];

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 bg-zinc-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-zinc-200 animate-scale-in">
        {/* Header Modal */}
        <div className="relative p-8 pb-6 border-b border-zinc-100 bg-white z-20">
          <div className="absolute top-6 right-6">
            <button onClick={onCancel} className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors active:scale-95">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className={clsx("w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-inner border", style.gradient, type === 'danger' ? 'border-red-200/50 text-white' : type === 'warning' ? 'border-orange-200/50 text-white' : 'border-blue-200/50 text-white')}>
              <span className="text-2xl">{style.icon}</span>
            </div>
            <div className="pr-8">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                {title}
              </h2>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-8 pb-6">
          <p className="text-gray-700 text-base font-medium leading-relaxed">
            {message}
          </p>
        </div>

        {/* Actions / Footer */}
        <div className="px-8 pb-8 flex gap-3 pt-4 border-t border-zinc-100 mt-2">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3.5 text-zinc-600 bg-white border-2 border-zinc-200 font-bold rounded-xl hover:bg-zinc-50 hover:text-zinc-900 transition-all active:scale-95"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={clsx(
              "flex-1 px-6 py-3.5 text-white font-bold rounded-xl shadow-md active:scale-95 transition-all bg-gradient-to-br",
              style.confirmBg,
              style.confirmHover
            )}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}




