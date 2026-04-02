import { useEffect, useState } from 'react';

const MouseGlow = () => {
  const [position, setPosition] = useState({ x: -200, y: -200 });

  useEffect(() => {
    const handleMove = (event) => {
      setPosition({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[15] overflow-hidden"
      style={{ mixBlendMode: 'var(--glow-blend)' }}
    >
      <div
        className="absolute h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl transition-transform duration-150"
        style={{ left: position.x, top: position.y, backgroundColor: 'var(--glow-primary)' }}
      />
      <div
        className="absolute h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl transition-transform duration-100"
        style={{ left: position.x, top: position.y, backgroundColor: 'var(--glow-secondary)' }}
      />
    </div>
  );
};

export default MouseGlow;
