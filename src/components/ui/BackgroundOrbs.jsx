import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const BackgroundOrbs = () => {
  const prefersReducedMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile, { passive: true });
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const shouldAnimate = !isMobile && !prefersReducedMotion;

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none select-none bg-[#F7F5F0]" aria-hidden="true">
      {/* Retícula arquitectónica sutil */}
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(28, 25, 23, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(28, 25, 23, 0.04) 1px, transparent 1px)',
          backgroundSize: '64px 64px'
        }}
      />
      <motion.div 
        animate={shouldAnimate ? { 
          x: [0, 35, -20, 0], 
          y: [0, -30, 15, 0],
          scale: [1, 1.08, 0.96, 1]
        } : false}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="will-change-transform absolute top-1/4 left-1/4 w-[280px] h-[280px] sm:w-[540px] sm:h-[540px] bg-orange-600/5 rounded-full blur-[90px] sm:blur-[140px]" 
      />
      <motion.div 
        animate={shouldAnimate ? { 
          x: [0, -25, 40, 0], 
          y: [0, 20, -30, 0],
          scale: [1, 0.92, 1.05, 1]
        } : false}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="will-change-transform absolute bottom-1/4 right-1/4 w-[240px] h-[240px] sm:w-[460px] sm:h-[460px] bg-amber-700/5 rounded-full blur-[80px] sm:blur-[120px]" 
      />
    </div>
  );
};

export default BackgroundOrbs;


