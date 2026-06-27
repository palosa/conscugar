import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, 'conscugar.db');

export async function getDb() {
  return open({
    filename: dbPath,
    driver: sqlite3.Database
  });
}

export async function initDb() {
  const db = await getDb();
  
  // Habilitar claves foráneas
  await db.get('PRAGMA foreign_keys = ON');

  // 1. Crear Tablas

  // Tipos de Proyecto
  await db.exec(`
    CREATE TABLE IF NOT EXISTS project_types (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      icon TEXT DEFAULT 'Home',
      base_price_fallback NUMERIC DEFAULT 300,
      base_price_type TEXT DEFAULT 'proportional', -- 'fixed' o 'proportional'
      display_order INTEGER DEFAULT 0
    )
  `);

  // Ajustes de Calidad
  await db.exec(`
    CREATE TABLE IF NOT EXISTS quality_settings (
      id TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      multiplier NUMERIC NOT NULL DEFAULT 1.0,
      description TEXT,
      icon TEXT DEFAULT 'Zap'
    )
  `);

  // Ajustes de Vivienda
  await db.exec(`
    CREATE TABLE IF NOT EXISTS housing_settings (
      id TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      multiplier NUMERIC NOT NULL DEFAULT 1.0,
      icon TEXT DEFAULT 'Building2'
    )
  `);

  // Ajustes Globales
  await db.exec(`
    CREATE TABLE IF NOT EXISTS global_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      description TEXT
    )
  `);

  // Configuración de Precios por m2
  await db.exec(`
    CREATE TABLE IF NOT EXISTS pricing_config (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_type TEXT NOT NULL,
      range_min NUMERIC NOT NULL,
      range_max NUMERIC NOT NULL,
      price_per_m2 NUMERIC NOT NULL,
      FOREIGN KEY (project_type) REFERENCES project_types(id) ON DELETE CASCADE
    )
  `);

  // Servicios Extras
  await db.exec(`
    CREATE TABLE IF NOT EXISTS extras (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price NUMERIC NOT NULL,
      icon TEXT DEFAULT 'Check',
      category TEXT DEFAULT 'Otros',
      project_types TEXT DEFAULT '[]', -- JSON string con array de ids de proyectos
      is_quality_dependent BOOLEAN DEFAULT 1,
      price_basic NUMERIC,
      price_medium NUMERIC,
      price_high NUMERIC,
      price_type TEXT DEFAULT 'fixed' -- 'fixed' o 'm2'
    )
  `);

  // leads (clientes potenciales)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      m2 NUMERIC NOT NULL,
      tipo TEXT NOT NULL,
      calidad TEXT NOT NULL,
      vivienda TEXT NOT NULL,
      selected_extras TEXT DEFAULT '[]', -- JSON string array
      has_elevator BOOLEAN,
      property_age TEXT,
      total_budget NUMERIC,
      breakdown TEXT DEFAULT '{}', -- JSON string
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Usuarios (Auth)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 2. Seeding de datos iniciales si las tablas están vacías

  // Seeding project_types
  const ptCount = await db.get('SELECT COUNT(*) as count FROM project_types');
  if (ptCount.count === 0) {
    await db.exec(`
      INSERT INTO project_types (id, name, description, icon, base_price_fallback, base_price_type, display_order) VALUES
      ('reforma_integral', 'Reforma Integral', 'Transformación total de tu vivienda', 'Home', 420, 'proportional', 1),
      ('bano', 'Reforma de Baño', 'Diseño y funcionalidad para tu aseo', 'ShowerHead', 700, 'proportional', 2),
      ('cocina', 'Reforma de Cocina', 'La cocina de tus sueños a medida', 'CookingPot', 600, 'proportional', 3),
      ('obra_nueva', 'Obra Nueva', 'Construimos tu hogar desde cero', 'Construction', 900, 'proportional', 4),
      ('rehabilitacion', 'Rehabilitación', 'Recuperación de fachadas y estructuras', 'Building2', 300, 'proportional', 5),
      ('reforma_parcial', 'Reforma Parcial', 'Pequeños cambios, grandes mejoras', 'Wrench', 280, 'proportional', 6)
    `);
  }

  // Seeding quality_settings
  const qsCount = await db.get('SELECT COUNT(*) as count FROM quality_settings');
  if (qsCount.count === 0) {
    await db.exec(`
      INSERT INTO quality_settings (id, label, multiplier, description, icon) VALUES
      ('basica', 'Básica', 0.8, 'Funcional y económica', 'Zap'),
      ('media', 'Media', 1.0, 'Equilibrio calidad/precio', 'Check'),
      ('alta', 'Alta', 1.3, 'Acabados superiores', 'ShieldCheck'),
      ('premium', 'Premium', 1.7, 'Lo mejor del mercado', 'Hammer')
    `);
  }

  // Seeding housing_settings
  const hsCount = await db.get('SELECT COUNT(*) as count FROM housing_settings');
  if (hsCount.count === 0) {
    await db.exec(`
      INSERT INTO housing_settings (id, label, multiplier, icon) VALUES
      ('piso', 'Piso', 1.0, 'Home'),
      ('casa', 'Casa', 1.05, 'Home'),
      ('chalet', 'Chalet', 1.1, 'Construction'),
      ('local', 'Local', 1.15, 'Building2')
    `);
  }

  // Seeding global_settings
  const gsCount = await db.get('SELECT COUNT(*) as count FROM global_settings');
  if (gsCount.count === 0) {
    await db.exec(`
      INSERT INTO global_settings (key, value, description) VALUES
      ('price_margin', '0.15', 'Margen de error para el presupuesto (±15%)'),
      ('iva_rate', '0.21', 'Tipo de IVA aplicable (21%)'),
      ('currency_symbol', '€', 'Símbolo de la moneda'),
      ('labor_cost_m2', '150', 'Costo base de mano de obra por m2')
    `);
  }

  // Seeding pricing_config (rangos de precios)
  const pcCount = await db.get('SELECT COUNT(*) as count FROM pricing_config');
  if (pcCount.count === 0) {
    await db.exec(`
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
      ('reforma_parcial', 0, 99999, 280)
    `);
  }

  // Seeding extras
  const extrasCount = await db.get('SELECT COUNT(*) as count FROM extras');
  if (extrasCount.count === 0) {
    await db.exec(`
      INSERT INTO extras (id, name, price, icon, category, project_types, is_quality_dependent, price_basic, price_medium, price_high, price_type) VALUES
      ('demolicion', 'Demolición técnica y desescombro', 1200, 'Trash2', 'Fases de Obra', '["reforma_integral","bano","cocina","reforma_parcial"]', 0, 1200, 1200, 1200, 'fixed'),
      ('fontaneria', 'Instalación nueva de fontanería y saneamiento', 1500, 'ShowerHead', 'Instalaciones', '["reforma_integral","bano","cocina"]', 1, 1200, 1500, 2200, 'fixed'),
      ('electricidad', 'Instalación eléctrica completa bajo normativa', 2200, 'Zap', 'Instalaciones', '["reforma_integral","bano","cocina","obra_nueva"]', 1, 1800, 2200, 3100, 'fixed'),
      ('climatizacion', 'Sistema de Climatización por Conductos (Inverter)', 3500, 'Wind', 'Confort', '["reforma_integral","obra_nueva"]', 0, 3500, 3500, 3500, 'fixed'),
      ('pintura', 'Pintura plástica lisa lavable premium', 18, 'Palette', 'Acabados', '["reforma_integral","bano","cocina","obra_nueva","rehabilitacion","reforma_parcial"]', 1, 14, 18, 25, 'm2'),
      ('pladur', 'Tabiquería y falsos techos de pladur', 25, 'Square', 'Estructuras', '["reforma_integral","obra_nueva","reforma_parcial"]', 0, 25, 25, 25, 'm2')
    `);
  }

  // Seeding users (creación del usuario admin)
  const usersCount = await db.get('SELECT COUNT(*) as count FROM users');
  if (usersCount.count === 0) {
    // Para simplificar la migración local, guardaremos la contraseña en texto plano en SQLite o una clave sencilla
    await db.run(
      'INSERT INTO users (id, email, password) VALUES (?, ?, ?)',
      ['admin-uuid', 'admin@conscugar.com', 'admin123']
    );
  }

  console.log('✅ Base de datos SQLite inicializada y cargada con datos iniciales.');
}
