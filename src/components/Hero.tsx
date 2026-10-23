import React from 'react';
import { SearchBar } from './SearchBar';
import { ShieldCheck, Award, Star, Compass } from 'lucide-react';

interface HeroProps {
  onSearch: (filters: { destination: string; category: string; guests: number; month: string }) => void;
  onExploreClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onSearch, onExploreClick }) => {
  return (
    <section className="relative min-h-[92vh] sm:min-h-screen flex items-center justify-center pt-24 pb-16 px-4 overflow-hidden">
      {/* Background with cinematic image & gradient overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=2400&q=85"
          alt="Breathtaking tropical coastline and luxury travel destination"
          className="w-full h-full object-cover object-center scale-105 transition-transform duration-1000 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/40 to-slate-950/90" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-6xl mx-auto text-center w-full mt-8">
        
        {/* Top Tagline Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-amber-300 text-xs sm:text-sm font-semibold tracking-wide uppercase mb-6 shadow-lg shadow-black/20 animate-fade-in">
          <Award className="w-4 h-4 text-amber-400" />
          <span>Awarded World’s Leading Luxury Tour Operator 2026</span>
        </div>

        {/* Headline */}
        <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1] max-w-4xl mx-auto mb-6 text-balance">
          Rare Escapes & <span className="italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100">Bespoke</span> Journeys
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-xl text-slate-200/90 max-w-2xl mx-auto mb-10 font-normal leading-relaxed text-pretty">
          Handcrafted expeditions across 7 continents. Private chartered yachts, clifftop sanctuaries, and intimate local master encounters with zero compromise.
        </p>

        {/* Interactive Search Bar */}
        <div className="mb-10">
          <SearchBar onSearch={onSearch} />
        </div>

        {/* Trust Badges & Social Proof */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-slate-300 text-xs sm:text-sm font-medium">
          <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
              ))}
            </div>
            <span><strong className="text-white">4.98 / 5</strong> (2,400+ Verified Reviews)</span>
          </div>

          <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% Refundable Guarantee</span>
          </div>

          <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
            <Compass className="w-4 h-4 text-sky-400" />
            <span>24/7 Dedicated Concierge</span>
          </div>
        </div>
      </div>

      {/* Down indicator */}
      <button
        onClick={onExploreClick}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 text-slate-400 hover:text-white flex flex-col items-center gap-1 transition-colors text-xs font-semibold uppercase tracking-widest"
        aria-label="Scroll down to expeditions"
      >
        <span>Explore Expeditions</span>
        <div className="w-5 h-8 rounded-full border-2 border-slate-400/50 flex items-start justify-center p-1">
          <div className="w-1 h-2 bg-amber-400 rounded-full animate-bounce" />
        </div>
      </button>
    </section>
  );
};
