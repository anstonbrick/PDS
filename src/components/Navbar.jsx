import React from 'react';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <nav className="fixed top-0 w-full z-50 bg-render-black/80 backdrop-blur-md border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <span className="text-2xl font-bold tracking-tighter text-white">
                            Render<span className="text-electric-blue">Drop</span>
                        </span>
                    </div>

                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-8">
                            <a href="#hero" className="hover:text-electric-blue transition-colors duration-300 px-3 py-2 rounded-md text-sm font-medium">Start</a>
                            <a href="#process" className="hover:text-electric-blue transition-colors duration-300 px-3 py-2 rounded-md text-sm font-medium">Process</a>
                            <a href="#quality" className="hover:text-electric-blue transition-colors duration-300 px-3 py-2 rounded-md text-sm font-medium">Quality</a>
                            <button
                                className="bg-white text-black hover:bg-electric-blue transition-colors duration-300 px-4 py-2 rounded-full text-sm font-bold"
                                onClick={() => window.dispatchEvent(new CustomEvent('open-request-drawer'))}
                            >
                                Get Access
                            </button>
                        </div>
                    </div>

                    <div className="-mr-2 flex md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-white/10 focus:outline-none"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <div className="md:hidden bg-render-black border-b border-white/10">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <a href="#hero" className="text-gray-300 hover:text-electric-blue block px-3 py-2 rounded-md text-base font-medium">Start</a>
                        <a href="#process" className="text-gray-300 hover:text-electric-blue block px-3 py-2 rounded-md text-base font-medium">Process</a>
                        <a href="#quality" className="text-gray-300 hover:text-electric-blue block px-3 py-2 rounded-md text-base font-medium">Quality</a>
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                window.dispatchEvent(new CustomEvent('open-request-drawer'));
                            }}
                            className="w-full text-left text-black bg-white hover:bg-electric-blue block px-3 py-2 rounded-md text-base font-bold mt-4"
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
