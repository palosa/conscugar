import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  ShieldCheck,
  Hammer,
  Home as HomeIcon,
  ShowerHead,
  CookingPot,
  Construction,
  Building2,
  Wrench,
  Check,
  User,
  Mail,
  Phone,
  Loader2,
  CheckCircle2,
  Download
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { calculateBudget } from '../../constants/pricing';
import { sendLeadNotifications } from '../../services/notifications';
import { cn } from '../../utils/cn';
import { Button } from '../ui/Button';
import { supabase } from '../../utils/supabase';

const useCountUp = (target, active) => {
  const [value, setValue] = React.useState(0);
  React.useEffect(() => {
    if (!active || !target) { setValue(0); return; }
    const duration = 1800;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setValue(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, active]);
  return value;
};

const ICON_MAP = {
  Home: HomeIcon,
  ShowerHead,
  CookingPot,
  Construction,
  Building2,
  Wrench,
  CheckCircle2
};

const playHapticTick = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch (e) {
    // Silently fail if browser blocks AudioContext
  }
};

const Calculator = () => {
  const [step, setStep] = useState(() => {
    const saved = localStorage.getItem('ccg_step');
    return saved ? Number(saved) : 1;
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [visitRequested, setVisitRequested] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [pdfDownloaded, setPdfDownloaded] = useState(false);
  const containerRef = useRef(null);

  const [config, setConfig] = useState({
    projectTypes: [],
    pricingRanges: [],
    extras: [],
    qualitySettings: [],
    housingSettings: [],
    globalSettings: []
  });

  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('ccg_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) { }
    }
    return {
      tipo: '',
      m2: 0,
      hasElevator: null,
      propertyAge: '',
      calidad: '',
      vivienda: '',
      selectedExtras: [],
      name: '',
      email: '',
      phone: ''
    };
  });

  useEffect(() => {
    if (step < 7) {
      localStorage.setItem('ccg_step', step);
      localStorage.setItem('ccg_data', JSON.stringify(data));
    }
  }, [step, data]);

  useEffect(() => {
    fetchFullConfig();
  }, []);

  // Auto-avance al seleccionar tipo de obra en paso 1
  useEffect(() => {
    if (step === 1 && data.tipo) {
      const t = setTimeout(() => setStep(s => s === 1 ? 2 : s), 420);
      return () => clearTimeout(t);
    }
  }, [data.tipo]);


  const fetchFullConfig = async () => {
    try {
      const [
        projectsRes, pricingRes, extrasRes, qualityRes, housingRes, globalRes
      ] = await Promise.all([
        supabase.from('project_types').select('*').order('display_order'),
        supabase.from('pricing_config').select('*'),
        supabase.from('extras').select('*'),
        supabase.from('quality_settings').select('*'),
        supabase.from('housing_settings').select('*'),
        supabase.from('global_settings').select('*')
      ]);

      const newConfig = {
        projectTypes: projectsRes.data || [],
        pricingRanges: pricingRes.data || [],
        extras: extrasRes.data || [],
        qualitySettings: qualityRes.data || [],
        housingSettings: housingRes.data || [],
        globalSettings: globalRes.data || []
      };

      setConfig(newConfig);

      if (newConfig.projectTypes.length > 0) {
        setData(prev => ({
          ...prev,
          tipo: prev.tipo,
          calidad: prev.calidad || (newConfig.qualitySettings.find(s => s.id === 'media')?.id || newConfig.qualitySettings[0]?.id),
          vivienda: prev.vivienda || (newConfig.housingSettings.find(s => s.id === 'piso')?.id || newConfig.housingSettings[0]?.id)
        }));
      }
    } catch (err) {
      console.error("Error fetching config:", err);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = async () => {
    playHapticTick();
    if (step === 6) await handleSubmit();
    else {
      setStep(s => {
        let n = s + 1;
        if (n === 3 && data.tipo === 'obra_nueva') n = 4;
        return Math.min(n, 7);
      });
      window.scrollTo({ top: document.getElementById('calculadora')?.offsetTop - 100, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    playHapticTick();
    setStep(s => {
      let p = s - 1;
      if (p === 3 && data.tipo === 'obra_nueva') p = 2;
      return Math.max(p, 1);
    });
  };

  const updateData = (key, value) => {
    playHapticTick();
    setData(prev => {
      let val = value;
      
      // Control lógico de límites de entrada
      if (key === 'm2') {
         const isBano = prev.tipo.includes('bano') || prev.tipo.includes('baño');
         const isCocina = prev.tipo.includes('cocina');
         const maxM2 = isBano ? 30 : isCocina ? 60 : 3000;
         val = Math.min(Math.max(0, Number(val) || 0), maxM2);
      }

      const newData = { ...prev, [key]: val };

      if (key === 'tipo') {
        newData.selectedExtras = [];
        const projectType = config.projectTypes.find(p => p.id === val);
        if (projectType && projectType.default_m2) newData.m2 = projectType.default_m2;
      }
      return newData;
    });
  };

  const toggleExtra = (id) => {
    playHapticTick();
    setData(prev => ({
      ...prev,
      selectedExtras: prev.selectedExtras.includes(id)
        ? prev.selectedExtras.filter(x => x !== id)
        : [...prev.selectedExtras, id]
    }));
  };

  // Validación estricta de formato de contacto
  const validateContact = () => {
    const errors = {};
    if (!data.name.trim()) errors.name = 'El nombre es obligatorio';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email.trim()) errors.email = 'El email es obligatorio';
    else if (!emailRegex.test(data.email)) errors.email = 'Formato de email no válido';
    const phoneClean = data.phone.replace(/\s/g, '');
    if (!phoneClean) errors.phone = 'El teléfono es obligatorio';
    else if (!/^[+]?[0-9]{9,15}$/.test(phoneClean)) errors.phone = 'Mínimo 9 dígitos';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateContact()) return;
    setSubmitting(true);
    const budget = calculateBudget(data, config);
    try {
      await supabase.from('leads').insert([{
        name: data.name,
        email: data.email,
        phone: data.phone,
        tipo: data.tipo,
        m2: data.m2,
        calidad: data.calidad,
        vivienda: data.vivienda,
        selected_extras: data.selectedExtras,
        has_elevator: data.hasElevator,
        property_age: data.propertyAge,
        total_budget: budget.total,
        breakdown: budget.breakdown
      }]);

      // DISPARADOR PARA RESEND (MODO PREPARACIÓN)
      await sendLeadNotifications(data, budget);

      setStep(7);
      localStorage.removeItem('ccg_step');
      localStorage.removeItem('ccg_data');
    } catch (err) {
      setStep(7);
    } finally {
      setSubmitting(false);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const now = new Date().toLocaleDateString();
    const budget = calculateBudget(data, config);
    if (!budget) return;

    // Header Design
    doc.setFillColor(10, 10, 10);
    doc.rect(0, 0, 210, 40, 'F');

    doc.setFontSize(26);
    doc.setFont("helvetica", "bold");
    
    // "CONS" en Blanco
    doc.setTextColor(255, 255, 255);
    doc.text("CONS", 20, 25);

    // Calcular el ancho de "CONS" para posicionar "CUGAR" de forma contigua
    const consWidth = doc.getTextWidth("CONS");

    // "CUGAR" en Dorado
    doc.setTextColor(245, 197, 24); // Primary Gold
    doc.text("CUGAR", 20 + consWidth, 25);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("ESTUDIO DE REFORMAS Y CONSTRUCCIÓN", 20, 32);

    doc.setTextColor(150, 150, 150);
    doc.text(`VALORACIÓN #CS-${Math.floor(Math.random() * 9000) + 1000}`, 150, 20);
    doc.text(`FECHA: ${now}`, 150, 25);
    doc.text(`VALIDEZ: 15 DÍAS`, 150, 30);

    // Client Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("DATOS DEL PROYECTO:", 20, 55);
    doc.setFont("helvetica", "normal");
    doc.text(`Cliente: ${data.name}`, 20, 62);
    doc.text(`Localización: ${config.housingSettings.find(h => h.id === data.vivienda)?.label || data.vivienda}`, 20, 67);
    doc.text(`Tipo de Obra: ${config.projectTypes.find(p => p.id === data.tipo)?.name || data.tipo}`, 20, 72);
    doc.text(`Superficie Estimada: ${data.m2} m²`, 20, 77);

    // Main Concept & Inclusions
    doc.line(20, 85, 190, 85);
    doc.setFont("helvetica", "bold");
    doc.text("1. EJECUCIÓN MATERIAL Y MEMORIA TÉCNICA", 20, 95);

    const inclusions = config.projectTypes.find(p => p.id === data.tipo)?.description || "Ejecución integral según calidades seleccionadas.";
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const splitInclusions = doc.splitTextToSize(inclusions, 160);
    doc.text(splitInclusions, 20, 102);

    // Detailed Table
    let currentY = 105 + (splitInclusions.length * 5);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("DESGLOSE DE PARTIDAS TÉCNICAS (P.E.M.)", 20, currentY);
    doc.text("TOTAL", 165, currentY);

    currentY += 8;
    doc.line(20, currentY - 5, 190, currentY - 5);

    doc.setFont("helvetica", "normal");
    doc.text("Ejecución Base (PEM Materiales y Mano de Obra)", 20, currentY);
    doc.text(`${(budget.breakdown.baseMaterial + budget.breakdown.labor).toLocaleString()} €`, 165, currentY);

    currentY += 10;
    const selectedExtrasList = config.extras.filter(e => data.selectedExtras.includes(e.id));
    selectedExtrasList.forEach((extra) => {
      let p = Number(extra.price || 0);
      
      if (extra.is_quality_dependent !== false) {
         if (data.calidad === 'basica') p = extra.price_basic || p;
         else if (data.calidad === 'alta') p = extra.price_high || p * 2;
         else p = extra.price_medium || p * 1.5;
      }
      
      if (extra.price_type === 'm2' && p < 150) p *= Math.max(Number(data.m2), 5); // Consistente con SafeM2 y pricing.js

      doc.text(`+ ${extra.name}`, 25, currentY);
      doc.text(`${Math.round(p).toLocaleString()} €`, 165, currentY);
      currentY += 8;
    });

    // Subtotal PEM
    doc.line(20, currentY - 5, 190, currentY - 5);
    doc.setFont("helvetica", "bold");
    doc.text("SUBTOTAL P.E.M. (Ejecución Material)", 20, currentY);
    doc.text(`${budget.breakdown.pem.toLocaleString()} €`, 165, currentY);
    currentY += 10;

    // Tasas e Imprevistos Técnicos
    doc.setFont("helvetica", "normal");
    doc.text("Gestión de Licencias, Tasas e ICIO (~4%)", 25, currentY);
    doc.text(`${budget.breakdown.icio.toLocaleString()} €`, 165, currentY);
    currentY += 8;
    doc.text("Fondo de Contingencias y Desvíos Técnicos (~5%)", 25, currentY);
    doc.text(`${budget.breakdown.contingency.toLocaleString()} €`, 165, currentY);
    currentY += 10;

    // Base Imponible
    const baseImponible = budget.breakdown.pem + budget.breakdown.icio + budget.breakdown.contingency;
    doc.line(20, currentY - 5, 190, currentY - 5);
    doc.setFont("helvetica", "bold");
    doc.text("BASE IMPONIBLE (NETO)", 20, currentY);
    doc.text(`${baseImponible.toLocaleString()} €`, 165, currentY);
    currentY += 10;

    // IVA
    doc.setFont("helvetica", "normal");
    doc.text(`I.V.A. Aplicable (${budget.breakdown.ivaPercent}%)`, 25, currentY);
    doc.text(`${budget.breakdown.iva.toLocaleString()} €`, 165, currentY);
    currentY += 8;

    // Totals
    currentY += 5;
    doc.setFillColor(245, 245, 245);
    doc.rect(130, currentY, 60, 25, 'F');
    doc.setFont("helvetica", "bold");
    doc.text("VALORACIÓN TOTAL:", 135, currentY + 10);
    doc.setFontSize(14);
    doc.text(`${budget.total.toLocaleString()} €`, 135, currentY + 18);

    // Notas Legales y Técnicas (Ajustado para claridad máxima en impresión)
    doc.setFontSize(8);
    doc.setTextColor(60, 60, 60); // Gris antracita más nítido
    doc.text("NOTAS LEGALES Y TÉCNICAS:", 20, 245);
    const legal = [
      "* El presente documento constituye una valoración estimativa basada en los datos facilitados por el cliente.",
      "* Precios calculados según base de datos actual de construcción. S.E.U.O. (Salvo Error u Omisión).",
      "* El presupuesto final quedará supeditado a la visita técnica presencial y mediciones reales en obra.",
      `* I.V.A. del ${budget.breakdown.ivaPercent}% incluido en el presupuesto total estimado.`,
      "* Este documento no tiene valor contractual y caduca a los 15 días de su emisión."
    ];
    legal.forEach((line, i) => doc.text(line, 20, 252 + (i * 4)));

    doc.save(`Valoracion_Conscugar_${data.name.replace(/\s+/g, '_')}.pdf`);
    setPdfDownloaded(true);
  };

  const budget = calculateBudget(data, config);
  const animatedTotal = useCountUp(budget?.total, step === 7);

  // Validación de formato en tiempo real para deshabilitar/habilitar el botón CALCULAR
  const isContactFormatValid = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneClean = (data.phone || '').replace(/\s/g, '');
    return data.name?.trim() && emailRegex.test(data.email) && /^[+]?[0-9]{9,15}$/.test(phoneClean);
  };

  if (loading) return (
    <div className="w-full max-w-4xl mx-auto glass-card h-[500px] flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-10 h-10 text-primary animate-spin" />
      <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Sincronizando Precios...</p>
    </div>
  );

  return (
    <motion.div
      layout
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-3xl mx-auto glass-card shadow-2xl relative transition-all overflow-hidden"
      id="calculadora"
      ref={containerRef}
    >
      {/* Subtle Atmospheric Corners */}
      <div className="absolute top-0 left-0 w-48 h-48 bg-primary/5 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-primary/5 blur-[80px] pointer-events-none" />

      {/* Progress Bar con Nombres de Paso */}
      <div className="px-6 pt-5 pb-4 bg-black/20 border-b border-white/5 relative z-10">
        <div className="flex items-start justify-between">
          {['Obra', 'M²', 'Edificio', 'Calidad', 'Extras', 'Contacto', 'Resultado'].map((label, i) => {
            const s = i + 1;
            const isActive = step === s;
            const isDone = step > s;
            return (
              <React.Fragment key={s}>
                <div className="flex flex-col items-center gap-1.5">
                  <div className={cn(
                    "w-6 h-6 flex items-center justify-center text-[8px] font-black transition-all duration-500",
                    isActive ? "bg-primary text-dark shadow-[0_0_14px_rgba(245,197,24,0.5)] scale-110" :
                    isDone ? "bg-primary/20 text-primary" : "bg-white/5 text-white/15"
                  )}>
                    {isDone ? <Check className="w-3 h-3 stroke-[4px]" /> : s}
                  </div>
                  <span className={cn(
                    "text-[7px] font-black uppercase tracking-wider hidden sm:block transition-all leading-none",
                    isActive ? "text-primary" : isDone ? "text-white/25" : "text-white/10"
                  )}>{label}</span>
                </div>
                {s < 7 && <div className={cn("flex-1 h-[1px] mt-3 mx-0.5 sm:mx-1 transition-all duration-700", isDone ? "bg-primary/30" : "bg-white/5")} />}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="p-8 sm:p-14 min-h-[520px] flex flex-col relative z-20">
        <div className="mb-10">
          <span className="text-primary text-[9px] font-black uppercase tracking-[0.4em] mb-1 block">Pasos 0{step}/07</span>
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight italic">
            {step === 1 && "Tipo de Obra"}
            {step === 2 && "Superficie"}
            {step === 3 && "Logística de Edificio"}
            {step === 4 && "Calidades"}
            {step === 5 && "Extras"}
            {step === 6 && "Contacto"}
            {step === 7 && "Valoración Estimada"}
          </h2>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1"
          >
            {step === 1 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {config.projectTypes.map(type => {
                  const Icon = ICON_MAP[type.icon] || HomeIcon;
                  const isActive = data.tipo === type.id;
                  return (
                    <motion.div
                      key={type.id}
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => updateData('tipo', type.id)}
                      className={cn(
                        "relative p-5 border cursor-pointer transition-all flex flex-col gap-4 group overflow-hidden min-h-[140px] justify-center items-center text-center",
                        isActive
                          ? "border-primary bg-primary/[0.05] shadow-lg"
                          : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-primary/40"
                      )}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="active-bg"
                          className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none"
                        />
                      )}

                      <div className="relative z-10 space-y-3 flex flex-col items-center">
                        <Icon className={cn(
                          "w-5 h-5 transition-all duration-300",
                          isActive ? "text-primary" : "text-white/60 group-hover:text-white"
                        )} />
                        <div className="space-y-1">
                          <h3 className={cn(
                            "text-[10px] sm:text-[11px] font-black uppercase tracking-tight leading-tight transition-all max-w-[120px]",
                            isActive ? "text-white" : "text-gray-400 group-hover:text-white"
                          )}>{type.name}</h3>
                          <p className={cn(
                            "text-[8px] font-bold uppercase tracking-widest transition-all",
                            isActive ? "text-primary/80" : "text-white/10"
                          )}>{isActive ? 'Seleccionado' : 'Elegir'}</p>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}

            {step === 2 && (() => {
              // Presets adaptativos según tipo de obra
              const isBano = data.tipo?.includes('bano') || data.tipo?.includes('baño');
              const isCocina = data.tipo?.includes('cocina');
              const presets = isBano ? [4, 6, 8, 12, 18] : isCocina ? [8, 12, 16, 24, 35] : [30, 60, 90, 150, 300];
              const step2 = isBano ? 1 : isCocina ? 2 : 5;
              return (
                <div className="space-y-12 py-10 text-center">
                  <div className="flex items-center justify-center gap-4 sm:gap-12">
                    <button onClick={() => updateData('m2', Math.max(1, Number(data.m2) - step2))} className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center hover:bg-primary/20 transition-all text-white/20 hover:text-primary active:scale-90"><ChevronLeft className="w-6 h-6" /></button>
                    <div className="relative group min-w-[150px] flex flex-col items-center">
                      <input
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={data.m2 === 0 ? '' : data.m2}
                        onChange={(e) => {
                          const val = e.target.value === '' ? 0 : Math.min(Number(e.target.value.replace(/[^0-9]/g, '')), 2000);
                          updateData('m2', val);
                        }}
                        max={2000}
                        className="bg-transparent text-7xl sm:text-8xl font-black text-center w-full outline-none text-primary italic tabular-nums transition-all focus:text-white"
                        placeholder="0"
                      />
                      <div className="absolute -right-6 sm:-right-10 bottom-6 text-xl text-white/10 font-black italic">M²</div>
                      <div className="h-[1px] w-32 bg-white/5 relative mt-2 overflow-hidden text-transparent">_</div>
                    </div>
                    <button onClick={() => updateData('m2', Number(data.m2) + step2)} className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center hover:bg-primary/20 transition-all text-white/20 hover:text-primary active:scale-90"><ChevronRight className="w-6 h-6" /></button>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {presets.map(m => (
                      <button key={m} onClick={() => updateData('m2', m)} className={cn("px-4 py-2 text-[10px] font-bold border transition-all", data.m2 === m ? "bg-primary text-dark border-primary" : "bg-white/5 border-white/5 text-white/20 hover:text-white")}>{m} m²</button>
                    ))}
                  </div>
                  {Number(data.m2) > 0 && Number(data.m2) < 15 && (
                    <p className="text-[9px] text-amber-400/60 font-bold uppercase tracking-widest">Superficie muy pequeña. ¿Es solo una estancia?</p>
                  )}
                  <p className="text-[8px] text-white/15 font-bold uppercase tracking-widest">Máx. 2.000 m² · ¿No sabes los m²? Confírmalo en la visita técnica gratuita.</p>
                </div>
              );
            })()}

            {step === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* Tipo de Vivienda */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-primary block">¿En qué formato de residencia se actuará?</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {config.housingSettings.map(h => (
                      <button 
                        key={h.id} 
                        onClick={() => updateData('vivienda', h.id)} 
                        className={cn(
                          "p-4 border transition-all text-[10px] font-bold uppercase tracking-widest group flex justify-center items-center relative overflow-hidden", 
                          data.vivienda === h.id ? "border-primary bg-primary/10 text-white shadow-[0_0_15px_rgba(245,197,24,0.15)]" : "border-white/10 text-white/40 hover:border-primary/40 hover:bg-white/[0.02]"
                        )}
                      >
                        {data.vivienda === h.id && <div className="absolute inset-0 bg-primary/5 blur-sm" />}
                        <span className="relative z-10 transition-colors">{h.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                  {/* Ascensor - solo relevante si es un piso */} 
                  {data.vivienda === 'piso' && (
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-primary block">¿Dispone de ascensor en la finca?</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => updateData('hasElevator', true)} className={cn("p-4 border transition-all text-xs font-bold uppercase", data.hasElevator === true ? "border-primary bg-primary/10 text-white" : "border-white/10 text-white/40 hover:text-white")}>SÍ</button>
                        <button onClick={() => updateData('hasElevator', false)} className={cn("p-4 border transition-all text-xs font-bold uppercase", data.hasElevator === false ? "border-primary bg-primary/10 text-white" : "border-white/10 text-white/40 hover:text-white")}>NO</button>
                      </div>
                    </div>
                  )}
                  {/* Antigüedad - relevante para todas las reformas ya que condiciona el estado de las instalaciones */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary block">Año de construcción aprox.</label>
                    <div className="grid grid-cols-1 gap-2">
                      <button onClick={() => updateData('propertyAge', 'post_2000')} className={cn("p-3 border transition-all text-xs font-bold", data.propertyAge === 'post_2000' ? "border-primary bg-primary/10 text-white" : "border-white/10 text-white/40 hover:text-white")}>Posterior a 2000</button>
                      <button onClick={() => updateData('propertyAge', '1970_2000')} className={cn("p-3 border transition-all text-xs font-bold", data.propertyAge === '1970_2000' ? "border-primary bg-primary/10 text-white" : "border-white/10 text-white/40 hover:text-white")}>Entre 1970 y 2000</button>
                      <button onClick={() => updateData('propertyAge', 'pre_1970')} className={cn("p-3 border transition-all text-xs font-bold", data.propertyAge === 'pre_1970' ? "border-primary bg-primary/10 text-white" : "border-white/10 text-white/40 hover:text-white")}>Anterior a 1970</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="grid grid-cols-1 gap-3">
                  {[...config.qualitySettings].sort((a, b) => a.multiplier - b.multiplier).map(q => {
                    const isActive = data.calidad === q.id;
                    return (
                      <div
                        key={q.id}
                        onClick={() => updateData('calidad', q.id)}
                        className={cn(
                          "p-6 border cursor-pointer flex flex-col gap-3 transition-all bg-white/[0.02] group relative overflow-hidden",
                          isActive ? "border-primary bg-primary/[0.05]" : "border-white/5 hover:border-white/10"
                        )}
                      >
                        <div className="flex justify-between items-center">
                          <span className={cn("text-[11px] font-black uppercase tracking-widest transition-colors", isActive ? "text-white" : "text-white/30 group-hover:text-white/60")}>{q.label}</span>
                          <div className={cn("w-3 h-3 rounded-none rotate-45 transition-all", isActive ? "bg-primary shadow-[0_0_10px_#F5C518]" : "bg-white/10")} />
                        </div>
                        {q.description && (
                          <p className={cn("text-[10px] leading-relaxed transition-colors max-w-md", isActive ? "text-white/60" : "text-white/20 group-hover:text-white/40")}>
                            {q.description}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {step === 5 && (() => {
              const availableExtras = config.extras.filter(e => (e.project_types || []).some(t => String(t) === String(data.tipo)));
              const extrasSubtotal = data.selectedExtras.reduce((acc, id) => {
                const extra = config.extras.find(e => e.id === id);
                if (!extra) return acc;
                let p = Number(extra.price || 0);
                if (extra.is_quality_dependent !== false) {
                  if (data.calidad === 'basica') p = extra.price_basic || p;
                  else if (data.calidad === 'alta') p = extra.price_high || p * 2;
                  else p = extra.price_medium || p * 1.5;
                }
                if (extra.price_type === 'm2') p *= Math.max(Number(data.m2), 5);
                return acc + Math.round(p);
              }, 0);
              
              if (availableExtras.length === 0) return (
                <div className="flex flex-col items-center justify-center py-16 gap-4 opacity-40">
                  <div className="w-12 h-12 border border-white/10 flex items-center justify-center">
                    <Check className="w-5 h-5 text-white/30" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 text-center">
                    No hay extras configurados<br/>para este tipo de obra
                  </p>
                  <p className="text-[9px] text-white/20 text-center">Puedes continuar al siguiente paso</p>
                </div>
              );
              
              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[280px] overflow-y-auto pr-2 scrollbar-hide">
                    {availableExtras.map(extra => {
                      const isSelected = data.selectedExtras.includes(extra.id);
                      return (
                        <div
                          key={extra.id}
                          onClick={() => toggleExtra(extra.id)}
                          className={cn(
                            "p-4 border cursor-pointer flex items-center gap-4 transition-all pr-6",
                            isSelected ? "border-primary bg-primary/[0.03]" : "border-white/5 bg-white/[0.01] hover:border-white/10"
                          )}
                        >
                          <div className={cn(
                            "w-6 h-6 shrink-0 border flex items-center justify-center transition-all",
                            isSelected ? "bg-primary border-primary text-dark" : "border-white/20 text-transparent"
                          )}>
                            <Check className="w-4 h-4 stroke-[4px]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn("text-[10px] font-black uppercase tracking-tight truncate transition-colors", isSelected ? "text-white" : "text-gray-400 group-hover:text-white")}>{extra.name}</p>
                            <p className="text-[9px] text-primary font-bold tracking-widest mt-0.5">
                              {(() => {
                                let p = Number(extra.price || 0);
                                if (extra.is_quality_dependent !== false) {
                                   if (data.calidad === 'basica') p = extra.price_basic || p;
                                   else if (data.calidad === 'alta') p = extra.price_high || p * 2;
                                   else p = extra.price_medium || p * 1.5;
                                }
                                if (extra.price_type === 'm2') p *= Math.max(Number(data.m2), 5);
                                return `+${Math.round(p).toLocaleString()}€`;
                              })()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* Subtotal de Extras en tiempo real */}
                  <div className={cn(
                    "flex items-center justify-between p-4 border transition-all",
                    extrasSubtotal > 0 ? "border-primary/20 bg-primary/[0.03]" : "border-white/5 bg-white/[0.01]"
                  )}>
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">Extras seleccionados:</span>
                    <span className={cn("text-sm font-black italic transition-all", extrasSubtotal > 0 ? "text-primary" : "text-white/10")}>
                      {extrasSubtotal > 0 ? `+${extrasSubtotal.toLocaleString()}€` : '—'}
                    </span>
                  </div>
                </div>
              );
            })()}

            {step === 6 && (
              <div className="space-y-4 max-w-lg mx-auto py-1 animate-in fade-in duration-700">
                {/* Resumen de lo elegido para reforzar la decisión */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {[
                    config.projectTypes.find(p => p.id === data.tipo)?.name,
                    data.m2 ? `${data.m2} m²` : null,
                    config.qualitySettings.find(q => q.id === data.calidad)?.label,
                    config.housingSettings.find(h => h.id === data.vivienda)?.label,
                  ].filter(Boolean).map((tag, i) => (
                    <span key={i} className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest bg-primary/10 border border-primary/20 text-primary">{tag}</span>
                  ))}
                </div>
                <div className="space-y-1">
                  <input
                    type="text" value={data.name}
                    onChange={e => { updateData('name', e.target.value); setFormErrors(p => ({...p, name: ''})); }}
                    placeholder="NOMBRE COMPLETO"
                    className={cn("w-full bg-white/[0.03] border p-5 pl-8 text-sm outline-none transition-all uppercase font-bold text-white/80", formErrors.name ? "border-red-500/60 focus:border-red-500" : "border-white/10 focus:border-primary/40")}
                  />
                  {formErrors.name && <p className="text-[9px] text-red-400 font-bold uppercase tracking-widest pl-2">{formErrors.name}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <input
                      type="tel" value={data.phone}
                      onChange={e => { updateData('phone', e.target.value); setFormErrors(p => ({...p, phone: ''})); }}
                      placeholder="TELÉFONO"
                      className={cn("w-full bg-white/[0.03] border p-5 pl-8 text-sm outline-none transition-all font-bold text-white/80", formErrors.phone ? "border-red-500/60 focus:border-red-500" : "border-white/10 focus:border-primary/40")}
                    />
                    {formErrors.phone && <p className="text-[9px] text-red-400 font-bold uppercase tracking-widest pl-2">{formErrors.phone}</p>}
                  </div>
                  <div className="space-y-1">
                    <input
                      type="email" value={data.email}
                      onChange={e => { updateData('email', e.target.value); setFormErrors(p => ({...p, email: ''})); }}
                      placeholder="CORREO"
                      className={cn("w-full bg-white/[0.03] border p-5 pl-8 text-sm outline-none transition-all font-bold text-white/80", formErrors.email ? "border-red-500/60 focus:border-red-500" : "border-white/10 focus:border-primary/40")}
                    />
                    {formErrors.email && <p className="text-[9px] text-red-400 font-bold uppercase tracking-widest pl-2">{formErrors.email}</p>}
                  </div>
                </div>
                <div className="p-5 bg-primary/[0.03] border border-primary/10 flex gap-5 items-center">
                  <ShieldCheck className="w-5 h-5 text-primary/60 shrink-0" />
                  <p className="text-[9px] text-white/20 uppercase font-bold tracking-widest leading-relaxed">Privacidad Protegida · Conscugar Sagunto</p>
                </div>
              </div>
            )}

            {step === 7 && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out">
                {/* Resumen de Configuración */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-8 border-b border-white/10">
                  <div className="space-y-1 text-center sm:text-left">
                    <p className="text-[9px] font-black text-white/50 uppercase tracking-widest">Proyecto</p>
                    <p className="text-[12px] font-bold uppercase text-white">{config.projectTypes.find(p => p.id === data.tipo)?.name}</p>
                  </div>
                  <div className="space-y-1 text-center sm:border-x border-white/10 px-4">
                    <p className="text-[9px] font-black text-white/50 uppercase tracking-widest">Superficie</p>
                    <p className="text-[12px] font-bold uppercase text-white">{data.m2} m²</p>
                  </div>
                  <div className="space-y-1 text-center sm:text-right">
                    <p className="text-[9px] font-black text-white/50 uppercase tracking-widest">Calidad</p>
                    <p className="text-[12px] font-bold uppercase text-primary font-black tracking-tight">{config.qualitySettings.find(q => q.id === data.calidad)?.label}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Precio principal con animación */}
                  <div className="bg-black/60 p-8 sm:p-12 text-center border border-white/[0.1] relative group shadow-2xl overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[1px] bg-primary group-hover:w-64 transition-all duration-1000" />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent pointer-events-none" />
                    <p className="text-[10px] text-white/50 font-black uppercase tracking-[0.6em] mb-4">Valoración Estimada · IVA INCLUIDO</p>
                    <motion.h2
                      initial={{ scale: 0.85, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      className="text-5xl sm:text-7xl lg:text-8xl font-black text-primary italic leading-none tracking-tighter drop-shadow-[0_0_40px_rgba(245,197,24,0.3)]"
                    >
                      {animatedTotal.toLocaleString()}€
                    </motion.h2>
                    <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest mt-4">
                      Rango estimado: {budget.min.toLocaleString()}€ — {budget.max.toLocaleString()}€
                    </p>
                  </div>

                  {/* Desglose detallado de partidas */}
                  <div className="border border-white/5 bg-white/[0.01] divide-y divide-white/5">
                    {[
                      { label: 'Ejecución Material Base', value: budget.breakdown.baseMaterial, sub: 'Materiales y acabados según calidad' },
                      { label: 'Mano de Obra', value: budget.breakdown.labor, sub: 'Equipo técnico y operarios' },
                      ...(budget.breakdown.extras > 0 ? [{ label: 'Servicios Adicionales', value: budget.breakdown.extras, sub: 'Extras seleccionados' }] : []),
                      { label: 'Licencias, ICIO y Tasas', value: budget.breakdown.icio, sub: '~4% del PEM' },
                      { label: 'Fondo de Contingencias', value: budget.breakdown.contingency, sub: '~5% del PEM' },
                      { label: `IVA (${budget.breakdown.ivaPercent}%)`, value: budget.breakdown.iva, sub: 'Impuesto sobre el valor añadido' },
                    ].map((item, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + idx * 0.08, duration: 0.4 }}
                        className="flex items-center justify-between px-5 py-3"
                      >
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-tight text-white/60">{item.label}</p>
                          <p className="text-[8px] text-white/20 font-bold uppercase tracking-widest">{item.sub}</p>
                        </div>
                        <span className="text-[11px] font-black text-white/80 tabular-nums">{item.value.toLocaleString()}€</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Desglose de Extras si existen */}
                {data.selectedExtras.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">Servicios Adicionales Incluidos:</p>
                    <div className="flex flex-wrap gap-2">
                      {config.extras.filter(e => data.selectedExtras.includes(e.id)).map(extra => (
                        <span key={extra.id} className="bg-white/5 border border-white/5 px-3 py-1.5 text-[9px] font-bold uppercase text-white/70 italic">
                          + {extra.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="min-h-[120px] flex items-center justify-center">
                  {!visitRequested ? (
                    <div className="w-full flex flex-col sm:flex-row gap-3 animate-in fade-in duration-500">
                      <Button
                        className="flex-1 py-8 uppercase font-black tracking-[0.3em] text-[11px] shadow-xl shadow-primary/20"
                        onClick={() => setVisitRequested(true)}
                      >
                        SOLICITAR VISITA TÉCNICA GRATUITA
                      </Button>
                      <Button
                        variant="outline"
                        className={cn(
                          "flex-1 py-8 uppercase font-black tracking-[0.3em] text-[11px] transition-all bg-white/[0.02]",
                          pdfDownloaded
                            ? "border-primary/50 text-primary shadow-[0_0_20px_rgba(245,197,24,0.15)]"
                            : "border-white/20 text-white hover:border-primary hover:text-primary"
                        )}
                        onClick={generatePDF}
                      >
                        {pdfDownloaded ? (
                          <><CheckCircle2 className="w-5 h-5 mr-3" /> PDF DESCARGADO</>
                        ) : (
                          <><Download className="w-5 h-5 mr-3 opacity-90" /> DESCARGAR VALORACIÓN PDF</>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="w-full p-8 bg-primary/10 border border-primary/20 text-center space-y-3 animate-in zoom-in-95 duration-500">
                      <p className="text-primary font-black uppercase tracking-[0.3em] text-xs">¡Solicitud Recibida!</p>
                      <p className="text-white/80 text-sm font-medium leading-relaxed">
                        Un técnico de Conscugar se pondrá en contacto contigo en los <br /> próximos días para concertar una visita y confeccionar el presupuesto final.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Footer Nav */}
        <div className="mt-6 pt-6 border-t border-white/[0.03] flex items-center justify-between">
          <button onClick={prevStep} className={cn("text-[10px] font-black uppercase tracking-widest transition-all p-4", step === 1 || step === 7 ? "invisible" : "text-white/10 hover:text-white/40")}>ATRÁS</button>
          {step < 6 ? (
            <Button onClick={nextStep} disabled={
              (step === 1 && !data.tipo) ||
              (step === 2 && Number(data.m2) < 1) ||
              (step === 3 && (() => {
                const isBano = data.tipo?.includes('bano') || data.tipo?.includes('baño');
                const isCocina = data.tipo?.includes('cocina');
                const needsAge = !isBano && !isCocina;
                return data.hasElevator === null || !data.vivienda || (needsAge && !data.propertyAge);
              })())
            } className="px-10 py-6 text-[10px] font-black tracking-widest rounded-none">CONTINUAR</Button>
          ) : step === 6 ? (
            <Button onClick={nextStep} disabled={!isContactFormatValid()} className="px-10 py-6 text-[10px] font-black tracking-widest rounded-none">{submitting ? 'VALIDANDO...' : 'CALCULAR'}</Button>
          ) : (
            <button onClick={() => {
              playHapticTick();
              setStep(1);
              setData({
                tipo: config.projectTypes[0]?.id || '', m2: 0, hasElevator: null, propertyAge: '', calidad: '', vivienda: '',
                selectedExtras: [], name: '', email: '', phone: ''
              });
              setFormErrors({});
              setVisitRequested(false);
              localStorage.removeItem('ccg_step');
              localStorage.removeItem('ccg_data');
            }} className="text-[10px] font-black uppercase tracking-widest text-white/10 hover:text-white transition-all p-4">NUEVO CÁLCULO</button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Calculator;
