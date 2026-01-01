import React, { useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';

const FAB = () => {
    return (
        <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-request-drawer'))}
            className="fixed bottom-8 right-8 z-40 bg-white border-4 border-electric-blue text-black p-4 transition-all duration-200 group flat-shadow hover:bg-electric-blue hover:text-white hover:-translate-y-1 active:translate-y-0"
        >
            <div className="flex items-center gap-3">
                <Sparkles size={28} strokeWidth={3} className="group-hover:rotate-45 transition-transform duration-300" />
                <span className="font-black uppercase tracking-tighter italic text-xl hidden md:block">START_REQUEST</span>
            </div>
        </button>
    );
};

export default FAB;
