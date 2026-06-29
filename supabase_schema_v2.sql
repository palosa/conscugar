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

-- 3. Tablas de Precios y Extras (Estructura y Datos Semilla)

-- Rangos de precios por m² para la calculadora
CREATE TABLE IF NOT EXISTS pricing_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_type TEXT REFERENCES project_types(id) ON DELETE CASCADE,
  range_min NUMERIC NOT NULL,
  range_max NUMERIC NOT NULL,
  price_per_m2 NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Extras configurables
CREATE TABLE IF NOT EXISTS extras (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  icon TEXT DEFAULT 'Check',
  category TEXT DEFAULT 'Otros',
  project_types TEXT[] DEFAULT '{}',
  is_quality_dependent BOOLEAN DEFAULT false,
  price_basic NUMERIC,
  price_medium NUMERIC,
  price_high NUMERIC,
  price_type TEXT DEFAULT 'fixed',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Datos semilla para precios base (rangos de m²)
INSERT INTO pricing_config (project_type, range_min, range_max, price_per_m2) VALUES
('reforma_integral', 0, 50, 480),
('reforma_integral', 51, 100, 420),
('reforma_integral', 101, 99999, 390),
('bano', 0, 8, 800),
('bano', 9, 99999, 700),
('cocina', 0, 15, 680),
('cocina', 16, 99999, 600),
('obra_nueva', 0, 99999, 950),
('rehabilitacion', 0, 99999, 300),
('reforma_parcial', 0, 99999, 280);

-- Datos semilla para extras
INSERT INTO extras (id, name, price, icon, category, project_types, is_quality_dependent, price_basic, price_medium, price_high, price_type) VALUES
('demolicion', 'Demolición técnica y desescombro', 1200, 'Trash2', 'Fases de Obra', ARRAY['reforma_integral','bano','cocina','reforma_parcial'], false, 1200, 1200, 1200, 'fixed'),
('fontaneria', 'Instalación nueva de fontanería y saneamiento', 1500, 'ShowerHead', 'Instalaciones', ARRAY['reforma_integral','bano','cocina'], true, 1200, 1500, 2200, 'fixed'),
('electricidad', 'Instalación eléctrica completa bajo normativa', 2200, 'Zap', 'Instalaciones', ARRAY['reforma_integral','bano','cocina','obra_nueva'], true, 1800, 2200, 3100, 'fixed'),
('climatizacion', 'Sistema de Climatización por Conductos (Inverter)', 3500, 'Wind', 'Confort', ARRAY['reforma_integral','obra_nueva'], false, 3500, 3500, 3500, 'fixed'),
('pintura', 'Pintura plástica lisa lavable premium', 18, 'Palette', 'Acabados', ARRAY['reforma_integral','bano','cocina','obra_nueva','rehabilitacion','reforma_parcial'], true, 14, 18, 25, 'm2'),
('pladur', 'Tabiquería y falsos techos de pladur', 25, 'Square', 'Estructuras', ARRAY['reforma_integral','obra_nueva','reforma_parcial'], false, 25, 25, 25, 'm2');

-- 4. Tabla de Testimonios (Preparada para Google Reviews)
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  text TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) DEFAULT 5,
  is_google BOOLEAN DEFAULT false,
  approved BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Datos semilla para testimonios iniciales
INSERT INTO testimonials (name, location, text, rating, is_google, approved) VALUES
('Carlos Ruiz', 'Puerto de Sagunto', 'La precisión del presupuesto inicial fue asombrosa. No hubo sorpresas de última hora y el acabado es de revista. Profesionales de verdad.', 5, false, true),
('Elena García', 'Gilet', 'Reformamos nuestra casa de montaña con ellos. El equipo técnico entiende perfectamente el entorno y los materiales. Superaron expectativas.', 5, false, true),
('Marc Sanchis', 'Centro Histórico, Sagunto', 'Gestionar una rehabilitación en el centro de Sagunto daba miedo por los permisos, pero ellos se encargaron de todo. Una joya.', 5, false, true);

-- 5. Seguridad y Políticas de Acceso (RLS) para Testimonios
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Permitir que cualquier visitante (público / anon) lea los testimonios aprobados
CREATE POLICY "Permitir lectura pública de testimonios aprobados" 
ON testimonials FOR SELECT 
USING (approved = true);

-- Permitir control total (insertar, actualizar, borrar) solo a usuarios autenticados (Administradores)
CREATE POLICY "Permitir control total de testimonios a administradores" 
ON testimonials FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 6. Seguridad y Políticas de Acceso (RLS) para Tablas de Configuración y Precios

-- Habilitar RLS en todas las tablas maestras
ALTER TABLE project_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE housing_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE extras ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Políticas de Lectura Pública (Permite a la calculadora web consultar los datos de precios)
CREATE POLICY "Permitir lectura pública de project_types" ON project_types FOR SELECT USING (true);
CREATE POLICY "Permitir lectura pública de quality_settings" ON quality_settings FOR SELECT USING (true);
CREATE POLICY "Permitir lectura pública de housing_settings" ON housing_settings FOR SELECT USING (true);
CREATE POLICY "Permitir lectura pública de global_settings" ON global_settings FOR SELECT USING (true);
CREATE POLICY "Permitir lectura pública de pricing_config" ON pricing_config FOR SELECT USING (true);
CREATE POLICY "Permitir lectura pública de extras" ON extras FOR SELECT USING (true);

-- Políticas de Escritura Pública para Leads (Permite a la calculadora web insertar nuevas solicitudes de contacto)
CREATE POLICY "Permitir inserción pública de leads" ON leads FOR INSERT WITH CHECK (true);

-- Políticas de Control Total para Administradores Autenticados (Permite editar desde la sección /admin)
CREATE POLICY "Permitir control total de project_types a administradores" ON project_types FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir control total de quality_settings a administradores" ON quality_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir control total de housing_settings a administradores" ON housing_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir control total de global_settings a administradores" ON global_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir control total de pricing_config a administradores" ON pricing_config FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir control total de extras a administradores" ON extras FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir control total de leads a administradores" ON leads FOR ALL TO authenticated USING (true) WITH CHECK (true);
