import React, { useState } from 'react';
import { X, Phone, Mail, ArrowRight, User } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (name: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [method, setMethod] = useState<'phone' | 'email'>('phone');
  const [inputVal, setInputVal] = useState('+1 (555) 382-9102');
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [otp, setOtp] = useState(['4', '8', '2', '1']);

  if (!isOpen) return null;

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('otp');
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSuccess('Alex Rider');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-dark-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="relative w-full max-w-md bg-dark-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-dark-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 mb-3">
            <User className="w-6 h-6" />
          </div>
          <h3 className="font-black text-xl text-white">
            {step === 'input' ? 'Welcome to GoRide / Apex' : 'Enter 4-Digit Verification Code'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {step === 'input' 
              ? 'Sign in or create a passenger account in seconds' 
              : `Code sent to ${inputVal}`}
          </p>
        </div>

        {step === 'input' ? (
          <form onSubmit={handleSendCode} className="space-y-4">
            
            {/* Toggle Phone / Email */}
            <div className="flex p-1 bg-dark-850 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setMethod('phone')}
                className={`flex-1 py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                  method === 'phone' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Phone Number</span>
              </button>
              <button
                type="button"
                onClick={() => setMethod('email')}
                className={`flex-1 py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                  method === 'email' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email Address</span>
              </button>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-400 font-bold mb-1.5">
                {method === 'phone' ? 'Mobile Number' : 'Email Address'}
              </label>
              <input
                type={method === 'phone' ? 'tel' : 'email'}
                required
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder={method === 'phone' ? '+1 (555) 000-0000' : 'name@example.com'}
                className="w-full bg-dark-850 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 text-slate-950 font-black rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 text-center">
              <span className="text-[11px] text-slate-500">
                By continuing, you agree to our Terms of Mobility & Privacy Policy.
              </span>
            </div>
          </form>
        ) : (
          /* OTP Screen */
          <form onSubmit={handleVerify} className="space-y-5">
            <div className="flex justify-center gap-3">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => {
                    const newOtp = [...otp];
                    newOtp[idx] = e.target.value;
                    setOtp(newOtp);
                  }}
                  className="w-12 h-14 text-center font-mono text-2xl font-bold rounded-xl bg-dark-850 border border-emerald-500/50 text-emerald-400 focus:outline-none focus:border-emerald-400"
                />
              ))}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-emerald-400 to-emerald-500 text-slate-950 font-black rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20"
            >
              Verify & Sign In
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setStep('input')}
                className="text-xs text-slate-400 hover:text-emerald-400 transition-colors"
              >
                ← Change number / email
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
