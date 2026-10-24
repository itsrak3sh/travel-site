import React from 'react';
import { Car, Zap, MapPin, User, ChevronRight, Menu, X, Shield } from 'lucide-react';
import { MobilityMode } from '../types/mobility';

interface MobilityHeaderProps {
  activeMode: MobilityMode;
  onModeChange: (mode: MobilityMode) => void;
  onOpenDriverModal: () => void;
  onOpenAuthModal: () => void;
  userLoggedIn?: boolean;
  userName?: string;
  driverLoggedIn?: boolean;
  driverName?: string;
  driverPlate?: string;
  driverWalletBalance?: number;
  driverIsOnline?: boolean;
  pendingTripRequestsCount?: number;
}

export const MobilityHeader: React.FC<MobilityHeaderProps> = ({
  activeMode,
  onModeChange,
  onOpenDriverModal,
  onOpenAuthModal,
  userLoggedIn = false,
  userName = 'Alex Rider',
  driverLoggedIn = false,
  driverName = 'Rajesh Kumar',
  driverPlate = 'DL 01 AB 4829',
  driverWalletBalance = 4850,
  driverIsOnline = true,
  pendingTripRequestsCount = 0,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 bg-black/60 backdrop-blur-2xl border-b border-white/[0.08] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* 1. Brand Logo: GoRide / ApexMobility with Sleek Quiet Luxury Vibe */}
          <div className="flex items-center gap-3">
            <a href="#" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500/80 to-teal-700/80 flex items-center justify-center shadow-lg shadow-emerald-950/40 border border-white/15 group-hover:scale-105 transition-all">
                  <Car className="w-5 h-5 text-white stroke-[2.2]" />
                </div>
                {/* Calm status dot */}
                <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 border border-black/80"></span>
                </span>
              </div>

              <div>
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="font-medium text-lg tracking-tight text-white group-hover:text-emerald-300 transition-colors">
                    GoRide
                  </span>
                  <span className="text-white/20 font-light text-base">/</span>
                  <span className="font-light text-base tracking-widest text-slate-300 uppercase">
                    Apex
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-medium tracking-wider text-emerald-300/80 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Quiet Mobility
                  </span>
                  <span className="hidden sm:inline text-[11px] text-slate-400/80 font-light">
                    Verified Chauffeurs
                  </span>
                </div>
              </div>
            </a>
          </div>

          {/* 2. Mode Switch Tabs: Custom Trip (Method 1) vs Quick Ride (Method 2) */}
          <div className="hidden md:flex items-center p-1 bg-white/[0.03] rounded-2xl border border-white/10 shadow-inner backdrop-blur-md">
            <button
              onClick={() => onModeChange('custom-trip')}
              className={`relative flex items-center gap-2.5 px-5 py-2 rounded-xl font-medium text-xs sm:text-sm transition-all duration-300 ${
                activeMode === 'custom-trip'
                  ? 'bg-white/10 text-white shadow-md shadow-black/40 border border-white/15'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
              }`}
            >
              <MapPin className={`w-3.5 h-3.5 ${activeMode === 'custom-trip' ? 'text-emerald-300' : 'text-slate-400'}`} />
              <div className="text-left">
                <span className="block leading-tight text-xs font-semibold">Custom Trip</span>
                <span className="text-[10px] text-slate-400 font-light block">
                  Method 1 • Multi-Stop
                </span>
              </div>
            </button>

            <button
              onClick={() => onModeChange('quick-ride')}
              className={`relative flex items-center gap-2.5 px-5 py-2 rounded-xl font-medium text-xs sm:text-sm transition-all duration-300 ${
                activeMode === 'quick-ride'
                  ? 'bg-white/10 text-white shadow-md shadow-black/40 border border-white/15'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${activeMode === 'quick-ride' ? 'text-emerald-300' : 'text-slate-400'}`} />
              <div className="text-left">
                <span className="block leading-tight text-xs font-semibold">Quick Ride</span>
                <span className="text-[10px] text-slate-400 font-light block">
                  Method 2 • Instant
                </span>
              </div>
            </button>
          </div>

          {/* 3. Top Right Actions: Driver Partner & Login / Signup */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Driver Partner Trigger / Duty Dashboard */}
            <button
              onClick={onOpenDriverModal}
              title={driverLoggedIn ? `${driverName} (${driverPlate}) • Duty Dashboard` : 'Drive with GoRide / Apex Partner'}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all hover:scale-[1.02] active:scale-98 ${
                driverLoggedIn
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-md shadow-emerald-950/20'
                  : 'text-slate-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.07] border border-white/10'
              }`}
            >
              {driverLoggedIn ? (
                <>
                  <span className={`w-1.5 h-1.5 rounded-full ${driverIsOnline ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                  <span>{driverName.split(' ')[0]} ({driverIsOnline ? 'Duty Online' : 'Duty Off'})</span>
                  <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-medium">
                    ₹{driverWalletBalance}
                  </span>
                  {pendingTripRequestsCount > 0 && (
                    <span className="text-[10px] font-mono bg-emerald-400 text-slate-950 font-bold px-1.5 py-0.2 rounded-full">
                      {pendingTripRequestsCount} Request
                    </span>
                  )}
                </>
              ) : (
                <>
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Driver Partner</span>
                  <span className="text-[10px] font-mono bg-emerald-500/15 text-emerald-300 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                    85% Net
                  </span>
                  {pendingTripRequestsCount > 0 && (
                    <span className="text-[10px] font-mono bg-emerald-400 text-slate-950 font-bold px-1.5 py-0.2 rounded-full">
                      1 Request
                    </span>
                  )}
                </>
              )}
            </button>

            {/* Login / Signup Modal Trigger */}
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white font-medium text-xs sm:text-sm border border-white/10 transition-all shadow-sm"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-300">
                <User className="w-3 h-3" />
              </div>
              <span className="font-light">{userLoggedIn ? userName : 'Sign In'}</span>
            </button>
          </div>

          {/* Mobile hamburger menu toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => onModeChange(activeMode === 'custom-trip' ? 'quick-ride' : 'custom-trip')}
              className="px-3 py-1.5 rounded-xl bg-white/[0.05] text-emerald-300 text-xs font-medium border border-white/10 flex items-center gap-1"
            >
              {activeMode === 'custom-trip' ? 'Custom (M1)' : 'Quick (M2)'}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white rounded-xl bg-white/[0.04] border border-white/10"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile secondary tab bar for easy switching */}
        <div className="md:hidden py-2.5 flex items-center gap-2 border-t border-white/[0.06]">
          <button
            onClick={() => onModeChange('custom-trip')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
              activeMode === 'custom-trip'
                ? 'bg-white/10 text-white border border-white/15'
                : 'text-slate-400 bg-white/[0.02] border border-transparent'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-300" />
            <span>Custom Trip</span>
          </button>
          <button
            onClick={() => onModeChange('quick-ride')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
              activeMode === 'quick-ride'
                ? 'bg-white/10 text-white border border-white/15'
                : 'text-slate-400 bg-white/[0.02] border border-transparent'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-emerald-300" />
            <span>Quick Ride</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-black/90 backdrop-blur-2xl border-b border-white/10 p-6 space-y-4 animate-fade-in">
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenDriverModal();
              }}
              className="w-full flex items-center justify-between p-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-slate-200 hover:text-white font-medium text-sm"
            >
              <div className="flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-emerald-300" />
                <span>
                  {driverLoggedIn 
                    ? `🟢 ${driverName} (Duty Dashboard • ₹${driverWalletBalance})` 
                    : 'Driver Partner Dashboard'}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAuthModal();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/10 text-white font-medium text-sm border border-white/15 shadow-lg shadow-black/40"
            >
              <User className="w-4 h-4 text-emerald-300" />
              <span>{userLoggedIn ? userName : 'Sign In / Register'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
