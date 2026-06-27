// Este archivo ahora solo contiene la lógica pura de cálculo.
// No hay constantes hardcodeadas; todo se inyecta desde la base de datos (Supabase).

/**
 * Calcula el presupuesto dinámico basado en la configuración de la base de datos.
 * @param {Object} data - Datos del formulario (tipo, m2, calidad, vivienda, extras)
 * @param {Object} config - Configuración completa desde Supabase
 */
export const calculateBudget = (data, config = {}) => {
  const { tipo, m2, calidad, vivienda, selectedExtras, hasElevator, propertyAge } = data;
  const { 
    projectTypes = [], 
    pricingRanges = [], 
    extras = [], 
    qualitySettings = [], 
    housingSettings = [],
    globalSettings = [] 
  } = config;
  
  if (!tipo || !m2 || !calidad || !vivienda) return null;
  
  // 1. Encontrar el Precio Base (Referencia a 80m2)
  let baseReferencePrice = 300; 
  const projectType = projectTypes.find(p => p.id === tipo);
  if (projectType) {
    baseReferencePrice = projectType.base_price_fallback || 300;
  }

  // Si existen rangos explícitos, los usamos como referencia. Si no, escalamos matemáticamente.
  const range = pricingRanges.find(p => p.project_type === tipo && m2 >= p.range_min && m2 <= p.range_max);
  if (range) {
    baseReferencePrice = range.price_per_m2;
  }

  // 2. Aplicar Economía de Escala Continua (Curva de Descuento por Volumen)
  // Pivota adaptativamente según el tipo de obra.
  const safeM2 = Math.max(Number(m2), 5); // Evitar división por 0 o tamaños absurdos
  let pivotM2 = 80;
  if (tipo.includes('bano') || tipo.includes('baño')) {
    pivotM2 = 5;
  } else if (tipo.includes('cocina')) {
    pivotM2 = 10;
  } else if (tipo.includes('reforma_parcial')) {
    pivotM2 = 45;
  }
  const scaleFactor = Math.max(0.65, Math.pow(pivotM2 / safeM2, 0.15)); // Freno matemático: descuento máximo 35%
  const scaledPricePerM2 = baseReferencePrice * scaleFactor;

  // 3. Multiplicadores Físicos y de Logística
  const qSetting = qualitySettings.find(s => s.id === calidad) || { multiplier: 1.0 };
  const hSetting = housingSettings.find(s => s.id === vivienda) || { multiplier: 1.0 };
  
  // Riesgos por Antigüedad
  let ageMultiplier = 1.0;
  if (propertyAge === 'pre_1970') ageMultiplier = 1.20; // +20% costes ocultos de demolición técnica
  else if (propertyAge === '1970_2000') ageMultiplier = 1.08; // +8% actualización de instalaciones
  
  // Decidir método de cálculo base: Fijo vs Proporcional a m2
  let baseTotal = 0;
  if (projectType?.base_price_type === 'fixed') {
     baseTotal = baseReferencePrice * qSetting.multiplier * hSetting.multiplier * ageMultiplier;
  } else {
     baseTotal = scaledPricePerM2 * safeM2 * qSetting.multiplier * hSetting.multiplier * ageMultiplier;
  }
  
  // 4. Aplicar Extras Dinámicos 
  const extrasTotal = selectedExtras.reduce((acc, extraId) => {
    const extra = extras.find(e => e.id === extraId);
    if (!extra) return acc;
    
    let extraPrice = Number(extra.price || 0);
    
    // Si depende de la calidad, aplicamos la escala o el precio específico
    // Por retrocompatibilidad asumimos TRUE si es undefined (hasta que actualices Supabase)
    if (extra.is_quality_dependent !== false) {
       if (calidad === 'basica') extraPrice = Number(extra.price_basic || extraPrice);
       else if (calidad === 'alta') extraPrice = Number(extra.price_high || extraPrice * 2);
       else extraPrice = Number(extra.price_medium || extraPrice * 1.5);
    }
    
    // Si el precio es por m2, se multiplica por la superficie solo si es un precio unitario real (< 150)
    // Si ya es un valor alto (>= 150), asumimos que es el precio global estimado para el proyecto
    if (extra.price_type === 'm2' && extraPrice < 150) {
       extraPrice *= safeM2;
    }
    
    return acc + extraPrice;
  }, 0);
  
  // 5. Costes de Mano de Obra y Sobreesfuerzo Logístico
  // El baseTotal representa el coste total estimado de ejecución (materiales + mano de obra).
  // Para evitar duplicar costes, desglosamos baseTotal de la siguiente manera:
  // - 60% se asigna a materiales y ejecución base.
  // - 40% se asigna a mano de obra base.
  // Si no hay ascensor, aplicamos una penalización de logística sobre el coste de mano de obra.
  let laborLogisticMultiplier = 1.0;
  if (vivienda === 'piso' && hasElevator === false) {
    laborLogisticMultiplier = 1.15; // +15% por acarreo manual de escombros y materiales en pisos sin ascensor
  }

  const laborTotal = baseTotal * 0.40 * laborLogisticMultiplier;
  const baseMaterialTotal = baseTotal * 0.60;
  
  // 6. SUMA PEM (Presupuesto de Ejecución Material)
  const subtotalPEM = Math.round(baseMaterialTotal + extrasTotal + laborTotal);
  
  // 7. Impuestos Técnicos y Gestiones (ICIO, Tasas, Colegio) -> ~4% del PEM
  const icioTax = Math.round(subtotalPEM * 0.04);
  
  // 8. Fondo de Imprevistos (Contingencia Técnica) -> ~5%
  const contingencyMargin = Math.round(subtotalPEM * 0.05);

  const totalGross = subtotalPEM + icioTax + contingencyMargin;
  
  // 9. Aplicar IVA Final (10% reducido en obras residenciales/autopromoción, 21% general en locales/comerciales)
  const isResidential = ['piso', 'casa', 'chalet'].includes(vivienda);
  const isObraNueva = tipo === 'obra_nueva';
  let ivaRate = 0.21;
  if (isResidential || isObraNueva) {
    ivaRate = 0.10; // IVA reducido en España para autopromoción de viviendas o reformas residenciales
  } else {
    const ivaSetting = globalSettings.find(s => s.key === 'iva_rate');
    ivaRate = ivaSetting ? Number(ivaSetting.value) : 0.21;
  }
  
  const iva = Math.round(totalGross * ivaRate);
  const totalWithIVA = totalGross + iva;
  
  // Margen publicitario para Mostrar (Ej: ±15% de desviación teórica si se quiere mostrar en web)
  const marginSetting = globalSettings.find(s => s.key === 'price_margin');
  const margin = marginSetting ? Number(marginSetting.value) : 0.15; 
  
  return {
    min: Math.round(totalWithIVA * (1 - margin)),
    max: Math.round(totalWithIVA * (1 + margin)),
    total: totalWithIVA,
    breakdown: {
      pem: subtotalPEM,
      baseMaterial: Math.round(baseMaterialTotal),
      extras: extrasTotal,
      labor: Math.round(laborTotal),
      icio: icioTax,
      contingency: contingencyMargin,
      iva: iva,
      ivaRate: ivaRate,
      ivaPercent: Math.round(ivaRate * 100),
      pricePerM2: Math.round(scaledPricePerM2)
    }
  };
};
