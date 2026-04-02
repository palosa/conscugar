import React from 'react';
import { Button } from '../ui/Button';

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark/80 backdrop-blur-lg border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-outfit font-black tracking-tighter uppercase cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            Cons<span className="text-primary">cugar</span>
          </span>
          <div className="h-4 w-[1px] bg-white/20 mx-2 hidden sm:block" />
          <span className="text-[10px] font-black tracking-[0.2em] uppercase text-white/40 hidden sm:block">
            Sagunto · Valencia
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {[
            { label: 'Servicios', href: '#servicios' },
            { label: 'Trayectoria', href: '#portfolio' },
            { label: 'Testimonios', href: '#testimonios' },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-xs font-bold uppercase tracking-widest text-white/60 hover:text-primary transition-colors"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Button variant="primary" size="sm" className="hidden sm:inline-flex" onClick={() => document.getElementById('calculadora')?.scrollIntoView({ behavior: 'smooth' })}>
            Calcular Presupuesto
          </Button>
          <button className="md:hidden flex flex-col gap-1.5 p-2 group">
            <span className="w-6 h-0.5 bg-white group-hover:bg-primary transition-colors" />
            <span className="w-6 h-0.5 bg-white group-hover:bg-primary transition-colors" />
            <span className="w-4 h-0.5 bg-primary self-end" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
