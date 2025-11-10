import React, { useEffect } from 'react';

function Notification({ type = 'success', message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-400',
  };

  return (
    <div className={`fixed top-6 right-6 z-50 px-6 py-3 rounded shadow-lg text-white font-semibold flex items-center gap-3 animate-fade-in ${colors[type]}`}>
      {type === 'success' && <span role="img" aria-label="ok">✅</span>}
      {type === 'error' && <span role="img" aria-label="error">❌</span>}
      {type === 'info' && <span role="img" aria-label="info">ℹ️</span>}
      {type === 'warning' && <span role="img" aria-label="warning">⚠️</span>}
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 text-white hover:text-gray-200 font-bold">×</button>
    </div>
  );
}

export default Notification;
