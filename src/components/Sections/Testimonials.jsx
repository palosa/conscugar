import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../utils/supabase';

const staticTestimonials = [
  {
    name: "Carlos Ruiz",
    location: "Puerto de Sagunto",
    text: "La precisión del presupuesto inicial fue asombrosa. No hubo sorpresas de última hora y el acabado de la reforma integral es impecable. Profesionales de verdad.",
    rating: 5,
    is_google: true
  },
  {
    name: "Elena García",
    location: "Gilet · Camp de Morvedre",
    text: "Reformamos nuestra vivienda con ellos. El equipo técnico entiende perfectamente la estructura, las instalaciones y los acabados. Cumplieron el plazo firmado por contrato.",
    rating: 5,
    is_google: true
  },
  {
    name: "Marc Sanchis",
    location: "Centro Histórico, Sagunto",
    text: "Gestionar una rehabilitación en el centro de Sagunto daba respeto por las licencias municipales, pero ellos se encargaron de todo el proceso técnico de principio a fin.",
    rating: 5,
    is_google: true
  }
];

const Testimonials = () => {
  const containerRef = useRef(null);
  const [dbTestimonials, setDbTestimonials] = useState([]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const fetchTestimonials = async () => {
      try {
        const { data } = await supabase
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

  return (
    <section 
      ref={containerRef}
      className="py-20 md:py-28 bg-transparent relative overflow-hidden" 
      id="testimonios" 
      aria-labelledby="testimonials-heading"
    >
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="max-w-2xl mb-16 space-y-3">
          <span className="text-xs font-extrabold tracking-widest uppercase text-primary block">Opiniones Verificadas</span>
          <h2 id="testimonials-heading" className="text-3xl sm:text-5xl font-outfit font-extrabold tracking-tight text-stone-900">
            Lo que dicen los propietarios que ya han reformado con <span className="text-primary">Conscugar.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {testimonialsList.map((t, idx) => (
            <motion.div
              key={t.id || idx}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.12, duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true, margin: "-50px" }}
              className="bg-white rounded-2xl p-8 border border-stone-200/90 shadow-sm space-y-6 relative overflow-hidden flex flex-col justify-between"
              itemScope itemType="https://schema.org/Review"
            >
              <div itemProp="itemReviewed" itemScope itemType="https://schema.org/HomeAndConstructionBusiness" className="hidden">
                <meta itemProp="name" content="Conscugar Arquitectura, Reformas y Construcción" />
              </div>
              <Quote className="absolute top-6 right-6 w-10 h-10 text-stone-100 pointer-events-none" aria-hidden="true" />
              
              <div className="space-y-4 relative z-10">
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
                      <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" aria-hidden="true" />
                    ))}
                  </div>

                  {t.is_google && (
                    <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 px-2.5 py-1 rounded-full select-none shrink-0">
                      <svg className="w-3 h-3" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      <span className="text-[10px] font-bold text-stone-600">Reseña Verificada</span>
                    </div>
                  )}
                </div>

                <blockquote className="text-stone-700 text-sm leading-relaxed" itemProp="reviewBody">
                  &ldquo;{t.text}&rdquo;
                </blockquote>
              </div>

              <div className="flex items-center gap-3.5 border-t border-stone-100 pt-5 mt-4" itemProp="author" itemScope itemType="https://schema.org/Person">
                <div className="w-10 h-10 rounded-full bg-orange-950/[0.07] flex items-center justify-center font-bold text-primary text-xs uppercase" aria-hidden="true">
                  {t.name ? t.name[0] : 'C'}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-stone-900" itemProp="name">{t.name}</h3>
                  <p className="text-[11px] text-stone-500 font-medium">{t.location}</p>
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

