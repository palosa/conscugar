import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { MessageSquare, Layout, Calculator, Construction } from 'lucide-react';

const steps = [
  {
    title: "Asesoría",
    desc: "Definimos tus necesidades y el alcance técnico del proyecto.",
    icon: MessageSquare,
    color: "from-blue-500/20 to-cyan-500/0"
  },
  {
    title: "Diseño & Plan",
    desc: "Visualizamos el espacio y seleccionamos materiales de alta gama.",
    icon: Layout,
    color: "from-primary/20 to-yellow-500/0"
  },
  {
    title: "Tech-Budget",
    desc: "Nuestra calculadora te ofrece una aproximación del coste. Un técnico revisará tu proyecto y elaborará el presupuesto definitivo.",
    icon: Calculator,
    color: "from-emerald-500/20 to-teal-500/0"
  },
  {
    title: "Firma Conscugar",
    desc: "Ejecución profesional con supervisión técnica diaria.",
    icon: Construction,
    color: "from-red-500/20 to-orange-500/0"
  }
];

const Process = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const yBg = useTransform(scrollYProgress, [0, 1], [-60, 60]);

  return (
    <section 
      ref={containerRef}
      className="py-32 bg-dark relative overflow-hidden" 
      id="servicios" 
      aria-labelledby="process-heading"
    >
      {/* Parallax Background Layer */}
      <motion.div 
        style={{ y: yBg }}
        className="absolute top-20 left-10 text-[14vw] font-black uppercase text-white/[0.035] pointer-events-none select-none tracking-widest italic leading-none"
      >
        METODO
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-24 space-y-4">
           <p className="text-[10px] font-black uppercase text-primary tracking-[0.5em]">La Diferencia</p>
           <h2 id="process-heading" className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white">Nuestro Método</h2>
        </div>

        <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8" aria-label="Pasos del proceso Conscugar">
          {steps.map((step, idx) => (
            <motion.li
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="group relative p-10 bg-white/[0.02] border border-white/5 hover:border-primary/20 transition-all duration-500"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
              
              <div className="relative z-10 space-y-6">
                <div className="w-14 h-14 bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-primary/40 group-hover:bg-primary transition-all duration-500">
                  <step.icon className="w-6 h-6 text-primary group-hover:text-dark" />
                </div>
                
                <div className="space-y-3">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block">Paso 0{idx + 1}</span>
                  <h3 className="text-xl font-black uppercase italic">{step.title}</h3>
                  <p className="text-sm text-white/70 leading-relaxed group-hover:text-white transition-colors font-medium">
                    {step.desc}
                  </p>
                </div>
              </div>
              
              {/* Connector for Desktop */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-8 w-8 h-[1px] bg-white/5 z-0" />
              )}
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
};

export default Process;
