import React from 'react';

export const Label = ({ htmlFor, children, className = '', required = false, ...props }) => (
  <label htmlFor={htmlFor} className={`block text-sm font-medium text-slate-700 ${className}`} {...props}>
    {children}
    {required && <span className="ml-1 text-red-600">*</span>}
  </label>
);

export default Label;