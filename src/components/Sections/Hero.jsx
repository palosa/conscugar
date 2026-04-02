import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { BackgroundOrbs } from '../Effects/BackgroundOrbs';
import Calculator from '../Calculator/Calculator';
import heroImg from '../../assets/hero.png';

export const Hero = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 200]);

  return (
    <section ref={ref} className="relative min-h-[90vh] flex items-center pt-32 pb-20 overflow-hidden bg-dark">
      {/* Elementos Visuales de Fondo */}
      <div className="absolute inset-0 z-0">
        <BackgroundOrbs />
        <motion.div 
          style={{ 
            backgroundImage: `url(${heroImg})`, 
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            y: y1
          }}
          className="w-full h-[120%] absolute -top-[10%] left-0 pointer-events-none opacity-40 mix-blend-overlay"
        />
        <div className="absolute top-1/2 left-0 w-full h-[500px] bg-primary/5 blur-[120px] -translate-y-1/2" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-20 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-center">
        
        {/* Title Content - En móvil aparece PRIMERO */}
        <div className="order-1 lg:order-1 space-y-8 flex flex-col items-center lg:items-start text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-[10px] font-black uppercase tracking-[0.3em]">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" /> Sagunto · Puerto · Alrededores
            </div>
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter uppercase italic leading-[0.95] sm:leading-[0.85]">
              Construcciones <br />
              <span className="text-white">Y</span>
              <span className="text-primary"> Reformas</span><br />
              <span className="text-white/20">en</span>
              <span className="text-primary"> Sagunto</span>
            </h1>
            <p className="max-w-xl text-xs sm:text-base lg:text-lg text-white/70 font-bold uppercase tracking-[0.3em] leading-relaxed">
               Transformamos viviendas comunes en espacios magistrales. Arquitectura de vanguardia y ejecución técnica en Sagunto.
            </p>
          </motion.div>
        </div>

        {/* Calculator - En móvil aparece SEGUNDO */}
        <div className="order-2 lg:order-2 relative w-full flex justify-center lg:justify-end">
           <div className="w-full max-w-xl">
              <div id="calculadora" className="relative group">
                 {/* Efecto de brillo detrás de la calculadora */}
                 <div className="absolute -inset-4 bg-primary/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                 <div className="relative bg-black/40 backdrop-blur-xl border border-white/5 p-1 sm:p-2 shadow-2xl">
                    <Calculator />
                 </div>
              </div>
           </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;
