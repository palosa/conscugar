import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  MapPin, 
  Calendar, 
  Tag, 
  ChevronRight, 
  ChevronLeft,
  ArrowRight,
  Maximize2
} from 'lucide-react';
import kitchenImg from '../../assets/kitchen.png';
import bathroomImg from '../../assets/bathroom.png';
import livingImg from '../../assets/living-room.png';

// Import de nuevas imágenes generadas
import livingV2 from '../../assets/living-v2.png';
import kitchenV2 from '../../assets/kitchen-v2.png';

const projects = [
  { 
    id: 1,
    title: 'Ático con vistas al Castillo', 
    category: 'Reforma Integral', 
    location: 'Sagunto (Centro Histórico)', 
    year: '2023',
    image: livingImg,
    gallery: [livingImg, livingV2],
    description: 'Transformación radical de un ático de 120m² integrando materiales nobles. El mayor reto fue respetar la estructura histórica mientras se insertaba un diseño de vanguardia mediterránea.',
    details: [
      'Suelo radiante con tarima de roble natural.',
      'Aislamiento termo-acústico de alta eficiencia.',
      'Mobiliario integrado a medida en salón y comedor.'
    ]
  },
  { 
    id: 2,
    title: 'Cocina Minimalista Black & Wood', 
    category: 'Interiorismo', 
    location: 'Puerto de Sagunto (Zona Náutica)', 
    year: '2024',
    image: kitchenImg,
    gallery: [kitchenImg, kitchenV2],
    description: 'Proyecto de cocina abierta al mar. Buscábamos la elegancia del negro mate pero sin perder la calidez que aporta el roble ahumado artesanal.',
    details: [
      'Encimera de Dekton con veteado natural.',
      'Electrodomésticos premium totalmente ocultos.',
      'Suelo de madera resistente a la humedad.'
    ]
  },
  { 
    id: 3,
    title: 'Suite de Relax Spa', 
    category: 'Reforma de Baño', 
    location: 'Gilet (Sierra Calderona)', 
    year: '2023',
    image: bathroomImg,
    gallery: [bathroomImg],
    description: 'Conversión de un baño tradicional en un santuario de relajación profunda. La iluminación indirecta es la clave de este proyecto.',
    details: [
      'Alicatado de gran formato efecto piedra.',
      'Grifería empotrada en negro obsidiana.',
      'Ducha a ras de suelo con sistema de drenaje invisible.'
    ]
  }
];

const Portfolio = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  return (
    <section id="portfolio" className="bg-dark pt-32 pb-40 overflow-hidden w-full relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div className="space-y-4 max-w-xl">
            <span 
              className="text-[10px] font-black tracking-[0.4em] uppercase text-primary"
            >
              Trayectoria en Camp de Morvedre
            </span>
            <h2 
              className="text-4xl sm:text-6xl font-outfit font-black tracking-tighter text-white"
            >
              Nuestras obras en <br/>
              Sagunto <span className="italic font-normal text-white">y alrededores</span>
            </h2>
          </div>
          <p 
            className="text-white max-w-xs text-sm leading-relaxed"
          >
            Desde el Puerto hasta Gilet y Canet d'en Berenguer. Transformamos cada espacio en una referencia local.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, idx) => (
            <motion.div 
              key={project.id}
              initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1, duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="group relative h-[500px] overflow-hidden bg-dark-lighter border border-white/5 cursor-pointer"
            onClick={() => {
               setSelectedProject(project);
               setActiveImageIdx(0);
            }}
          >
            <div className="absolute inset-0 z-0">
              <img 
                src={project.image} 
                alt={project.title} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale-[20%] group-hover:grayscale-0"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
            </div>

            <div className="absolute inset-0 z-10 p-8 flex flex-col justify-end gap-4 transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
              <div className="space-y-1">
                <h3 className="text-xl font-black uppercase tracking-tight text-white">{project.title}</h3>
                <p className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold">{project.category} · SAGUNTO</p>
                <p className="text-xs text-white/70 leading-relaxed font-medium mt-3 max-w-sm">{project.description}</p>
              </div>
              <div className="pt-4 flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-primary transition-colors">
                    <Maximize2 className="w-3 h-3 text-white/20 group-hover:text-primary" />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">Ver Detalles</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Project Modal Detail */}
      <AnimatePresence>
         {selectedProject && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12 overflow-y-auto bg-dark/95 backdrop-blur-3xl"
            >
               <motion.button 
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  onClick={() => setSelectedProject(null)}
                  className="fixed top-8 right-8 z-[110] w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary hover:text-dark transition-all"
               >
                  <X className="w-6 h-6" />
               </motion.button>

               <motion.div 
                  initial={{ y: 30, opacity: 0, scale: 0.98 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: 20, opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full max-w-6xl flex flex-col lg:flex-row bg-dark-lighter border border-white/5 shadow-[0_50px_100px_rgba(0,0,0,0.8)] min-h-[70vh]"
               >
                  {/* Gallery Section */}
                  <div className="w-full lg:w-3/5 h-[400px] lg:h-auto relative bg-black flex items-center justify-center overflow-hidden">
                     <AnimatePresence mode="wait">
                        <motion.img 
                           key={activeImageIdx}
                           initial={{ opacity: 0, scale: 1.1 }}
                           animate={{ opacity: 1, scale: 1 }}
                           exit={{ opacity: 0, scale: 0.9 }}
                           transition={{ duration: 0.8 }}
                           src={selectedProject.gallery[activeImageIdx]} 
                           className="w-full h-full object-cover"
                        />
                     </AnimatePresence>

                     {selectedProject.gallery.length > 1 && (
                        <div className="absolute inset-0 flex items-center justify-between px-6 pointer-events-none">
                           <button 
                              onClick={(e) => {
                                 e.stopPropagation();
                                 setActiveImageIdx((prev) => (prev === 0 ? selectedProject.gallery.length - 1 : prev - 1));
                              }}
                              className="w-12 h-12 bg-black/40 backdrop-blur-md border border-white/5 flex items-center justify-center text-white pointer-events-auto hover:bg-primary hover:text-dark transition-all"
                           >
                              <ChevronLeft />
                           </button>
                           <button 
                              onClick={(e) => {
                                 e.stopPropagation();
                                 setActiveImageIdx((prev) => (prev === selectedProject.gallery.length - 1 ? 0 : prev + 1));
                              }}
                              className="w-12 h-12 bg-black/40 backdrop-blur-md border border-white/5 flex items-center justify-center text-white pointer-events-auto hover:bg-primary hover:text-dark transition-all"
                           >
                              <ChevronRight />
                           </button>
                        </div>
                     )}

                     {/* Image Pagination Dots */}
                     {selectedProject.gallery.length > 1 && (
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                           {selectedProject.gallery.map((_, i) => (
                              <div key={i} className={cn("w-1.5 h-1.5 rounded-full transition-all", i === activeImageIdx ? "bg-primary w-6" : "bg-white/20")} />
                           ))}
                        </div>
                     )}
                  </div>

                  {/* Detail Info */}
                  <div className="flex-1 p-8 sm:p-12 flex flex-col justify-between space-y-8">
                     <div className="space-y-6">
                        <div>
                           <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">{selectedProject.category}</span>
                           <h2 className="text-3xl sm:text-4xl font-black tracking-tighter uppercase italic mt-2 text-white">{selectedProject.title}</h2>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pb-6 border-b border-white/5">
                           <div className="flex items-center gap-3">
                              <MapPin className="text-primary w-4 h-4" />
                              <div className="text-[10px] font-black uppercase tracking-widest text-white/30">{selectedProject.location}</div>
                           </div>
                           <div className="flex items-center gap-3">
                              <Calendar className="text-primary w-4 h-4" />
                              <div className="text-[10px] font-black uppercase tracking-widest text-white/30">Año {selectedProject.year}</div>
                           </div>
                        </div>

                        <div className="space-y-4">
                           <p className="text-white/60 leading-relaxed font-bold uppercase tracking-wider text-[11px] italic">" {selectedProject.description} "</p>
                           <div className="space-y-2 pt-4">
                              {selectedProject.details.map((detail, k) => (
                                 <div key={k} className="flex gap-4">
                                    <div className="w-1 h-1 bg-primary rounded-full mt-2 shrink-0 shadow-[0_0_10px_#F5C518]" />
                                    <p className="text-xs text-white/40 leading-relaxed">{detail}</p>
                                 </div>
                              ))}
                           </div>
                        </div>
                     </div>

                     <Button 
                        className="w-full py-8 text-[11px] font-black uppercase tracking-[0.4em] shadow-[0_20px_50px_rgba(245,197,24,0.2)]"
                        onClick={() => {
                           setSelectedProject(null);
                           document.getElementById('calculadora')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                     >
                        Quiero algo similar <ArrowRight className="ml-4 w-4 h-4" />
                     </Button>
                  </div>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>
      </div>
    </section>
  );
};

export default Portfolio;
