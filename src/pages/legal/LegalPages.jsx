import React from 'react';
import Navbar from '../../components/Layout/Navbar';
import { motion } from 'framer-motion';

const LegalLayout = ({ title, children }) => (
  <div className="min-h-screen bg-dark text-white font-outfit">
    <Navbar />
    <main className="max-w-4xl mx-auto px-6 pt-40 pb-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-12"
      >
        <header className="space-y-4 border-l-4 border-primary pl-8">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">Documentación Legal</p>
          <h1 className="text-5xl font-black uppercase italic tracking-tighter">{title}</h1>
        </header>
        <div className="prose prose-invert prose-primary max-w-none text-white/60 leading-relaxed space-y-8 text-sm">
          {children}
        </div>
      </motion.div>
    </main>
    <footer className="py-10 border-t border-white/5 text-center">
       <p className="text-[10px] text-white/10 font-black uppercase tracking-widest">© 2024 Conscugar Premium Construction · Sagunto</p>
    </footer>
  </div>
);

export const AvisoLegal = () => (
  <LegalLayout title="Aviso Legal">
    <section className="space-y-4">
      <h2 className="text-white text-xl font-bold uppercase italic">1. Información Identificativa</h2>
      <p>En cumplimiento con el deber de información recogido en artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y del Comercio Electrónico (LSSI-CE), se facilitan los siguientes datos:</p>
      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Titular:</strong> Conscugar Premium Construction (en adelante, Conscugar)</li>
        <li><strong>Domicilio:</strong> Sagunto, Valencia (España)</li>
        <li><strong>Email:</strong> info@conscugar.es</li>
        <li><strong>Actividad:</strong> Construcción y reformas integrales</li>
      </ul>
    </section>
    <section className="space-y-4">
      <h2 className="text-white text-xl font-bold uppercase italic">2. Usuarios</h2>
      <p>El acceso y/o uso de este portal de Conscugar atribuye la condición de USUARIO, que acepta, desde dicho acceso y/o uso, las Condiciones Generales de Uso aquí reflejadas.</p>
    </section>
    <section className="space-y-4">
      <h2 className="text-white text-xl font-bold uppercase italic">3. Propiedad Intelectual e Industrial</h2>
      <p>Conscugar por sí o como cesionaria, es titular de todos los derechos de propiedad intelectual e industrial de su página web, así como de los elementos contenidos en la misma (a título enunciativo, imágenes, sonido, audio, vídeo, software o textos; marcas o logotipos, combinaciones de colores, estructura y diseño, selección de materiales usados, etc.).</p>
    </section>
  </LegalLayout>
);

export const Privacidad = () => (
  <LegalLayout title="Política de Privacidad">
    <section className="space-y-4">
      <h2 className="text-white text-xl font-bold uppercase italic">1. Protección de Datos</h2>
      <p>De conformidad con lo dispuesto en el Reglamento General (UE) 2016/679 de Protección de Datos (RGPD) y en la Ley Orgánica 3/2018 de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD), le informamos que los datos recogidos en la calculadora de presupuestos de Conscugar serán tratados bajo nuestra responsabilidad.</p>
    </section>
    <section className="space-y-4">
      <h2 className="text-white text-xl font-bold uppercase italic">2. Finalidad del Tratamiento</h2>
      <p>La finalidad de la recogida y tratamiento de los datos personales es la elaboración de presupuestos personalizados para servicios de construcción y reformas, así como la gestión comercial de los leads generados.</p>
    </section>
    <section className="space-y-4">
      <h2 className="text-white text-xl font-bold uppercase italic">3. Derechos del Usuario</h2>
      <p>Cualquier persona tiene derecho a obtener confirmación sobre si en Conscugar estamos tratando datos personales que les conciernan o no. Los interesados tienen derecho a acceder a sus datos personales, así como a solicitar la rectificación de los datos inexactos o, en su caso, solicitar su supresión.</p>
    </section>
  </LegalLayout>
);

export const Cookies = () => (
  <LegalLayout title="Política de Cookies">
    <section className="space-y-4">
      <h2 className="text-white text-xl font-bold uppercase italic">¿Qué son las cookies?</h2>
      <p>Una cookie es un fichero que se descarga en su ordenador al acceder a determinadas páginas web. Las cookies permiten a una página web, entre otras cosas, almacenar y recuperar información sobre los hábitos de navegación de un usuario o de su equipo.</p>
    </section>
    <section className="space-y-4">
      <h2 className="text-white text-xl font-bold uppercase italic">Tipos de cookies utilizadas</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Cookies técnicas:</strong> Necesarias para el funcionamiento de la calculadora y la navegación.</li>
        <li><strong>Cookies de análisis:</strong> Permiten cuantificar el número de usuarios y realizar la medición y análisis estadístico del uso que hacen los usuarios de la web.</li>
      </ul>
    </section>
  </LegalLayout>
);
