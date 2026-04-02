import React from 'react';
import Calculator from '../Calculator/Calculator';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ShieldCheck, Clock, CheckCircle } from 'lucide-react';
import heroImg from '../../assets/hero.png';

const Hero = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 100]);

  return (
    <section className="relative min-h-screen py-32 overflow-hidden flex flex-col justify-center">
      {/* Background with IA-generated feel */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-dark/60 z-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-dark via-transparent to-dark z-10" />
        <motion.div 
          style={{ 
            backgroundImage: `url(${heroImg})`, 
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            y: y1
          }}
          className="w-full h-[120%] absolute -top-[10%] left-0 pointer-events-none opacity-40 mix-blend-overlay"
        />
        <div className="absolute top-1/2 left-0 w-full h-[500px] bg-primary/5 blur-[120px] -translate-y-1/2 -z-10" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-20 grid grid-cols-1 lg:grid-cols-2 gap-24 lg:gap-32 items-center">
        {/* Text Content */}
        <div className="space-y-8 text-center lg:text-left flex flex-col items-center lg:items-start">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center lg:text-left"
          >
            <h1 className="text-5xl sm:text-7xl lg:text-9xl font-black tracking-tighter uppercase italic leading-[0.85] mb-8">
              <span className="block text-white">Construcción</span>
              <span className="block text-primary">Nivel Estudio</span>
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-white/70 font-bold uppercase tracking-[0.3em] max-w-2xl mx-auto lg:mx-0 mb-12">
              Transformamos espacios con precisión arquitectónica y acabados de lujo en Sagunto.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-wrap justify-center lg:justify-start gap-6 pt-4"
          >
            <div className="flex items-center gap-2 group">
              <div className="w-10 h-10 border border-white/10 flex items-center justify-center bg-white/5 transition-colors group-hover:border-primary/50">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div className="space-y-0.5 text-left">
                <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Experiencia</h4>
                <p className="text-xs font-bold text-white/80 uppercase tracking-widest">+15 años en Sagunto</p>
              </div>
            </div>
            <div className="flex items-center gap-2 group">
              <div className="w-10 h-10 border border-white/10 flex items-center justify-center bg-white/5 transition-colors group-hover:border-primary/50">
                <CheckCircle className="w-5 h-5 text-primary" />
              </div>
              <div className="space-y-0.5 text-left">
                <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Ejecutados</h4>
                <p className="text-xs font-bold text-white/80 uppercase tracking-widest">+200 Proyectos</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* The Protagonist: Calculator */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="w-full"
          id="calculadora"
        >
          <div className="relative">
            {/* Design accents */}
            <div className="absolute -top-10 -right-10 w-40 h-40 border-t border-r border-primary/20 hidden lg:block" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 border-b border-l border-primary/20 hidden lg:block" />
            <Calculator />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
