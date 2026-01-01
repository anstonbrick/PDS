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

            // Performance: Single ScrollTrigger for all cards using a timeline
            const mainTl = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top top',
                    end: 'bottom top',
                    scrub: 1, // Reduced scrub for responsiveness
                    fastScrollEnd: true,
                    invalidateOnRefresh: true,
                }
            });

            cards.forEach((card, i) => {
                mainTl.to(card, {
                    y: -120 - (i * 20),
                    rotation: card.dataset.rotation * 1.2,
                    opacity: 0.15,
                    ease: 'none',
                }, 0);
            });

            mainTl.to(textRef.current, {
                y: 60,
                opacity: 0,
                ease: 'none',
            }, 0);

            // Initial Entrance - Performance: Simplified stagger
            gsap.from('.reveal-item', {
                y: 40,
                opacity: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: 'power3.out',
                delay: 0.2
            });

            gsap.from(galleryRef.current.children, {
                scale: 0.9,
                opacity: 0,
                duration: 1,
                stagger: 0.05,
                ease: 'power2.out',
                delay: 0.4
            });

        }, containerRef);

        return () => ctx.revert();
    }, []);

    // Performance: Selected better source images where possible
    const images = useMemo(() => [
        { src: '/media/walpaper1.jpg', top: '10%', left: '10%', rotation: -5 },
        { src: '/media/vertical1.jpg', top: '20%', left: '80%', rotation: 8 }, // Switched to smaller jpg
        { src: '/media/highres2.jpg', top: '60%', left: '15%', rotation: -12 }, // Switched to smaller highres2
        { src: '/media/horizontal2.jpg', top: '50%', left: '75%', rotation: 5 }, // Switched to smaller horizontal2
        { src: '/media/extra.jpg', top: '15%', left: '45%', rotation: -3 }, // Switched to smaller jpg
    ], []);

    return (
        <section
            ref={containerRef}
            id="hero"
            className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
        >
            {/* Background Gradients - Performance: Simplified for GPU */}
            <div className="absolute inset-0 bg-render-black" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(20,20,20,0.8)_0%,_rgba(10,10,10,1)_100%)]" />

            {/* Floating Gallery Background */}
            <div ref={galleryRef} className="absolute inset-0 w-full h-full pointer-events-none">
                {images.map((item, index) => (
                    <div
                        key={index}
                        className="gallery-card absolute rounded-lg shadow-xl overflow-hidden border border-white/5 opacity-20 px-0 will-change-transform gpu-accelerate"
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
                            className="w-full h-full object-cover grayscale-[0.3]"
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
