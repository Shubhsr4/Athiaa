import React, { ElementType, ReactNode } from 'react';
import { useInView, UseInViewOptions } from '@/lib/hooks/useInView';

export interface RevealProps extends UseInViewOptions {
  children: ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
  delay?: number; // In milliseconds
  duration?: number; // In milliseconds (default: 450ms)
  staggerIndex?: number; // Optional index to auto-stagger (e.g. idx * 80ms, capped at 480ms)
  className?: string;
  as?: ElementType;
  style?: React.CSSProperties;
}

/**
 * Lightweight, GPU-accelerated scroll-reveal wrapper.
 * Animates ONLY `opacity` and `transform` via pure CSS transitions (zero reflow, 0 CLS).
 * Unobserves after initial trigger and respects prefers-reduced-motion.
 */
export default function Reveal({
  children,
  direction = 'up',
  delay,
  duration = 450,
  staggerIndex,
  className = '',
  as: Component = 'div',
  threshold = 0.15,
  rootMargin = '0px 0px -50px 0px',
  triggerOnce = true,
  style = {},
  ...rest
}: RevealProps) {
  const [ref, isInView] = useInView<HTMLElement>({
    threshold,
    rootMargin,
    triggerOnce,
  });

  // Calculate stagger delay if index provided, capped at ~480ms to keep page snappy
  const calculatedDelay = typeof delay === 'number'
    ? delay
    : typeof staggerIndex === 'number'
      ? Math.min((staggerIndex % 6) * 80, 480)
      : 0;

  const directionClass = `reveal-${direction}`;
  const visibilityClass = isInView ? 'reveal-visible' : directionClass;

  const combinedStyle: React.CSSProperties = {
    ...style,
    transitionDuration: `${duration}ms`,
    transitionDelay: `${calculatedDelay}ms`,
  };

  return (
    <Component
      ref={ref as any}
      className={`reveal-container ${visibilityClass} ${className}`.trim()}
      style={combinedStyle}
      {...rest}
    >
      {children}
    </Component>
  );
}
