import React from 'react';
import { motion } from 'framer-motion';

const BackgroundOrbs = () => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none select-none">
      <motion.div 
        animate={!isMobile ? { 
          x: [0, 50, -30, 0], 
          y: [0, -50, 20, 0],
          scale: [1, 1.2, 0.9, 1]
        } : {}}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-[300px] h-[300px] sm:w-[600px] sm:h-[600px] bg-primary/10 rounded-full blur-[80px] sm:blur-[140px] opacity-40 sm:opacity-40" 
      />
      <motion.div 
        animate={!isMobile ? { 
          x: [0, -40, 60, 0], 
          y: [0, 30, -50, 0],
          scale: [1, 0.8, 1.1, 1]
        } : {}}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] sm:w-[500px] sm:h-[500px] bg-white/5 rounded-full blur-[70px] sm:blur-[120px] opacity-30 sm:opacity-30" 
      />
      <div className="absolute inset-0 bg-dark/60 backdrop-blur-[2px] sm:backdrop-blur-[2px]" />
    </div>
  );
};

export default BackgroundOrbs;
