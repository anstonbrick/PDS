import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ReferralManager = () => {
    const [codes, setCodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newCode, setNewCode] = useState({
        code: '',
        description: '',
        usage_limit: '',
        expiration_date: ''
    });
    const [error, setError] = useState('');
    const [selectedCodeUsers, setSelectedCodeUsers] = useState(null);
    const [viewingCode, setViewingCode] = useState(null);

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
                setNewCode({ code: '', description: '', usage_limit: '', expiration_date: '' });
                fetchCodes();
            } else {
                setError(data.error);
            }
        } catch (error) {
            setError('Failed to create code');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this code?')) return;
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`http://localhost:3001/api/admin/referrals/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                fetchCodes();
            } else {
                alert('Failed to delete code');
            }
        } catch (error) {
            console.error('Error deleting code');
        }
    };

    const handleViewUsers = async (id, codeString) => {
        setViewingCode(codeString);
        setSelectedCodeUsers(null);
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`http://localhost:3001/api/admin/referrals/${id}/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setSelectedCodeUsers(data);
            }
        } catch (error) {
            console.error('Failed to fetch users');
        }
    };

    if (loading) return <div className="text-zinc-500">Loading referrals...</div>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
            <div className="lg:col-span-2 space-y-6">
                <h2 className="text-3xl font-bold">Referral Codes</h2>
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-sm text-zinc-400">
                        <thead className="bg-zinc-950 text-zinc-200 uppercase font-mono text-xs">
                            <tr>
                                <th className="px-6 py-4">Code</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Usage</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {codes.map((code) => {
                                const isExpired = code.expiration_date && new Date() > new Date(code.expiration_date);
                                const isLimitReached = code.usage_limit && code.usage_count >= code.usage_limit;

                                return (
                                    <tr key={code.id} className="hover:bg-zinc-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-mono font-bold text-white tracking-wider">{code.code}</div>
                                            <div className="text-xs opacity-50">{code.description}</div>
                                        </td>
                                        <td className="px-6 py-4 text-xs">
                                            {isExpired ? (
                                                <span className="text-red-500 bg-red-500/10 px-2 py-1 rounded">EXPIRED</span>
                                            ) : isLimitReached ? (
                                                <span className="text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded">MAXED</span>
                                            ) : (
                                                <span className="text-green-500 bg-green-500/10 px-2 py-1 rounded">ACTIVE</span>
                                            )}
                                            {code.expiration_date && (
                                                <div className="mt-1 text-zinc-600">
                                                    Exp: {new Date(code.expiration_date).toLocaleDateString()}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono text-white">
                                            {code.usage_count}
                                            {code.usage_limit ? <span className="text-zinc-600"> / {code.usage_limit}</span> : ''}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button
                                                onClick={() => handleViewUsers(code.id, code.code)}
                                                className="text-xs bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1 rounded transition-colors"
                                            >
                                                USERS
                                            </button>
                                            <button
                                                onClick={() => handleDelete(code.id)}
                                                className="text-xs bg-red-900/20 hover:bg-red-900/40 text-red-500 px-3 py-1 rounded transition-colors"
                                            >
                                                DEL
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
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
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-mono text-zinc-500 mb-1">DESCRIPTION</label>
                            <input
                                type="text"
                                value={newCode.description}
                                onChange={(e) => setNewCode({ ...newCode, description: e.target.value })}
                                className="w-full bg-black/50 border border-zinc-800 p-3 rounded text-white focus:outline-none focus:border-white"
                                placeholder="Campaign name..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-mono text-zinc-500 mb-1">USAGE LIMIT</label>
                                <input
                                    type="number"
                                    value={newCode.usage_limit}
                                    onChange={(e) => setNewCode({ ...newCode, usage_limit: e.target.value })}
                                    className="w-full bg-black/50 border border-zinc-800 p-3 rounded text-white focus:outline-none focus:border-white"
                                    placeholder="∞"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-mono text-zinc-500 mb-1">EXPIRATION</label>
                                <input
                                    type="date"
                                    value={newCode.expiration_date}
                                    onChange={(e) => setNewCode({ ...newCode, expiration_date: e.target.value })}
                                    className="w-full bg-black/50 border border-zinc-800 p-3 rounded text-white focus:outline-none focus:border-white"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-white text-black py-3 rounded font-bold hover:bg-zinc-200 transition-colors mt-2"
                        >
                            Generate Code
                        </button>
                    </form>
                </motion.div>
            </div>

            {/* Users Modal Overlay */}
            <AnimatePresence>
                {viewingCode && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setViewingCode(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-lg overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
                                <h3 className="font-bold text-lg">Users: {viewingCode}</h3>
                                <button onClick={() => setViewingCode(null)} className="text-zinc-500 hover:text-white">✕</button>
                            </div>
                            <div className="max-h-[60vh] overflow-y-auto p-4">
                                {selectedCodeUsers === null ? (
                                    <div className="text-center py-8 text-zinc-500">Loading users...</div>
                                ) : selectedCodeUsers.length === 0 ? (
                                    <div className="text-center py-8 text-zinc-500">No users have signed up with this code.</div>
                                ) : (
                                    <ul className="space-y-2">
                                        {selectedCodeUsers.map(user => (
                                            <li key={user.id} className="bg-black/50 p-3 rounded flex justify-between items-center border border-zinc-800">
                                                <span className="font-mono text-zinc-200">{user.username}</span>
                                                <span className="text-xs text-zinc-500">{new Date(user.created_at).toLocaleString()}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ReferralManager;
