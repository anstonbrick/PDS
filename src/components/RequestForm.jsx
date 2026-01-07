import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { X, ArrowRight, Check, AlertCircle } from 'lucide-react';
import { useToast } from '../Toast';
import { useTranslation } from '../hooks/useTranslation';

const RequestForm = () => {
    const { addToast } = useToast();
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
    const { t } = useTranslation();

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

    const handleNext = () => {
        if (step === 4) {
            const val = formData.notes.toUpperCase();
            if (!val.includes("SAFE") && !val.includes("NOT SAFE")) {
                addToast(t('requestForm.validation.protocolRequired'), 'error');
                return;
            }
        }
        setStep(prev => prev + 1);
    };
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
    const [submissionError, setSubmissionError] = useState(null);

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setSubmissionError(null);
        setIsLoading(true);
        const key = generateKey();

        // Retrieve token safely
        let token = '';
        try {
            const userData = JSON.parse(localStorage.getItem('pds_user') || '{}');
            token = userData.token || '';
        } catch (e) {
            console.error('Failed to parse user data:', e);
        }

        if (!token) {
            setSubmissionError(t('requestForm.validation.sessionExpired'));
            addToast(t('requestForm.validation.sessionExpired'), 'error');
            setIsLoading(false);
            return;
        }

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
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Submission failed');
                } else {
                    const textError = await response.text();
                    throw new Error(textError || `Server error: ${response.status}`);
                }
            }

            // critical: Set key only after successful save
            setAccessKey(key);
            setStep(6);
            addToast(t('requestForm.validation.success'), 'success');
        } catch (error) {
            console.error('Request Error:', error);
            setSubmissionError(t('requestForm.validation.failure'));
            addToast(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyKey = () => {
        navigator.clipboard.writeText(accessKey);
        addToast(t('requestForm.validation.copySuccess'), 'success');
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
                                    <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter">{t('requestForm.steps.1.title')}</h3>
                                    <div className="h-1 w-20 bg-electric-blue" />
                                </div>
                                <div className="space-y-6">
                                    <div className="group">
                                        <label className="block text-electric-blue mb-2 font-black uppercase text-sm tracking-widest">{t('requestForm.steps.1.nameLabel')}</label>
                                        <input
                                            type="text"
                                            className="w-full bg-render-dark border-2 border-white/10 p-4 text-white focus:border-electric-blue focus:outline-none transition-colors flat-shadow"
                                            placeholder={t('requestForm.steps.1.namePlaceholder')}
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            autoFocus
                                        />
                                    </div>
                                    <div className="group">
                                        <label className="block text-electric-blue mb-2 font-black uppercase text-sm tracking-widest">{t('requestForm.steps.1.charLabel')}</label>
                                        <input
                                            type="text"
                                            className="w-full bg-render-dark border-2 border-white/10 p-4 text-white focus:border-electric-blue focus:outline-none transition-colors flat-shadow"
                                            placeholder={t('requestForm.steps.1.charPlaceholder')}
                                            value={formData.character}
                                            onChange={e => setFormData({ ...formData, character: e.target.value })}
                                        />
                                    </div>
                                    <div className="group">
                                        <label className="block text-electric-blue mb-2 font-black uppercase text-sm tracking-widest">{t('requestForm.steps.1.seriesLabel')}</label>
                                        <input
                                            type="text"
                                            className="w-full bg-render-dark border-2 border-white/10 p-4 text-white focus:border-electric-blue focus:outline-none transition-colors flat-shadow"
                                            placeholder={t('requestForm.steps.1.seriesPlaceholder')}
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
                                    <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter">{t('requestForm.steps.2.title')}</h3>
                                    <div className="h-1 w-20 bg-purple-500" />
                                </div>
                                <div className="space-y-4">
                                    <label className="block text-purple-500 mb-2 font-black uppercase text-sm tracking-widest">{t('requestForm.steps.2.sourcingLabel')}</label>
                                    <div className="grid grid-cols-1 gap-4">
                                        {[
                                            { id: 'analog', label: t('requestForm.steps.2.options.analog.label'), desc: t('requestForm.steps.2.options.analog.desc'), color: 'border-amber-500', caution: t('requestForm.steps.2.options.analog.caution') },
                                            { id: 'digital', label: t('requestForm.steps.2.options.digital.label'), desc: t('requestForm.steps.2.options.digital.desc'), color: 'border-electric-blue' }
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

                                                {opt.id === 'analog' && (formData.vibe || []).includes('analog') && opt.caution && (
                                                    <div className="flex items-center gap-2 text-amber-500 font-bold text-xs bg-amber-500/10 p-2 border-l-2 border-amber-500">
                                                        <AlertCircle size={14} />
                                                        <span className="uppercase tracking-tighter">{opt.caution}</span>
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
                                    <h3 className="text-[var(--text-fluid-h2)] font-black text-white uppercase italic tracking-tighter">{t('requestForm.steps.3.title')}</h3>
                                    <div className="h-1 w-20 bg-green-500" />
                                </div>
                                <div className="space-y-6">
                                    <div className="flex flex-col md:flex-row gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, deliveryOption: 'email' })}
                                            className={`flex-1 p-4 border-2 font-black uppercase italic tracking-tighter transition-all ${formData.deliveryOption === 'email' ? 'bg-white text-black border-white' : 'bg-render-dark border-white/10 text-gray-500 hover:border-white/30'}`}
                                        >
                                            {t('requestForm.steps.3.emailBtn')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, deliveryOption: 'social' })}
                                            className={`flex-1 p-4 border-2 font-black uppercase italic tracking-tighter transition-all ${formData.deliveryOption === 'social' ? 'bg-white text-black border-white' : 'bg-render-dark border-white/10 text-gray-500 hover:border-white/30'}`}
                                        >
                                            {t('requestForm.steps.3.socialBtn')}
                                        </button>
                                    </div>

                                    {formData.deliveryOption === 'email' ? (
                                        <div className="space-y-2">
                                            <label className="block text-green-500 font-black uppercase text-sm tracking-widest">{t('requestForm.steps.3.emailLabel')}</label>
                                            <input
                                                type="email"
                                                className="w-full bg-render-dark border-2 border-white/10 p-4 text-white focus:border-green-500 focus:outline-none transition-colors flat-shadow"
                                                placeholder={t('requestForm.steps.3.emailPlaceholder')}
                                                value={formData.email}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-green-500 font-black uppercase text-sm tracking-widest mb-2">{t('requestForm.steps.3.platformLabel')}</label>
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
                                                <label className="block text-green-500 font-black uppercase text-sm tracking-widest mb-2">{t('requestForm.steps.3.handleLabel')}</label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-render-dark border-2 border-white/10 p-4 text-white focus:border-green-500 focus:outline-none flat-shadow"
                                                    placeholder={t('requestForm.steps.3.handlePlaceholder')}
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
                                    <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter">{t('requestForm.steps.4.title')}</h3>
                                    <div className="h-1 w-20 bg-blue-500" />
                                </div>
                                <div className="space-y-4">
                                    <label className="block text-blue-500 font-black uppercase text-sm tracking-widest">{t('requestForm.steps.4.label')}</label>
                                    <textarea
                                        className="w-full bg-render-dark border-2 border-white/10 p-6 text-white focus:border-blue-500 focus:outline-none min-h-[250px] resize-none flat-shadow"
                                        placeholder={t('requestForm.steps.4.placeholder')}
                                        value={formData.notes}
                                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    />
                                </div>
                            </>
                        )}

                        {step === 5 && (
                            <>
                                <div className="space-y-2">
                                    <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter">{t('requestForm.steps.5.title')}</h3>
                                    <div className="h-1 w-20 bg-red-500" />
                                </div>

                                <div className="bg-red-500 p-1">
                                    <div className="bg-render-black p-6 border-2 border-red-500 flex items-start gap-4">
                                        <div className="bg-red-500 p-2 text-black">
                                            <AlertCircle size={24} strokeWidth={3} />
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="text-red-500 font-black uppercase tracking-widest text-lg">{t('requestForm.steps.5.protocolParams')}</h4>
                                            <p className="text-gray-400 font-bold text-sm leading-tight uppercase tracking-tighter">
                                                {t('requestForm.steps.5.protocolDesc')}
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
                                        <span className="text-xl font-black italic uppercase tracking-tighter text-gray-500 group-hover:text-white transition-colors">{t('requestForm.steps.5.confirm')}</span>
                                        <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">{t('requestForm.steps.5.confirmDesc')}</p>
                                    </div>
                                </label>
                            </>
                        )}

                        {step === 6 && (
                            <>
                                <div className="space-y-2">
                                    <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter">{t('requestForm.steps.6.title')}</h3>
                                    <div className="h-1 w-20 bg-electric-green" />
                                </div>

                                <div className="space-y-8">
                                    <div className="bg-render-dark border-2 border-white/20 p-6 space-y-4">
                                        <div className="flex justify-between items-end border-b border-white/10 pb-4">
                                            <div className="text-gray-500 font-black uppercase text-xs tracking-widest">{t('requestForm.steps.6.labels.subject')}</div>
                                            <div className="text-white font-black italic uppercase tracking-tighter text-lg">{formData.character}</div>
                                        </div>
                                        <div className="flex justify-between items-end border-b border-white/10 pb-4">
                                            <div className="text-gray-500 font-black uppercase text-xs tracking-widest">{t('requestForm.steps.6.labels.operator')}</div>
                                            <div className="text-white font-black italic uppercase tracking-tighter text-lg">{formData.name}</div>
                                        </div>
                                        <div className="flex justify-between items-end border-b border-white/10 pb-4">
                                            <div className="text-gray-500 font-black uppercase text-xs tracking-widest">{t('requestForm.steps.6.labels.protocol')}</div>
                                            <div className="text-white font-black italic uppercase tracking-tighter text-lg">{t('requestForm.steps.6.labels.protocolValue')}</div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="block text-electric-green font-black uppercase text-sm tracking-widest">{t('requestForm.steps.6.labels.keyLabel')}</label>
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
                                                    {t('requestForm.steps.6.labels.copyBtn')}
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest leading-tight">
                                            {t('requestForm.steps.6.labels.warning')}
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
                                {t('requestForm.buttons.back')}
                            </button>
                        )}

                        {step < 5 ? (
                            <button
                                onClick={handleNext}
                                className="flex-1 bg-white text-black font-black py-4 uppercase italic tracking-tighter text-2xl hover:bg-electric-blue transition-all flex items-center justify-center gap-4 flat-shadow"
                            >
                                {t('requestForm.buttons.next')} <ArrowRight size={24} strokeWidth={3} />
                            </button>
                        ) : step === 5 ? (
                            <div className="flex-1 flex flex-col">
                                {submissionError && (
                                    <div className="bg-red-500/10 border-2 border-red-500 p-4 mb-4 flex items-center gap-4 animate-pulse">
                                        <AlertCircle className="text-red-500 shrink-0" size={24} />
                                        <div className="flex-1">
                                            <p className="text-red-500 font-black uppercase text-xs tracking-widest">{t('requestForm.validation.failure')}</p>
                                            <p className="text-white text-sm font-bold uppercase tracking-tight italic font-mono">{submissionError}</p>
                                        </div>
                                    </div>
                                )}
                                {isLoading ? (
                                    <div className="flex-1 flex flex-col items-center justify-center gap-4 py-4 bg-render-dark border-2 border-white/10">
                                        <div className="w-12 h-1 bg-electric-blue animate-pulse" />
                                        <span className="text-electric-blue font-black uppercase italic tracking-tighter">{t('requestForm.validation.encrypting')}</span>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleSubmit}
                                        disabled={!formData.noAi || isLoading}
                                        className={`flex-1 font-black py-4 uppercase italic tracking-tighter text-2xl transition-all flex items-center justify-center gap-4 ${formData.noAi && !isLoading
                                            ? 'bg-red-500 text-white hover:bg-white hover:text-black flat-shadow'
                                            : 'bg-gray-800 text-gray-600 cursor-not-allowed border-2 border-gray-700'
                                            }`}
                                    >
                                        {t('requestForm.buttons.initiate')}
                                    </button>
                                )}
                            </div>
                        ) : (
                            <button
                                onClick={closeDrawer}
                                className="flex-1 bg-electric-green text-black font-black py-4 uppercase italic tracking-tighter text-2xl hover:bg-white transition-all flex items-center justify-center gap-4 flat-shadow"
                            >
                                {t('requestForm.buttons.secureClose')}
                            </button>
                        )}
                    </div>
                </div>

            </div >
        </>
    );
};

export default RequestForm;
