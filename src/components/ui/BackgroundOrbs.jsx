import React from 'react';
import { motion } from 'framer-motion';

const BackgroundOrbs = () => {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none select-none">
      <motion.div 
        animate={{ 
          x: [0, 50, -30, 0], 
          y: [0, -50, 20, 0],
          scale: [1, 1.2, 0.9, 1]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px] opacity-40" 
      />
      <motion.div 
        animate={{ 
          x: [0, -40, 60, 0], 
          y: [0, 30, -50, 0],
          scale: [1, 0.8, 1.1, 1]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] opacity-30" 
      />
      <div className="absolute inset-0 bg-dark/60 backdrop-blur-[2px]" />
    </div>
  );
};

export default BackgroundOrbs;
