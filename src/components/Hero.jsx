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
    const galleryRef = useRef(null);
    const decodeText = useTextDecrypter();

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const cards = gsap.utils.toArray('.gallery-card');

            // Performance: Batch card animations with improved settings
            cards.forEach((card, i) => {
                gsap.to(card, {
                    y: -150 - (i * 30),
                    rotation: card.dataset.rotation * 1.5,
                    opacity: 0.1,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: 'top top',
                        end: 'bottom top',
                        scrub: 1.5, // Smoother scrubbing
                        fastScrollEnd: true
                    }
                });
            });

            // Text Parallax and Fade
            gsap.to(textRef.current, {
                y: 100,
                opacity: 0,
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top top',
                    end: '50% top',
                    scrub: 1,
                    fastScrollEnd: true
                }
            });

            // Initial Entrance - Performance: Reduced stagger time
            const tl = gsap.timeline();
            tl.from('.reveal-item', {
                y: 100,
                opacity: 0,
                duration: 1,
                stagger: 0.15,
                ease: 'power4.out',
                delay: 0.3
            })
                .from(galleryRef.current.children, {
                    scale: 0.8,
                    opacity: 0,
                    duration: 1.2,
                    stagger: 0.08,
                    ease: 'expo.out'
                }, "-=0.8");

        }, containerRef);

        return () => ctx.revert();
    }, []);

    // Performance: Memoize static images array
    const images = useMemo(() => [
        { src: '/media/walpaper1.jpg', top: '10%', left: '10%', rotation: -5 },
        { src: '/media/vertical2.png', top: '20%', left: '80%', rotation: 8 },
        { src: '/media/highres.png', top: '60%', left: '15%', rotation: -12 },
        { src: '/media/official.png', top: '50%', left: '75%', rotation: 5 },
        { src: '/media/extra2.jpg', top: '15%', left: '45%', rotation: -3 },
    ], []);

    return (
        <section
            ref={containerRef}
            id="hero"
            className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
        >
            {/* Background Gradients */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-900 via-render-black to-render-black opacity-80" />

            {/* Floating Gallery Background */}
            <div ref={galleryRef} className="absolute inset-0 w-full h-full pointer-events-none">
                {images.map((item, index) => (
                    <div
                        key={index}
                        className="gallery-card absolute rounded-lg shadow-2xl overflow-hidden border border-white/10 opacity-30 px-0 will-change-transform"
                        data-rotation={item.rotation}
                        style={{
                            top: item.top,
                            left: item.left,
                            width: '240px',
                            height: '340px',
                            transform: `rotate(${item.rotation}deg)`,
                            contain: 'layout paint style'
                        }}
                    >
                        <img
                            src={item.src}
                            alt={`Gallery ${index}`}
                            className="w-full h-full object-cover grayscale-[0.5] hover:grayscale-0 transition-all duration-700"
                            loading={index < 2 ? "eager" : "lazy"}
                            decoding="async"
                            fetchpriority={index < 2 ? "high" : "low"}
                        />
                    </div>
                ))}
            </div>

            {/* Content */}
            <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
                <div ref={textRef} className="space-y-6">
                    <h2
                        className="reveal-item text-electric-blue font-bold tracking-widest uppercase text-sm cursor-default"
                        data-value="High-Definition Anime Curation"
                        onMouseEnter={decodeText}
                    >
                        High-Definition Anime Curation
                    </h2>
                    <h1 className="reveal-item text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-none">
                        Visuals with <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
                            Soul. Delivered.
                        </span>
                    </h1>
                    <p className="reveal-item text-gray-400 text-lg md:text-xl max-w-2xl mx-auto pt-4 leading-relaxed">
                        Wide range of characters and styles in crystalline 4K.
                        From official illustrations to rare boutique sketches—manually verified,
                        multiple aspect ratios, <span className="text-white font-bold underline decoration-electric-blue/50 decoration-2 underline-offset-4">strictly no AI.</span>
                    </p>
                    <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <MagneticButton
                            onClick={() => window.dispatchEvent(new CustomEvent('open-request-drawer'))}
                            className="group relative px-8 py-4 bg-white text-black font-bold rounded-full overflow-hidden hover:bg-electric-blue transition-colors duration-300"
                        >
                            <div className="absolute inset-0 w-full h-full bg-electric-blue translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            <span className="relative flex items-center gap-2 group-hover:text-black">
                                Start Request <ArrowRight size={20} />
                            </span>
                        </MagneticButton>
                        <a
                            href="#process"
                            className="text-gray-400 hover:text-white transition-colors duration-300 text-sm font-medium underline-offset-4 hover:underline"
                        >
                            How it works
                        </a>
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-gray-600">
                <div className="w-6 h-10 border-2 border-gray-600 rounded-full flex justify-center p-1">
                    <div className="w-1 h-3 bg-gray-600 rounded-full" />
                </div>
            </div>

        </section>
    );
};

export default Hero;
