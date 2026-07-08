import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar';
import Hero from '../components/Sections/Hero';
import Process from '../components/Sections/Process';
import About from '../components/Sections/About';
import Portfolio from '../components/Sections/Portfolio';
import Testimonials from '../components/Sections/Testimonials';
import BackgroundOrbs from '../components/ui/BackgroundOrbs';
import ContactBubble from '../components/ui/ContactBubble';
import { supabase } from '../utils/supabase';
import kitchenImg from '../assets/kitchen.png';
import bathroomImg from '../assets/bathroom.png';

const Home = () => {
  const [phone, setPhone] = useState('34600000000');

  useEffect(() => {
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
      <Navbar />

      <main>
        <Hero />
        <Process />
        <About />
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
                { id: 'ig', url: '#', label: 'Seguinos en Instagram' }
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
          <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.4em]">© {new Date().getFullYear()} <span className="text-primary">Conscugar</span> Construcción</p>
          <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em]">Hecho con precisión en Sagunto</p>
        </div>
      </footer>

      {/* Contact floating bubble (unified options) */}
      <ContactBubble phone={phone} />
    </div>
  );
};

export default Home;
