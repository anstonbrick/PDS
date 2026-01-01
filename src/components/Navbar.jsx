import React, { useState, useRef, useLayoutEffect } from 'react';
import { Menu, X } from 'lucide-react';
import gsap from 'gsap';
import MagneticButton from './MagneticButton';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);
    const navRef = useRef(null);

    useLayoutEffect(() => {
        if (isOpen) {
            gsap.fromTo(menuRef.current,
                { clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)' },
                { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)', duration: 0.5, ease: 'power4.out' }
            );
        }
    }, [isOpen]);

    return (
        <nav ref={navRef} className="fixed top-0 w-full z-50 bg-render-black border-b-2 border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex items-center">
                        <span className="text-3xl font-black tracking-tighter text-white uppercase italic">
                            Render<span className="text-electric-blue">Drop</span>
                        </span>
                    </div>

                    <div className="hidden md:block">
                        <div className="ml-10 flex items-center space-x-1">
                            {['Start', 'Quality', 'Showcase', 'Process'].map((item) => (
                                <a
                                    key={item}
                                    href={`#${item.toLowerCase()}`}
                                    className="relative group px-4 py-2 text-sm font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-colors"
                                >
                                    <span className="relative z-10">{item}</span>
                                    <div className="absolute inset-0 bg-electric-blue scale-y-0 group-hover:scale-y-100 origin-bottom transition-transform duration-300 -z-0" />
                                </a>
                            ))}
                            <div className="pl-6">
                                <MagneticButton
                                    className="bg-electric-blue text-black px-6 py-2 font-black uppercase tracking-tighter border-2 border-black flat-shadow hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all"
                                    onClick={() => window.dispatchEvent(new CustomEvent('open-request-drawer'))}
                                >
                                    Get Access
                                </MagneticButton>
                            </div>
                        </div>
                    </div>

                    <div className="-mr-2 flex md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-3 bg-electric-purple text-black border-2 border-black flat-shadow"
                        >
                            {isOpen ? <X size={24} strokeWidth={3} /> : <Menu size={24} strokeWidth={3} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <div ref={menuRef} className="md:hidden bg-electric-blue border-b-4 border-black">
                    <div className="px-4 pt-4 pb-8 space-y-2">
                        {['Start', 'Quality', 'Showcase', 'Process'].map((item) => (
                            <a
                                key={item}
                                href={`#${item.toLowerCase()}`}
                                onClick={() => setIsOpen(false)}
                                className="block text-2xl font-black uppercase tracking-tighter text-black hover:italic py-2"
                            >
                                {item}
                            </a>
                        ))}
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                window.dispatchEvent(new CustomEvent('open-request-drawer'));
                            }}
                            className="w-full text-left bg-black text-white px-4 py-4 text-xl font-black uppercase tracking-tighter mt-4"
                        >
                            Get Access
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
