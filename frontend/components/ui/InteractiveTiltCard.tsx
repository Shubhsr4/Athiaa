
import React, { useState } from 'react';

interface InteractiveTiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  id?: string;
}

export default function InteractiveTiltCard({ children, className = '', onClick, id, ...rest }: InteractiveTiltCardProps) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Tilt angle restricted to 8 degrees to keep it elegant and subtle
    const tiltX = -((y - centerY) / centerY) * 8; 
    const tiltY = ((x - centerX) / centerX) * 8;   
    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      id={id}
      className={`transition-all duration-300 ease-out cursor-pointer ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      {...rest}
      style={{
        transform: isHovered
          ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.025, 1.025, 1.025)`
          : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
        transformStyle: 'preserve-3d',
        boxShadow: isHovered
          ? '0 25px 45px -10px rgba(232, 87, 42, 0.18), 0 10px 20px -5px rgba(232, 87, 42, 0.1)'
          : '',
      }}
    >
      <div 
        style={{ 
          transform: isHovered ? 'translateZ(15px)' : 'translateZ(0px)', 
          transition: 'transform 0.3s ease-out' 
        }}
        className="h-full w-full"
      >
        {children}
      </div>
    </div>
  );
}
