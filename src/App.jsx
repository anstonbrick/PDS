import React, { Suspense, lazy, useLayoutEffect, useCallback, useRef } from 'react';
import gsap from 'gsap';
import { useTranslation } from './hooks/useTranslation';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';

// Lazy Load Components
const VisualProof = lazy(() => import('./components/VisualProof'));
const Showcase = lazy(() => import('./components/Showcase'));
const ProcessScroll = lazy(() => import('./components/ProcessScroll'));
const RequestForm = lazy(() => import('./components/RequestForm'));
const FAB = lazy(() => import('./components/FAB'));
const BetaOverlay = lazy(() => import('./components/BetaOverlay'));

import AuthScreen from './components/Auth/AuthScreen';
import LoadingScreen from './components/LoadingScreen';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
const DeliveryTracking = lazy(() => import('./components/DeliveryTracking'));
const UserDashboard = lazy(() => import('./components/UserDashboard'));

const LoadingFallback = () => (
  <div className="h-20 w-full flex items-center justify-center bg-render-black">
    <div className="w-10 h-[1px] bg-electric-blue animate-pulse" />
  </div>
);

// Performance: Register plugins once
gsap.registerPlugin(ScrollTrigger);

// Performance: Optimize GSAP global settings
gsap.config({
  force3D: true,
  nullTargetWarn: false,
  autoSleep: 60
});

// Performance: Ticker settings
gsap.ticker.fps(120);
gsap.ticker.lagSmoothing(500, 33);

// --- MAIN LANDING PAGE COMPONENT (Original App Logic) ---
const LandingPage = () => {
  // Performance: Use ref for animation frame tracking
  const rafId = useRef(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const { t } = useTranslation();

  // Auth & Loading State
  const [user, setUser] = React.useState(() => {
    const saved = localStorage.getItem('pds_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [showLoading, setShowLoading] = React.useState(false); // Initially defined as false, triggered on login
  const [showAuth, setShowAuth] = React.useState(false);

  // Check auth on mount to prompt only if desired (Optional: we start public now)
  // If we wanted to prompt login on first visit: useEffect(() => { if(!user) setShowAuth(true) }, []);

  const handleLoginSuccess = (userData) => {
    localStorage.setItem('pds_user', JSON.stringify(userData));
    setUser(userData);
    setShowLoading(true); // Trigger loading screen after successful login
    setShowAuth(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('pds_user');
    setUser(null);
    window.location.reload(); // Simple reload to clear state cleanly
  };

  const handleLoadingComplete = () => {
    setShowLoading(false);
  };

  // Performance: Throttled mouse handler using RAF
  const handleMouseMove = useCallback((e) => {
    mousePos.current = { x: e.clientX, y: e.clientY };

    if (rafId.current) return;

    rafId.current = requestAnimationFrame(() => {
      const follower = document.getElementById('follower');
      if (follower) {
        gsap.to(follower, {
          x: mousePos.current.x,
          y: mousePos.current.y,
          duration: 0.3, // Faster for responsiveness
          ease: 'power2.out',
          overwrite: 'auto'
        });
      }
      rafId.current = null;
    });
  }, []);

  useLayoutEffect(() => {
    // Enable animations for public users too
    // Performance: Optimize scroll progress with reduced scrub
    gsap.to('#scroll-progress', {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: 'body',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
      }
    });

    // Performance: Use passive listener for cursor follower
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Performance: Refresh ScrollTrigger periodically
    const refreshInterval = setInterval(() => {
      ScrollTrigger.refresh();
    }, 2000);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId.current) cancelAnimationFrame(rafId.current);
      clearInterval(refreshInterval);
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, [handleMouseMove]);

  return (
    <div className="bg-render-black min-h-screen text-white selection:bg-electric-blue selection:text-black overflow-x-hidden grid-bg">
      {/* Global Scrollytelling Elements */}
      <div className="grain" />
      <div id="follower" className="fixed w-6 h-6 border-2 border-electric-blue pointer-events-none z-[100] -translate-x-1/2 -translate-y-1/2 hidden lg:block will-change-transform" />
      <div id="scroll-progress" className="fixed top-0 left-0 w-full h-1 bg-electric-blue border-b border-white/20 z-[110] origin-left scale-x-0 will-change-transform" />

      {showLoading && <LoadingScreen onComplete={handleLoadingComplete} />}

      {/* Auth Modal */}
      {showAuth && (
        <AuthScreen
          onLoginSuccess={handleLoginSuccess}
          onClose={() => setShowAuth(false)}
        />
      )}

      <Navbar
        user={user}
        onLoginClick={() => setShowAuth(true)}
        onLogout={handleLogout}
      />

      <main>
        <Hero />
        <Suspense fallback={<LoadingFallback />}>
          <VisualProof />
          <Showcase />
          <ProcessScroll />
        </Suspense>
      </main>

      <footer className="w-full py-12 px-4 text-center bg-render-black border-t border-white/10 relative z-40">
        <p className="text-gray-600 text-[10px] md:text-xs font-bold uppercase tracking-widest max-w-2xl mx-auto leading-relaxed">
          {t('footer.line1')} <br className="hidden md:block" />
          {t('footer.line2')} <br className="hidden md:block" />
          {t('footer.line3')}
        </p>
      </footer>

      <Suspense fallback={null}>
        <RequestForm />
        <FAB />
        <BetaOverlay />
      </Suspense>
    </div>
  );
};

import ToastProvider from './components/Toast';

// --- ROOT APP COMPONENT (Routing) ---
function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          {/* Main Site */}
          <Route path="/" element={<LandingPage />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

          {/* User Dashboard */}
          <Route path="/dashboard" element={
            <Suspense fallback={<LoadingFallback />}>
              <UserDashboard />
            </Suspense>
          } />

          {/* Tracking Route */}
          <Route path="/tracking" element={
            <Suspense fallback={<LoadingFallback />}>
              <DeliveryTracking />
            </Suspense>
          } />

          {/* Catch-all: Redirect to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;
