-- 1. Tablas Maestras para la Calculadora Dinámica

-- Tipos de Proyecto (Reforma Integral, Baño, Cocina, etc.)
CREATE TABLE IF NOT EXISTS project_types (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'Home',
  base_price_fallback NUMERIC DEFAULT 300,
  display_order INTEGER DEFAULT 0
);

-- Multiplicadores de Calidad (Básica, Media, Alta, Premium)
CREATE TABLE IF NOT EXISTS quality_settings (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  multiplier NUMERIC NOT NULL DEFAULT 1.0,
  description TEXT,
  icon TEXT DEFAULT 'Zap'
);

-- Multiplicadores de Vivienda (Piso, Casa, Chalet, Local)
CREATE TABLE IF NOT EXISTS housing_settings (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  multiplier NUMERIC NOT NULL DEFAULT 1.0,
  icon TEXT DEFAULT 'Building2'
);

-- Ajustes Globales (Margen de error, IVA, etc.)
CREATE TABLE IF NOT EXISTS global_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT
);

-- 2. Datos Iniciales (Seed Data) para asegurar que la App funcione de inmediato

INSERT INTO project_types (id, name, description, icon, base_price_fallback, display_order) VALUES
('reforma_integral', 'Reforma Integral', 'Transformación total de tu vivienda', 'Home', 420, 1),
('bano', 'Reforma de Baño', 'Diseño y funcionalidad para tu aseo', 'ShowerHead', 700, 2),
('cocina', 'Reforma de Cocina', 'La cocina de tus sueños a medida', 'CookingPot', 600, 3),
('obra_nueva', 'Obra Nueva', 'Construimos tu hogar desde cero', 'Construction', 900, 4),
('rehabilitacion', 'Rehabilitación', 'Recuperación de fachadas y estructuras', 'Building2', 300, 5),
('reforma_parcial', 'Reforma Parcial', 'Pequeños cambios, grandes mejoras', 'Wrench', 280, 6);

INSERT INTO quality_settings (id, label, multiplier, description, icon) VALUES
('basica', 'Básica', 0.8, 'Funcional y económica', 'Zap'),
('media', 'Media', 1.0, 'Equilibrio calidad/precio', 'Check'),
('alta', 'Alta', 1.3, 'Acabados superiores', 'ShieldCheck'),
('premium', 'Premium', 1.7, 'Lo mejor del mercado', 'Hammer');

INSERT INTO housing_settings (id, label, multiplier, icon) VALUES
('piso', 'Piso', 1.0, 'Home'),
('casa', 'Casa', 1.05, 'Home'),
('chalet', 'Chalet', 1.1, 'Construction'),
('local', 'Local', 1.15, 'Building2');

INSERT INTO global_settings (key, value, description) VALUES
('price_margin', '0.15', 'Margen de error para el presupuesto (±15%)'),
('iva_rate', '0.21', 'Tipo de IVA aplicable (21%)'),
('currency_symbol', '€', 'Símbolo de la moneda');

-- 3. Actualización de las tablas existentes para consistencia (Pricing Config & Extras)

-- Asegurar que pricing_config tiene los campos correctos para rangos de m2
-- (Esto ya estaba en la v1, pero lo reforzamos)
-- CREATE TABLE IF NOT EXISTS pricing_config (
--   id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
--   project_type TEXT REFERENCES project_types(id),
--   range_min NUMERIC NOT NULL,
--   range_max NUMERIC NOT NULL,
--   price_per_m2 NUMERIC NOT NULL,
--   created_at TIMESTAMPTZ DEFAULT now()
-- );

-- Asegurar que extras tiene campos para categorías e iconos editables
-- (Esto ya estaba en la v1, pero lo reforzamos)
-- CREATE TABLE IF NOT EXISTS extras (
--   id TEXT PRIMARY KEY,
--   name TEXT NOT NULL,
--   price NUMERIC NOT NULL,
--   icon TEXT DEFAULT 'Check',
--   category TEXT DEFAULT 'Otros',
--   project_types TEXT[] DEFAULT '{}',
--   created_at TIMESTAMPTZ DEFAULT now()
-- );
