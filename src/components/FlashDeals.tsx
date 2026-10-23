import React, { useState, useEffect } from 'react';
import { Tour } from '../types';
import { Flame, Timer, ArrowRight } from 'lucide-react';

interface FlashDealsProps {
  tours: Tour[];
  onBookTour: (tour: Tour) => void;
}

export const FlashDeals: React.FC<FlashDealsProps> = ({ tours, onBookTour }) => {
  // Real-time ticking countdown timer (e.g. 48 hours countdown)
  const [timeLeft, setTimeLeft] = useState({
    hours: 36,
    minutes: 42,
    seconds: 18,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 48, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const dealTours = tours.filter((t) => t.originalPriceUSD).slice(0, 2);

  return (
    <section id="deals" className="py-20 bg-slate-950 text-white relative overflow-hidden">
      {/* Glow decorative gradients */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-purple-500/15 p-6 sm:p-10 rounded-3xl border border-white/10 mb-12 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Flame className="w-4 h-4" />
              <span>Limited Summer Solstice Privileges</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-white mb-2">
              Early Access Flash Offers
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl">
              Lock in complimentary villa upgrades and private chartered flight credits on select upcoming departures.
            </p>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center gap-2 sm:gap-3 bg-slate-900/90 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 shadow-xl">
            <Timer className="w-5 h-5 text-amber-400 animate-pulse" />
            <div className="flex items-center gap-1.5 text-center">
              <div>
                <span className="block font-mono text-xl sm:text-2xl font-black text-white">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-slate-400">Hours</span>
              </div>
              <span className="font-mono text-xl text-amber-400 font-bold">:</span>
              <div>
                <span className="block font-mono text-xl sm:text-2xl font-black text-white">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-slate-400">Mins</span>
              </div>
              <span className="font-mono text-xl text-amber-400 font-bold">:</span>
              <div>
                <span className="block font-mono text-xl sm:text-2xl font-black text-amber-400">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-slate-400">Secs</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2 Exclusive Deal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {dealTours.map((tour) => {
            const savings = tour.originalPriceUSD! - tour.priceUSD;
            return (
              <div
                key={tour.id}
                className="bg-slate-900/90 rounded-3xl overflow-hidden border border-amber-500/30 shadow-xl hover:border-amber-400 transition-all flex flex-col sm:flex-row group"
              >
                <div className="relative sm:w-1/2 aspect-[4/3] sm:aspect-auto overflow-hidden">
                  <img
                    src={tour.image}
                    alt={tour.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-3 left-3 bg-rose-600 text-white text-xs font-black uppercase px-2.5 py-1 rounded-full shadow-lg">
                    Save ${savings} USD
                  </div>
                </div>

                <div className="p-6 sm:w-1/2 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                      {tour.destination}
                    </span>
                    <h3 className="font-serif text-lg font-bold text-white mt-1 mb-2 leading-snug">
                      {tour.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mb-4">
                      {tour.subtitle}
                    </p>
                    <div className="text-xs text-slate-300 font-medium mb-3">
                      ✓ Free Helicopter Transfer Included
                    </div>
                  </div>

                  <div>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-2xl font-bold text-white">${tour.priceUSD.toLocaleString()}</span>
                      <span className="text-xs text-slate-500 line-through">
                        ${tour.originalPriceUSD?.toLocaleString()}
                      </span>
                    </div>

                    <button
                      onClick={() => onBookTour(tour)}
                      className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-md shadow-amber-500/20"
                    >
                      <span>Claim Deal</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
