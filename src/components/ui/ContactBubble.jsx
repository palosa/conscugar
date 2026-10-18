import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, MessageCircle, X, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';

const ContactBubble = ({ phone }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [pastCover, setPastCover] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const handleScroll = () => {
      // En móvil evitamos solapar el dock inferior de la portada sticky (aparece al acercarse al Hero/Calculadora)
      setPastCover(window.scrollY > window.innerHeight * 2.2);
    };
    handleScroll();
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end transition-all duration-300",
        !pastCover && "opacity-0 pointer-events-none translate-y-4 sm:opacity-100 sm:pointer-events-auto sm:translate-y-0"
      )}
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="mb-3 w-72 sm:w-80 max-w-[calc(100vw-2rem)] bg-white border border-stone-200 rounded-2xl p-5 shadow-[0_20px_50px_rgba(28,25,23,0.14)] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

            <h4 className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-primary mb-1">Atención Técnica Directa</h4>
            <p className="text-xs text-stone-600 mb-4 font-medium">Habla con un técnico de obra en Sagunto y Valencia:</p>

            <div className="space-y-2.5">
              <a
                href={`https://wa.me/${phone}?text=${encodeURIComponent('Hola Conscugar, me gustaría consultar un presupuesto de reforma.')}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3.5 p-3.5 rounded-xl bg-stone-50 border border-stone-200 hover:border-emerald-600/50 hover:bg-emerald-50/50 transition-all group"
              >
                <div className="w-9 h-9 rounded-full bg-emerald-600/10 flex items-center justify-center text-emerald-700 shrink-0 group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-4 h-4 fill-current" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-stone-900">WhatsApp Directo</p>
                  <p className="text-[11px] text-emerald-700 font-semibold">Respuesta rápida en horario de obra</p>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-emerald-700 transition-colors" />
              </a>

              <a
                href={`tel:+${phone}`}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3.5 p-3.5 rounded-xl bg-stone-50 border border-stone-200 hover:border-primary/50 hover:bg-orange-50/50 transition-all group"
              >
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform">
                  <Phone className="w-4 h-4 fill-current" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-stone-900">Llamada Telefónica</p>
                  <p className="text-[11px] text-primary font-semibold">Asesoramiento sin compromiso</p>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-primary transition-colors" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.04, y: -2 }}
        whileTap={{ scale: 0.96 }}
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg border focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 relative overflow-hidden",
          isOpen
            ? "bg-stone-900 border-stone-800 text-white"
            : "bg-primary border-primary text-white shadow-primary/30"
        )}
        aria-label="Opciones de contacto directo"
        aria-expanded={isOpen}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="message"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center relative"
            >
              <MessageCircle className="w-6 h-6 fill-current" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};

export default ContactBubble;

