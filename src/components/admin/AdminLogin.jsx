import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                if (data.user.role !== 'admin') {
                    setError('Access Denied: Admin privileges required.');
                    return;
                }
                localStorage.setItem('adminToken', data.token);
                localStorage.setItem('adminUser', JSON.stringify(data.user));
                navigate('/admin/dashboard');
            } else {
                setError(data.error || 'Login failed');
            }
        } catch (err) {
            setError('Server connection error');
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-zinc-900/50 border border-zinc-800 p-8 rounded-2xl backdrop-blur-xl">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 text-center"
                >
                    <h1 className="text-3xl font-bold mb-2 tracking-tighter">System Access</h1>
                    <p className="text-zinc-500 text-sm uppercase tracking-widest">Restricted Area</p>
                </motion.div>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-xs font-mono text-zinc-500 mb-1">IDENTIFIER</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-black/50 border border-zinc-800 p-3 rounded text-white focus:outline-none focus:border-white transition-colors font-mono"
                            placeholder="username"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-mono text-zinc-500 mb-1">passcode</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black/50 border border-zinc-800 p-3 rounded text-white focus:outline-none focus:border-white transition-colors font-mono"
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-white text-black py-3 rounded font-bold hover:bg-zinc-200 transition-colors mt-4"
                    >
                        Authenticate
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
