import React from 'react';
import { ShieldCheck, Gem, Compass, Globe, HeartHandshake } from 'lucide-react';
import { TRUST_STATS } from '../data/tours';

export const WhyUs: React.FC = () => {
  const pillars = [
    {
      icon: Gem,
      title: 'Ultra-Intimate Small Groups',
      desc: 'Never more than 6 to 8 guests. Enjoy private estates, chartered catamarans, and after-hours temple access with complete solitude.',
    },
    {
      icon: Compass,
      title: 'Master Local Curators',
      desc: 'Accompanied by veteran zoologists in the Serengeti, 16th-generation tea masters in Kyoto, and Michelin-trained private chefs.',
    },
    {
      icon: ShieldCheck,
      title: 'Zero-Stress VIP Logistics',
      desc: 'Helicopter luggage transfers, expedited customs clearance, and dedicated 24/7 personal concierges managing every whim.',
    },
    {
      icon: Globe,
      title: 'Regenerative & Carbon-Neutral',
      desc: 'Every mile flown and sailed is 100% carbon-offset. A portion of every expedition directly funds indigenous wildlife preserves.',
    },
  ];

  const pressLogos = [
    'CONDÉ NAST TRAVELER',
    'ROBB REPORT',
    'FORBES LUXURY',
    'VOGUE ESCAPES',
    'TRAVEL + LEISURE',
  ];

  return (
    <section id="why-us" className="py-24 bg-slate-900 border-t border-slate-800 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>The Wanderlux Difference</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Travel Elevated to an Art Form
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            We don't merely plan trips; we craft transformative memories with unprecedented access and white-glove hospitality.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {pillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-slate-800/40 border border-slate-700/60 hover:border-amber-400/40 p-8 rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-6 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-xl font-bold text-white mb-3">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Stat Numbers Bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 p-8 rounded-3xl bg-gradient-to-r from-slate-800/80 via-slate-800/40 to-slate-800/80 border border-slate-700/70 text-center mb-16">
          {TRUST_STATS.map((stat, i) => (
            <div key={i} className="space-y-1">
              <span className="block font-serif text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-200">
                {stat.value}
              </span>
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Press Badges */}
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-6">
            Featured & Celebrated In
          </span>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-60">
            {pressLogos.map((press, i) => (
              <span
                key={i}
                className="font-serif tracking-widest text-xs sm:text-sm font-bold text-slate-300 hover:text-white transition-colors"
              >
                {press}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
