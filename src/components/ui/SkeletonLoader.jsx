import React from 'react';

const SkeletonLoader = ({ 
  variant = 'text',
  width = '100%',
  height,
  className = '',
  count = 1,
  animate = true
}) => {
  const baseClasses = `
    bg-gray-200 rounded
    ${animate ? 'animate-pulse' : ''}
    ${className}
  `;

  const variants = {
    text: {
      height: height || '1rem',
      className: 'rounded-md'
    },
    title: {
      height: height || '1.5rem',
      className: 'rounded-md'
    },
    paragraph: {
      height: height || '4rem',
      className: 'rounded-md'
    },
    circle: {
      height: height || '3rem',
      className: 'rounded-full aspect-square'
    },
    avatar: {
      height: height || '2.5rem',
      className: 'rounded-full aspect-square'
    },
    card: {
      height: height || '12rem',
      className: 'rounded-lg'
    },
    button: {
      height: height || '2.5rem',
      className: 'rounded-lg'
    },
    image: {
      height: height || '8rem',
      className: 'rounded-lg'
    }
  };

  const variantConfig = variants[variant] || variants.text;

  const skeletonStyle = {
    width: width,
    height: variantConfig.height
  };

  const skeletonClasses = `
    ${baseClasses}
    ${variantConfig.className}
  `;

  if (count === 1) {
    return (
      <div 
        className={skeletonClasses}
        style={skeletonStyle}
      />
    );
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, index) => (
        <div 
          key={index}
          className={skeletonClasses}
          style={{
            ...skeletonStyle,
            width: index === count - 1 && variant === 'text' ? '75%' : width
          }}
        />
      ))}
    </div>
  );
};

// Componentes predefinidos para casos comunes
export const SkeletonCard = ({ className = '' }) => (
  <div className={`p-4 border border-gray-200 rounded-lg ${className}`}>
    <div className="flex items-center space-x-4 mb-4">
      <SkeletonLoader variant="avatar" />
      <div className="flex-1">
        <SkeletonLoader variant="title" width="60%" />
        <SkeletonLoader variant="text" width="40%" className="mt-2" />
      </div>
    </div>
    <SkeletonLoader variant="paragraph" className="mb-4" />
    <div className="flex space-x-2">
      <SkeletonLoader variant="button" width="80px" />
      <SkeletonLoader variant="button" width="100px" />
    </div>
  </div>
);

export const SkeletonTable = ({ rows = 5, columns = 4, className = '' }) => (
  <div className={`border border-gray-200 rounded-lg overflow-hidden ${className}`}>
    {/* Header */}
    <div className="bg-gray-50 p-4 border-b border-gray-200">
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, index) => (
          <SkeletonLoader key={index} variant="text" height="1.25rem" />
        ))}
      </div>
    </div>
    
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="p-4 border-b border-gray-200 last:border-b-0">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <SkeletonLoader key={colIndex} variant="text" />
          ))}
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonList = ({ items = 5, showAvatar = true, className = '' }) => (
  <div className={`space-y-4 ${className}`}>
    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
        {showAvatar && <SkeletonLoader variant="avatar" />}
        <div className="flex-1">
          <SkeletonLoader variant="title" width="70%" />
          <SkeletonLoader variant="text" width="50%" className="mt-2" />
        </div>
        <SkeletonLoader variant="button" width="80px" />
      </div>
    ))}
  </div>
);

export default SkeletonLoader;