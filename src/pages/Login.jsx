import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, Mail, Lock, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import BackgroundOrbs from '../components/ui/BackgroundOrbs';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: loginError } = await login(email, password);

    if (loginError) {
      setError(loginError.message === 'Invalid login credentials' ? 'Correo o contraseña incorrectos' : loginError.message);
      setLoading(false);
    } else {
      navigate('/admin');
    }
  };

  return (
    <div className="min-h-screen bg-dark text-white flex items-center justify-center p-6 relative">
      <BackgroundOrbs />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md"
      >
        <div className="glass-card p-10 border border-white/10 shadow-2xl space-y-10">
          <div className="text-center space-y-4">
             <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 border border-primary/20 rounded-full mb-2">
                <ShieldCheck className="w-8 h-8 text-primary" />
             </div>
             <h1 className="text-3xl font-outfit font-black tracking-tighter uppercase">
               Acceso <span className="text-primary italic">Admin</span>
             </h1>
             <p className="text-white/40 text-xs font-black uppercase tracking-widest leading-relaxed px-4">
               Gestión de presupuestos y leads de Conscugar Sagunto
             </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@conscugar.es"
                    className="w-full bg-white/5 border border-white/10 p-5 pl-12 text-sm focus:border-primary outline-none transition-all placeholder:text-white/10"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Contraseña</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 p-5 pl-12 text-sm focus:border-primary outline-none transition-all placeholder:text-white/10"
                  />
                </div>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <Button 
              type="submit" 
              className="w-full py-6 font-black uppercase tracking-widest text-[11px]"
              disabled={loading}
            >
              {loading ? (
                <>Accediendo... <Loader2 className="w-4 h-4 ml-2 animate-spin" /></>
              ) : (
                <>Entrar al Panel <LogIn className="w-4 h-4 ml-2" /></>
              )}
            </Button>
          </form>

          <div className="pt-4 text-center">
             <button 
               onClick={() => navigate('/')}
               className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors"
             >
               Volver a la Página Principal
             </button>
          </div>
        </div>

        <p className="text-center mt-12 text-[10px] font-black uppercase tracking-[0.4em] text-white/20">
          © 2024 Conscugar · Sistema de Gestión
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
