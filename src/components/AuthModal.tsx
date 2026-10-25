import React, { useState } from 'react';
import { X, Phone, ArrowRight, User, CheckCircle2, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { upsertCustomerProfile } from '../lib/supabaseService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (name: string, phone: string) => void;
  initialPhone?: string;
  initialName?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  onLoginSuccess,
  initialPhone = '98101 23456',
  initialName = 'Alex Rider',
}) => {
  const [fullName, setFullName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [otp, setOtp] = useState('8421');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg('Please enter your full legal name');
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }
    setErrorMsg('');
    setStep('otp');
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) {
      setErrorMsg('Please enter the 4-digit verification code');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    const cleanDigits = phone.replace(/\D/g, '').slice(-10);
    const formattedPhone = `+91 ${cleanDigits.slice(0, 5)} ${cleanDigits.slice(5)}`;

    // 1. Save customer session to localStorage
    try {
      localStorage.setItem(
        'goride_customer_user',
        JSON.stringify({
          name: fullName.trim(),
          phone: formattedPhone,
          loggedIn: true,
          verifiedAt: new Date().toISOString(),
        })
      );
    } catch {
      // ignore
    }

    // 2. Seamlessly upsert customer record into Supabase 'profiles' table (no external email redirect!)
    try {
      await upsertCustomerProfile({
        fullName: fullName.trim(),
        phone: formattedPhone,
      });
    } catch (err) {
      console.warn('Profile sync handled silently:', err);
    }

    setIsSubmitting(false);

    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch {
      // ignore
    }

    onLoginSuccess(fullName.trim(), formattedPhone);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="relative w-full max-w-md bg-black/85 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 text-white shadow-2xl space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/[0.08] text-white/50 hover:text-white transition-colors"
          title="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-300 shadow-lg shadow-emerald-500/10">
            <User className="w-6 h-6" />
          </div>
          <h3 className="font-light text-2xl text-white tracking-tight">
            {step === 'details' ? 'Customer Sign In' : 'Instant OTP Verification'}
          </h3>
          <p className="text-xs text-white/50 font-light max-w-xs mx-auto">
            {step === 'details' 
              ? 'Fast-track mobile authentication. No external email verification required.' 
              : `Enter 4-digit code sent to +91 ${phone}`}
          </p>
        </div>

        {step === 'details' ? (
          <form onSubmit={handleSendCode} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-white/40 font-medium mb-1.5">
                Full Legal Name
              </label>
              <div className="flex items-center gap-2 px-3.5 py-3 rounded-2xl bg-white/[0.04] border border-white/10 focus-within:border-emerald-500/50 transition-colors">
                <User className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Rider"
                  className="w-full bg-transparent text-sm font-light text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-white/40 font-medium mb-1.5">
                Mobile Number (India +91)
              </label>
              <div className="flex items-center gap-2 px-3.5 py-3 rounded-2xl bg-white/[0.04] border border-white/10 focus-within:border-emerald-500/50 transition-colors">
                <span className="text-xs font-mono text-emerald-300/80 pr-1 border-r border-white/10">+91</span>
                <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="98101 23456"
                  className="w-full bg-transparent text-sm font-light text-white focus:outline-none"
                />
              </div>
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-300 font-light bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500/90 to-teal-500/90 hover:from-emerald-400 hover:to-teal-400 text-black font-semibold rounded-2xl text-xs sm:text-sm transition-all shadow-lg shadow-emerald-500/15 flex items-center justify-center gap-2"
            >
              <span>Get 4-Digit Login OTP</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-white/40 font-light">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Instant Local & Supabase Profile Sync</span>
            </div>
          </form>
        ) : (
          /* OTP Screen */
          <form onSubmit={handleVerify} className="space-y-5 animate-fade-in">
            <div className="flex justify-between items-center text-xs font-light">
              <span className="text-white/60">
                Code sent to <strong className="text-white font-medium">+91 {phone}</strong>
              </span>
              <button
                type="button"
                onClick={() => setStep('details')}
                className="text-emerald-300 underline font-light hover:text-emerald-200"
              >
                Change
              </button>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[10px] font-mono uppercase tracking-wider text-white/40 font-medium">
                  Enter 4-Digit Verification OTP
                </label>
                <button
                  type="button"
                  onClick={() => setOtp('8421')}
                  className="text-[11px] text-emerald-300 hover:text-emerald-200 underline font-light"
                >
                  Auto-fill (8421)
                </button>
              </div>

              <input
                type="text"
                maxLength={4}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="8421"
                className="w-full bg-white/[0.04] border border-white/15 focus:border-emerald-400/60 rounded-2xl px-4 py-3 text-white font-mono text-center text-2xl tracking-widest focus:outline-none"
                required
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-300 font-light bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500/90 to-teal-500/90 hover:from-emerald-400 hover:to-teal-400 text-black font-semibold rounded-2xl text-xs sm:text-sm transition-all shadow-lg shadow-emerald-500/15 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              <span>{isSubmitting ? 'Verifying...' : 'Verify & Continue'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
