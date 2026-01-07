import React, { createContext, useState, useEffect } from 'react';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('en');
    const [translations, setTranslations] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    // Auto-detect language on mount
    useEffect(() => {
        const savedLang = localStorage.getItem('pds_language');
        if (savedLang) {
            setLanguage(savedLang);
        } else {
            const browserLang = navigator.language.split('-')[0];
            const supportedLangs = ['en', 'ja', 'vi'];
            if (supportedLangs.includes(browserLang)) {
                setLanguage(browserLang);
            } else {
                setLanguage('en');
            }
        }
    }, []);

    // Fetch translations when language changes
    useEffect(() => {
        const fetchTranslations = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`/translations/${language}.json`);
                if (response.ok) {
                    const data = await response.json();
                    setTranslations(data);
                } else {
                    console.error(`Failed to load translations for ${language}`);
                    // Fallback to en if current lang fails, unless we are already on en
                    if (language !== 'en') {
                        // Optional: fallback logic
                    }
                }
            } catch (error) {
                console.error('Error fetching translations:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTranslations();
        localStorage.setItem('pds_language', language);
    }, [language]);

    const changeLanguage = (lang) => {
        setLanguage(lang);
    };

    const t = (key) => {
        const keys = key.split('.');
        let value = translations;
        for (const k of keys) {
            if (value && value[k]) {
                value = value[k];
            } else {
                return key; // Return key if not found
            }
        }
        return value;
    };

    return (
        <LanguageContext.Provider value={{ language, changeLanguage, t, isLoading }}>
            {children}
        </LanguageContext.Provider>
    );
};
