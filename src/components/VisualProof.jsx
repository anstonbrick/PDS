import React, { useState, useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MoveHorizontal, AlertTriangle, ShieldCheck } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const VisualProof = () => {
    const [sliderPosition, setSliderPosition] = useState(50);
    const containerRef = useRef(null);
    const isDragging = useRef(false);
    const rafId = useRef(null);

    const updatePosition = useCallback((clientX) => {
        if (!containerRef.current) return;
        const { left, width } = containerRef.current.getBoundingClientRect();
        const position = ((clientX - left) / width) * 100;
        setSliderPosition(Math.min(100, Math.max(0, position)));
    }, []);

    const handleMove = useCallback((event) => {
        if (!isDragging.current) return;
        const clientX = event.touches ? event.touches[0].clientX : event.clientX;
        if (rafId.current) return;
        rafId.current = requestAnimationFrame(() => {
            updatePosition(clientX);
            rafId.current = null;
        });
    }, [updatePosition]);

    const handleMouseDown = useCallback(() => { isDragging.current = true; }, []);
    const handleMouseUp = useCallback(() => { isDragging.current = false; }, []);

    useEffect(() => {
        window.addEventListener('mouseup', handleMouseUp, { passive: true });
        window.addEventListener('touchend', handleMouseUp, { passive: true });
        window.addEventListener('mousemove', handleMove, { passive: true });
        window.addEventListener('touchmove', handleMove, { passive: true });

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: containerRef.current,
                start: 'top 80%',
            }
        });

        tl.fromTo(containerRef.current,
            { clipPath: 'inset(100% 0 0 0)', opacity: 0 },
            { clipPath: 'inset(0% 0 0 0)', opacity: 1, duration: 1, ease: 'expo.out' }
        ).from('.proof-label', {
            y: 20,
            opacity: 0,
            duration: 0.5,
            stagger: 0.2,
            ease: 'back.out'
        }, '-=0.5');

        return () => {
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchend', handleMouseUp);
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('touchmove', handleMove);
            if (rafId.current) cancelAnimationFrame(rafId.current);
        };
    }, [handleMouseUp, handleMove]);

    return (
        <section id="quality" className="py-24 relative bg-render-black overflow-hidden border-y-4 border-black">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
                    <div>
                        <span className="inline-block px-3 py-1 bg-electric-purple text-black font-black uppercase text-sm mb-3 border-2 border-black flat-shadow">
                            VERIFICATION ENGINE
                        </span>
                        <h2 className="text-[var(--text-fluid-h2)] font-black text-white italic uppercase leading-none">
                            PURE QUALITY.<br />
                            <span className="text-electric-blue">NO COMPROMISE.</span>
                        </h2>
                    </div>
                    <p className="text-gray-400 font-bold max-w-sm text-right uppercase italic leading-tight">
                        We strip away the artifacts, the blurring, and the soulless algorithmic haze.
                    </p>
                </div>

                <div
                    ref={containerRef}
                    className="relative w-full max-w-6xl mx-auto h-[300px] md:h-[600px] border-4 border-black flat-shadow-blue overflow-hidden cursor-ew-resize select-none bg-render-dark shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)]"
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleMouseDown}
                >
                    {/* Right Image (RenderDrop Verified) */}
                    <div className="absolute inset-0">
                        <img
                            src="/media/highres2.jpg"
                            alt="Verified"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute bottom-4 right-4 md:bottom-10 md:right-10 text-right proof-label">
                            <div className="flex items-center justify-end gap-2 md:gap-3 mb-1 md:mb-2">
                                <h3 className="text-xl md:text-5xl font-black text-white uppercase italic">VERIFIED</h3>
                                <ShieldCheck className="w-5 h-5 md:w-10 md:h-10 text-electric-green" strokeWidth={3} />
                            </div>
                            <p className="text-electric-blue font-black uppercase tracking-widest text-[10px] md:text-sm hidden md:block">Crystalline 4K • Human Curated</p>
                        </div>
                    </div>

                    {/* Left Image (Algorithmic Slop) */}
                    <div
                        className="absolute inset-0 overflow-hidden border-r-4 border-white z-10"
                        style={{ width: `${sliderPosition}%` }}
                    >
                        <div className="absolute inset-0 w-[100vw] max-w-6xl h-full">
                            <img
                                src="/media/highres2.jpg"
                                alt="Slop"
                                className="w-full h-full object-cover grayscale brightness-50 contrast-125"
                            />
                            {/* Slop Pattern Overlay */}
                            <div className="absolute inset-0 opacity-20 pointer-events-none"
                                style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 20px, transparent 20px, transparent 40px)' }} />

                            <div className="absolute bottom-4 left-4 md:bottom-10 md:left-10 proof-label">
                                <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                                    <AlertTriangle className="w-5 h-5 md:w-10 md:h-10 text-red-500" strokeWidth={3} />
                                    <h3 className="text-xl md:text-5xl font-black text-gray-500 uppercase italic">SLOP</h3>
                                </div>
                                <p className="text-red-500 font-black uppercase tracking-widest text-[10px] md:text-sm hidden md:block">AI Artifacts • Compressed • Generic</p>
                            </div>
                        </div>
                    </div>

                    {/* Slider Handle - Flat design */}
                    <div
                        className="absolute top-0 bottom-0 z-20 flex items-center justify-center w-1 bg-white pointer-events-none"
                        style={{ left: `${sliderPosition}%` }}
                    >
                        <div className="w-12 h-12 bg-white text-black border-4 border-black flex items-center justify-center -translate-x-1/2 rotate-45 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                            <MoveHorizontal size={24} className="-rotate-45" strokeWidth={3} />
                        </div>
                    </div>

                    {/* Compare Badge */}
                    <div className="absolute top-6 left-6 z-20 bg-black text-white border-2 border-white px-4 py-2 text-xs font-black uppercase tracking-tighter">
                        LIVE_COMPARISON_01
                    </div>
                </div>
            </div>
        </section>
    );
};

export default VisualProof;
