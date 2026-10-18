import React from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Clock,
  FileCheck2,
  MapPin,
  ArrowUpRight,
  MessageCircle,
  Phone,
  CalendarCheck,
} from 'lucide-react';
import Calculator from '../Calculator/Calculator';
import livingImg from '../../assets/living-room.webp';

export const Hero = ({ phone = '34600000000' }) => {
  const handleOpenDirectContact = () => {
    window.dispatchEvent(new CustomEvent('conscugar:open-direct-contact'));
    const calcEl = document.getElementById('calculadora');
    if (calcEl) {
      const top = calcEl.getBoundingClientRect().top + window.scrollY - 88;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    }
  };

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative min-h-[90vh] flex items-center py-20 sm:py-28 border-t border-stone-200/80 overflow-hidden bg-transparent"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-20 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        
        {/* COLUMNA IZQUIERDA: PROPUESTA DE VALOR, CAPTACIÓN DIRECTA & AUTORIDAD */}
        <div className="lg:col-span-5 space-y-5 flex flex-col items-center lg:items-start text-center lg:text-left pt-2 lg:pt-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-5 w-full"
          >
            {/* Cota técnica superior + Geolocalización */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-stone-200/90 rounded-full text-stone-800 text-xs font-bold shadow-sm">
                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" aria-hidden="true" />
                <span>Sagunto · Puerto de Sagunto · Valencia</span>
              </div>
              <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-md bg-orange-950/[0.06] text-[11px] font-mono font-semibold text-primary-dark">
                Estudio Técnico Propio
              </span>
            </div>

            <h1
              id="hero-heading"
              className="text-4xl sm:text-5xl lg:text-[3.2rem] font-outfit font-extrabold tracking-tight text-stone-900 leading-[1.08]"
            >
              Calcula tu reforma en 60 segundos o{' '}
              <span className="text-primary">habla directo con nuestro aparejador.</span>
            </h1>

            <p className="max-w-xl text-base sm:text-lg text-stone-600 font-normal leading-relaxed mx-auto lg:mx-0">
              Obtén una valoración orientativa al instante desde <strong className="text-stone-900 font-semibold">1 m²</strong> con nuestra calculadora online, o si prefieres no rellenar pasos, <strong>contáctanos directamente</strong> y vamos a ver y medir tu vivienda gratis.
            </p>

            {/* TARJETA LIMPIA DE CONTACTO DIRECTO (Sin usar la calculadora) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200/90 shadow-sm text-left space-y-3.5 w-full">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-primary">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" aria-hidden="true" />
                  ¿Prefieres no usar la calculadora?
                </span>
                <p className="text-sm font-bold text-stone-900">
                  Habla directamente con nuestro aparejador (visita y medición gratuitas)
                </p>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Si no sabes los metros exactos o prefieres trato directo desde el primer minuto, escríbenos o pídenos que te llamemos:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleOpenDirectContact}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition-all shadow-sm"
                >
                  <CalendarCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Pedir llamada / visita gratis</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`https://wa.me/${phone}?text=${encodeURIComponent('Hola Conscugar, prefiero hablar directamente con vosotros para pedir presupuesto de reforma.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-current shrink-0" aria-hidden="true" />
                    <span>WhatsApp</span>
                  </a>
                  <a
                    href={`tel:+${phone}`}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#F7F5F0] hover:bg-stone-200/70 border border-stone-200 text-stone-800 text-xs font-bold transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>Llamar</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Puntos de Confianza y Garantía Contractual (CRO) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left w-full">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-stone-200/90 shadow-sm">
                <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-xs font-bold text-stone-900">Precio y plazo por contrato</p>
                  <p className="text-[11px] text-stone-500">Sin desviaciones ni sorpresas de última hora.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-stone-200/90 shadow-sm">
                <FileCheck2 className="w-5 h-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-xs font-bold text-stone-900">Dossier PDF al instante</p>
                  <p className="text-[11px] text-stone-500">Con PEM, IVA (21%) y tasas ICIO.</p>
                </div>
              </div>
            </div>

            {/* Tarjeta de Obra Real Entregada */}
            <a
              href="#portfolio"
              className="group flex items-center gap-4 p-3 rounded-2xl bg-white border border-stone-200/90 hover:border-primary/40 shadow-sm hover:shadow-md transition-all text-left w-full"
            >
              <img
                src={livingImg}
                alt="Reforma integral de ático en Sagunto ejecutada por Conscugar"
                width={72}
                height={56}
                className="w-[72px] h-14 rounded-xl object-cover shrink-0 border border-stone-200"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" aria-hidden="true" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Obra Real Verificada</span>
                </div>
                <p className="text-xs sm:text-sm font-bold text-stone-900 truncate group-hover:text-primary transition-colors">
                  Ático 120 m² en Sagunto Centro · Reforma Integral
                </p>
                <p className="text-[11px] text-stone-500">
                  Ver fotos del antes/después y memoria técnica
                </p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-[#F7F5F0] group-hover:bg-primary group-hover:text-white flex items-center justify-center text-stone-600 transition-colors shrink-0">
                <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </div>
            </a>

            {/* Social Proof Local */}
            <div className="pt-1 flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 text-xs text-stone-600 font-medium">
              <div className="flex items-center gap-1.5">
                <span className="text-amber-600 font-extrabold text-sm">★★★★★ 4.9/5</span>
                <span className="text-stone-700 font-semibold">Valoración media en Sagunto y Valencia</span>
              </div>
              <span className="hidden sm:inline text-stone-300" aria-hidden="true">|</span>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                <span>+15 años de experiencia</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* COLUMNA DERECHA: CALCULADORA INTERACTIVA */}
        <div className="lg:col-span-7 relative w-full flex justify-center lg:justify-end">
          <div className="w-full max-w-2xl">
            <div id="calculadora" className="relative scroll-mt-24">
              <Calculator />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;
