import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const FeedbackViewer = () => {
    const [feedback, setFeedback] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeedback = async () => {
            try {
                const token = localStorage.getItem('adminToken');
                const response = await fetch('/api/admin/feedback', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setFeedback(data);
                }
            } catch (error) {
                console.error('Failed to fetch feedback');
            } finally {
                setLoading(false);
            }
        };
        fetchFeedback();
    }, []);

    if (loading) return <div className="text-zinc-500">Loading feedback...</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold">Beta Feedback</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {feedback.length === 0 ? (
                    <div className="col-span-full text-zinc-500 text-center py-10">
                        No feedback received yet.
                    </div>
                ) : (
                    feedback.map((item) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl hover:border-electric-blue/30 transition-colors"
                        >
                            <p className="text-zinc-300 text-sm mb-4 leading-relaxed whitespace-pre-wrap font-mono">
                                "{item.message}"
                            </p>
                            <div className="flex justify-between items-center border-t border-zinc-800 pt-3">
                                <span className="text-[10px] text-zinc-500 uppercase tracking-widest">
                                    ID: #{item.id}
                                </span>
                                <span className="text-[10px] text-electric-blue">
                                    {new Date(item.timestamp).toLocaleString()}
                                </span>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default FeedbackViewer;
