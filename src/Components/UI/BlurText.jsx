import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { useA11y } from '@/Hooks/useA11y';
import './BlurText.css';

export default function BlurText({
  text = '',
  animateBy = 'words',
  direction = 'top',
  delay = 140,
  stepDuration = 0.35,
  threshold = 0.1,
  rootMargin = '0px',
  className = '',
}) {
  const [inView, setInView] = useState(false);
  const textRef = useRef(null);
  const { reducedMotion } = useA11y();
  const segments = animateBy === 'letters' ? [...text] : text.split(' ');
  const initialY = direction === 'bottom' ? 24 : -24;

  useEffect(() => {
    if (reducedMotion || !textRef.current) {
      setInView(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(textRef.current);
    return () => observer.disconnect();
  }, [reducedMotion, rootMargin, threshold]);

  return (
    <span ref={textRef} className={`blur-text ${className}`} aria-label={text}>
      {segments.map((segment, index) => (
        <motion.span
          key={`${segment}-${index}`}
          aria-hidden="true"
          className="blur-text__segment"
          initial={{ opacity: 0, filter: 'blur(10px)', y: initialY }}
          animate={inView ? { opacity: 1, filter: 'blur(0px)', y: 0 } : undefined}
          transition={{
            duration: reducedMotion ? 0 : stepDuration,
            delay: reducedMotion ? 0 : (index * delay) / 1000,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {segment}{animateBy === 'words' && index < segments.length - 1 ? '\u00a0' : ''}
        </motion.span>
      ))}
    </span>
  );
}