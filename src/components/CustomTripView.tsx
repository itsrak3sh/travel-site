import React, { useState, useEffect, useMemo } from 'react';
import { 
  Navigation, MapPin, ArrowUpDown, LocateFixed, Plus, Trash2, 
  Clock, CheckCircle2, ChevronRight, ChevronLeft, Shuffle, 
  Shield, Check, MessageSquare, PhoneCall, RotateCcw,
  Lock, ShieldCheck, PhoneOff, Radio, Wallet, Star,
  Download, AlertCircle, Copy, Banknote, Sparkles, Share2, Compass
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DriverBidItem, IntermediateStopItem, SharedActiveTrip } from '../types/mobility';

export type DriverBid = DriverBidItem;
export type IntermediateStop = IntermediateStopItem;

export interface CustomTripViewProps {
  sharedTrip?: SharedActiveTrip | null;
  onBroadcastTrip?: (tripData: {
    pickup: string;
    destination: string;
    stops: IntermediateStopItem[];
    selectedVehicle: string;
    driverAgePref: string;
    specialNotes: string;
    initialBids: DriverBidItem[];
  }) => void;
  onCustomerConfirmRide?: (bid: DriverBidItem) => void;
  onCustomerVerifyPickupOtp?: () => void;
  onCustomerVerifyDropoffOtp?: (enteredOtp: string) => boolean;
  onResetTrip?: () => void;
  riderName?: string;
}

export const CustomTripView: React.FC<CustomTripViewProps> = ({
  sharedTrip,
  onBroadcastTrip,
  onCustomerConfirmRide,
  onCustomerVerifyPickupOtp,
  onCustomerVerifyDropoffOtp,
  onResetTrip,
  riderName = 'Alex Rider',
}) => {
  // Stepper & Flow states
  // 1 to 5: Form filling (No static price)
  const [currentStep, setCurrentStep] = useState<number>(1);
  
  // Post Step 5 States: 'idle' | 'bidding' | 'in-call' | 'en-route'
  const [flowState, setFlowState] = useState<'idle' | 'bidding' | 'in-call' | 'en-route'>('idle');

  // Step 1: Pickup & Drop
  const [pickup, setPickup] = useState('Connaught Place, Inner Circle, New Delhi');
  const [destination, setDestination] = useState('Terminal 3, Indira Gandhi International Airport');

  // Step 2: Route & Stops
  const [stops, setStops] = useState<IntermediateStop[]>([
    { id: '1', address: 'Cyber Hub, DLF Phase 2, Gurugram', haltDuration: '30m' }
  ]);
  const [isDirectRoute, setIsDirectRoute] = useState(false);

  // Step 3: Vehicle Selection
  const [selectedVehicle, setSelectedVehicle] = useState<string>('sedan');

  // Step 4: Driver Age Preference
  const [driverAgePref, setDriverAgePref] = useState<'any' | '21-30' | '31-45' | '45+'>('31-45');

  // Step 5: Special Expectations
  const [specialNotes, setSpecialNotes] = useState('Need clean empty boot space for 2 trolley bags. AC on high.');

  // Bidding state & incoming quotes
  const [visibleBidsCount, setVisibleBidsCount] = useState<number>(0);
  const [selectedDriverForCall, setSelectedDriverForCall] = useState<DriverBid | null>(null);
  const [escrowModalOpen, setEscrowModalOpen] = useState(false);
  const [escrowPaymentMethod, setEscrowPaymentMethod] = useState<'apex-pay' | 'upi' | 'card'>('apex-pay');

  // 2-minute Call Simulation Timer (120 seconds countdown)
  const [callTimeRemaining, setCallTimeRemaining] = useState<number>(120);
  const [callConnected, setCallConnected] = useState<boolean>(false);

  // Ride Lifecycle & Two-Stage OTP States
  // 'driver-arriving': Customer payment collected in Escrow Vault, driver en route to pickup with Pickup OTP
  // 'trip-in-progress': Driver verified Pickup OTP, trip ongoing towards destination, Drop-off OTP active
  // 'trip-completed': Drop-off OTP verified, 15% commission deducted, 85% credited to Driver's Payout Wallet
  const [ridePhase, setRidePhase] = useState<'driver-arriving' | 'trip-in-progress' | 'trip-completed'>('driver-arriving');
  const [pickupOtp, setPickupOtp] = useState<string>('4821');
  const [dropoffOtp, setDropoffOtp] = useState<string>('9245');
  const [enteredDropoffOtp, setEnteredDropoffOtp] = useState<string>('');
  const [dropoffOtpError, setDropoffOtpError] = useState<string>('');
  const [driverRating, setDriverRating] = useState<number>(5);
  const [selectedTip, setSelectedTip] = useState<number>(0);
  const [copiedOtp, setCopiedOtp] = useState<string | null>(null);

  // Swap pickup & drop
  const handleSwapAddresses = () => {
    const temp = pickup;
    setPickup(destination);
    setDestination(temp);
  };

  // Add stop
  const handleAddStop = () => {
    if (stops.length < 4) {
      setStops([
        ...stops,
        { id: Date.now().toString(), address: '', haltDuration: '15m' }
      ]);
      setIsDirectRoute(false);
    }
  };

  const handleUpdateStop = (id: string, address: string, haltDuration?: '15m' | '30m' | '60m') => {
    setStops(stops.map((s) => s.id === id ? { 
      ...s, 
      address, 
      ...(haltDuration ? { haltDuration } : {}) 
    } : s));
  };

  const handleRemoveStop = (id: string) => {
    const updated = stops.filter((s) => s.id !== id);
    setStops(updated);
    if (updated.length === 0) setIsDirectRoute(true);
  };

  const handleSelectDirectRoute = () => {
    setIsDirectRoute(true);
    setStops([]);
    setCurrentStep(3); // Auto-advance to vehicle selection
  };

  // Vehicle Categories Specs (No static final price)
  const vehicles = [
    {
      id: 'any',
      name: 'Any / Random Vehicle',
      models: 'Auto-allocates nearest available top-rated cab',
      seats: 4,
      luggage: 3,
      badge: 'Fastest Bids',
      priceRange: '₹450 – ₹700 (Live Bids)',
      isAuto: true,
      image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'hatchback',
      name: 'GoMini / Hatchback',
      models: 'Maruti Swift / WagonR / Hyundai Grand i10',
      seats: 4,
      luggage: 2,
      badge: 'Budget Friendly',
      priceRange: '₹420 – ₹510 (Live Bids)',
      image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'sedan',
      name: 'Prime Sedan',
      models: 'Honda City / Maruti Dzire / Hyundai Verna',
      seats: 4,
      luggage: 3,
      badge: 'Most Popular',
      priceRange: '₹580 – ₹680 (Live Bids)',
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'suv',
      name: 'Prime SUV / MPV',
      models: 'Toyota Innova Crysta / Maruti Ertiga',
      seats: 6,
      luggage: 5,
      badge: 'Family & Luxury',
      priceRange: '₹720 – ₹890 (Live Bids)',
      image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'luxury-ev',
      name: 'Apex Luxury EV',
      models: 'Tata Nexon EV / BYD Seal / Hyundai Ioniq 5',
      seats: 4,
      luggage: 4,
      badge: '100% Green & Silent',
      priceRange: '₹620 – ₹780 (Live Bids)',
      image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=400&q=80',
    },
  ];

  const currentVehicleObj = vehicles.find((v) => v.id === selectedVehicle) || vehicles[2];

  // Dynamic Driver Quotes (tailored based on route & filters)
  const driverQuotes: DriverBid[] = [
    {
      id: 'bid-1',
      name: 'Aman Verma',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      rating: 4.94,
      trips: 1840,
      vehicleModel: 'Tata Nexon EV (Green Fleet)',
      vehicleTier: 'Electric SUV',
      plateNumber: 'DL 03 EV 2841',
      driverAge: 29,
      quotedFareINR: 580,
      etaMinutes: 3,
      distanceKm: 0.8,
      badge: 'Lowest Fare / Green EV',
      verified: true,
    },
    {
      id: 'bid-2',
      name: 'Rajesh Kumar',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      rating: 4.97,
      trips: 4210,
      vehicleModel: 'Honda City Prime (Silver)',
      vehicleTier: 'Prime Sedan',
      plateNumber: 'DL 01 AB 4829',
      driverAge: 38,
      quotedFareINR: 650,
      etaMinutes: 4,
      distanceKm: 1.2,
      badge: 'Top Rated Prime Chauffeur',
      verified: true,
    },
    {
      id: 'bid-3',
      name: 'Vikram Sharma',
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80',
      rating: 4.91,
      trips: 2650,
      vehicleModel: 'Maruti Suzuki Dzire (White)',
      vehicleTier: 'Comfort Sedan',
      plateNumber: 'DL 08 CD 1042',
      driverAge: 34,
      quotedFareINR: 610,
      etaMinutes: 4,
      distanceKm: 1.4,
      badge: 'Quick Pickup',
      verified: true,
    },
    {
      id: 'bid-4',
      name: 'Gurpreet Singh',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      rating: 4.98,
      trips: 5890,
      vehicleModel: 'Toyota Innova Crysta (Pearl White)',
      vehicleTier: 'Prime 7-Seater SUV',
      plateNumber: 'HR 26 CQ 8190',
      driverAge: 47,
      quotedFareINR: 740,
      etaMinutes: 5,
      distanceKm: 1.8,
      badge: 'Senior Veteran Driver',
      verified: true,
    },
  ];

  // Transition Step 5 -> Broadcast Bidding
  const handleBroadcastTrip = () => {
    setFlowState('bidding');
    setVisibleBidsCount(1);

    // Stagger arrival of subsequent driver bids for live dynamic effect
    setTimeout(() => setVisibleBidsCount(2), 800);
    setTimeout(() => setVisibleBidsCount(3), 1600);
    setTimeout(() => setVisibleBidsCount(4), 2400);

    if (onBroadcastTrip) {
      onBroadcastTrip({
        pickup,
        destination,
        stops,
        selectedVehicle,
        driverAgePref,
        specialNotes,
        initialBids: driverQuotes,
      });
    }
  };

  // Live Bids list: Combine sharedTrip bids with local driverQuotes
  const displayedBids = useMemo(() => {
    if (sharedTrip?.bids && sharedTrip.bids.length > 0) {
      return sharedTrip.bids;
    }
    return driverQuotes.slice(0, visibleBidsCount);
  }, [sharedTrip?.bids, visibleBidsCount]);

  // Synchronize state when driver updates active ride from Driver Dashboard
  useEffect(() => {
    if (!sharedTrip) return;
    if (sharedTrip.status === 'broadcasting') {
      if (flowState === 'idle') {
        setFlowState('bidding');
      }
    } else if (sharedTrip.status === 'matched_en_route') {
      setFlowState('en-route');
      setRidePhase('driver-arriving');
      if (sharedTrip.matchedBid) {
        setSelectedDriverForCall(sharedTrip.matchedBid);
      }
      setPickupOtp(sharedTrip.pickupOtp);
    } else if (sharedTrip.status === 'in_transit') {
      setFlowState('en-route');
      setRidePhase('trip-in-progress');
      if (sharedTrip.matchedBid) {
        setSelectedDriverForCall(sharedTrip.matchedBid);
      }
      setDropoffOtp(sharedTrip.dropoffOtp);
    } else if (sharedTrip.status === 'completed') {
      setFlowState('en-route');
      setRidePhase('trip-completed');
      if (sharedTrip.matchedBid) {
        setSelectedDriverForCall(sharedTrip.matchedBid);
      }
    }
  }, [sharedTrip?.status, sharedTrip?.matchedBid, sharedTrip?.pickupOtp, sharedTrip?.dropoffOtp, flowState]);

  // Open Escrow Modal for selected driver
  const handleOpenEscrowModal = (bid: DriverBid) => {
    setSelectedDriverForCall(bid);
    setEscrowModalOpen(true);
  };

  // User confirms Escrow Lock -> Start 2-Minute Call
  const handleConfirmEscrowAndCall = () => {
    setEscrowModalOpen(false);
    setFlowState('in-call');
    setCallTimeRemaining(120);
    setCallConnected(false);

    // Simulate driver answering after 3 seconds
    setTimeout(() => {
      setCallConnected(true);
    }, 2800);
  };

  // In-Call Countdown Timer Effect
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (flowState === 'in-call' && callTimeRemaining > 0) {
      timer = setInterval(() => {
        setCallTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [flowState, callTimeRemaining]);

  // Format timer as mm:ss
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Final confirmation from call:
  // Post-Call Customer Payment: full quoted fare collected and held in "GoRide Escrow Vault"
  // Status: "Escrow Locked (Trip in Progress)" - 0% released to driver immediately
  const handleConfirmRideFromCall = () => {
    setFlowState('en-route');
    setRidePhase('driver-arriving');
    const pOtp = sharedTrip?.pickupOtp || '4821';
    const dOtp = sharedTrip?.dropoffOtp || '9245';
    setPickupOtp(pOtp);
    setDropoffOtp(dOtp);
    setEnteredDropoffOtp('');
    setDropoffOtpError('');
    setDriverRating(5);
    setSelectedTip(0);

    if (onCustomerConfirmRide && selectedDriverForCall) {
      onCustomerConfirmRide(selectedDriverForCall);
    }
  };

  // Stage 1 Verification: Driver arrives and verifies Pickup OTP -> Start Journey
  const handleVerifyPickupOtp = () => {
    setRidePhase('trip-in-progress');
    if (onCustomerVerifyPickupOtp) {
      onCustomerVerifyPickupOtp();
    }
  };

  // Stage 2 Verification: Driver verifies Drop-off OTP at destination -> release payout
  const handleVerifyDropoffOtp = () => {
    const validOtp = sharedTrip?.dropoffOtp || dropoffOtp;
    if (enteredDropoffOtp.trim() === validOtp) {
      setDropoffOtpError('');
      setRidePhase('trip-completed');
      if (onCustomerVerifyDropoffOtp) {
        onCustomerVerifyDropoffOtp(enteredDropoffOtp);
      }
      try {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }
    } else {
      setDropoffOtpError(`Invalid OTP! Please enter the rider's 4-digit Drop-off OTP: ${validOtp}`);
    }
  };

  // Quick 1-click simulation for Drop-off OTP verification
  const handleSimulateDropoffArrival = () => {
    const validOtp = sharedTrip?.dropoffOtp || dropoffOtp;
    setEnteredDropoffOtp(validOtp);
    setDropoffOtpError('');
    setRidePhase('trip-completed');
    if (onCustomerVerifyDropoffOtp) {
      onCustomerVerifyDropoffOtp(validOtp);
    }
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.55 }
      });
    } catch {
      // ignore
    }
  };

  // Copy OTP helper
  const handleCopyOtp = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedOtp(code);
    setTimeout(() => setCopiedOtp(null), 2500);
  };

  // Cancel call and release escrow
  const handleCancelCall = () => {
    setFlowState('bidding');
    setSelectedDriverForCall(null);
  };

  // Full reset back to Stepper
  const handleResetToStepper = () => {
    setFlowState('idle');
    setCurrentStep(1);
    setSelectedDriverForCall(null);
    setVisibleBidsCount(0);
    setRidePhase('driver-arriving');
    setEnteredDropoffOtp('');
    setDropoffOtpError('');
    setSelectedTip(0);
    if (onResetTrip) {
      onResetTrip();
    }
  };

  const expectationShortcuts = [
    '🧳 Empty Boot Space',
    '🤫 Silent / No-Talk Ride',
    '❄️ AC on High',
    '📱 Fast Phone Charger Needed',
    '🚭 Non-Smoker Driver Only',
    '🎵 Soft Instrumental Music',
  ];

  return (
    <div className="w-full max-w-7xl mx-auto py-2 animate-fade-in">
      
      {/* Top Calming Status Bar */}
      <div className="mb-8 px-6 py-4 rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl shadow-black/20">
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-emerald-300">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm text-white tracking-wide">
                Bespoke Chauffeur Itinerary
              </span>
              <span className="text-[10px] tracking-wider text-emerald-300/90 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-light">
                Private Dispatch
              </span>
            </div>
            <p className="text-xs text-slate-400 font-light mt-0.5">
              Specify your itinerary with zero rigid fares. Verified commercial chauffeurs submit competitive offers directly.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-300 bg-white/[0.04] px-4 py-2 rounded-full border border-white/10 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="font-light">
            {flowState === 'en-route'
              ? ridePhase === 'driver-arriving'
                ? `Chauffeur En Route for ${riderName}`
                : ridePhase === 'trip-in-progress'
                ? `In-Transit (${riderName})`
                : 'Journey Completed • Escrow Released'
              : flowState === 'in-call'
              ? 'Chauffeur Connected • Escrow Protected'
              : flowState === 'bidding'
              ? 'Receiving Verified Chauffeur Quotes'
              : `Step ${currentStep} of 5 • Route Specification`}
          </span>
        </div>
      </div>

      {/* Main Grid: Stepper Form / Bids (Left 7 Cols) & Live Summary (Right 5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left 7 Columns */}
        <div className="lg:col-span-7">
          
          {/* ==================== STATE 1: 5-STEP STEPPER FORM (NO STATIC PRICE) ==================== */}
          {flowState === 'idle' && (
            <div className="bg-black/40 backdrop-blur-2xl rounded-3xl p-7 sm:p-10 border border-white/10 shadow-2xl space-y-9">
              
              <div className="relative space-y-9">
                
                {/* ---------------- STEP 1: Pickup & Drop ---------------- */}
                <div className="relative flex items-start gap-4 sm:gap-5">
                  <div className="flex flex-col items-center">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center font-mono font-medium text-xs transition-all duration-300 ${
                        currentStep === 1
                          ? 'bg-white/15 text-white ring-2 ring-emerald-400/30 border border-white/25 shadow-lg shadow-black/30'
                          : currentStep > 1
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-white/[0.03] text-slate-500 border border-white/10'
                      }`}
                    >
                      {currentStep > 1 ? <Check className="w-4 h-4 stroke-[2.5]" /> : '1'}
                    </button>
                    <div className={`w-px h-full min-h-[48px] my-1.5 transition-colors ${
                      currentStep > 1 ? 'bg-emerald-500/30' : 'bg-white/10'
                    }`} />
                  </div>

                  <div className="flex-1 pb-4">
                    <div className="flex items-center justify-between mb-3.5">
                      <div>
                        <h3 className="font-medium text-base text-white tracking-wide">Pickup & Destination</h3>
                        <p className="text-xs text-slate-400 font-light">Set origin, destination, and key transit points</p>
                      </div>
                      {currentStep > 1 && (
                        <button
                          onClick={() => setCurrentStep(1)}
                          className="text-xs font-light text-emerald-300 hover:text-emerald-200 transition-colors"
                        >
                          Modify
                        </button>
                      )}
                    </div>

                    {currentStep === 1 ? (
                      <div className="space-y-4 p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/10 animate-fade-in">
                        {/* Pickup Input */}
                        <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 focus-within:border-white/25 focus-within:ring-1 focus-within:ring-white/15 transition-all">
                          <Navigation className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                          <div className="flex-1">
                            <label className="block text-[10px] tracking-wider uppercase text-slate-400 font-light mb-0.5">
                              Pickup Location
                            </label>
                            <input
                              type="text"
                              value={pickup}
                              onChange={(e) => setPickup(e.target.value)}
                              placeholder="Enter pickup address..."
                              className="w-full bg-transparent text-sm font-normal text-white focus:outline-none placeholder-slate-500"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => setPickup('Current GPS Location (High Accuracy)')}
                            className="px-2.5 py-1 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-emerald-300 text-xs flex items-center gap-1 transition-colors border border-white/10"
                            title="Use Current Location"
                          >
                            <LocateFixed className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline text-[11px] font-light">Current GPS</span>
                          </button>
                        </div>

                        {/* Swap Button */}
                        <div className="flex justify-center -my-1.5 relative z-10">
                          <button
                            type="button"
                            onClick={handleSwapAddresses}
                            className="p-2 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-emerald-300 border border-white/10 shadow-md transition-all hover:rotate-180"
                            title="Swap Pickup and Drop"
                          >
                            <ArrowUpDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Drop Destination Input */}
                        <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 focus-within:border-white/25 focus-within:ring-1 focus-within:ring-white/15 transition-all">
                          <MapPin className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                          <div className="flex-1">
                            <label className="block text-[10px] tracking-wider uppercase text-slate-400 font-light mb-0.5">
                              Destination
                            </label>
                            <input
                              type="text"
                              value={destination}
                              onChange={(e) => setDestination(e.target.value)}
                              placeholder="Enter drop destination..."
                              className="w-full bg-transparent text-sm font-normal text-white focus:outline-none placeholder-slate-500"
                            />
                          </div>
                        </div>

                        {/* Quick preset landmark pills */}
                        <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
                          <span className="text-[11px] text-slate-500 font-light">Popular:</span>
                          {[
                            'IGI Airport T3',
                            'Cyber Hub Gurugram',
                            'Noida Sector 62',
                            'Connaught Place',
                          ].map((item) => (
                            <button
                              key={item}
                              type="button"
                              onClick={() => setDestination(item)}
                              className="px-2.5 py-1 rounded-full bg-white/[0.03] hover:bg-white/[0.07] text-slate-300 hover:text-white border border-white/10 text-xs transition-colors"
                            >
                              {item}
                            </button>
                          ))}
                        </div>

                        <div className="pt-2 flex justify-end">
                          <button
                            type="button"
                            onClick={() => setCurrentStep(2)}
                            disabled={!pickup.trim() || !destination.trim()}
                            className="px-6 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs sm:text-sm flex items-center gap-2 transition-all border border-white/15 shadow-md shadow-black/20 hover:scale-[1.01] disabled:opacity-40"
                          >
                            <span>Next: Route & Stops</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 space-y-1.5 bg-white/[0.02] p-3.5 rounded-2xl border border-white/10">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          <span className="truncate text-slate-300 font-normal">{pickup}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                          <span className="truncate text-slate-300 font-normal">{destination}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* ---------------- STEP 2: Route & Stops ---------------- */}
                <div className="relative flex items-start gap-4 sm:gap-5">
                  <div className="flex flex-col items-center">
                    <button
                      onClick={() => setCurrentStep(2)}
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center font-mono font-medium text-xs transition-all duration-300 ${
                        currentStep === 2
                          ? 'bg-white/15 text-white ring-2 ring-emerald-400/30 border border-white/25 shadow-lg shadow-black/30'
                          : currentStep > 2
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-white/[0.03] text-slate-500 border border-white/10'
                      }`}
                    >
                      {currentStep > 2 ? <Check className="w-4 h-4 stroke-[2.5]" /> : '2'}
                    </button>
                    <div className={`w-px h-full min-h-[48px] my-1.5 transition-colors ${
                      currentStep > 2 ? 'bg-emerald-500/30' : 'bg-white/10'
                    }`} />
                  </div>

                  <div className="flex-1 pb-4">
                    <div className="flex items-center justify-between mb-3.5">
                      <div>
                        <h3 className="font-medium text-base text-white tracking-wide">Route & Intermediate Halts</h3>
                        <p className="text-xs text-slate-400 font-light">Add custom stops or choose a serene direct journey</p>
                      </div>
                      {currentStep > 2 && (
                        <button
                          onClick={() => setCurrentStep(2)}
                          className="text-xs font-light text-emerald-300 hover:text-emerald-200 transition-colors"
                        >
                          Modify
                        </button>
                      )}
                    </div>

                    {currentStep === 2 ? (
                      <div className="space-y-4 p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/10 animate-fade-in">
                        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
                          <div>
                            <span className="block text-xs font-medium text-white">Direct Non-Stop Journey?</span>
                            <span className="text-[11px] text-slate-400 font-light">Smooth point-to-point transfer with no pauses</span>
                          </div>
                          <button
                            type="button"
                            onClick={handleSelectDirectRoute}
                            className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-emerald-300 border border-white/10 font-normal text-xs flex items-center gap-1.5 transition-all"
                          >
                            <Shuffle className="w-3.5 h-3.5" />
                            <span>Direct Route (Skip)</span>
                          </button>
                        </div>

                        <div className="space-y-3">
                          {stops.map((stop, idx) => (
                            <div key={stop.id} className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-lg bg-white/[0.06] text-emerald-300 font-mono text-[10px] font-medium flex items-center justify-center border border-white/10">
                                  {idx + 1}
                                </span>
                                <input
                                  type="text"
                                  value={stop.address}
                                  onChange={(e) => handleUpdateStop(stop.id, e.target.value)}
                                  placeholder={`Stop ${idx + 1} address (e.g. Office, Cafe, Friend's house)...`}
                                  className="flex-1 bg-transparent text-xs font-normal text-white focus:outline-none placeholder-slate-500"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveStop(stop.id)}
                                  className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                                  title="Remove stop"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              <div className="flex items-center gap-2 pt-1 border-t border-white/[0.06] text-[11px]">
                                <span className="text-slate-400 font-light flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> Halt Time:
                                </span>
                                {[
                                  { id: '15m', label: '15m Quick Stop' },
                                  { id: '30m', label: '30m Meal' },
                                  { id: '60m', label: '60m Break' },
                                ].map((d) => (
                                  <button
                                    key={d.id}
                                    type="button"
                                    onClick={() => handleUpdateStop(stop.id, stop.address, d.id as any)}
                                    className={`px-2.5 py-1 rounded-xl text-[10px] border transition-colors ${
                                      stop.haltDuration === d.id
                                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-medium'
                                        : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-slate-200'
                                    }`}
                                  >
                                    {d.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}

                          {stops.length < 4 && (
                            <button
                              type="button"
                              onClick={handleAddStop}
                              className="w-full py-3 rounded-2xl border border-dashed border-white/15 hover:border-emerald-400/40 text-slate-400 hover:text-emerald-300 text-xs font-light flex items-center justify-center gap-1.5 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                              <span>Add Another Intermediate Stop</span>
                            </button>
                          )}
                        </div>

                        <div className="pt-2 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => setCurrentStep(1)}
                            className="px-4 py-2 rounded-xl text-xs font-light text-slate-400 hover:text-white flex items-center gap-1"
                          >
                            <ChevronLeft className="w-4 h-4" />
                            <span>Back</span>
                          </button>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={handleSelectDirectRoute}
                              className="px-3 py-2 rounded-xl text-xs font-light text-slate-400 hover:text-white"
                            >
                              Skip Stops
                            </button>
                            <button
                              type="button"
                              onClick={() => setCurrentStep(3)}
                              className="px-6 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs sm:text-sm flex items-center gap-1.5 transition-all border border-white/15 shadow-md shadow-black/20"
                            >
                              <span>Next: Vehicle Choice</span>
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 bg-white/[0.02] p-3.5 rounded-2xl border border-white/10">
                        {isDirectRoute || stops.length === 0 ? (
                          <span className="text-emerald-300/90 font-normal">✓ Direct Non-Stop Route</span>
                        ) : (
                          <span>✓ {stops.length} Intermediate {stops.length === 1 ? 'Stop' : 'Stops'} with Scheduled Halts</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* ---------------- STEP 3: Vehicle Selection (NO FIXED PRICE) ---------------- */}
                <div className="relative flex items-start gap-4 sm:gap-5">
                  <div className="flex flex-col items-center">
                    <button
                      onClick={() => setCurrentStep(3)}
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center font-mono font-medium text-xs transition-all duration-300 ${
                        currentStep === 3
                          ? 'bg-white/15 text-white ring-2 ring-emerald-400/30 border border-white/25 shadow-lg shadow-black/30'
                          : currentStep > 3
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-white/[0.03] text-slate-500 border border-white/10'
                      }`}
                    >
                      {currentStep > 3 ? <Check className="w-4 h-4 stroke-[2.5]" /> : '3'}
                    </button>
                    <div className={`w-px h-full min-h-[48px] my-1.5 transition-colors ${
                      currentStep > 3 ? 'bg-emerald-500/30' : 'bg-white/10'
                    }`} />
                  </div>

                  <div className="flex-1 pb-4">
                    <div className="flex items-center justify-between mb-3.5">
                      <div>
                        <h3 className="font-medium text-base text-white tracking-wide">Vehicle Category</h3>
                        <p className="text-xs text-slate-400 font-light">Chauffeurs submit quotes tailored to your chosen tier</p>
                      </div>
                      {currentStep > 3 && (
                        <button
                          onClick={() => setCurrentStep(3)}
                          className="text-xs font-light text-emerald-300 hover:text-emerald-200 transition-colors"
                        >
                          Modify
                        </button>
                      )}
                    </div>

                    {currentStep === 3 ? (
                      <div className="space-y-4 p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/10 animate-fade-in">
                        
                        {/* Prominent Any / Random Vehicle Option */}
                        <div
                          onClick={() => {
                            setSelectedVehicle('any');
                            setCurrentStep(4);
                          }}
                          className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-white/20 cursor-pointer flex items-center justify-between transition-all group"
                        >
                          <div className="flex items-center gap-3.5">
                            <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-emerald-300">
                              <Shuffle className="w-4 h-4 group-hover:rotate-180 transition-transform" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-sm text-white">Any Vehicle Category</h4>
                                <span className="text-[10px] font-mono bg-emerald-500/15 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                  Fastest Response
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 font-light">Allows all nearby certified sedans, EVs, and SUVs to bid</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-light text-emerald-300 block">Open Broadcast &gt;&gt;</span>
                          </div>
                        </div>

                        {/* Vehicle Category Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          {vehicles.filter(v => v.id !== 'any').map((v) => (
                            <div
                              key={v.id}
                              onClick={() => setSelectedVehicle(v.id)}
                              className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 ${
                                selectedVehicle === v.id
                                  ? 'bg-white/[0.08] border-white/25 shadow-xl shadow-black/30 ring-1 ring-emerald-400/30'
                                  : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.05]'
                              }`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <span className="text-[10px] font-mono text-emerald-300/80 uppercase font-light">
                                    {v.badge}
                                  </span>
                                  <h4 className="font-medium text-sm text-white">{v.name}</h4>
                                  <p className="text-[11px] text-slate-400 font-light">{v.models}</p>
                                </div>
                                <div className="text-right">
                                  <span className="text-[11px] font-mono text-slate-300 font-light block">
                                    {v.priceRange}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2.5 pt-2 border-t border-white/[0.06] text-[11px] text-slate-400 font-light">
                                <span>{v.seats} seats</span>
                                <span>•</span>
                                <span>{v.luggage} bags</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="pt-2 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => setCurrentStep(2)}
                            className="px-4 py-2 rounded-xl text-xs font-light text-slate-400 hover:text-white flex items-center gap-1"
                          >
                            <ChevronLeft className="w-4 h-4" />
                            <span>Back</span>
                          </button>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedVehicle('any');
                                setCurrentStep(4);
                              }}
                              className="px-3 py-2 rounded-xl text-xs font-light text-slate-400 hover:text-white"
                            >
                              Any Vehicle
                            </button>
                            <button
                              type="button"
                              onClick={() => setCurrentStep(4)}
                              className="px-6 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs sm:text-sm flex items-center gap-1.5 transition-all border border-white/15 shadow-md shadow-black/20"
                            >
                              <span>Next: Driver Preference</span>
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 bg-white/[0.02] p-3.5 rounded-2xl border border-white/10 flex items-center justify-between">
                        <span>✓ Category: <strong className="text-white font-medium">{currentVehicleObj.name}</strong></span>
                        <span className="text-[10px] font-mono text-slate-300 font-light">{currentVehicleObj.priceRange}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* ---------------- STEP 4: Driver Age Preference ---------------- */}
                <div className="relative flex items-start gap-4 sm:gap-5">
                  <div className="flex flex-col items-center">
                    <button
                      onClick={() => setCurrentStep(4)}
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center font-mono font-medium text-xs transition-all duration-300 ${
                        currentStep === 4
                          ? 'bg-white/15 text-white ring-2 ring-emerald-400/30 border border-white/25 shadow-lg shadow-black/30'
                          : currentStep > 4
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-white/[0.03] text-slate-500 border border-white/10'
                      }`}
                    >
                      {currentStep > 4 ? <Check className="w-4 h-4 stroke-[2.5]" /> : '4'}
                    </button>
                    <div className={`w-px h-full min-h-[48px] my-1.5 transition-colors ${
                      currentStep > 4 ? 'bg-emerald-500/30' : 'bg-white/10'
                    }`} />
                  </div>

                  <div className="flex-1 pb-4">
                    <div className="flex items-center justify-between mb-3.5">
                      <div>
                        <h3 className="font-medium text-base text-white tracking-wide">Chauffeur Experience</h3>
                        <p className="text-xs text-slate-400 font-light">Select preferred experience tier or broadcast to all verified drivers</p>
                      </div>
                      {currentStep > 4 && (
                        <button
                          onClick={() => setCurrentStep(4)}
                          className="text-xs font-light text-emerald-300 hover:text-emerald-200 transition-colors"
                        >
                          Modify
                        </button>
                      )}
                    </div>

                    {currentStep === 4 ? (
                      <div className="space-y-4 p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/10 animate-fade-in">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          {[
                            { id: 'any', label: 'Any Experience (Fastest)', desc: 'Broadcasts to all verified chauffeurs in area' },
                            { id: '21-30', label: '21 – 30 Years', desc: 'Tech-savvy, brisk navigation, smooth city pacers' },
                            { id: '31-45', label: '31 – 45 Years', desc: 'Balanced experienced navigators, executive calm' },
                            { id: '45+', label: '45+ Years', desc: 'Senior veteran chauffeurs, gentle and defensive ride' },
                          ].map((age) => (
                            <button
                              key={age.id}
                              type="button"
                              onClick={() => setDriverAgePref(age.id as any)}
                              className={`p-4 rounded-2xl text-left border transition-all duration-300 ${
                                driverAgePref === age.id
                                  ? 'bg-white/[0.08] border-white/25 shadow-xl shadow-black/30 ring-1 ring-emerald-400/30'
                                  : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.05]'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs sm:text-sm font-medium text-white">{age.label}</span>
                                {driverAgePref === age.id && (
                                  <Check className="w-4 h-4 text-emerald-300" />
                                )}
                              </div>
                              <span className="text-[11px] text-slate-400 font-light block">{age.desc}</span>
                            </button>
                          ))}
                        </div>

                        <div className="pt-2 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => setCurrentStep(3)}
                            className="px-4 py-2 rounded-xl text-xs font-light text-slate-400 hover:text-white flex items-center gap-1"
                          >
                            <ChevronLeft className="w-4 h-4" />
                            <span>Back</span>
                          </button>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setDriverAgePref('any');
                                setCurrentStep(5);
                              }}
                              className="px-3 py-2 rounded-xl text-xs font-light text-slate-400 hover:text-white"
                            >
                              Any Age (Skip)
                            </button>
                            <button
                              type="button"
                              onClick={() => setCurrentStep(5)}
                              className="px-6 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs sm:text-sm flex items-center gap-1.5 transition-all border border-white/15 shadow-md shadow-black/20"
                            >
                              <span>Next: Special Notes</span>
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 bg-white/[0.02] p-3.5 rounded-2xl border border-white/10">
                        <span>✓ Experience Band: <strong className="text-white font-medium">
                          {driverAgePref === 'any' ? 'Any Experience / Open Broadcast' : `${driverAgePref} Years`}
                        </strong></span>
                      </div>
                    )}
                  </div>
                </div>

                {/* ---------------- STEP 5: Special Expectations ---------------- */}
                <div className="relative flex items-start gap-4 sm:gap-5">
                  <div className="flex flex-col items-center">
                    <button
                      onClick={() => setCurrentStep(5)}
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center font-mono font-medium text-xs transition-all duration-300 ${
                        currentStep === 5
                          ? 'bg-white/15 text-white ring-2 ring-emerald-400/30 border border-white/25 shadow-lg shadow-black/30'
                          : 'bg-white/[0.03] text-slate-500 border border-white/10'
                      }`}
                    >
                      5
                    </button>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3.5">
                      <div>
                        <h3 className="font-medium text-base text-white tracking-wide">Special Expectations & Comfort</h3>
                        <p className="text-xs text-slate-400 font-light">Add luggage requirements, silent cabin preference, or temperature notes</p>
                      </div>
                    </div>

                    {currentStep === 5 && (
                      <div className="space-y-4 p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/10 animate-fade-in">
                        
                        <div className="space-y-2">
                          <label className="block text-[11px] tracking-wider uppercase text-slate-400 font-light">
                            Quick Preferences:
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {expectationShortcuts.map((tag) => (
                              <button
                                key={tag}
                                type="button"
                                onClick={() => {
                                  if (!specialNotes.includes(tag)) {
                                    setSpecialNotes(prev => prev ? `${prev}, ${tag}` : tag);
                                  }
                                }}
                                className="px-3 py-1 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/10 text-xs transition-colors"
                              >
                                + {tag}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] tracking-wider uppercase text-slate-400 font-light mb-1">
                            Notes for Chauffeur:
                          </label>
                          <textarea
                            rows={3}
                            value={specialNotes}
                            onChange={(e) => setSpecialNotes(e.target.value)}
                            placeholder="e.g. Empty boot space for luggage, quiet ride, climate control at 22°C..."
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-white/30 transition-colors"
                          />
                        </div>

                        <div className="pt-2 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => setCurrentStep(4)}
                            className="px-4 py-2 rounded-xl text-xs font-light text-slate-400 hover:text-white flex items-center gap-1"
                          >
                            <ChevronLeft className="w-4 h-4" />
                            <span>Back</span>
                          </button>

                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                setSpecialNotes('');
                                handleBroadcastTrip();
                              }}
                              className="px-4 py-2.5 rounded-2xl text-xs font-light text-slate-400 hover:text-white transition-colors"
                            >
                              Skip Notes
                            </button>

                            {/* PRIMARY CTA: Broadcast Trip to Drivers */}
                            <button
                              type="button"
                              onClick={handleBroadcastTrip}
                              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500/90 to-teal-600/90 hover:from-emerald-400 hover:to-teal-500 text-white font-medium text-xs sm:text-sm flex items-center gap-2 transition-all shadow-xl shadow-emerald-950/40 border border-emerald-400/30 hover:scale-[1.01]"
                            >
                              <Radio className="w-4 h-4 text-emerald-200" />
                              <span>Broadcast & Receive Live Quotes</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ==================== STATE 2: DRIVER BIDDING SCREEN (POST-STEP 5) ==================== */}
          {flowState === 'bidding' && (
            <div className="bg-black/40 backdrop-blur-2xl rounded-3xl p-7 sm:p-10 border border-white/10 shadow-2xl space-y-7 animate-fade-in">
              
              {/* Radar Broadcasting Status Header */}
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-emerald-300 shadow-sm">
                    <Radio className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm sm:text-base text-white tracking-wide">
                      Broadcasting Itinerary to Verified Chauffeurs
                    </h3>
                    <p className="text-xs text-slate-400 font-light mt-0.5">
                      Nearby private commercial drivers are reviewing your route. {visibleBidsCount} offers received.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleResetToStepper}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 bg-white/[0.04] px-3.5 py-2 rounded-xl border border-white/10 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Modify Route</span>
                </button>
              </div>

              {/* Bids List Header */}
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span className="font-light tracking-wider uppercase text-emerald-300 text-[11px]">
                  Incoming Chauffeur Quotes ({visibleBidsCount} of 4)
                </span>
                <span className="font-light">Select quote to lock securely in escrow</span>
              </div>

              {/* Driver Bids Cards List */}
              <div className="space-y-4">
                {displayedBids.map((bid) => (
                  <div
                    key={bid.id}
                    className={`p-5 rounded-3xl border transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-slide-up backdrop-blur-xl ${
                      bid.isLoggedInPartner
                        ? 'bg-white/[0.06] border-emerald-400/40 shadow-xl shadow-black/30 ring-1 ring-emerald-400/30'
                        : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.05] hover:border-white/20'
                    }`}
                  >
                    {/* Driver Avatar & Info */}
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img
                          src={bid.avatar}
                          alt={bid.name}
                          className="w-14 h-14 rounded-2xl object-cover border border-white/15"
                        />
                        {bid.verified && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-md">
                            <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-medium text-base text-white">{bid.name}</h4>
                          <span className="text-[11px] font-normal text-amber-300/90 bg-white/[0.05] px-2 py-0.5 rounded-full border border-white/10">
                            ★ {bid.rating.toFixed(2)} ({bid.trips})
                          </span>
                          {bid.isLoggedInPartner && (
                            <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30 font-medium">
                              LIVE PARTNER QUOTE (YOU)
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-300 font-light mt-0.5">
                          {bid.vehicleModel} • <span className="text-slate-400">{bid.plateNumber}</span>
                        </p>

                        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-light mt-1">
                          <span>Driver Age: <strong className="text-slate-200 font-normal">{bid.driverAge} yrs</strong></span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-emerald-300 font-normal">
                            <Clock className="w-3 h-3" /> {bid.etaMinutes} mins away ({bid.distanceKm} km)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Fare Quote & Escrow Lock CTA */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/[0.06]">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] tracking-wider uppercase text-slate-400 block font-light">
                          Quoted Fare
                        </span>
                        <span className="font-light text-2xl text-white block leading-tight">
                          ₹{bid.quotedFareINR}
                        </span>
                        <span className="text-[10px] text-slate-400 font-light">All-Inclusive</span>
                      </div>

                      <button
                        onClick={() => handleOpenEscrowModal(bid)}
                        className="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs flex items-center gap-1.5 transition-all border border-white/15 shadow-md shadow-black/20 hover:scale-[1.01] whitespace-nowrap"
                      >
                        <Lock className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Lock ₹{bid.quotedFareINR} & Call</span>
                      </button>
                    </div>
                  </div>
                ))}

                {/* Staggered loading indicator */}
                {visibleBidsCount < 4 && (
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-dashed border-white/10 flex items-center justify-center gap-2.5 text-xs text-slate-400 font-light">
                    <div className="w-4 h-4 border-2 border-emerald-400/60 border-t-transparent rounded-full animate-spin" />
                    <span>Awaiting remaining chauffeur responses...</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================== STATE 3: 2-MINUTE CALL SIMULATION ==================== */}
          {flowState === 'in-call' && selectedDriverForCall && (
            <div className="bg-black/40 backdrop-blur-2xl rounded-3xl p-8 sm:p-10 border border-white/10 shadow-2xl space-y-7 animate-fade-in text-center">
              
              {/* Call Relay Header */}
              <div className="max-w-md mx-auto space-y-2">
                <span className="text-xs uppercase bg-white/[0.05] text-emerald-300 px-3.5 py-1 rounded-full border border-white/10 font-light inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Secure Escrow Protected Call</span>
                </span>
                <h3 className="font-medium text-2xl text-white">
                  {callConnected ? `Connected with ${selectedDriverForCall.name}` : `Calling ${selectedDriverForCall.name}...`}
                </h3>
                <p className="text-xs text-slate-400 font-light">
                  Fare of <strong className="text-white font-normal">₹{selectedDriverForCall.quotedFareINR}</strong> will be secured in GoRide Escrow. No offline fare changes allowed.
                </p>
              </div>

              {/* In-Call Visual & Countdown Timer */}
              <div className="py-6 flex flex-col items-center justify-center space-y-4">
                <div className="relative">
                  <img
                    src={selectedDriverForCall.avatar}
                    alt={selectedDriverForCall.name}
                    className="w-24 h-24 rounded-3xl object-cover border border-white/20 shadow-2xl"
                  />
                  <div className="absolute inset-0 rounded-3xl border border-emerald-400/40 pointer-events-none" />
                </div>

                <div>
                  <span className="block font-light text-3xl text-white">
                    {formatTimer(callTimeRemaining)}
                  </span>
                  <span className="text-xs text-slate-400 font-light">
                    {callConnected ? '2-Minute Consultation Active' : 'Connecting through secure relay...'}
                  </span>
                </div>

                {/* Animated Audio Wave graphic */}
                {callConnected && (
                  <div className="flex items-center gap-1 h-6">
                    <span className="w-1 bg-emerald-400/80 rounded-full animate-bounce h-3" />
                    <span className="w-1 bg-emerald-400/80 rounded-full animate-bounce h-5 [animation-delay:0.2s]" />
                    <span className="w-1 bg-emerald-400/80 rounded-full animate-bounce h-2 [animation-delay:0.4s]" />
                    <span className="w-1 bg-emerald-400/80 rounded-full animate-bounce h-6 [animation-delay:0.1s]" />
                    <span className="w-1 bg-emerald-400/80 rounded-full animate-bounce h-4 [animation-delay:0.3s]" />
                  </div>
                )}
              </div>

              {/* Call Actions */}
              <div className="max-w-md mx-auto p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3.5">
                <p className="text-xs text-slate-300 font-light">
                  When confirmed, quoted fare <strong className="text-white font-normal">₹{selectedDriverForCall.quotedFareINR}</strong> is deposited in the Escrow Vault and released only upon Drop-off OTP verification.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleCancelCall}
                    className="flex-1 py-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] text-rose-300 font-light text-xs flex items-center justify-center gap-1.5 transition-colors border border-white/10"
                  >
                    <PhoneOff className="w-4 h-4" />
                    <span>Return to Bids</span>
                  </button>

                  <button
                    onClick={handleConfirmRideFromCall}
                    className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-emerald-500/90 to-teal-600/90 hover:from-emerald-400 hover:to-teal-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-emerald-950/30 border border-emerald-400/30"
                  >
                    <Lock className="w-4 h-4 text-emerald-200" />
                    <span>Lock ₹{selectedDriverForCall.quotedFareINR} & Confirm</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==================== STATE 4: RIDE LIFECYCLE & TWO-STAGE OTP SETTLEMENT ==================== */}
          {flowState === 'en-route' && selectedDriverForCall && (
            <div className="space-y-6 animate-fade-in">
              {(() => {
                const quotedFare = selectedDriverForCall.quotedFareINR;
                const platformCommission = Math.round(quotedFare * 0.15); // 15% GoRide Platform Commission
                const driverWalletCredit = quotedFare - platformCommission; // 85% Driver Payout Wallet
                const totalDriverWithTip = driverWalletCredit + selectedTip;

                return (
                  <>
                    {/* Top Vault Escrow Status Bar */}
                    <div className="p-5 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-lg shadow-black/20 transition-all">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-normal ${
                            ridePhase === 'trip-completed'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-white/[0.06] text-emerald-300 border border-white/10'
                          }`}>
                            {ridePhase === 'trip-completed' ? (
                              <ShieldCheck className="w-5 h-5" />
                            ) : (
                              <Lock className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] uppercase tracking-wider font-light text-slate-300">
                                Escrow Vault Status:
                              </span>
                              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-light uppercase tracking-wider ${
                                ridePhase === 'trip-completed'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-white/[0.06] text-amber-200 border border-white/10'
                              }`}>
                                {ridePhase === 'trip-completed' ? 'Escrow Released & Settled' : 'Escrow Locked (Trip in Progress)'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 font-light mt-0.5">
                              {ridePhase === 'trip-completed' ? (
                                <>
                                  <strong className="text-white font-normal">₹{driverWalletCredit}</strong> (85% net fare) released to {selectedDriverForCall.name}'s Driver Wallet. Platform commission of <strong className="text-slate-300 font-normal">₹{platformCommission}</strong> (15%) retained.
                                </>
                              ) : (
                                <>
                                  <strong className="text-white font-normal">₹{quotedFare}</strong> securely held in Escrow Vault. Zero released until destination Drop-off OTP is verified.
                                </>
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="text-left sm:text-right text-xs">
                          <span className="text-slate-400 block text-[10px] uppercase font-light">Vault Balance</span>
                          <span className={`text-base font-light ${
                            ridePhase === 'trip-completed' ? 'text-slate-500 line-through' : 'text-emerald-300'
                          }`}>
                            ₹{quotedFare}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* ========================================================================= */}
                    {/* PHASE 1: DRIVER ARRIVING (Pickup OTP Verification Stage) */}
                    {/* ========================================================================= */}
                    {ridePhase === 'driver-arriving' && (
                      <div className="bg-black/40 backdrop-blur-2xl rounded-3xl p-7 sm:p-10 border border-white/10 shadow-2xl space-y-7">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-white/[0.06] gap-3">
                          <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-emerald-300">
                              <Radio className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium text-lg text-white">Chauffeur En Route</h3>
                                <span className="text-[10px] bg-white/[0.06] text-emerald-300 px-2.5 py-0.5 rounded-full border border-white/10 font-light">
                                  Stage 1 • Pickup
                                </span>
                              </div>
                              <span className="text-xs text-slate-400 font-light">
                                Arriving in ~{selectedDriverForCall.etaMinutes} mins ({selectedDriverForCall.distanceKm} km away)
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-300 bg-white/[0.04] px-3.5 py-1.5 rounded-full border border-white/10 font-light">
                              Escrow Locked: ₹{quotedFare}
                            </span>
                          </div>
                        </div>

                        {/* PICKUP OTP DISPLAY CARD */}
                        <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 shadow-xl space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-[10px] uppercase tracking-widest text-emerald-300 font-light block">
                                Verification Step 1
                              </span>
                              <h4 className="text-base font-medium text-white">
                                Share Pickup OTP with Chauffeur
                              </h4>
                            </div>

                            <button
                              onClick={() => handleCopyOtp(pickupOtp)}
                              className="px-3.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-emerald-300 text-xs font-light flex items-center gap-1.5 transition-colors border border-white/10"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span>{copiedOtp === pickupOtp ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>

                          <div className="flex items-center gap-3 py-2">
                            {pickupOtp.split('').map((digit, idx) => (
                              <div
                                key={idx}
                                className="w-13 h-15 rounded-2xl bg-white/[0.05] border border-white/15 flex items-center justify-center font-mono font-light text-2xl text-white shadow-inner"
                              >
                                {digit}
                              </div>
                            ))}
                            <div className="ml-3 text-xs text-slate-300 font-light">
                              <span className="text-white block font-normal">4-Digit Pickup Passcode</span>
                              <span className="text-slate-400 text-[11px]">
                                Share with {selectedDriverForCall.name} upon boarding to start journey.
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Driver & Vehicle Details */}
                        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <img
                                src={selectedDriverForCall.avatar}
                                alt={selectedDriverForCall.name}
                                className="w-14 h-14 rounded-2xl object-cover border border-white/15"
                              />
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-md">
                                <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-base text-white">{selectedDriverForCall.name}</h4>
                                <span className="text-xs bg-white/[0.05] px-2 py-0.5 rounded-full font-light text-amber-300 border border-white/10">
                                  ★ {selectedDriverForCall.rating.toFixed(2)} ({selectedDriverForCall.trips} trips)
                                </span>
                              </div>
                              <span className="text-xs text-slate-400 block mt-0.5 font-light">
                                Age: {selectedDriverForCall.driverAge} yrs • Verified Commercial Chauffeur
                              </span>
                              <span className="text-xs text-slate-300 font-normal mt-1 block">
                                {selectedDriverForCall.vehicleModel} • {selectedDriverForCall.plateNumber}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button
                              onClick={() => alert(`Calling driver ${selectedDriverForCall.name} via masked secure line...`)}
                              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 border border-white/10 flex items-center justify-center gap-1.5 text-xs font-light transition-colors"
                            >
                              <PhoneCall className="w-3.5 h-3.5 text-emerald-300" />
                              <span>Call</span>
                            </button>
                            <button
                              onClick={() => alert('Opening in-app rider chat...')}
                              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 border border-white/10 flex items-center justify-center gap-1.5 text-xs font-light transition-colors"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-slate-300" />
                              <span>Chat</span>
                            </button>
                          </div>
                        </div>

                        {/* Itinerary Waypoints */}
                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2 text-xs font-light">
                          <div className="flex items-center gap-2 text-slate-300">
                            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                            <span className="text-white font-normal">Pickup:</span>
                            <span className="text-slate-300 truncate">{pickup}</span>
                          </div>
                          {stops.map((s, i) => (
                            <div key={s.id} className="flex items-center gap-2 text-slate-300 pl-4 border-l border-white/10 ml-1">
                              <span className="text-emerald-300 font-normal">Halt {i + 1} ({s.haltDuration}):</span>
                              <span className="text-slate-400 truncate">{s.address || 'Scheduled waypoint'}</span>
                            </div>
                          ))}
                          <div className="flex items-center gap-2 text-slate-300">
                            <span className="w-2 h-2 rounded-full bg-teal-400"></span>
                            <span className="text-white font-normal">Drop:</span>
                            <span className="text-slate-300 truncate">{destination}</span>
                          </div>
                        </div>

                        {/* SIMULATION BAR: Driver Arrives & Verifies Pickup OTP */}
                        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                          <div className="flex items-center justify-between text-xs font-light">
                            <span className="text-[11px] uppercase text-slate-400 flex items-center gap-1.5">
                              <Radio className="w-3.5 h-3.5 text-emerald-300" />
                              Chauffeur Terminal Simulation
                            </span>
                            <span className="text-slate-400">Simulate driver arriving & entering Pickup OTP</span>
                          </div>

                          <button
                            type="button"
                            onClick={handleVerifyPickupOtp}
                            className="w-full py-3.5 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 border border-white/15 shadow-md shadow-black/20 transition-all hover:scale-[1.01]"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                            <span>Chauffeur Arrived • Verify Pickup OTP ({pickupOtp}) & Start Journey</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ========================================================================= */}
                    {/* PHASE 2: TRIP IN-PROGRESS (Drop-off OTP Verification Stage) */}
                    {/* ========================================================================= */}
                    {ridePhase === 'trip-in-progress' && (
                      <div className="bg-black/40 backdrop-blur-2xl rounded-3xl p-7 sm:p-10 border border-white/10 shadow-2xl space-y-7">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-white/[0.06] gap-3">
                          <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-emerald-300">
                              <Navigation className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium text-lg text-white">Journey In Progress</h3>
                                <span className="text-[10px] bg-white/[0.06] text-emerald-300 px-2.5 py-0.5 rounded-full border border-white/10 font-light">
                                  Stage 2 • In-Transit
                                </span>
                              </div>
                              <span className="text-xs text-slate-400 font-light">
                                Heading towards destination in quiet comfort
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-300 bg-white/[0.04] px-3.5 py-1.5 rounded-full border border-white/10 font-light">
                              Escrow Locked: ₹{quotedFare}
                            </span>
                          </div>
                        </div>

                        {/* Live Route Tracker */}
                        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-normal text-slate-300">Live Journey Tracking</span>
                            <span className="text-emerald-300 font-light">In Transit • Smooth Cruising</span>
                          </div>

                          {/* Progress Line */}
                          <div className="relative pt-2 pb-1">
                            <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 w-3/5" />
                            </div>
                            <div className="flex justify-between text-[11px] text-slate-400 mt-2 font-light">
                              <span className="text-emerald-300">✓ Pickup Verified</span>
                              {stops.length > 0 && <span>{stops.length} Scheduled Halts</span>}
                              <span className="text-slate-300">Approaching Destination</span>
                            </div>
                          </div>
                        </div>

                        {/* DESTINATION DROP-OFF OTP DISPLAY CARD */}
                        <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 shadow-xl space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-[10px] uppercase tracking-widest text-emerald-300 font-light block">
                                Step 2: Destination Verification
                              </span>
                              <h4 className="text-base font-medium text-white">
                                Destination Drop-off Passcode
                              </h4>
                            </div>

                            <button
                              onClick={() => handleCopyOtp(dropoffOtp)}
                              className="px-3.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-emerald-300 text-xs font-light flex items-center gap-1.5 transition-colors border border-white/10"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span>{copiedOtp === dropoffOtp ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>

                          <div className="flex items-center gap-3 py-2">
                            {dropoffOtp.split('').map((digit, idx) => (
                              <div
                                key={idx}
                                className="w-13 h-15 rounded-2xl bg-white/[0.05] border border-white/15 flex items-center justify-center font-mono font-light text-2xl text-white shadow-inner"
                              >
                                {digit}
                              </div>
                            ))}
                            <div className="ml-3 text-xs text-slate-300 font-light">
                              <span className="text-white block font-normal">4-Digit Drop-off Passcode</span>
                              <span className="text-slate-400 text-[11px]">
                                Share with {selectedDriverForCall.name} ONLY after safely arriving at destination.
                              </span>
                            </div>
                          </div>

                          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center gap-2.5 text-xs text-slate-300 font-light">
                            <Lock className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                            <span>
                              <strong>Escrow Protection:</strong> ₹{quotedFare} remains securely held in Vault. Chauffeur payout is released strictly upon OTP confirmation.
                            </span>
                          </div>
                        </div>

                        {/* DRIVER DESTINATION TERMINAL (Interactive Simulation Sandbox) */}
                        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
                          <div className="flex items-center justify-between text-xs font-light">
                            <span className="text-[11px] text-slate-300 flex items-center gap-1.5">
                              <Radio className="w-3.5 h-3.5 text-emerald-300" />
                              Chauffeur Terminal • Drop-off Settle
                            </span>
                            <span className="text-slate-400">Enter rider's Drop-off OTP to release payout</span>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-3 items-center">
                            <div className="relative flex-1 w-full">
                              <input
                                type="text"
                                maxLength={4}
                                value={enteredDropoffOtp}
                                onChange={(e) => setEnteredDropoffOtp(e.target.value.replace(/\D/g, ''))}
                                placeholder="Enter 4-digit Drop-off OTP..."
                                className="w-full bg-white/[0.03] border border-white/10 focus:border-white/30 rounded-2xl px-4 py-3 text-white font-mono text-center text-lg tracking-widest focus:outline-none"
                              />
                            </div>

                            <button
                              type="button"
                              onClick={handleVerifyDropoffOtp}
                              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs flex items-center justify-center gap-2 border border-white/15 shadow-md shadow-black/20 transition-all whitespace-nowrap"
                            >
                              <ShieldCheck className="w-4 h-4 text-emerald-300" />
                              <span>Verify & Release Payout</span>
                            </button>
                          </div>

                          {dropoffOtpError && (
                            <div className="flex items-center gap-2 text-xs text-rose-300 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20 font-light">
                              <AlertCircle className="w-4 h-4 flex-shrink-0" />
                              <span>{dropoffOtpError}</span>
                            </div>
                          )}

                          <div className="pt-2 border-t border-white/[0.06] flex justify-between items-center text-xs font-light">
                            <span className="text-slate-400">Quick Test Action:</span>
                            <button
                              type="button"
                              onClick={handleSimulateDropoffArrival}
                              className="text-xs text-emerald-300 hover:text-emerald-200 underline flex items-center gap-1"
                            >
                              <span>Auto-Verify Drop-off OTP ({dropoffOtp}) & Release Payout →</span>
                            </button>
                          </div>
                        </div>

                        {/* Safety & SOS */}
                        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 font-light">
                          <button
                            onClick={() => alert('Live trip link copied to clipboard!')}
                            className="flex items-center gap-1.5 hover:text-white transition-colors"
                          >
                            <Share2 className="w-4 h-4 text-emerald-300" />
                            <span>Share Journey Status</span>
                          </button>

                          <button
                            onClick={() => alert('Emergency Concierge Alert dispatched.')}
                            className="px-4 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-rose-300 border border-white/10"
                          >
                            Concierge Assist
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ========================================================================= */}
                    {/* PHASE 3: TRIP COMPLETED & DRIVER PAID RECEIPT CARD */}
                    {/* ========================================================================= */}
                    {ridePhase === 'trip-completed' && (
                      <div className="bg-black/40 backdrop-blur-2xl rounded-3xl p-7 sm:p-10 border border-white/10 shadow-2xl space-y-7">
                        
                        {/* Big Success Header */}
                        <div className="text-center space-y-2.5 py-3">
                          <div className="w-14 h-14 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center mx-auto text-emerald-300 shadow-xl shadow-black/30">
                            <Sparkles className="w-7 h-7" />
                          </div>
                          <span className="text-xs uppercase tracking-widest text-emerald-300 font-light block">
                            Escrow Settlement Complete
                          </span>
                          <h3 className="text-2xl sm:text-3xl font-light text-white">
                            Journey Completed & Settled
                          </h3>
                          <p className="text-xs sm:text-sm text-slate-300/80 max-w-md mx-auto font-light">
                            Destination reached. GoRide Escrow Vault has released net payout to the chauffeur automatically.
                          </p>
                        </div>

                        {/* FINANCIAL RECEIPT BREAKDOWN CARD */}
                        <div className="p-6 sm:p-7 rounded-3xl bg-white/[0.03] border border-white/10 space-y-4">
                          <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.06]">
                            <div className="flex items-center gap-2.5">
                              <Banknote className="w-4 h-4 text-emerald-300" />
                              <span className="font-medium text-sm text-white uppercase tracking-wider">
                                Settlement Receipt
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-emerald-300 bg-white/[0.05] px-2.5 py-0.5 rounded-full border border-white/10 font-light">
                              TXN-ESCROW-89421
                            </span>
                          </div>

                          {/* Line items */}
                          <div className="space-y-2.5 text-xs font-light">
                            <div className="flex justify-between items-center text-slate-300">
                              <span>Customer Fare Deposited</span>
                              <span className="font-mono text-white text-sm font-normal">₹{quotedFare}.00</span>
                            </div>

                            <div className="flex justify-between items-center text-slate-400">
                              <span>Platform Service Fee (15%)</span>
                              <span className="font-mono">- ₹{platformCommission}.00</span>
                            </div>

                            <div className="flex justify-between items-center text-white pt-2.5 border-t border-white/[0.06]">
                              <span className="font-medium text-sm">Chauffeur Wallet Net Payout (85%)</span>
                              <span className="font-mono text-emerald-300 text-lg font-normal">₹{driverWalletCredit}.00</span>
                            </div>

                            {selectedTip > 0 && (
                              <div className="flex justify-between items-center text-slate-300">
                                <span>Optional Chauffeur Gratuity (100% to Driver)</span>
                                <span className="font-mono">+ ₹{selectedTip}.00</span>
                              </div>
                            )}

                            {selectedTip > 0 && (
                              <div className="flex justify-between items-center text-white pt-1 border-t border-dashed border-white/10 font-normal">
                                <span>Total Received by Chauffeur</span>
                                <span className="font-mono text-base">₹{totalDriverWithTip}.00</span>
                              </div>
                            )}
                          </div>

                          {/* Instant Transfer Stamp */}
                          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between text-[11px] text-slate-400 font-light">
                            <div className="flex items-center gap-2">
                              <Wallet className="w-4 h-4 text-emerald-300" />
                              <span>Channel: <strong>Escrow Vault → Chauffeur Payout Wallet</strong></span>
                            </div>
                            <span className="text-emerald-300 font-light">INSTANTLY SETTLED</span>
                          </div>
                        </div>

                        {/* Driver Profile & Credited Confirmation */}
                        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3.5">
                            <img
                              src={selectedDriverForCall.avatar}
                              alt={selectedDriverForCall.name}
                              className="w-12 h-12 rounded-2xl object-cover border border-white/15"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-sm text-white">{selectedDriverForCall.name}</h4>
                                <span className="text-[10px] text-emerald-300 bg-white/[0.05] px-2 py-0.5 rounded-full border border-white/10 font-light">
                                  CREDITED
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 font-light">
                                {selectedDriverForCall.vehicleModel} • {selectedDriverForCall.plateNumber}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] uppercase text-slate-400 block font-light">
                              Chauffeur Payout
                            </span>
                            <span className="font-light text-base text-white">
                              ₹{totalDriverWithTip}
                            </span>
                          </div>
                        </div>

                        {/* Rider Rating & Tip Section */}
                        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
                          {/* 5-Star Rating */}
                          <div className="space-y-1.5 text-center sm:text-left">
                            <span className="text-xs font-light text-slate-300 block">
                              Rate your Chauffeur Experience:
                            </span>
                            <div className="flex items-center justify-center sm:justify-start gap-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setDriverRating(star)}
                                  className={`p-1.5 rounded-lg transition-transform hover:scale-110 ${
                                    star <= driverRating ? 'text-amber-300' : 'text-white/20'
                                  }`}
                                >
                                  <Star className="w-5 h-5 fill-current" />
                                </button>
                              ))}
                              <span className="text-xs font-light text-slate-300 ml-2">
                                {driverRating === 5 ? '5.0 — Exceptional' : `${driverRating}.0 Rated`}
                              </span>
                            </div>
                          </div>

                          {/* Driver Tipping */}
                          <div className="space-y-2 pt-3 border-t border-white/[0.06]">
                            <div className="flex justify-between items-center text-xs font-light">
                              <span className="text-slate-300">Add a Chauffeur Tip (100% to Driver):</span>
                              <span className="text-[11px] text-slate-400">Zero platform deduction</span>
                            </div>

                            <div className="grid grid-cols-4 gap-2">
                              {[
                                { val: 0, label: 'No Tip' },
                                { val: 30, label: '+ ₹30' },
                                { val: 50, label: '+ ₹50' },
                                { val: 100, label: '+ ₹100' },
                              ].map((t) => (
                                <button
                                  key={t.val}
                                  type="button"
                                  onClick={() => setSelectedTip(t.val)}
                                  className={`py-2 rounded-xl text-xs font-light transition-all ${
                                    selectedTip === t.val
                                      ? 'bg-white/15 text-white border border-white/25 shadow-sm'
                                      : 'bg-white/[0.03] text-slate-400 border border-white/10 hover:text-white'
                                  }`}
                                >
                                  {t.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Action CTAs */}
                        <div className="pt-2 flex flex-col sm:flex-row gap-3">
                          <button
                            type="button"
                            onClick={() => alert(`Invoice & Settlement Receipt downloaded for Booking #APEX-89421. Customer Total: ₹${quotedFare}, Driver Credited: ₹${totalDriverWithTip}.`)}
                            className="flex-1 py-3.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 text-xs font-light flex items-center justify-center gap-2 border border-white/10 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            <span>Download Receipt (PDF)</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleResetToStepper}
                            className="flex-1 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 border border-white/15 shadow-xl shadow-black/30 hover:scale-[1.01] transition-all"
                          >
                            <RotateCcw className="w-4 h-4 text-emerald-300" />
                            <span>Book Another Journey</span>
                          </button>
                        </div>

                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}

        </div>

        {/* Right 5 Columns: Dynamic Bidding Info & Live Route Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-black/40 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 border border-white/10 shadow-2xl sticky top-28 space-y-6">
            
            {/* Header: Dynamic Bidding or Escrow Vault */}
            <div className="border-b border-white/[0.08] pb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-300 font-medium bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  {flowState === 'en-route' ? 'ESCROW VAULT MONITOR' : 'DYNAMIC BIDDING MODEL'}
                </span>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-300/90">
                  <Shield className="w-3.5 h-3.5" />
                  Escrow Protected
                </span>
              </div>
              <h3 className="text-lg font-light tracking-tight text-white mt-2">
                {flowState === 'en-route' 
                  ? 'GoRide Escrow Vault' 
                  : flowState === 'idle' 
                  ? 'Real-Time Driver Bids' 
                  : 'Quoted Trip Summary'}
              </h3>
              <p className="text-xs text-white/50 mt-1 font-light leading-relaxed">
                {flowState === 'en-route'
                  ? 'Zero funds transferred to driver until final destination Drop-off OTP is verified.'
                  : flowState === 'idle' 
                  ? 'No fixed fare surprises. Nearby drivers bid for your trip upon Step 5 submission.'
                  : `Reviewing bids for your ${stops.length}-halt custom itinerary.`}
              </p>
            </div>

            {/* If In Active Ride: Show Escrow Vault Live Status Widget */}
            {flowState === 'en-route' && selectedDriverForCall ? (
              <div className="space-y-4">
                {/* Vault Ledger */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white/60 font-light">Escrow Vault Status:</span>
                    <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full font-medium tracking-wider uppercase ${
                      ridePhase === 'trip-completed'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {ridePhase === 'trip-completed' ? 'RELEASED & SETTLED' : 'ESCROW LOCKED'}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-white/[0.06] space-y-2 text-xs">
                    <div className="flex justify-between text-white/70 font-light">
                      <span>Total Fare Deposited:</span>
                      <span className="font-mono font-medium text-white">₹{selectedDriverForCall.quotedFareINR}</span>
                    </div>
                    <div className="flex justify-between text-rose-300/90 font-light">
                      <span>Platform Commission (15%):</span>
                      <span className="font-mono font-medium">₹{Math.round(selectedDriverForCall.quotedFareINR * 0.15)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-300 font-medium pt-2 border-t border-white/[0.08]">
                      <span>Driver Payout (85%):</span>
                      <span className="font-mono text-sm">
                        ₹{selectedDriverForCall.quotedFareINR - Math.round(selectedDriverForCall.quotedFareINR * 0.15)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-white/[0.06] text-[11px] text-white/50 font-light">
                    <span className="block font-medium text-white/70">Driver Payout Release Trigger:</span>
                    <span className="text-emerald-300">
                      {ridePhase === 'driver-arriving'
                        ? 'Pending: Destination Drop-off OTP'
                        : ridePhase === 'trip-in-progress'
                        ? `Awaiting: Drop-off OTP (${dropoffOtp})`
                        : 'Verified: Released to Driver Wallet'}
                    </span>
                  </div>
                </div>

                {/* Ride Driver & Route Recap */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedDriverForCall.avatar}
                      alt={selectedDriverForCall.name}
                      className="w-10 h-10 rounded-xl object-cover border border-white/15"
                    />
                    <div>
                      <h4 className="font-medium text-white">{selectedDriverForCall.name}</h4>
                      <p className="text-[11px] text-white/50 font-light">
                        {selectedDriverForCall.vehicleModel} • {selectedDriverForCall.plateNumber}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/[0.06] space-y-1 text-[11px] text-white/70 font-light">
                    <div className="truncate"><span className="text-emerald-300 font-medium">Pickup:</span> {pickup}</div>
                    <div className="truncate"><span className="text-cyan-300 font-medium">Drop:</span> {destination}</div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Stepper Progress Breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-light">
                    <span className="text-white/60">Configuration Progress</span>
                    <span className="text-emerald-300 font-mono font-medium">
                      {flowState === 'idle' ? `Step ${currentStep} of 5` : 'Broadcast Complete'}
                    </span>
                  </div>
                  <div className="w-full bg-white/[0.05] h-1.5 rounded-full overflow-hidden border border-white/10">
                    <div 
                      className="bg-gradient-to-r from-emerald-400 to-teal-400 h-full transition-all duration-300"
                      style={{ width: `${flowState === 'idle' ? (currentStep / 5) * 100 : 100}%` }}
                    />
                  </div>
                </div>

                {/* Selected Vehicle Spec Preview */}
                <div className="rounded-2xl overflow-hidden bg-white/[0.03] border border-white/10">
                  <div className="h-32 overflow-hidden relative">
                    <img
                      src={currentVehicleObj.image}
                      alt={currentVehicleObj.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <span className="absolute bottom-2.5 left-3 text-xs font-light text-white bg-black/60 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                      {currentVehicleObj.name}
                    </span>
                  </div>
                  <div className="p-4 space-y-2 text-xs font-light text-white/70">
                    <div className="flex justify-between">
                      <span className="text-white/50">Selected Category:</span>
                      <span className="font-medium text-white">{currentVehicleObj.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50">Driver Age Filter:</span>
                      <span className="font-medium text-emerald-300">
                        {driverAgePref === 'any' ? 'Any Age (Open Auction)' : `${driverAgePref} Years`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50">Scheduled Stops:</span>
                      <span className="font-medium text-white">
                        {isDirectRoute || stops.length === 0 ? 'Direct Non-Stop' : `${stops.length} Halts with Grace Time`}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Bidding Protection Pillars */}
            <div className="space-y-2.5 text-xs text-white/60 font-light">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400/80 flex-shrink-0" />
                <span>Zero cash haggling — fare locked before driver calls</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400/80 flex-shrink-0" />
                <span>Driver payout strictly released only upon Drop-off OTP</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400/80 flex-shrink-0" />
                <span>15% platform commission automatically settled at trip end</span>
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.06] text-[11px] text-center text-white/40 font-light">
              Apex Concierge 24/7 Helpline: 1800-GOCAB-24
            </div>
          </div>
        </div>

      </div>

      {/* ==================== ESCROW PAYMENT LOCK MODAL BEFORE CALL ==================== */}
      {escrowModalOpen && selectedDriverForCall && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in">
          <div 
            className="relative w-full max-w-md bg-black/85 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 text-white shadow-2xl space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Icon & Header */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto text-emerald-300">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="font-light text-xl text-white tracking-tight">
                Secure Escrow Payment Lock
              </h3>
              <p className="text-xs text-white/50 max-w-sm mx-auto font-light leading-relaxed">
                Amount <strong className="text-emerald-300 font-mono font-normal text-sm">₹{selectedDriverForCall.quotedFareINR}</strong> will be locked securely in GoRide Escrow. No offline fare changes allowed on call.
              </p>
            </div>

            {/* Driver & Fare Summary */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-white/[0.06]">
                <span className="text-white/50 font-light">Driver Selected:</span>
                <span className="font-medium text-white">{selectedDriverForCall.name} ({selectedDriverForCall.vehicleModel})</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-white/[0.06]">
                <span className="text-white/50 font-light">Quoted Fare:</span>
                <span className="font-mono font-medium text-base text-emerald-300">₹{selectedDriverForCall.quotedFareINR}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/50 font-light">Security Guarantee:</span>
                <span className="text-emerald-300 font-normal">100% Protected via OTP</span>
              </div>
            </div>

            {/* Select Escrow Source */}
            <div className="space-y-2 text-xs">
              <label className="block text-[10px] font-mono uppercase tracking-wider text-white/40 font-medium">
                Lock Fare From:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'apex-pay', label: 'Apex Wallet (₹1,500)' },
                  { id: 'upi', label: 'UPI / GPay' },
                  { id: 'card', label: 'Card •••• 4242' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setEscrowPaymentMethod(m.id as any)}
                    className={`p-2.5 rounded-xl border text-center text-[11px] transition-colors ${
                      escrowPaymentMethod === m.id
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-medium'
                        : 'bg-white/[0.03] border-white/10 text-white/60 font-light hover:border-white/20'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => setEscrowModalOpen(false)}
                className="flex-1 py-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] text-white/70 font-medium text-xs border border-white/10 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmEscrowAndCall}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-emerald-500/90 to-teal-500/90 hover:from-emerald-400 hover:to-teal-400 text-black font-semibold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/15 transition-all"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Lock ₹{selectedDriverForCall.quotedFareINR} & Connect</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
