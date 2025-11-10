import React from 'react';

function Loader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-80 animate-fade-in">
      <div className="flex flex-col items-center gap-4">
        <svg className="animate-spin h-16 w-16 text-blue-700" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        <span className="text-xl font-bold text-blue-900 tracking-wide">INFOUNA</span>
        <span className="text-sm text-gray-600">Cargando...</span>
      </div>
    </div>
  );
}

export default Loader;
