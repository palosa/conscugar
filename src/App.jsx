import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Home from './pages/Home';

const Admin = lazy(() => import('./pages/Admin'));
const Login = lazy(() => import('./pages/Login'));
const AvisoLegal = lazy(() => import('./pages/legal/LegalPages').then(m => ({ default: m.AvisoLegal })));
const Privacidad = lazy(() => import('./pages/legal/LegalPages').then(m => ({ default: m.Privacidad })));
const Cookies = lazy(() => import('./pages/legal/LegalPages').then(m => ({ default: m.Cookies })));

function ScrollAndMetaManager() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);

    // Actualizar canonical y robots dinámicamente según la ruta activa
    const canonicalEl = document.querySelector('link[rel="canonical"]');
    const robotsEl = document.querySelector('meta[name="robots"]');
    const baseUrl = 'https://www.conscugar.es';

    if (canonicalEl) {
      canonicalEl.setAttribute('href', pathname === '/' ? `${baseUrl}/` : `${baseUrl}${pathname}`);
    }

    if (robotsEl) {
      const isPrivateRoute = pathname.startsWith('/admin') || pathname.startsWith('/login');
      robotsEl.setAttribute('content', isPrivateRoute ? 'noindex, nofollow' : 'index, follow, max-image-preview:large');
    }

    if (pathname === '/') {
      document.title = 'Conscugar | Reformas Integrales y Construcción en Sagunto y Valencia — Calculadora Online';
    } else if (pathname === '/login') {
      document.title = 'Acceso Administración | Conscugar';
    } else if (pathname === '/admin') {
      document.title = 'Panel de Control | Conscugar';
    }
  }, [pathname]);
  return null;
}

function App() {
  return (
    <AuthProvider>
      <ScrollAndMetaManager />
      <Suspense fallback={<div className="min-h-screen bg-[#F7F5F0]" aria-busy="true" />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/aviso-legal" element={<AvisoLegal />} />
          <Route path="/privacidad" element={<Privacidad />} />
          <Route path="/cookies" element={<Cookies />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}

export default App;


