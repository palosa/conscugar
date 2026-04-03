import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import BackgroundOrbs from '../ui/BackgroundOrbs';
import Calculator from '../Calculator/Calculator';
import heroImg from '../../assets/hero.png';

export const Hero = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const y1 = useTransform(smoothProgress, [0, 1], [0, 150]);

  return (
    <section ref={ref} className="relative min-h-[90vh] flex items-center pt-32 sm:pt-40 pb-20 overflow-hidden bg-dark">
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

      <div className="max-w-7xl mx-auto px-6 relative z-20 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-40 items-center">
        
        {/* 🔥 TÍTULO - Ajustado para evitar solapamiento */}
        <div className="space-y-8 flex flex-col items-center lg:items-start text-center lg:text-left pt-10 lg:pt-0">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-[10px] font-black uppercase tracking-[0.3em]">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" /> Sagunto · Puerto · Alrededores
            </div>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tighter uppercase italic leading-[1.1] sm:leading-[1] lg:leading-[0.95]">
              <span className="text-white">Construcciones</span> <br />
              <span className="text-white/20">Y</span>
              <span className="text-primary italic"> Reformas</span><br />
              <span className="text-white/20">en</span>
              <span className="text-primary italic"> Sagunto</span>
            </h1>
            <p className="max-w-md text-xs sm:text-base lg:text-sm text-white/50 font-bold uppercase tracking-[0.3em] leading-relaxed">
               Transformamos viviendas comunes en espacios magistrales. Arquitectura de vanguardia y ejecución técnica en Sagunto.
            </p>
          </motion.div>
        </div>

        {/* 📐 CALCULADORA (Con diseño de líneas restaurado) */}
        <div className="relative w-full flex justify-center lg:justify-end">
           <div className="w-full max-w-xl">
              <div className="relative group p-4 sm:p-0">
                 {/* Líneas Decorativas Premium */}
                 <div className="absolute -top-2 -left-2 w-12 h-[2px] bg-primary group-hover:w-20 transition-all duration-500" />
                 <div className="absolute -top-2 -left-2 w-[2px] h-12 bg-primary group-hover:h-20 transition-all duration-500" />
                 <div className="absolute -bottom-2 -right-2 w-12 h-[2px] bg-primary group-hover:w-20 transition-all duration-500" />
                 <div className="absolute -bottom-2 -right-2 w-[2px] h-12 bg-primary group-hover:h-20 transition-all duration-500" />
                 
                 {/* Contenedor de la Calculadora */}
                 <div id="calculadora" className="relative bg-black/60 backdrop-blur-2xl border border-white/10 p-1 sm:p-2 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
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
