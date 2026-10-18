import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Sparkles, Award, CheckCircle2 } from 'lucide-react';

const stats = [
  { value: '15+', label: 'Años de Experiencia en Obra', description: 'Ejecutando reformas integrales, rehabilitación y obra nueva en Sagunto, Puerto de Sagunto y Valencia.' },
  { value: '200+', label: 'Proyectos Entregados', description: 'Viviendas particulares, áticos, chalets y locales comerciales ejecutados con gremios propios.' },
  { value: '100%', label: 'Transparencia Presupuestaria', description: 'Desglose completo por partidas, licencias ICIO e IVA desde el primer minuto.' }
];

const About = () => {
  return (
    <section
      id="nosotros"
      aria-labelledby="about-heading"
      className="py-20 md:py-28 bg-transparent relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7 space-y-7"
          >
            <div className="space-y-3">
              <span className="text-xs font-extrabold tracking-widest uppercase text-primary block">
                Estudio Técnico y Constructora Propia
              </span>
              <h2
                id="about-heading"
                className="text-3xl sm:text-5xl font-outfit font-extrabold tracking-tight text-stone-900 leading-tight"
              >
                Rigor de ingeniería civil y diseño contemporáneo en <span className="text-primary">Valencia y Camp de Morvedre.</span>
              </h2>
            </div>

            <p className="text-stone-700 text-base leading-relaxed">
              En <strong className="text-stone-900 font-bold">Conscugar</strong> llevamos más de 15 años ejecutando reformas integrales, cocinas, baños, rehabilitaciones y obra nueva en Sagunto, Puerto de Sagunto, Canet d&apos;en Berenguer, Gilet, Puçol y Valencia. No somos un intermediario ni un directorio: dirigimos y ejecutamos tu obra con equipo propio.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex gap-4 items-start p-5 rounded-2xl bg-white border border-stone-200/90 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-orange-950/[0.06] flex items-center justify-center text-primary shrink-0">
                  <Shield className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900">Garantía y Seguro RC</h3>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">Contrato con plazos de entrega garantizados y póliza de responsabilidad civil en vigor.</p>
                </div>
              </div>

              <div className="flex gap-4 items-start p-5 rounded-2xl bg-white border border-stone-200/90 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-orange-950/[0.06] flex items-center justify-center text-primary shrink-0">
                  <Sparkles className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900">Cumplimiento CTE y Normativa</h3>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">Instalaciones eléctricas, fontanería, aislamiento termo-acústico y gestión de licencias municipales.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Panel */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.85, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5"
          >
            <div className="relative p-8 sm:p-10 rounded-2xl bg-stone-900 text-white space-y-8 shadow-xl">
              <div className="flex items-center justify-between border-b border-stone-800 pb-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400">Respaldo Conscugar</h3>
                <Award className="w-4 h-4 text-primary" aria-hidden="true" />
              </div>

              <div className="space-y-7">
                {stats.map((stat, i) => (
                  <div
                    key={i}
                    className="flex items-start justify-between gap-6 border-b border-stone-800/70 last:border-b-0 pb-6 last:pb-0"
                  >
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-orange-400 uppercase tracking-wider block">{stat.label}</span>
                      <p className="text-xs text-stone-300 leading-relaxed max-w-[240px]">{stat.description}</p>
                    </div>
                    <span className="text-3xl sm:text-4xl font-outfit font-extrabold text-white tabular-nums shrink-0">
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default About;


