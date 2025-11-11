import React, { useState } from 'react';
import logoFallback from '../logo.png';

/**
 * ImageOptimized: imagen con lazy-loading, fallback y transición suave.
 * Props comunes: src, alt, className, width, height, sizes, srcSet, fallbackSrc.
 */
export default function ImageOptimized({
  src,
  alt,
  className = '',
  width,
  height,
  sizes,
  srcSet,
  fallbackSrc = logoFallback,
  style,
  ...rest
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const handleLoad = () => setLoaded(true);
  const handleError = () => setError(true);

  const finalSrc = error ? fallbackSrc : src;

  return (
    <img
      src={finalSrc}
      alt={alt}
      loading="lazy"
      decoding="async"
      width={width}
      height={height}
      sizes={sizes}
      srcSet={srcSet}
      onLoad={handleLoad}
      onError={handleError}
      className={`${className} transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      style={{
        objectFit: 'cover',
        ...style,
      }}
      {...rest}
    />
  );
}
