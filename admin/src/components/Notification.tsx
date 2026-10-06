import { useEffect } from 'react';
import clsx from 'clsx';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationProps {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

export default function Notification({
  id,
  type,
  message,
  duration = 4000,
  onClose
}: NotificationProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  const config = {
    success: {
      icon: '✅',
      gradient: 'from-green-500 to-emerald-500',
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800'
    },
    error: {
      icon: '❌',
      gradient: 'from-red-500 to-rose-500',
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800'
    },
    warning: {
      icon: '⚠️',
      gradient: 'from-orange-500 to-amber-500',
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-800'
    },
    info: {
      icon: 'ℹ️',
      gradient: 'from-blue-500 to-cyan-500',
      bg: 'bg-gray-50',
      border: 'border-zinc-200',
      text: 'text-blue-800'
    }
  };

  const style = config[type];

  return (
    <div
      className={clsx(
        "flex items-start gap-3 p-4 rounded-2xl shadow-md border-2 backdrop-blur-xl",
        "animate-slide-in-right max-w-md w-full",
        style.bg,
        style.border
      )}
    >
      {/* Icon */}
      <div className={clsx(
        "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-lg",
        style.gradient
      )}>
        <span className="text-xl">{style.icon}</span>
      </div>

      {/* Message */}
      <div className="flex-1 min-w-0 pt-1">
        <p className={clsx("font-semibold text-sm", style.text)}>
          {message}
        </p>
      </div>

      {/* Close Button */}
      <button
        onClick={() => onClose(id)}
        className={clsx(
          "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
          "hover:bg-white/50 active:scale-95 transition-all",
          style.text
        )}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Progress Bar */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 rounded-b-2xl overflow-hidden">
          <div
            className={clsx("h-full bg-gradient-to-r", style.gradient)}
            style={{
              animation: `progress ${duration}ms linear forwards`
            }}
          />
        </div>
      )}
    </div>
  );
}




