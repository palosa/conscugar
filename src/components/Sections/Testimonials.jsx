import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import WebGLToolsObject from '../ui/WebGLToolsObject';

const testimonials = [
  {
    name: "Carlos Ruiz",
    location: "Puerto de Sagunto",
    text: "La precisión del presupuesto inicial fue asombrosa. No hubo sorpresas de última hora y el acabado es de revista. Profesionales de verdad.",
    rating: 5,
  },
  {
    name: "Elena García",
    location: "Gilet",
    text: "Reformamos nuestra casa de montaña con ellos. El equipo técnico entiende perfectamente el entorno y los materiales. Superaron expectativas.",
    rating: 5,
  },
  {
    name: "Marc Sanchis",
    location: "Centro Histórico, Sagunto",
    text: "Gestionar una rehabilitación en el centro de Sagunto daba miedo por los permisos, pero ellos se encargaron de todo. Una joya.",
    rating: 5,
  }
];

const Testimonials = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const yBg = useTransform(scrollYProgress, [0, 1], [-80, 80]);
  const yTool = useTransform(scrollYProgress, [0, 1], [-40, 40]);

  return (
    <section 
      ref={containerRef}
      className="py-32 bg-black/40 relative overflow-hidden" 
      id="testimonios" 
      aria-labelledby="testimonials-heading"
    >
      {/* 3D Builder Mallet (Left Side) */}
      <motion.div 
        style={{ y: yTool }}
        className="absolute top-12 left-12 z-0 opacity-[0.45] pointer-events-none transform scale-[1.0] md:scale-[1.2] lg:scale-[1.4]"
      >
         <WebGLToolsObject />
      </motion.div>

      {/* Parallax Background Layer */}
      <motion.div 
        style={{ y: yBg }}
        className="absolute top-20 right-10 z-0 text-[14vw] font-black uppercase text-white/[0.035] pointer-events-none select-none tracking-widest italic leading-none"
      >
        RESEÑAS
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-24 space-y-4">
           <p className="text-[10px] font-black uppercase text-primary tracking-[0.5em]">Voces de Confianza</p>
           <h2 id="testimonials-heading" className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white">Voz del Cliente</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              className="glass-card p-10 border border-white/5 space-y-8 relative overflow-hidden"
              itemScope itemType="https://schema.org/Review"
            >
              <meta itemProp="itemReviewed" content="Conscugar Reformas Sagunto" />
              <Quote className="absolute -top-4 -left-4 w-24 h-24 text-primary/5 -rotate-12 pointer-events-none" aria-hidden="true" />
              
              <div
                className="flex gap-1"
                role="img"
                aria-label={`Valoración: ${t.rating} de 5 estrellas`}
                itemProp="reviewRating"
                itemScope
                itemType="https://schema.org/Rating"
              >
                <meta itemProp="ratingValue" content={t.rating} />
                <meta itemProp="bestRating" content="5" />
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 text-primary fill-primary" aria-hidden="true" />
                ))}
              </div>

                <blockquote className="text-white/70 italic text-sm leading-relaxed mb-6 font-medium" itemProp="reviewBody">
                  "{t.text}"
                </blockquote>
                <div className="flex items-center gap-4 border-t border-white/5 pt-6">
                  <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-primary text-xs uppercase">{t.name[0]}</div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-white" itemProp="author">{t.name}</h3>
                    <p className="text-[10px] text-primary/60 font-bold uppercase">{t.location}</p>
                  </div>
                </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
