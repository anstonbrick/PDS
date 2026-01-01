import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { X, ArrowRight, Check, AlertCircle } from 'lucide-react';

const RequestForm = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '', email: '', character: '', series: '', vibe: '', noAi: false
    });

    const drawerRef = useRef(null);
    const contentRef = useRef(null);
    const overlayRef = useRef(null);

    useEffect(() => {
        const handleOpen = () => setIsOpen(true);
        window.addEventListener('open-request-drawer', handleOpen);
        return () => window.removeEventListener('open-request-drawer', handleOpen);
    }, []);

    useEffect(() => {
        if (isOpen) {
            // Drawer Entrance
            gsap.to(overlayRef.current, { opacity: 1, duration: 0.3, pointerEvents: 'auto' });
            gsap.fromTo(drawerRef.current,
                { x: '100%' },
                { x: '0%', duration: 0.5, ease: 'power3.out' }
            );
        } else {
            // Drawer Exit
            gsap.to(overlayRef.current, { opacity: 0, duration: 0.3, pointerEvents: 'none' });
            gsap.to(drawerRef.current, { x: '100%', duration: 0.3, ease: 'power3.in' });
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            // Step Transition Animation
            gsap.fromTo(contentRef.current.children,
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.4, stagger: 0.1, delay: 0.2 }
            );
        }
    }, [step, isOpen]);

    const handleNext = () => setStep(prev => prev + 1);
    const handleBack = () => setStep(prev => prev - 1);
    const closeDrawer = () => setIsOpen(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        alert("Request Simulated: " + JSON.stringify(formData, null, 2));
        closeDrawer();
        setStep(1);
        setFormData({ name: '', email: '', character: '', series: '', vibe: '', noAi: false });
    };

    return (
        <>
            {/* Overlay */}
            <div
                ref={overlayRef}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] opacity-0 pointer-events-none transition-opacity"
                onClick={closeDrawer}
            />

            {/* Drawer */}
            <div
                ref={drawerRef}
                className="fixed top-0 right-0 h-full w-full md:w-[600px] bg-render-dark border-l border-white/10 z-[70] shadow-2xl flex flex-col transform translate-x-full"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <div className="flex items-center gap-2">
                        <span className="text-electric-blue font-bold text-lg">Step {step}/4</span>
                        <div className="h-1 w-24 bg-gray-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-electric-blue transition-all duration-300"
                                style={{ width: `${(step / 4) * 100}%` }}
                            />
                        </div>
                    </div>
                    <button onClick={closeDrawer} className="text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 relative">
                    <form className="space-y-8" ref={contentRef} onSubmit={handleSubmit}>

                        {step === 1 && (
                            <>
                                <h3 className="text-3xl font-black text-white">Who are you?</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-gray-400 mb-2 font-medium">Name</label>
                                        <input
                                            type="text"
                                            className="w-full bg-render-black border border-white/10 rounded-lg p-4 text-white focus:border-electric-blue focus:outline-none transition-colors"
                                            placeholder="Enter your name"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            autoFocus
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-400 mb-2 font-medium">Email</label>
                                        <input
                                            type="email"
                                            className="w-full bg-render-black border border-white/10 rounded-lg p-4 text-white focus:border-electric-blue focus:outline-none transition-colors"
                                            placeholder="Enter your email"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {step === 2 && (
                            <>
                                <h3 className="text-3xl font-black text-white">The Subject</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-gray-400 mb-2 font-medium">Character Name</label>
                                        <input
                                            type="text"
                                            className="w-full bg-render-black border border-white/10 rounded-lg p-4 text-white focus:border-electric-blue focus:outline-none transition-colors"
                                            placeholder="e.g. Lucy Kushinada"
                                            value={formData.character}
                                            onChange={e => setFormData({ ...formData, character: e.target.value })}
                                            autoFocus
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-400 mb-2 font-medium">Series / Source</label>
                                        <input
                                            type="text"
                                            className="w-full bg-render-black border border-white/10 rounded-lg p-4 text-white focus:border-electric-blue focus:outline-none transition-colors"
                                            placeholder="e.g. Cyberpunk: Edgerunners"
                                            value={formData.series}
                                            onChange={e => setFormData({ ...formData, series: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {step === 3 && (
                            <>
                                <h3 className="text-3xl font-black text-white">The Vibe</h3>
                                <div className="space-y-4">
                                    <label className="block text-gray-400 mb-2 font-medium">Select Output Style</label>
                                    <div className="grid grid-cols-1 gap-3">
                                        {['Wallpaper 4K', 'Mobile Vertical', 'Sketch / Raw', 'Vibrant Color'].map((opt) => (
                                            <button
                                                key={opt}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, vibe: opt })}
                                                className={`p-4 rounded-lg flex items-center justify-between border transition-all ${formData.vibe === opt
                                                        ? 'bg-electric-blue/10 border-electric-blue text-white'
                                                        : 'bg-render-black border-white/10 text-gray-400 hover:border-white/30'
                                                    }`}
                                            >
                                                {opt}
                                                {formData.vibe === opt && <Check size={18} className="text-electric-blue" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {step === 4 && (
                            <>
                                <h3 className="text-3xl font-black text-white">Final Check</h3>
                                <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-xl flex items-start gap-4">
                                    <AlertCircle className="text-red-500 shrink-0 mt-1" />
                                    <div>
                                        <h4 className="text-red-500 font-bold mb-2">No AI Policy</h4>
                                        <p className="text-gray-300 text-sm leading-relaxed">
                                            RenderDrop guarantees 100% human-created assets. We do not use generative AI upscalers or diffusers.
                                            Turnaround time is 2-4 business days.
                                        </p>
                                    </div>
                                </div>

                                <label className="flex items-center gap-4 group cursor-pointer p-4 rounded-lg hover:bg-white/5 transition-colors">
                                    <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${formData.noAi ? 'bg-electric-blue border-electric-blue' : 'border-gray-500'}`}>
                                        {formData.noAi && <Check size={14} className="text-black" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={formData.noAi}
                                        onChange={e => setFormData({ ...formData, noAi: e.target.checked })}
                                    />
                                    <span className="text-gray-300 group-hover:text-white transition-colors">I understand these assets are hand-curated by humans.</span>
                                </label>
                            </>
                        )}
                    </form>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-white/5 bg-render-black/50 backdrop-blur-md">
                    <div className="flex gap-4">
                        {step > 1 && (
                            <button
                                onClick={handleBack}
                                className="px-6 py-4 rounded-lg font-bold text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                Back
                            </button>
                        )}

                        {step < 4 ? (
                            <button
                                onClick={handleNext}
                                className="flex-1 bg-white text-black font-bold py-4 rounded-lg hover:bg-electric-blue transition-colors flex items-center justify-center gap-2"
                            >
                                Next Step <ArrowRight size={20} />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={!formData.noAi}
                                className={`flex-1 font-bold py-4 rounded-lg transition-colors flex items-center justify-center gap-2 ${formData.noAi
                                        ? 'bg-electric-blue text-black hover:bg-white'
                                        : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                Submit Request
                            </button>
                        )}
                    </div>
                </div>

            </div>
        </>
    );
};

export default RequestForm;
