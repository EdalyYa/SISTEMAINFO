import React from 'react';

const variantClasses = {
  info: 'bg-blue-50 text-blue-800 border-blue-200',
  success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  warning: 'bg-amber-50 text-amber-800 border-amber-200',
  error: 'bg-red-50 text-red-800 border-red-200',
  default: 'bg-slate-50 text-slate-800 border-slate-200',
};

export const Alert = ({ variant = 'default', className = '', children, ...props }) => (
  <div className={`rounded-md border p-3 ${variantClasses[variant] || variantClasses.default} ${className}`} {...props}>
    {children}
  </div>
);

export const AlertDescription = ({ className = '', children, ...props }) => (
  <div className={`text-sm ${className}`} {...props}>
    {children}
  </div>
);

export default Alert;