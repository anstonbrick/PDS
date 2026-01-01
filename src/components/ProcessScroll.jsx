import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { User, Radar, ScanSearch, FolderOpen } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const ProcessScroll = () => {
    const sectionRef = useRef(null);
    const triggerRef = useRef(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const cards = gsap.utils.toArray('.process-card');
            const totalScroll = cards.length * 100; // rough width calculation

            gsap.to(cards, {
                xPercent: -100 * (cards.length - 1),
                ease: 'none',
                scrollTrigger: {
                    trigger: triggerRef.current,
                    pin: true,
                    scrub: 1,
                    snap: 1 / (cards.length - 1),
                    end: () => "+=" + triggerRef.current.offsetWidth,
                },
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    const steps = [
        {
            icon: <User size={48} className="text-electric-blue" />,
            title: "You Request",
            desc: "Tell us the character, series, and vibe. We handle the rest.",
            id: "01",
        },
        {
            icon: <Radar size={48} className="text-electric-purple" />,
            title: "We Scour",
            desc: "Our team digs through archived forums, artboards, and private collections.",
            id: "02",
        },
        {
            icon: <ScanSearch size={48} className="text-electric-green" />,
            title: "Verification",
            desc: "Every pixel is checked. No AI artifacts. No low-res upscales.",
            id: "03",
        },
        {
            icon: <FolderOpen size={48} className="text-pink-500" />,
            title: "The Drop",
            desc: "A curated ZIP pack delivered straight to your dashboard.",
            id: "04",
        },
    ];

    return (
        <section id="process" ref={sectionRef} className="overflow-hidden bg-render-dark">
            <div ref={triggerRef} className="h-screen w-full flex items-center relative overflow-hidden">

                {/* Intro Text (Absolute) */}
                <div className="absolute top-12 left-12 z-10 p-8">
                    <h2 className="text-electric-blue font-bold tracking-widest uppercase text-sm mb-2">
                        The Workflow
                    </h2>
                    <h3 className="text-4xl font-black text-white">
                        From Request <br /> to Render.
                    </h3>
                </div>

                {/* Horizontal Container */}
                <div className="flex flex-nowrap pl-[10vw] pr-[10vw]">
                    {steps.map((step, index) => (
                        <div
                            key={index}
                            className="process-card flex-none w-[80vw] md:w-[40vw] h-[60vh] mx-4 p-8 bg-render-black border border-white/10 rounded-2xl flex flex-col justify-between hover:border-white/30 transition-colors duration-300 relative overflow-hidden group"
                        >
                            {/* Card Background Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="relative z-10">
                                <div className="text-8xl font-black text-white/5 absolute -top-4 -right-4">
                                    {step.id}
                                </div>
                                <div className="mb-8 p-4 bg-white/5 w-fit rounded-xl backdrop-blur-sm border border-white/10 group-hover:scale-110 transition-transform duration-300">
                                    {step.icon}
                                </div>
                                <h4 className="text-3xl font-bold text-white mb-4">{step.title}</h4>
                                <p className="text-gray-400 text-lg">{step.desc}</p>
                            </div>

                            {/* Connector Line (Visual only) */}
                            {index !== steps.length - 1 && (
                                <div className="absolute top-1/2 -right-12 w-24 h-[1px] bg-gradient-to-r from-white/20 to-transparent hidden md:block" />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ProcessScroll;
