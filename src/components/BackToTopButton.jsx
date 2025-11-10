import React, { useEffect, useState } from 'react';

function BackToTopButton({ offset = 300, behavior = 'smooth' }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > offset);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [offset]);

  const scrollTop = () => {
    try {
      window.scrollTo({ top: 0, behavior });
    } catch (e) {
      window.scrollTo(0, 0);
    }
  };

  return (
    <button
      aria-label="Volver arriba"
      onClick={scrollTop}
      className={`fixed bottom-6 right-6 z-50 px-3 py-3 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
      }`}
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    </button>
  );
}

export default BackToTopButton;
