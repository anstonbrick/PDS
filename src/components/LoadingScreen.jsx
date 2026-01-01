import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const LoadingScreen = ({ onComplete }) => {
    const containerRef = useRef(null);
    const barRef = useRef(null);
    const textRef = useRef(null);

    useEffect(() => {
        const tl = gsap.timeline({
            onComplete: () => {
                // Fade out the container
                gsap.to(containerRef.current, {
                    opacity: 0,
                    duration: 0.8,
                    ease: "power2.inOut",
                    onComplete: onComplete
                });
            }
        });

        // Initial state
        gsap.set(barRef.current, { scaleX: 0 });

        // Loading animation
        tl.to(barRef.current, {
            scaleX: 1,
            duration: 2,
            ease: "expo.inOut"
        })
            .to(textRef.current, {
                opacity: 0,
                y: -20,
                duration: 0.5,
                ease: "power2.in"
            }, "-=0.5");

        return () => tl.kill();
    }, [onComplete]);

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center text-white"
        >
            <h1 ref={textRef} className="text-4xl font-bold tracking-tighter mb-8 font-mono">
                INITIALIZING PDS...
            </h1>
            <div className="w-64 h-1 bg-white/20 overflow-hidden rounded-full">
                <div
                    ref={barRef}
                    className="h-full w-full bg-electric-blue origin-left"
                />
            </div>
        </div>
    );
};

export default LoadingScreen;
