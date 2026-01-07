import React, { useState, useRef, useLayoutEffect } from 'react';
import { Menu, X, User, LogOut, Globe } from 'lucide-react';
import gsap from 'gsap';
import MagneticButton from './MagneticButton';
import { useTranslation } from '../hooks/useTranslation';

const Navbar = ({ user, onLoginClick, onLogout }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);
    const navRef = useRef(null);

    // Localization
    const { t, language, changeLanguage } = useTranslation();

    const toggleLanguage = () => {
        const nextLang = language === 'en' ? 'ja' : language === 'ja' ? 'vi' : 'en';
        changeLanguage(nextLang);
    };

    useLayoutEffect(() => {
        if (isOpen) {
            gsap.fromTo(menuRef.current,
                { clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)' },
                { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)', duration: 0.5, ease: 'power4.out' }
            );
        }
    }, [isOpen]);

    const handleGetAccess = () => {
        if (user) {
            window.dispatchEvent(new CustomEvent('open-request-drawer'));
        } else {
            onLoginClick();
        }
    };

    const navLinks = ['start', 'quality', 'showcase', 'process'];

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
                            {navLinks.map((item) => (
                                <a
                                    key={item}
                                    href={`#${item}`}
                                    className="relative group px-4 py-2 text-sm font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-colors"
                                >
                                    <span className="relative z-10">{t(`nav.${item}`)}</span>
                                    <div className="absolute inset-0 bg-electric-blue scale-y-0 group-hover:scale-y-100 origin-bottom transition-transform duration-300 -z-0" />
                                </a>
                            ))}
                            <div className="h-8 w-[1px] bg-white/10 mx-4" />

                            {user ? (
                                <>
                                    <a
                                        href="/dashboard"
                                        className="relative group px-4 py-2 text-sm font-bold uppercase tracking-wider text-electric-blue hover:text-white transition-colors flex items-center gap-2"
                                    >
                                        <User size={16} />
                                        <span className="relative z-10">{t('nav.myRequests')}</span>
                                        <div className="absolute inset-0 bg-electric-blue/20 scale-y-0 group-hover:scale-y-100 origin-bottom transition-transform duration-300 -z-0" />
                                    </a>
                                    <button
                                        onClick={onLogout}
                                        className="relative group px-4 py-2 text-sm font-bold uppercase tracking-wider text-red-500 hover:text-white transition-colors flex items-center gap-2"
                                    >
                                        <LogOut size={16} />
                                        <span className="relative z-10">{t('nav.logout')}</span>
                                        <div className="absolute inset-0 bg-red-500 scale-y-0 group-hover:scale-y-100 origin-bottom transition-transform duration-300 -z-0" />
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={onLoginClick}
                                    className="relative group px-4 py-2 text-sm font-bold uppercase tracking-wider text-white hover:text-black transition-colors flex items-center gap-2"
                                >
                                    <User size={16} />
                                    <span className="relative z-10">{t('nav.login')}</span>
                                    <div className="absolute inset-0 bg-white scale-y-0 group-hover:scale-y-100 origin-bottom transition-transform duration-300 -z-0" />
                                </button>
                            )}

                            {/* Language Switcher - Desktop */}
                            <button
                                onClick={toggleLanguage}
                                className="relative group px-4 py-2 text-sm font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-colors flex items-center gap-2 ml-2"
                            >
                                <Globe size={16} />
                                <span className="relative z-10">{language.toUpperCase()}</span>
                            </button>

                            <div className="pl-4">
                                <MagneticButton
                                    className="bg-electric-blue text-black px-6 py-2 font-black uppercase tracking-tighter border-2 border-black flat-shadow hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all"
                                    onClick={handleGetAccess}
                                >
                                    {t('nav.getAccess')}
                                </MagneticButton>
                            </div>
                        </div>
                    </div>

                    <div className="-mr-2 flex md:hidden items-center gap-4">
                        {/* Language Switcher - Mobile Header (optional, or just in menu) */}
                        <button
                            onClick={toggleLanguage}
                            className="text-white font-bold uppercase tracking-wider border border-white/20 px-2 py-1"
                        >
                            {language.toUpperCase()}
                        </button>

                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-3 bg-electric-purple text-black border-2 border-black flat-shadow"
                        >
                            {isOpen ? <X size={24} strokeWidth={3} /> : <Menu size={24} strokeWidth={3} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu - Full Screen & Animated */}
            {isOpen && (
                <div
                    ref={menuRef}
                    className="md:hidden fixed inset-0 top-[78px] bg-electric-blue border-t-4 border-black z-40 overflow-y-auto"
                    style={{ clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)' }}
                >
                    <div className="flex flex-col min-h-[calc(100vh-80px)] p-6 space-y-6">
                        {navLinks.map((item) => (
                            <a
                                key={item}
                                href={`#${item}`}
                                onClick={() => setIsOpen(false)}
                                className="block text-4xl font-black uppercase tracking-tighter text-black hover:text-white hover:italic py-3 transition-colors border-b-2 border-black/10"
                            >
                                {t(`nav.${item}`)}
                            </a>
                        ))}

                        {user ? (
                            <>
                                <a
                                    href="/dashboard"
                                    className="block text-4xl font-black uppercase tracking-tighter text-electric-blue hover:text-white hover:italic py-3 transition-colors border-b-2 border-black/10 flex items-center gap-4"
                                >
                                    <User size={32} /> {t('nav.myRequests')}
                                </a>
                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        onLogout();
                                    }}
                                    className="w-full text-left block text-4xl font-black uppercase tracking-tighter text-red-500 hover:text-white hover:italic py-3 transition-colors border-b-2 border-black/10 flex items-center gap-4"
                                >
                                    <LogOut size={32} /> {t('nav.logout')}
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    onLoginClick();
                                }}
                                className="w-full text-left block text-4xl font-black uppercase tracking-tighter text-white hover:text-black hover:italic py-3 transition-colors border-b-2 border-black/10 flex items-center gap-4"
                            >
                                <User size={32} /> {t('nav.login')}
                            </button>
                        )}

                        <button
                            onClick={() => {
                                setIsOpen(false);
                                handleGetAccess();
                            }}
                            className="w-full text-left bg-black text-white px-6 py-6 text-2xl font-black uppercase tracking-tighter mt-auto active:scale-95 transition-transform"
                        >
                            {t('nav.getAccess')} <span className="ml-2 text-electric-blue">→</span>
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
