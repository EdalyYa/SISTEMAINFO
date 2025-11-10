import React, { useState, useEffect, createContext, useContext } from 'react';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon, 
  XCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

// Context para manejar toasts globalmente
const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe ser usado dentro de ToastProvider');
  }
  return context;
};

// Provider de toasts
export const ToastProvider = ({ children, position = 'top-right', maxToasts = 5 }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (toast) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      type: 'info',
      duration: 5000,
      ...toast
    };
    
    setToasts(prev => {
      const updated = [newToast, ...prev];
      return updated.slice(0, maxToasts);
    });

    // Auto remove
    if (newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }

    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const removeAllToasts = () => {
    setToasts([]);
  };

  // Métodos de conveniencia
  const success = (message, options = {}) => addToast({ ...options, type: 'success', message });
  const error = (message, options = {}) => addToast({ ...options, type: 'error', message });
  const warning = (message, options = {}) => addToast({ ...options, type: 'warning', message });
  const info = (message, options = {}) => addToast({ ...options, type: 'info', message });

  const value = {
    toasts,
    addToast,
    removeToast,
    removeAllToasts,
    success,
    error,
    warning,
    info
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} position={position} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

// Componente individual de toast
const Toast = ({ toast, onRemove, position }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    // Animación de entrada
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const icons = {
    success: CheckCircleIcon,
    error: XCircleIcon,
    warning: ExclamationTriangleIcon,
    info: InformationCircleIcon
  };

  const styles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  const iconStyles = {
    success: 'text-green-400',
    error: 'text-red-400',
    warning: 'text-yellow-400',
    info: 'text-blue-400'
  };

  const Icon = icons[toast.type];

  // Animaciones basadas en posición
  const getAnimationClasses = () => {
    const isLeft = position.includes('left');
    const isRight = position.includes('right');
    const isTop = position.includes('top');
    const isBottom = position.includes('bottom');
    const isCenter = position.includes('center');

    let enterFrom = '';
    let enterTo = 'translate-x-0 translate-y-0 opacity-100 scale-100';
    let exitFrom = enterTo;
    let exitTo = '';

    if (isCenter) {
      if (isTop) {
        enterFrom = '-translate-y-full opacity-0 scale-95';
        exitTo = '-translate-y-full opacity-0 scale-95';
      } else {
        enterFrom = 'translate-y-full opacity-0 scale-95';
        exitTo = 'translate-y-full opacity-0 scale-95';
      }
    } else if (isLeft) {
      enterFrom = '-translate-x-full opacity-0';
      exitTo = '-translate-x-full opacity-0';
    } else if (isRight) {
      enterFrom = 'translate-x-full opacity-0';
      exitTo = 'translate-x-full opacity-0';
    }

    if (isRemoving) {
      return `transform transition-all duration-300 ease-in ${exitTo}`;
    }
    
    if (isVisible) {
      return `transform transition-all duration-300 ease-out ${enterTo}`;
    }
    
    return `transform transition-all duration-300 ease-out ${enterFrom}`;
  };

  return (
    <div className={`${getAnimationClasses()} max-w-sm w-full`}>
      <div className={`rounded-lg border p-4 shadow-lg ${styles[toast.type]}`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon className={`h-5 w-5 ${iconStyles[toast.type]}`} />
          </div>
          
          <div className="ml-3 flex-1">
            {toast.title && (
              <h3 className="text-sm font-medium mb-1">
                {toast.title}
              </h3>
            )}
            <p className="text-sm">
              {toast.message}
            </p>
            
            {toast.action && (
              <div className="mt-3">
                <button
                  onClick={toast.action.onClick}
                  className="text-sm font-medium underline hover:no-underline"
                >
                  {toast.action.label}
                </button>
              </div>
            )}
          </div>
          
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={handleRemove}
              className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 rounded-md"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {/* Barra de progreso */}
        {toast.duration > 0 && (
          <div className="mt-3 w-full bg-gray-200 rounded-full h-1">
            <div 
              className={`h-1 rounded-full ${
                toast.type === 'success' ? 'bg-green-400' :
                toast.type === 'error' ? 'bg-red-400' :
                toast.type === 'warning' ? 'bg-yellow-400' : 'bg-blue-400'
              }`}
              style={{
                animation: `shrink ${toast.duration}ms linear forwards`
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Container de toasts
const ToastContainer = ({ toasts, position, onRemove }) => {
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4'
  };

  if (toasts.length === 0) return null;

  return (
    <>
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
      
      <div className={`fixed z-50 pointer-events-none ${positionClasses[position]}`}>
        <div className="flex flex-col gap-2 pointer-events-auto">
          {toasts.map((toast) => (
            <Toast 
              key={toast.id} 
              toast={toast} 
              onRemove={onRemove}
              position={position}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default Toast;