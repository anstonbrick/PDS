import { useCallback } from 'react';

const useTextDecrypter = () => {
    const triggerDecode = useCallback((e) => {
        const target = e.target;
        const originalText = target.dataset.value || target.innerText;
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*";
        let iteration = 0;

        clearInterval(target.interval);

        target.interval = setInterval(() => {
            target.innerText = originalText
                .split("")
                .map((letter, index) => {
                    if (index < iteration) return originalText[index];
                    return letters[Math.floor(Math.random() * letters.length)];
                })
                .join("");

            if (iteration >= originalText.length) {
                clearInterval(target.interval);
            }

            iteration += 1 / 3;
        }, 30);
    }, []);

    return triggerDecode;
};

export default useTextDecrypter;
