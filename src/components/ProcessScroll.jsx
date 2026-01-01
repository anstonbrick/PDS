import React, { useLayoutEffect, useRef, useMemo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { User, Radar, ScanSearch, FolderOpen, ChevronRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const ProcessScroll = () => {
    const sectionRef = useRef(null);
    const triggerRef = useRef(null);
    const hudRef = useRef(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const cards = gsap.utils.toArray('.process-card');

            // Performance: Optimized horizontal scroll with better settings
            const scrollTween = gsap.to(cards, {
                xPercent: -100 * (cards.length - 1),
                ease: 'none',
                scrollTrigger: {
                    trigger: triggerRef.current,
                    pin: true,
                    pinSpacing: true,
                    scrub: 1.5, // Smoother scrolling
                    end: () => "+=" + triggerRef.current.offsetWidth * 2,
                    fastScrollEnd: true,
                    preventOverlaps: true
                },
            });

            // HUD Lines Animation - Performance: Higher scrub value
            gsap.to('.hud-line', {
                width: '100%',
                ease: 'none',
                scrollTrigger: {
                    trigger: triggerRef.current,
                    start: 'top top',
                    end: () => "+=" + triggerRef.current.offsetWidth * 2,
                    scrub: 2,
                }
            });

            // Card Specific Animations - Performance: Batch animations
            cards.forEach((card, i) => {
                const content = card.querySelector('.card-content');
                const line = card.querySelector('.connector-line-draw');

                // 3D Tilt Effect on entry
                gsap.fromTo(card,
                    { rotationY: 20, rotationX: 5, scale: 0.9, opacity: 0.5 },
                    {
                        rotationY: 0,
                        rotationX: 0,
                        scale: 1,
                        opacity: 1,
                        scrollTrigger: {
                            trigger: card,
                            containerAnimation: scrollTween,
                            start: 'left 80%',
                            end: 'center center',
                            scrub: 1.5,
                        }
                    }
                );

                // Exit Tilt
                gsap.to(card, {
                    rotationY: -20,
                    scale: 0.9,
                    opacity: 0.5,
                    scrollTrigger: {
                        trigger: card,
                        containerAnimation: scrollTween,
                        start: 'center center',
                        end: 'right 20%',
                        scrub: 1.5,
                    }
                });

                // Staggered Content - Performance: simplified toggleActions
                if (content) {
                    gsap.fromTo(content,
                        { y: 40, opacity: 0 },
                        {
                            y: 0,
                            opacity: 1,
                            duration: 0.6,
                            ease: 'power3.out',
                            scrollTrigger: {
                                trigger: card,
                                containerAnimation: scrollTween,
                                start: 'left 100%',
                                toggleActions: 'play none none reverse'
                            }
                        }
                    );
                }

                // Connector Line Drawing
                if (line) {
                    gsap.fromTo(line,
                        { scaleX: 0 },
                        {
                            scaleX: 1,
                            ease: 'none',
                            scrollTrigger: {
                                trigger: card,
                                containerAnimation: scrollTween,
                                start: 'center center',
                                end: 'right center',
                                scrub: 1.5,
                            }
                        }
                    );
                }
            });

            // Reveal Process Title
            gsap.to('.process-title-reveal', {
                y: 0,
                opacity: 1,
                duration: 1,
                stagger: 0.2,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 60%',
                }
            });

            // Performance: Reduced rotation speed for HUD ring
            gsap.to('.hud-ring', {
                rotation: 360,
                duration: 30, // Slower rotation = less CPU usage
                repeat: -1,
                ease: 'none'
            });

        }, sectionRef);

        return () => ctx.revert();
    }, []);

    // Performance: Memoize steps array
    const steps = useMemo(() => [
        {
            icon: <User size={40} className="text-electric-blue" />,
            title: "Transmission",
            desc: "Submit your request parameters. Series, character, and aesthetic vibe.",
            id: "01",
            color: "bg-electric-blue/10",
            border: "group-hover:border-electric-blue/50"
        },
        {
            icon: <Radar size={40} className="text-electric-purple" />,
            title: "Deep Search",
            desc: "Our agents infiltrate private repositories and boutique art circles.",
            id: "02",
            color: "bg-electric-purple/10",
            border: "group-hover:border-electric-purple/50"
        },
        {
            icon: <ScanSearch size={40} className="text-electric-green" />,
            title: "Analysis",
            desc: "Neural inspection for artifacts. 100% human-verified quality control.",
            id: "03",
            color: "bg-electric-green/10",
            border: "group-hover:border-electric-green/50"
        },
        {
            icon: <FolderOpen size={40} className="text-pink-500" />,
            title: "Data Drop",
            desc: "Encrypted delivery of your high-definition curation package.",
            id: "04",
            color: "bg-pink-500/10",
            border: "group-hover:border-pink-500/50"
        },
    ], []);

    return (
        <section id="process" ref={sectionRef} className="overflow-hidden bg-render-dark relative z-30">
            <div ref={triggerRef} className="h-screen w-full flex items-center relative overflow-hidden bg-render-dark px-[10vw]">

                {/* HUD Elements - Performance: Reduced complexity */}
                <div className="absolute inset-0 pointer-events-none opacity-20">
                    <div className="hud-line absolute top-1/2 left-0 w-0 h-[1px] bg-gradient-to-r from-transparent via-electric-blue to-transparent z-0" />
                    <div className="absolute top-[10%] left-[5%] w-64 h-64 border border-white/5 rounded-full hud-ring flex items-center justify-center will-change-transform gpu-accelerate">
                        <div className="w-[80%] h-[80%] border border-white/10 rounded-full border-dashed" />
                    </div>
                </div>

                {/* Vertical Step Marker (HUD Style) */}
                <div className="absolute left-[5vw] top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-4 z-20">
                    <div className="w-[1px] h-32 bg-gradient-to-t from-electric-blue to-transparent" />
                    <span className="[writing-mode:vertical-lr] text-xs font-bold tracking-[0.5em] text-electric-blue uppercase opacity-50">Operational Protocol</span>
                    <div className="w-[1px] h-32 bg-gradient-to-b from-electric-blue to-transparent" />
                </div>

                {/* Intro Text */}
                <div className="absolute top-12 left-12 z-10 p-8">
                    <h2 className="process-title-reveal text-electric-blue font-bold tracking-widest uppercase text-xs mb-2 opacity-0 translate-y-8 flex items-center gap-2">
                        <span className="w-8 h-[1px] bg-electric-blue" /> The Workflow
                    </h2>
                    <h3 className="process-title-reveal text-5xl font-black text-white opacity-0 translate-y-8 leading-tight">
                        From Request <br /> <span className="text-gray-600">to</span> Render.
                    </h3>
                </div>

                {/* Horizontal Container */}
                <div className="flex flex-nowrap gap-[10vw] items-center perspective-[2000px]">
                    {steps.map((step, index) => (
                        <div
                            key={index}
                            className={`process-card flex-none w-[85vw] md:w-[35vw] h-[55vh] p-10 bg-render-black/60 backdrop-blur-md border border-white/5 rounded-3xl flex flex-col justify-between transition-all duration-500 relative overflow-hidden group hover:bg-render-black/80 ${step.border} will-change-transform gpu-accelerate shadow-xl`}
                            style={{ contain: 'layout paint style' }}
                        >
                            {/* Inner Glow - Performance: Optimized opacity */}
                            <div className={`absolute -bottom-20 -right-20 w-64 h-64 ${step.color} blur-[60px] rounded-full opacity-30 group-hover:opacity-70 transition-opacity duration-700`} />

                            <div className="relative z-10 card-content h-full flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-12">
                                        <div className={`icon-box p-5 ${step.color} rounded-2xl border border-white/5 group-hover:scale-110 transition-transform duration-500 ease-out`}>
                                            {step.icon}
                                        </div>
                                        <span className="step-num text-6xl font-black text-white/5 group-hover:text-white/10 transition-colors duration-500">
                                            {step.id}
                                        </span>
                                    </div>
                                    <h4 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight group-hover:text-electric-blue transition-colors duration-300">
                                        {step.title}
                                    </h4>
                                    <p className="text-gray-400 text-lg md:text-xl leading-relaxed max-w-[90%]">
                                        {step.desc}
                                    </p>
                                </div>

                                <div className="flex items-center gap-4 text-electric-blue group-hover:gap-6 transition-all duration-300">
                                    <span className="text-xs font-bold uppercase tracking-widest font-mono">Protocol {step.id}</span>
                                    <ChevronRight size={16} />
                                </div>
                            </div>


                            {/* Connector Line Animation */}
                            {index !== steps.length - 1 && (
                                <div className="absolute top-1/2 -right-[10vw] w-[10vw] h-[1px] bg-white/5 hidden md:block">
                                    <div className="connector-line-draw w-full h-full bg-gradient-to-r from-electric-blue/50 to-transparent origin-left scale-x-0" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ProcessScroll;
