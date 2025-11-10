import React, { useState, useEffect } from 'react';

export const Slider = ({
  value,
  defaultValue = 0,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  className = '',
  showValue = true,
  ...props
}) => {
  const [internal, setInternal] = useState(value ?? defaultValue);

  useEffect(() => {
    if (typeof value === 'number') setInternal(value);
  }, [value]);

  const handleChange = (e) => {
    const next = Number(e.target.value);
    setInternal(next);
    onChange?.(next);
  };

  return (
    <div className={`w-full ${className}`} {...props}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={internal}
        onChange={handleChange}
        className="w-full appearance-none h-2 rounded bg-slate-200 cursor-pointer"
      />
      {showValue && (
        <div className="mt-1 text-xs text-slate-600">{internal}</div>
      )}
    </div>
  );
};

export default Slider;