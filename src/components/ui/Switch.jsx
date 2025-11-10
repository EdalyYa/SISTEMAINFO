import React, { useState, useEffect } from 'react';

export const Switch = ({ checked, defaultChecked = false, onChange, className = '', label, ...props }) => {
  const [isOn, setIsOn] = useState(checked ?? defaultChecked);

  useEffect(() => {
    if (typeof checked === 'boolean') setIsOn(checked);
  }, [checked]);

  const toggle = () => {
    const next = !isOn;
    setIsOn(next);
    onChange?.(next);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isOn}
      onClick={toggle}
      className={`inline-flex items-center w-11 h-6 rounded-full transition bg-slate-300 ${isOn ? 'bg-emerald-500' : 'bg-slate-300'} ${className}`}
      {...props}
    >
      <span
        className={`inline-block w-5 h-5 bg-white rounded-full shadow transform transition ${isOn ? 'translate-x-5' : 'translate-x-1'}`}
      />
      {label && <span className="ml-2 text-sm text-slate-700">{label}</span>}
    </button>
  );
};

export default Switch;