import React, { useState, useEffect } from 'react';
import { 
  Navigation, MapPin, Zap, Clock, Shield, 
  LocateFixed, Car, Bike, CarTaxiFront,
  PhoneCall, PhoneOff, CheckCircle2, Radio, Copy,
  ShieldCheck, ArrowUpDown, MessageSquare, Share2,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RideCategory {
  id: 'bike' | 'auto' | 'mini' | 'sedan';
  name: string;
  tagline: string;
  eta: string;
  priceINR: number;
  seats: number;
  badge?: string;
  vehicleDesc: string;
}

interface AssignedDriver {
  name: string;
  avatar: string;
  rating: number;
  totalTrips: number;
  vehicleName: string;
  vehiclePlate: string;
  etaMinutes: number;
  distanceKm: number;
  phone: string;
}

export const QuickRideView: React.FC = () => {
  // Input form state
  const [pickup, setPickup] = useState('Connaught Place, Inner Circle, New Delhi');
  const [dropoff, setDropoff] = useState('Terminal 3, Indira Gandhi International Airport');
  const [selectedCategory, setSelectedCategory] = useState<'bike' | 'auto' | 'mini' | 'sedan'>('mini');
  const [paymentMethod, setPaymentMethod] = useState<'apex-pay' | 'upi' | 'cash'>('apex-pay');

  // Dispatch state: 'input' | 'searching' | 'assigned'
  const [dispatchState, setDispatchState] = useState<'input' | 'searching' | 'assigned'>('input');
  const [countdown, setCountdown] = useState<number>(15);
  const [pickupOtp, setPickupOtp] = useState<string>('7419');
  const [copiedOtp, setCopiedOtp] = useState<boolean>(false);
  const [callingDriver, setCallingDriver] = useState<boolean>(false);

  // Ride Categories (Uber / Rapido Style Instant Dispatch Model)
  const categories: RideCategory[] = [
    {
      id: 'bike',
      name: 'Moto / Bike (Fastest)',
      tagline: 'Beat traffic jams with helmet & safety gear',
      eta: '1 min',
      priceINR: 85,
      seats: 1,
      badge: 'Fastest / Beat Traffic',
      vehicleDesc: 'Bajaj Pulsar / Hero Splendor',
    },
    {
      id: 'auto',
      name: 'Auto / Tuk-tuk',
      tagline: 'Nimble 3-wheeler for quick city hops',
      eta: '2 mins',
      priceINR: 130,
      seats: 3,
      badge: 'Best Value',
      vehicleDesc: 'Bajaj RE CNG Auto (Green Fleet)',
    },
    {
      id: 'mini',
      name: 'Mini Cab',
      tagline: 'Compact AC hatchback for daily commutes',
      eta: '3 mins',
      priceINR: 190,
      seats: 4,
      badge: 'Everyday AC',
      vehicleDesc: 'Maruti WagonR / Hyundai Santro',
    },
    {
      id: 'sedan',
      name: 'Comfort Sedan',
      tagline: 'Top chauffeurs, spacious legroom & boot space',
      eta: '4 mins',
      priceINR: 260,
      seats: 4,
      badge: 'Top Rated Chauffeur',
      vehicleDesc: 'Maruti Dzire Prime / Honda Amaze',
    },
  ];

  // Active Category Object
  const currentCategory = categories.find((c) => c.id === selectedCategory) || categories[2];

  // Mock Drivers by Category
  const mockDrivers: Record<'bike' | 'auto' | 'mini' | 'sedan', AssignedDriver> = {
    bike: {
      name: 'Sunil Verma',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
      rating: 4.93,
      totalTrips: 2840,
      vehicleName: 'Bajaj Pulsar 150 (Helmet Included)',
      vehiclePlate: 'DL 07 BK 4821',
      etaMinutes: 2,
      distanceKm: 0.5,
      phone: '+91 98110 44219',
    },
    auto: {
      name: 'Mohan Lal',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      rating: 4.90,
      totalTrips: 5410,
      vehicleName: 'Bajaj RE Green Auto (Meter Verified)',
      vehiclePlate: 'DL 1R 7729',
      etaMinutes: 2,
      distanceKm: 0.6,
      phone: '+91 98112 55301',
    },
    mini: {
      name: 'Amit Sharma',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      rating: 4.95,
      totalTrips: 3180,
      vehicleName: 'Maruti Suzuki WagonR (White • AC High)',
      vehiclePlate: 'DL 04 AB 3910',
      etaMinutes: 3,
      distanceKm: 0.8,
      phone: '+91 98114 66289',
    },
    sedan: {
      name: 'Vikramjeet Singh',
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80',
      rating: 4.98,
      totalTrips: 4650,
      vehicleName: 'Maruti Dzire Prime (Silver Chauffeur)',
      vehiclePlate: 'DL 01 XY 8832',
      etaMinutes: 3,
      distanceKm: 1.1,
      phone: '+91 98118 99120',
    },
  };

  const assignedDriver = mockDrivers[selectedCategory];

  // Swap pickup & drop
  const handleSwapAddresses = () => {
    const temp = pickup;
    setPickup(dropoff);
    setDropoff(temp);
  };

  // Start instant dispatch flow
  const handleStartDispatch = () => {
    setDispatchState('searching');
    setCountdown(15);
  };

  // Driver Assignment Trigger
  const handleDriverAssigned = () => {
    // Generate fresh 4-digit OTP
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setPickupOtp(generatedOtp);
    setDispatchState('assigned');
    try {
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // Ignore
    }
  };

  // 15-second Countdown Timer Effect during searching
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (dispatchState === 'searching' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          // Auto-match when timer reaches 11s (after 4s of realistic search)
          if (prev <= 11) {
            clearInterval(timer);
            handleDriverAssigned();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [dispatchState, countdown]);

  // Copy OTP helper
  const handleCopyOtp = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2500);
  };

  // Cancel ride back to input form
  const handleCancelRide = () => {
    setDispatchState('input');
    setCallingDriver(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-2 animate-fade-in">
      
      {/* Top Banner Notice for Method 2 */}
      <div className="mb-6 p-5 sm:p-6 rounded-3xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-teal-300 font-mono text-xs font-medium">
            M2
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm text-white uppercase tracking-wider">
                Method 2: Quick Ride Instant Dispatch
              </span>
              <span className="text-[10px] font-mono bg-teal-500/10 text-teal-300 px-2.5 py-0.5 rounded-full border border-teal-500/20 tracking-wider">
                UBER / RAPIDO MODEL
              </span>
            </div>
            <p className="text-xs text-white/50 font-light mt-0.5">
              Point-to-point urban mobility with instant upfront guaranteed pricing, live radar driver matching, and 4-digit OTP security.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-white/70 bg-white/[0.04] px-3.5 py-1.5 rounded-full border border-white/10 font-light">
          <Radio className="w-3.5 h-3.5 text-teal-300" />
          <span>
            {dispatchState === 'assigned'
              ? 'Driver Assigned • En Route'
              : dispatchState === 'searching'
              ? `Finding Driver (${countdown}s)`
              : 'Instant Upfront Dispatch'}
          </span>
        </div>
      </div>

      {/* Main Grid: Left 6 Cols (Inputs / Searching / Assigned) & Right 6 Cols (Live GPS Radar Map) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN (6 COLS) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-6 space-y-6">

          {/* ==================== 1. QUICK INPUT INTERFACE ==================== */}
          {dispatchState === 'input' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Pickup & Drop-off Inputs Card */}
              <div className="bg-black/40 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 border border-white/10 shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-1">
                  <h2 className="text-xs font-mono uppercase tracking-wider text-teal-300 font-medium flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Point-to-Point Route</span>
                  </h2>
                  <span className="text-[11px] text-emerald-300 font-mono font-medium bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    Upfront Fare Locked
                  </span>
                </div>

                {/* Pickup Location */}
                <div className="flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-white/[0.03] border border-white/10 focus-within:border-emerald-500/40 transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-300 flex-shrink-0">
                    <Navigation className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-white/40 font-medium">
                      Pickup Location
                    </label>
                    <input
                      type="text"
                      value={pickup}
                      onChange={(e) => setPickup(e.target.value)}
                      placeholder="Set pickup location..."
                      className="w-full bg-transparent text-sm font-light text-white focus:outline-none placeholder-white/30"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setPickup('Current Location (Connaught Place, Inner Circle)')}
                    className="p-2 text-white/50 hover:text-emerald-300 hover:bg-white/[0.05] rounded-xl transition-colors flex items-center gap-1 text-xs"
                    title="Use Current Location GPS"
                  >
                    <LocateFixed className="w-4 h-4 text-emerald-300" />
                    <span className="hidden sm:inline text-[11px] font-medium text-emerald-300">GPS</span>
                  </button>
                </div>

                {/* Swap Address Button */}
                <div className="flex justify-center -my-2 relative z-10">
                  <button
                    type="button"
                    onClick={handleSwapAddresses}
                    className="p-2 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-white/70 hover:text-white border border-white/15 shadow-md transition-all hover:rotate-180"
                    title="Swap Pickup and Drop"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Drop Location */}
                <div className="flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-white/[0.03] border border-white/10 focus-within:border-teal-500/40 transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/25 flex items-center justify-center text-teal-300 flex-shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-white/40 font-medium">
                      Drop Location
                    </label>
                    <input
                      type="text"
                      value={dropoff}
                      onChange={(e) => setDropoff(e.target.value)}
                      placeholder="Where to?"
                      className="w-full bg-transparent text-sm font-light text-white focus:outline-none placeholder-white/30"
                    />
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
                  <span className="text-[11px] text-white/40 font-light">Quick Select:</span>
                  {[
                    'Terminal 3, IGI Airport',
                    'Cyber Hub, Gurugram',
                    'New Delhi Railway Station',
                    'Select Citywalk, Saket',
                  ].map((dest) => (
                    <button
                      key={dest}
                      type="button"
                      onClick={() => setDropoff(dest)}
                      className="px-3 py-1 rounded-full bg-white/[0.03] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/10 transition-colors text-[11px] font-light"
                    >
                      {dest}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ride Type Selector Chips */}
              <div className="bg-black/40 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 border border-white/10 shadow-2xl space-y-3.5">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-xs font-mono uppercase tracking-wider text-teal-300 font-medium">
                    Choose Ride Type
                  </h2>
                  <span className="text-[11px] text-white/40 font-light">
                    Instant nearby dispatch
                  </span>
                </div>

                <div className="space-y-2.5">
                  {categories.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <div
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`p-3.5 sm:p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-white/[0.08] border-teal-400/40 shadow-lg shadow-teal-500/5'
                            : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                              : 'bg-white/[0.04] text-white/40 border border-white/10'
                          }`}>
                            {cat.id === 'bike' && <Bike className="w-5 h-5" />}
                            {cat.id === 'auto' && <CarTaxiFront className="w-5 h-5" />}
                            {cat.id === 'mini' && <Car className="w-5 h-5" />}
                            {cat.id === 'sedan' && <Car className="w-5 h-5" />}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-sm sm:text-base text-white">
                                {cat.name}
                              </h4>
                              {cat.badge && (
                                <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-light ${
                                  isSelected 
                                    ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30' 
                                    : 'bg-white/[0.04] text-white/40 border border-white/10'
                                }`}>
                                  {cat.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-white/50 font-light mt-0.5">{cat.tagline}</p>
                            <div className="flex items-center gap-2 text-[11px] text-white/40 font-light mt-1">
                              <span className="text-emerald-300 flex items-center gap-1 font-normal">
                                <Clock className="w-3 h-3" /> Arrives in {cat.eta}
                              </span>
                              <span>•</span>
                              <span>{cat.seats} Seat{cat.seats > 1 ? 's' : ''}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] font-mono uppercase text-white/40 block">
                            Guaranteed
                          </span>
                          <span className={`font-mono text-xl sm:text-2xl font-light block leading-tight ${
                            isSelected ? 'text-teal-300 font-medium' : 'text-white'
                          }`}>
                            ₹{cat.priceINR}
                          </span>
                          <span className="text-[10px] text-emerald-300 font-light">No surge</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Payment & Prominent "Book Quick Ride" Button */}
              <div className="bg-black/40 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 border border-white/10 shadow-2xl space-y-4">
                
                {/* Payment Selection */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2 pb-3.5 border-b border-white/[0.06]">
                  <span className="text-white/50 font-light">Payment Channel:</span>
                  <div className="flex items-center gap-2">
                    {[
                      { id: 'apex-pay', label: 'Apex Wallet (₹1,500)' },
                      { id: 'upi', label: 'UPI / GPay' },
                      { id: 'cash', label: 'Cash on Drop' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id as any)}
                        className={`px-3 py-1.5 rounded-full border text-[11px] transition-colors ${
                          paymentMethod === m.id
                            ? 'bg-teal-500/15 border-teal-500/40 text-teal-300 font-medium'
                            : 'bg-white/[0.03] border-white/10 text-white/60 font-light hover:border-white/20'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Primary CTA Button */}
                <button
                  type="button"
                  onClick={handleStartDispatch}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-500 hover:from-teal-300 hover:to-emerald-300 text-black font-semibold text-base shadow-xl shadow-teal-500/15 transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4 fill-black" />
                  <span>Book Quick Ride — ₹{currentCategory.priceINR}</span>
                </button>

                <div className="flex items-center justify-center gap-4 text-[11px] text-white/40 font-light pt-1">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400/80" /> Upfront Fixed Price
                  </span>
                  <span>•</span>
                  <span>4-Digit OTP Ride Protection</span>
                </div>
              </div>

            </div>
          )}

          {/* ==================== 2. ANIMATED PULSE RADAR SCREEN (FINDING DRIVER) ==================== */}
          {dispatchState === 'searching' && (
            <div className="bg-black/40 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6 text-center animate-fade-in">
              
              {/* Radar Status Badge */}
              <div className="inline-flex items-center gap-2 text-xs font-mono uppercase bg-white/[0.04] text-teal-300 px-3.5 py-1.5 rounded-full border border-white/10 font-medium">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping"></span>
                <span>DISPATCHING RADAR ACTIVE</span>
              </div>

              {/* Concentric Animated Pulse Radar Graphic */}
              <div className="relative py-8 flex items-center justify-center">
                {/* Outer Ripple 1 */}
                <div className="absolute w-56 h-56 rounded-full border border-teal-500/15 animate-ping [animation-duration:2.5s]" />
                {/* Outer Ripple 2 */}
                <div className="absolute w-44 h-44 rounded-full border border-teal-500/20 animate-ping [animation-duration:2s]" />
                {/* Outer Ripple 3 */}
                <div className="absolute w-32 h-32 rounded-full border border-emerald-500/25 animate-ping [animation-duration:1.5s]" />

                {/* Central Radar Node */}
                <div className="relative z-10 w-24 h-24 rounded-full bg-black/60 border border-teal-400/40 flex flex-col items-center justify-center shadow-2xl shadow-teal-500/15 backdrop-blur-md">
                  <div className="text-teal-300">
                    {selectedCategory === 'bike' && <Bike className="w-7 h-7" />}
                    {selectedCategory === 'auto' && <CarTaxiFront className="w-7 h-7" />}
                    {selectedCategory === 'mini' && <Car className="w-7 h-7" />}
                    {selectedCategory === 'sedan' && <Car className="w-7 h-7" />}
                  </div>
                  <span className="font-mono text-[10px] text-teal-200 mt-1 uppercase tracking-wider">
                    {selectedCategory}
                  </span>
                </div>
              </div>

              {/* Countdown Timer Display */}
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-light tracking-tight text-white">
                  Finding Nearest Available Driver...
                </h3>
                <p className="text-xs text-white/50 max-w-sm mx-auto font-light leading-relaxed">
                  Broadcasting your request to 14 verified {currentCategory.name} partners within 1.5 km of your pickup.
                </p>

                {/* 15-second visual countdown */}
                <div className="inline-flex items-center gap-2 p-2.5 px-4 rounded-full bg-white/[0.03] border border-white/10 text-xs font-mono">
                  <Clock className="w-3.5 h-3.5 text-teal-300" />
                  <span className="text-white/40">Auto-match window:</span>
                  <span className="text-teal-300 font-medium text-sm">00:{countdown.toString().padStart(2, '0')}</span>
                </div>
              </div>

              {/* Status Simulation Progress Bar */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 text-left space-y-2.5 text-xs font-light text-white/70">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400/80 flex-shrink-0" />
                  <span>Fixed fare of <strong className="text-white font-medium">₹{currentCategory.priceINR}</strong> guaranteed</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400/80 flex-shrink-0" />
                  <span>Nearest cab is 2 mins away on MG Road</span>
                </div>
                <div className="flex items-center gap-2.5 text-teal-300 font-normal">
                  <Radio className="w-4 h-4 flex-shrink-0" />
                  <span>Locking nearest chauffeur assignment...</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCancelRide}
                  className="flex-1 py-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] text-rose-300 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors border border-white/10"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>Cancel Search</span>
                </button>

                {/* Instant Match Shortcut */}
                <button
                  type="button"
                  onClick={handleDriverAssigned}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-black font-semibold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-teal-500/15 transition-all"
                >
                  <Zap className="w-3.5 h-3.5 fill-black" />
                  <span>Instant Match (Skip Timer)</span>
                </button>
              </div>

            </div>
          )}

          {/* ==================== 3. DRIVER ASSIGNED STATE (AUTO-ASSIGNED SIMULATION) ==================== */}
          {dispatchState === 'assigned' && (
            <div className="bg-black/40 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6 animate-fade-in">
              
              {/* Header Status */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-white/[0.08] gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
                    <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="font-light text-lg text-white tracking-tight">Driver Assigned • En Route</h3>
                    <span className="text-xs text-emerald-300 font-normal">
                      Arriving in {assignedDriver.etaMinutes} mins ({assignedDriver.distanceKm} km away)
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono uppercase text-white/40 block">
                    Upfront Fare
                  </span>
                  <span className="font-mono text-xl font-medium text-emerald-300">
                    ₹{currentCategory.priceINR}
                  </span>
                </div>
              </div>

              {/* 4-DIGIT PICKUP OTP CARD */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.03] border border-white/10 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-300 font-medium block">
                      SECURITY CODE
                    </span>
                    <h4 className="text-base font-light text-white tracking-tight">
                      Your 4-Digit Pickup OTP
                    </h4>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyOtp(pickupOtp)}
                    className="px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white/80 text-xs font-light flex items-center gap-1.5 transition-colors border border-white/10"
                  >
                    <Copy className="w-3.5 h-3.5 text-emerald-300" />
                    <span>{copiedOtp ? 'Copied!' : 'Copy OTP'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-3 py-2">
                  {pickupOtp.split('').map((digit, idx) => (
                    <div
                      key={idx}
                      className="w-12 h-14 rounded-2xl bg-white/[0.05] border border-white/15 flex items-center justify-center font-mono font-light text-2xl text-white shadow-lg"
                    >
                      {digit}
                    </div>
                  ))}
                  <div className="ml-3 text-xs text-white/60 font-light">
                    <span className="font-medium text-white block">Share with Driver</span>
                    <span className="text-white/40 text-[11px]">
                      Provide code to {assignedDriver.name} upon boarding to start ride.
                    </span>
                  </div>
                </div>
              </div>

              {/* Driver & Vehicle Details Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={assignedDriver.avatar}
                      alt={assignedDriver.name}
                      className="w-14 h-14 rounded-2xl object-cover border border-white/15"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-black flex items-center justify-center shadow-md">
                      <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-base text-white">{assignedDriver.name}</h4>
                      <span className="text-xs bg-white/[0.05] px-2.5 py-0.5 rounded-full font-light text-amber-300 border border-white/10">
                        ★ {assignedDriver.rating.toFixed(2)} ({assignedDriver.totalTrips})
                      </span>
                    </div>
                    <span className="text-xs text-emerald-300 font-normal block mt-0.5">
                      {assignedDriver.vehiclePlate} • {assignedDriver.vehicleName}
                    </span>
                    <span className="text-[11px] text-white/40 font-light block mt-0.5">
                      Verified Commercial Partner • Clean Certified
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setCallingDriver(true)}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-emerald-500/90 hover:bg-emerald-400 text-black font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/15"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Call Driver</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => alert(`Chatting with ${assignedDriver.name}... "I am arriving at the main gate."`)}
                    className="flex-1 sm:flex-none p-2.5 px-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] text-white/70 border border-white/10 flex items-center justify-center gap-1 text-xs font-light transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 text-teal-300" />
                    <span className="hidden sm:inline">Chat</span>
                  </button>
                </div>
              </div>

              {/* Call Simulation Modal */}
              {callingDriver && (
                <div className="p-4 sm:p-5 rounded-2xl bg-black/60 border border-white/15 space-y-3 animate-slide-up backdrop-blur-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-300 text-xs font-mono">
                      <Radio className="w-4 h-4" />
                      <span>MASKED RELAY CALL CONNECTED</span>
                    </div>
                    <button
                      onClick={() => setCallingDriver(false)}
                      className="text-xs text-white/40 hover:text-white"
                    >
                      Dismiss
                    </button>
                  </div>
                  <p className="text-xs text-white/70 font-light">
                    Connected with <strong className="text-white font-medium">{assignedDriver.name}</strong> ({assignedDriver.phone}).
                    <br />
                    <em className="text-white/50">"Hello! I am just 2 minutes away outside the main entrance in {assignedDriver.vehiclePlate}."</em>
                  </p>
                  <button
                    onClick={() => setCallingDriver(false)}
                    className="w-full py-2.5 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-xs font-medium border border-rose-500/20 transition-colors"
                  >
                    End Call
                  </button>
                </div>
              )}

              {/* Route Summary */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2 text-xs font-light">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span className="text-white/50">Pickup:</span>
                  <span className="text-white/80 truncate">{pickup}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-teal-400"></span>
                  <span className="text-white/50">Drop:</span>
                  <span className="text-white/80 truncate">{dropoff}</span>
                </div>
              </div>

              {/* Actions: Cancel Ride & Reset */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleCancelRide}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] text-rose-300 hover:text-rose-200 text-xs font-light flex items-center justify-center gap-1.5 transition-colors border border-white/10"
                >
                  <PhoneOff className="w-3.5 h-3.5" />
                  <span>Cancel Ride</span>
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => alert('Live trip link copied to clipboard! Share with family/friends for real-time tracking.')}
                    className="flex-1 sm:flex-none px-4 py-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] text-white/70 text-xs font-light flex items-center justify-center gap-1.5 transition-colors border border-white/10"
                  >
                    <Share2 className="w-3.5 h-3.5 text-teal-300" />
                    <span>Share Trip</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => alert('Emergency SOS alert activated! GoRide 24/7 security center dispatched.')}
                    className="flex-1 sm:flex-none px-5 py-3 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/20 text-xs font-medium"
                  >
                    SOS Help
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN (6 COLS): INTERACTIVE LIVE GPS RADAR MAP */}
        {/* ========================================================================= */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-black/40 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 border border-white/10 shadow-2xl sticky top-28 space-y-5">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-400"></span>
                </span>
                <span className="font-mono text-xs font-medium text-white uppercase tracking-wider">
                  Live Dispatch Radar & Telematics
                </span>
              </div>
              <span className="text-xs font-mono text-white/40">
                14 Drivers Active
              </span>
            </div>

            {/* Stylized Vector Mobility Map Graphic */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-black/60 border border-white/10 flex items-center justify-center">
              
              {/* Map grid lines background */}
              <div 
                className="absolute inset-0 opacity-15"
                style={{
                  backgroundImage: `radial-gradient(#38bdf8 1px, transparent 1px), radial-gradient(#10b981 1px, transparent 1px)`,
                  backgroundSize: '24px 24px',
                  backgroundPosition: '0 0, 12px 12px'
                }}
              />

              {/* Simulated stylized street road arteries */}
              <svg className="absolute inset-0 w-full h-full stroke-white/10" fill="none">
                <path d="M 0 100 Q 150 150 400 80 T 800 200" strokeWidth="6" strokeOpacity="0.4" />
                <path d="M 120 0 L 220 500" strokeWidth="8" strokeOpacity="0.3" />
                <path d="M 300 0 L 400 500" strokeWidth="6" strokeOpacity="0.3" />
                <path d="M 0 320 Q 250 250 600 350" strokeWidth="10" strokeOpacity="0.5" />
                
                {/* Active Route polyline glowing in cyan */}
                <path 
                  d="M 150 220 C 220 180, 280 260, 380 180" 
                  stroke="#2dd4bf" 
                  strokeWidth="3" 
                  strokeDasharray="6 4"
                />
              </svg>

              {/* SEARCHING RADAR SWEEP EFFECT */}
              {dispatchState === 'searching' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-72 h-72 rounded-full border border-teal-400/20 animate-ping [animation-duration:2.5s]" />
                  <div className="w-48 h-48 rounded-full border border-emerald-400/25 animate-ping [animation-duration:1.8s]" />
                </div>
              )}

              {/* Pickup Marker */}
              <div className="absolute top-[220px] left-[150px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
                <div className="w-8 h-8 rounded-full bg-emerald-500/90 border border-white flex items-center justify-center text-black font-medium shadow-lg shadow-emerald-500/30">
                  <Navigation className="w-4 h-4" />
                </div>
                <span className="mt-1 text-[10px] font-mono font-medium bg-black/80 text-emerald-300 px-2 py-0.5 rounded-full border border-white/10 whitespace-nowrap">
                  Pickup (You)
                </span>
              </div>

              {/* Destination Flag Marker */}
              <div className="absolute top-[180px] left-[380px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
                <div className="w-8 h-8 rounded-full bg-teal-500/90 border border-white flex items-center justify-center text-black font-medium shadow-lg shadow-teal-500/30">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="mt-1 text-[10px] font-mono font-medium bg-black/80 text-teal-300 px-2 py-0.5 rounded-full border border-white/10 whitespace-nowrap">
                  Drop-off
                </span>
              </div>

              {/* DRIVER MARKER ON MAP */}
              {dispatchState === 'assigned' ? (
                /* Assigned Driver Marker moving towards pickup */
                <div className="absolute top-[200px] left-[190px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20">
                  <div className="w-8 h-8 rounded-2xl bg-emerald-500 border border-white flex items-center justify-center text-black shadow-xl shadow-emerald-500/40">
                    {selectedCategory === 'bike' && <Bike className="w-4 h-4" />}
                    {selectedCategory === 'auto' && <CarTaxiFront className="w-4 h-4" />}
                    {selectedCategory === 'mini' && <Car className="w-4 h-4" />}
                    {selectedCategory === 'sedan' && <Car className="w-4 h-4" />}
                  </div>
                  <span className="mt-1 text-[10px] font-mono font-medium bg-black/80 text-emerald-300 px-2.5 py-0.5 rounded-full border border-white/10 whitespace-nowrap">
                    {assignedDriver.vehiclePlate} ({assignedDriver.etaMinutes}m)
                  </span>
                </div>
              ) : (
                /* Nearby idle fleet pins */
                <>
                  <div className="absolute top-[160px] left-[200px]">
                    <div className="w-6 h-6 rounded-xl bg-white/[0.08] border border-white/15 flex items-center justify-center text-emerald-300 shadow-md">
                      <Bike className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <div className="absolute top-[260px] left-[280px]">
                    <div className="w-6 h-6 rounded-xl bg-white/[0.08] border border-white/15 flex items-center justify-center text-white/50 shadow-md">
                      <CarTaxiFront className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <div className="absolute top-[120px] left-[320px]">
                    <div className="w-6 h-6 rounded-xl bg-white/[0.08] border border-white/15 flex items-center justify-center text-white/50 shadow-md">
                      <Car className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </>
              )}

              {/* Bottom Floating Map Info Bar */}
              <div className="absolute bottom-3 left-3 right-3 bg-black/75 backdrop-blur-xl p-3.5 rounded-2xl border border-white/10 flex items-center justify-between text-xs z-10">
                <div>
                  <span className="text-[10px] font-mono text-white/40 uppercase">Estimated Route</span>
                  <span className="block font-medium text-white">18 mins • 8.4 km via Ring Road</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-emerald-300 uppercase font-medium">
                    {dispatchState === 'assigned' ? 'Driver Arrival' : 'Fastest Pickup'}
                  </span>
                  <span className="block font-medium text-emerald-300 font-mono">
                    {dispatchState === 'assigned' ? `${assignedDriver.etaMinutes} mins` : `${currentCategory.eta}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Safety Guarantees */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-2.5 text-xs text-white/60 font-light">
                <Shield className="w-4 h-4 text-emerald-400/80 flex-shrink-0" />
                <span>Verified Commercial Drivers</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-2.5 text-xs text-white/60 font-light">
                <ShieldCheck className="w-4 h-4 text-teal-400/80 flex-shrink-0" />
                <span>Upfront Price Protection</span>
              </div>
            </div>

            {/* Reset Shortcut if assigned */}
            {dispatchState === 'assigned' && (
              <button
                type="button"
                onClick={handleCancelRide}
                className="w-full py-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white text-xs font-light flex items-center justify-center gap-1.5 transition-colors border border-white/10"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Book Another Quick Ride</span>
              </button>
            )}

            <div className="pt-2 border-t border-white/[0.06] text-[11px] text-center text-white/40 font-light">
              Apex Quick Dispatch 24/7 Helpline: 1800-GOCAB-24
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
