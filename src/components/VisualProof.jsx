import React, { useState, useRef, useEffect } from 'react';
import { MoveHorizontal, CheckCircle, XCircle } from 'lucide-react';

const VisualProof = () => {
    const [sliderPosition, setSliderPosition] = useState(50);
    const containerRef = useRef(null);
    const isDragging = useRef(false);

    const handleMove = (event) => {
        if (!containerRef.current) return;

        const { left, width } = containerRef.current.getBoundingClientRect();
        const clientX = event.touches ? event.touches[0].clientX : event.clientX;
        const position = ((clientX - left) / width) * 100;

        setSliderPosition(Math.min(100, Math.max(0, position)));
    };

    const handleMouseDown = () => {
        isDragging.current = true;
    };

    const handleMouseUp = () => {
        isDragging.current = false;
    };

    const handleMouseMove = (e) => {
        if (!isDragging.current) return;
        handleMove(e);
    };

    useEffect(() => {
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('touchend', handleMouseUp);
        return () => {
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchend', handleMouseUp);
        };
    }, []);

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
                    onMouseMove={handleMouseMove}
                    onTouchMove={handleMove}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleMouseDown}
                >
                    {/* Right Image (RenderDrop Verified) - Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-electric-purple flex items-center justify-center">
                        {/* Simple pattern to show sharpness */}
                        <div className="w-full h-full opacity-50 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" style={{ backgroundSize: '20px 20px' }}></div>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <CheckCircle className="w-24 h-24 text-electric-green drop-shadow-[0_0_15px_rgba(0,255,65,0.6)]" />
                            <h3 className="mt-4 text-3xl font-bold text-white drop-shadow-md">RenderDrop Verified</h3>
                            <p className="text-gray-200 mt-2">Crisp. Human. Intentional.</p>
                        </div>
                    </div>

                    {/* Left Image (Algorithmic Slop) - Clipped Overlay */}
                    <div
                        className="absolute inset-0 bg-gray-800"
                        style={{ width: `${sliderPosition}%` }}
                    >
                        <div className="absolute inset-0 w-[100vw] max-w-5xl h-full bg-gray-900 flex items-center justify-center overflow-hidden">
                            {/* Noise and Blur effects */}
                            <div className="absolute inset-0 bg-noise opacity-20 animate-noise"></div>
                            <div className="absolute inset-0 backdrop-blur-md bg-white/5"></div>

                            <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center justify-center pointer-events-none w-full">
                                <XCircle className="w-24 h-24 text-red-500 blur-[2px]" />
                                <h3 className="mt-4 text-3xl font-bold text-gray-400 blur-[1px]">Algorithmic Slop</h3>
                                <p className="text-gray-500 mt-2">Artifacts. Generic. Soulless.</p>
                            </div>
                        </div>

                        {/* Borders for visualization */}
                        <div className="absolute right-0 top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)] z-20"></div>
                    </div>

                    {/* Slider Handle */}
                    <div
                        className="absolute top-1/2 -translate-y-1/2 z-30 flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-lg text-black"
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
