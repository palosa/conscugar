# 🏗️ Conscugar Premium · Arquitectura & Reformas

**Conscugar Premium** es una aplicación web de alta gama diseñada para la gestión profesional de presupuestos en el sector de la construcción y reformas de lujo en Sagunto y el Camp de Morvedre.

![Version](https://img.shields.io/badge/version-3.0-gold)
![Base de Datos](https://img.shields.io/badge/database-Supabase-blue)
![Frontend](https://img.shields.io/badge/framework-React%20v18-cyan)

---

## 🚀 Características Principales

### 💎 Calculadora Inteligente (v3.0)
- **Motor de Precios Paramétrico**: Cálculos automáticos basados en superficie ($m^2$), tipo de obra y niveles de calidad (Básica, Media, Alta).
- **Flujo de Usuario Premium**: Interfaz fluida con animaciones de `framer-motion` y lógica de pasos (tipo de obra, m2, calidades, extras).
- **Generador de PDF Industrial**: Exportación instantánea de presupuestos con validez técnica, inclusiones detalladas y diseño orientado a estudios de arquitectura.

### 🔐 Panel de Administración (CRM)
- **Gestión de Leads**: Listado de clientes potenciales con desglose de presupuestos y estados.
- **Configuración Dinámica**: Control total sobre multiplicadores de calidad, precios por m2 y tipos de proyecto sin tocar código.
- **Matriz de Extras**: Sistema para asignar servicios adicionales a categorías de obra específicas con lógicas de precio fijo o volumétrico.

### 📧 Notificaciones & Cumplimiento
- **Resend Ready**: Arquitectura de notificaciones preparada para integración con `resend.com` mediante Edge Functions.
- **Legal Compliance**: Páginas de Aviso Legal, Privacidad y Cookies adaptadas a RGPD/LSSI.
- **Accesibilidad WCAG**: Sistema compatible con lectores de pantalla y navegación por teclado.

---

## 🛠️ Stack Tecnológico

- **Frontend**: React 18 + Vite
- **Estilos**: Tailwind CSS + Custom Design System
- **Base de Datos & Auth**: Supabase
- **PDF**: jsPDF
- **Animaciones**: Framer Motion
- **Iconos**: Lucide React

---

## 📦 Instalación y Despliegue

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/tu-usuario/conscugar-app.git
   cd conscugar-app
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar el Entorno**:
   Crea un archivo `.env` en la raíz (puedes usar el `.env.example` si lo hay) y añade tus credenciales de Supabase:
   ```env
   VITE_SUPABASE_URL=tu_url_de_supabase
   VITE_SUPABASE_ANON_KEY=tu_clave_anon_de_supabase
   ```

4. **Ejecutar en desarrollo**:
   ```bash
   npm run dev
   ```

---

## 📐 Estructura de Datos (Supabase)

La app utiliza las siguientes tablas clave:
- `project_types`: Definiciones de obra, iconos e inclusiones técnicas.
- `extras`: Catálogo de servicios adicionales vinculables a tipos de obra.
- `leads`: Registro de consultas y presupuestos generados.
- `quality_settings`: Multiplicadores de precio para calidades B/M/A.

---

## ✒️ Autor
**Conscugar Sagunto** - *Construcción y Reformas de Confianza*

Este proyecto ha sido industrializado y profesionalizado con un enfoque en la conversión y la transparencia técnica.
