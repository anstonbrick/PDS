import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
    const containerRef = useRef(null);
    const textRef = useRef(null);
    const galleryRef = useRef(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // Gallery Parallax - Floating Upwards
            const cards = gsap.utils.toArray('.gallery-card');

            cards.forEach((card, i) => {
                gsap.to(card, {
                    y: -100 - (i * 20), // Varied speeds
                    ease: 'none',
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: 'top top',
                        end: 'bottom top',
                        scrub: true,
                    }
                });
            });

            // Text Entrance
            const tl = gsap.timeline();
            tl.from(textRef.current.children, {
                y: 100,
                opacity: 0,
                duration: 1,
                stagger: 0.2,
                ease: 'power4.out',
                delay: 0.5
            })
                .from(galleryRef.current.children, {
                    y: 200,
                    opacity: 0,
                    duration: 1.2,
                    stagger: 0.1,
                    ease: 'power3.out'
                }, "-=0.8");

        }, containerRef);

        return () => ctx.revert();
    }, []);

    // Placeholder images for the gallery
    const placeholders = [
        { color: 'bg-red-500', top: '10%', left: '10%', speed: 1 },
        { color: 'bg-blue-500', top: '20%', left: '80%', speed: 1.5 },
        { color: 'bg-electric-purple', top: '60%', left: '15%', speed: 0.8 },
        { color: 'bg-electric-green', top: '50%', left: '75%', speed: 1.2 },
        { color: 'bg-orange-500', top: '30%', left: '50%', speed: 0.5 }, // Center-ish
    ];

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
                {placeholders.map((item, index) => (
                    <div
                        key={index}
                        className={`gallery-card absolute rounded-lg shadow-2xl ${item.color} opacity-20 hover:opacity-40 transition-opacity duration-300 backdrop-blur-sm`}
                        style={{
                            top: item.top,
                            left: item.left,
                            width: '200px',
                            height: '280px',
                            transform: `rotate(${Math.random() * 20 - 10}deg)`,
                        }}
                    />
                ))}
            </div>

            {/* Content */}
            <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
                <div ref={textRef} className="space-y-6">
                    <h2 className="text-electric-blue font-bold tracking-widest uppercase text-sm">
                        Hand-Curated Anime Assets
                    </h2>
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-none">
                        Visuals with <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
                            Soul. Delivered.
                        </span>
                    </h1>
                    <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto pt-4">
                        A boutique agency sourcing verified, human-made artwork manually.
                        No algorithms. Just pure creative intent.
                    </p>
                    <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => window.dispatchEvent(new CustomEvent('open-request-drawer'))}
                            className="group relative px-8 py-4 bg-white text-black font-bold rounded-full overflow-hidden hover:bg-electric-blue transition-colors duration-300"
                        >
                            <div className="absolute inset-0 w-full h-full bg-electric-blue translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            <span className="relative flex items-center gap-2 group-hover:text-black">
                                Start Request <ArrowRight size={20} />
                            </span>
                        </button>
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
