import React from 'react';

function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <div className="absolute w-full h-full bg-gradient-to-br from-blue-100 via-blue-200 to-purple-100 animate-gradient-move" />
      <svg className="absolute top-0 left-0 w-full h-full opacity-20 animate-pulse" viewBox="0 0 1440 320">
        <path fill="#3b82f6" fillOpacity="0.3" d="M0,160L48,170.7C96,181,192,203,288,197.3C384,192,480,160,576,154.7C672,149,768,171,864,186.7C960,203,1056,213,1152,197.3C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
      </svg>
    </div>
  );
}

export default AnimatedBackground;
