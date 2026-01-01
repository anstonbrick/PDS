import React, { useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';

const FAB = () => {
    return (
        <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-request-drawer'))}
            className="fixed bottom-8 right-8 z-40 bg-electric-blue hover:bg-white text-black p-4 rounded-full shadow-[0_0_20px_rgba(0,240,255,0.5)] hover:shadow-[0_0_30px_rgba(255,255,255,0.6)] transition-all duration-300 group animate-pulse-slow"
        >
            <Sparkles size={28} className="group-hover:rotate-12 transition-transform duration-300" />
            <span className="sr-only">Start Request</span>
        </button>
    );
};

export default FAB;
