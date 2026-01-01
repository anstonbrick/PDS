import React, { useLayoutEffect, useRef, useMemo, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Maximize, ShieldCheck, Sparkles, Layers } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const Showcase = () => {
    const sectionRef = useRef(null);
    const triggerRef = useRef(null);
    const textRef = useRef(null);
    const phoneRef = useRef(null);
    const desktopRef = useRef(null);
    const badgesContainerRef = useRef(null);
    // Performance: Track RAF for throttling
    const rafId = useRef(null);
    const mousePos = useRef({ x: 0.5, y: 0.5 });

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const blobs = gsap.utils.toArray('.atmosphere-blob');

            // Performance: Throttled parallax with RAF
            const updateParallax = () => {
                const x = (mousePos.current.x - 0.5) * 50;
                const y = (mousePos.current.y - 0.5) * 50;

                gsap.to(blobs, {
                    x: (i) => i % 2 === 0 ? x : -x,
                    y: (i) => i % 2 === 0 ? y : -y,
                    duration: 2.5, // Slightly longer for smoother feel
                    ease: 'power2.out',
                    overwrite: 'auto'
                });
                rafId.current = null;
            };

            const handleMouseMove = (e) => {
                mousePos.current = {
                    x: e.clientX / window.innerWidth,
                    y: e.clientY / window.innerHeight
                };

                // Performance: Skip if RAF already scheduled
                if (rafId.current) return;
                rafId.current = requestAnimationFrame(updateParallax);
            };

            window.addEventListener('mousemove', handleMouseMove, { passive: true });

            // Performance: Optimized timeline with reduced complexity
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current, // Changed to sectionRef for better stability
                    pin: true,
                    pinSpacing: true,
                    scrub: 1, // Smoother, less laggy feel
                    start: 'top top',
                    end: '+=500%', // Extended significantly to prevent "flash and gone"
                    anticipatePin: 1, // Prevent jitter
                }
            });

            // SCENE 1: Title Reveal
            tl.fromTo('.showcase-title',
                { opacity: 0, y: 80, scale: 0.9 },
                { opacity: 1, y: 0, scale: 1, duration: 2, ease: 'power3.out' }
            )

                // SCENE 2: Devices Slide In
                .fromTo(phoneRef.current,
                    { y: 600, rotation: -15, opacity: 0 },
                    { y: 0, rotation: -8, opacity: 1, duration: 3, ease: 'power3.out' },
                    "-=1"
                )
                .fromTo(desktopRef.current,
                    { x: 600, opacity: 0, rotation: 5 },
                    { x: 0, opacity: 1, rotation: 0, duration: 3, ease: 'power3.out' },
                    "<"
                )

                // SCENE 3: Devices Move Apart, Title Fades
                .to('.showcase-title', { opacity: 0, y: -80, scale: 0.8, duration: 1.5 }, "+=1")
                .to(phoneRef.current, { x: -350, rotation: -12, scale: 0.85, duration: 2.5, ease: 'power2.inOut' }, "<")
                .to(desktopRef.current, { x: 350, scale: 0.85, duration: 2.5, ease: 'power2.inOut' }, "<")

                // SCENE 4: Feature Badges Float In
                .fromTo(badgesContainerRef.current,
                    { opacity: 0 },
                    { opacity: 1, duration: 1 },
                    "-=1"
                )
                .fromTo('.feature-badge-float',
                    { y: 100, opacity: 0, scale: 0.5, rotation: -10 },
                    {
                        y: 0,
                        opacity: 1,
                        scale: 1,
                        rotation: 0,
                        duration: 1.5,
                        stagger: 0.2,
                        ease: 'back.out(1.7)'
                    },
                    "<0.2"
                )

                // SCENE 5: Badges Glow Effect
                .to('.feature-badge-float', {
                    boxShadow: '0 0 40px rgba(0, 240, 255, 0.3)',
                    duration: 1,
                    stagger: 0.15,
                    ease: 'power2.inOut'
                })

                // SCENE 6: Exit
                .to([phoneRef.current, desktopRef.current], {
                    opacity: 0,
                    scale: 0.7,
                    y: 100,
                    duration: 1.5
                }, "+=0.5")
                .to('.feature-badge-float', {
                    y: -50,
                    opacity: 0,
                    scale: 1.1,
                    duration: 1
                }, "<")
                .to(badgesContainerRef.current, { opacity: 0, duration: 0.5 }, "<");

            // Ensure triggers are updated for lazy loaded content
            ScrollTrigger.refresh();

            // Performance: Cleanup function
            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                if (rafId.current) cancelAnimationFrame(rafId.current);
            };

        }, sectionRef.current);

        return () => ctx.revert();
    }, []);

    // Performance: Throttled text decoder with RAF
    const decodeText = useCallback((e) => {
        const target = e.target;
        const originalText = target.dataset.value;
        if (!originalText) return;

        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let iteration = 0;

        if (target.interval) clearInterval(target.interval);

        target.interval = setInterval(() => {
            target.innerText = originalText
                .split("")
                .map((letter, index) => {
                    if (index < iteration) return originalText[index];
                    return letters[Math.floor(Math.random() * 26)];
                })
                .join("");

            if (iteration >= originalText.length) {
                clearInterval(target.interval);
            }

            iteration += 1 / 3;
        }, 40); // Slightly slower interval for performance
    }, []);

    // Performance: Memoize features array
    const features = useMemo(() => [
        {
            icon: <Maximize className="w-10 h-10 text-electric-blue" />,
            title: "Native 4K",
            desc: "Lossless Quality",
            gradient: "from-electric-blue/20 to-transparent"
        },
        {
            icon: <ShieldCheck className="w-10 h-10 text-electric-green" />,
            title: "100% Human",
            desc: "Strictly No AI",
            gradient: "from-electric-green/20 to-transparent"
        },
        {
            icon: <Layers className="w-10 h-10 text-electric-purple" />,
            title: "Multi-Format",
            desc: "Any Aspect Ratio",
            gradient: "from-electric-purple/20 to-transparent"
        },
        {
            icon: <Sparkles className="w-10 h-10 text-pink-500" />,
            title: "Curated",
            desc: "Hand-Picked Selection",
            gradient: "from-pink-500/20 to-transparent"
        }
    ], []);

    return (
        <section ref={sectionRef} id="showcase" className="bg-render-dark relative overflow-hidden z-10 min-h-screen flex flex-col justify-center">
            <div ref={triggerRef} className="w-full h-full flex items-center justify-center relative">

                {/* Atmospheric Background - Performance: Optimized for GPU */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="atmosphere-blob absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] bg-electric-blue/5 blur-[40px] rounded-full mix-blend-screen will-change-transform gpu-accelerate" />
                    <div className="atmosphere-blob absolute top-[30%] -right-[5%] w-[40vw] h-[40vw] bg-electric-purple/5 blur-[40px] rounded-full mix-blend-screen will-change-transform gpu-accelerate" />
                </div>

                {/* Content Container */}
                <div className="relative z-10 w-full h-full max-w-7xl mx-auto px-4 flex flex-col items-center justify-center">

                    {/* Scene 1 Text */}
                    <div ref={textRef} className="showcase-title text-center mb-12 relative z-20">
                        <h2
                            onMouseEnter={decodeText}
                            data-value="ELITE COLLECTION"
                            className="text-electric-blue font-bold tracking-[0.3em] text-sm md:text-base cursor-default"
                        >
                            ELITE COLLECTION
                        </h2>
                        <h1 className="text-5xl md:text-7xl font-black text-white mt-4 leading-tight">
                            Tailored for <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
                                Every Screen.
                            </span>
                        </h1>
                    </div>

                    {/* Device Simulation Stage */}
                    <div className="relative w-full h-[55vh] flex items-center justify-center">

                        {/* Phone Container */}
                        <div
                            ref={phoneRef}
                            className="absolute z-20 w-[220px] md:w-[280px] h-[440px] md:h-[560px] bg-black border-[6px] md:border-[8px] border-gray-800 rounded-[2.5rem] md:rounded-[3rem] shadow-2xl overflow-hidden will-change-transform gpu-accelerate"
                            style={{ boxShadow: '0 25px 80px rgba(0,0,0,0.6)' }}
                        >
                            {/* Notch */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-5 md:h-6 bg-black rounded-b-xl z-20" />
                            <img
                                src="/media/vertical1.jpg"
                                className="w-full h-full object-cover"
                                alt="Mobile View"
                                loading="lazy"
                                decoding="async"
                                fetchpriority="low"
                            />
                            {/* Home Indicator */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-12 h-1 bg-white/30 rounded-full" />
                        </div>

                        {/* Desktop Container */}
                        <div
                            ref={desktopRef}
                            className="absolute z-10 w-[500px] md:w-[700px] h-[320px] md:h-[420px] bg-gray-900 border border-gray-700/50 rounded-xl shadow-2xl overflow-hidden will-change-transform gpu-accelerate flex flex-col"
                            style={{ boxShadow: '0 30px 100px rgba(0,0,0,0.5)' }}
                        >
                            {/* Browser Header */}
                            <div className="h-7 md:h-8 bg-black/60 border-b border-white/5 flex items-center px-3 md:px-4 gap-2">
                                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-500/60" />
                                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-yellow-500/60" />
                                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-green-500/60" />
                                <div className="ml-3 h-3.5 w-48 md:w-64 bg-white/5 rounded-full" />
                            </div>
                            {/* Screen Content */}
                            <div className="flex-1 relative overflow-hidden">
                                <img
                                    src="/media/horizontal2.jpg"
                                    className="w-full h-full object-cover"
                                    alt="Desktop View"
                                    loading="lazy"
                                    decoding="async"
                                    fetchpriority="low"
                                />
                            </div>
                        </div>

                    </div>

                    {/* Feature Badges - Floating Experience */}
                    <div
                        ref={badgesContainerRef}
                        className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none opacity-0"
                    >
                        {/* Performance: Optimized backdrop-blur for badges */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 px-4">
                            {features.map((feature, index) => (
                                <div
                                    key={index}
                                    className={`feature-badge-float bg-render-black/80 backdrop-blur-md border border-white/10 p-5 md:p-6 rounded-2xl text-center 
                                        transform transition-all duration-500 pointer-events-auto cursor-default
                                        hover:border-white/30 hover:scale-105 hover:-translate-y-2
                                        bg-gradient-to-br ${feature.gradient} will-change-transform gpu-accelerate`}
                                    style={{
                                        boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
                                    }}
                                >
                                    <div className="mb-3 flex justify-center">
                                        {feature.icon}
                                    </div>
                                    <h4 className="text-white font-bold text-lg">{feature.title}</h4>
                                    <p className="text-xs text-gray-400 mt-1">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default Showcase;

