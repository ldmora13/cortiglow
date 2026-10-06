// @ts-nocheck
interface OrderStatusBadgeProps {
  status: string;
  className?: string;
}

export default function OrderStatusBadge({ status, className = '' }: OrderStatusBadgeProps) {
  const baseClasses = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold';

  const statusConfig: Record<string, { label: string; classes: string; icon: JSX.Element }> = {
    pending: {
      label: 'Pendiente',
      classes: 'bg-gray-100 text-gray-800 border border-gray-300',
      icon: (
        <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      )
    },
    confirmed: {
      label: 'Confirmado',
      classes: 'bg-blue-100 text-blue-800 border border-zinc-300',
      icon: (
        <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )
    },
    in_progress: {
      label: 'En Progreso',
      classes: 'bg-yellow-100 text-yellow-800 border border-zinc-300',
      icon: (
        <svg className="w-3 h-3 mr-1.5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      )
    },
    completed: {
      label: 'Completado',
      classes: 'bg-green-100 text-green-800 border border-zinc-300',
      icon: (
        <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )
    },
    cancelled: {
      label: 'Cancelado',
      classes: 'bg-red-100 text-red-800 border border-red-300',
      icon: (
        <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      )
    }
  };

  const config = statusConfig[status] || {
    label: status,
    classes: 'bg-gray-100 text-gray-800 border border-gray-300',
    icon: null
  };

  return (
    <span className={`${baseClasses} ${config.classes} ${className}`}>
      {config.icon}
      {config.label}
    </span>
  );
}




