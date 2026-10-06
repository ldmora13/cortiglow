import { useState, useCallback } from 'react';
import type { NotificationType } from '../components/Notification';

interface NotificationData {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

let globalNotificationHandler: ((notification: Omit<NotificationData, 'id'>) => void) | null = null;
let globalConfirmHandler: ((options: ConfirmOptions) => Promise<boolean>) | null = null;

export function setGlobalNotificationHandler(handler: (notification: Omit<NotificationData, 'id'>) => void) {
  globalNotificationHandler = handler;
}

export function setGlobalConfirmHandler(handler: (options: ConfirmOptions) => Promise<boolean>) {
  globalConfirmHandler = handler;
}

export function useNotification() {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const show = useCallback((notification: Omit<NotificationData, 'id'>) => {
    const id = `notification-${Date.now()}-${Math.random()}`;
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);
    
    return id;
  }, []);

  const remove = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const success = useCallback((message: string, duration?: number) => {
    return show({ type: 'success', message, duration });
  }, [show]);

  const error = useCallback((message: string, duration?: number) => {
    return show({ type: 'error', message, duration });
  }, [show]);

  const warning = useCallback((message: string, duration?: number) => {
    return show({ type: 'warning', message, duration });
  }, [show]);

  const info = useCallback((message: string, duration?: number) => {
    return show({ type: 'info', message, duration });
  }, [show]);

  return {
    notifications,
    show,
    remove,
    success,
    error,
    warning,
    info
  };
}

// Helper global para usar desde cualquier lugar
export const notify = {
  success: (message: string, duration?: number) => {
    if (globalNotificationHandler) {
      globalNotificationHandler({ type: 'success', message, duration });
    } else {
      console.log('✅', message);
    }
  },
  error: (message: string, duration?: number) => {
    if (globalNotificationHandler) {
      globalNotificationHandler({ type: 'error', message, duration });
    } else {
      console.error('❌', message);
    }
  },
  warning: (message: string, duration?: number) => {
    if (globalNotificationHandler) {
      globalNotificationHandler({ type: 'warning', message, duration });
    } else {
      console.warn('⚠️', message);
    }
  },
  info: (message: string, duration?: number) => {
    if (globalNotificationHandler) {
      globalNotificationHandler({ type: 'info', message, duration });
    } else {
      console.info('ℹ️', message);
    }
  },
  confirm: async (options: ConfirmOptions): Promise<boolean> => {
    if (globalConfirmHandler) {
      return await globalConfirmHandler(options);
    } else {
      // Fallback al confirm nativo si el handler no está registrado
      return window.confirm(options.message);
    }
  }
};

