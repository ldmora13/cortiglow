import type { JSX } from 'react';

interface OrderStatusBadgeProps {
  status: string;
  className?: string;
}

const statusConfig: Record<string, { label: string; classes: string; icon: JSX.Element }> = {
  pending: {
    label: 'Pendiente',
    classes: 'bg-gray-100 text-gray-800 border border-gray-300',
    icon: <span aria-hidden="true">◷</span>
  },
  completed: {
    label: 'Completada',
    classes: 'bg-green-100 text-green-800 border border-zinc-300',
    icon: <span aria-hidden="true">✓</span>
  },
  cancelled: {
    label: 'Cancelada',
    classes: 'bg-red-100 text-red-800 border border-red-300',
    icon: <span aria-hidden="true">×</span>
  }
};

export default function OrderStatusBadge({ status, className = '' }: OrderStatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    classes: 'bg-gray-100 text-gray-800 border border-gray-300',
    icon: <span aria-hidden="true">•</span>
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.classes} ${className}`}>
      {config.icon}
      {config.label}
    </span>
  );
}
