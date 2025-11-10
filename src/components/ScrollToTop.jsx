import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop({ behavior = 'smooth' }) {
  const location = useLocation();

  useEffect(() => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior });
    } catch (_) {
      // Fallback por compatibilidad
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  return null;
}

export default ScrollToTop;
