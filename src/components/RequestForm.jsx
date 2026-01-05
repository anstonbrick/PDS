import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { X, ArrowRight, Check, AlertCircle } from 'lucide-react';

const RequestForm = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [accessKey, setAccessKey] = useState('');
    const [formData, setFormData] = useState({
        name: '', character: '', series: '', vibe: [],
        deliveryOption: 'email', email: '', socialPlatform: 'discord', socialHandle: '',
        notes: '', noAi: false
    });

    const drawerRef = useRef(null);
    const contentRef = useRef(null);
    const overlayRef = useRef(null);

    const generateKey = () => {
        // Use only alphanumeric characters to avoid URL encoding issues (no #, %, & etc.)
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        return Array.from({ length: 14 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
    };

    useEffect(() => {
        const handleOpen = () => setIsOpen(true);
        window.addEventListener('open-request-drawer', handleOpen);
        return () => window.removeEventListener('open-request-drawer', handleOpen);
    }, []);

    useEffect(() => {
        if (isOpen) {
            // Drawer Entrance - Snappy & Mechanical
            gsap.set(overlayRef.current, { pointerEvents: 'auto' });
            gsap.to(overlayRef.current, {
                opacity: 1,
                duration: 0.2,
                ease: "none"
            });

            gsap.fromTo(drawerRef.current,
                { x: '100%' },
                {
                    x: '0%',
                    duration: 0.4,
                    ease: 'expo.out'
                }
            );
        } else {
            // Drawer Exit
            gsap.to(overlayRef.current, {
                opacity: 0,
                duration: 0.2,
                ease: "none",
                onComplete: () => gsap.set(overlayRef.current, { pointerEvents: 'none' })
            });
            gsap.to(drawerRef.current, {
                x: '100%',
                duration: 0.3,
                ease: 'power2.in'
            });
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && contentRef.current) {
            // Step Transition Animation - Flat sliding
            gsap.fromTo(contentRef.current.children,
                { x: 10, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.3, stagger: 0.05, ease: "power2.out" }
            );
        }
    }, [step, isOpen]);

    const handleNext = () => setStep(prev => prev + 1);
    const handleBack = () => setStep(prev => prev - 1);
    const closeDrawer = () => {
        setIsOpen(false);
        // Reset after animation
        setTimeout(() => {
            setStep(1);
            setAccessKey('');
        }, 300);
    };

    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        setIsLoading(true);
        const key = generateKey();

        // Prepare payload with snake_case to match DB
        const payload = {
            access_key: key,
            operator_name: formData.name,
            character_name: formData.character,
            series_source: formData.series,
            sourcing_vibe: formData.vibe,
            contact_method: formData.deliveryOption,
            contact_handle: formData.deliveryOption === 'email' ? formData.email : `${formData.socialPlatform}:${formData.socialHandle}`,
            notes: formData.notes
        };

        try {
            const response = await fetch('/api/request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${JSON.parse(localStorage.getItem('pds_user') || '{}').token}`
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Submission failed');
            }

            // critical: Set key only after successful save
            setAccessKey(key);
            setStep(6);
        } catch (error) {
            console.error('Request Error:', error);
            alert(`TRANSMISSION_ERROR: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyKey = () => {
        navigator.clipboard.writeText(accessKey);
        alert("ACCESS_KEY copied to clipboard");
    };

    return (
        <>
            {/* Overlay - Geometric Texture instead of Blur */}
            <div
                ref={overlayRef}
                className="fixed inset-0 bg-black/80 z-[60] opacity-0 pointer-events-none transition-opacity"
                style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)',
                    backgroundSize: '24px 24px'
                }}
                onClick={closeDrawer}
            />

            {/* Drawer */}
            <div
                ref={drawerRef}
                className="fixed top-0 right-0 h-full w-full md:w-[600px] bg-render-black border-l-4 border-white z-[70] flex flex-col transform translate-x-full"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b-2 border-white/20 bg-render-dark">
                    <div className="flex items-center gap-4">
                        <span className="text-electric-blue font-black text-2xl tracking-tighter italic">STEP_{step < 10 ? `0${step}` : step}/06</span>
                        <div className="h-6 w-32 border-2 border-white/20 p-0.5">
                            <div
                                className="h-full bg-electric-blue transition-all duration-300"
                                style={{ width: `${(step / 6) * 100}%` }}
                            />
                        </div>
                    </div>
                    <button
                        onClick={closeDrawer}
                        className="w-10 h-10 border-2 border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 relative scrollbar-none">
                    <form className="space-y-10" ref={contentRef} onSubmit={handleSubmit}>

                        {step === 1 && (
                            <>
                                <div className="space-y-2">
                                    <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter">The Subject</h3>
                                    <div className="h-1 w-20 bg-electric-blue" />
                                </div>
                                <div className="space-y-6">
                                    <div className="group">
                                        <label className="block text-electric-blue mb-2 font-black uppercase text-sm tracking-widest">Your Name</label>
                                        <input
                                            type="text"
                                            className="w-full bg-render-dark border-2 border-white/10 p-4 text-white focus:border-electric-blue focus:outline-none transition-colors flat-shadow"
                                            placeholder="OPERATOR NAME"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            autoFocus
                                        />
                                    </div>
                                    <div className="group">
                                        <label className="block text-electric-blue mb-2 font-black uppercase text-sm tracking-widest">Character Name</label>
                                        <input
                                            type="text"
                                            className="w-full bg-render-dark border-2 border-white/10 p-4 text-white focus:border-electric-blue focus:outline-none transition-colors flat-shadow"
                                            placeholder="TARGET_CHARACTER"
                                            value={formData.character}
                                            onChange={e => setFormData({ ...formData, character: e.target.value })}
                                        />
                                    </div>
                                    <div className="group">
                                        <label className="block text-electric-blue mb-2 font-black uppercase text-sm tracking-widest">Series / Source</label>
                                        <input
                                            type="text"
                                            className="w-full bg-render-dark border-2 border-white/10 p-4 text-white focus:border-electric-blue focus:outline-none transition-colors flat-shadow"
                                            placeholder="SOURCE_ARCHIVE"
                                            value={formData.series}
                                            onChange={e => setFormData({ ...formData, series: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {step === 2 && (
                            <>
                                <div className="space-y-2">
                                    <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter">The Method</h3>
                                    <div className="h-1 w-20 bg-purple-500" />
                                </div>
                                <div className="space-y-4">
                                    <label className="block text-purple-500 mb-2 font-black uppercase text-sm tracking-widest">Select Sourcing Style</label>
                                    <div className="grid grid-cols-1 gap-4">
                                        {[
                                            { id: 'analog', label: 'ANALOG_RETRIEVAL', desc: 'Manual film scanning & high-grain retrieval', color: 'border-amber-500' },
                                            { id: 'digital', label: 'DIGITAL_EXTRACTION', desc: 'Sourced from verified digital master archives', color: 'border-electric-blue' }
                                        ].map((opt) => (
                                            <div key={opt.id} className="space-y-2">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const current = formData.vibe || [];
                                                        const next = current.includes(opt.id)
                                                            ? current.filter(i => i !== opt.id)
                                                            : [...current, opt.id];
                                                        setFormData({ ...formData, vibe: next });
                                                    }}
                                                    className={`w-full p-6 border-2 transition-all text-left flex items-center justify-between ${(formData.vibe || []).includes(opt.id)
                                                        ? `bg-white text-black ${opt.color}`
                                                        : 'bg-render-dark border-white/10 text-gray-400 hover:border-white/30'
                                                        }`}
                                                >
                                                    <div>
                                                        <div className="font-black text-xl italic tracking-tighter uppercase">{opt.label}</div>
                                                        <div className="text-xs font-bold opacity-60 tracking-wider">REF://{opt.id.toUpperCase()}</div>
                                                    </div>
                                                    {(formData.vibe || []).includes(opt.id) && <Check size={24} strokeWidth={4} />}
                                                </button>

                                                {opt.id === 'analog' && (formData.vibe || []).includes('analog') && (
                                                    <div className="flex items-center gap-2 text-amber-500 font-bold text-xs bg-amber-500/10 p-2 border-l-2 border-amber-500">
                                                        <AlertCircle size={14} />
                                                        <span className="uppercase tracking-tighter">CAUTION: Manual processing delay (+3 days)</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {step === 3 && (
                            <>
                                <div className="space-y-2">
                                    <h3 className="text-[var(--text-fluid-h2)] font-black text-white uppercase italic tracking-tighter">Link Protocol</h3>
                                    <div className="h-1 w-20 bg-green-500" />
                                </div>
                                <div className="space-y-6">
                                    <div className="flex flex-col md:flex-row gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, deliveryOption: 'email' })}
                                            className={`flex-1 p-4 border-2 font-black uppercase italic tracking-tighter transition-all ${formData.deliveryOption === 'email' ? 'bg-white text-black border-white' : 'bg-render-dark border-white/10 text-gray-500 hover:border-white/30'}`}
                                        >
                                            EMAIL_COMMS
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, deliveryOption: 'social' })}
                                            className={`flex-1 p-4 border-2 font-black uppercase italic tracking-tighter transition-all ${formData.deliveryOption === 'social' ? 'bg-white text-black border-white' : 'bg-render-dark border-white/10 text-gray-500 hover:border-white/30'}`}
                                        >
                                            SOCIAL_EXT
                                        </button>
                                    </div>

                                    {formData.deliveryOption === 'email' ? (
                                        <div className="space-y-2">
                                            <label className="block text-green-500 font-black uppercase text-sm tracking-widest">Receiver Address</label>
                                            <input
                                                type="email"
                                                className="w-full bg-render-dark border-2 border-white/10 p-4 text-white focus:border-green-500 focus:outline-none transition-colors flat-shadow"
                                                placeholder="OPERATOR@ADDRESS.COM"
                                                value={formData.email}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-green-500 font-black uppercase text-sm tracking-widest mb-2">Platform Hub</label>
                                                <div className="relative">
                                                    <select
                                                        className="w-full bg-render-dark border-2 border-white/10 p-4 text-white focus:border-green-500 focus:outline-none appearance-none cursor-pointer uppercase font-bold tracking-widest"
                                                        value={formData.socialPlatform}
                                                        onChange={e => setFormData({ ...formData, socialPlatform: e.target.value })}
                                                    >
                                                        <option value="discord">DISCORD_NET</option>
                                                        <option value="facebook">FACEBOOK_HUB</option>
                                                        <option value="other">OTHER_PORTAL</option>
                                                    </select>
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                        <ArrowRight size={20} className="rotate-90" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-green-500 font-black uppercase text-sm tracking-widest mb-2">Access Handle</label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-render-dark border-2 border-white/10 p-4 text-white focus:border-green-500 focus:outline-none flat-shadow"
                                                    placeholder={
                                                        formData.socialPlatform === 'discord' ? 'USER#0000' :
                                                            formData.socialPlatform === 'facebook' ? 'FB.COM/USER' :
                                                                'IDENTITY_STRING'
                                                    }
                                                    value={formData.socialHandle}
                                                    onChange={e => setFormData({ ...formData, socialHandle: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {step === 4 && (
                            <>
                                <div className="space-y-2">
                                    <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter">Data Notes</h3>
                                    <div className="h-1 w-20 bg-blue-500" />
                                </div>
                                <div className="space-y-4">
                                    <label className="block text-blue-500 font-black uppercase text-sm tracking-widest">Encoded Instructions</label>
                                    <textarea
                                        className="w-full bg-render-dark border-2 border-white/10 p-6 text-white focus:border-blue-500 focus:outline-none min-h-[250px] resize-none flat-shadow"
                                        placeholder="SPECIFY_REQUIREMENTS: Poses, Lighting, Resolution..."
                                        value={formData.notes}
                                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    />
                                </div>
                            </>
                        )}

                        {step === 5 && (
                            <>
                                <div className="space-y-2">
                                    <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter">Authorization</h3>
                                    <div className="h-1 w-20 bg-red-500" />
                                </div>

                                <div className="bg-red-500 p-1">
                                    <div className="bg-render-black p-6 border-2 border-red-500 flex items-start gap-4">
                                        <div className="bg-red-500 p-2 text-black">
                                            <AlertCircle size={24} strokeWidth={3} />
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="text-red-500 font-black uppercase tracking-widest text-lg">NO_AI_PROTOCOL</h4>
                                            <p className="text-gray-400 font-bold text-sm leading-tight uppercase tracking-tighter">
                                                RenderDrop guarantees 100% human-created assets. No generative AI. No neural upscalers. Pure craft.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <label className="flex items-center gap-6 group cursor-pointer p-6 border-2 border-white/10 hover:border-white transition-all bg-render-dark">
                                    <div className={`w-10 h-10 border-4 flex items-center justify-center transition-all ${formData.noAi ? 'bg-white border-white text-black' : 'border-gray-500'}`}>
                                        {formData.noAi && <Check size={28} strokeWidth={4} />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={formData.noAi}
                                        onChange={e => setFormData({ ...formData, noAi: e.target.checked })}
                                    />
                                    <div className="flex-1">
                                        <span className="text-xl font-black italic uppercase tracking-tighter text-gray-500 group-hover:text-white transition-colors">Confirm Authorization</span>
                                        <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">Hand-curated asset delivery pipeline</p>
                                    </div>
                                </label>
                            </>
                        )}

                        {step === 6 && (
                            <>
                                <div className="space-y-2">
                                    <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter">Request_Receipt</h3>
                                    <div className="h-1 w-20 bg-electric-green" />
                                </div>

                                <div className="space-y-8">
                                    <div className="bg-render-dark border-2 border-white/20 p-6 space-y-4">
                                        <div className="flex justify-between items-end border-b border-white/10 pb-4">
                                            <div className="text-gray-500 font-black uppercase text-xs tracking-widest">Subject_Link</div>
                                            <div className="text-white font-black italic uppercase tracking-tighter text-lg">{formData.character}</div>
                                        </div>
                                        <div className="flex justify-between items-end border-b border-white/10 pb-4">
                                            <div className="text-gray-500 font-black uppercase text-xs tracking-widest">Operator</div>
                                            <div className="text-white font-black italic uppercase tracking-tighter text-lg">{formData.name}</div>
                                        </div>
                                        <div className="flex justify-between items-end border-b border-white/10 pb-4">
                                            <div className="text-gray-500 font-black uppercase text-xs tracking-widest">Protocol</div>
                                            <div className="text-white font-black italic uppercase tracking-tighter text-lg">SECURE_DROP</div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="block text-electric-green font-black uppercase text-sm tracking-widest">Digital_Wallet_Access_Key</label>
                                        <div className="bg-white p-1">
                                            <div className="bg-render-black border-2 border-white p-6 flex flex-col gap-4 text-center">
                                                <div className="text-electric-blue font-black text-3xl tracking-widest break-all font-mono italic">
                                                    {accessKey}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={handleCopyKey}
                                                    className="bg-electric-blue text-black font-black py-2 uppercase italic tracking-tighter hover:bg-white transition-all"
                                                >
                                                    COPY_ACCESS_KEY
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest leading-tight">
                                            WARNING: Store this key in a secure location. This is required to retrieve your assets. We do not store this key in cleartext.
                                        </p>
                                    </div>
                                </div>
                            </>
                        )}
                    </form>
                </div>

                {/* Footer Actions */}
                <div className="p-8 border-t-2 border-white/20 bg-render-dark">
                    <div className="flex gap-4">
                        {step > 1 && step < 6 && (
                            <button
                                onClick={handleBack}
                                className="px-10 py-4 border-2 border-white/20 font-black uppercase italic tracking-tighter text-white hover:bg-white hover:text-black transition-all"
                            >
                                BACK
                            </button>
                        )}

                        {step < 5 ? (
                            <button
                                onClick={handleNext}
                                className="flex-1 bg-white text-black font-black py-4 uppercase italic tracking-tighter text-2xl hover:bg-electric-blue transition-all flex items-center justify-center gap-4 flat-shadow"
                            >
                                NEXT_STEP <ArrowRight size={24} strokeWidth={3} />
                            </button>
                        ) : step === 5 ? (
                            <button
                                onClick={handleSubmit}
                                disabled={!formData.noAi || isLoading}
                                className={`flex-1 font-black py-4 uppercase italic tracking-tighter text-2xl transition-all flex items-center justify-center gap-4 ${formData.noAi && !isLoading
                                    ? 'bg-red-500 text-white hover:bg-white hover:text-black flat-shadow'
                                    : 'bg-gray-800 text-gray-600 cursor-not-allowed border-2 border-gray-700'
                                    }`}
                            >
                                {isLoading ? 'TRANSMITTING...' : 'INITIATE_DROP'}
                            </button>
                        ) : (
                            <button
                                onClick={closeDrawer}
                                className="flex-1 bg-electric-green text-black font-black py-4 uppercase italic tracking-tighter text-2xl hover:bg-white transition-all flex items-center justify-center gap-4 flat-shadow"
                            >
                                SECURE_AND_CLOSE
                            </button>
                        )}
                    </div>
                </div>

            </div>
        </>
    );
};

export default RequestForm;
