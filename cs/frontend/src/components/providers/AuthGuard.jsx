'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';

export default function AuthGuard({ children }) {
    const token = useAuthStore((s) => s.token);
    const hydrate = useAuthStore((s) => s.hydrate);
    const hydrated = useAuthStore((s) => s._hydrated);
    const router = useRouter();
    const [ready, setReady] = useState(false);

    useEffect(() => {
        hydrate();
    }, [hydrate]);

    useEffect(() => {
        if (!hydrated) return;
        if (!token) {
            router.replace('/login');
        } else {
            setReady(true);
        }
    }, [hydrated, token, router]);

    if (!ready) return null;
    return children;
}
