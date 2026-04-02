import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const navLinks = [
    { label: 'Servicios', href: '#servicios' },
    { label: 'Trayectoria', href: '#portfolio' },
    { label: 'Testimonios', href: '#testimonios' },
  ];
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark/80 backdrop-blur-lg border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black tracking-tighter uppercase cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            Cons<span className="text-primary">cugar</span>
          </span>
          <div className="h-4 w-[1px] bg-white/20 mx-2 hidden sm:block" />
          <span className="text-[10px] font-black tracking-[0.2em] uppercase text-white/40 hidden sm:block">
            Sagunto · Valencia
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-xs font-black uppercase tracking-widest text-white/40 hover:text-primary transition-colors"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Button 
            variant="primary" 
            size="sm" 
            className="hidden sm:inline-flex text-[10px] font-black uppercase tracking-widest px-8" 
            onClick={() => document.getElementById('calculadora')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Presupuesto
          </Button>
          
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-primary focus:outline-none"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-20 left-0 right-0 bg-[#0a0a0a] border-b border-white/5 p-6 flex flex-col gap-6 md:hidden z-40"
          >
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-sm font-black uppercase tracking-[0.2em] text-white/60 hover:text-primary py-2 transition-all"
              >
                {item.label}
              </a>
            ))}
            <Button 
              variant="primary" 
              className="w-full py-6 uppercase font-black tracking-widest"
              onClick={() => {
                setIsMobileMenuOpen(false);
                document.getElementById('calculadora')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Calcular Presupuesto
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
