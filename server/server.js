import express from 'express';
import cors from 'cors';
import { initDb, getDb } from './database.js';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Iniciar base de datos
initDb().catch(err => {
  console.error('❌ Error al inicializar la base de datos:', err);
});

// Helper para sanitizar y formatear datos al leer de la base de datos
function formatRowRead(table, row) {
  if (!row) return null;
  const formatted = { ...row };
  
  // Convertir campos booleanos de SQLite (0/1) a booleanos JS (true/false)
  if (table === 'extras') {
    if (formatted.project_types) {
      try {
        formatted.project_types = JSON.parse(formatted.project_types);
      } catch {
        formatted.project_types = [];
      }
    }
    formatted.is_quality_dependent = formatted.is_quality_dependent === 1 || formatted.is_quality_dependent === true;
  }
  
  if (table === 'leads') {
    if (formatted.selected_extras) {
      try {
        formatted.selected_extras = JSON.parse(formatted.selected_extras);
      } catch {
        formatted.selected_extras = [];
      }
    }
    if (formatted.breakdown) {
      try {
        formatted.breakdown = JSON.parse(formatted.breakdown);
      } catch {
        formatted.breakdown = {};
      }
    }
    formatted.has_elevator = formatted.has_elevator === 1 || formatted.has_elevator === true;
  }
  
  return formatted;
}

// Helper para formatear datos al escribir en la base de datos
function formatRowWrite(table, data) {
  const formatted = { ...data };
  
  // Convertir arrays/objetos a string JSON para SQLite
  if (table === 'extras') {
    if (Array.isArray(formatted.project_types)) {
      formatted.project_types = JSON.stringify(formatted.project_types);
    }
    if (formatted.is_quality_dependent !== undefined) {
      formatted.is_quality_dependent = formatted.is_quality_dependent ? 1 : 0;
    }
  }
  
  if (table === 'leads') {
    if (Array.isArray(formatted.selected_extras)) {
      formatted.selected_extras = JSON.stringify(formatted.selected_extras);
    }
    if (typeof formatted.breakdown === 'object') {
      formatted.breakdown = JSON.stringify(formatted.breakdown);
    }
    if (formatted.has_elevator !== undefined) {
      formatted.has_elevator = formatted.has_elevator ? 1 : 0;
    }
  }
  
  return formatted;
}

// --- RUTAS DE API ---

// 1. Obtener todos los registros de una tabla (lectura)
app.get('/api/tables/:table', async (req, res) => {
  const { table } = req.params;
  const validTables = ['project_types', 'quality_settings', 'housing_settings', 'global_settings', 'pricing_config', 'extras', 'leads'];
  
  if (!validTables.includes(table)) {
    return res.status(400).json({ error: 'Tabla no válida' });
  }

  try {
    const db = await getDb();
    let query = `SELECT * FROM ${table}`;
    
    // Aplicar ordenación por defecto si corresponde
    if (table === 'project_types') {
      query += ' ORDER BY display_order ASC';
    } else if (table === 'leads') {
      query += ' ORDER BY created_at DESC';
    }
    
    const rows = await db.all(query);
    const formattedRows = rows.map(row => formatRowRead(table, row));
    
    res.json({ data: formattedRows });
  } catch (err) {
    console.error(`Error al consultar tabla ${table}:`, err);
    res.status(500).json({ error: err.message });
  }
});

// 2. Insertar registros en una tabla
app.post('/api/tables/:table', async (req, res) => {
  const { table } = req.params;
  let items = req.body;

  if (!Array.isArray(items)) {
    items = [items];
  }

  try {
    const db = await getDb();
    const insertedIds = [];

    for (const rawItem of items) {
      const item = formatRowWrite(table, rawItem);
      const keys = Object.keys(item);
      const values = Object.values(item);
      const placeholders = keys.map(() => '?').join(', ');
      
      const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
      const result = await db.run(sql, values);
      insertedIds.push(result.lastID);
    }

    res.json({ success: true, ids: insertedIds });
  } catch (err) {
    console.error(`Error al insertar en tabla ${table}:`, err);
    res.status(500).json({ error: err.message });
  }
});

// 3. Actualizar un registro en una tabla
app.put('/api/tables/:table/:id', async (req, res) => {
  const { table, id } = req.params;
  const rawItem = req.body;

  try {
    const db = await getDb();
    const item = formatRowWrite(table, rawItem);
    
    const keys = Object.keys(item);
    const values = Object.values(item);
    
    const setClause = keys.map(k => `${k} = ?`).join(', ');
    
    // Identificar la clave primaria (usualmente 'id', pero en global_settings es 'key')
    const primaryKeyField = table === 'global_settings' ? 'key' : 'id';
    
    const sql = `UPDATE ${table} SET ${setClause} WHERE ${primaryKeyField} = ?`;
    await db.run(sql, [...values, id]);
    
    res.json({ success: true });
  } catch (err) {
    console.error(`Error al actualizar tabla ${table}:`, err);
    res.status(500).json({ error: err.message });
  }
});

// 4. Eliminar un registro en una tabla
app.delete('/api/tables/:table/:id', async (req, res) => {
  const { table, id } = req.params;
  const primaryKeyField = table === 'global_settings' ? 'key' : 'id';

  try {
    const db = await getDb();
    const sql = `DELETE FROM ${table} WHERE ${primaryKeyField} = ?`;
    await db.run(sql, [id]);
    
    res.json({ success: true });
  } catch (err) {
    console.error(`Error al eliminar en tabla ${table}:`, err);
    res.status(500).json({ error: err.message });
  }
});

// --- AUTENTICACIÓN ---

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const db = await getDb();
    const user = await db.get('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Mock session token
    const session = {
      user: {
        id: user.id,
        email: user.email
      },
      access_token: 'mock-jwt-token-' + user.id,
      expires_at: Math.floor(Date.now() / 1000) + 3600 // 1 hora de expiración
    };

    res.json({ data: { session } });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ error: err.message });
  }
});

// Servidor escuchando
app.listen(port, () => {
  console.log(`🚀 Servidor backend local ejecutándose en http://localhost:${port}`);
});
