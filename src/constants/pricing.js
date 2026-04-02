// Este archivo ahora solo contiene la lógica pura de cálculo.
// No hay constantes hardcodeadas; todo se inyecta desde la base de datos (Supabase).

/**
 * Calcula el presupuesto dinámico basado en la configuración de la base de datos.
 * @param {Object} data - Datos del formulario (tipo, m2, calidad, vivienda, extras)
 * @param {Object} config - Configuración completa desde Supabase
 */
export const calculateBudget = (data, config = {}) => {
  const { tipo, m2, calidad, vivienda, selectedExtras } = data;
  const { 
    projectTypes = [], 
    pricingRanges = [], 
    extras = [], 
    qualitySettings = [], 
    housingSettings = [],
    globalSettings = [] 
  } = config;
  
  if (!tipo || !m2 || !calidad || !vivienda) return null;
  
  // 1. Encontrar el Precio Base (por rango o por fallback)
  let pricePerM2 = 300; // Fallback absoluto
  const projectType = projectTypes.find(p => p.id === tipo);
  if (projectType) {
    pricePerM2 = projectType.base_price_fallback;
  }

  // Lógica de Rangos Dinámicos
  const range = pricingRanges.find(p => 
    p.project_type === tipo && 
    m2 >= p.range_min && 
    m2 <= p.range_max
  );
  if (range) {
    pricePerM2 = range.price_per_m2;
  }

  // 2. Aplicar Multiplicadores Dinámicos
  const qSetting = qualitySettings.find(s => s.id === calidad) || { multiplier: 1.0 };
  const hSetting = housingSettings.find(s => s.id === vivienda) || { multiplier: 1.0 };
  
  // Decidir método de cálculo base: Fijo vs Proporcional a m2
  let baseTotal = 0;
  if (projectType?.base_price_type === 'fixed') {
     baseTotal = pricePerM2 * qSetting.multiplier * hSetting.multiplier;
  } else {
     baseTotal = pricePerM2 * m2 * qSetting.multiplier * hSetting.multiplier;
  }
  
  // 3. Aplicar Extras Dinámicos (Matriz de Calidad y Superficie)
  const extrasTotal = selectedExtras.reduce((acc, extraId) => {
    const extra = extras.find(e => e.id === extraId);
    if (!extra) return acc;
    
    // Seleccionar el precio de la matriz según la calidad
    let extraPrice = 0;
    if (calidad === 'basica') extraPrice = Number(extra.price_basic || extra.price || 0);
    else if (calidad === 'alta') extraPrice = Number(extra.price_high || extra.price * 2 || 0);
    else extraPrice = Number(extra.price_medium || extra.price * 1.5 || 0); // Media por defecto
    
    // Aplicar multiplicador si el extra es proporcional a los metros cuadrados
    if (extra.price_type === 'm2') {
       extraPrice *= Number(m2);
    }

    return acc + extraPrice;
  }, 0);
  
  // 4. Aplicar Márgenes de Error (desde ajustes globales)
  const marginSetting = globalSettings.find(s => s.key === 'price_margin');
  const margin = marginSetting ? Number(marginSetting.value) : 0.15; // ±15% defecto
  
  const total = baseTotal + extrasTotal;
  
  return {
    min: Math.round(total * (1 - margin)),
    max: Math.round(total * (1 + margin)),
    total: Math.round(total),
    breakdown: {
      base: Math.round(baseTotal),
      extras: Math.round(extrasTotal),
      pricePerM2: Math.round(pricePerM2),
      marginPercent: Math.round(margin * 100)
    }
  };
};
