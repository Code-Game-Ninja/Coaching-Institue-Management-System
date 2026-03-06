'use client';
import { useEffect, useState } from 'react';
import useThemeStore from '@/store/themeStore';

export default function ThemeProvider({ children }) {
    const theme = useThemeStore((s) => s.theme);
    const hydrate = useThemeStore((s) => s.hydrate);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        hydrate();
        setMounted(true);
    }, [hydrate]);

    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [theme]);

    if (!mounted) {
        return <div style={{ visibility: 'hidden' }}>{children}</div>;
    }

    return children;
}
