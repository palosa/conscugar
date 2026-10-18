// Lógica centralizada de cálculo de presupuestos y partidas técnicas (Conscugar).

/**
 * Calcula el coste individual de un extra/partida adicional de forma consistente
 * para toda la aplicación (Paso 5, Paso 7 y documento PDF).
 */
export const calculateExtraPrice = (extra, data = {}) => {
  if (!extra) return 0;
  const { calidad = 'media', m2 = 0, tipo = '' } = data;
  const safeM2 = Math.max(Math.round(Number(m2) || 0), 1);

  let price = Number(extra.price || 0);

  if (extra.is_quality_dependent !== false) {
    if (calidad === 'basica') {
      price = Number(extra.price_basic || price);
    } else if (calidad === 'media') {
      price = Number(extra.price_medium || price);
    } else if (calidad === 'alta') {
      price = Number(extra.price_high || price * 1.45);
    } else if (calidad === 'premium') {
      price = Number(extra.price_premium || (extra.price_high ? extra.price_high * 1.35 : price * 2.1));
    } else {
      price = Number(extra.price_medium || price);
    }
  }

  if (extra.price_type === 'm2') {
    price *= safeM2;
  } else {
    // Ajuste técnico de Aparejador según alcance de la estancia:
    // Las tarifas fijas base están referenciadas a una vivienda estándar (~85 m²).
    // En un solo baño o una sola cocina, las partidas de demolición, fontanería o electricidad se ajustan al ámbito de esa estancia.
    const isBano = tipo.includes('bano') || tipo.includes('baño');
    const isCocina = tipo.includes('cocina');

    if (isBano) {
      const banoScale = safeM2 <= 6 ? 0.38 : Math.min(0.6, 0.38 + (safeM2 - 6) * 0.025);
      price *= banoScale;
    } else if (isCocina) {
      const cocinaScale = safeM2 <= 12 ? 0.52 : Math.min(0.75, 0.52 + (safeM2 - 12) * 0.02);
      price *= cocinaScale;
    } else if (safeM2 < 60) {
      // Vivienda compacta / estudio (<60 m²)
      const smallScale = Math.max(0.72, 0.72 + (safeM2 / 60) * 0.28);
      price *= smallScale;
    } else if (safeM2 > 90) {
      // Escalado progresivo para viviendas grandes (>90 m²)
      const volumeScale = 1 + Math.min(1.5, (safeM2 - 90) * 0.0075);
      price *= volumeScale;
    }
  }

  return Math.round(price);
};

/**
 * Calcula el presupuesto dinámico basado en la configuración de la base de datos.
 * @param {Object} data - Datos del formulario (tipo, m2, calidad, vivienda, extras)
 * @param {Object} config - Configuración completa desde Supabase
 */
export const calculateBudget = (data, config = {}) => {
  const { tipo, m2, calidad, vivienda, selectedExtras = [], hasElevator, propertyAge } = data;
  const {
    projectTypes = [],
    pricingRanges = [],
    extras = [],
    qualitySettings = [],
    housingSettings = [],
    globalSettings = []
  } = config;

  if (!tipo || !m2 || !calidad || !vivienda) return null;

  // Superficie entera desde 1 m² sin mínimos artificiales
  const safeM2 = Math.max(Math.round(Number(m2) || 0), 1);

  // 1. Encontrar el Precio Base y determinar si existe tramo explícito en BD
  let baseReferencePrice = 300;
  const projectType = projectTypes.find(p => p.id === tipo);
  if (projectType) {
    baseReferencePrice = Number(projectType.base_price_fallback) || 300;
  }

  // Ordenar rangos para evitar huecos entre tramos
  const typeRanges = pricingRanges
    .filter(p => p.project_type === tipo)
    .sort((a, b) => Number(a.range_min) - Number(b.range_min));

  const matchedRange = typeRanges.find(
    (p, idx) =>
      safeM2 >= Number(p.range_min) &&
      (safeM2 <= Number(p.range_max) ||
        (idx < typeRanges.length - 1 && safeM2 < Number(typeRanges[idx + 1].range_min)))
  );

  let scaledPricePerM2 = baseReferencePrice;
  if (matchedRange) {
    // Si la tabla pricing_config ya define el tramo por m², usamos su precio directamente
    scaledPricePerM2 = Number(matchedRange.price_per_m2);
  } else {
    // Curva de economía de escala solo como fallback cuando no hay tramos configurados en BD
    let pivotM2 = 80;
    if (tipo.includes('bano') || tipo.includes('baño')) pivotM2 = 6;
    else if (tipo.includes('cocina')) pivotM2 = 12;
    else if (tipo.includes('reforma_parcial')) pivotM2 = 25;

    const scaleFactor = Math.max(0.75, Math.min(1.15, Math.pow(pivotM2 / safeM2, 0.10)));
    scaledPricePerM2 = baseReferencePrice * scaleFactor;
  }

  const getGlobalSetting = (key, fallback) => {
    const s = globalSettings.find(item => item.key === key);
    return s ? Number(s.value) : fallback;
  };

  // 2. Multiplicadores de Calidad, Tipología y Antigüedad (CTE / Rehabilitación)
  const qSetting = qualitySettings.find(s => s.id === calidad) || { multiplier: 1.0 };
  const hSetting =
    tipo === 'obra_nueva'
      ? { multiplier: 1.0 }
      : housingSettings.find(s => s.id === vivienda) || { multiplier: 1.0 };

  let ageMultiplier = 1.0;
  if (tipo !== 'obra_nueva') {
    if (propertyAge === 'pre_1970') {
      ageMultiplier = 1.0 + getGlobalSetting('age_pre_1970_penalty', 0.20);
    } else if (propertyAge === '1970_2000') {
      ageMultiplier = 1.0 + getGlobalSetting('age_1970_2000_penalty', 0.08);
    }
  }

  // Coeficiente técnico de merma/desperdicio de materiales (5% estándar, 8% en gran formato/rectificados)
  const wastePercent = calidad === 'alta' || calidad === 'premium' ? 8 : 5;
  const wasteMultiplier = 1 + wastePercent / 100;

  let baseTotal = 0;
  if (projectType?.base_price_type === 'fixed') {
    baseTotal = baseReferencePrice * Number(qSetting.multiplier) * Number(hSetting.multiplier) * ageMultiplier;
  } else {
    baseTotal = scaledPricePerM2 * safeM2 * Number(qSetting.multiplier) * Number(hSetting.multiplier) * ageMultiplier;
  }

  // 3. Aplicar Extras Dinámicos con la función unificada (incluye soporte para Calidad Premium)
  const extrasTotal = selectedExtras.reduce((acc, extraId) => {
    const extra = extras.find(e => e.id === extraId);
    if (!extra) return acc;
    return acc + calculateExtraPrice(extra, data);
  }, 0);

  // 4. Desglose Técnico de Materiales (38% + merma, cumpliendo Art. 91 LIVA <40%) y Mano de Obra / Dirección Técnica (62%)
  let laborLogisticMultiplier = 1.0;
  if (tipo !== 'obra_nueva' && vivienda === 'piso' && hasElevator === false) {
    laborLogisticMultiplier = 1.0 + getGlobalSetting('elevator_penalty', 0.15);
  }

  const baseMaterialTotal = Math.round(baseTotal * 0.38 * wasteMultiplier);
  const laborTotal = Math.round(baseTotal * 0.62 * laborLogisticMultiplier);

  // 5. SUBTOTAL PEM (Presupuesto de Ejecución Material)
  const subtotalPEM = baseMaterialTotal + extrasTotal + laborTotal;

  // 6. Fondo de Imprevistos / Contingencia Técnica (~5% del PEM)
  const contingencyMargin = Math.round(subtotalPEM * 0.05);

  // 7. Base Imponible sujeta a IVA (PEM + Contingencia; el ICIO municipal NO lleva IVA)
  const baseImponible = subtotalPEM + contingencyMargin;

  // 8. Tipo de IVA general (21%) aplicable a particulares y locales:
  const ivaRate = 0.21;
  const iva = Math.round(baseImponible * ivaRate);

  // 9. Tasas Urbanísticas e ICIO Municipal (~4% del PEM, exento de IVA)
  const icioTax = Math.round(subtotalPEM * 0.04);

  // 10. Total Final (Base Imponible + IVA + Tasas/ICIO)
  const totalWithIVA = baseImponible + iva + icioTax;

  // Horquilla orientativa (±15% o según configuración)
  const margin = getGlobalSetting('price_margin', 0.15);

  return {
    min: Math.round(totalWithIVA * (1 - margin)),
    max: Math.round(totalWithIVA * (1 + margin)),
    total: totalWithIVA,
    breakdown: {
      pem: subtotalPEM,
      baseImponible,
      baseMaterial: baseMaterialTotal,
      extras: extrasTotal,
      labor: laborTotal,
      icio: icioTax,
      contingency: contingencyMargin,
      iva,
      ivaRate,
      ivaPercent: Math.round(ivaRate * 100),
      wastePercent,
      pricePerM2: Math.round(scaledPricePerM2)
    }
  };
};
