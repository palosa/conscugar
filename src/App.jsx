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

    // Actualizar canonical, og:url y robots dinámicamente según la ruta activa
    const canonicalEl = document.querySelector('link[rel="canonical"]');
    const ogUrlEl = document.querySelector('meta[property="og:url"]');
    const robotsEl = document.querySelector('meta[name="robots"]');
    const baseUrl = 'https://www.conscugar.es';
    const currentUrl = pathname === '/' ? `${baseUrl}/` : `${baseUrl}${pathname}`;

    if (canonicalEl) {
      canonicalEl.setAttribute('href', currentUrl);
    }
    if (ogUrlEl) {
      ogUrlEl.setAttribute('content', currentUrl);
    }

    // Asegurar que og:image apunte al origen absoluto exacto del host activo (Vercel o dominio definitivo)
    const ogImageEl = document.querySelector('meta[property="og:image"]');
    const ogImageSecureEl = document.querySelector('meta[property="og:image:secure_url"]');
    const twitterImageEl = document.querySelector('meta[name="twitter:image"]');
    if (typeof window !== 'undefined' && window.location?.origin) {
      const absoluteOgImage = `${window.location.origin}/og-image.jpg`;
      if (ogImageEl) ogImageEl.setAttribute('content', absoluteOgImage);
      if (ogImageSecureEl) ogImageSecureEl.setAttribute('content', absoluteOgImage);
      if (twitterImageEl) twitterImageEl.setAttribute('content', absoluteOgImage);
    }

    if (robotsEl) {
      const isPrivateRoute = pathname.startsWith('/admin') || pathname.startsWith('/login');
      robotsEl.setAttribute('content', isPrivateRoute ? 'noindex, nofollow' : 'index, follow, max-image-preview:large');
    }

    if (pathname === '/') {
      document.title = 'Conscugar | Reformas y Construcción en Sagunto y Valencia';
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


