import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const DashboardHome = () => {
    const [stats, setStats] = useState({ requests: 0, users: 0, referral_codes: 0 });
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('adminToken');
                const response = await fetch('/api/admin/stats', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem('adminToken');
                    localStorage.removeItem('adminUser');
                    navigate('/admin/login');
                    return;
                }

                if (response.ok) {
                    const data = await response.json();
                    setStats(data);
                }
            } catch (error) {
                console.error('Failed to fetch stats');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [navigate]);

    const cards = [
        { label: 'Total Requests', value: stats.requests, color: 'from-blue-500 to-cyan-500' },
        { label: 'Registered Users', value: stats.users, color: 'from-purple-500 to-pink-500' },
        { label: 'Active Codes', value: stats.referral_codes, color: 'from-amber-500 to-orange-500' },
    ];

    if (loading) return <div className="text-zinc-500">Loading stats...</div>;

    return (
        <div>
            <h2 className="text-3xl font-bold mb-8">Dashboard Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {cards.map((card, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl relative overflow-hidden group"
                    >
                        <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                        <h3 className="text-zinc-500 text-sm font-medium mb-1">{card.label}</h3>
                        <p className="text-4xl font-bold tracking-tight">{card.value}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default DashboardHome;
