import React, { useState } from 'react';
import { Mail, CheckCircle2, Gift, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch {}
  };

  return (
    <section className="py-20 bg-slate-900 border-t border-slate-800 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-amber-500/20 via-slate-800 to-slate-900 p-8 sm:p-14 rounded-3xl border border-amber-500/30 text-center relative overflow-hidden shadow-2xl">
          
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 mb-6">
            <Gift className="w-7 h-7" />
          </div>

          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-2">
            The Private Voyager Circle
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-4">
            Receive $250 Toward Your Inaugural Expedition
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mb-8">
            Subscribe for discreet early invitations to limited-capacity journeys, secret hotel openings, and seasonal member perks.
          </p>

          {!subscribed ? (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-3.5 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="Enter your private email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-950/70 border border-slate-700 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-bold rounded-2xl text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
              >
                <span>Claim Invitation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="max-w-md mx-auto bg-emerald-500/15 border border-emerald-500/30 rounded-2xl p-4 text-emerald-300 text-sm flex items-center justify-center gap-3 animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>
                Welcome! Use code <strong className="text-white font-mono bg-black/30 px-2 py-0.5 rounded">WANDERLUX250</strong> at checkout for $250 credit.
              </span>
            </div>
          )}

          <span className="text-[11px] text-slate-400 mt-4 block">
            We value silence and discretion. Never spam, unsubscribe with one click.
          </span>
        </div>
      </div>
    </section>
  );
};
