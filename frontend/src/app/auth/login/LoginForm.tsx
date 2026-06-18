'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Lock, Eye, EyeOff, User, Phone, ArrowRight, CheckCircle2 } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const loginSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

const registerSchema = z.object({
  firstName: z.string().min(2, { message: 'First name required' }),
  lastName: z.string().min(1, { message: 'Last name required' }),
  email: z.string().email({ message: 'Enter a valid email address' }),
  phone: z.string().optional(),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

const inputClass =
  'w-full rounded-lg border bg-white py-3 pl-11 pr-4 text-sm outline-none transition-all placeholder-gray-400 text-gray-800 focus:border-gray-400 focus:ring-2 focus:ring-gray-100';
const errorClass = 'mt-1.5 text-[11px] text-red-500 font-medium';

function FieldError({ msg }: { msg?: string }) {
  return msg ? <p className={errorClass}>{msg}</p> : null;
}

export default function LoginForm() {
  const [activeTab, setActiveTab] = React.useState<'signin' | 'register'>('signin');
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  const router = useRouter();
  const setTokens = useAuthStore((s) => s.setTokens);
  const setUser = useAuthStore((s) => s.setUser);

  const {
    register: loginReg,
    handleSubmit: handleLogin,
    formState: { errors: loginErrors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const {
    register: regReg,
    handleSubmit: handleRegister,
    formState: { errors: regErrors },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

  const clearMessages = () => { setErrorMsg(null); setSuccessMsg(null); };

  const redirect = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('redirect') || '/';
  };

  const onLogin = async (data: LoginFormData) => {
    setIsLoading(true); clearMessages();
    try {
      const res = await api.post('/auth/login', data);
      const { user, accessToken } = res.data.data;
      setTokens(accessToken);
      setUser(user);
      setSuccessMsg('Welcome back! Redirecting…');
      setTimeout(() => router.push(redirect()), 1000);
    } catch (e: any) {
      setErrorMsg(e.response?.data?.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const onRegister = async (data: RegisterFormData) => {
    setIsLoading(true); clearMessages();
    try {
      const res = await api.post('/auth/register', data);
      const { user, accessToken } = res.data.data;
      setTokens(accessToken);
      setUser(user);
      setSuccessMsg('Account created! Check your email for a welcome message 🎉');
      setTimeout(() => router.push(redirect()), 1400);
    } catch (e: any) {
      setErrorMsg(e.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">

      {/* Heading */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#1a1a1a', letterSpacing: '-0.02em' }}>
          {activeTab === 'signin' ? 'Welcome back' : 'Create account'}
        </h1>
        <p className="text-sm" style={{ color: '#999' }}>
          {activeTab === 'signin'
            ? 'Sign in to continue shopping'
            : 'Join the our nara community'}
        </p>
      </div>

      {/* Tab toggle */}
      <div
        className="flex rounded-full p-1 mb-8 w-full"
        style={{ backgroundColor: '#f0eee9' }}
      >
        {(['signin', 'register'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => { setActiveTab(tab); clearMessages(); }}
            className="flex-1 rounded-full py-2.5 text-xs font-semibold transition-all"
            style={{
              backgroundColor: activeTab === tab ? '#fff' : 'transparent',
              color: activeTab === tab ? '#1a1a1a' : '#888',
              boxShadow: activeTab === tab ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              letterSpacing: '0.01em',
            }}
          >
            {tab === 'signin' ? 'Sign In' : 'Register'}
          </button>
        ))}
      </div>

      {/* Success / Error banners */}
      {successMsg && (
        <div className="mb-5 flex items-center gap-2.5 rounded-xl bg-green-50 border border-green-100 px-4 py-3">
          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
          <p className="text-xs font-medium text-green-700">{successMsg}</p>
        </div>
      )}
      {errorMsg && (
        <div className="mb-5 rounded-xl bg-red-50 border border-red-100 px-4 py-3">
          <p className="text-xs font-medium text-red-600">{errorMsg}</p>
        </div>
      )}

      {/* ── Sign In Form ── */}
      {activeTab === 'signin' && (
        <form onSubmit={handleLogin(onLogin)} className="space-y-4">
          {/* Email */}
          <div>
            <div className="relative">
              <span className="absolute inset-y-0 left-3.5 flex items-center" style={{ color: '#aaa' }}>
                <Mail className="h-4 w-4" />
              </span>
              <input
                id="login-email"
                type="email"
                placeholder="Email address"
                className={inputClass}
                style={{ borderColor: loginErrors.email ? '#fca5a5' : '#e5e5e5' }}
                disabled={isLoading}
                {...loginReg('email')}
              />
            </div>
            <FieldError msg={loginErrors.email?.message} />
          </div>

          {/* Password */}
          <div>
            <div className="relative">
              <span className="absolute inset-y-0 left-3.5 flex items-center" style={{ color: '#aaa' }}>
                <Lock className="h-4 w-4" />
              </span>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                className={inputClass}
                style={{ borderColor: loginErrors.password ? '#fca5a5' : '#e5e5e5', paddingRight: '44px' }}
                disabled={isLoading}
                {...loginReg('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3.5 flex items-center hover:opacity-70 transition-opacity"
                style={{ color: '#aaa' }}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <FieldError msg={loginErrors.password?.message} />
          </div>

          {/* Forgot password */}
          <div className="flex justify-end">
            <Link href="/auth/forgot-password" className="text-xs font-medium hover:underline" style={{ color: '#888' }}>
              Forgot password?
            </Link>
          </div>

          {/* Submit */}
          <button
            id="login-submit"
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: '#1a1a1a', letterSpacing: '0.01em' }}
          >
            {isLoading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>Sign In <ArrowRight className="h-4 w-4" /></>
            )}
          </button>
        </form>
      )}

      {/* ── Register Form ── */}
      {activeTab === 'register' && (
        <form onSubmit={handleRegister(onRegister)} className="space-y-4">
          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="relative">
                <span className="absolute inset-y-0 left-3.5 flex items-center" style={{ color: '#aaa' }}>
                  <User className="h-4 w-4" />
                </span>
                <input
                  id="reg-firstName"
                  placeholder="First name"
                  className={inputClass}
                  style={{ borderColor: regErrors.firstName ? '#fca5a5' : '#e5e5e5' }}
                  disabled={isLoading}
                  {...regReg('firstName')}
                />
              </div>
              <FieldError msg={regErrors.firstName?.message} />
            </div>
            <div>
              <input
                id="reg-lastName"
                placeholder="Last name"
                className={inputClass}
                style={{ paddingLeft: '16px', borderColor: regErrors.lastName ? '#fca5a5' : '#e5e5e5' }}
                disabled={isLoading}
                {...regReg('lastName')}
              />
              <FieldError msg={regErrors.lastName?.message} />
            </div>
          </div>

          {/* Email */}
          <div>
            <div className="relative">
              <span className="absolute inset-y-0 left-3.5 flex items-center" style={{ color: '#aaa' }}>
                <Mail className="h-4 w-4" />
              </span>
              <input
                id="reg-email"
                type="email"
                placeholder="Email address"
                className={inputClass}
                style={{ borderColor: regErrors.email ? '#fca5a5' : '#e5e5e5' }}
                disabled={isLoading}
                {...regReg('email')}
              />
            </div>
            <FieldError msg={regErrors.email?.message} />
          </div>

          {/* Phone */}
          <div className="relative">
            <span className="absolute inset-y-0 left-3.5 flex items-center" style={{ color: '#aaa' }}>
              <Phone className="h-4 w-4" />
            </span>
            <input
              id="reg-phone"
              type="tel"
              placeholder="Phone number (optional)"
              className={inputClass}
              style={{ borderColor: '#e5e5e5' }}
              disabled={isLoading}
              {...regReg('phone')}
            />
          </div>

          {/* Password */}
          <div>
            <div className="relative">
              <span className="absolute inset-y-0 left-3.5 flex items-center" style={{ color: '#aaa' }}>
                <Lock className="h-4 w-4" />
              </span>
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password (min. 6 characters)"
                className={inputClass}
                style={{ borderColor: regErrors.password ? '#fca5a5' : '#e5e5e5', paddingRight: '44px' }}
                disabled={isLoading}
                {...regReg('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3.5 flex items-center hover:opacity-70 transition-opacity"
                style={{ color: '#aaa' }}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <FieldError msg={regErrors.password?.message} />
          </div>

          {/* Submit */}
          <button
            id="register-submit"
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: '#1a1a1a', letterSpacing: '0.01em' }}
          >
            {isLoading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>Create Account <ArrowRight className="h-4 w-4" /></>
            )}
          </button>

          <p className="text-center text-[11px]" style={{ color: '#bbb' }}>
            You'll receive a welcome email after signing up.
          </p>
        </form>
      )}
    </div>
  );
}
