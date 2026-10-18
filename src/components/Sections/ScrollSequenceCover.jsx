import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowDown,
  Calculator as CalcIcon,
  Sparkles,
  Play,
  Pause,
} from 'lucide-react';
import frame1Plano from '../../assets/sequence/frame-1-plano.webp';
import frame2Ladrillos from '../../assets/sequence/frame-2-ladrillos.webp';
import frame3Pladur from '../../assets/sequence/frame-3-pladur.webp';
import frame4Muebles from '../../assets/sequence/frame-4-muebles.webp';
import frame5Iluminacion from '../../assets/sequence/frame-5-iluminacion.webp';

const SEQUENCE_FRAMES = [
  {
    id: 1,
    code: '01',
    stepBadge: 'PASO 1 DE 5 · PROYECTO Y PRESUPUESTO CERRADO',
    shortLabel: 'Plano',
    title: 'Tu reforma empieza sobre un plano claro y sin dudas.',
    subtitle:
      'Medimos tu vivienda en Sagunto o Valencia, diseñamos la nueva distribución y fijamos el precio y la fecha de entrega por contrato antes de empezar.',
    image: frame1Plano,
    alt: 'Fase 1 de reforma Conscugar: Plano arquitectónico 3D sobre espacio vacío',
  },
  {
    id: 2,
    code: '02',
    stepBadge: 'PASO 2 DE 5 · ESTRUCTURA Y DISTRIBUCIÓN',
    shortLabel: 'Estructura',
    title: 'Del plano nacen los nuevos espacios de tu casa.',
    subtitle:
      'Ejecutamos derribos y levantamos la nueva distribución con nuestro propio equipo de obra, ganando amplitud y luz natural en cada estancia.',
    image: frame2Ladrillos,
    alt: 'Fase 2 de reforma Conscugar: Levantamiento de estructura de ladrillos sobre el plano',
  },
  {
    id: 3,
    code: '03',
    stepBadge: 'PASO 3 DE 5 · INSTALACIONES, PAREDES Y SUELOS',
    shortLabel: 'Obra y Pintura',
    title: 'Renovamos todo lo que se ve y lo que no se ve.',
    subtitle:
      'Fontanería, electricidad, climatización, pladur, suelos y pintura completamente nuevos para tu tranquilidad durante décadas.',
    image: frame3Pladur,
    alt: 'Fase 3 de reforma Conscugar: Pladur, instalaciones nuevas, suelos y pintura',
  },
  {
    id: 4,
    code: '04',
    stepBadge: 'PASO 4 DE 5 · COCINA, BAÑOS Y CARPINTERÍA',
    shortLabel: 'Mobiliario',
    title: 'Equipamos tu cocina, baños y carpintería al detalle.',
    subtitle:
      'Coordinamos todos los oficios para dejar montados tus muebles de cocina, sanitarios, puertas y armarios sin que tengas que gestionar gremios.',
    image: frame4Muebles,
    alt: 'Fase 4 de reforma Conscugar: Colocación de mobiliario de cocina, baño y salón',
  },
  {
    id: 5,
    code: '05',
    stepBadge: 'PASO 5 DE 5 · ENTREGA LLAVE EN MANO',
    shortLabel: 'Reforma Lista',
    title: 'Tu hogar terminado, iluminado y listo para entrar a vivir.',
    subtitle:
      'Entregamos tu obra limpia, en el plazo acordado y sin desviaciones de presupuesto. Calcula ahora cuánto cuesta tu proyecto en 60 segundos.',
    image: frame5Iluminacion,
    alt: 'Fase 5 de reforma Conscugar: Reforma terminada con iluminación cálida',
  },
];

// Curva sinusoidal pura para fundido entre fotogramas 3D
const smoothCosine = (t) => {
  const clamped = Math.min(Math.max(t, 0), 1);
  return 0.5 - 0.5 * Math.cos(Math.PI * clamped);
};

// Transición limpia y sedosa para el texto superior
const contentFadeVariants = {
  initial: { opacity: 0, y: 10, filter: 'blur(3px)' },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -8,
    filter: 'blur(2px)',
    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] },
  },
};

export const ScrollSequenceCover = () => {
  const sectionRef = useRef(null);
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const lastFrameTimeRef = useRef(performance.now());
  const rafLoopRef = useRef(null);
  const customScrollRafRef = useRef(null);
  const isAutoPlayingRef = useRef(true);

  const [smoothProgress, setSmoothProgress] = useState(0);
  // Fundido directo de Fase 5 -> Fase 1 al reiniciar el bucle para no rebobinar hacia atrás
  const [loopFadeOut, setLoopFadeOut] = useState(0);
  // Se inicia automáticamente en bucle infinito al entrar si no haces scroll
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    isAutoPlayingRef.current = isAutoPlaying;
  }, [isAutoPlaying]);

  // Pre-decodificar las 5 imágenes en GPU desde el arranque
  useEffect(() => {
    SEQUENCE_FRAMES.forEach((frame) => {
      const img = new Image();
      img.decoding = 'async';
      img.src = frame.image;
    });
  }, []);

  // Motor de amortiguación exponencial ultra-suave
  const startLerpLoop = useCallback(() => {
    if (rafLoopRef.current !== null) return;
    lastFrameTimeRef.current = performance.now();

    const tick = (now) => {
      const dt = Math.min((now - lastFrameTimeRef.current) / 1000, 0.05);
      lastFrameTimeRef.current = now;

      const target = targetProgressRef.current;
      const current = currentProgressRef.current;
      const diff = target - current;

      if (Math.abs(diff) > 0.0002) {
        const alpha = 1 - Math.exp(-dt * 4.8);
        const next = current + diff * alpha;
        currentProgressRef.current = next;
        setSmoothProgress(next);
        rafLoopRef.current = window.requestAnimationFrame(tick);
      } else {
        currentProgressRef.current = target;
        setSmoothProgress(target);
        rafLoopRef.current = null;
      }
    };

    rafLoopRef.current = window.requestAnimationFrame(tick);
  }, []);

  // Sincronización con el scroll real del usuario
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let resumeTimeout = null;

    const handleScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const scrollable = el.offsetHeight - window.innerHeight;
      if (scrollable <= 0) return;

      const currentY = window.scrollY;
      const scrolledDelta = Math.abs(currentY - lastScrollY);
      lastScrollY = currentY;

      // Si el usuario hace scroll real, pasamos inmediatamente al modo scroll manual
      if (isAutoPlayingRef.current && scrolledDelta > 2) {
        isAutoPlayingRef.current = false;
        setIsAutoPlaying(false);
        setLoopFadeOut(0);
      }

      if (!isAutoPlayingRef.current) {
        const raw = Math.min(Math.max(-rect.top / scrollable, 0), 1);
        targetProgressRef.current = raw;
        startLerpLoop();

        // Si el usuario vuelve arriba del todo y deja de hacer scroll, reanuda el bucle automático
        if (resumeTimeout) clearTimeout(resumeTimeout);
        if (currentY <= 8) {
          resumeTimeout = setTimeout(() => {
            if (window.scrollY <= 8) {
              isAutoPlayingRef.current = true;
              setIsAutoPlaying(true);
            }
          }, 1400);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      if (resumeTimeout) clearTimeout(resumeTimeout);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (rafLoopRef.current !== null) {
        window.cancelAnimationFrame(rafLoopRef.current);
        rafLoopRef.current = null;
      }
      if (customScrollRafRef.current !== null) {
        window.cancelAnimationFrame(customScrollRafRef.current);
      }
    };
  }, [startLerpLoop]);

  // Modo Auto-Play en BUCLE INFINITO (01 -> 02 -> 03 -> 04 -> 05 -> fundido suave a 01 -> ...)
  useEffect(() => {
    if (!isAutoPlaying) {
      setLoopFadeOut(0);
      return;
    }

    let autoRaf = null;
    let lastTime = performance.now();
    // Estados del bucle: 'playing' (0 -> 1), 'holding_end' (pausa en fase 5), 'crossfading' (fundido directo 5 -> 1), 'holding_start' (pausa breve en fase 1)
    let phaseState = 'playing';
    let timer = 0;

    const cycleDurationSec = 10.5;
    const holdEndSec = 2.0;
    const crossfadeToStartSec = 0.85;
    const holdStartSec = 0.9;

    const stepAuto = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      if (phaseState === 'playing') {
        const nextTarget = Math.min(1, targetProgressRef.current + dt / cycleDurationSec);
        targetProgressRef.current = nextTarget;
        startLerpLoop();

        if (nextTarget >= 1 && currentProgressRef.current >= 0.992) {
          phaseState = 'holding_end';
          timer = 0;
        }
      } else if (phaseState === 'holding_end') {
        timer += dt;
        if (timer >= holdEndSec) {
          phaseState = 'crossfading';
          timer = 0;
        }
      } else if (phaseState === 'crossfading') {
        timer += dt;
        const mix = Math.min(1, timer / crossfadeToStartSec);
        setLoopFadeOut(smoothCosine(mix));

        if (mix >= 1) {
          // Reinicio limpio en Fase 1 sin rebobinar por las fases intermedias
          if (rafLoopRef.current !== null) {
            window.cancelAnimationFrame(rafLoopRef.current);
            rafLoopRef.current = null;
          }
          targetProgressRef.current = 0;
          currentProgressRef.current = 0;
          setSmoothProgress(0);
          setLoopFadeOut(0);
          phaseState = 'holding_start';
          timer = 0;
        }
      } else if (phaseState === 'holding_start') {
        timer += dt;
        if (timer >= holdStartSec) {
          phaseState = 'playing';
          timer = 0;
        }
      }

      autoRaf = window.requestAnimationFrame(stepAuto);
    };

    autoRaf = window.requestAnimationFrame(stepAuto);

    // En cuanto el usuario gira la rueda o desliza el dedo para hacer scroll, toma el control el scroll normal
    const stopOnUserScrollIntent = () => {
      if (!isAutoPlayingRef.current) return;
      isAutoPlayingRef.current = false;
      setIsAutoPlaying(false);
      setLoopFadeOut(0);

      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const scrollable = el.offsetHeight - window.innerHeight;
      if (scrollable > 0) {
        const raw = Math.min(Math.max(-rect.top / scrollable, 0), 1);
        targetProgressRef.current = raw;
        startLerpLoop();
      }
    };

    window.addEventListener('wheel', stopOnUserScrollIntent, { passive: true });
    window.addEventListener('touchmove', stopOnUserScrollIntent, { passive: true });

    return () => {
      if (autoRaf) window.cancelAnimationFrame(autoRaf);
      window.removeEventListener('wheel', stopOnUserScrollIntent);
      window.removeEventListener('touchmove', stopOnUserScrollIntent);
    };
  }, [isAutoPlaying, startLerpLoop]);

  // Desplazamiento programático sedoso con curva easeInOutQuart
  const smoothScrollWindowTo = useCallback((targetY, durationMs = 880) => {
    if (customScrollRafRef.current !== null) {
      window.cancelAnimationFrame(customScrollRafRef.current);
    }
    const startY = window.scrollY;
    const distance = targetY - startY;
    if (Math.abs(distance) < 2) return;

    const startTime = performance.now();
    const easeInOutQuart = (t) =>
      t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;

    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      const eased = easeInOutQuart(progress);
      window.scrollTo(0, startY + distance * eased);

      if (progress < 1) {
        customScrollRafRef.current = window.requestAnimationFrame(step);
      } else {
        customScrollRafRef.current = null;
      }
    };

    customScrollRafRef.current = window.requestAnimationFrame(step);
  }, []);

  const jumpToPhase = (index) => {
    isAutoPlayingRef.current = false;
    setIsAutoPlaying(false);
    setLoopFadeOut(0);
    const el = sectionRef.current;
    if (!el) return;
    const scrollable = el.offsetHeight - window.innerHeight;
    const ratio = index / (SEQUENCE_FRAMES.length - 1);
    targetProgressRef.current = ratio;
    startLerpLoop();
    smoothScrollWindowTo(el.offsetTop + scrollable * ratio, 880);
  };

  const handleScrollToCalculator = (e) => {
    e.preventDefault();
    isAutoPlayingRef.current = false;
    setIsAutoPlaying(false);
    setLoopFadeOut(0);
    const calcEl = document.getElementById('calculadora');
    if (calcEl) {
      const top = calcEl.getBoundingClientRect().top + window.scrollY - 88;
      smoothScrollWindowTo(top, 950);
    }
  };

  const toggleAutoPlay = () => {
    setLoopFadeOut(0);
    if (!isAutoPlaying && smoothProgress >= 0.96) {
      targetProgressRef.current = 0;
      currentProgressRef.current = 0;
      setSmoothProgress(0);
    }
    setIsAutoPlaying((prev) => !prev);
  };

  // Posición continua en la secuencia: 0.000 -> 4.000
  const totalTransitions = SEQUENCE_FRAMES.length - 1;
  const effectiveProgress = smoothProgress * (1 - loopFadeOut);
  const floatFrame = effectiveProgress * totalTransitions;
  const activeIndex =
    loopFadeOut > 0.5
      ? 0
      : Math.min(SEQUENCE_FRAMES.length - 1, Math.round(floatFrame));
  const currentFrame = SEQUENCE_FRAMES[activeIndex];

  // Cámara suave tipo Apple con más protagonismo para la maqueta
  const stageScale = 0.96 + effectiveProgress * 0.06;
  const stageTranslateY = (0.5 - effectiveProgress) * 6;
  const warmGlowOpacity = smoothCosine((effectiveProgress - 0.65) / 0.35);

  return (
    <section
      ref={sectionRef}
      aria-label="Evolución de tu reforma paso a paso"
      className="relative h-[400vh] bg-[#F2EFE9] select-none"
    >
      {/* VIEWPORT STICKY LIMPIO Y CENTRADO */}
      <div className="sticky top-0 h-screen supports-[height:100dvh]:h-[100dvh] w-full overflow-hidden flex flex-col justify-between pt-[74px] sm:pt-24 pb-4 sm:pb-7 px-4 sm:px-8">
        
        {/* Iluminación de estudio reactiva */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 50% 54%, rgba(255,255,255,0.82) 0%, rgba(242,239,233,0.96) 58%, #F2EFE9 100%)',
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            opacity: warmGlowOpacity * 0.85,
            background:
              'radial-gradient(circle at 50% 54%, rgba(234, 88, 12, 0.15) 0%, rgba(251, 191, 36, 0.08) 40%, transparent 72%)',
          }}
        />

        {/* 1. CABECERA CLARA Y ORIENTADA AL CLIENTE */}
        <div className="relative z-20 max-w-3xl mx-auto w-full text-center pt-1 shrink-0 min-h-[104px] sm:min-h-[132px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentFrame.id}
              variants={contentFadeVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-2 w-full"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/95 border border-stone-300/80 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-primary" aria-hidden="true" />
                <span className="text-[10px] sm:text-[11px] font-mono font-extrabold tracking-wider uppercase text-stone-800">
                  {currentFrame.stepBadge}
                </span>
              </div>

              <h2 className="text-2xl sm:text-4xl lg:text-[2.75rem] font-outfit font-extrabold tracking-tight text-stone-950 leading-[1.12] px-1">
                {currentFrame.title}
              </h2>

              <p className="text-xs sm:text-sm lg:text-base text-stone-600 max-w-2xl mx-auto leading-relaxed font-medium px-2">
                {currentFrame.subtitle}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 2. ESCENARIO 3D PROTAGONISTA */}
        <div className="relative z-10 flex-1 min-h-0 flex items-center justify-center w-full max-w-5xl mx-auto my-auto">
          <div
            className="relative w-full max-w-[900px] aspect-[16/9] max-h-[46vh] sm:max-h-[54vh] lg:max-h-[58vh] flex items-center justify-center will-change-transform"
            style={{
              transform: `translate3d(0, ${stageTranslateY}px, 0) scale(${stageScale})`,
            }}
          >
            {/* Sombra de contacto dinámica en el suelo */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-[16%] bottom-[5%] h-[18%] rounded-full blur-3xl"
              style={{
                background:
                  warmGlowOpacity > 0.2
                    ? 'radial-gradient(ellipse at center, rgba(154,52,18,0.22) 0%, rgba(28,25,23,0.18) 55%, transparent 80%)'
                    : 'radial-gradient(ellipse at center, rgba(28,25,23,0.18) 0%, rgba(28,25,23,0.06) 60%, transparent 85%)',
                opacity: 0.55 + effectiveProgress * 0.45,
              }}
            />

            {/* Apilamiento acumulativo de las 5 imágenes con cierre de bucle limpio */}
            <div
              className="relative w-full h-full"
              style={{
                WebkitMaskImage:
                  'radial-gradient(ellipse 68% 66% at 50% 51%, #000 68%, rgba(0,0,0,0.85) 80%, transparent 98%)',
                maskImage:
                  'radial-gradient(ellipse 68% 66% at 50% 51%, #000 68%, rgba(0,0,0,0.85) 80%, transparent 98%)',
              }}
            >
              {SEQUENCE_FRAMES.map((frame, index) => {
                const rawLayerProgress =
                  index === 0
                    ? 1
                    : Math.min(Math.max(smoothProgress * totalTransitions - (index - 1), 0), 1);
                // Al reiniciar el bucle, las capas superiores (2..5) se funden suavemente sobre el Plano base (1) sin rebobinar
                const baseOpacity = index === 0 ? 1 : smoothCosine(rawLayerProgress);
                const layerOpacity = index === 0 ? 1 : baseOpacity * (1 - loopFadeOut);

                return (
                  <img
                    key={frame.id}
                    src={frame.image}
                    alt={frame.alt}
                    width={1376}
                    height={768}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    fetchPriority={index === 0 ? 'high' : 'auto'}
                    decoding="async"
                    style={{
                      opacity: layerOpacity,
                      zIndex: index + 1,
                    }}
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none will-change-[opacity]"
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. DOCK FLOTANTE INFERIOR ESTILO APPLE */}
        <div className="relative z-30 max-w-4xl mx-auto w-full flex justify-center shrink-0">
          <div className="w-full sm:w-auto max-w-full inline-flex items-center justify-between sm:justify-center gap-1 sm:gap-2 p-1.5 sm:p-2 rounded-full bg-stone-950/95 backdrop-blur-2xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.25)] text-white">
            
            <button
              type="button"
              onClick={toggleAutoPlay}
              aria-label={isAutoPlaying ? 'Pausar animación en bucle' : 'Reproducir animación en bucle'}
              className="inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0"
              title={isAutoPlaying ? 'Pausar bucle automático' : 'Reproducir en bucle'}
            >
              {isAutoPlaying ? (
                <Pause className="w-3.5 h-3.5 fill-current" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              )}
            </button>

            <div className="flex items-center gap-0.5 sm:gap-1.5">
              {SEQUENCE_FRAMES.map((frame, index) => {
                const segStart = index / SEQUENCE_FRAMES.length;
                const segEnd = (index + 1) / SEQUENCE_FRAMES.length;
                const segProgress = Math.min(
                  Math.max((effectiveProgress - segStart) / (segEnd - segStart), 0),
                  1
                );
                const isSelected = index === activeIndex;

                return (
                  <button
                    key={frame.id}
                    type="button"
                    onClick={() => jumpToPhase(index)}
                    className={`relative overflow-hidden px-2.5 sm:px-3.5 py-1.5 rounded-full text-[11px] font-semibold transition-all duration-300 ${
                      isSelected
                        ? 'bg-white text-stone-950 shadow-sm'
                        : 'text-stone-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span className="relative z-10 flex items-center gap-1.5">
                      <span
                        className={`font-mono text-[10px] font-extrabold ${
                          isSelected ? 'text-primary' : 'text-stone-400'
                        }`}
                      >
                        {frame.code}
                      </span>
                      <span className="hidden md:inline">{frame.shortLabel}</span>
                    </span>

                    {!isSelected && segProgress > 0 && segProgress < 1 && (
                      <span
                        className="absolute bottom-0 left-0 h-0.5 bg-primary"
                        style={{ width: `${segProgress * 100}%` }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <span className="hidden sm:inline-block h-5 w-px bg-white/15 mx-0.5" aria-hidden="true" />

            <a
              href="#calculadora"
              onClick={handleScrollToCalculator}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary hover:bg-primary-dark text-white text-[11px] sm:text-xs font-bold transition-all shadow-sm shrink-0"
            >
              {effectiveProgress > 0.82 ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span className="hidden sm:inline">Calcular mi presupuesto</span>
                  <span className="sm:hidden">Calcular</span>
                </>
              ) : (
                <>
                  <CalcIcon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span className="hidden sm:inline">Presupuesto en 60s</span>
                  <span className="sm:hidden">Calcular</span>
                </>
              )}
              <ArrowDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" aria-hidden="true" />
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};

export default ScrollSequenceCover;
