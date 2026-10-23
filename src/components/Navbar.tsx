import React, { useState, useEffect } from 'react';
import { Compass, Heart, Menu, X, PhoneCall, Sparkles } from 'lucide-react';

interface NavbarProps {
  wishlistCount: number;
  onOpenQuiz: () => void;
  onOpenWishlist: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  wishlistCount,
  onOpenQuiz,
  onOpenWishlist,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currency, setCurrency] = useState('USD');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-slate-950/85 backdrop-blur-md shadow-lg border-b border-white/10 py-3.5'
          : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <span className="font-serif tracking-widest text-xl font-bold text-white block leading-none">
                WANDERLUX
              </span>
              <span className="text-[10px] tracking-[0.25em] text-amber-300/90 font-medium uppercase">
                Bespoke Expeditions
              </span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            <a
              href="#destinations"
              className="text-sm font-medium text-slate-200 hover:text-amber-300 transition-colors"
            >
              Destinations
            </a>
            <a
              href="#deals"
              className="text-sm font-medium text-slate-200 hover:text-amber-300 transition-colors flex items-center gap-1.5"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              Limited Deals
            </a>
            <a
              href="#why-us"
              className="text-sm font-medium text-slate-200 hover:text-amber-300 transition-colors"
            >
              Why Wanderlux
            </a>
            <a
              href="#reviews"
              className="text-sm font-medium text-slate-200 hover:text-amber-300 transition-colors"
            >
              Stories & Reviews
            </a>
          </nav>

          {/* Actions */}
          <div className="hidden sm:flex items-center gap-4">
            {/* Currency selector */}
            <div className="flex items-center text-xs font-semibold text-slate-300 bg-white/10 rounded-lg px-2 py-1.5 border border-white/15">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="bg-transparent text-white focus:outline-none cursor-pointer"
              >
                <option value="USD" className="bg-slate-900 text-white">USD ($)</option>
                <option value="EUR" className="bg-slate-900 text-white">EUR (€)</option>
                <option value="GBP" className="bg-slate-900 text-white">GBP (£)</option>
              </select>
            </div>

            {/* Wishlist Button */}
            <button
              onClick={onOpenWishlist}
              className="relative p-2 text-slate-200 hover:text-rose-400 hover:bg-white/10 rounded-full transition-all"
              title="Saved Expeditions"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce shadow-md">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Concierge Quiz CTA */}
            <button
              onClick={onOpenQuiz}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-amber-500/25 transition-all hover:shadow-amber-500/40 hover:-translate-y-0.5 active:translate-y-0"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Plan My Trip</span>
            </button>
          </div>

          {/* Mobile hamburger */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={onOpenWishlist}
              className="relative p-2 text-slate-200"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-200 hover:text-white"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950/95 border-b border-white/10 px-6 py-5 space-y-4">
          <nav className="flex flex-col space-y-3">
            <a
              href="#destinations"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-200 hover:text-amber-300 font-medium py-1"
            >
              Destinations
            </a>
            <a
              href="#deals"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-200 hover:text-amber-300 font-medium py-1"
            >
              Limited Deals
            </a>
            <a
              href="#why-us"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-200 hover:text-amber-300 font-medium py-1"
            >
              Why Wanderlux
            </a>
            <a
              href="#reviews"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-200 hover:text-amber-300 font-medium py-1"
            >
              Stories & Reviews
            </a>
          </nav>
          <div className="pt-3 border-t border-white/10 flex flex-col gap-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenQuiz();
              }}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 py-3 rounded-xl font-bold shadow-lg shadow-amber-500/20"
            >
              <Sparkles className="w-4 h-4" />
              <span>Instant Itinerary Finder</span>
            </button>
            <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
              <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
              <span>24/7 VIP Concierge: +1 (800) 892-LUXE</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
