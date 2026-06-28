import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Award, Sparkles, Building } from 'lucide-react';

const stats = [
  { value: '15+', label: 'Años de Experiencia', description: 'Garantizando solidez en cada estructura en Sagunto y alrededores.' },
  { value: '200+', label: 'Proyectos Entregados', description: 'Desde reformas integrales de diseño hasta obra nueva impecable.' },
  { value: '100%', label: 'Transparencia Total', description: 'Presupuestos claros y sin sorpresas de última hora.' }
];

const About = () => {
  return (
    <section
      id="nosotros"
      aria-labelledby="about-heading"
      className="py-32 bg-dark relative overflow-hidden"
    >
      {/* Decorative background elements */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-72 h-72 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">

          {/* Text Content */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <span className="text-[10px] font-black tracking-[0.4em] uppercase text-primary block">
                Nuestra Esencia
              </span>
              <h2
                id="about-heading"
                className="text-4xl sm:text-6xl font-outfit font-black tracking-tighter text-white uppercase italic"
              >
                Precisión y <br />
                <span className="text-primary not-italic font-normal">diseño de vanguardia</span>
              </h2>
            </div>

            <p className="text-white/70 text-sm sm:text-base leading-relaxed font-medium max-w-2xl">
              En <strong className="text-primary font-black uppercase tracking-wider">Conscugar</strong>, llevamos más de 15 años redefiniendo la construcción y las reformas en Sagunto y la comarca del Camp de Morvedre. Nos alejamos de los métodos tradicionales para ofrecer un servicio transparente y moderno, donde la tecnología y el diseño van de la mano.
            </p>

            <p className="text-white/60 text-xs sm:text-sm leading-relaxed font-normal max-w-xl">
              Creemos que reformar tu hogar no debería ser un proceso estresante. Por eso creamos herramientas digitales como nuestro presupuestador online y nos comprometemos con plazos estrictos, comunicación fluida y acabados premium que superan las expectativas.
            </p>

            {/* Values Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase text-white tracking-widest">Seguridad Real</h4>
                  <p className="text-[10px] text-white/50 mt-1 leading-relaxed">Garantía por contrato y seguros específicos para tu tranquilidad absoluta.</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase text-white tracking-widest">Detalle y Acabado</h4>
                  <p className="text-[10px] text-white/50 mt-1 leading-relaxed">Selección minuciosa de materiales y operarios altamente cualificados.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats & Interactive Panel */}
          <div className="lg:col-span-5 space-y-6">
            <div className="relative p-8 sm:p-10 bg-dark-lighter border border-white/5 space-y-8 shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
              {/* Decorative Corner Lines */}
              <div className="absolute top-0 left-0 w-8 h-[1px] bg-primary" />
              <div className="absolute top-0 left-0 w-[1px] h-8 bg-primary" />

              <h3 className="text-xs font-black uppercase tracking-widest text-white/80 border-b border-white/5 pb-4">Nuestras Cifras</h3>

              <div className="space-y-8">
                {stats.map((stat, i) => (
                  <div key={i} className="flex items-start justify-between gap-6 group">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest block">{stat.label}</span>
                      <p className="text-[9px] text-white/40 leading-normal max-w-[200px] group-hover:text-white/60 transition-colors">{stat.description}</p>
                    </div>
                    <span className="text-3xl sm:text-4xl font-outfit font-black text-white italic tracking-tighter shrink-0 select-none">
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default About;
