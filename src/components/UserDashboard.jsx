import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Copy, ArrowLeft, Clock, CheckCircle, Truck, XCircle, Package } from 'lucide-react';
import Navbar from './Navbar';
import { useToast } from './Toast';

const UserDashboard = () => {
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchRequests = async () => {
            const userStr = localStorage.getItem('pds_user');
            if (!userStr) {
                navigate('/');
                return;
            }
            const user = JSON.parse(userStr);

            try {
                const response = await fetch('/api/user/requests', {
                    headers: { 'Authorization': `Bearer ${user.token}` }
                });

                if (!response.ok) throw new Error('Failed to fetch requests');
                const data = await response.json();
                setRequests(data);
            } catch (err) {
                setError(err.message);
                addToast(err.message, 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchRequests();
    }, [navigate, addToast]); // Added addToast dependecy

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'text-yellow-500 border-yellow-500';
            case 'reviewing': return 'text-blue-500 border-blue-500';
            case 'approved': return 'text-green-500 border-green-500';
            case 'production': return 'text-purple-500 border-purple-500';
            case 'completed': return 'text-electric-blue border-electric-blue';
            case 'shipping': return 'text-orange-500 border-orange-500';
            case 'rejected': return 'text-red-500 border-red-500';
            default: return 'text-gray-500 border-gray-500';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return <Clock size={20} />;
            case 'completed': return <CheckCircle size={20} />;
            case 'shipping': return <Truck size={20} />;
            case 'rejected': return <XCircle size={20} />;
            default: return <Package size={20} />;
        }
    };

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            addToast('Access Key Copied!', 'success');
        } catch (err) {
            console.error('Failed to copy:', err);
            // Fallback for non-secure contexts or errors
            addToast(`Access Key: ${text}`, 'info');
        }
    };

    return (
        <div className="bg-render-black min-h-screen text-white font-sans selection:bg-electric-blue selection:text-black grid-bg">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 py-32 sm:px-6 lg:px-8">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-white">
                            My Requests
                        </h1>
                        <p className="text-electric-blue font-bold uppercase tracking-widest mt-2">
                            Secure Transmission History
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-10 h-[1px] bg-electric-blue animate-pulse" />
                    </div>
                ) : error ? (
                    <div className="bg-red-500/10 border-2 border-red-500 p-8 text-center text-red-500 font-bold uppercase">
                        {error}
                    </div>
                ) : requests.length === 0 ? (
                    <div className="text-center py-20 border-2 border-white/10 bg-render-dark">
                        <p className="text-gray-500 font-bold uppercase tracking-widest">No transmissions found.</p>
                        <button
                            onClick={() => window.dispatchEvent(new CustomEvent('open-request-drawer'))}
                            className="mt-6 bg-electric-blue text-black px-8 py-3 font-black uppercase tracking-tighter hover:bg-white transition-all flat-shadow"
                        >
                            Initiate New Drop
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {requests.map(req => (
                            <div key={req.id} className="bg-render-dark border-2 border-white/10 hover:border-electric-blue/50 transition-colors p-6 group">
                                <div className="flex flex-col md:flex-row gap-6 justify-between md:items-center">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-4">
                                            <span className={`px-3 py-1 border-2 text-xs font-black uppercase tracking-widest flex items-center gap-2 ${getStatusColor(req.status)}`}>
                                                {getStatusIcon(req.status)}
                                                {req.status}
                                            </span>
                                            <span className="text-gray-500 text-xs font-mono">
                                                {new Date(req.timestamp).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">
                                            {req.character_name}
                                        </h3>
                                        <p className="text-sm text-gray-400 font-bold uppercase tracking-wide">
                                            Source: {req.series_source}
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <div className="text-xs text-gray-500 font-black uppercase tracking-widest">
                                            Access Key
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <code className="bg-black/50 px-4 py-2 font-mono text-electric-blue border border-white/10 rounded">
                                                {req.access_key}
                                            </code>
                                            <button
                                                onClick={() => copyToClipboard(req.access_key)}
                                                className="p-2 border border-white/10 hover:bg-white hover:text-black transition-colors"
                                                title="Copy Key"
                                            >
                                                <Copy size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <Link
                                        to={`/tracking?key=${req.access_key}`}
                                        className="bg-white/5 border border-white/20 text-white px-6 py-3 font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-all text-center self-start md:self-center"
                                    >
                                        Track Status
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserDashboard;
