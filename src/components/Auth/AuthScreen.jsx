import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';

const AuthScreen = ({ onLoginSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        referral_code: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const containerRef = useRef(null);
    const formRef = useRef(null);

    useEffect(() => {
        // Entrance animation
        gsap.fromTo(containerRef.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
        );
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const switchMode = () => {
        const tl = gsap.timeline();
        tl.to(formRef.current, {
            opacity: 0, y: -10, duration: 0.3, onComplete: () => {
                setIsLogin(!isLogin);
                setError('');
                gsap.set(formRef.current, { y: 10 });
            }
        })
            .to(formRef.current, { opacity: 1, y: 0, duration: 0.3 });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
        const body = isLogin
            ? { username: formData.username, password: formData.password }
            : { ...formData };

        try {
            const response = await fetch(`${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (response.ok) {
                // Success
                if (isLogin) {
                    onLoginSuccess(data.user);
                } else {
                    // After signup, maybe auto login or ask to login
                    // For now, auto switch to login or just login directly
                    alert('Signup successful! Please log in.');
                    setIsLogin(true);
                }
            } else {
                setError(data.error || 'Authentication failed');
            }
        } catch (err) {
            setError('Server error. Please ensure backend is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9000] bg-grid-black flex items-center justify-center p-4">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-black/90 contrast-125 z-0" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-electric-blue/10 blur-[100px] rounded-full pointer-events-none" />

            <div
                ref={containerRef}
                className="relative z-10 w-full max-w-md bg-black/50 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl"
            >
                <h2 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    {isLogin ? 'WELCOME BACK' : 'INITIATE ACCESS'}
                </h2>
                <p className="text-center text-gray-400 text-sm mb-8 tracking-wider">
                    {isLogin ? 'ENTER YOUR CREDENTIALS' : 'SECURE REGISTRATION'}
                </p>

                <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="text"
                            name="username"
                            placeholder="USERNAME"
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-electric-blue focus:outline-none transition-colors placeholder:text-gray-600 font-mono text-sm"
                            required
                        />
                    </div>

                    <div>
                        <input
                            type="password"
                            name="password"
                            placeholder="PASSWORD"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-electric-blue focus:outline-none transition-colors placeholder:text-gray-600 font-mono text-sm"
                            required
                        />
                    </div>

                    {!isLogin && (
                        <div>
                            <input
                                type="text"
                                name="referral_code"
                                placeholder="REFERRAL CODE"
                                value={formData.referral_code}
                                onChange={handleChange}
                                className="w-full bg-black/40 border border-electric-blue/30 rounded-lg p-3 text-white focus:border-electric-blue focus:outline-none transition-colors placeholder:text-gray-600 font-mono text-sm"
                                required
                            />
                            <p className="text-[10px] text-gray-500 mt-1 ml-1 text-right">Referral Code Required *</p>
                        </div>
                    )}

                    {error && (
                        <div className="text-red-500 text-xs text-center bg-red-500/10 p-2 rounded border border-red-500/20">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-white text-black font-bold py-3 rounded-lg hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'PROCESSING...' : (isLogin ? 'ENTER SYSTEM' : 'REQUEST ACCESS')}
                    </button>
                </form>

                <div className="mt-8 text-center space-y-4">
                    <button
                        onClick={switchMode}
                        className="text-xs text-gray-500 hover:text-white transition-colors uppercase tracking-widest border-b border-transparent hover:border-gray-500 pb-0.5"
                    >
                        {isLogin ? 'Need an account? Register' : 'Already have access? Login'}
                    </button>

                    <div className="pt-4 border-t border-white/10">
                        <a
                            href="/tracking"
                            className="text-[10px] bg-white/5 hover:bg-white/10 text-electric-blue py-2 px-4 rounded border border-electric-blue/20 hover:border-electric-blue/50 transition-all uppercase tracking-widest font-mono"
                        >
                            Track Delivery Status
                        </a>
                    </div>
                </div>
            </div>
            {/* Disclaimer Footer */}
            <div className="absolute bottom-6 left-0 w-full text-center px-4 z-20 pointer-events-none">
                <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                    RenderDrop.uk is a personal hobby project. <br className="hidden sm:block" />
                    We are not affiliated with the 3D rendering company at RenderDrop.com. <br className="hidden sm:block" />
                    We just like anime and cheap domains.
                </p>
            </div>
        </div>
    );
};

export default AuthScreen;
