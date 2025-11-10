import React from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

const Button = ({ 
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  className = '',
  onClick,
  type = 'button',
  ...props 
}) => {
  const baseClasses = `
    inline-flex items-center justify-center font-medium rounded-lg
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:cursor-not-allowed disabled:opacity-50
    ${fullWidth ? 'w-full' : ''}
  `;

  const variants = {
    primary: `
      bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800
      focus:ring-blue-500 shadow-sm hover:shadow-md
    `,
    secondary: `
      bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300
      focus:ring-gray-500 border border-gray-300
    `,
    success: `
      bg-green-600 text-white hover:bg-green-700 active:bg-green-800
      focus:ring-green-500 shadow-sm hover:shadow-md
    `,
    danger: `
      bg-red-600 text-white hover:bg-red-700 active:bg-red-800
      focus:ring-red-500 shadow-sm hover:shadow-md
    `,
    warning: `
      bg-yellow-500 text-white hover:bg-yellow-600 active:bg-yellow-700
      focus:ring-yellow-500 shadow-sm hover:shadow-md
    `,
    outline: `
      bg-transparent text-blue-600 hover:bg-blue-50 active:bg-blue-100
      border-2 border-blue-600 hover:border-blue-700 focus:ring-blue-500
    `,
    ghost: `
      bg-transparent text-gray-600 hover:bg-gray-100 active:bg-gray-200
      focus:ring-gray-500
    `
  };

  const sizes = {
    xs: 'px-2.5 py-1.5 text-xs gap-1',
    sm: 'px-3 py-2 text-sm gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2',
    xl: 'px-8 py-4 text-lg gap-2.5'
  };

  const buttonClasses = `
    ${baseClasses}
    ${variants[variant]}
    ${sizes[size]}
    ${className}
  `;

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={isDisabled}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <>
          <ArrowPathIcon className="h-4 w-4 animate-spin" />
          <span>Cargando...</span>
        </>
      ) : (
        <>
          {LeftIcon && <LeftIcon className="h-4 w-4" />}
          {children}
          {RightIcon && <RightIcon className="h-4 w-4" />}
        </>
      )}
    </button>
  );
};

export default Button;