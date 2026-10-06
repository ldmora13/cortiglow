import { useEffect, useState, useCallback } from 'react';
import Notification from './Notification';
import ConfirmDialog from './ConfirmDialog';
import { useNotification, setGlobalNotificationHandler, setGlobalConfirmHandler } from '../hooks/useNotification';

interface ConfirmState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  resolve: ((value: boolean) => void) | null;
}

export default function NotificationContainer() {
  const { notifications, remove, show } = useNotification();
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    resolve: null
  });

  const showConfirm = useCallback((options: Omit<ConfirmState, 'isOpen' | 'resolve'>): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({
        ...options,
        isOpen: true,
        resolve
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    if (confirmState.resolve) {
      confirmState.resolve(true);
    }
    setConfirmState(prev => ({ ...prev, isOpen: false, resolve: null }));
  }, [confirmState.resolve]);

  const handleCancel = useCallback(() => {
    if (confirmState.resolve) {
      confirmState.resolve(false);
    }
    setConfirmState(prev => ({ ...prev, isOpen: false, resolve: null }));
  }, [confirmState.resolve]);

  // Registrar los handlers globales al montar
  useEffect(() => {
    setGlobalNotificationHandler(show);
    setGlobalConfirmHandler(showConfirm);
    return () => {
      setGlobalNotificationHandler(() => {});
      setGlobalConfirmHandler(() => Promise.resolve(false));
    };
  }, [show, showConfirm]);

  return (
    <>
      {/* Notificaciones */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
        <div className="flex flex-col gap-3 pointer-events-auto">
          {notifications.map(notification => (
            <Notification
              key={notification.id}
              {...notification}
              onClose={remove}
            />
          ))}
        </div>
      </div>

      {/* Diálogo de Confirmación */}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        type={confirmState.type}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  );
}

