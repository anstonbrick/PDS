import React, { useLayoutEffect, useRef, useMemo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';
import MagneticButton from './MagneticButton';
import useTextDecrypter from '../hooks/useTextDecrypter';

gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
    const containerRef = useRef(null);
    const textRef = useRef(null);
    const shapesRef = useRef(null);
    const gridRef = useRef(null);
    const decodeText = useTextDecrypter();

    const images = useMemo(() => [
        { src: '/media/walpaper1.jpg', span: 'col-span-1 row-span-1' },
        { src: '/media/vertical1.jpg', span: 'col-span-1 row-span-2' },
        { src: '/media/highres2.jpg', span: 'col-span-2 row-span-1' },
        { src: '/media/horizontal2.jpg', span: 'col-span-1 row-span-1' },
        { src: '/media/extra.jpg', span: 'col-span-1 row-span-1' },
    ], []);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // Entrance Animation
            const tl = gsap.timeline();

            tl.from('.grid-item', {
                y: 100,
                opacity: 0,
                duration: 0.8,
                stagger: 0.05,
                ease: 'back.out(1.7)',
            })
                .from('.hero-text', {
                    x: -50,
                    opacity: 0,
                    duration: 0.6,
                    stagger: 0.1,
                    ease: 'power3.out',
                }, '-=0.4')
                .from('.accent-shape', {
                    scale: 0,
                    duration: 0.6,
                    stagger: 0.1,
                    ease: 'elastic.out(1, 0.5)',
                }, '-=0.3');

            // Scroll Animation: Grid Distortion
            gsap.to('.grid-item', {
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top top',
                    end: 'bottom top',
                    scrub: true,
                },
                y: (i) => i % 2 === 0 ? -100 : 100,
                rotation: (i) => i % 2 === 0 ? 5 : -5,
                ease: 'none',
            });

            // Parallax accent shapes
            gsap.to('.accent-shape', {
                scrollTrigger: {
                    trigger: containerRef.current,
                    scrub: 1,
                },
                y: -200,
                rotation: 180,
                ease: 'none',
            });

        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={containerRef}
            id="hero"
            className="relative min-h-[110vh] flex items-center justify-center overflow-hidden bg-render-black pt-20"
        >
            {/* Geometric Accent Shapes - Hidden on mobile to prevent text overlap */}
            <div ref={shapesRef} className="absolute inset-0 pointer-events-none overflow-hidden hidden md:block">
                <div className="accent-shape absolute top-1/4 left-10 w-32 h-32 bg-electric-blue/10 border-4 border-electric-blue -rotate-12" />
                <div className="accent-shape absolute top-3/4 right-20 w-48 h-48 bg-electric-purple/10 border-4 border-electric-purple rotate-45" />
                <div className="accent-shape absolute bottom-20 left-1/3 w-16 h-16 bg-electric-green border-2 border-black flat-shadow" />
            </div>

            <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
                {/* Text Content */}
                <div ref={textRef} className="space-y-8 order-1 relative z-20">
                    <div className="hero-text">
                        <span
                            className="inline-block px-4 py-1 bg-electric-blue text-black font-black uppercase tracking-widest text-xs mb-4 border-2 border-black flat-shadow cursor-pointer"
                            onMouseEnter={decodeText}
                            data-value="CURATED VISUALS"
                        >
                            CURATED VISUALS
                        </span>
                        <h1 className="text-[var(--text-fluid-h1)] font-black tracking-tighter leading-[0.9] uppercase italic">
                            Visuals <br />
                            <span className="text-electric-blue">With Soul.</span>
                        </h1>
                    </div>

                    <p className="hero-text text-gray-400 text-lg md:text-xl max-w-xl leading-snug font-medium italic">
                        The definitive source for crystalline 4K anime curation.
                        Manually verified, strictly no AI, pure human artistry.
                    </p>

                    <div className="hero-text pt-4 flex flex-wrap gap-4">
                        <MagneticButton
                            onClick={() => window.dispatchEvent(new CustomEvent('open-request-drawer'))}
                            className="bg-white text-black px-6 py-4 md:px-8 md:py-5 text-lg md:text-xl font-black uppercase border-4 border-black flat-shadow-blue hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_var(--color-electric-blue)] transition-all flex items-center gap-3 active:translate-x-0 active:translate-y-0 active:shadow-none w-full md:w-auto justify-center"
                        >
                            Start Request <ArrowRight size={24} strokeWidth={3} />
                        </MagneticButton>
                        <a
                            href="#process"
                            className="px-6 py-4 md:px-8 md:py-5 text-lg md:text-xl font-black uppercase border-4 border-white/20 hover:border-white transition-colors flex items-center italic justify-center w-full md:w-auto"
                        >
                            How it works
                        </a>
                    </div>
                </div>

                {/* 2D Motion Grid */}
                <div ref={gridRef} className="order-2 grid grid-cols-2 gap-4 h-[400px] md:h-[600px] relative z-10">
                    {images.map((img, i) => (
                        <div
                            key={i}
                            className={`grid-item relative overflow-hidden border-4 border-black flat-shadow bg-render-dark ${img.span}`}
                        >
                            <img
                                src={img.src}
                                alt=""
                                className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-500 scale-105 hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-electric-blue/10 pointer-events-none" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Scroll Indicator - Flat style */}
            <div className="absolute bottom-10 left-10 flex flex-col items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] rotate-90 origin-left ml-4 text-electric-blue">Scroll</span>
                <div className="w-1 h-20 bg-white/10 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-electric-blue animate-[scroll-hint_2s_ease-in-out_infinite]" />
                </div>
            </div>

            <style>{`
                @keyframes scroll-hint {
                    0% { transform: translateY(-100%); }
                    100% { transform: translateY(200%); }
                }
            `}</style>
        </section>
    );
};

export default Hero;
