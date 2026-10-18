import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  ChevronLeft,
  Home as HomeIcon,
  ShowerHead,
  CookingPot,
  Construction,
  Building2,
  Wrench,
  Check,
  Loader2,
  CheckCircle2,
  Download,
  MessageCircle,
  Sparkles,
  ShieldCheck,
  Phone,
  CalendarCheck,
  HelpCircle,
  ArrowLeft,
} from 'lucide-react';
import { calculateBudget, calculateExtraPrice } from '../../constants/pricing';
import { sendLeadNotifications } from '../../services/notifications';
import { cn } from '../../utils/cn';
import { Button } from '../ui/Button';
import { supabase, isSupabaseConfigured } from '../../utils/supabase';

const FALLBACK_CONFIG = {
  projectTypes: [
    { id: 'reforma_integral', name: 'Reforma Integral', description: 'Renovación completa de toda tu vivienda', icon: 'Home', base_price_fallback: 420, display_order: 1 },
    { id: 'bano', name: 'Reforma de Baño', description: 'Cambio de bañera por ducha, azulejos y sanitarios', icon: 'ShowerHead', base_price_fallback: 700, display_order: 2 },
    { id: 'cocina', name: 'Reforma de Cocina', description: 'Renovación completa de cocina, suelos e instalaciones', icon: 'CookingPot', base_price_fallback: 600, display_order: 3 },
    { id: 'obra_nueva', name: 'Obra Nueva', description: 'Construcción de vivienda desde cero en tu parcela', icon: 'Construction', base_price_fallback: 900, display_order: 4 },
  ],
  pricingRanges: [
    { project_type: 'reforma_integral', range_min: 0, range_max: 50, price_per_m2: 480 },
    { project_type: 'reforma_integral', range_min: 50.001, range_max: 100, price_per_m2: 420 },
    { project_type: 'reforma_integral', range_min: 100.001, range_max: 99999, price_per_m2: 390 },
    { project_type: 'bano', range_min: 0, range_max: 8, price_per_m2: 800 },
    { project_type: 'bano', range_min: 8.001, range_max: 99999, price_per_m2: 700 },
    { project_type: 'cocina', range_min: 0, range_max: 15, price_per_m2: 680 },
    { project_type: 'cocina', range_min: 15.001, range_max: 99999, price_per_m2: 600 },
    { project_type: 'obra_nueva', range_min: 0, range_max: 99999, price_per_m2: 950 },
    { project_type: 'rehabilitacion', range_min: 0, range_max: 99999, price_per_m2: 300 },
    { project_type: 'reforma_parcial', range_min: 0, range_max: 99999, price_per_m2: 280 },
  ],
  extras: [
    { id: 'demolicion', name: 'Demolición previa y retirada de escombros al contenedor', price: 1200, project_types: ['reforma_integral', 'bano', 'cocina', 'reforma_parcial'], is_quality_dependent: false, price_type: 'fixed' },
    { id: 'fontaneria', name: 'Tuberías nuevas de agua fría/caliente y desagües', price: 1500, project_types: ['reforma_integral', 'bano', 'cocina'], is_quality_dependent: true, price_basic: 1200, price_medium: 1500, price_high: 2200, price_premium: 3200, price_type: 'fixed' },
    { id: 'electricidad', name: 'Electricidad nueva (cableado, enchufes y cuadro)', price: 2200, project_types: ['reforma_integral', 'bano', 'cocina', 'obra_nueva'], is_quality_dependent: true, price_basic: 1800, price_medium: 2200, price_high: 3100, price_premium: 4500, price_type: 'fixed' },
    { id: 'climatizacion', name: 'Aire acondicionado y climatización por conductos', price: 3500, project_types: ['reforma_integral', 'obra_nueva'], is_quality_dependent: false, price_type: 'fixed' },
    { id: 'pintura', name: 'Alisado y pintura completa de paredes y techos', price: 18, project_types: ['reforma_integral', 'bano', 'cocina', 'obra_nueva', 'rehabilitacion', 'reforma_parcial'], is_quality_dependent: true, price_basic: 14, price_medium: 18, price_high: 25, price_premium: 35, price_type: 'm2' },
    { id: 'pladur', name: 'Nuevos tabiques y falsos techos de pladur con aislamiento', price: 25, project_types: ['reforma_integral', 'obra_nueva', 'reforma_parcial'], is_quality_dependent: false, price_type: 'm2' },
  ],
  qualitySettings: [
    { id: 'basica', label: 'Funcional · Económica', multiplier: 0.8, description: 'Materiales resistentes y prácticos. Ideal para actualizar una vivienda o destinarla a alquiler con coste ajustado.' },
    { id: 'media', label: 'Calidad Media · Estudio (La más elegida)', multiplier: 1.0, description: 'El equilibrio perfecto para tu vivienda habitual: suelos porcelánicos rectificados, buenos aislamientos y primeras marcas.' },
    { id: 'alta', label: 'Gama Alta · Diseño Superior', multiplier: 1.3, description: 'Acabados de diseño, carpintería a medida, griferías empotradas e iluminación indirecta.' },
    { id: 'premium', label: 'Exclusiva · Todo a Medida', multiplier: 1.7, description: 'Materiales de autor, piedra natural, domótica y equipamiento de máxima gama.' },
  ],
  housingSettings: [
    { id: 'piso', label: 'Piso en bloque', multiplier: 1.0 },
    { id: 'casa', label: 'Casa de pueblo / Adosado', multiplier: 1.05 },
    { id: 'chalet', label: 'Chalet independiente', multiplier: 1.1 },
    { id: 'local', label: 'Local comercial / Bajo', multiplier: 1.15 },
  ],
  globalSettings: [
    { key: 'price_margin', value: '0.12' },
    { key: 'iva_rate', value: '0.21' },
    { key: 'contact_phone', value: '34600000000' }
  ]
};

// Superficie por defecto lógica según criterio de Aparejador para que el usuario nunca parta de 0 ni arrastre m² incoherentes
const getDefaultM2ForType = (tipo = '') => {
  const t = String(tipo).toLowerCase();
  if (t.includes('bano') || t.includes('baño')) return 5;
  if (t.includes('cocina')) return 10;
  if (t.includes('obra_nueva')) return 140;
  if (t.includes('parcial')) return 35;
  return 80; // Reforma integral estándar (piso ~80 m²)
};

// Explicación clara de lo que ya incluye el presupuesto base según el tipo de obra
const getBaseInclusionsForType = (tipo = '') => {
  const t = String(tipo).toLowerCase();
  if (t.includes('bano') || t.includes('baño')) {
    return 'Mano de obra de albañilería, alicatado de paredes, suelo porcelánico antideslizante, colocación de plato de ducha/sanitarios y dirección de obra.';
  }
  if (t.includes('cocina')) {
    return 'Mano de obra de albañilería, revestimiento de paredes y suelo porcelánico, preparación de tomas para mobiliario/electrodomésticos y dirección técnica.';
  }
  if (t.includes('obra_nueva')) {
    return 'Cimentación, estructura, cerramientos con aislamiento térmico/acústico, cubiertas, distribución interior, acabados y dirección facultativa de ejecución.';
  }
  return 'Mano de obra completa de todos los gremios, redistribución base, suelos, revestimientos de baños y cocina, dirección técnica de aparejador y coordinación.';
};

// Hook de conteo a 60fps directo al DOM con soporte prefers-reduced-motion
const useAnimatedPriceRef = (target, active) => {
  const nodeRef = useRef(null);

  useEffect(() => {
    if (!active || !nodeRef.current) return;
    const finalValue = Number(target) || 0;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      nodeRef.current.textContent = `${finalValue.toLocaleString('es-ES')} €`;
      return;
    }

    let rafId;
    const duration = 1100;
    const start = performance.now();

    const stepAnim = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      if (nodeRef.current) {
        nodeRef.current.textContent = `${Math.round(finalValue * eased).toLocaleString('es-ES')} €`;
      }
      if (progress < 1) {
        rafId = requestAnimationFrame(stepAnim);
      }
    };

    rafId = requestAnimationFrame(stepAnim);
    return () => cancelAnimationFrame(rafId);
  }, [target, active]);

  return nodeRef;
};

const stepVariants = {
  enter: (dir) => ({
    opacity: 0,
    x: dir > 0 ? 14 : -14,
    scale: 0.992,
    filter: 'blur(2px)',
  }),
  center: {
    opacity: 1,
    x: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.46, ease: [0.22, 1, 0.36, 1] },
  },
  exit: (dir) => ({
    opacity: 0,
    x: dir > 0 ? -12 : 12,
    scale: 0.995,
    filter: 'blur(2px)',
    transition: { duration: 0.24, ease: [0.4, 0, 1, 1] },
  }),
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

const Calculator = () => {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [visitRequested, setVisitRequested] = useState(false);
  const [currentLeadId, setCurrentLeadId] = useState(null);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [submitWarning, setSubmitWarning] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [pdfDownloaded, setPdfDownloaded] = useState(false);

  // Modo de Contacto Directo Rápido (para quien NO quiere usar la calculadora paso a paso)
  const [directContactMode, setDirectContactMode] = useState(false);
  const [directContactSent, setDirectContactSent] = useState(false);
  const [directNote, setDirectNote] = useState('');

  const containerRef = useRef(null);
  const [config, setConfig] = useState(FALLBACK_CONFIG);

  const [data, setData] = useState({
    tipo: '',
    m2: 80,
    hasElevator: true,
    propertyAge: '1970_2000',
    calidad: 'media',
    vivienda: 'piso',
    selectedExtras: [],
    name: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    fetchFullConfig();

    // Permitir abrir el formulario de contacto directo desde cualquier botón externo (ej. en Hero)
    const handleOpenDirect = () => {
      setDirectContactMode(true);
      setDirectContactSent(false);
    };
    window.addEventListener('conscugar:open-direct-contact', handleOpenDirect);
    return () => window.removeEventListener('conscugar:open-direct-contact', handleOpenDirect);
  }, []);

  // Auto-avance al seleccionar tipo de obra en paso 1
  useEffect(() => {
    if (step === 1 && data.tipo && !directContactMode) {
      const t = setTimeout(() => {
        setDirection(1);
        setStep(s => s === 1 ? 2 : s);
      }, 280);
      return () => clearTimeout(t);
    }
  }, [data.tipo, step, directContactMode]);

  const fetchFullConfig = async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
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
        projectTypes: projectsRes.data?.length ? projectsRes.data : FALLBACK_CONFIG.projectTypes,
        pricingRanges: pricingRes.data?.length ? pricingRes.data : FALLBACK_CONFIG.pricingRanges,
        extras: extrasRes.data?.length ? extrasRes.data : FALLBACK_CONFIG.extras,
        qualitySettings: qualityRes.data?.length ? qualityRes.data : FALLBACK_CONFIG.qualitySettings,
        housingSettings: housingRes.data?.length ? housingRes.data : FALLBACK_CONFIG.housingSettings,
        globalSettings: globalRes.data?.length ? globalRes.data : FALLBACK_CONFIG.globalSettings
      };

      setConfig(newConfig);

      setData(prev => ({
        ...prev,
        calidad: prev.calidad || (newConfig.qualitySettings.find(s => s.id === 'media')?.id || newConfig.qualitySettings[0]?.id),
        vivienda: prev.vivienda || (newConfig.housingSettings.find(s => s.id === 'piso')?.id || newConfig.housingSettings[0]?.id)
      }));
    } catch (err) {
      console.error("Usando configuración local de respaldo:", err);
    } finally {
      setLoading(false);
    }
  };

  const getContactPhone = () => {
    const phoneSetting = config.globalSettings?.find(s => s.key === 'contact_phone');
    return phoneSetting ? phoneSetting.value : '34600000000';
  };

  const nextStep = async () => {
    setDirection(1);
    if (step === 6) await handleSubmit();
    else {
      setStep(s => {
        let n = s + 1;
        if (n === 3 && data.tipo === 'obra_nueva') n = 4;
        return Math.min(n, 7);
      });
    }
  };

  const prevStep = () => {
    setDirection(-1);
    setStep(s => {
      let p = s - 1;
      if (p === 3 && data.tipo === 'obra_nueva') p = 2;
      return Math.max(p, 1);
    });
  };

  const updateData = (key, value) => {
    setData(prev => {
      let val = value;

      if (key === 'm2') {
        const isBano = prev.tipo.includes('bano') || prev.tipo.includes('baño');
        const isCocina = prev.tipo.includes('cocina');
        const maxM2 = isBano ? 50 : isCocina ? 80 : 3000;
        const intVal = Math.round(Number(val) || 0);
        val = Math.min(Math.max(0, intVal), maxM2);
      }

      const newData = { ...prev, [key]: val };

      if (key === 'tipo') {
        newData.selectedExtras = [];
        const projectType = config.projectTypes.find(p => p.id === val);
        // Asignar siempre los m² habituales del tipo de obra elegido para que un Baño no herede 80 m² de un Piso
        newData.m2 = projectType?.default_m2
          ? Math.round(Number(projectType.default_m2))
          : getDefaultM2ForType(val);

        if (val === 'obra_nueva') {
          newData.vivienda = 'chalet';
          newData.propertyAge = 'post_2000';
          newData.hasElevator = true;
        } else {
          if (!newData.propertyAge) newData.propertyAge = '1970_2000';
          if (newData.hasElevator === null) newData.hasElevator = true;
        }
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

  const validateContact = (isDirect = false) => {
    const errors = {};
    if (!data.name.trim() || data.name.trim().length < 2) errors.name = 'Introduce tu nombre (mín. 2 caracteres)';
    const phoneClean = data.phone.replace(/\s/g, '');
    if (!phoneClean) errors.phone = 'El teléfono es obligatorio para poder llamarte';
    else if (!/^[+]?[0-9]{9,15}$/.test(phoneClean)) errors.phone = 'Introduce un teléfono válido (9 dígitos)';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!isDirect) {
      if (!data.email.trim()) errors.email = 'El correo electrónico es obligatorio';
      else if (!emailRegex.test(data.email)) errors.email = 'Formato de correo no válido';
    } else if (data.email.trim() && !emailRegex.test(data.email)) {
      errors.email = 'Formato de correo no válido';
    }

    if (!privacyAccepted) errors.privacy = 'Debes aceptar la política de privacidad';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Envío desde Contacto Directo (sin pasar por los 6 pasos de la calculadora)
  const handleDirectContactSubmit = async (e) => {
    e.preventDefault();
    if (!validateContact(true)) return;
    setSubmitting(true);

    const fallbackType = data.tipo || config.projectTypes[0]?.id || 'reforma_integral';
    const fallbackM2 = data.m2 > 0 ? data.m2 : getDefaultM2ForType(fallbackType);
    const fallbackEmail = data.email.trim() || 'contacto-directo@conscugar.es';

    const directData = {
      ...data,
      tipo: fallbackType,
      m2: fallbackM2,
      email: fallbackEmail,
    };
    const estimatedBudget = calculateBudget(directData, config) || {
      total: 0,
      min: 0,
      max: 0,
      breakdown: { ivaPercent: 21 }
    };

    try {
      if (isSupabaseConfigured) {
        const generatedId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : undefined;
        const payload = {
          ...(generatedId ? { id: generatedId } : {}),
          name: data.name.trim(),
          email: fallbackEmail,
          phone: data.phone.trim(),
          project_type: fallbackType,
          m2: Math.round(Number(fallbackM2)),
          calidad: data.calidad || 'media',
          vivienda: data.vivienda || 'piso',
          selected_extras: [],
          has_elevator: true,
          property_age: '1970_2000',
          estimated_total: estimatedBudget.total,
          breakdown: {
            ...estimatedBudget.breakdown,
            directContact: true,
            clientNote: directNote.trim() || 'Solicitud de contacto directo sin usar calculadora'
          }
        };

        const { error } = await supabase.from('leads').insert([payload]);
        if (!error && generatedId) {
          await supabase.rpc('request_technical_visit', { p_lead_id: generatedId });
        }
      }

      await sendLeadNotifications(
        { ...directData, visitRequested: true, directNote: directNote.trim() },
        estimatedBudget
      );
      setDirectContactSent(true);
    } catch (err) {
      console.error("Error guardando contacto directo:", err);
      setDirectContactSent(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateContact(false)) return;
    setSubmitting(true);
    setSubmitWarning('');
    const budget = calculateBudget(data, config);
    const generatedId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : undefined;

    try {
      if (isSupabaseConfigured) {
        const payload = {
          ...(generatedId ? { id: generatedId } : {}),
          name: data.name.trim(),
          email: data.email.trim(),
          phone: data.phone.trim(),
          project_type: data.tipo,
          m2: Math.round(Number(data.m2)),
          calidad: data.calidad,
          vivienda: data.vivienda,
          selected_extras: data.selectedExtras,
          has_elevator: data.hasElevator,
          property_age: data.propertyAge,
          estimated_total: budget.total,
          breakdown: budget.breakdown
        };

        const { error } = await supabase.from('leads').insert([payload]);
        if (error) throw error;
        if (generatedId) setCurrentLeadId(generatedId);
      }

      await sendLeadNotifications(data, budget);

      setStep(7);
      localStorage.removeItem('ccg_step');
      localStorage.removeItem('ccg_data');
    } catch (err) {
      console.error("Error saving lead to Supabase:", err);
      setSubmitWarning('Presupuesto calculado correctamente. Puedes descargar tu dossier en PDF o enviárnoslo por WhatsApp.');
      setStep(7);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestVisit = async () => {
    setVisitRequested(true);
    try {
      if (isSupabaseConfigured && currentLeadId) {
        await supabase.rpc('request_technical_visit', { p_lead_id: currentLeadId });
      }
      await sendLeadNotifications({ ...data, visitRequested: true }, budget);
    } catch (err) {
      console.error("Error registering technical visit request:", err);
    }
  };

  const getHousingDisplayLabel = () => {
    if (data.tipo === 'obra_nueva') return 'Solar / Obra Nueva';
    return config.housingSettings.find(h => h.id === data.vivienda)?.label || data.vivienda;
  };

  const handleWhatsAppSend = () => {
    const contactPhone = getContactPhone();

    const projectTypeLabel = config.projectTypes.find(p => p.id === data.tipo)?.name || data.tipo;
    const qualityLabel = config.qualitySettings.find(q => q.id === data.calidad)?.label || data.calidad;
    const housingLabel = getHousingDisplayLabel();
    const selectedExtrasList = config.extras
      .filter(e => data.selectedExtras.includes(e.id))
      .map(e => `+ ${e.name}`)
      .join('\n');

    const formattedBudgetMin = budget.min.toLocaleString('es-ES');
    const formattedBudgetMax = budget.max.toLocaleString('es-ES');

    let text = `¡Hola Conscugar! Acabo de calcular un presupuesto en vuestra web:\n\n`;
    text += `*Tipo de obra:* ${projectTypeLabel}\n`;
    text += `*Superficie:* ${data.m2} m²\n`;
    text += `*Calidad:* ${qualityLabel}\n`;
    text += `*Inmueble:* ${housingLabel}\n`;
    if (selectedExtrasList) {
      text += `*Partidas adicionales:*\n${selectedExtrasList}\n`;
    }
    text += `\n*Valoración Estimada:* ${budget.total.toLocaleString('es-ES')} € (Horquilla: ${formattedBudgetMin} € - ${formattedBudgetMax} €, IVA 21% e ICIO incluidos).\n\n`;
    text += `Me gustaría comentar los detalles y agendar la visita técnica gratuita. Soy ${data.name || ''}.`;

    const whatsappUrl = `https://wa.me/${contactPhone}?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const generatePDF = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    const now = new Date().toLocaleDateString('es-ES');
    const budget = calculateBudget(data, config);
    if (!budget) return;

    doc.setFillColor(28, 25, 23);
    doc.rect(0, 0, 210, 42, 'F');

    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("CONS", 20, 24);
    const consWidth = doc.getTextWidth("CONS");
    doc.setTextColor(194, 65, 12);
    doc.text("CUGAR", 20 + consWidth, 24);

    doc.setTextColor(214, 211, 209);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.text("ARQUITECTURA, REFORMAS INTEGRALES Y CONSTRUCCIÓN · SAGUNTO Y VALENCIA", 20, 32);

    doc.setTextColor(214, 211, 209);
    doc.text(`EXPEDIENTE #CS-${Math.floor(Math.random() * 9000) + 1000}`, 148, 20);
    doc.text(`FECHA: ${now}`, 148, 25);
    doc.text(`VALIDEZ: 15 DÍAS`, 148, 30);

    doc.setTextColor(28, 25, 23);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("DATOS DEL PROYECTO:", 20, 56);
    doc.setFont("helvetica", "normal");
    doc.text(`Cliente: ${data.name}`, 20, 63);
    doc.text(`Tipología de Inmueble: ${getHousingDisplayLabel()}`, 20, 68);
    doc.text(`Actuación: ${config.projectTypes.find(p => p.id === data.tipo)?.name || data.tipo}`, 20, 73);
    doc.text(`Superficie de Actuación: ${data.m2} m²`, 20, 78);

    doc.setDrawColor(214, 211, 209);
    doc.line(20, 85, 190, 85);
    doc.setFont("helvetica", "bold");
    doc.text("1. MEMORIA Y ALCANCE DE LA ESTIMACIÓN", 20, 94);

    const inclusions = getBaseInclusionsForType(data.tipo);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const splitInclusions = doc.splitTextToSize(inclusions, 165);
    doc.text(splitInclusions, 20, 101);

    let currentY = 106 + (splitInclusions.length * 5);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("DESGLOSE ECONÓMICO POR CAPÍTULOS (P.E.M.)", 20, currentY);
    doc.text("IMPORTE", 165, currentY);

    currentY += 7;
    doc.line(20, currentY - 4, 190, currentY - 4);

    doc.setFont("helvetica", "normal");
    doc.text(`Materiales de Obra y Acabados (incl. ${budget.breakdown.wastePercent}% merma técnica)`, 20, currentY);
    doc.text(`${budget.breakdown.baseMaterial.toLocaleString('es-ES')} €`, 165, currentY);

    currentY += 8;
    doc.text("Mano de Obra Cualificada, Gremios y Dirección Técnica", 20, currentY);
    doc.text(`${budget.breakdown.labor.toLocaleString('es-ES')} €`, 165, currentY);

    currentY += 9;
    const selectedExtrasList = config.extras.filter(e => data.selectedExtras.includes(e.id));
    selectedExtrasList.forEach((extra) => {
      const p = calculateExtraPrice(extra, data);
      doc.text(`+ ${extra.name}`, 24, currentY);
      doc.text(`${p.toLocaleString('es-ES')} €`, 165, currentY);
      currentY += 7.5;
    });

    doc.line(20, currentY - 4, 190, currentY - 4);
    doc.setFont("helvetica", "bold");
    doc.text("SUBTOTAL P.E.M. (Coste de Ejecución de Obra)", 20, currentY);
    doc.text(`${budget.breakdown.pem.toLocaleString('es-ES')} €`, 165, currentY);
    currentY += 8.5;

    doc.setFont("helvetica", "normal");
    doc.text("Reserva de Contingencia y Medios Auxiliares (~5% P.E.M.)", 24, currentY);
    doc.text(`${budget.breakdown.contingency.toLocaleString('es-ES')} €`, 165, currentY);
    currentY += 9.5;

    doc.line(20, currentY - 4, 190, currentY - 4);
    doc.setFont("helvetica", "bold");
    doc.text("BASE IMPONIBLE NETA", 20, currentY);
    doc.text(`${budget.breakdown.baseImponible.toLocaleString('es-ES')} €`, 165, currentY);
    currentY += 8.5;

    doc.setFont("helvetica", "normal");
    doc.text(`I.V.A. Aplicable (${budget.breakdown.ivaPercent}% s/ Base Imponible)`, 24, currentY);
    doc.text(`${budget.breakdown.iva.toLocaleString('es-ES')} €`, 165, currentY);
    currentY += 8;

    doc.text("Estimación Tasas Urbanísticas e ICIO Municipal (~4% P.E.M., exento IVA)", 24, currentY);
    doc.text(`${budget.breakdown.icio.toLocaleString('es-ES')} €`, 165, currentY);
    currentY += 10;

    doc.setFillColor(247, 245, 240);
    doc.rect(122, currentY, 68, 24, 'F');
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("VALORACIÓN TOTAL ESTIMADA:", 126, currentY + 9);
    doc.setFontSize(14);
    doc.setTextColor(194, 65, 12);
    doc.text(`${budget.total.toLocaleString('es-ES')} €`, 126, currentY + 18);

    doc.setFontSize(7.5);
    doc.setTextColor(87, 83, 78);
    doc.text("NOTAS TÉCNICAS Y LEGALES (ESTIMACIÓN PARAMÉTRICA NO VINCULANTE):", 20, 246);
    const legal = [
      "* Valoración orientativa calculada según los metros cuadrados y calidades indicados por el usuario.",
      `* Incluye coeficiente técnico de merma (${budget.breakdown.wastePercent}%), I.V.A. general (${budget.breakdown.ivaPercent}%) y estimación de tasa ICIO.`,
      "* El presupuesto contractual definitivo queda supeditado a la visita técnica presencial gratuita y medición en obra.",
      "* Documento informativo sin carácter de oferta vinculante (RDL 1/2007 LGDCU). Validez de tarifas: 15 días."
    ];
    legal.forEach((line, i) => doc.text(line, 20, 252 + (i * 4)));

    doc.save(`Presupuesto_Conscugar_${data.name.replace(/\s+/g, '_')}.pdf`);
    setPdfDownloaded(true);
  };

  const budget = calculateBudget(data, config);
  const priceNodeRef = useAnimatedPriceRef(budget?.total, step === 7);

  const isContactFormatValid = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneClean = (data.phone || '').replace(/\s/g, '');
    return data.name?.trim().length >= 2 && emailRegex.test(data.email) && /^[+]?[0-9]{9,15}$/.test(phoneClean) && privacyAccepted;
  };

  if (loading) return (
    <div className="w-full max-w-2xl mx-auto bg-white border border-stone-200 rounded-2xl min-h-[540px] flex flex-col items-center justify-center gap-3 shadow-lg" aria-busy="true">
      <Loader2 className="w-8 h-8 text-primary animate-spin" aria-hidden="true" />
      <p className="text-xs font-bold text-stone-600 uppercase tracking-wider">Cargando calculadora de reformas...</p>
    </div>
  );

  const contactPhone = getContactPhone();

  return (
    <div
      className="w-full max-w-2xl mx-auto bg-white border border-stone-200/90 rounded-2xl shadow-[0_24px_60px_-15px_rgba(28,25,23,0.1)] relative transition-all overflow-hidden"
      ref={containerRef}
    >
      {/* MODO CONTACTO DIRECTO (Para el cliente que NO quiere rellenar la calculadora paso a paso) */}
      {directContactMode ? (
        <div className="p-5 sm:p-8 space-y-6">
          <div className="flex items-center justify-between gap-2 border-b border-stone-200 pb-4">
            <button
              type="button"
              onClick={() => {
                setDirectContactMode(false);
                setFormErrors({});
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a la calculadora paso a paso</span>
            </button>
            <span className="px-2.5 py-1 rounded-full bg-orange-50 text-primary text-[11px] font-bold">
              Trato Directo con Aparejador
            </span>
          </div>

          {directContactSent ? (
            <div className="py-8 px-4 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-outfit font-extrabold text-stone-900">
                ¡Recibido, {data.name}! Te llamamos nosotros.
              </h3>
              <p className="text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
                Nuestro aparejador revisará tu solicitud y te contactará al <strong>{data.phone}</strong> en menos de 24h laborables para asesorarte y medir tu obra gratis en Sagunto o Valencia.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
                <a
                  href={`https://wa.me/${contactPhone}?text=${encodeURIComponent(`Hola Conscugar, soy ${data.name}. Acabo de pediros contacto directo por la web.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
                >
                  <MessageCircle className="w-4 h-4" /> Hablar ahora por WhatsApp
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setDirectContactMode(false);
                    setDirectContactSent(false);
                  }}
                  className="px-5 py-3 rounded-xl border border-stone-300 text-xs font-bold text-stone-700 hover:bg-stone-100 transition-colors"
                >
                  Probar también la calculadora
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleDirectContactSubmit} className="space-y-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-outfit font-extrabold text-stone-900">
                  Cuéntanos tu idea y nosotros lo calculamos por ti
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
                  Si no sabes los metros exactos o prefieres hablar directamente con nuestro aparejador, déjanos tu teléfono o escríbenos por WhatsApp. <strong>Visita y presupuesto en obra 100% gratuitos.</strong>
                </p>
              </div>

              {/* Botones inmediatos de WhatsApp y Llamada por si ni siquiera quiere rellenar el formulario */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3.5 rounded-2xl bg-[#F7F5F0] border border-stone-200/90">
                <a
                  href={`https://wa.me/${contactPhone}?text=${encodeURIComponent('Hola Conscugar, prefiero comentaros mi reforma directamente para que me deis presupuesto.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
                >
                  <MessageCircle className="w-4 h-4 fill-current shrink-0" />
                  <span>Escribir por WhatsApp ahora</span>
                </a>
                <a
                  href={`tel:+${contactPhone}`}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold shadow-sm transition-all"
                >
                  <Phone className="w-4 h-4 shrink-0" />
                  <span>Llamar al +{contactPhone}</span>
                </a>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-stone-200" />
                <span className="shrink-0 mx-3 text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  O pídenos que te llamemos gratis
                </span>
                <div className="flex-grow border-t border-stone-200" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="direct-name" className="text-xs font-bold text-stone-700 block">Tu nombre *</label>
                  <input
                    id="direct-name"
                    type="text"
                    value={data.name}
                    onChange={e => { updateData('name', e.target.value); setFormErrors(p => ({ ...p, name: '' })); }}
                    placeholder="Ej: María López"
                    className={cn(
                      "w-full bg-white rounded-xl border p-3.5 text-sm outline-none transition-all font-medium text-stone-900 placeholder:text-stone-400",
                      formErrors.name ? "border-red-600 bg-red-50/30" : "border-stone-300 focus:border-primary"
                    )}
                  />
                  {formErrors.name && <p className="text-xs text-red-600 font-semibold">{formErrors.name}</p>}
                </div>

                <div className="space-y-1">
                  <label htmlFor="direct-phone" className="text-xs font-bold text-stone-700 block">Teléfono / WhatsApp *</label>
                  <input
                    id="direct-phone"
                    type="tel"
                    inputMode="tel"
                    value={data.phone}
                    onChange={e => { updateData('phone', e.target.value); setFormErrors(p => ({ ...p, phone: '' })); }}
                    placeholder="Ej: 600 123 456"
                    className={cn(
                      "w-full bg-white rounded-xl border p-3.5 text-sm outline-none transition-all font-medium text-stone-900 placeholder:text-stone-400 tabular-nums",
                      formErrors.phone ? "border-red-600 bg-red-50/30" : "border-stone-300 focus:border-primary"
                    )}
                  />
                  {formErrors.phone && <p className="text-xs text-red-600 font-semibold">{formErrors.phone}</p>}
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="direct-note" className="text-xs font-bold text-stone-700 block">
                  ¿Qué necesitas reformar y en qué zona está? (Opcional)
                </label>
                <textarea
                  id="direct-note"
                  rows={2}
                  value={directNote}
                  onChange={e => setDirectNote(e.target.value)}
                  placeholder="Ej: Quiero reformar un baño y cocina en Puerto de Sagunto y prefiero que vengáis a verlo..."
                  className="w-full bg-white rounded-xl border border-stone-300 focus:border-primary p-3 text-sm outline-none transition-all font-medium text-stone-900 placeholder:text-stone-400"
                />
              </div>

              <div className="space-y-1">
                <label className="flex items-start gap-3 p-3 rounded-xl bg-[#F7F5F0] border border-stone-200 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={privacyAccepted}
                    onChange={(e) => {
                      setPrivacyAccepted(e.target.checked);
                      setFormErrors(p => ({ ...p, privacy: '' }));
                    }}
                    className="mt-0.5 accent-primary w-4 h-4 shrink-0"
                  />
                  <span className="text-xs text-stone-600 leading-relaxed">
                    Acepto la{' '}
                    <Link to="/privacidad" target="_blank" rel="noopener noreferrer" className="text-primary underline font-semibold">
                      Política de Privacidad
                    </Link>{' '}
                    para que Conscugar me contacte sin compromiso.
                  </span>
                </label>
                {formErrors.privacy && <p className="text-xs text-red-600 font-semibold">{formErrors.privacy}</p>}
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full py-4 text-xs sm:text-sm font-bold rounded-xl shadow-md"
              >
                {submitting ? 'Enviando solicitud...' : 'Solicitar Llamada y Visita Gratuita →'}
              </Button>
            </form>
          )}
        </div>
      ) : (
        <>
          {/* Cabecera de Progreso Interactiva */}
          <div className="px-4 sm:px-6 pt-4 pb-3.5 bg-[#F7F5F0] border-b border-stone-200/90 relative z-10">
            <div className="flex items-start justify-between" role="navigation" aria-label="Pasos del presupuesto">
              {['Obra', 'Tamaño', 'Vivienda', 'Calidad', 'Extras', 'Tus datos', 'Precio'].map((label, i) => {
                const s = i + 1;
                const isActive = step === s;
                const isDone = step > s;
                const canJump = isDone && step < 7;
                return (
                  <React.Fragment key={s}>
                    <button
                      type="button"
                      disabled={!canJump}
                      title={canJump ? `Volver al paso ${s}: ${label}` : `Paso ${s}: ${label}`}
                      aria-current={isActive ? 'step' : undefined}
                      onClick={() => {
                        if (!canJump) return;
                        setDirection(-1);
                        if (s === 3 && data.tipo === 'obra_nueva') setStep(2);
                        else setStep(s);
                      }}
                      className={cn(
                        "flex flex-col items-center gap-1 py-0.5 px-1 transition-all",
                        canJump ? "cursor-pointer group" : "cursor-default"
                      )}
                    >
                      <div className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-300 tabular-nums",
                        isActive ? "bg-primary text-white shadow-sm shadow-primary/30 scale-105" :
                        isDone ? "bg-orange-950/10 text-primary group-hover:bg-primary group-hover:text-white" : "bg-stone-200/80 text-stone-500"
                      )}>
                        {isDone ? <Check className="w-3.5 h-3.5 stroke-[3px]" /> : s}
                      </div>
                      <span className={cn(
                        "text-[10px] font-bold hidden sm:block transition-all leading-none",
                        isActive ? "text-primary" : isDone ? "text-stone-700 group-hover:text-primary" : "text-stone-400"
                      )}>{label}</span>
                    </button>
                    {s < 7 && <div className={cn("flex-1 h-[1px] mt-3.5 mx-0.5 sm:mx-1 transition-all duration-500", isDone ? "bg-primary/40" : "bg-stone-200")} />}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Barra de Estimación en Vivo (Pasos 2 al 6) */}
            {step >= 2 && step <= 6 && budget && (
              <div className="mt-3 pt-2.5 border-t border-stone-200/80 flex items-center justify-between gap-2 text-xs" aria-live="polite">
                <span className="text-stone-600 font-medium flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" aria-hidden="true" />
                  <span>Estimación en vivo ({data.m2} m² · IVA 21% incl.):</span>
                </span>
                <span className="font-outfit font-extrabold text-stone-900 tabular-nums bg-white px-2.5 py-1 rounded-lg border border-stone-200">
                  {budget.min.toLocaleString('es-ES')} € – {budget.max.toLocaleString('es-ES')} €
                </span>
              </div>
            )}
          </div>

          <div className="p-5 sm:p-8 min-h-[470px] flex flex-col justify-between relative z-20">
            <div>
              <div className="mb-5">
                <span className="text-primary text-xs font-extrabold uppercase tracking-wider mb-1 block">
                  Paso {step} de 7
                </span>
                <h2 className="text-2xl sm:text-3xl font-outfit font-extrabold tracking-tight text-stone-900">
                  {step === 1 && "¿Qué necesitas reformar o construir?"}
                  {step === 2 && "¿Qué tamaño aproximado tiene?"}
                  {step === 3 && "¿Cómo es tu inmueble?"}
                  {step === 4 && "¿Qué nivel de acabados buscas?"}
                  {step === 5 && "¿Necesitas renovar también estas instalaciones?"}
                  {step === 6 && "¿Dónde te mostramos tu presupuesto detallado?"}
                  {step === 7 && "Tu Presupuesto Estimado al Detalle"}
                </h2>
              </div>

              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={step}
                  custom={direction}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                >
                  {/* PASO 1: TIPO DE OBRA (Cuadrícula 2x2 para 4 tipos) */}
                  {step === 1 && (
                    <div
                      className={cn(
                        "grid gap-3.5",
                        config.projectTypes.length <= 4
                          ? "grid-cols-1 sm:grid-cols-2"
                          : "grid-cols-2 sm:grid-cols-3"
                      )}
                      role="group"
                      aria-label="Selecciona el tipo de obra"
                    >
                      {config.projectTypes.map(type => {
                        const Icon = ICON_MAP[type.icon] || HomeIcon;
                        const isActive = data.tipo === type.id;
                        return (
                          <button
                            key={type.id}
                            type="button"
                            aria-pressed={isActive}
                            onClick={() => updateData('tipo', type.id)}
                            className={cn(
                              "relative p-5 rounded-2xl border cursor-pointer transition-all flex items-center sm:flex-col gap-4 sm:gap-3 group min-h-[92px] sm:min-h-[144px] sm:justify-center sm:items-center text-left sm:text-center",
                              isActive
                                ? "border-primary bg-orange-50/70 shadow-sm ring-1 ring-primary"
                                : "border-stone-200 bg-[#F7F5F0]/50 hover:bg-white hover:border-primary/40"
                            )}
                          >
                            <div className={cn(
                              "w-11 h-11 rounded-xl flex items-center justify-center transition-colors shrink-0",
                              isActive ? "bg-primary text-white" : "bg-white border border-stone-200 text-stone-700 group-hover:text-primary"
                            )}>
                              <Icon aria-hidden="true" className="w-5 h-5" />
                            </div>
                            <div className="space-y-1 min-w-0">
                              <span className="text-sm sm:text-base font-bold text-stone-900 block leading-snug">
                                {type.name}
                              </span>
                              {type.description && (
                                <span className="text-xs text-stone-500 block line-clamp-1">
                                  {type.description}
                                </span>
                              )}
                              <span className={cn(
                                "text-[11px] font-semibold block pt-0.5",
                                isActive ? "text-primary" : "text-stone-400 group-hover:text-primary"
                              )}>
                                {isActive ? '✓ Seleccionado' : 'Seleccionar →'}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* PASO 2: SUPERFICIE CON GUÍA HUMANA PARA QUIEN NO SABE LOS M² */}
                  {step === 2 && (() => {
                    const isBano = data.tipo?.includes('bano') || data.tipo?.includes('baño');
                    const isCocina = data.tipo?.includes('cocina');
                    const isObraNueva = data.tipo === 'obra_nueva';

                    const presetsWithLabels = isBano
                      ? [
                          { m: 3, desc: 'Aseo pequeño' },
                          { m: 5, desc: 'Baño estándar' },
                          { m: 7, desc: 'Baño amplio' },
                          { m: 10, desc: 'Baño suite' },
                        ]
                      : isCocina
                        ? [
                            { m: 6, desc: 'Cocina pequeña' },
                            { m: 10, desc: 'Cocina estándar' },
                            { m: 14, desc: 'Con zona office' },
                            { m: 20, desc: 'Abierta al salón' },
                          ]
                        : isObraNueva
                          ? [
                              { m: 100, desc: '1 planta' },
                              { m: 140, desc: 'Unifamiliar media' },
                              { m: 180, desc: '2 plantas' },
                              { m: 240, desc: 'Chalet grande' },
                            ]
                          : [
                              { m: 55, desc: 'Piso 1–2 hab.' },
                              { m: 80, desc: 'Piso 3 hab. (Habitual)' },
                              { m: 105, desc: 'Piso grande 4 hab.' },
                              { m: 140, desc: 'Casa / Ático' },
                            ];

                    const stepDelta = isBano || isCocina ? 1 : 5;
                    const maxM2 = isBano ? 50 : isCocina ? 80 : 3000;

                    return (
                      <div className="space-y-6 py-2 text-center">
                        <div className="flex items-center justify-center gap-3 sm:gap-8">
                          <button
                            type="button"
                            aria-label="Disminuir metros cuadrados"
                            onClick={() => updateData('m2', Math.max(1, Math.round(Number(data.m2) || 0) - stepDelta))}
                            className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-xl border border-stone-300 bg-[#F7F5F0] flex items-center justify-center hover:border-primary hover:text-primary transition-all text-stone-700 active:scale-95"
                          >
                            <ChevronLeft className="w-6 h-6" aria-hidden="true" />
                          </button>

                          <div className="relative min-w-[130px] sm:min-w-[160px] flex flex-col items-center">
                            <div className="flex items-baseline justify-center gap-1.5">
                              <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                aria-label="Superficie en metros cuadrados"
                                value={data.m2 === 0 ? '' : data.m2}
                                onChange={(e) => {
                                  const digitsOnly = e.target.value.replace(/[^0-9]/g, '');
                                  const val = digitsOnly === '' ? 0 : Math.min(parseInt(digitsOnly, 10), maxM2);
                                  updateData('m2', val);
                                }}
                                placeholder="0"
                                className="bg-transparent text-5xl sm:text-7xl font-outfit font-extrabold text-center w-28 sm:w-36 outline-none text-stone-900 tabular-nums border-b-2 border-stone-300 focus:border-primary transition-colors pb-1"
                              />
                              <span className="text-xl sm:text-2xl font-outfit font-bold text-stone-400">m²</span>
                            </div>
                            <span className="text-[11px] font-semibold text-stone-500 mt-1.5">
                              Puedes escribir cualquier medida desde 1 m²
                            </span>
                          </div>

                          <button
                            type="button"
                            aria-label="Aumentar metros cuadrados"
                            onClick={() => updateData('m2', Math.min(maxM2, Math.round(Number(data.m2) || 0) + stepDelta))}
                            className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-xl border border-stone-300 bg-[#F7F5F0] flex items-center justify-center hover:border-primary hover:text-primary transition-all text-stone-700 active:scale-95"
                          >
                            <ChevronRight className="w-6 h-6" aria-hidden="true" />
                          </button>
                        </div>

                        <div className="space-y-2">
                          <p className="text-xs font-bold text-stone-600">
                            ¿No sabes los metros exactos? Elige el tamaño más parecido:
                          </p>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {presetsWithLabels.map(({ m, desc }) => (
                              <button
                                type="button"
                                key={m}
                                aria-pressed={data.m2 === m}
                                onClick={() => updateData('m2', m)}
                                className={cn(
                                  "p-2.5 rounded-xl border transition-all text-center flex flex-col items-center justify-center gap-0.5",
                                  data.m2 === m
                                    ? "bg-primary text-white border-primary shadow-sm"
                                    : "bg-[#F7F5F0] border-stone-200 text-stone-800 hover:border-primary/40 hover:bg-white"
                                )}
                              >
                                <span className="text-sm font-extrabold tabular-nums">{m} m²</span>
                                <span className={cn("text-[10px] font-medium", data.m2 === m ? "text-orange-100" : "text-stone-500")}>
                                  {desc}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <p className="text-xs text-stone-500 leading-relaxed max-w-md mx-auto">
                          Tranquilo/a: es solo para darte un precio orientativo inmediato. Si te encaja, nuestro aparejador irá a medirlo gratis con láser.
                        </p>
                      </div>
                    );
                  })()}

                  {/* PASO 3: LOGÍSTICA E INMUEBLE (Con valores por defecto para que nadie se bloquee) */}
                  {step === 3 && (
                    <div className="space-y-5">
                      <p className="text-xs text-stone-600 leading-relaxed">
                        Estos datos nos ayudan a prever la subida de materiales, retirada de escombros y el estado general de las tuberías del edificio:
                      </p>

                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block">
                          1. ¿Dónde vamos a hacer la reforma?
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5" role="group" aria-label="Tipo de inmueble">
                          {config.housingSettings.map(h => (
                            <button
                              type="button"
                              aria-pressed={data.vivienda === h.id}
                              key={h.id}
                              onClick={() => updateData('vivienda', h.id)}
                              className={cn(
                                "min-h-[48px] p-3 rounded-xl border transition-all text-xs font-bold flex justify-center items-center text-center",
                                data.vivienda === h.id
                                  ? "border-primary bg-orange-50/80 text-primary-dark ring-1 ring-primary"
                                  : "border-stone-200 bg-[#F7F5F0]/60 text-stone-700 hover:border-primary/40 hover:bg-white"
                              )}
                            >
                              {h.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-stone-200/80">
                        {data.vivienda === 'piso' && (
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block">
                              2. ¿El edificio tiene ascensor?
                            </label>
                            <div className="grid grid-cols-2 gap-2.5" role="group" aria-label="Disponibilidad de ascensor">
                              <button
                                type="button"
                                aria-pressed={data.hasElevator === true}
                                onClick={() => updateData('hasElevator', true)}
                                className={cn(
                                  "min-h-[48px] p-3 rounded-xl border transition-all text-xs font-bold",
                                  data.hasElevator === true
                                    ? "border-primary bg-orange-50/80 text-primary-dark ring-1 ring-primary"
                                    : "border-stone-200 bg-[#F7F5F0]/60 text-stone-700 hover:bg-white"
                                )}
                              >
                                Sí tiene ascensor
                              </button>
                              <button
                                type="button"
                                aria-pressed={data.hasElevator === false}
                                onClick={() => updateData('hasElevator', false)}
                                className={cn(
                                  "min-h-[48px] p-3 rounded-xl border transition-all text-xs font-bold",
                                  data.hasElevator === false
                                    ? "border-primary bg-orange-50/80 text-primary-dark ring-1 ring-primary"
                                    : "border-stone-200 bg-[#F7F5F0]/60 text-stone-700 hover:bg-white"
                                )}
                              >
                                No tiene ascensor
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block">
                            Antigüedad aproximada de la vivienda
                          </label>
                          <div className="grid grid-cols-1 gap-2" role="group" aria-label="Antigüedad aproximada">
                            {[
                              { id: 'post_2000', label: 'Menos de 25 años (Desde el año 2000)' },
                              { id: '1970_2000', label: 'Entre 25 y 55 años (Lo más habitual)' },
                              { id: 'pre_1970', label: 'Más de 55 años (Vivienda antigua)' },
                            ].map(age => (
                              <button
                                key={age.id}
                                type="button"
                                aria-pressed={data.propertyAge === age.id}
                                onClick={() => updateData('propertyAge', age.id)}
                                className={cn(
                                  "min-h-[42px] px-3.5 py-2 rounded-xl border text-left transition-all text-xs font-bold flex items-center justify-between",
                                  data.propertyAge === age.id
                                    ? "border-primary bg-orange-50/80 text-primary-dark ring-1 ring-primary"
                                    : "border-stone-200 bg-[#F7F5F0]/60 text-stone-700 hover:bg-white"
                                )}
                              >
                                <span>{age.label}</span>
                                {data.propertyAge === age.id && <Check className="w-4 h-4 text-primary shrink-0" />}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PASO 4: CALIDADES EXPLICADAS EN LENGUAJE HUMANO */}
                  {step === 4 && (
                    <div className="grid grid-cols-1 gap-3" role="group" aria-label="Selecciona el nivel de calidad">
                      {[...config.qualitySettings].sort((a, b) => a.multiplier - b.multiplier).map(q => {
                        const isActive = data.calidad === q.id;
                        return (
                          <button
                            type="button"
                            aria-pressed={isActive}
                            key={q.id}
                            onClick={() => updateData('calidad', q.id)}
                            className={cn(
                              "w-full text-left p-4 rounded-xl border cursor-pointer flex flex-col gap-1 transition-all",
                              isActive
                                ? "border-primary bg-orange-50/70 ring-1 ring-primary shadow-sm"
                                : "border-stone-200 bg-[#F7F5F0]/50 hover:bg-white hover:border-primary/40"
                            )}
                          >
                            <div className="flex justify-between items-center w-full">
                              <span className="text-sm font-bold text-stone-900">{q.label}</span>
                              <div className={cn(
                                "w-5 h-5 rounded-full border flex items-center justify-center transition-colors shrink-0",
                                isActive ? "bg-primary border-primary text-white" : "border-stone-300 bg-white"
                              )}>
                                {isActive && <Check className="w-3 h-3 stroke-[3px]" />}
                              </div>
                            </div>
                            {q.description && (
                              <p className="text-xs text-stone-600 leading-relaxed">
                                {q.description}
                              </p>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* PASO 5: ¿QUÉ INCLUYE YA LA BASE Y QUÉ PARTIDAS ADICIONALES SUMAR? */}
                  {step === 5 && (() => {
                    const availableExtras = config.extras.filter(e => (e.project_types || []).some(t => String(t) === String(data.tipo)));
                    const extrasSubtotal = data.selectedExtras.reduce((acc, id) => {
                      const extra = config.extras.find(e => e.id === id);
                      if (!extra) return acc;
                      return acc + calculateExtraPrice(extra, data);
                    }, 0);

                    return (
                      <div className="space-y-4">
                        {/* Caja informativa clave para un usuario sin idea: qué incluye ya el precio base */}
                        <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200/90 text-left">
                          <p className="text-xs font-extrabold text-emerald-900 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Ya incluido en tu precio base ({data.m2} m²):</span>
                          </p>
                          <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                            {getBaseInclusionsForType(data.tipo)}
                          </p>
                        </div>

                        {availableExtras.length > 0 && (
                          <>
                            <p className="text-xs font-semibold text-stone-700">
                              Marca solo si además necesitas hacer alguna de estas actuaciones (opcional):
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-none sm:max-h-[250px] sm:overflow-y-auto pr-1" role="group" aria-label="Partidas adicionales">
                              {availableExtras.map(extra => {
                                const isSelected = data.selectedExtras.includes(extra.id);
                                const extraPrice = calculateExtraPrice(extra, data);
                                return (
                                  <button
                                    type="button"
                                    role="checkbox"
                                    aria-checked={isSelected}
                                    key={extra.id}
                                    onClick={() => toggleExtra(extra.id)}
                                    className={cn(
                                      "w-full min-h-[58px] text-left p-3 rounded-xl border cursor-pointer flex items-center gap-3 transition-all",
                                      isSelected
                                        ? "border-primary bg-orange-50/70 ring-1 ring-primary"
                                        : "border-stone-200 bg-[#F7F5F0]/50 hover:bg-white hover:border-primary/40"
                                    )}
                                  >
                                    <div aria-hidden="true" className={cn(
                                      "w-5 h-5 rounded-md shrink-0 border flex items-center justify-center transition-all",
                                      isSelected ? "bg-primary border-primary text-white" : "border-stone-300 bg-white text-transparent"
                                    )}>
                                      <Check className="w-3.5 h-3.5 stroke-[3px]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-bold text-stone-900 leading-snug">{extra.name}</p>
                                      <p className="text-xs text-primary font-extrabold tabular-nums mt-0.5">
                                        +{extraPrice.toLocaleString('es-ES')} €
                                      </p>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-xl bg-[#F7F5F0] border border-stone-200">
                              <span className="text-xs text-stone-600">
                                {extrasSubtotal > 0 ? 'Extras añadidos al cálculo:' : '¿No estás seguro? Déjalo sin marcar y pulsa Continuar'}
                              </span>
                              <span className="text-xs font-extrabold text-primary tabular-nums shrink-0 ml-2">
                                {extrasSubtotal > 0 ? `+${extrasSubtotal.toLocaleString('es-ES')} €` : '0 € (Opcional)'}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })()}

                  {/* PASO 6: CONTACTO Y RGPD */}
                  {step === 6 && (
                    <div className="space-y-4 max-w-lg mx-auto">
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          config.projectTypes.find(p => p.id === data.tipo)?.name,
                          data.m2 ? `${data.m2} m²` : null,
                          config.qualitySettings.find(q => q.id === data.calidad)?.label,
                          getHousingDisplayLabel(),
                        ].filter(Boolean).map((tag, i) => (
                          <span key={i} className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-orange-950/[0.06] text-primary-dark">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="p-3.5 rounded-xl bg-[#F7F5F0] border border-stone-200 text-xs text-stone-700 leading-relaxed flex items-start gap-2.5">
                        <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                        <span>
                          Tu presupuesto completo con desglose de mano de obra, materiales, tasas municipales e IVA ({budget?.breakdown.ivaPercent}%) se muestra al instante en la siguiente pantalla y podrás descargarlo en PDF.
                        </span>
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="lead-name" className="text-xs font-bold text-stone-700 block">Nombre y apellidos</label>
                        <input
                          id="lead-name"
                          type="text"
                          autoComplete="name"
                          value={data.name}
                          onChange={e => { updateData('name', e.target.value); setFormErrors(p => ({ ...p, name: '' })); }}
                          placeholder="Ej: Carlos Martínez"
                          className={cn(
                            "w-full bg-white rounded-xl border p-3.5 text-sm outline-none transition-all font-medium text-stone-900 placeholder:text-stone-400",
                            formErrors.name ? "border-red-600 bg-red-50/30" : "border-stone-300 focus:border-primary"
                          )}
                        />
                        {formErrors.name && <p className="text-xs text-red-600 font-semibold" role="alert">{formErrors.name}</p>}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label htmlFor="lead-phone" className="text-xs font-bold text-stone-700 block">Teléfono / WhatsApp</label>
                          <input
                            id="lead-phone"
                            type="tel"
                            inputMode="tel"
                            autoComplete="tel"
                            value={data.phone}
                            onChange={e => { updateData('phone', e.target.value); setFormErrors(p => ({ ...p, phone: '' })); }}
                            placeholder="Ej: 600 123 456"
                            className={cn(
                              "w-full bg-white rounded-xl border p-3.5 text-sm outline-none transition-all font-medium text-stone-900 placeholder:text-stone-400 tabular-nums",
                              formErrors.phone ? "border-red-600 bg-red-50/30" : "border-stone-300 focus:border-primary"
                            )}
                          />
                          {formErrors.phone && <p className="text-xs text-red-600 font-semibold" role="alert">{formErrors.phone}</p>}
                        </div>

                        <div className="space-y-1">
                          <label htmlFor="lead-email" className="text-xs font-bold text-stone-700 block">Correo electrónico</label>
                          <input
                            id="lead-email"
                            type="email"
                            autoComplete="email"
                            value={data.email}
                            onChange={e => { updateData('email', e.target.value); setFormErrors(p => ({ ...p, email: '' })); }}
                            placeholder="tu@email.com"
                            className={cn(
                              "w-full bg-white rounded-xl border p-3.5 text-sm outline-none transition-all font-medium text-stone-900 placeholder:text-stone-400",
                              formErrors.email ? "border-red-600 bg-red-50/30" : "border-stone-300 focus:border-primary"
                            )}
                          />
                          {formErrors.email && <p className="text-xs text-red-600 font-semibold" role="alert">{formErrors.email}</p>}
                        </div>
                      </div>

                      <div className="space-y-1 pt-1">
                        <label className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F7F5F0] border border-stone-200 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={privacyAccepted}
                            onChange={(e) => {
                              setPrivacyAccepted(e.target.checked);
                              setFormErrors(p => ({ ...p, privacy: '' }));
                            }}
                            className="mt-0.5 accent-primary w-4 h-4 shrink-0"
                          />
                          <span className="text-xs text-stone-600 leading-relaxed">
                            He leído y acepto la{' '}
                            <Link to="/privacidad" target="_blank" rel="noopener noreferrer" className="text-primary underline font-semibold">
                              Política de Privacidad
                            </Link>{' '}
                            para ver mi presupuesto y recibir asesoramiento técnico de Conscugar.
                          </span>
                        </label>
                        {formErrors.privacy && <p className="text-xs text-red-600 font-semibold" role="alert">{formErrors.privacy}</p>}
                      </div>
                    </div>
                  )}

                  {/* PASO 7: RESULTADO Y DESGLOSE TRANSPARENTE */}
                  {step === 7 && budget && (
                    <div className="space-y-6">
                      {submitWarning && (
                        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium text-center" role="status">
                          {submitWarning}
                        </div>
                      )}

                      {/* Tarjeta Principal del Ticket */}
                      <div className="bg-stone-900 text-white p-6 sm:p-8 rounded-2xl text-center relative overflow-hidden shadow-lg">
                        <p className="text-[11px] text-orange-400 font-bold uppercase tracking-widest mb-2">
                          Presupuesto Total Estimado · IVA ({budget.breakdown.ivaPercent}%) e ICIO Incluidos
                        </p>
                        <h3
                          ref={priceNodeRef}
                          className="text-4xl sm:text-6xl font-outfit font-extrabold text-white leading-none tracking-tight tabular-nums"
                        >
                          {budget.total.toLocaleString('es-ES')} €
                        </h3>
                        <p className="text-xs text-stone-300 mt-3 tabular-nums">
                          Horquilla orientativa antes de medir en obra: <strong className="text-white">{budget.min.toLocaleString('es-ES')} € – {budget.max.toLocaleString('es-ES')} €</strong>
                        </p>

                        {/* Barra proporcional de costes */}
                        {budget.total > 0 && (() => {
                          const total = budget.total;
                          const matPct = Math.round((budget.breakdown.baseMaterial / total) * 100);
                          const labPct = Math.round((budget.breakdown.labor / total) * 100);
                          const extPct = Math.round((budget.breakdown.extras / total) * 100);
                          const taxPct = Math.max(1, 100 - matPct - labPct - extPct);
                          return (
                            <div className="mt-6 pt-4 border-t border-stone-800 space-y-2 text-left">
                              <div className="h-2.5 w-full rounded-full bg-stone-800 overflow-hidden flex gap-0.5">
                                <div style={{ width: `${labPct}%` }} className="h-full bg-primary" title={`Mano de obra (${labPct}%)`} />
                                <div style={{ width: `${matPct}%` }} className="h-full bg-amber-500" title={`Materiales (${matPct}%)`} />
                                {extPct > 0 && <div style={{ width: `${extPct}%` }} className="h-full bg-emerald-500" title={`Partidas adicionales (${extPct}%)`} />}
                                <div style={{ width: `${taxPct}%` }} className="h-full bg-stone-500" title={`IVA, ICIO y Contingencia (${taxPct}%)`} />
                              </div>
                              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-300 font-medium tabular-nums">
                                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary inline-block" />Mano de obra {labPct}%</span>
                                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />Materiales {matPct}%</span>
                                {extPct > 0 && <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Extras {extPct}%</span>}
                                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-stone-500 inline-block" />IVA, Tasas y Reserva {taxPct}%</span>
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Desglose por capítulos en lenguaje claro */}
                      <div className="rounded-2xl border border-stone-200 bg-[#F7F5F0]/50 divide-y divide-stone-200/80">
                        {[
                          { label: 'Mano de Obra y Dirección de Aparejador', value: budget.breakdown.labor, sub: 'Albañilería, oficios, dirección técnica y coordinación de gremios' },
                          { label: 'Materiales Base y Acabados', value: budget.breakdown.baseMaterial, sub: `Materiales según gama elegida (incluye ${budget.breakdown.wastePercent || 5}% de margen de corte)` },
                          ...(budget.breakdown.extras > 0 ? [{ label: 'Instalaciones y Partidas Adicionales', value: budget.breakdown.extras, sub: 'Actuaciones extra seleccionadas en el paso 5' }] : []),
                          { label: 'Margen de Seguridad de Obra (~5%)', value: budget.breakdown.contingency, sub: 'Reserva preventiva para evitar imprevistos durante la ejecución' },
                          { label: `I.V.A. (${budget.breakdown.ivaPercent}%)`, value: budget.breakdown.iva, sub: 'IVA general (21%) aplicable a particulares y locales' },
                          { label: 'Tasas de Licencia Municipal (ICIO ~4%)', value: budget.breakdown.icio, sub: 'Impuesto del Ayuntamiento por licencia de obra (exento de IVA)' },
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between gap-4 px-4 sm:px-5 py-3">
                            <div>
                              <p className="text-xs font-bold text-stone-900">{item.label}</p>
                              <p className="text-[11px] text-stone-500">{item.sub}</p>
                            </div>
                            <span className="text-xs font-extrabold text-stone-900 tabular-nums shrink-0">
                              {item.value.toLocaleString('es-ES')} €
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* CTAs de Conversión */}
                      <div>
                        {!visitRequested ? (
                          <div className="w-full flex flex-col gap-2.5">
                            <Button
                              className="w-full py-4 font-bold text-xs sm:text-sm rounded-xl shadow-md"
                              onClick={handleRequestVisit}
                            >
                              <CalendarCheck className="w-4 h-4 mr-2 shrink-0" />
                              Solicitar Visita y Medición Gratuita del Aparejador
                            </Button>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              <Button
                                variant="outline"
                                onClick={handleWhatsAppSend}
                                className="w-full py-3.5 text-xs font-bold rounded-xl border-emerald-600/40 text-emerald-800 hover:bg-emerald-50 flex items-center justify-center gap-2"
                              >
                                <MessageCircle className="w-4 h-4 shrink-0" /> Comentar por WhatsApp
                              </Button>
                              <Button
                                variant="outline"
                                className="w-full py-3.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2"
                                onClick={generatePDF}
                              >
                                {pdfDownloaded ? (
                                  <><CheckCircle2 className="w-4 h-4 text-primary shrink-0" /> Dossier PDF Descargado</>
                                ) : (
                                  <><Download className="w-4 h-4 shrink-0" />Guardar Presupuesto en PDF</>
                                )}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full p-6 rounded-2xl bg-orange-50 border border-primary/30 text-center space-y-2">
                            <p className="text-primary-dark font-extrabold text-sm">¡Solicitud de Visita Técnica Registrada!</p>
                            <p className="text-stone-700 text-xs leading-relaxed">
                              Nuestro aparejador en <strong>Conscugar</strong> contactará contigo en las próximas 24/48h laborables para ver tu inmueble en Sagunto, Camp de Morvedre o Valencia y entregarte el presupuesto cerrado definitivo.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Barra de Navegación Inferior + Escape Directo para quien no quiere usar la calculadora */}
            <div className="mt-6 pt-4 border-t border-stone-200 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className={cn(
                    "min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold transition-all",
                    step === 1 || step === 7 ? "invisible" : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                  )}
                >
                  ← Anterior
                </button>

                {step < 6 ? (
                  <Button
                    onClick={nextStep}
                    disabled={
                      (step === 1 && !data.tipo) ||
                      (step === 2 && Number(data.m2) < 1)
                    }
                    className="min-h-[46px] px-7 py-3 text-xs font-bold rounded-xl"
                  >
                    Continuar →
                  </Button>
                ) : step === 6 ? (
                  <Button
                    onClick={nextStep}
                    disabled={!isContactFormatValid() || submitting}
                    className="min-h-[46px] px-7 py-3 text-xs font-bold rounded-xl"
                  >
                    {submitting ? 'Generando presupuesto...' : 'Ver mi presupuesto ahora →'}
                  </Button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setData({
                        tipo: '',
                        m2: 80,
                        hasElevator: true,
                        propertyAge: '1970_2000',
                        calidad: 'media',
                        vivienda: 'piso',
                        selectedExtras: [],
                        name: '',
                        email: '',
                        phone: ''
                      });
                      setFormErrors({});
                      setPrivacyAccepted(false);
                      setVisitRequested(false);
                      setCurrentLeadId(null);
                      setSubmitWarning('');
                    }}
                    className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-all"
                  >
                    Calcular otro presupuesto
                  </button>
                )}
              </div>

              {/* Pie siempre visible en Pasos 1 a 5: Alternativa directa sin pasar por la calculadora */}
              {step < 6 && (
                <div className="pt-2.5 border-t border-stone-200/70 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
                  <span className="text-[11px] text-stone-500 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>¿No sabes qué marcar o prefieres trato directo?</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setDirectContactMode(true)}
                      className="text-[11px] font-extrabold text-primary hover:text-primary-dark underline underline-offset-2"
                    >
                      Pedir visita / llamada sin calcular
                    </button>
                    <span className="text-stone-300">·</span>
                    <a
                      href={`https://wa.me/${contactPhone}?text=${encodeURIComponent('Hola Conscugar, me gustaría pediros presupuesto de reforma directamente.')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 hover:text-emerald-800"
                    >
                      <MessageCircle className="w-3 h-3 fill-current" /> WhatsApp
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Calculator;
