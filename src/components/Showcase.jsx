import React, { useLayoutEffect, useRef, useMemo, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Maximize, ShieldCheck, Sparkles, Layers } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const Showcase = () => {
    const sectionRef = useRef(null);
    const triggerRef = useRef(null);
    const contentRef = useRef(null);
    const deviceGroupRef = useRef(null);
    const badgesContainerRef = useRef(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            let mm = gsap.matchMedia();

            mm.add("(min-width: 768px)", () => {
                // DESKTOP ANIMATION
                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        pin: true,
                        pinSpacing: true,
                        scrub: 1,
                        start: 'top top',
                        end: '+=400%',
                        anticipatePin: 1,
                    }
                });

                tl.from('.showcase-header', {
                    y: 100, opacity: 0, scale: 0.8, duration: 2, ease: 'back.out(2)'
                })
                    .from('.showcase-badge', {
                        y: 50, opacity: 0, scale: 0.5, stagger: 0.2, duration: 1.5, ease: 'elastic.out(1, 0.5)'
                    }, '-=1')
                    .from('.device-schematic', {
                        y: 400, rotation: (i) => i === 0 ? -15 : 15, opacity: 0, stagger: 0.3, duration: 3, ease: 'power4.out'
                    }, '-=0.5')
                    // Detailed Desktop Expansion
                    .to('.device-desktop', { x: 300, scale: 0.9, duration: 2 }, "+=0.5")
                    .to('.device-mobile', { x: -300, scale: 0.9, rotation: -10, duration: 2 }, "<")
                    .to('.showcase-badge', {
                        x: (i) => (i % 2 === 0 ? -400 : 400), opacity: 0.5, duration: 2
                    }, "<")
                    .to(contentRef.current, {
                        opacity: 0, y: -100, duration: 2, ease: 'power2.in'
                    }, "+=0.5");
            });

            mm.add("(max-width: 767px)", () => {
                // MOBILE ANIMATION - Subtler movements
                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        pin: true,
                        pinSpacing: true,
                        scrub: 1,
                        start: 'top top',
                        end: '+=400%',
                        anticipatePin: 1,
                    }
                });

                tl.from('.showcase-header', {
                    y: 50, opacity: 0, scale: 0.9, duration: 2, ease: 'back.out(2)'
                })
                    .from('.showcase-badge', {
                        y: 20, opacity: 0, scale: 0.8, stagger: 0.1, duration: 1.5, ease: 'elastic.out(1, 0.5)'
                    }, '-=1')
                    .from('.device-schematic', {
                        y: 200, opacity: 0, duration: 2, ease: 'power4.out'
                    }, '-=0.5')
                    // Simplified Mobile Expansion (Vertical split instead of wide horizontal)
                    .to('.device-desktop', { y: 100, scale: 0.8, duration: 2 }, "+=0.5")
                    .to('.device-mobile', { y: -100, scale: 0.8, rotation: -5, duration: 2 }, "<")
                    .to('.showcase-badge', {
                        opacity: 0.2, duration: 2
                    }, "<")
                    .to(contentRef.current, {
                        opacity: 0, y: -50, duration: 2, ease: 'power2.in'
                    }, "+=0.5");
            });

        }, sectionRef.current);

        return () => ctx.revert();
    }, []);

    const features = useMemo(() => [
        { icon: <Maximize size={32} />, title: "NATIVE 4K", color: "bg-electric-blue" },
        { icon: <ShieldCheck size={32} />, title: "100% HUMAN", color: "bg-electric-purple" },
        { icon: <Layers size={32} />, title: "MULTI-FORMAT", color: "bg-electric-green" },
        { icon: <Sparkles size={32} />, title: "CURATED", color: "bg-white" }
    ], []);

    return (
        <section ref={sectionRef} id="showcase" className="bg-render-black relative overflow-hidden min-h-screen border-b-4 border-black">
            <div ref={contentRef} className="relative z-10 w-full h-full max-w-7xl mx-auto px-4 flex flex-col items-center justify-center pt-20">

                {/* Header Section */}
                <div className="showcase-header text-center mb-16 relative z-20">
                    <span className="inline-block px-3 py-1 bg-white text-black font-black uppercase text-xs mb-4 border-2 border-black flat-shadow">
                        GALLERY ENGINE v2.0
                    </span>
                    <h1 className="text-[var(--text-fluid-h1)] font-black text-white italic uppercase leading-[0.85]">
                        ANY FORMAT.<br />
                        <span className="text-electric-blue">NO LIMITS.</span>
                    </h1>
                </div>

                {/* Grid of Badges */}
                <div ref={badgesContainerRef} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-20 w-full max-w-5xl">
                    {features.map((f, i) => (
                        <div key={i} className="showcase-badge bg-render-dark border-4 border-black flat-shadow p-6 flex flex-col items-center text-center group transition-colors hover:bg-render-black">
                            <div className={`${f.color} text-black p-4 mb-4 border-2 border-black rotate-3 group-hover:rotate-0 transition-transform`}>
                                {f.icon}
                            </div>
                            <h4 className="text-white font-black text-lg uppercase italic tracking-tighter">{f.title}</h4>
                        </div>
                    ))}
                </div>

                {/* Device Stage */}
                <div ref={deviceGroupRef} className="relative w-full h-[400px] flex items-center justify-center">

                    {/* Desktop Schematic */}
                    <div className="device-schematic device-desktop absolute z-10 w-[600px] h-[350px] bg-render-dark border-4 border-white flat-shadow flex flex-col overflow-hidden">
                        <div className="h-8 border-b-2 border-white flex items-center px-4 gap-2 bg-white/5">
                            <div className="w-2 h-2 rounded-full bg-white/20" />
                            <div className="w-2 h-2 rounded-full bg-white/20" />
                            <div className="w-2 h-2 rounded-full bg-white/20" />
                            <div className="ml-auto text-[10px] font-black text-white/30 uppercase tracking-[0.2em] italic">schematic_view_4k</div>
                        </div>
                        <div className="flex-1 relative p-4">
                            <div className="absolute inset-0 border-4 border-electric-blue/20 m-4 pointer-events-none" />
                            <img src="/media/horizontal2.jpg" alt="" className="w-full h-full object-cover grayscale brightness-50 contrast-125" />
                        </div>
                    </div>

                    {/* Mobile Schematic */}
                    <div className="device-schematic device-mobile absolute z-20 w-[240px] h-[480px] bg-render-dark border-4 border-electric-blue flat-shadow-blue flex flex-col overflow-hidden -rotate-6">
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-4 border-2 border-electric-blue rounded-full bg-render-black" />
                        <div className="flex-1 p-3 pt-12">
                            <div className="w-full h-full border-2 border-white/10 relative overflow-hidden">
                                <img src="/media/vertical1.jpg" alt="" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-electric-blue/10 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                </div>

                {/* Decorative Elements */}
                <div className="absolute top-1/2 left-10 -translate-y-1/2 hidden lg:block opacity-20">
                    <div className="text-[120px] font-black text-white/10 select-none uppercase italic leading-none">01</div>
                    <div className="text-[120px] font-black text-white/10 select-none uppercase italic leading-none ml-20 mt-10">02</div>
                </div>

            </div>
        </section>
    );
};

export default Showcase;
