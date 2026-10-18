import React from 'react';
import { motion } from 'framer-motion';
import { Calculator, Compass, FileSignature, HardHat } from 'lucide-react';

const steps = [
  {
    title: "1. Cálculo Online Instantáneo",
    desc: "Configura los metros cuadrados, calidades y partidas de tu reforma en nuestra calculadora para obtener una valoración técnica con IVA e ICIO incluidos.",
    icon: Calculator,
    tag: "En 60 segundos"
  },
  {
    title: "2. Visita Técnica y Medición",
    desc: "Un arquitecto técnico de Conscugar visita tu inmueble en Sagunto, Camp de Morvedre o Valencia sin coste para verificar instalaciones y replanteo.",
    icon: Compass,
    tag: "100% Gratuita"
  },
  {
    title: "3. Presupuesto Cerrado y Contrato",
    desc: "Entregamos memoria de calidades detallada por partidas, cronograma de ejecución y precio cerrado por contrato sin sobrecostes.",
    icon: FileSignature,
    tag: "Garantía por escrito"
  },
  {
    title: "4. Ejecución y Entrega Llave en Mano",
    desc: "Coordinación integral de todos los gremios propios, tramitación de licencias municipales, dirección facultativa y limpieza final.",
    icon: HardHat,
    tag: "Plazo garantizado"
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.06,
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] }
  }
};

const Process = () => {
  return (
    <section 
      className="py-20 md:py-28 bg-white border-y border-stone-200/80 relative overflow-hidden" 
      id="servicios" 
      aria-labelledby="process-heading"
    >
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="max-w-3xl mb-16 space-y-3">
          <span className="text-xs font-extrabold tracking-widest uppercase text-primary block">Metodología Técnica Conscugar</span>
          <h2 id="process-heading" className="text-3xl sm:text-5xl font-outfit font-extrabold tracking-tight text-stone-900">
            De tu estimación online a la entrega de llaves, sin incertidumbre.
          </h2>
          <p className="text-stone-600 text-base leading-relaxed">
            Eliminamos la opacidad de las reformas tradicionales combinando presupuestación paramétrica al instante con dirección de obra propia en Valencia y Camp de Morvedre.
          </p>
        </div>

        <motion.ol
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          aria-label="Pasos del proceso Conscugar"
        >
          {steps.map((step, idx) => (
            <motion.li
              key={idx}
              variants={cardVariants}
              className="group relative p-7 rounded-2xl bg-[#F7F5F0]/70 border border-stone-200/90 hover:border-primary/40 hover:bg-white hover:shadow-xl hover:shadow-stone-900/5 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-white border border-stone-200 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-colors">
                    <step.icon className="w-5 h-5 text-primary group-hover:text-white transition-colors" aria-hidden="true" />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-orange-950/[0.06] text-primary-dark">
                    {step.tag}
                  </span>
                </div>
                
                <div className="space-y-2.5">
                  <h3 className="text-lg font-bold text-stone-900">{step.title}</h3>
                  <p className="text-sm text-stone-600 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  );
};

export default Process;


