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
  // Pivota en 80m2. Viviendas pequeñas (<80) encarecen el m2, grandes (>80) lo abaratan geométricamente.
  const safeM2 = Math.max(Number(m2), 5); // Evitar división por 0 o tamaños absurdos
  const scaleFactor = Math.pow(80 / safeM2, 0.15); 
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
    
    let extraPrice = 0;
    if (calidad === 'basica') extraPrice = Number(extra.price_basic || extra.price || 0);
    else if (calidad === 'alta') extraPrice = Number(extra.price_high || extra.price * 2 || 0);
    else extraPrice = Number(extra.price_medium || extra.price * 1.5 || 0);
    
    if (extra.price_type === 'm2') {
       extraPrice *= safeM2;
    }
    return acc + extraPrice;
  }, 0);
  
  // 5. Costes de Mano de Obra y Sobreesfuerzo Logístico
  // Penalización si no hay ascensor (acarreo manual de escombro y material)
  let laborLogisticMultiplier = 1.0;
  if (hasElevator === false) {
    laborLogisticMultiplier = 1.15; // +15% de tiempo de peones y encarecimiento de grúa
  }

  const laborSetting = globalSettings.find(s => s.key === 'labor_cost_m2');
  const laborCostM2 = laborSetting ? Number(laborSetting.value) : 150; 
  const laborTotal = laborCostM2 * safeM2 * qSetting.multiplier * laborLogisticMultiplier;
  
  // 6. SUMA PEM (Presupuesto de Ejecución Material)
  const subtotalPEM = Math.round(baseTotal + extrasTotal + laborTotal);
  
  // 7. Impuestos Técnicos y Gestiones (ICIO, Tasas, Colegio) -> ~4% del PEM
  const icioTax = Math.round(subtotalPEM * 0.04);
  
  // 8. Fondo de Imprevistos (Contingencia Técnica) -> ~5%
  const contingencyMargin = Math.round(subtotalPEM * 0.05);

  const totalGross = subtotalPEM + icioTax + contingencyMargin;
  
  // 9. Aplicar IVA Final 
  const iva = Math.round(totalGross * 0.21);
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
      baseMaterial: Math.round(baseTotal),
      extras: extrasTotal,
      labor: Math.round(laborTotal),
      icio: icioTax,
      contingency: contingencyMargin,
      iva: iva,
      pricePerM2: Math.round(scaledPricePerM2)
    }
  };
};
