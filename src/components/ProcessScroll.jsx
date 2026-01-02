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
            // Use matchMedia for responsive animations
            let mm = gsap.matchMedia();

            mm.add("(min-width: 768px)", () => {
                // DESKTOP: Horizontal Scroll
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

                // Card Entrance Animations (Horizontal Context)
                cards.forEach((card) => {
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

                // Progress Bar
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
            });

            mm.add("(max-width: 767px)", () => {
                // MOBILE: Vertical Stack (Simple Fade Up)
                const cards = gsap.utils.toArray('.process-card');
                cards.forEach((card) => {
                    gsap.from(card, {
                        y: 50,
                        opacity: 0,
                        duration: 0.8,
                        ease: 'power2.out',
                        scrollTrigger: {
                            trigger: card,
                            start: 'top 80%',
                        }
                    });
                });
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
        <section id="process" ref={sectionRef} className="bg-render-black relative overflow-hidden py-20 md:py-0">
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            <div className="min-h-screen w-full flex flex-col md:flex-row md:items-center relative">

                {/* Section Header (Graphic) */}
                <div className="relative md:absolute top-0 md:top-20 left-4 md:left-20 z-10 mb-12 px-4 md:px-0">
                    <div className="h-1 w-20 bg-electric-blue mb-4" />
                    <h2 className="text-[var(--text-fluid-h2)] font-black text-white italic uppercase leading-none">
                        PROCESS<br />
                        <span className="text-gray-600">FLOW_v3</span>
                    </h2>
                </div>

                {/* Progress Indicator (Desktop Only) */}
                <div className="hidden md:block absolute bottom-20 left-20 right-20 h-2 bg-white/10 z-20">
                    <div className="process-progress absolute inset-0 bg-electric-blue origin-left scale-x-0" />
                </div>

                {/* Cards Container */}
                <div ref={containerRef} className="flex flex-col md:flex-row md:flex-nowrap md:pl-[20vw] md:items-center gap-12 md:gap-0 px-4 md:px-0">
                    {steps.map((step, i) => (
                        <div key={i} className="process-card flex-none w-full md:w-[45vw] md:h-[60vh] md:px-10 relative">
                            {/* Large Background Step Number */}
                            <span className="step-num absolute -top-6 md:-top-10 left-0 md:-left-10 text-[8rem] md:text-[20vw] font-black text-white/5 select-none z-0 italic leading-none">
                                {step.num}
                            </span>

                            <div className={`card-inner relative z-10 w-full bg-render-dark border-4 ${step.accent} flat-shadow p-8 md:p-12 flex flex-col justify-between h-full`}>
                                <div>
                                    <div className={`${step.color} text-black p-4 md:p-6 inline-block mb-6 md:mb-10 border-4 border-black flat-shadow -rotate-3`}>
                                        {step.icon}
                                    </div>
                                    <h3 className="text-3xl md:text-5xl font-black text-white uppercase italic mb-4 md:mb-6 leading-none">
                                        {step.title}
                                    </h3>
                                    <p className="text-gray-400 text-base md:text-xl font-bold leading-tight italic max-w-md">
                                        {step.desc}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between border-t-2 border-white/10 pt-6 md:pt-8 mt-6 md:mt-0">
                                    <span className="text-xs md:text-sm font-black uppercase tracking-widest text-white/40">PROTOCOL_{step.num}</span>
                                    <div className={`w-10 h-10 md:w-12 md:h-12 ${step.color} flex items-center justify-center border-2 border-black`}>
                                        <div className="w-3 h-3 md:w-4 md:h-4 bg-black rotate-45" />
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
