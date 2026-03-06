'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';

export default function Home() {
  const token = useAuthStore((s) => s.token);
  const hydrate = useAuthStore((s) => s.hydrate);
  const hydrated = useAuthStore((s) => s._hydrated);
  const router = useRouter();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!hydrated) return;
    router.replace(token ? '/dashboard' : '/login');
  }, [hydrated, token, router]);

  return null;
}
