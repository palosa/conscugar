import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, Mail, Lock, ShieldCheck, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
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
      setError(
        loginError.message === 'Invalid login credentials'
          ? 'Correo o contraseña incorrectos'
          : loginError.message
      );
      setLoading(false);
    } else {
      navigate('/admin');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-stone-900 flex items-center justify-center p-6 relative">
      <BackgroundOrbs />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-stone-200/90 shadow-[0_20px_50px_-12px_rgba(28,25,23,0.08)] space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-orange-950/[0.06] border border-orange-900/15 rounded-2xl mb-1">
              <ShieldCheck className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-outfit font-extrabold tracking-tight text-stone-900">
              Acceso <span className="text-primary">Dirección Técnica</span>
            </h1>
            <p className="text-stone-500 text-xs font-medium leading-relaxed px-2">
              Gestión de presupuestos, precios por m² y leads de <strong className="text-stone-800">Conscugar</strong>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="login-email"
                  className="text-xs font-bold text-stone-700 ml-1"
                >
                  Correo electrónico
                </label>
                <div className="relative group">
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-primary transition-colors"
                    aria-hidden="true"
                  />
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@conscugar.es"
                    className="w-full rounded-xl bg-[#F7F5F0] border border-stone-300/90 p-3.5 pl-11 text-sm text-stone-900 focus:border-primary focus:bg-white outline-none transition-all placeholder:text-stone-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="login-password"
                  className="text-xs font-bold text-stone-700 ml-1"
                >
                  Contraseña
                </label>
                <div className="relative group">
                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-primary transition-colors"
                    aria-hidden="true"
                  />
                  <input
                    id="login-password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl bg-[#F7F5F0] border border-stone-300/90 p-3.5 pl-11 text-sm text-stone-900 focus:border-primary focus:bg-white outline-none transition-all placeholder:text-stone-400"
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
                  className="flex items-center gap-2 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              type="submit"
              className="w-full py-4 font-bold text-sm rounded-xl"
              disabled={loading}
            >
              {loading ? (
                <>
                  Accediendo... <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                </>
              ) : (
                <>
                  Entrar al Panel <LogIn className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver a la web principal</span>
            </button>
          </div>
        </div>

        <p className="text-center mt-8 text-xs font-medium text-stone-500">
          © {new Date().getFullYear()} <span className="text-primary font-bold">Conscugar</span> · Sagunto y Valencia
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
