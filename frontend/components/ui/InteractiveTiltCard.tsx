
import React, { useRef } from 'react';

interface InteractiveTiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  id?: string;
}

export default function InteractiveTiltCard({ children, className = '', onClick, id, ...rest }: InteractiveTiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Tilt angle restricted to 8 degrees
    const tiltX = -((y - centerY) / centerY) * 8; 
    const tiltY = ((x - centerX) / centerX) * 8;

    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      if (!card) return;
      card.style.transform = `perspective(1000px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) scale3d(1.025, 1.025, 1.025)`;
      card.style.boxShadow = '0 25px 45px -10px rgba(232, 87, 42, 0.18), 0 10px 20px -5px rgba(232, 87, 42, 0.1)';
      if (innerRef.current) {
        innerRef.current.style.transform = 'translateZ(15px)';
      }
    });
  };

  const handleMouseEnter = () => {
    if (cardRef.current) {
      cardRef.current.style.transition = 'transform 0.1s ease-out, box-shadow 0.2s ease-out';
    }
  };

  const handleMouseLeave = () => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    if (cardRef.current) {
      cardRef.current.style.transition = 'transform 0.35s ease-out, box-shadow 0.35s ease-out';
      cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      cardRef.current.style.boxShadow = '';
    }
    if (innerRef.current) {
      innerRef.current.style.transform = 'translateZ(0px)';
    }
  };

  return (
    <div
      ref={cardRef}
      id={id}
      className={`cursor-pointer will-change-transform ${className}`}
      style={{
        transformStyle: 'preserve-3d',
        transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      {...rest}
    >
      <div 
        ref={innerRef}
        style={{ 
          transform: 'translateZ(0px)', 
          transition: 'transform 0.3s ease-out' 
        }}
        className="h-full w-full"
      >
        {children}
      </div>
    </div>
  );
}
