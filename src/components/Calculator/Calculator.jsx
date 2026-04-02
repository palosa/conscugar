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

const ICON_MAP = {
  Home: HomeIcon, 
  ShowerHead, 
  CookingPot, 
  Construction, 
  Building2, 
  Wrench,
  CheckCircle2
};

const Calculator = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [visitRequested, setVisitRequested] = useState(false);
  const containerRef = useRef(null);
  
  const [config, setConfig] = useState({
    projectTypes: [],
    pricingRanges: [],
    extras: [],
    qualitySettings: [],
    housingSettings: [],
    globalSettings: []
  });
  
  const [data, setData] = useState({
    tipo: '',
    m2: 80,
    calidad: '',
    vivienda: '',
    selectedExtras: [],
    name: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    fetchFullConfig();
  }, []);


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
           tipo: prev.tipo || newConfig.projectTypes[0].id,
           calidad: prev.calidad || (newConfig.qualitySettings.find(s=>s.id==='media')?.id || newConfig.qualitySettings[0]?.id),
           vivienda: prev.vivienda || (newConfig.housingSettings.find(s=>s.id==='piso')?.id || newConfig.housingSettings[0]?.id)
         }));
      }
    } catch (err) {
      console.error("Error fetching config:", err);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = async () => {
    if (step === 5) await handleSubmit();
    else {
      setStep(s => Math.min(s + 1, 6));
      window.scrollTo({ top: document.getElementById('calculadora')?.offsetTop - 100, behavior: 'smooth' });
    }
  };

  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const updateData = (key, value) => {
    setData(prev => {
      const newData = { ...prev, [key]: value };
      if (key === 'tipo') {
        newData.selectedExtras = [];
        const projectType = config.projectTypes.find(p => p.id === value);
        if (projectType && projectType.default_m2) newData.m2 = projectType.default_m2;
      }
      return newData;
    });
  };

  const toggleExtra = (id) => {
    setData(prev => ({
      ...prev,
      selectedExtras: prev.selectedExtras.includes(id)
        ? prev.selectedExtras.filter(x => x !== id)
        : [...prev.selectedExtras, id]
    }));
  };

  const handleSubmit = async () => {
    if (!data.name || !data.email || !data.phone) return alert("Rellena todos los campos.");
    setSubmitting(true);
    const budget = calculateBudget(data, config);
    try {
      await supabase.from('leads').insert([{
        name: data.name, email: data.email, phone: data.phone,
        project_type: data.tipo, m2: data.m2, calidad: data.calidad,
        vivienda: data.vivienda, extras: data.selectedExtras,
        estimated_total: budget.total
      }]);
      
      // DISPARADOR PARA RESEND (MODO PREPARACIÓN)
      await sendLeadNotifications(data, budget);

      setStep(6);
    } catch (err) {
      setStep(6);
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
    
    doc.setTextColor(245, 197, 24); // Primary Gold
    doc.setFontSize(26);
    doc.setFont("helvetica", "bold");
    doc.text("CONSCUGAR", 20, 25);
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("ESTUDIO DE REFORMAS Y CONSTRUCCIÓN PREMIUM", 20, 32);
    
    doc.setTextColor(150, 150, 150);
    doc.text(`PRESUPUESTO #CS-${Math.floor(Math.random()*9000)+1000}`, 150, 20);
    doc.text(`FECHA: ${now}`, 150, 25);
    doc.text(`VALIDEZ: 15 DÍAS`, 150, 30);

    // Client Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("DATOS DEL PROYECTO:", 20, 55);
    doc.setFont("helvetica", "normal");
    doc.text(`Cliente: ${data.name}`, 20, 62);
    doc.text(`Localización: ${data.vivienda}`, 20, 67);
    doc.text(`Tipo de Obra: ${config.projectTypes.find(p=>p.id===data.tipo)?.name || data.tipo}`, 20, 72);
    doc.text(`Superficie Estimada: ${data.m2} m²`, 20, 77);

    // Main Concept & Inclusions
    doc.line(20, 85, 190, 85);
    doc.setFont("helvetica", "bold");
    doc.text("1. EJECUCIÓN MATERIAL Y MEMORIA TÉCNICA", 20, 95);
    
    const inclusions = config.projectTypes.find(p=>p.id===data.tipo)?.inclusions || "Ejecución integral según calidades seleccionadas.";
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const splitInclusions = doc.splitTextToSize(inclusions, 160);
    doc.text(splitInclusions, 20, 102);

    // Detailed Table
    let currentY = 105 + (splitInclusions.length * 5);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("DESGLOSE DE PARTIDAS", 20, currentY);
    doc.text("TOTAL", 165, currentY);
    
    currentY += 8;
    doc.line(20, currentY-5, 190, currentY-5);
    
    doc.setFont("helvetica", "normal");
    doc.text("Obra Base e Instalaciones (Mano de Obra y Materiales)", 20, currentY);
    doc.text(`${budget.breakdown.base.toLocaleString()} €`, 165, currentY);
    
    currentY += 10;
    const selectedExtrasList = config.extras.filter(e => data.selectedExtras.includes(e.id));
    selectedExtrasList.forEach((extra) => {
      let p = 0;
      if (data.calidad === 'basica') p = extra.price_basic || extra.price;
      else if (data.calidad === 'alta') p = extra.price_high || extra.price * 2;
      else p = extra.price_medium || extra.price * 1.5;
      if (extra.price_type === 'm2') p *= data.m2;

      doc.text(`+ ${extra.name}`, 25, currentY);
      doc.text(`${Math.round(p).toLocaleString()} €`, 165, currentY);
      currentY += 8;
    });

    // Totals
    currentY += 5;
    doc.setFillColor(245, 245, 245);
    doc.rect(130, currentY, 60, 25, 'F');
    doc.setFont("helvetica", "bold");
    doc.text("SUMA TOTAL (NETO):", 135, currentY + 10);
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
      "* IVA no incluido en las cifras mostradas.",
      "* Este documento no tiene valor contractual y caduca a los 15 días de su emisión."
    ];
    legal.forEach((line, i) => doc.text(line, 20, 252 + (i * 4)));

    doc.save(`Presupuesto_Conscugar_${data.name.replace(/\s+/g, '_')}.pdf`);
  };

  const budget = calculateBudget(data, config);

  if (loading) return (
    <div className="w-full max-w-4xl mx-auto glass-card h-[500px] flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-10 h-10 text-primary animate-spin" />
      <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Sincronizando Precios...</p>
    </div>
  );

  return (
    <div 
      className="w-full max-w-3xl mx-auto glass-card shadow-2xl relative transition-all duration-500 overflow-hidden" 
      id="calculadora" 
      ref={containerRef}
    >
      {/* Subtle Atmospheric Corners */}
      <div className="absolute top-0 left-0 w-48 h-48 bg-primary/5 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-primary/5 blur-[80px] pointer-events-none" />

      {/* NEW Minimalist Progress Nodes */}
      <div className="flex justify-center items-center gap-2 sm:gap-4 py-8 bg-black/20 border-b border-white/5 relative z-10">
         {[1, 2, 3, 4, 5, 6].map(s => (
            <React.Fragment key={s}>
               <div className={cn(
                  "w-2 h-2 rotate-45 transition-all duration-500",
                  step === s ? "bg-primary shadow-[0_0_10px_#F5C518] scale-125" : 
                  step > s ? "bg-primary/40" : "bg-white/10"
               )} />
               {s < 6 && <div className={cn("w-4 sm:w-8 h-[1px] transition-all duration-500", step > s ? "bg-primary/20" : "bg-white/5")} />}
            </React.Fragment>
         ))}
      </div>

      <div className="p-8 sm:p-14 min-h-[520px] flex flex-col relative z-20">
        <div className="mb-10">
           <span className="text-primary text-[9px] font-black uppercase tracking-[0.4em] mb-1 block">Pasos 0{step}/06</span>
           <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight italic">
              {step === 1 && "Tipo de Obra"}
              {step === 2 && "Superficie"}
              {step === 3 && "Calidades"}
              {step === 4 && "Extras"}
              {step === 5 && "Contacto"}
              {step === 6 && "Presupuesto Final"}
           </h2>
        </div>

        <div className="flex-1">
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
                        whileHover={{ y: -2, borderColor: "rgba(245, 197, 24, 0.4)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => updateData('tipo', type.id)} 
                        className={cn(
                          "relative p-5 border cursor-pointer transition-all flex flex-col gap-4 group overflow-hidden min-h-[140px] justify-center items-center text-center",
                          isActive 
                            ? "border-primary bg-primary/[0.05] shadow-lg" 
                            : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]"
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

          {step === 2 && (
            <div className="space-y-12 py-10 text-center">
                <div className="flex items-center justify-center gap-4 sm:gap-12">
                   <button onClick={() => updateData('m2', Math.max(1, Number(data.m2) - 5))} className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center hover:bg-primary/20 transition-all text-white/20 hover:text-primary active:scale-90"><ChevronLeft className="w-6 h-6"/></button>
                   <div className="relative group min-w-[150px] flex flex-col items-center">
                      <input 
                         type="number" 
                         inputMode="numeric" 
                         pattern="[0-9]*"
                         value={data.m2 === 0 ? '' : data.m2} 
                         onChange={(e) => {
                            const val = e.target.value === '' ? 0 : Number(e.target.value.replace(/[^0-9]/g, ''));
                            updateData('m2', val);
                         }} 
                         className="bg-transparent text-7xl sm:text-8xl font-black text-center w-full outline-none text-primary italic tabular-nums transition-all focus:text-white"
                         placeholder="0"
                      />
                      <div className="absolute -right-6 sm:-right-10 bottom-6 text-xl text-white/10 font-black italic">M²</div>
                      <div className="h-[1px] w-32 bg-white/5 relative mt-2 overflow-hidden text-transparent">_</div>
                   </div>
                   <button onClick={() => updateData('m2', Number(data.m2) + 5)} className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center hover:bg-primary/20 transition-all text-white/20 hover:text-primary active:scale-90"><ChevronRight className="w-6 h-6"/></button>
                </div>
               <div className="flex flex-wrap justify-center gap-2">
                  {[10, 45, 90, 150, 300].map(m => (
                     <button key={m} onClick={() => updateData('m2', m)} className={cn("px-4 py-2 text-[10px] font-bold border transition-all", data.m2 === m ? "bg-primary text-dark border-primary" : "bg-white/5 border-white/5 text-white/20 hover:text-white")}>{m} m²</button>
                  ))}
               </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8">
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

          {step === 4 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[350px] overflow-y-auto pr-2 scrollbar-hide">
               {config.extras.filter(e => (e.project_types || []).some(t => String(t) === String(data.tipo))).map(extra => {
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
                                let p = 0;
                                if (data.calidad === 'basica') p = extra.price_basic || extra.price;
                                else if (data.calidad === 'alta') p = extra.price_high || extra.price * 2;
                                else p = extra.price_medium || extra.price * 1.5;
                                
                                if (extra.price_type === 'm2') p *= data.m2;
                                return `+${Math.round(p).toLocaleString()}€`;
                             })()}
                          </p>
                       </div>
                    </div>
                  );
               })}
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4 max-w-lg mx-auto py-1 animate-in fade-in duration-700">
               <input type="text" value={data.name} onChange={e=>updateData('name', e.target.value)} placeholder="NOMBRE COMPLETO" className="w-full bg-white/[0.03] border border-white/10 p-5 pl-8 text-sm outline-none focus:border-primary/40 transition-all uppercase font-bold text-white/80" />
               <div className="grid grid-cols-2 gap-3">
                  <input type="tel" value={data.phone} onChange={e=>updateData('phone', e.target.value)} placeholder="TELÉFONO" className="w-full bg-white/[0.03] border border-white/10 p-5 pl-8 text-sm outline-none focus:border-primary/40 transition-all font-bold text-white/80" />
                  <input type="email" value={data.email} onChange={e=>updateData('email', e.target.value)} placeholder="CORREO" className="w-full bg-white/[0.03] border border-white/10 p-5 pl-8 text-sm outline-none focus:border-primary/40 transition-all font-bold text-white/80" />
               </div>
               <div className="p-6 bg-primary/[0.03] border border-primary/10 flex gap-5 items-center">
                  <ShieldCheck className="w-5 h-5 text-primary/60 shrink-0" />
                  <p className="text-[9px] text-white/20 uppercase font-bold tracking-widest leading-relaxed">Privacidad Protegida · Conscugar Sagunto</p>
               </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-700">
               {/* Resumen de Configuración */}
               <div className="grid grid-cols-3 gap-4 pb-8 border-b border-white/10">
                  <div className="space-y-1">
                     <p className="text-[9px] font-black text-white/50 uppercase tracking-widest">Proyecto</p>
                     <p className="text-[12px] font-bold uppercase text-white">{config.projectTypes.find(p=>p.id===data.tipo)?.name}</p>
                  </div>
                  <div className="space-y-1 text-center border-x border-white/10 px-4">
                     <p className="text-[9px] font-black text-white/50 uppercase tracking-widest">Superficie</p>
                     <p className="text-[12px] font-bold uppercase text-white">{data.m2} m²</p>
                  </div>
                  <div className="space-y-1 text-right">
                     <p className="text-[9px] font-black text-white/50 uppercase tracking-widest">Calidad</p>
                     <p className="text-[12px] font-bold uppercase text-primary font-black tracking-tight">{config.qualitySettings.find(q=>q.id===data.calidad)?.label}</p>
                  </div>
               </div>

               <div className="bg-black/60 p-12 text-center border border-white/[0.1] relative group shadow-2xl">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[1px] bg-primary group-hover:w-64 transition-all duration-1000" />
                  <p className="text-[10px] text-white/60 font-black uppercase tracking-[0.6em] mb-4">Presupuesto Final · IVA INCLUIDO</p>
                  <h2 className="text-7xl sm:text-8xl font-black text-primary italic leading-none tracking-tighter drop-shadow-[0_0_40px_rgba(245,197,24,0.2)]">{budget.total.toLocaleString()}€</h2>
                  <div className="flex justify-center gap-12 mt-8 py-6 border-t border-white/10">
                     <div className="text-[11px] text-white/60 font-black uppercase tracking-widest">Base (Obra + Extras): <span className="text-white ml-2">{budget.breakdown.base.toLocaleString()}€</span></div>
                     <div className="text-[11px] text-white/60 font-black uppercase tracking-widest">IVA (21%): <span className="text-white ml-2">{budget.breakdown.iva.toLocaleString()}€</span></div>
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
                       <Button variant="outline" className="flex-1 py-8 uppercase font-black tracking-[0.3em] text-[11px] border-white/20 text-white hover:border-primary hover:text-primary transition-all bg-white/[0.02]" onClick={generatePDF}>
                          <Download className="w-5 h-5 mr-3 opacity-90" /> DESCARGAR PRESUPUESTO PDF
                       </Button>
                    </div>
                  ) : (
                    <div className="w-full p-8 bg-primary/10 border border-primary/20 text-center space-y-3 animate-in zoom-in-95 duration-500">
                       <p className="text-primary font-black uppercase tracking-[0.3em] text-xs">¡Solicitud Recibida!</p>
                       <p className="text-white/80 text-sm font-medium leading-relaxed">
                          Un técnico de Conscugar se pondrá en contacto contigo en los <br/> próximos días para concertar una visita y validar el presupuesto.
                       </p>
                    </div>
                  )}
               </div>
            </div>
          )}
        </div>

        {/* Footer Nav */}
         <div className="mt-12 pt-8 border-t border-white/[0.03] flex items-center justify-between">
            <button onClick={prevStep} className={cn("text-[10px] font-black uppercase tracking-widest transition-all p-4", step === 1 || step === 6 ? "invisible" : "text-white/10 hover:text-white/40")}>ATRÁS</button>
            {step < 5 ? (
               <Button onClick={nextStep} disabled={step===1 && !data.tipo} className="px-10 py-6 text-[10px] font-black tracking-widest rounded-none">CONTINUAR</Button>
            ) : step === 5 ? (
               <Button onClick={nextStep} disabled={!data.name || !data.email || !data.phone} className="px-10 py-6 text-[10px] font-black tracking-widest rounded-none">{submitting ? 'VALIDANDO...' : 'CALCULAR'}</Button>
            ) : (
               <button onClick={() => setStep(1)} className="text-[10px] font-black uppercase tracking-widest text-white/10 hover:text-white transition-all p-4">NUEVO CÁLCULO</button>
            )}
         </div>
      </div>
    </div>
  );
};

export default Calculator;
