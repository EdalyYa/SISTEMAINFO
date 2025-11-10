import React from 'react';

const LoadingSpinner = ({ 
  size = 'md',
  variant = 'primary',
  text,
  className = '',
  fullScreen = false
}) => {
  const sizes = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const variants = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    success: 'text-green-600',
    danger: 'text-red-600',
    warning: 'text-yellow-600',
    white: 'text-white'
  };

  const spinnerClasses = `
    animate-spin rounded-full border-2 border-current border-t-transparent
    ${sizes[size]}
    ${variants[variant]}
    ${className}
  `;

  const content = (
    <div className={`flex flex-col items-center justify-center gap-3 ${fullScreen ? '' : 'p-4'}`}>
      <div className={spinnerClasses}></div>
      {text && (
        <p className={`text-sm font-medium ${variants[variant]}`}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-80 backdrop-blur-sm z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;