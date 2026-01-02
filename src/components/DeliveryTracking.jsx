import React, { useState, useEffect } from 'react';
import gsap from 'gsap';
import { Search, Package, Clock, CheckCircle, XCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const DeliveryTracking = () => {
    const [accessKey, setAccessKey] = useState('');
    const [trackingData, setTrackingData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleTrack = async (e) => {
        if (e) e.preventDefault();
        if (!accessKey.trim()) return;

        setLoading(true);
        setError(null);
        setTrackingData(null);

        try {
            // Encode the key to handle any existing keys with special characters
            const safeKey = encodeURIComponent(accessKey.trim());
            const response = await fetch(`http://localhost:3001/api/tracking/${safeKey}`);
            const data = await response.json();

            if (response.ok) {
                setTrackingData(data);
            } else {
                setError(data.error || 'Tracking information not found.');
            }
        } catch (err) {
            setError('Connection error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Status Badge Helper
    const getStatusBadge = (status) => {
        const s = status.toLowerCase();
        if (s === 'pending') return { color: 'text-amber-500', border: 'border-amber-500', bg: 'bg-amber-500/10', icon: Clock, label: 'PROCESSING_QUEUE' };
        if (s === 'approved') return { color: 'text-blue-500', border: 'border-blue-500', bg: 'bg-blue-500/10', icon: CheckCircle, label: 'PRODUCTION_ACTIVE' };
        if (s === 'completed') return { color: 'text-electric-green', border: 'border-electric-green', bg: 'bg-electric-green/10', icon: Package, label: 'DELIVERY_READY' };
        if (s === 'rejected') return { color: 'text-red-500', border: 'border-red-500', bg: 'bg-red-500/10', icon: XCircle, label: 'REQUEST_DENIED' };
        return { color: 'text-gray-500', border: 'border-gray-500', bg: 'bg-gray-500/10', icon: AlertCircle, label: 'UNKNOWN_STATE' };
    };

    return (
        <div className="min-h-screen bg-render-black text-white p-4 md:p-12 font-sans relative overflow-hidden">
            {/* Background Ambience */}
            <div className="fixed inset-0 grid-bg opacity-30 pointer-events-none" />
            <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-electric-blue to-transparent opacity-50" />

            <div className="max-w-3xl mx-auto relative z-10 space-y-12 mt-20">
                {/* Header */}
                <div className="space-y-4">
                    <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors uppercase tracking-widest text-xs font-bold mb-4">
                        <ArrowLeft size={16} /> Return to Base
                    </Link>
                    <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
                        Signal_Trace
                    </h1>
                    <p className="text-electric-blue font-mono text-sm tracking-widest uppercase border-l-2 border-electric-blue pl-4">
                        Secure Asset Tracking Protocol // Public Access
                    </p>
                </div>

                {/* Input Section */}
                <div className="bg-render-dark border border-white/10 p-8 md:p-12 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Search size={120} />
                    </div>

                    <form onSubmit={handleTrack} className="relative z-10 space-y-8">
                        <div className="space-y-2">
                            <label className="block text-gray-500 font-bold uppercase tracking-widest text-xs">Enter Access Key</label>
                            <input
                                type="text"
                                value={accessKey}
                                onChange={(e) => setAccessKey(e.target.value)}
                                placeholder="XXXX-XXXX-XXXX"
                                className="w-full bg-black/50 border-b-2 border-white/20 p-4 text-2xl md:text-4xl font-mono text-white placeholder-gray-700 focus:outline-none focus:border-electric-blue transition-colors uppercase"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-white text-black font-black uppercase italic tracking-tighter py-4 px-10 text-xl hover:bg-electric-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-4"
                        >
                            {loading ? 'TRACING_SIGNAL...' : 'INITIATE_TRACE'}
                            {!loading && <Search size={20} strokeWidth={3} />}
                        </button>
                    </form>
                </div>

                {/* Result Display */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 p-6 text-red-500 font-mono flex items-center gap-4 animate-pulse">
                        <AlertCircle />
                        {error}
                    </div>
                )}

                {trackingData && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-500">
                        <div className="flex items-center gap-4 text-gray-500 text-xs font-bold uppercase tracking-widest">
                            <div className="h-px flex-1 bg-white/10" />
                            Target Located
                            <div className="h-px flex-1 bg-white/10" />
                        </div>

                        <div className="bg-render-dark border border-white/10 p-8 grid md:grid-cols-2 gap-8 relative">
                            {/* Status Indicator */}
                            {(() => {
                                const badge = getStatusBadge(trackingData.status);
                                const Icon = badge.icon;
                                return (
                                    <div className={`md:col-span-2 ${badge.bg} ${badge.border} border p-6 flex items-center justify-between`}>
                                        <div className="flex items-center gap-4">
                                            <Icon size={32} className={badge.color} />
                                            <div>
                                                <div className={`${badge.color} font-black uppercase text-2xl italic tracking-tighter`}>{badge.label}</div>
                                                <div className="text-gray-400 text-xs font-mono uppercase">Current Status</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-white font-mono text-sm">{new Date(trackingData.timestamp).toLocaleDateString()}</div>
                                            <div className="text-gray-500 text-xs font-bold uppercase tracking-wider">Last Update</div>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Details */}
                            <div className="space-y-1">
                                <div className="text-gray-500 text-xs font-bold uppercase tracking-widest">Operation ID</div>
                                <div className="text-white font-mono text-lg truncate">{trackingData.id} // {trackingData.Access_Key || accessKey}</div>
                            </div>

                            <div className="space-y-1">
                                <div className="text-gray-500 text-xs font-bold uppercase tracking-widest">Operator</div>
                                <div className="text-white font-black italic uppercase tracking-tighter text-xl">{trackingData.operator_name}</div>
                            </div>

                            <div className="space-y-1">
                                <div className="text-gray-500 text-xs font-bold uppercase tracking-widest">Target Character</div>
                                <div className="text-white font-black italic uppercase tracking-tighter text-2xl text-electric-blue">{trackingData.character_name}</div>
                            </div>

                            <div className="space-y-1">
                                <div className="text-gray-500 text-xs font-bold uppercase tracking-widest">Source Series</div>
                                <div className="text-white font-bold uppercase tracking-wide text-lg">{trackingData.series_source}</div>
                            </div>
                        </div>

                        {/* Visual Timeline (Static for now, can be dynamic later) */}
                        <div className="flex justify-between items-center px-4 pt-8 opacity-50">
                            {['Pending', 'Approved', 'Completed'].map((s, i) => {
                                const currentStatus = trackingData.status.toLowerCase();
                                const steps = ['pending', 'approved', 'completed'];
                                const currentIndex = steps.indexOf(currentStatus);
                                const isActive = i <= currentIndex;

                                return (
                                    <div key={s} className="flex flex-col items-center gap-2">
                                        <div className={`w-4 h-4 rounded-full ${isActive ? 'bg-white' : 'bg-white/20'}`} />
                                        <div className="text-[10px] uppercase font-bold tracking-widest font-mono">{s}</div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeliveryTracking;
