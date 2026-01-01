import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const ReferralManager = () => {
    const [codes, setCodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newCode, setNewCode] = useState({ code: '', description: '' });
    const [error, setError] = useState('');

    const fetchCodes = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch('http://localhost:3001/api/admin/referrals', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setCodes(data);
            }
        } catch (error) {
            console.error('Failed to fetch codes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCodes();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch('http://localhost:3001/api/admin/referrals', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newCode)
            });
            const data = await response.json();
            if (response.ok) {
                setNewCode({ code: '', description: '' });
                fetchCodes();
            } else {
                setError(data.error);
            }
        } catch (error) {
            setError('Failed to create code');
        }
    };

    if (loading) return <div className="text-zinc-500">Loading referrals...</div>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <h2 className="text-3xl font-bold">Referral Codes</h2>
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-sm text-zinc-400">
                        <thead className="bg-zinc-950 text-zinc-200 uppercase font-mono text-xs">
                            <tr>
                                <th className="px-6 py-4">Code</th>
                                <th className="px-6 py-4">Description</th>
                                <th className="px-6 py-4 text-right">Usage</th>
                                <th className="px-6 py-4">Created By</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {codes.map((code) => (
                                <tr key={code.id} className="hover:bg-zinc-800/30 transition-colors">
                                    <td className="px-6 py-4 font-mono font-bold text-white tracking-wider">
                                        {code.code}
                                    </td>
                                    <td className="px-6 py-4">{code.description}</td>
                                    <td className="px-6 py-4 text-right font-mono text-white">
                                        {code.usage_count}
                                    </td>
                                    <td className="px-6 py-4 text-xs opacity-50">
                                        {code.created_by}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="space-y-6">
                <h3 className="text-xl font-bold">Create New Code</h3>
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl"
                >
                    {error && (
                        <div className="mb-4 text-xs text-red-500 bg-red-500/10 p-2 rounded">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="block text-xs font-mono text-zinc-500 mb-1">CODE</label>
                            <input
                                type="text"
                                value={newCode.code}
                                onChange={(e) => setNewCode({ ...newCode, code: e.target.value.toUpperCase() })}
                                className="w-full bg-black/50 border border-zinc-800 p-3 rounded text-white focus:outline-none focus:border-white font-bold tracking-wider"
                                placeholder="PROMO2026"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-mono text-zinc-500 mb-1">DESCRIPTION</label>
                            <input
                                type="text"
                                value={newCode.description}
                                onChange={(e) => setNewCode({ ...newCode, description: e.target.value })}
                                className="w-full bg-black/50 border border-zinc-800 p-3 rounded text-white focus:outline-none focus:border-white"
                                placeholder="For social media campaign..."
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-white text-black py-3 rounded font-bold hover:bg-zinc-200 transition-colors"
                        >
                            Generate Code
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default ReferralManager;
