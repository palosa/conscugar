import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar';
import Hero from '../components/Sections/Hero';
import Process from '../components/Sections/Process';
import Portfolio from '../components/Sections/Portfolio';
import Testimonials from '../components/Sections/Testimonials';
import BackgroundOrbs from '../components/ui/BackgroundOrbs';
import kitchenImg from '../assets/kitchen.png';
import bathroomImg from '../assets/bathroom.png';

const Home = () => {
  return (
    <div className="relative min-h-screen">
      <BackgroundOrbs />
      <Navbar />

      <main>
        <Hero />
        <Process />
        <Portfolio />
        <Testimonials />
      </main>

      <footer className="bg-dark pt-32 pb-10 border-t border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
          <div className="space-y-8">
            <span className="text-3xl font-black tracking-tighter uppercase">Cons<span className="text-primary">cugar</span></span>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs font-medium">Expertos en construcción y reformas en Sagunto desde hace más de 15 años. Calidad, transparencia y compromiso real con el cliente.</p>
            <div className="flex gap-4">
              {[
                { id: 'fb', url: '#', label: 'Seguinos en Facebook' },
                { id: 'ig', url: '#', label: 'Seguinos en Instagram' },
                { id: 'in', url: '#', label: 'Conecta en LinkedIn' }
              ].map(social => (
                <a
                  key={social.id}
                  href={social.url}
                  aria-label={social.label}
                  className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-[10px] font-black uppercase hover:border-primary hover:text-primary transition-all cursor-pointer text-white/60"
                >
                  {social.id}
                </a>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 ml-1">Explorar</h4>
            <ul className="space-y-3">
              {['Servicios', 'Proyectos', 'Testimonios', 'Nosotros', 'Contacto'].map(link => (
                <li key={link}><a href={`#${link.toLowerCase()}`} className="text-sm text-white/70 hover:text-primary transition-colors flex items-center gap-2 group font-medium"><span className="w-1 h-1 bg-primary scale-0 group-hover:scale-100 transition-transform" />{link}</a></li>
              ))}
            </ul>
          </div>
          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 ml-1">Contacto</h4>
            <div className="space-y-4">
              <p className="text-sm text-white/70 flex flex-col font-medium"><span className="text-[10px] text-white/30 uppercase font-black mb-1">Dirección</span>Sagunto, Valencia (España)</p>
              <p className="text-sm text-white/70 flex flex-col font-medium"><span className="text-[10px] text-white/30 uppercase font-black mb-1">Email</span>info@conscugar.es</p>
              <p className="text-sm text-white/70 flex flex-col font-medium"><span className="text-[10px] text-white/30 uppercase font-black mb-1">Teléfono</span>+34 962 000 000</p>
            </div>
          </div>
          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 ml-1">Legales</h4>
            <ul className="space-y-3">
              {[
                { label: 'Aviso Legal', path: '/aviso-legal' },
                { label: 'Política de Privacidad', path: '/privacidad' },
                { label: 'Cookies', path: '/cookies' }
              ].map(link => (
                <li key={link.label}>
                  <Link to={link.path} className="text-sm text-white/70 hover:text-primary transition-colors font-medium">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.4em]">© 2026 Conscugar Construcción</p>
          <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em]">Hecho con precisión en Sagunto</p>
        </div>
      </footer>

      {/* Floating WhatsApp CTA */}
      <div className="fixed bottom-8 right-8 z-50">
        <motion.a
          href="https://wa.me/34689025178?text=Hola%20Conscugar!%20He%20visto%20vuestra%20web%20y%20me%20gustar%C3%ADa%20informaci%C3%B3n%20para%20una%20reforma."
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ y: -4, scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Contactar por WhatsApp"
          className="w-16 h-16 bg-[#25D366] text-white flex items-center justify-center shadow-[0_20px_50px_rgba(37,211,102,0.3)] transition-all group relative rounded-full"
        >
          <span className="absolute -left-32 bg-dark-lighter border border-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap">WhatsApp Directo</span>
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.39-4.435 9.819-9.885 9.819m8.362-18.029A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </motion.a>
      </div>
    </div>
  );
};

export default Home;
