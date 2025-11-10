import React, { useEffect, useState } from 'react';

function ScrollProgressBar() {
  const [scroll, setScroll] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setScroll(height ? (scrolled / height) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-2 z-50">
      <div
        className="bg-blue-600 h-full transition-all duration-200"
        style={{ width: `${scroll}%` }}
      />
    </div>
  );
}

export default ScrollProgressBar;
