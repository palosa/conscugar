import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import WebGLToolsObject from '../ui/WebGLToolsObject';
import { supabase } from '../../utils/supabase';

const staticTestimonials = [
  {
    name: "Carlos Ruiz",
    location: "Puerto de Sagunto",
    text: "La precisión del presupuesto inicial fue asombrosa. No hubo sorpresas de última hora y el acabado es de revista. Profesionales de verdad.",
    rating: 5,
    is_google: false
  },
  {
    name: "Elena García",
    location: "Gilet",
    text: "Reformamos nuestra casa de montaña con ellos. El equipo técnico entiende perfectamente el entorno y los materiales. Superaron expectativas.",
    rating: 5,
    is_google: false
  },
  {
    name: "Marc Sanchis",
    location: "Centro Histórico, Sagunto",
    text: "Gestionar una rehabilitation en el centro de Sagunto daba miedo por los permisos, pero ellos se encargaron de todo. Una joya.",
    rating: 5,
    is_google: false
  }
];

const Testimonials = () => {
  const containerRef = useRef(null);
  const [dbTestimonials, setDbTestimonials] = useState([]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const { data, error } = await supabase
          .from('testimonials')
          .select('*')
          .eq('approved', true)
          .order('created_at', { ascending: false });
        if (data && data.length > 0) {
          setDbTestimonials(data);
        }
      } catch (err) {
        console.error("Error loading testimonials from Supabase:", err);
      }
    };
    fetchTestimonials();
  }, []);

  const testimonialsList = dbTestimonials.length > 0 ? dbTestimonials : staticTestimonials;

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
          {testimonialsList.map((t, idx) => (
            <motion.div
              key={t.id || idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              className="glass-card p-10 border border-white/5 space-y-8 relative overflow-hidden flex flex-col justify-between"
              itemScope itemType="https://schema.org/Review"
            >
              <meta itemProp="itemReviewed" content="Conscugar Reformas Sagunto" />
              <Quote className="absolute -top-4 -left-4 w-24 h-24 text-primary/5 -rotate-12 pointer-events-none" aria-hidden="true" />
              
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-4">
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

                  {t.is_google && (
                    <div className="flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full select-none shrink-0">
                      <svg className="w-2.5 h-2.5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      <span className="text-[8px] font-black text-white/50 uppercase tracking-wider">Google</span>
                    </div>
                  )}
                </div>

                <blockquote className="text-white/70 italic text-sm leading-relaxed font-medium" itemProp="reviewBody">
                  "{t.text}"
                </blockquote>
              </div>

              <div className="flex items-center gap-4 border-t border-white/5 pt-6 mt-6">
                <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-primary text-xs uppercase">{t.name ? t.name[0] : 'C'}</div>
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
