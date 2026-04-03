import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

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
  return (
    <section className="py-32 bg-black/40 relative overflow-hidden" id="testimonios">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-24 space-y-4">
           <p className="text-[10px] font-black uppercase text-primary tracking-[0.5em]">Voces de Confianza</p>
           <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white">Voz del Cliente</h2>
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
            >
              <Quote className="absolute -top-4 -left-4 w-24 h-24 text-primary/5 -rotate-12 pointer-events-none" />
              
              <div className="flex gap-1">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 text-primary fill-primary" />
                ))}
              </div>

                <p className="text-white/70 italic text-sm leading-relaxed mb-6 font-medium">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-4 border-t border-white/5 pt-6">
                  <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-primary text-xs uppercase">{t.name[0]}</div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-white">{t.name}</h4>
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
