import React, { useState, useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MoveHorizontal, CheckCircle, XCircle } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const VisualProof = () => {
    const [sliderPosition, setSliderPosition] = useState(50);
    const containerRef = useRef(null);
    const isDragging = useRef(false);
    const rafId = useRef(null);

    // Performance: Throttled position update
    const updatePosition = useCallback((clientX) => {
        if (!containerRef.current) return;

        const { left, width } = containerRef.current.getBoundingClientRect();
        const position = ((clientX - left) / width) * 100;

        setSliderPosition(Math.min(100, Math.max(0, position)));
    }, []);

    const handleMove = useCallback((event) => {
        if (!isDragging.current) return;

        const clientX = event.touches ? event.touches[0].clientX : event.clientX;

        // Performance: Throttle with RAF
        if (rafId.current) return;
        rafId.current = requestAnimationFrame(() => {
            updatePosition(clientX);
            rafId.current = null;
        });
    }, [updatePosition]);

    const handleMouseDown = useCallback(() => {
        isDragging.current = true;
    }, []);

    const handleMouseUp = useCallback(() => {
        isDragging.current = false;
        if (rafId.current) {
            cancelAnimationFrame(rafId.current);
            rafId.current = null;
        }
    }, []);

    useEffect(() => {
        // Performance: Use passive listeners
        window.addEventListener('mouseup', handleMouseUp, { passive: true });
        window.addEventListener('touchend', handleMouseUp, { passive: true });
        window.addEventListener('mousemove', handleMove, { passive: true });
        window.addEventListener('touchmove', handleMove, { passive: true });

        // Scrollytelling reveal
        const revealAnimation = gsap.fromTo(containerRef.current,
            { scale: 0.9, opacity: 0 },
            {
                scale: 1,
                opacity: 1,
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top 85%',
                }
            }
        );

        // Auto-swipe preview
        const proxy = { val: 50 };
        const swipePreview = gsap.to(proxy, {
            val: 50,
            scrollTrigger: {
                trigger: containerRef.current,
                start: 'top 60%',
                once: true, // Performance: Only trigger once
                onEnter: () => {
                    gsap.fromTo(proxy,
                        { val: 50 },
                        {
                            val: 85,
                            duration: 1.5,
                            ease: "power2.inOut",
                            yoyo: true,
                            repeat: 1,
                            onUpdate: () => setSliderPosition(proxy.val)
                        }
                    );
                }
            }
        });

        return () => {
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchend', handleMouseUp);
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('touchmove', handleMove);
            if (rafId.current) cancelAnimationFrame(rafId.current);
            revealAnimation.kill();
            swipePreview.kill();
        };
    }, [handleMouseUp, handleMove]);

    return (
        <section id="quality" className="py-24 relative bg-render-black overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-electric-blue font-bold tracking-widest uppercase text-sm mb-4">
                        The RenderDrop Standard
                    </h2>
                    <h3 className="text-4xl md:text-5xl font-black text-white">
                        Don't Settle for <span className="line-through decoration-red-500 decoration-4">Slop</span>.
                    </h3>
                </div>

                <div
                    ref={containerRef}
                    className="relative w-full max-w-5xl mx-auto h-[500px] rounded-2xl overflow-hidden cursor-ew-resize select-none border border-white/10 shadow-2xl"
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleMouseDown}
                    style={{ contain: 'layout paint style' }}
                >
                    {/* Right Image (RenderDrop Verified) - Background */}
                    <div className="absolute inset-0">
                        <img
                            src="/media/highres2.jpg"
                            alt="RenderDrop Verified"
                            className="w-full h-full object-cover"
                            loading="lazy"
                            decoding="async"
                            fetchpriority="low"
                        />
                        <div className="absolute inset-0 bg-render-black/20 backdrop-blur-[1px] pointer-events-none" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <CheckCircle className="w-24 h-24 text-electric-green drop-shadow-[0_0_15px_rgba(0,255,65,0.6)]" />
                            <h3 className="mt-4 text-3xl font-bold text-white drop-shadow-md">RenderDrop Verified</h3>
                            <p className="text-gray-200 mt-2">Crisp. Human. Intentional.</p>
                        </div>
                    </div>

                    {/* Left Image (Algorithmic Slop) - Clipped Overlay */}
                    <div
                        className="absolute inset-0 overflow-hidden"
                        style={{ width: `${sliderPosition}%` }}
                    >
                        <div className="absolute inset-0 w-[100vw] max-w-5xl h-full">
                            <img
                                src="/media/highres2.jpg"
                                alt="Algorithmic Slop"
                                className="w-full h-full object-cover blur-[8px] grayscale-[0.8] brightness-75 scale-110"
                                loading="lazy"
                                decoding="async"
                                fetchpriority="low"
                            />
                            {/* Performance: Removed animate-pulse - static overlay instead */}
                            <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none w-full">
                                <XCircle className="w-24 h-24 text-red-500/80 drop-shadow-[0_0_15px_rgba(239,68,68,0.4)]" />
                                <h3 className="mt-4 text-3xl font-bold text-gray-300">Algorithmic Slop</h3>
                                <p className="text-gray-400 mt-2">Artifacts. Generic. Soulless.</p>
                            </div>
                        </div>

                        {/* Borders for visualization */}
                        <div className="absolute right-0 top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)] z-20"></div>
                    </div>

                    {/* Slider Handle */}
                    <div
                        className="absolute top-1/2 -translate-y-1/2 z-30 flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-lg text-black will-change-transform"
                        style={{ left: `calc(${sliderPosition}% - 24px)` }}
                    >
                        <MoveHorizontal size={24} />
                    </div>

                    {/* Instruction Label */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 bg-black/50 backdrop-blur px-4 py-2 rounded-full text-sm text-gray-300 pointer-events-none">
                        Drag to compare
                    </div>

                </div>
            </div>
        </section>
    );
};

export default VisualProof;
