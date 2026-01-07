import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import gsap from 'gsap';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info') => {
        const id = Date.now().toString();
        setToasts(prev => [...prev, { id, message, type }]);

        // Auto remove after 5s
        setTimeout(() => removeToast(id), 5000);
    }, []);

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed bottom-6 right-6 z-[10000] flex flex-col gap-4 pointer-events-none">
                {toasts.map(toast => (
                    <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

const ToastItem = ({ toast, onDismiss }) => {
    const ref = React.useRef(null);

    useEffect(() => {
        gsap.fromTo(ref.current,
            { x: 50, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.4, ease: "power3.out" }
        );
    }, []);

    const getStyles = () => {
        switch (toast.type) {
            case 'success': return 'border-electric-green text-electric-green bg-black/80';
            case 'error': return 'border-red-500 text-red-500 bg-black/80';
            default: return 'border-electric-blue text-electric-blue bg-black/80';
        }
    };

    const getIcon = () => {
        switch (toast.type) {
            case 'success': return <CheckCircle size={20} />;
            case 'error': return <AlertCircle size={20} />;
            default: return <Info size={20} />;
        }
    };

    return (
        <div
            ref={ref}
            className={`pointer-events-auto min-w-[300px] max-w-sm p-4 border-l-4 backdrop-blur-md shadow-2xl flex items-start gap-4 ${getStyles()}`}
        >
            <div className="mt-0.5 shrink-0">{getIcon()}</div>
            <div className="flex-1">
                <p className="font-bold uppercase tracking-wider text-sm leading-relaxed">
                    {toast.message}
                </p>
            </div>
            <button
                onClick={() => {
                    gsap.to(ref.current, {
                        x: 20, opacity: 0, duration: 0.2, onComplete: () => onDismiss(toast.id)
                    });
                }}
                className="opacity-50 hover:opacity-100 transition-opacity"
            >
                <X size={16} />
            </button>
        </div>
    );
};

export default ToastProvider;
