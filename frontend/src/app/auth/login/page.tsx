import { Metadata } from 'next';
import LoginForm from './LoginForm';
import { Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Welcome Back - EcomBeauty',
  description: 'Sign in to discover premium beauty',
};

export default function LoginPage() {
  return (
    <div className="min-h-[85vh] w-full bg-gradient-to-br from-[#eee8ff] via-[#f8f7ff] to-[#ffe8e8] flex items-center justify-center py-10 px-4 sm:px-6">
      
      {/* Outer Card Wrapper */}
      <div className="w-full max-w-md bg-white/95 border border-purple-950/5 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-md animate-in zoom-in-95 duration-200">
        
        {/* Logo and Description */}
        <div className="text-center mb-6">
          <div className="mx-auto h-14 w-14 rounded-full bg-gradient-to-tr from-purple-950 to-pink-500 flex items-center justify-center mb-3.5 shadow-md">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 leading-tight">Welcome Back</h1>
          <p className="text-xs text-gray-400 mt-1">Sign in to discover premium beauty</p>
        </div>

        {/* Tabbed Auth Forms */}
        <LoginForm />

        {/* Footer info */}
        <p className="text-center text-[10px] text-gray-400 mt-8 leading-relaxed px-4">
          By continuing, you agree to our{' '}
          <a href="/terms" className="font-bold text-gray-600 hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="font-bold text-gray-600 hover:underline">
            Privacy Policy
          </a>
          .
        </p>

      </div>
    </div>
  );
}
