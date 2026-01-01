import React, { useLayoutEffect, useRef, useMemo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { User, Radar, ScanSearch, FolderOpen } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const ProcessScroll = () => {
    const sectionRef = useRef(null);
    const containerRef = useRef(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const cards = gsap.utils.toArray('.process-card');

            const scrollTween = gsap.to(cards, {
                xPercent: -100 * (cards.length - 1),
                ease: 'none',
                scrollTrigger: {
                    trigger: sectionRef.current,
                    pin: true,
                    pinSpacing: true,
                    scrub: 1,
                    end: () => "+=" + sectionRef.current.offsetWidth * 3,
                    anticipatePin: 1,
                },
            });

            // Card Entrance Animations
            cards.forEach((card, i) => {
                const inner = card.querySelector('.card-inner');
                const num = card.querySelector('.step-num');

                gsap.from(inner, {
                    y: 100,
                    opacity: 0,
                    scale: 0.9,
                    duration: 1,
                    ease: 'back.out(1.5)',
                    scrollTrigger: {
                        trigger: card,
                        containerAnimation: scrollTween,
                        start: 'left center',
                        toggleActions: 'play none none reverse'
                    }
                });

                gsap.from(num, {
                    x: -100,
                    opacity: 0,
                    duration: 1.2,
                    ease: 'power4.out',
                    scrollTrigger: {
                        trigger: card,
                        containerAnimation: scrollTween,
                        start: 'left center',
                        toggleActions: 'play none none reverse'
                    }
                });
            });

            // Progress Bar (Graphic style)
            gsap.to('.process-progress', {
                scaleX: 1,
                ease: 'none',
                scrollTrigger: {
                    trigger: sectionRef.current,
                    scrub: 1,
                    start: 'top top',
                    end: () => "+=" + sectionRef.current.offsetWidth * 3,
                }
            });

        }, sectionRef.current);

        return () => ctx.revert();
    }, []);

    const steps = useMemo(() => [
        {
            icon: <User size={48} />,
            title: "TRANSMISSION",
            desc: "Submit request parameters. Series, character, and aesthetic vibe.",
            num: "01",
            color: "bg-electric-blue",
            accent: "border-electric-blue"
        },
        {
            icon: <Radar size={48} />,
            title: "DEEP SEARCH",
            desc: "Infiltrating private repositories and boutique art circles.",
            num: "02",
            color: "bg-electric-purple",
            accent: "border-electric-purple"
        },
        {
            icon: <ScanSearch size={48} />,
            title: "ANALYSIS",
            desc: "Neural inspection for artifacts. 100% human-verified quality.",
            num: "03",
            color: "bg-electric-green",
            accent: "border-electric-green"
        },
        {
            icon: <FolderOpen size={48} />,
            title: "DATA DROP",
            desc: "Encrypted delivery of your high-definition curation package.",
            num: "04",
            color: "bg-white",
            accent: "border-white"
        },
    ], []);

    return (
        <section id="process" ref={sectionRef} className="bg-render-black relative overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            <div className="h-screen w-full flex items-center relative">

                {/* Section Header (Graphic) */}
                <div className="absolute top-20 left-20 z-10">
                    <div className="h-1 w-20 bg-electric-blue mb-4" />
                    <h2 className="text-7xl font-black text-white italic uppercase leading-none">
                        PROCESS<br />
                        <span className="text-gray-800">FLOW_v3</span>
                    </h2>
                </div>

                {/* Progress Indicator */}
                <div className="absolute bottom-20 left-20 right-20 h-2 bg-white/10 z-20">
                    <div className="process-progress absolute inset-0 bg-electric-blue origin-left scale-x-0" />
                </div>

                {/* Cards Container */}
                <div ref={containerRef} className="flex flex-nowrap pl-[20vw] items-center">
                    {steps.map((step, i) => (
                        <div key={i} className="process-card flex-none w-[80vw] md:w-[45vw] h-[60vh] px-10 relative">
                            {/* Large Background Step Number */}
                            <span className="step-num absolute -top-10 -left-10 text-[20vw] font-black text-white/5 select-none z-0 italic">
                                {step.num}
                            </span>

                            <div className={`card-inner relative z-10 h-full bg-render-dark border-4 ${step.accent} flat-shadow p-12 flex flex-col justify-between`}>
                                <div>
                                    <div className={`${step.color} text-black p-6 inline-block mb-10 border-4 border-black flat-shadow -rotate-3`}>
                                        {step.icon}
                                    </div>
                                    <h3 className="text-4xl md:text-5xl font-black text-white uppercase italic mb-6 leading-none">
                                        {step.title}
                                    </h3>
                                    <p className="text-gray-400 text-lg md:text-xl font-bold leading-tight italic max-w-md">
                                        {step.desc}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between border-t-2 border-white/10 pt-8">
                                    <span className="text-sm font-black uppercase tracking-widest text-white/40">PROTOCOL_{step.num}</span>
                                    <div className={`w-12 h-12 ${step.color} flex items-center justify-center border-2 border-black`}>
                                        <div className="w-4 h-4 bg-black rotate-45" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ProcessScroll;
