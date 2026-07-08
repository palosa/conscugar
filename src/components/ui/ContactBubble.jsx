import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, MessageCircle, X, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';

const ContactBubble = ({ phone }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Popover Options Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="mb-4 w-72 bg-dark-lighter border border-white/10 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
          >
            {/* Background blur/orb */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-1">Contacto Directo</h4>
            <p className="text-[11px] text-white/60 mb-4 font-bold uppercase tracking-wider">Elige cómo prefieres contactarnos:</p>

            <div className="space-y-2">
              {/* WhatsApp Button */}
              <a
                href={`https://wa.me/${phone}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-4 p-3 bg-white/[0.02] border border-white/5 hover:border-[#25D366]/40 hover:bg-[#25D366]/5 transition-all group"
              >
                <div className="w-8 h-8 rounded-full bg-[#25D366]/10 flex items-center justify-center text-[#25D366] shrink-0 group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-4 h-4 fill-current" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-wider text-white">Escríbenos</p>
                  <p className="text-[8px] text-[#25D366] font-bold uppercase tracking-widest">WhatsApp online</p>
                </div>
                <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-[#25D366] transition-colors" />
              </a>

              {/* Call Phone Button */}
              <a
                href={`tel:${phone}`}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-4 p-3 bg-white/[0.02] border border-white/5 hover:border-primary/40 hover:bg-primary/5 transition-all group"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform">
                  <Phone className="w-4 h-4 fill-current" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-wider text-white">Llámanos</p>
                  <p className="text-[8px] text-primary font-bold uppercase tracking-widest">Llamada directa</p>
                </div>
                <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-primary transition-colors" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Action Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-[0_15px_35px_rgba(0,0,0,0.4)] border focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-dark relative overflow-hidden",
          isOpen
            ? "bg-dark border-white/20 text-white"
            : "bg-primary border-primary text-dark shadow-[0_10px_25px_rgba(245,197,24,0.3)]"
        )}
        aria-label="Opciones de contacto"
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
              {/* Pulsing ring around button when closed */}
              <span className="absolute -inset-2 rounded-full border border-primary/40 animate-ping opacity-75" />
              <MessageCircle className="w-6 h-6 fill-current" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};

export default ContactBubble;
