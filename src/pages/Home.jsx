import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, MapPin, ArrowUpRight } from 'lucide-react';
import Navbar from '../components/Layout/Navbar';
import ScrollSequenceCover from '../components/Sections/ScrollSequenceCover';
import Hero from '../components/Sections/Hero';
import Process from '../components/Sections/Process';
import About from '../components/Sections/About';
import Portfolio from '../components/Sections/Portfolio';
import Testimonials from '../components/Sections/Testimonials';
import BackgroundOrbs from '../components/ui/BackgroundOrbs';
import ContactBubble from '../components/ui/ContactBubble';
import { supabase, isSupabaseConfigured } from '../utils/supabase';

const FOOTER_NAV_LINKS = [
  { label: 'Calculadora de Presupuesto', href: '#calculadora' },
  { label: 'Método de Trabajo', href: '#servicios' },
  { label: 'Estudio Técnico', href: '#nosotros' },
  { label: 'Proyectos Entregados', href: '#portfolio' },
  { label: 'Opiniones de Clientes', href: '#testimonios' },
  { label: 'Preguntas Frecuentes', href: '#faq' },
];

const SEO_FAQS = [
  {
    q: '¿Cuánto cuesta una reforma integral en Sagunto, Puerto de Sagunto o Valencia en 2026?',
    a: 'El coste de una reforma integral oscila habitualmente entre 420 €/m² y 680 €/m² según el estado previo de las instalaciones (fontanería, electricidad), la gama de calidades elegida y la accesibilidad del edificio. Con nuestra calculadora online puedes obtener tu presupuesto personalizado desde 1 m² sin mínimos artificiales.'
  },
  {
    q: '¿Qué tipo de IVA incluye el presupuesto de la calculadora?',
    a: 'Todos los presupuestos generados en nuestra calculadora aplican el 21% de IVA general sobre la base imponible (tanto para clientes particulares en pisos, casas o chalets como para locales comerciales), mostrando el importe desglosado junto al Presupuesto de Ejecución Material (PEM) y las tasas municipales.'
  },
  {
    q: '¿Qué licencias de obra e impuestos municipales (ICIO) se necesitan en Sagunto y Valencia?',
    a: 'Dependiendo del alcance (renovación de acabados frente a redistribución de tabiquería o fachada), se tramita mediante Declaración Responsable de Obras o Licencia Urbanística. Las tasas municipales y el ICIO rondan el 4% del Presupuesto de Ejecución Material (PEM) y están exentos de IVA. Nuestro equipo técnico gestiona el trámite completo.'
  },
  {
    q: '¿Cómo pasamos de la estimación online al presupuesto definitivo por contrato?',
    a: 'Una vez calculas tu valoración y descargas el dossier PDF, puedes solicitar una visita técnica gratuita. Un arquitecto técnico de Conscugar mide el inmueble in situ, verifica bajantes, cuadro eléctrico y niveles, y te entrega un presupuesto cerrado por partidas con fecha de inicio y fin garantizadas por contrato.'
  }
];

const LOCAL_ZONES = [
  'Sagunto Centro Histórico',
  'Puerto de Sagunto',
  'Canet d’en Berenguer',
  'Almardà y Corinto',
  'Gilet y Balcón de la Peña',
  'Puçol y El Puig',
  'Almenara y Petrés',
  'Valencia Capital y Área Metropolitana'
];

const Home = () => {
  const [phone, setPhone] = useState('34600000000');
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const fetchPhone = async () => {
      try {
        const { data } = await supabase.from('global_settings').select('value').eq('key', 'contact_phone').single();
        if (data?.value) {
          setPhone(data.value);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchPhone();
  }, []);

  return (
    <div className="relative min-h-screen">
      <BackgroundOrbs />
      <Navbar phone={phone} />

      <main>
        <ScrollSequenceCover />
        <Hero phone={phone} />
        <Process />
        <About />
        <Portfolio />
        <Testimonials />

        {/* SECCIÓN SEO & MARKETING: PREGUNTAS FRECUENTES + COBERTURA LOCAL */}
        <section id="faq" aria-labelledby="faq-heading" className="py-20 md:py-28 bg-white border-t border-stone-200/80">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-extrabold tracking-widest uppercase text-primary block">
                Resolvemos tus dudas técnicas
              </span>
              <h2 id="faq-heading" className="text-3xl sm:text-4xl font-outfit font-extrabold tracking-tight text-stone-900">
                Preguntas frecuentes sobre presupuestos, licencias e IVA de reforma.
              </h2>
              <p className="text-sm text-stone-600 leading-relaxed">
                Transparencia desde el primer clic. Aquí respondemos las consultas más habituales de propietarios en la comarca del Camp de Morvedre y Valencia antes de iniciar su obra.
              </p>

              {/* Zonas de Actuación (SEO Local) */}
              <div className="p-6 rounded-2xl bg-[#F7F5F0] border border-stone-200/90 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-900">
                  <MapPin className="w-4 h-4 text-primary" aria-hidden="true" />
                  <span>Zonas de servicio directo con visita gratuita</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {LOCAL_ZONES.map((zone) => (
                    <span
                      key={zone}
                      className="px-3 py-1 rounded-lg bg-white border border-stone-200 text-xs font-medium text-stone-700"
                    >
                      {zone}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-3.5">
              {SEO_FAQS.map((item, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-stone-200/90 bg-[#F7F5F0]/50 overflow-hidden transition-all"
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                      className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 hover:bg-white transition-colors"
                    >
                      <span className="text-sm sm:text-base font-bold text-stone-900">{item.q}</span>
                      <ChevronDown
                        className={`w-5 h-5 text-primary shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        aria-hidden="true"
                      />
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-5 pt-1 text-sm text-stone-600 leading-relaxed bg-white border-t border-stone-100">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl bg-stone-900 text-white">
                <div>
                  <p className="text-sm font-bold">¿Listo para conocer el importe de tu obra?</p>
                  <p className="text-xs text-stone-300">Calcula desde 1 m² con desglose completo al instante.</p>
                </div>
                <a
                  href="#calculadora"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition-all shrink-0"
                >
                  Ir a la calculadora <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-stone-900 text-white pt-20 pb-12 border-t border-stone-800 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-5">
            <span className="text-2xl font-outfit font-extrabold tracking-tight">
              CONSCUGAR
            </span>
            <p className="text-stone-400 text-sm leading-relaxed max-w-xs">
              Estudio técnico de arquitectura, reformas integrales y construcción en Sagunto, Puerto de Sagunto, Camp de Morvedre y Valencia.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400">Navegación</h3>
            <ul className="space-y-2.5">
              {FOOTER_NAV_LINKS.map(link => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-stone-300 hover:text-orange-400 transition-colors inline-block py-0.5">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400">Contacto Directo</h3>
            <div className="space-y-3 text-sm text-stone-300">
              <p><span className="text-xs text-stone-500 block">Ubicación</span>Sagunto y Puerto de Sagunto, Valencia</p>
              <p><span className="text-xs text-stone-500 block">Correo Electrónico</span><a href="mailto:info@conscugar.es" className="hover:text-orange-400 transition-colors">info@conscugar.es</a></p>
              <p><span className="text-xs text-stone-500 block">Teléfono y WhatsApp</span><a href={`tel:+${phone}`} className="hover:text-orange-400 transition-colors tabular-nums">+{phone}</a></p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400">Información Legal</h3>
            <ul className="space-y-2.5">
              {[
                { label: 'Aviso Legal', path: '/aviso-legal' },
                { label: 'Política de Privacidad', path: '/privacidad' },
                { label: 'Política de Cookies', path: '/cookies' }
              ].map(link => (
                <li key={link.label}>
                  <Link to={link.path} className="text-sm text-stone-300 hover:text-orange-400 transition-colors inline-block py-0.5">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-stone-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-stone-400">
          <p>© {new Date().getFullYear()} Conscugar Arquitectura y Reformas · Todos los derechos reservados.</p>
          <p>Sagunto · Puerto de Sagunto · Camp de Morvedre · Valencia</p>
        </div>
      </footer>

      <ContactBubble phone={phone} />
    </div>
  );
};

export default Home;

