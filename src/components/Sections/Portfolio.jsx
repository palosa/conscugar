import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, MapPin, Calendar, ChevronRight, ChevronLeft, ArrowRight, Images
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from '../ui/Button';
import kitchenImg from '../../assets/kitchen.png';
import bathroomImg from '../../assets/bathroom.png';
import livingImg from '../../assets/living-room.png';
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
    description: 'Transformación radical de un ático de 120m² integrando materiales nobles. Mayor reto: respetar la estructura histórica mientras se insertaba un diseño de vanguardia mediterránea.',
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
    description: 'Cocina abierta al mar con elegancia del negro mate y calidez del roble ahumado artesanal.',
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
  const [hoveredGallery, setHoveredGallery] = useState({}); // { projectId: imageIndex }

  const openProject = (project) => {
    setSelectedProject(project);
    setActiveImageIdx(0);
  };

  return (
    <section
      id="portfolio"
      aria-labelledby="portfolio-heading"
      className="bg-dark pt-32 pb-40 overflow-hidden w-full relative z-10"
    >
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div className="space-y-4 max-w-xl">
            <span className="text-[10px] font-black tracking-[0.4em] uppercase text-primary block">
              Trayectoria en Camp de Morvedre
            </span>
            <h2
              id="portfolio-heading"
              className="text-4xl sm:text-6xl font-outfit font-black tracking-tighter text-white"
            >
              Nuestras obras en <br />
              Sagunto <span className="italic font-normal text-white">y alrededores</span>
            </h2>
          </div>
          <p className="text-white max-w-xs text-sm leading-relaxed">
            Desde el Puerto hasta Gilet y Canet d'en Berenguer. Transformamos cada espacio en una referencia local.
          </p>
        </div>

        {/* Project Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" role="list">
          {projects.map((project, idx) => {
            const previewIdx = hoveredGallery[project.id] ?? 0;
            return (
              <motion.article
                key={project.id}
                role="listitem"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className="group relative flex flex-col bg-dark-lighter border border-white/5 overflow-hidden cursor-pointer hover:border-primary/20 transition-all duration-500"
                onClick={() => openProject(project)}
              >
                {/* Main image with hover gallery switch */}
                <div className="relative h-[320px] overflow-hidden bg-black">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={previewIdx}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      src={project.gallery[previewIdx]}
                      alt={`${project.title} — ${project.category} en ${project.location}`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </AnimatePresence>
                  <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/10 to-transparent" />

                  {/* Gallery count badge */}
                  {project.gallery.length > 1 && (
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 flex items-center gap-2">
                      <Images className="w-3 h-3 text-primary" aria-hidden="true" />
                      <span className="text-[9px] font-black text-white/60">{project.gallery.length} fotos</span>
                    </div>
                  )}

                  {/* Category pill */}
                  <div className="absolute top-4 left-4 bg-primary/90 px-3 py-1.5">
                    <span className="text-[8px] font-black uppercase tracking-widest text-dark">{project.category}</span>
                  </div>
                </div>

                {/* Thumbnail strip — mini gallery preview */}
                {project.gallery.length > 1 && (
                  <div
                    className="flex gap-1 px-1 pt-1 bg-black/40"
                    role="group"
                    aria-label={`Galería de ${project.title}`}
                    onClick={e => e.stopPropagation()}
                  >
                    {project.gallery.map((img, i) => (
                      <button
                        key={i}
                        type="button"
                        aria-label={`Ver foto ${i + 1} de ${project.title}`}
                        aria-pressed={previewIdx === i}
                        onMouseEnter={() => setHoveredGallery(prev => ({ ...prev, [project.id]: i }))}
                        onMouseLeave={() => setHoveredGallery(prev => ({ ...prev, [project.id]: 0 }))}
                        onClick={() => setHoveredGallery(prev => ({ ...prev, [project.id]: i }))}
                        className={cn(
                          "flex-1 h-12 overflow-hidden border-b-2 transition-all duration-300",
                          previewIdx === i ? "border-primary opacity-100" : "border-transparent opacity-40 hover:opacity-70"
                        )}
                      >
                        <img
                          src={img}
                          alt=""
                          aria-hidden="true"
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Card info — always visible, not just on hover */}
                <div className="p-6 flex flex-col gap-3 flex-1">
                  <div>
                    <h3 className="text-base font-black uppercase tracking-tight text-white leading-tight">
                      {project.title}
                    </h3>
                    <p className="text-[9px] uppercase tracking-[0.2em] text-white/40 font-bold mt-1">
                      <MapPin className="w-3 h-3 inline mr-1 text-primary" aria-hidden="true" />
                      {project.location} · {project.year}
                    </p>
                  </div>
                  <p className="text-[11px] text-white/50 leading-relaxed line-clamp-2">{project.description}</p>

                  {/* Ver Detalle — PROMINENT, always visible */}
                  <button
                    type="button"
                    aria-expanded={selectedProject?.id === project.id}
                    aria-haspopup="dialog"
                    className="mt-auto flex items-center justify-between w-full border border-white/10 group-hover:border-primary/40 px-4 py-3 transition-all"
                    onClick={e => { e.stopPropagation(); openProject(project); }}
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/60 group-hover:text-white transition-colors">
                      Ver detalles del proyecto
                    </span>
                    <ChevronRight className="w-4 h-4 text-primary transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </button>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* Project Modal */}
        <AnimatePresence>
          {selectedProject && (
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={`Detalle de ${selectedProject.title}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-12 overflow-y-auto bg-dark/95 backdrop-blur-3xl"
            >
              <button
                type="button"
                aria-label="Cerrar detalle del proyecto"
                onClick={() => setSelectedProject(null)}
                className="fixed top-6 right-6 z-[110] w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary hover:text-dark transition-all"
              >
                <X className="w-6 h-6" aria-hidden="true" />
              </button>

              <motion.div
                initial={{ y: 30, opacity: 0, scale: 0.98 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 20, opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-6xl flex flex-col lg:flex-row bg-dark-lighter border border-white/5 shadow-[0_50px_100px_rgba(0,0,0,0.8)]"
              >
                {/* Gallery panel */}
                <div className="w-full lg:w-3/5 flex flex-col">
                  <div className="relative h-[300px] sm:h-[420px] lg:h-full min-h-[300px] bg-black overflow-hidden">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={activeImageIdx}
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.6 }}
                        src={selectedProject.gallery[activeImageIdx]}
                        alt={`${selectedProject.title}, foto ${activeImageIdx + 1} de ${selectedProject.gallery.length}`}
                        className="w-full h-full object-cover"
                      />
                    </AnimatePresence>

                    {selectedProject.gallery.length > 1 && (
                      <>
                        <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 pointer-events-none">
                          <button
                            type="button"
                            aria-label="Foto anterior"
                            onClick={e => { e.stopPropagation(); setActiveImageIdx(p => p === 0 ? selectedProject.gallery.length - 1 : p - 1); }}
                            className="w-10 h-10 bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white pointer-events-auto hover:bg-primary hover:text-dark transition-all"
                          >
                            <ChevronLeft className="w-5 h-5" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            aria-label="Foto siguiente"
                            onClick={e => { e.stopPropagation(); setActiveImageIdx(p => p === selectedProject.gallery.length - 1 ? 0 : p + 1); }}
                            className="w-10 h-10 bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white pointer-events-auto hover:bg-primary hover:text-dark transition-all"
                          >
                            <ChevronRight className="w-5 h-5" aria-hidden="true" />
                          </button>
                        </div>

                        {/* Dots */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2" role="tablist" aria-label="Fotos del proyecto">
                          {selectedProject.gallery.map((_, i) => (
                            <button
                              key={i}
                              type="button"
                              role="tab"
                              aria-selected={i === activeImageIdx}
                              aria-label={`Foto ${i + 1}`}
                              onClick={e => { e.stopPropagation(); setActiveImageIdx(i); }}
                              className={cn("h-1.5 rounded-full transition-all duration-300", i === activeImageIdx ? "bg-primary w-8" : "bg-white/30 w-1.5 hover:bg-white/60")}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Thumbnail strip in modal */}
                  {selectedProject.gallery.length > 1 && (
                    <div className="flex h-20 border-t border-white/5">
                      {selectedProject.gallery.map((img, i) => (
                        <button
                          key={i}
                          type="button"
                          aria-label={`Ver foto ${i + 1}`}
                          aria-pressed={activeImageIdx === i}
                          onClick={e => { e.stopPropagation(); setActiveImageIdx(i); }}
                          className={cn("flex-1 overflow-hidden border-b-2 transition-all", activeImageIdx === i ? "border-primary" : "border-transparent opacity-50 hover:opacity-80")}
                        >
                          <img src={img} alt="" aria-hidden="true" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Info panel */}
                <div className="flex-1 p-8 sm:p-10 flex flex-col justify-between gap-8">
                  <div className="space-y-6">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">{selectedProject.category}</span>
                      <h2 className="text-3xl font-black tracking-tighter uppercase italic mt-2 text-white leading-tight">
                        {selectedProject.title}
                      </h2>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pb-6 border-b border-white/5">
                      <div className="flex items-center gap-3">
                        <MapPin className="text-primary w-4 h-4 shrink-0" aria-hidden="true" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40">{selectedProject.location}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="text-primary w-4 h-4 shrink-0" aria-hidden="true" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Año {selectedProject.year}</p>
                      </div>
                    </div>

                    <p className="text-white/60 leading-relaxed text-sm italic">"{selectedProject.description}"</p>

                    <ul className="space-y-3" aria-label="Detalles del proyecto">
                      {selectedProject.details.map((detail, k) => (
                        <li key={k} className="flex gap-4 items-start">
                          <div className="w-1 h-1 bg-primary rounded-full mt-2 shrink-0 shadow-[0_0_10px_#F5C518]" aria-hidden="true" />
                          <p className="text-xs text-white/50 leading-relaxed">{detail}</p>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    className="w-full py-7 text-[11px] font-black uppercase tracking-[0.4em] shadow-[0_20px_50px_rgba(245,197,24,0.15)]"
                    onClick={() => {
                      setSelectedProject(null);
                      document.getElementById('calculadora')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Quiero algo similar <ArrowRight className="ml-3 w-4 h-4" aria-hidden="true" />
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
