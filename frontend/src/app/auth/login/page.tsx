import { Metadata } from 'next';
import LoginForm from './LoginForm';

export const metadata: Metadata = {
  title: 'Sign In — our nara',
  description: 'Sign in to your our nara account to shop premium K-Beauty skincare.',
};

export default function LoginPage() {
  return (
    <div
      className="min-h-screen w-full flex"
      style={{ backgroundColor: '#fafaf8', fontFamily: 'Inter, sans-serif' }}
    >
      {/* Left panel — decorative (hidden on mobile) */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12"
        style={{ backgroundColor: '#dde5ef' }}
      >
        {/* Background image */}
        <img
          src="/hero_slide_1.png"
          alt="our nara skincare"
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{ opacity: 0.85 }}
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(20,20,20,0.55) 0%, transparent 55%)' }}
        />

        {/* Logo top-left */}
        <div className="relative z-10 flex items-center gap-2">
          <svg width="30" height="30" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="32" cy="38" rx="18" ry="11" transform="rotate(-35 32 38)" fill="#fff" opacity="0.9"/>
            <ellipse cx="48" cy="38" rx="18" ry="11" transform="rotate(35 48 38)" fill="#e8e0d0" opacity="0.85"/>
            <ellipse cx="40" cy="38" rx="7" ry="9" fill="#fff" opacity="0.6"/>
          </svg>
          <span style={{ fontFamily: 'Georgia, serif', fontSize: '16px', letterSpacing: '0.14em', color: '#fff' }}>
            our nara
          </span>
        </div>

        {/* Bottom quote */}
        <div className="relative z-10">
          <p className="text-white text-2xl font-bold leading-snug mb-2">
            Nature in every<br />drop of care.
          </p>
          <p className="text-white/70 text-sm">
            Premium K-Beauty skincare, curated for radiant skin.
          </p>
        </div>
      </div>

      {/* Right panel — auth forms */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 lg:px-16">

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-10">
          <svg width="28" height="28" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="32" cy="38" rx="18" ry="11" transform="rotate(-35 32 38)" fill="#C8B89A" opacity="0.9"/>
            <ellipse cx="48" cy="38" rx="18" ry="11" transform="rotate(35 48 38)" fill="#B8A88A" opacity="0.85"/>
            <ellipse cx="40" cy="38" rx="7" ry="9" fill="#D4C4A8" opacity="0.6"/>
          </svg>
          <span style={{ fontFamily: 'Georgia, serif', fontSize: '16px', letterSpacing: '0.14em', color: '#1a1a1a' }}>
            our nara
          </span>
        </div>

        <div className="w-full max-w-sm">
          <LoginForm />

          <p className="text-center text-[11px] text-gray-400 mt-8 leading-relaxed">
            By continuing, you agree to our{' '}
            <a href="/terms" className="text-gray-600 hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" className="text-gray-600 hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
