'use client';

import { useCallback } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

/**
 * Hook simple para mostrar notificaciones toast
 * Nota: Este es un placeholder que usa console.log
 * Para producción, se debería integrar con una librería como react-toastify o notistack
 */
export const useToast = () => {
  const showToast = useCallback((type: ToastType, message: string) => {
    // Por ahora solo mostramos en consola y alert
    // En producción, esto debería usar una librería de toasts
    console.log(`[${type.toUpperCase()}]: ${message}`);
    
    if (type === 'error') {
      alert(`Error: ${message}`);
    } else if (type === 'success') {
      alert(`Éxito: ${message}`);
    }
  }, []);

  return { showToast };
};
