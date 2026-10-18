import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, MapPin, Calendar, ChevronRight, ChevronLeft, ArrowRight, Images
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from '../ui/Button';
import kitchenImg from '../../assets/kitchen.webp';
import bathroomImg from '../../assets/bathroom.webp';
import livingImg from '../../assets/living-room.webp';
import livingV2 from '../../assets/living-v2.webp';
import kitchenV2 from '../../assets/kitchen-v2.webp';

const BeforeAfterSlider = ({ before, after }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef(null);

  const handleMove = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleMouseMove = (e) => handleMove(e.clientX);
  const handleTouchMove = (e) => {
    if (e.touches[0]) handleMove(e.touches[0].clientX);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') setSliderPosition(p => Math.max(0, p - 5));
    else if (e.key === 'ArrowRight') setSliderPosition(p => Math.min(100, p + 5));
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="slider"
      aria-valuenow={Math.round(sliderPosition)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Deslizador comparativo de antes y después"
      className="relative w-full h-[300px] sm:h-[420px] lg:h-full min-h-[300px] overflow-hidden select-none cursor-ew-resize bg-stone-900 focus:outline focus:outline-2 focus:outline-primary touch-pan-y"
    >
      <img src={after} alt="Estado después de la reforma" loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />

      <div
        className="absolute inset-y-0 left-0 w-full overflow-hidden pointer-events-none"
        style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
      >
        <img src={before} alt="Estado antes de la reforma" loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
      </div>

      <div
        className="absolute inset-y-0 w-[2px] bg-white pointer-events-none flex items-center justify-center shadow"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center shadow-lg font-bold text-xs select-none">
          ↔
        </div>
      </div>

      <span className="absolute bottom-4 left-4 bg-stone-900/80 backdrop-blur-sm px-3 py-1 rounded-lg text-[10px] font-bold uppercase text-white tracking-wider z-10">Antes</span>
      <span className="absolute bottom-4 right-4 bg-primary text-white px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider z-10">Después</span>
    </div>
  );
};

const projects = [
  { 
    id: 1,
    title: 'Ático con Vistas al Castillo', 
    category: 'Reforma Integral · 120 m²', 
    location: 'Sagunto (Centro Histórico)', 
    year: '2025',
    image: livingImg,
    gallery: [livingImg, livingV2],
    description: 'Transformación completa de un ático de 120 m² integrando materiales nobles, aislamiento termo-acústico bajo normativa CTE y carpintería a medida.',
    details: [
      'Suelo radiante con pavimento continuo y roble natural.',
      'Aislamiento acústico y térmico de alta eficiencia energética.',
      'Mobiliario integrado a medida en salón, cocina y estudio.'
    ]
  },
  { 
    id: 2,
    title: 'Cocina Abierta Mediterránea', 
    category: 'Reforma de Cocina · 22 m²', 
    location: 'Puerto de Sagunto (Zona Playa)', 
    year: '2025',
    image: kitchenImg,
    gallery: [kitchenImg, kitchenV2],
    description: 'Apertura de cocina al salón mediante apeo estructural e isla central en piedra sinterizada de alta resistencia.',
    details: [
      'Encimera e isla en piedra sinterizada Dekton.',
      'Renovación integral de fontanería y cuadro eléctrico.',
      'Iluminación técnica arquitectónica regulable.'
    ]
  },
  { 
    id: 4,
    title: 'Baño Suite Piedra Caliza', 
    category: 'Reforma de Baño · 9 m²', 
    location: 'Gilet (Camp de Morvedre)', 
    year: '2026',
    image: bathroomImg,
    gallery: [bathroomImg],
    description: 'Reforma completa de baño principal con porcelánico rectificado de gran formato, grifería empotrada e impermeabilización integral.',
    details: [
      'Porcelánico rectificado de gran formato efecto piedra natural.',
      'Grifería empotrada termostática y hornacina retroiluminada.',
      'Plato de ducha de obra enrasado con drenaje lineal oculto.'
    ]
  }
];

const Portfolio = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [hoveredGallery, setHoveredGallery] = useState({});
  const [modalMode, setModalMode] = useState('slider');

  useEffect(() => {
    if (!selectedProject) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedProject(null);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedProject]);

  const openProject = (project) => {
    setSelectedProject(project);
    setActiveImageIdx(0);
    setModalMode('slider');
  };

  return (
    <section
      id="portfolio"
      aria-labelledby="portfolio-heading"
      className={cn("bg-white border-y border-stone-200/80 py-20 md:py-28 overflow-hidden w-full relative transition-all", selectedProject ? "z-[9999]" : "z-10")}
    >
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-3 max-w-2xl">
            <span className="text-xs font-extrabold tracking-widest uppercase text-primary block">
              Obras Ejecutadas · Casos Reales
            </span>
            <h2
              id="portfolio-heading"
              className="text-3xl sm:text-5xl font-outfit font-extrabold tracking-tight text-stone-900"
            >
              Proyectos entregados en <span className="text-primary">Sagunto, Puerto y Valencia.</span>
            </h2>
          </div>
          <p className="text-stone-600 max-w-sm text-sm leading-relaxed">
            Desde pisos junto a la playa en Puerto de Sagunto y Canet hasta rehabilitaciones en el Centro Histórico y viviendas en Gilet.
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
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: idx * 0.12, duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                className="group relative flex flex-col bg-[#F7F5F0]/60 rounded-2xl border border-stone-200/90 overflow-hidden cursor-pointer hover:border-primary/40 hover:bg-white hover:shadow-xl hover:shadow-stone-900/5 transition-all duration-300"
                onClick={() => openProject(project)}
              >
                <div className="relative h-[280px] overflow-hidden bg-stone-200">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={previewIdx}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.35 }}
                      src={project.gallery[previewIdx]}
                      alt={`${project.title} — ${project.category} en ${project.location}`}
                      loading="lazy"
                      decoding="async"
                      width={600}
                      height={280}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </AnimatePresence>

                  {project.gallery.length > 1 && (
                    <div className="absolute top-3.5 right-3.5 bg-stone-900/75 backdrop-blur-md rounded-lg px-2.5 py-1 flex items-center gap-1.5">
                      <Images className="w-3 h-3 text-white" aria-hidden="true" />
                      <span className="text-[10px] font-bold text-white">{project.gallery.length} vistas</span>
                    </div>
                  )}

                  <div className="absolute top-3.5 left-3.5 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1 shadow-sm">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary-dark">{project.category}</span>
                  </div>
                </div>

                {project.gallery.length > 1 && (
                  <div
                    className="flex gap-1.5 px-2 pt-2 bg-stone-100/80"
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
                          "flex-1 h-11 rounded-md overflow-hidden border-2 transition-all duration-200",
                          previewIdx === i ? "border-primary opacity-100" : "border-transparent opacity-55 hover:opacity-85"
                        )}
                      >
                        <img src={img} alt="" aria-hidden="true" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                <div className="p-6 flex flex-col gap-3 flex-1">
                  <div>
                    <h3 className="text-lg font-bold text-stone-900 leading-snug">
                      {project.title}
                    </h3>
                    <p className="text-xs text-stone-500 font-medium mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-primary shrink-0" aria-hidden="true" />
                      {project.location} · {project.year}
                    </p>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed line-clamp-2">{project.description}</p>

                  <button
                    type="button"
                    aria-expanded={selectedProject?.id === project.id}
                    aria-haspopup="dialog"
                    className="mt-auto flex items-center justify-between w-full rounded-xl bg-white border border-stone-200/90 group-hover:border-primary/40 px-4 py-3 transition-all"
                    onClick={e => { e.stopPropagation(); openProject(project); }}
                  >
                    <span className="text-xs font-bold text-stone-800 group-hover:text-primary transition-colors">
                      Ver memoria y comparativa
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
              className="fixed inset-0 z-[9999] flex justify-center items-start sm:items-center p-4 sm:p-10 overflow-y-auto bg-stone-900/75 backdrop-blur-md"
              onClick={() => setSelectedProject(null)}
            >
              <button
                type="button"
                aria-label="Cerrar detalle del proyecto"
                onClick={() => setSelectedProject(null)}
                className="fixed top-4 right-4 z-[10000] w-11 h-11 bg-white border border-stone-200 rounded-full flex items-center justify-center text-stone-800 hover:bg-primary hover:text-white transition-all shadow-lg"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>

              <motion.div
                initial={{ y: 24, opacity: 0, scale: 0.98 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 16, opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.35 }}
                className="relative w-full max-w-5xl flex flex-col lg:flex-row bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-full lg:w-3/5 flex flex-col h-[300px] sm:h-[420px] lg:h-auto border-b lg:border-b-0 lg:border-r border-stone-200 bg-stone-900 shrink-0">
                  {selectedProject.gallery.length > 1 && (
                    <div className="flex bg-stone-100 border-b border-stone-200 p-2 gap-2 justify-center z-10 shrink-0">
                      <button
                        onClick={() => setModalMode('slider')}
                        className={cn(
                          "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                          modalMode === 'slider'
                            ? "bg-primary text-white"
                            : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/60"
                        )}
                      >
                        Antes / Después
                      </button>
                      <button
                        onClick={() => setModalMode('gallery')}
                        className={cn(
                          "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                          modalMode === 'gallery'
                            ? "bg-primary text-white"
                            : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/60"
                        )}
                      >
                        Galería
                      </button>
                    </div>
                  )}

                  <div className="relative flex-1 min-h-[300px] sm:min-h-[360px] overflow-hidden flex flex-col">
                    {modalMode === 'slider' && selectedProject.gallery.length > 1 ? (
                      <BeforeAfterSlider before={selectedProject.gallery[1]} after={selectedProject.gallery[0]} />
                    ) : (
                      <div className="relative flex-1 bg-stone-900 overflow-hidden flex flex-col justify-between">
                        <div className="relative flex-1 min-h-[300px] overflow-hidden">
                          <img
                            src={selectedProject.gallery[activeImageIdx]}
                            alt={`${selectedProject.title}, foto ${activeImageIdx + 1}`}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          {selectedProject.gallery.length > 1 && (
                            <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 pointer-events-none z-10">
                              <button
                                type="button"
                                aria-label="Foto anterior"
                                onClick={e => { e.stopPropagation(); setActiveImageIdx(p => p === 0 ? selectedProject.gallery.length - 1 : p - 1); }}
                                className="w-10 h-10 rounded-full bg-white/90 text-stone-900 flex items-center justify-center pointer-events-auto hover:bg-primary hover:text-white transition-all shadow"
                              >
                                <ChevronLeft className="w-5 h-5" aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                aria-label="Foto siguiente"
                                onClick={e => { e.stopPropagation(); setActiveImageIdx(p => p === selectedProject.gallery.length - 1 ? 0 : p + 1); }}
                                className="w-10 h-10 rounded-full bg-white/90 text-stone-900 flex items-center justify-center pointer-events-auto hover:bg-primary hover:text-white transition-all shadow"
                              >
                                <ChevronRight className="w-5 h-5" aria-hidden="true" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 p-7 sm:p-9 flex flex-col justify-between gap-6">
                  <div className="space-y-5">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-primary">{selectedProject.category}</span>
                      <h2 className="text-2xl sm:text-3xl font-outfit font-extrabold text-stone-900 mt-1 leading-tight">
                        {selectedProject.title}
                      </h2>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pb-5 border-b border-stone-200">
                      <div className="flex items-center gap-2">
                        <MapPin className="text-primary w-4 h-4 shrink-0" aria-hidden="true" />
                        <p className="text-xs font-semibold text-stone-700">{selectedProject.location}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="text-primary w-4 h-4 shrink-0" aria-hidden="true" />
                        <p className="text-xs font-semibold text-stone-700">Año {selectedProject.year}</p>
                      </div>
                    </div>

                    <p className="text-stone-600 leading-relaxed text-sm">{selectedProject.description}</p>

                    <ul className="space-y-2.5" aria-label="Detalles técnicos del proyecto">
                      {selectedProject.details.map((detail, k) => (
                        <li key={k} className="flex gap-3 items-start">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 shrink-0" aria-hidden="true" />
                          <p className="text-xs text-stone-700 leading-relaxed font-medium">{detail}</p>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    className="w-full py-4 text-xs font-bold rounded-xl"
                    onClick={() => {
                      setSelectedProject(null);
                      document.getElementById('calculadora')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Calcular un proyecto similar <ArrowRight className="ml-2 w-4 h-4" aria-hidden="true" />
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

