import React, { Suspense, lazy, useLayoutEffect, useCallback, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from './components/Navbar';
import Hero from './components/Hero';

const VisualProof = lazy(() => import('./components/VisualProof'));
const Showcase = lazy(() => import('./components/Showcase'));
const ProcessScroll = lazy(() => import('./components/ProcessScroll'));
const RequestForm = lazy(() => import('./components/RequestForm'));
const FAB = lazy(() => import('./components/FAB'));

import AuthScreen from './components/Auth/AuthScreen';
import LoadingScreen from './components/LoadingScreen';

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

// Performance: Ticker settings for smoother high-refresh screens
gsap.ticker.fps(120);
gsap.ticker.lagSmoothing(500, 33);

function App() {
  // Performance: Use ref for animation frame tracking
  const rafId = useRef(null);
  const mousePos = useRef({ x: 0, y: 0 });

  // Auth & Loading State
  // Check local storage for basic persistence
  const [user, setUser] = React.useState(() => {
    const saved = localStorage.getItem('pds_user');
    return saved ? JSON.parse(saved) : null;
  });

  // If user is already logged in, we might still want to show loading screen briefly or skip it?
  // Request says "make a loading screen after log in". 
  // If refreshing, maybe show it again? Let's show it on mount if logged in, or after login.
  const [showLoading, setShowLoading] = React.useState(!!user);

  // If not logged in, showAuth is implied by !user.

  const handleLoginSuccess = (userData) => {
    localStorage.setItem('pds_user', JSON.stringify(userData));
    setUser(userData);
    setShowLoading(true); // Trigger loading screen after successful login
  };

  const handleLoadingComplete = () => {
    setShowLoading(false);
  };

  // Performance: Throttled mouse handler using RAF with faster update
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
    // Performance: Optimize scroll progress with reduced scrub
    gsap.to('#scroll-progress', {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: 'body',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5, // Increased for smoother performance
      }
    });

    // Performance: Use passive listener for cursor follower
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Performance: Refresh ScrollTrigger periodically to handle lazy shifts
    const refreshInterval = setInterval(() => {
      ScrollTrigger.refresh();
    }, 2000);

    // Performance: Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
      clearInterval(refreshInterval);
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, [handleMouseMove]);

  if (!user) {
    return (
      <div className="bg-render-black min-h-screen text-white overflow-hidden font-sans">
        <div className="grain" />
        <AuthScreen onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  return (
    <div className="bg-render-black min-h-screen text-white selection:bg-electric-blue selection:text-black overflow-x-hidden grid-bg">
      {/* Global Scrollytelling Elements */}
      <div className="grain" />
      <div id="follower" className="fixed w-6 h-6 border-2 border-electric-blue pointer-events-none z-[100] -translate-x-1/2 -translate-y-1/2 hidden lg:block will-change-transform" />
      <div id="scroll-progress" className="fixed top-0 left-0 w-full h-1 bg-electric-blue border-b border-white/20 z-[110] origin-left scale-x-0 will-change-transform" />

      {showLoading && <LoadingScreen onComplete={handleLoadingComplete} />}

      <Navbar />

      <main>
        <Hero />
        <Suspense fallback={<LoadingFallback />}>
          <VisualProof />
          <Showcase />
          <ProcessScroll />
        </Suspense>
      </main>

      <Suspense fallback={null}>
        <RequestForm />
        <FAB />
      </Suspense>
    </div>
  );
}

export default App;
