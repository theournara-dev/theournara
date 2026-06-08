'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Phone, Lock, Eye, EyeOff, User, Sparkles } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

const loginSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

const registerSchema = z.object({
  firstName: z.string().min(2, { message: 'First name must be at least 2 characters' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  email: z.string().email({ message: 'Enter a valid email address' }),
  phone: z.string().optional(),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function LoginForm() {
  const [activeTab, setActiveTab] = React.useState<number>(0); // 0 = Sign In, 1 = Register, 2 = Verify
  const [loginMode, setLoginMode] = React.useState<'email' | 'phone'>('email');
  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
  
  const router = useRouter();
  const setTokens = useAuthStore((state) => state.setTokens);
  const setUser = useAuthStore((state) => state.setUser);

  // Sign In Form
  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
    reset: resetLoginForm
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Register Form
  const {
    register: regRegister,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: regErrors },
    reset: resetRegForm
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  // OTP Verification state
  const [otpCode, setOtpCode] = React.useState('');

  const onLoginSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const response = await api.post('/auth/login', data);
      const { user, accessToken } = response.data.data;
      
      setTokens(accessToken);
      setUser(user);
      setSuccessMsg('Logged in successfully! 🎉');
      
      const searchParams = new URLSearchParams(window.location.search);
      const redirect = searchParams.get('redirect') || '/';
      
      setTimeout(() => {
        router.push(redirect);
      }, 1000);
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const onRegisterSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const response = await api.post('/auth/register', data);
      const { user, accessToken } = response.data.data;
      
      setTokens(accessToken);
      setUser(user);
      setSuccessMsg('Account created successfully! Welcome 🎉');
      
      const searchParams = new URLSearchParams(window.location.search);
      const redirect = searchParams.get('redirect') || '/';
      
      setTimeout(() => {
        router.push(redirect);
      }, 1200);
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length < 4) {
      setErrorMsg('Please enter a valid verification code');
      return;
    }
    setSuccessMsg('Verification successful! You can now browse the store. 🎉');
    
    const searchParams = new URLSearchParams(window.location.search);
    const redirect = searchParams.get('redirect') || '/';
    
    setTimeout(() => {
      router.push(redirect);
    }, 1200);
  };

  return (
    <div className="w-full">
      {/* Tab Switcher */}
      <div className="flex border-b border-gray-100 mb-6">
        <button
          onClick={() => { setActiveTab(0); setErrorMsg(null); setSuccessMsg(null); }}
          className={`flex-1 text-center py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 0
              ? 'border-purple-950 text-purple-950 font-extrabold'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => { setActiveTab(1); setErrorMsg(null); setSuccessMsg(null); }}
          className={`flex-1 text-center py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 1
              ? 'border-purple-950 text-purple-950 font-extrabold'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          Register
        </button>
        <button
          onClick={() => { setActiveTab(2); setErrorMsg(null); setSuccessMsg(null); }}
          className={`flex-1 text-center py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 2
              ? 'border-purple-950 text-purple-950 font-extrabold'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          Verify
        </button>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="rounded-xl bg-red-50 border border-red-100 p-3.5 mb-4 text-xs font-bold text-red-600 text-center animate-in fade-in duration-150">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="rounded-xl bg-green-50 border border-green-100 p-3.5 mb-4 text-xs font-bold text-green-600 text-center animate-in fade-in duration-150">
          {successMsg}
        </div>
      )}

      {/* ===== Sign In Tab ===== */}
      {activeTab === 0 && (
        <form onSubmit={handleLoginSubmit(onLoginSubmit)} className="space-y-4">
          
          {/* Email / Phone selector */}
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => setLoginMode('email')}
              className={`flex-1 flex justify-center items-center gap-1.5 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                loginMode === 'email'
                  ? 'bg-purple-950 border-purple-950 text-white shadow-md'
                  : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Mail className="h-4.5 w-4.5" />
              Email
            </button>
            <button
              type="button"
              onClick={() => setLoginMode('phone')}
              className={`flex-1 flex justify-center items-center gap-1.5 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                loginMode === 'phone'
                  ? 'bg-purple-950 border-purple-950 text-white shadow-md'
                  : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Phone className="h-4.5 w-4.5" />
              Phone
            </button>
          </div>

          {loginMode === 'email' ? (
            <div className="relative">
              <span className="absolute inset-y-0 left-3.5 flex items-center text-gray-400">
                <Mail className="h-4.5 w-4.5" />
              </span>
              <input
                id="email"
                type="email"
                placeholder="Email Address"
                className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm outline-none placeholder-gray-400 focus:border-purple-950/30 transition-colors"
                disabled={isLoading}
                {...loginRegister('email')}
              />
              {loginErrors.email && (
                <p className="mt-1 text-[10px] font-bold text-red-500">{loginErrors.email.message}</p>
              )}
            </div>
          ) : (
            <div className="relative">
              <span className="absolute inset-y-0 left-3.5 flex items-center text-gray-400">
                <Phone className="h-4.5 w-4.5" />
              </span>
              <input
                id="phone"
                type="tel"
                placeholder="Phone Number"
                className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm outline-none placeholder-gray-400 focus:border-purple-950/30 transition-colors"
                disabled={isLoading}
              />
            </div>
          )}

          <div className="relative">
            <span className="absolute inset-y-0 left-3.5 flex items-center text-gray-400">
              <Lock className="h-4.5 w-4.5" />
            </span>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-11 text-sm outline-none placeholder-gray-400 focus:border-purple-950/30 transition-colors"
              disabled={isLoading}
              {...loginRegister('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3.5 flex items-center text-gray-400 hover:text-purple-950"
            >
              {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
            </button>
            {loginErrors.password && (
              <p className="mt-1 text-[10px] font-bold text-red-500">{loginErrors.password.message}</p>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => alert('Forgot password OTP code sent! 📩')}
              className="text-xs font-bold text-pink-500 hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-gradient-to-r from-purple-950 to-purple-900 py-3.5 text-sm font-extrabold text-white shadow-xl hover:from-purple-900 hover:to-purple-850 hover:shadow-2xl transition-all cursor-pointer flex justify-center items-center"
          >
            {isLoading ? (
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : null}
            Sign In
          </button>
        </form>
      )}

      {/* ===== Register Tab ===== */}
      {activeTab === 1 && (
        <form onSubmit={handleRegisterSubmit(onRegisterSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <span className="absolute inset-y-0 left-3.5 flex items-center text-gray-400">
                <User className="h-4.5 w-4.5" />
              </span>
              <input
                id="firstName"
                placeholder="First Name"
                className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm outline-none placeholder-gray-400 focus:border-purple-950/30 transition-colors"
                disabled={isLoading}
                {...regRegister('firstName')}
              />
              {regErrors.firstName && (
                <p className="mt-1 text-[10px] font-bold text-red-500">{regErrors.firstName.message}</p>
              )}
            </div>

            <div className="relative">
              <input
                id="lastName"
                placeholder="Last Name"
                className="w-full rounded-xl border border-gray-200 bg-white py-3 px-4 text-sm outline-none placeholder-gray-400 focus:border-purple-950/30 transition-colors"
                disabled={isLoading}
                {...regRegister('lastName')}
              />
              {regErrors.lastName && (
                <p className="mt-1 text-[10px] font-bold text-red-500">{regErrors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="relative">
            <span className="absolute inset-y-0 left-3.5 flex items-center text-gray-400">
              <Mail className="h-4.5 w-4.5" />
            </span>
            <input
              id="regEmail"
              type="email"
              placeholder="Email Address"
              className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm outline-none placeholder-gray-400 focus:border-purple-950/30 transition-colors"
              disabled={isLoading}
              {...regRegister('email')}
            />
            {regErrors.email && (
              <p className="mt-1 text-[10px] font-bold text-red-500">{regErrors.email.message}</p>
            )}
          </div>

          <div className="relative">
            <span className="absolute inset-y-0 left-3.5 flex items-center text-gray-400">
              <Phone className="h-4.5 w-4.5" />
            </span>
            <input
              id="regPhone"
              type="tel"
              placeholder="Phone Number (Optional)"
              className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm outline-none placeholder-gray-400 focus:border-purple-950/30 transition-colors"
              disabled={isLoading}
              {...regRegister('phone')}
            />
          </div>

          <div className="relative">
            <span className="absolute inset-y-0 left-3.5 flex items-center text-gray-400">
              <Lock className="h-4.5 w-4.5" />
            </span>
            <input
              id="regPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-11 text-sm outline-none placeholder-gray-400 focus:border-purple-950/30 transition-colors"
              disabled={isLoading}
              {...regRegister('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3.5 flex items-center text-gray-400 hover:text-purple-950"
            >
              {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
            </button>
            {regErrors.password && (
              <p className="mt-1 text-[10px] font-bold text-red-500">{regErrors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-gradient-to-r from-purple-950 to-purple-900 py-3.5 text-sm font-extrabold text-white shadow-xl hover:from-purple-900 hover:to-purple-850 hover:shadow-2xl transition-all cursor-pointer flex justify-center items-center"
          >
            {isLoading ? (
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : null}
            Create Account
          </button>
        </form>
      )}

      {/* ===== Verify Tab ===== */}
      {activeTab === 2 && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="relative">
            <span className="absolute inset-y-0 left-3.5 flex items-center text-gray-400">
              <Mail className="h-4.5 w-4.5" />
            </span>
            <input
              type="text"
              placeholder="Email or Phone Number"
              className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm outline-none placeholder-gray-400 focus:border-purple-950/30 transition-colors"
            />
          </div>

          <div className="flex flex-col items-center">
            <label className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Enter 6-Digit OTP</label>
            <input
              type="text"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              className="w-48 text-center rounded-xl border border-gray-200 py-3 text-lg font-black tracking-widest outline-none focus:border-purple-950/30"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-purple-950 to-purple-900 py-3.5 text-sm font-extrabold text-white shadow-xl hover:from-purple-900 hover:to-purple-850 hover:shadow-2xl transition-all cursor-pointer"
          >
            Verify OTP
          </button>
        </form>
      )}
    </div>
  );
}
