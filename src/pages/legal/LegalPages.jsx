import React, { useEffect } from 'react';
import Navbar from '../../components/Layout/Navbar';
import { motion } from 'framer-motion';

const LegalLayout = ({ title, children }) => {
  useEffect(() => {
    document.title = `${title} | Conscugar Arquitectura y Reformas`;
  }, [title]);

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-stone-900 font-inter">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-stone-200/90 p-8 sm:p-12 shadow-sm space-y-10"
        >
          <header className="space-y-3 border-l-4 border-primary pl-6">
            <p className="text-xs font-extrabold uppercase tracking-widest text-primary">Documentación Legal y RGPD</p>
            <h1 className="text-3xl sm:text-5xl font-outfit font-extrabold tracking-tight text-stone-900">{title}</h1>
          </header>
          <div className="max-w-none text-stone-600 leading-relaxed space-y-8 text-sm">
            {children}
          </div>
        </motion.div>
      </main>
      <footer className="py-10 border-t border-stone-200 text-center">
        <p className="text-xs text-stone-500 font-semibold">© {new Date().getFullYear()} Conscugar Arquitectura y Reformas · Sagunto y Valencia</p>
      </footer>
    </div>
  );
};

export const AvisoLegal = () => (
  <LegalLayout title="Aviso Legal">
    <section className="space-y-3">
      <h2 className="text-stone-900 text-lg font-bold">1. Información Identificativa (LSSI-CE)</h2>
      <p>En cumplimiento con el deber de información recogido en el artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y del Comercio Electrónico (LSSI-CE), se facilitan los siguientes datos:</p>
      <ul className="list-disc pl-6 space-y-1.5">
        <li><strong>Titular:</strong> Conscugar Arquitectura, Reformas y Construcción (en adelante, Conscugar)</li>
        <li><strong>Domicilio:</strong> Sagunto, Valencia (España)</li>
        <li><strong>Email de contacto:</strong> info@conscugar.es</li>
        <li><strong>Actividad:</strong> Ejecución de obras, rehabilitaciones y reformas integrales o parciales</li>
      </ul>
    </section>
    <section className="space-y-3">
      <h2 className="text-stone-900 text-lg font-bold">2. Naturaleza Orientativa del Presupuestador Online</h2>
      <p>Las valoraciones generadas mediante la calculadora online constituyen estimaciones paramétricas orientativas basadas en los metros cuadrados y calidades indicados por el usuario. No constituyen oferta contractual vinculante hasta la realización de la visita técnica presencial y firma del correspondiente presupuesto-contrato de ejecución de obra.</p>
    </section>
    <section className="space-y-3">
      <h2 className="text-stone-900 text-lg font-bold">3. Propiedad Intelectual e Industrial</h2>
      <p>Conscugar es titular de todos los derechos de propiedad intelectual e industrial de su página web, así como de su motor de cálculo, fotografías de obra, estructura y diseño.</p>
    </section>
  </LegalLayout>
);

export const Privacidad = () => (
  <LegalLayout title="Política de Privacidad">
    <section className="space-y-3">
      <h2 className="text-stone-900 text-lg font-bold">1. Responsable y Protección de Datos (RGPD y LOPDGDD)</h2>
      <p>De conformidad con lo dispuesto en el Reglamento General (UE) 2016/679 de Protección de Datos (RGPD) y en la Ley Orgánica 3/2018 (LOPDGDD), le informamos que los datos personales facilitados en la calculadora de presupuestos serán tratados por Conscugar con domicilio en Sagunto (Valencia) y correo info@conscugar.es.</p>
    </section>
    <section className="space-y-3">
      <h2 className="text-stone-900 text-lg font-bold">2. Finalidad y Base Jurídica del Tratamiento</h2>
      <p>La finalidad del tratamiento es elaborar y enviar la valoración técnica solicitada por el interesado, así como gestionar la solicitud de visita técnica y el contacto precontractual por correo electrónico, teléfono o WhatsApp (base jurídica: ejecución de medidas precontractuales a petición del interesado, Art. 6.1.b RGPD, y consentimiento expreso del usuario, Art. 6.1.a RGPD).</p>
    </section>
    <section className="space-y-3">
      <h2 className="text-stone-900 text-lg font-bold">3. Plazo de Conservación y Derechos</h2>
      <p>Los datos se conservarán durante la tramitación del presupuesto y hasta un máximo de 12 meses para seguimiento de la solicitud, o durante los plazos legales aplicables. Puede ejercer sus derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad enviando un correo a info@conscugar.es, así como presentar reclamación ante la AEPD (www.aepd.es).</p>
    </section>
  </LegalLayout>
);

export const Cookies = () => (
  <LegalLayout title="Política de Cookies">
    <section className="space-y-3">
      <h2 className="text-stone-900 text-lg font-bold">¿Qué son las cookies y almacenamiento local?</h2>
      <p>Este sitio web utiliza almacenamiento técnico estrictamente necesario para recordar los pasos de la calculadora durante su sesión y garantizar el funcionamiento seguro del servicio.</p>
    </section>
    <section className="space-y-3">
      <h2 className="text-stone-900 text-lg font-bold">Tipos de cookies utilizadas</h2>
      <ul className="list-disc pl-6 space-y-1.5">
        <li><strong>Cookies técnicas (exentas de consentimiento según Guía AEPD):</strong> Imprescindibles para el funcionamiento de la calculadora y la autenticación de administradores.</li>
      </ul>
    </section>
  </LegalLayout>
);

