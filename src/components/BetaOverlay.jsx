import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

const BetaOverlay = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const { t } = useTranslation();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        setSending(true);
        try {
            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            });
            if (response.ok) {
                setSent(true);
                setMessage('');
                setTimeout(() => {
                    setSent(false);
                    setIsOpen(false);
                }, 2000);
            }
        } catch (error) {
            console.error('Failed to send feedback');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999]">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        className="absolute bottom-16 right-0 w-80 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden"
                    >
                        <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
                            <h3 className="font-bold text-sm text-electric-blue">{t('beta.title')}</h3>
                            <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white">
                                <X size={16} />
                            </button>
                        </div>

                        {sent ? (
                            <div className="p-8 text-center">
                                <div className="text-green-500 mb-2">{t('beta.successTitle')}</div>
                                <div className="text-xs text-zinc-500">{t('beta.successDesc')}</div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="p-4">
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder={t('beta.placeholder')}
                                    className="w-full bg-black/50 border border-zinc-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-electric-blue/50 min-h-[100px] resize-none mb-3 placeholder:text-zinc-600"
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    disabled={sending || !message.trim()}
                                    className="w-full bg-electric-blue/10 hover:bg-electric-blue/20 text-electric-blue border border-electric-blue/20 rounded-lg py-2 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {sending ? t('beta.sending') : <><Send size={14} /> {t('beta.send')}</>}
                                </button>
                            </form>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white rounded-full px-4 py-3 shadow-lg flex items-center gap-3 group"
            >
                <div className="relative">
                    <MessageSquare size={20} className="text-electric-blue" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-electric-blue rounded-full animate-pulse" />
                </div>
                <span className="font-bold text-sm pr-1">{t('beta.title')}</span>
            </motion.button>
        </div>
    );
};

export default BetaOverlay;
