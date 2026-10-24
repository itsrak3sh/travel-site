import React from 'react';
import { Car, ShieldCheck, Zap, Globe } from 'lucide-react';

export const MobilityFooter: React.FC = () => {
  return (
    <footer className="bg-dark-950 border-t border-slate-800/80 text-slate-400 text-xs py-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Brand info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-slate-950">
                <Car className="w-4 h-4 stroke-[2.2]" />
              </div>
              <span className="font-extrabold text-base text-white tracking-tight">
                GoRide <span className="text-slate-600 font-light">/</span> <span className="text-emerald-400">ApexMobility</span>
              </span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Next-generation urban cab mobility and bespoke chauffeur logistics platform. Licensed, insured, and verified.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-[10px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              ALL SYSTEMS OPERATIONAL
            </div>
          </div>

          {/* Quick Ride */}
          <div>
            <h4 className="text-white font-mono font-bold text-xs uppercase tracking-wider mb-3">
              Mobility Services
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Point-to-Point City Rides (Method 2)</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Multi-Stop Custom Itineraries (Method 1)</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Hourly Executive Chauffeur</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Dedicated Airport Transfers</a></li>
            </ul>
          </div>

          {/* Drivers */}
          <div>
            <h4 className="text-white font-mono font-bold text-xs uppercase tracking-wider mb-3">
              Driver Partners
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Apply to Drive (85% Payout)</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Fleet Vehicle Requirements</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">EV Charging Discounts</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">24/7 Driver Support Hotline</a></li>
            </ul>
          </div>

          {/* Safety & Trust */}
          <div>
            <h4 className="text-white font-mono font-bold text-xs uppercase tracking-wider mb-3">
              Trust & Safety
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li className="flex items-center gap-1.5 text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>₹50 Lakh Commercial Liability Policy</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>Instant Emergency SOS Dispatch</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span>100% Carbon-Neutral Rides</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-600">
          <div>
            © {new Date().getFullYear()} GoRide & ApexMobility Inc. All rights reserved.
          </div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-slate-400">Terms of Service</a>
            <a href="#" className="hover:text-slate-400">Privacy Notice</a>
            <a href="#" className="hover:text-slate-400">Fare Transparency</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
