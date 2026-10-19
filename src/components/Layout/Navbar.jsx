import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  Calculator as CalcIcon,
  Compass,
  Building2,
  FolderKanban,
  Star,
  HelpCircle,
  ChevronRight,
  MessageCircle,
  Phone,
  Sparkles,
  Layers,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_ITEMS = [
  {
    code: '01',
    label: 'Fases 3D',
    mobileTitle: 'Del Plano a la Realidad (3D)',
    mobileSub: 'Secuencia interactiva de las 5 fases de obra',
    href: '#inicio-3d',
    icon: Layers,
  },
  {
    code: '02',
    label: 'Método',
    mobileTitle: 'Método de Trabajo',
    mobileSub: 'De la estimación online al contrato cerrado',
    href: '#servicios',
    icon: Compass,
  },
  {
    code: '03',
    label: 'Estudio',
    mobileTitle: 'Estudio Técnico Conscugar',
    mobileSub: '+15 años de experiencia en Sagunto y Valencia',
    href: '#nosotros',
    icon: Building2,
  },
  {
    code: '04',
    label: 'Proyectos',
    mobileTitle: 'Obras Reales Entregadas',
    mobileSub: 'Comparativas Antes / Después y memorias',
    href: '#portfolio',
    icon: FolderKanban,
  },
  {
    code: '05',
    label: 'Opiniones',
    mobileTitle: 'Reseñas de Clientes',
    mobileSub: 'Valoración media 4.9/5 en Camp de Morvedre',
    href: '#testimonios',
    icon: Star,
  },
  {
    code: '06',
    label: 'FAQ',
    mobileTitle: 'Preguntas Frecuentes',
    mobileSub: 'Dudas sobre IVA (21%), licencias ICIO y plazos',
    href: '#faq',
    icon: HelpCircle,
  },
];

const Navbar = ({ phone = '34600000000' }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('#inicio-3d');
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setIsScrolled(y > 16);

      if (pathname !== '/') return;
      if (y < window.innerHeight * 2.2) {
        setActiveSection('#inicio-3d');
        return;
      }

      const sectionIds = ['servicios', 'nosotros', 'portfolio', 'testimonios', 'faq'];
      let current = '#inicio-3d';
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 180) {
            current = `#${id}`;
          }
        }
      }
      setActiveSection(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  // Bloquear el scroll del body cuando el menú móvil está abierto
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const smoothScrollToElement = useCallback((targetId) => {
    if (targetId === '#inicio-3d') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const id = targetId.replace(/^#/, '');
    const el = document.getElementById(id);
    if (!el) return;

    const headerOffset = 76;
    const targetY = el.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
  }, []);

  const handleNavClick = (e, href) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);

    if (pathname !== '/') {
      navigate(`/${href}`);
      return;
    }
    // Pequeña pausa si venía del menú móvil para permitir desbloquear body overflow
    setTimeout(() => {
      smoothScrollToElement(href);
    }, 60);
  };

  const handleCalculatorScroll = () => {
    setIsMobileMenuOpen(false);
    if (pathname !== '/') {
      navigate('/#calculadora');
      return;
    }
    setTimeout(() => {
      smoothScrollToElement('#calculadora');
    }, 60);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-6 pt-2 sm:pt-3 pointer-events-none">
        <nav
          aria-label="Navegación principal"
          className={`pointer-events-auto max-w-7xl mx-auto rounded-2xl transition-all duration-300 border ${
            isScrolled || isMobileMenuOpen
              ? 'bg-white/95 backdrop-blur-2xl border-stone-200/95 shadow-[0_12px_36px_-10px_rgba(28,25,23,0.10)]'
              : 'bg-white/85 backdrop-blur-xl border-stone-200/80 shadow-sm'
          }`}
        >
          <div className="px-3.5 sm:px-5 h-14 sm:h-16 flex items-center justify-between gap-2">
            
            {/* 1. IDENTIDAD DE MARCA (Monograma Arquitectónico + Logotipo) */}
            <Link
              to="/"
              onClick={() => {
                setIsMobileMenuOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2.5 group shrink-0"
              aria-label="Conscugar — Volver al inicio"
            >
              <div className="flex flex-col">
                <span className="text-base sm:text-xl font-outfit font-extrabold tracking-tight text-stone-900 leading-none">
                  CONS<span className="text-primary">CUGAR</span>
                </span>
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-stone-500 mt-0.5">
                  Sagunto · Valencia
                </span>
              </div>
            </Link>

            {/* 2. NAVEGACIÓN CENTRAL EN ESCRITORIO (Píldora arquitectónica con indicador activo) */}
            <div className="hidden lg:flex items-center gap-1 bg-[#F7F5F0] border border-stone-200/90 rounded-full p-1">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === '/' && activeSection === item.href;
                return (
                  <a
                    key={item.code}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-stone-900 text-white shadow-sm'
                        : 'text-stone-700 hover:text-stone-950 hover:bg-white hover:shadow-sm'
                    }`}
                  >
                    <span className={`text-[10px] font-mono ${isActive ? 'text-orange-400' : 'text-stone-400'}`}>
                      {item.code}
                    </span>
                    <span>{item.label}</span>
                  </a>
                );
              })}
            </div>

            {/* 3. ACCIONES DERECHA (CTA + Botón Menú Móvil de alto contraste) */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCalculatorScroll}
                className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold shadow-sm transition-all active:scale-95"
              >
                <CalcIcon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span className="hidden sm:inline">Calcular Presupuesto</span>
                <span className="sm:hidden">Calcular</span>
              </button>

              <button
                type="button"
                aria-label={isMobileMenuOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-nav-drawer"
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                className={`lg:hidden inline-flex items-center gap-1.5 px-3 h-9 sm:h-10 rounded-xl font-bold text-xs border transition-all ${
                  isMobileMenuOpen
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-[#F7F5F0] text-stone-900 border-stone-300/90 hover:bg-stone-200/70'
                }`}
              >
                {isMobileMenuOpen ? (
                  <>
                    <X className="w-4 h-4" aria-hidden="true" />
                    <span>Cerrar</span>
                  </>
                ) : (
                  <>
                    <Menu className="w-4 h-4" aria-hidden="true" />
                    <span>Menú</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </nav>
      </header>

      {/* 4. DRAWER MÓVIL DE ESTUDIO ARQUITECTÓNICO (Con fondo desenfocado, tarjetas numeradas y contacto directo) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div
            id="mobile-nav-drawer"
            className="fixed inset-0 z-40 lg:hidden flex flex-col pt-[72px] px-3 pb-4"
          >
            {/* Backdrop oscuro con desenfoque */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-stone-950/45 backdrop-blur-sm"
              aria-hidden="true"
            />

            {/* Panel Flotante Móvil */}
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 w-full max-w-lg mx-auto bg-white rounded-3xl border border-stone-200 shadow-[0_24px_60px_rgba(0,0,0,0.22)] overflow-y-auto max-h-[calc(100dvh-88px)] p-4 sm:p-5 flex flex-col justify-between gap-4"
            >
              {/* Lista de Secciones Numeradas */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-stone-400 px-2 pb-1">
                  Navegación del Estudio
                </p>

                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === '/' && activeSection === item.href;
                  return (
                    <a
                      key={item.code}
                      href={item.href}
                      onClick={(e) => handleNavClick(e, item.href)}
                      className={`group flex items-center gap-3.5 p-3 rounded-2xl border transition-all ${
                        isActive
                          ? 'bg-orange-50/90 border-primary/40 shadow-sm'
                          : 'bg-[#F7F5F0]/70 hover:bg-orange-50/70 border-stone-200/80 hover:border-primary/40'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-colors shrink-0 shadow-sm ${
                          isActive
                            ? 'bg-primary border-primary text-white'
                            : 'bg-white border-stone-200/90 text-primary group-hover:bg-primary group-hover:text-white'
                        }`}
                      >
                        <Icon className="w-4 h-4" aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono font-extrabold text-primary">
                            {item.code}
                          </span>
                          <span className="text-xs sm:text-sm font-extrabold text-stone-900 truncate">
                            {item.mobileTitle}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 truncate mt-0.5">
                          {item.mobileSub}
                        </p>
                      </div>
                      <ChevronRight
                        className="w-4 h-4 text-stone-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0"
                        aria-hidden="true"
                      />
                    </a>
                  );
                })}
              </div>

              {/* Pie del Menú Móvil: CTA Principal + Contacto Rápido */}
              <div className="pt-3 border-t border-stone-200/90 space-y-2.5">
                <button
                  type="button"
                  onClick={handleCalculatorScroll}
                  className="w-full py-3.5 px-4 rounded-2xl bg-primary hover:bg-primary-dark text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all"
                >
                  <Sparkles className="w-4 h-4" aria-hidden="true" />
                  <span>Calcular Presupuesto Online en 60s</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`https://wa.me/${phone}?text=${encodeURIComponent('Hola Conscugar, me gustaría consultar un presupuesto de reforma.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-current shrink-0" aria-hidden="true" />
                    <span>WhatsApp</span>
                  </a>
                  <a
                    href={`tel:+${phone}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-stone-100 border border-stone-200 text-stone-800 text-xs font-bold hover:bg-stone-200 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>Llamar ahora</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
