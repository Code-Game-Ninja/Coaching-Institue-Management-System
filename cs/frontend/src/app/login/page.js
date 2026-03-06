'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { authAPI } from '@/lib/api';
import useAuthStore from '@/store/authStore';

const loginImages = ['/images/login-1.png', '/images/login-2.png', '/images/login-3.png'];
const quotes = [
  { text: 'Education is the most powerful weapon which you can use to change the world.', author: 'Nelson Mandela' },
  { text: 'The beautiful thing about learning is that nobody can take it away from you.', author: 'B.B. King' },
  { text: 'An investment in knowledge pays the best interest.', author: 'Benjamin Franklin' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);
  const login = useAuthStore((s) => s.login);
  const router = useRouter();

  // Shuffle images every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setImgIndex((prev) => (prev + 1) % loginImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.login({ email, password });
      login(res.data.admin, res.data.token);
      toast.success('Welcome back!');
      router.replace('/dashboard');
    } catch (err) {
      toast.error(err?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left — Image Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#0a0f1e]">
        <AnimatePresence mode="wait">
          <motion.div
            key={imgIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={loginImages[imgIndex]}
              alt="Education"
              fill
              className="object-cover opacity-60"
              priority
            />
          </motion.div>
        </AnimatePresence>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e] via-[#0a0f1e]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0f1e]/60 to-transparent" />

        {/* Quote */}
        <div className="relative z-10 flex flex-col justify-end p-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={imgIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <p className="text-xl font-light text-white/80 italic leading-relaxed max-w-md">
                "{quotes[imgIndex].text}"
              </p>
              <p className="mt-3 text-sm font-medium text-accent-400">— {quotes[imgIndex].author}</p>
            </motion.div>
          </AnimatePresence>

          {/* Image dots */}
          <div className="flex gap-2 mt-8">
            {loginImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setImgIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === imgIndex ? 'w-8 bg-accent-400' : 'w-3 bg-white/20 hover:bg-white/40'}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right — Login Form */}
      <div className="flex flex-1 items-center justify-center p-6 bg-[var(--bg)]">
        <div className="w-full max-w-[400px]" style={{ animation: 'fadeIn 0.5s ease-out' }}>
          {/* Logo */}
          <div className="mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-500 to-primary-500 shadow-lg shadow-accent-500/20">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <h1 className="mt-5 text-2xl font-bold tracking-tight text-[var(--text-primary)]">Welcome back</h1>
            <p className="mt-1.5 text-sm text-[var(--text-muted)]">Sign in to your coaching dashboard</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@cidms.com"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 pr-12 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="group w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent-600 to-primary-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-accent-500/20 transition-all duration-200 hover:shadow-xl hover:shadow-accent-500/30 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {loading ? 'Signing in...' : (
                <>Sign in <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-[var(--text-muted)]">
            Coaching Institute Data Management System
          </p>
        </div>
      </div>
    </div>
  );
}
