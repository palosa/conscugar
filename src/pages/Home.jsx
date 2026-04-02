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
            <span className="text-3xl font-black tracking-tighter uppercase">Con<span className="text-primary">scugar</span></span>
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
          <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.4em]">© 2024 Conscugar Premium Construction</p>
          <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em]">Hecho con precisión en Sagunto</p>
        </div>
      </footer>

      {/* Floating CTA */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-3">
         <motion.button 
            whileHover={{ y: -4, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => document.getElementById('calculadora')?.scrollIntoView({ behavior: 'smooth' })}
            aria-label="Abrir calculadora de presupuestos"
            className="w-16 h-16 bg-primary text-dark flex items-center justify-center shadow-[0_20px_50px_rgba(245,197,24,0.3)] transition-all group relative"
         >
            <span className="absolute -left-32 bg-dark-lighter border border-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap">Presupuesto</span>
            <svg className="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24"><path d="M20 15.5c-1.2 0-2.4-.2-3.6-.6-.3-.1-.7 0-1 .2l-2.2 2.2c-2.8-1.4-5.1-3.8-6.6-6.6l2.2-2.2c.3-.3.4-.7.2-1-.3-1.1-.5-2.3-.5-3.5 0-.6-.4-1-1-1H4c-.6 0-1 .4-1 1 0 9.4 7.6 17 17 17 .6 0 1-.4 1-1v-3.5c0-.6-.4-1-1-1z"/></svg>
         </motion.button>
      </div>
    </div>
  );
};

export default Home;
