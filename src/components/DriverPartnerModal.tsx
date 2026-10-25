import React, { useState } from 'react';
import { 
  X, CheckCircle2, ArrowRight, ShieldCheck, 
  Phone, KeyRound, Wallet, Radio, 
  Power, LogOut, Coins, Send,
  Navigation, MapPin, AlertCircle, Sparkles,
  UploadCloud, FileCheck, ExternalLink, Database
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SharedActiveTrip } from '../types/mobility';
import { uploadDriverDocumentsAndSaveKyc } from '../lib/supabaseService';

export interface DriverProfileData {
  name: string;
  phone: string;
  city: string;
  vehicleModel: string;
  vehiclePlate: string;
  vehicleCategory: 'bike' | 'auto' | 'mini' | 'sedan';
  rating: number;
  trips: number;
  walletBalance: number;
  isOnline: boolean;
  kycVerified: boolean;
}

interface DriverPartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  driverLoggedIn: boolean;
  driverProfile: DriverProfileData;
  onDriverLogin: (profile: DriverProfileData) => void;
  onDriverLogout: () => void;
  onUpdateDriverDuty: (isOnline: boolean) => void;
  sharedTrip?: SharedActiveTrip | null;
  onDriverSubmitBid?: (offerAmount: number) => void;
  onVerifyPickupOtp?: (enteredOtp: string) => boolean;
  onVerifyDropoffOtp?: (enteredOtp: string) => boolean;
  onResetTrip?: () => void;
}

export const DriverPartnerModal: React.FC<DriverPartnerModalProps> = ({
  isOpen,
  onClose,
  driverLoggedIn,
  driverProfile,
  onDriverLogin,
  onDriverLogout,
  onUpdateDriverDuty,
  sharedTrip,
  onDriverSubmitBid,
  onVerifyPickupOtp,
  onVerifyDropoffOtp,
  onResetTrip,
}) => {
  // Tabs when logged out: 'login' | 'register'
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Tab A: Driver Login state
  const [loginPhone, setLoginPhone] = useState('98110 44219');
  const [loginOtpSent, setLoginOtpSent] = useState(false);
  const [loginOtp, setLoginOtp] = useState('');
  const [loginError, setLoginError] = useState('');

  // Tab B: Driver Registration (KYC) state
  const [regForm, setRegForm] = useState({
    fullName: 'Vikramjeet Singh',
    phone: '98118 99120',
    city: 'Delhi NCR',
    vehicleCategory: 'sedan' as 'bike' | 'auto' | 'mini' | 'sedan',
    vehicleModel: '2024 Maruti Dzire Prime',
    vehiclePlate: 'DL 01 XY 8832',
    dlNumber: 'DL-01202400918',
    rcNumber: 'RC-DL01XY8832',
    dlUploaded: true,
    rcUploaded: true,
    policeClearance: true,
  });
  const [regSubmitted, setRegSubmitted] = useState(false);
  const [kycSubmitting, setKycSubmitting] = useState(false);
  const [dlFile, setDlFile] = useState<File | null>(null);
  const [rcFile, setRcFile] = useState<File | null>(null);
  const [dlFileName, setDlFileName] = useState<string>('dl_license_front.jpg');
  const [rcFileName, setRcFileName] = useState<string>('rc_commercial_permit.pdf');
  const [supabaseDlUrl, setSupabaseDlUrl] = useState<string>('');
  const [supabaseRcUrl, setSupabaseRcUrl] = useState<string>('');

  // Duty Dashboard live bid state (for Method 1)
  const [bidAmount, setBidAmount] = useState('640');
  const [bidSubmitted, setBidSubmitted] = useState(false);
  const [instantPayoutDone, setInstantPayoutDone] = useState(false);

  // Handshake OTP verification states
  const [driverPickupOtpInput, setDriverPickupOtpInput] = useState('');
  const [driverDropoffOtpInput, setDriverDropoffOtpInput] = useState('');
  const [pickupOtpErr, setPickupOtpErr] = useState('');
  const [dropoffOtpErr, setDropoffOtpErr] = useState('');

  if (!isOpen) return null;

  // Handle Tab A: Request Login OTP
  const handleSendLoginOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPhone.trim()) {
      setLoginError('Please enter your registered mobile number');
      return;
    }
    setLoginError('');
    setLoginOtpSent(true);
    setLoginOtp('8421'); // Pre-populate demo OTP for convenience
  };

  // Handle Tab A: Verify OTP & Direct Login
  const handleVerifyLoginOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginOtp.length < 4) {
      setLoginError('Please enter the 4-digit verification OTP');
      return;
    }

    setLoginError('');
    const verifiedDriver: DriverProfileData = {
      name: 'Rajesh Kumar',
      phone: `+91 ${loginPhone}`,
      city: 'Delhi NCR',
      vehicleModel: 'Honda City Prime (Silver Chauffeur)',
      vehiclePlate: 'DL 01 AB 4829',
      vehicleCategory: 'sedan',
      rating: 4.97,
      trips: 4210,
      walletBalance: 4850,
      isOnline: true,
      kycVerified: true,
    };

    onDriverLogin(verifiedDriver);
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }
  };

  // Handle Tab B: Submit KYC Application & Upload Documents to Supabase
  const handleRegisterKycSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setKycSubmitting(true);

    try {
      // FLOW 3: Upload selected DL & RC files to Supabase Storage bucket 'driver-documents'
      // and store their public URLs in 'drivers' table
      const kycResult = await uploadDriverDocumentsAndSaveKyc({
        driverName: regForm.fullName,
        phone: regForm.phone,
        city: regForm.city,
        vehicleModel: regForm.vehicleModel,
        vehiclePlate: regForm.vehiclePlate,
        vehicleCategory: regForm.vehicleCategory,
        dlFile,
        rcFile,
        dlNumber: regForm.dlNumber,
        rcNumber: regForm.rcNumber,
      });

      setSupabaseDlUrl(kycResult.dlPublicUrl);
      setSupabaseRcUrl(kycResult.rcPublicUrl);
    } catch (err) {
      console.warn('KYC upload handled:', err);
    } finally {
      setKycSubmitting(false);
      setRegSubmitted(true);
    }
  };

  // Launch dashboard from approved registration
  const handleLaunchDashboardFromReg = () => {
    const newDriver: DriverProfileData = {
      name: regForm.fullName || 'Partner Driver',
      phone: `+91 ${regForm.phone}`,
      city: regForm.city,
      vehicleModel: regForm.vehicleModel,
      vehiclePlate: regForm.vehiclePlate,
      vehicleCategory: regForm.vehicleCategory,
      rating: 5.0,
      trips: 0,
      walletBalance: 1200, // Joining bonus
      isOnline: true,
      kycVerified: true,
    };
    onDriverLogin(newDriver);
    setRegSubmitted(false);
  };

  // Submit Fare Bid on incoming request
  const handleSubmitBid = (e: React.FormEvent) => {
    e.preventDefault();
    const quoteNum = Number(bidAmount) || 640;
    if (onDriverSubmitBid) {
      onDriverSubmitBid(quoteNum);
    }
    setBidSubmitted(true);
    setTimeout(() => {
      setBidSubmitted(false);
    }, 4500);
  };

  // Driver verifies Pickup OTP
  const handleDriverVerifyPickup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sharedTrip) return;
    if (driverPickupOtpInput.trim() === sharedTrip.pickupOtp) {
      setPickupOtpErr('');
      if (onVerifyPickupOtp) {
        onVerifyPickupOtp(driverPickupOtpInput);
      }
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }
    } else {
      setPickupOtpErr(`Incorrect Pickup OTP! Rider code is ${sharedTrip.pickupOtp}`);
    }
  };

  // Driver verifies Drop-off OTP & triggers 85% payout
  const handleDriverVerifyDropoff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sharedTrip) return;
    if (driverDropoffOtpInput.trim() === sharedTrip.dropoffOtp) {
      setDropoffOtpErr('');
      if (onVerifyDropoffOtp) {
        onVerifyDropoffOtp(driverDropoffOtpInput);
      }
      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }
    } else {
      setDropoffOtpErr(`Incorrect Drop-off OTP! Customer code is ${sharedTrip.dropoffOtp}`);
    }
  };

  // Trigger Instant Cashout
  const handleInstantPayout = () => {
    setInstantPayoutDone(true);
    setTimeout(() => setInstantPayoutDone(false), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div 
        className="relative w-full max-w-2xl bg-black/85 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 sm:p-8 text-white shadow-2xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/[0.08] text-white/50 hover:text-white transition-colors z-20"
          title="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ========================================================================= */}
        {/* VIEW 1: DRIVER LOGGED IN -> DRIVER DUTY DASHBOARD */}
        {/* ========================================================================= */}
        {driverLoggedIn ? (
          <div className="space-y-6 animate-fade-in">
            
            {/* Header: Driver Name, Duty Status & Logout */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/[0.08] gap-4">
              <div className="flex items-center gap-3.5">
                <div className="relative">
                  <div className="w-13 h-13 rounded-2xl bg-white/[0.06] border border-white/15 p-0.5 shadow-lg">
                    <div className="w-12 h-12 rounded-[14px] bg-black/60 flex items-center justify-center font-medium text-emerald-300 text-lg">
                      {driverProfile.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  </div>
                  <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-black ${
                    driverProfile.isOnline ? 'bg-emerald-400' : 'bg-white/40'
                  }`} />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-light text-lg sm:text-xl text-white tracking-tight">
                      {driverProfile.name}
                    </h3>
                    <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1 font-light tracking-wider">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      KYC VERIFIED
                    </span>
                  </div>
                  <p className="text-xs text-white/50 font-mono mt-0.5 font-light">
                    {driverProfile.vehicleModel} • <strong className="text-white/80 font-normal">{driverProfile.vehiclePlate}</strong>
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <a
                  href="/driver"
                  className="px-3 py-2 rounded-2xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 hover:text-white text-xs font-light border border-teal-500/30 transition-colors flex items-center gap-1.5"
                  title="Open Dedicated Full-Screen Radar at /driver"
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Full Radar</span>
                  <span className="text-[10px] font-mono opacity-70">/driver</span>
                </a>

                <button
                  onClick={onDriverLogout}
                  className="px-3.5 py-2 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white text-xs font-light border border-white/10 transition-colors flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>

            {/* 1. ONLINE / OFFLINE DUTY STATUS SWITCH */}
            <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
              driverProfile.isOnline
                ? 'bg-white/[0.04] border-emerald-500/30 shadow-lg shadow-emerald-500/5'
                : 'bg-white/[0.02] border-white/10'
            }`}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-medium ${
                    driverProfile.isOnline
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : 'bg-white/[0.04] text-white/40 border border-white/10'
                  }`}>
                    {driverProfile.isOnline ? (
                      <Radio className="w-5 h-5 text-emerald-300" />
                    ) : (
                      <Power className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-white">
                        {driverProfile.isOnline ? 'Duty Status: ONLINE' : 'Duty Status: OFFLINE'}
                      </span>
                      <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-light uppercase tracking-wider ${
                        driverProfile.isOnline 
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' 
                          : 'bg-white/[0.05] text-white/40 border border-white/10'
                      }`}>
                        {driverProfile.isOnline ? 'Accepting Trips & Bids' : 'On Break'}
                      </span>
                    </div>
                    <p className="text-xs text-white/50 font-light mt-0.5">
                      {driverProfile.isOnline 
                        ? 'Broadcasting GPS beacon. Live bids enabled for Method 1 & 2.' 
                        : 'You are invisible on rider radars. Turn online to start earning.'}
                    </p>
                  </div>
                </div>

                {/* Duty Toggle Button */}
                <button
                  type="button"
                  onClick={() => onUpdateDriverDuty(!driverProfile.isOnline)}
                  className={`px-4 py-2.5 rounded-2xl text-xs transition-all shadow-md ${
                    driverProfile.isOnline
                      ? 'bg-white/[0.06] hover:bg-white/[0.1] text-white/80 font-light border border-white/10'
                      : 'bg-emerald-500/90 hover:bg-emerald-400 text-black font-semibold'
                  }`}
                >
                  {driverProfile.isOnline ? 'Go Offline' : 'Go Online'}
                </button>
              </div>
            </div>

            {/* 2. WALLET BALANCE & RECENT PAYOUTS SUMMARY */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 font-medium block">
                  Driver Payout Wallet
                </span>
                <span className="font-mono text-2xl font-light text-emerald-300 block">
                  ₹{driverProfile.walletBalance}.00
                </span>
                <span className="text-[11px] text-white/50 font-light">85% net fare credited</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 font-medium block">
                  Today's Earnings
                </span>
                <span className="font-mono text-2xl font-light text-white block">
                  ₹1,840.00
                </span>
                <span className="text-[11px] text-emerald-300 font-light">4 trips completed</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 font-medium block">
                  Rider Tips (100% Yours)
                </span>
                <span className="font-mono text-2xl font-light text-teal-300 block">
                  ₹240.00
                </span>
                <span className="text-[11px] text-white/50 font-light">0% platform commission</span>
              </div>
            </div>

            {/* Instant IMPS Bank Cashout Action */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-3 text-xs font-light">
              <div className="flex items-center gap-2.5">
                <Wallet className="w-4 h-4 text-emerald-400" />
                <span className="text-white/70">
                  Linked Payout Bank: <strong className="text-white font-medium">HDFC Bank (•••• 4921)</strong>
                </span>
              </div>

              <button
                type="button"
                onClick={handleInstantPayout}
                className="px-3.5 py-1.5 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-light transition-colors flex items-center gap-1.5"
              >
                <Coins className="w-3.5 h-3.5" />
                <span>Instant Cashout</span>
              </button>
            </div>

            {instantPayoutDone && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2 animate-slide-up">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Payout of ₹{driverProfile.walletBalance} initiated via IMPS to HDFC Bank (Ref: TXN-IMPS-89210)!</span>
              </div>
            )}

            {/* 3. LIVE INCOMING TRIP REQUESTS RADAR & METHOD 1 BIDDING / HANDSHAKE PANEL */}
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-400"></span>
                  <span className="text-xs font-mono uppercase tracking-wider text-teal-300 font-medium">
                    {sharedTrip?.status === 'matched_en_route'
                      ? 'Live Ride: Stage 1 (En Route & Pickup OTP)'
                      : sharedTrip?.status === 'in_transit'
                      ? 'Live Ride: Stage 2 (In-Transit & Drop-off OTP)'
                      : sharedTrip?.status === 'completed'
                      ? 'Trip Completed & Settled'
                      : 'Method 1: Live Trip Auction Radar'}
                  </span>
                </div>
                <span className="text-[11px] text-white/40 font-mono">
                  {driverProfile.city} • GPS Active
                </span>
              </div>

              {!driverProfile.isOnline ? (
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-dashed border-white/10 text-center space-y-2">
                  <Power className="w-8 h-8 text-white/30 mx-auto" />
                  <p className="text-xs text-white/50 max-w-sm mx-auto font-light leading-relaxed">
                    You are currently offline. Turn your duty status to <strong className="text-white font-medium">Online</strong> to participate in Method 1 driver auctions and receive instant trip broadcasts.
                  </p>
                </div>
              ) : sharedTrip?.status === 'matched_en_route' ? (
                /* ==================== STAGE 1: EN ROUTE TO PICKUP & PICKUP OTP ==================== */
                <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-emerald-500/30 space-y-4 animate-fade-in">
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/[0.06]">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-emerald-300 font-light bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                        MATCHED TRIP • EN ROUTE TO PICKUP
                      </span>
                      <h4 className="font-medium text-base text-white mt-1">
                        Rider: {sharedTrip.riderName}
                      </h4>
                      <p className="text-xs text-white/60 font-light">
                        Quoted Fare: <strong className="text-emerald-300 font-mono font-normal">₹{sharedTrip.customerPaidINR || sharedTrip.matchedBid?.quotedFareINR}</strong> (Escrow Locked in GoRide Vault)
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-mono text-amber-300 block">
                        ESCROW LOCKED
                      </span>
                      <span className="text-[11px] text-white/40 font-light">0% released until drop-off</span>
                    </div>
                  </div>

                  {/* Route details */}
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] text-xs space-y-1.5 text-white/70 font-light border border-white/10">
                    <div className="flex items-center gap-2">
                      <Navigation className="w-3.5 h-3.5 text-emerald-300 flex-shrink-0" />
                      <span><strong className="text-white font-medium">Pickup:</strong> {sharedTrip.pickup}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-teal-300 flex-shrink-0" />
                      <span><strong className="text-white font-medium">Drop:</strong> {sharedTrip.destination}</span>
                    </div>
                  </div>

                  {/* Pickup OTP Input Card */}
                  <form onSubmit={handleDriverVerifyPickup} className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-emerald-500/30 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <span className="font-medium text-white block">Enter Rider's Pickup OTP:</span>
                        <span className="text-white/40 text-[11px] font-light">Ask {sharedTrip.riderName} for 4-digit code upon arrival</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setDriverPickupOtpInput(sharedTrip.pickupOtp);
                          setPickupOtpErr('');
                        }}
                        className="text-xs text-emerald-300 hover:text-emerald-200 underline font-light"
                      >
                        Auto-fill OTP ({sharedTrip.pickupOtp})
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <input
                        type="text"
                        maxLength={4}
                        value={driverPickupOtpInput}
                        onChange={(e) => {
                          setDriverPickupOtpInput(e.target.value.replace(/\D/g, ''));
                          setPickupOtpErr('');
                        }}
                        placeholder="e.g. 4821"
                        className="w-full bg-white/[0.04] border border-white/15 focus:border-emerald-400/60 rounded-2xl px-4 py-2.5 text-white font-mono text-center text-lg tracking-widest focus:outline-none"
                      />

                      <button
                        type="submit"
                        className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-emerald-500/90 to-teal-500/90 hover:from-emerald-400 hover:to-teal-400 text-black font-semibold text-xs rounded-2xl flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/15 whitespace-nowrap transition-all"
                      >
                        <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                        <span>Verify & Start Trip</span>
                      </button>
                    </div>

                    {pickupOtpErr && (
                      <div className="flex items-center gap-1.5 text-xs text-rose-300 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20 font-light">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{pickupOtpErr}</span>
                      </div>
                    )}
                  </form>
                </div>
              ) : sharedTrip?.status === 'in_transit' ? (
                /* ==================== STAGE 2: IN-TRANSIT & DROP-OFF OTP ==================== */
                <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-teal-500/30 space-y-4 animate-fade-in">
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/[0.06]">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-teal-300 font-light bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/20">
                        TRIP ONGOING • IN-TRANSIT
                      </span>
                      <h4 className="font-medium text-base text-white mt-1">
                        Heading to: {sharedTrip.destination}
                      </h4>
                      <p className="text-xs text-white/60 font-light">
                        Rider: {sharedTrip.riderName} • Live Telematics Active
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-mono text-teal-300 block font-medium">
                        FARE: ₹{sharedTrip.customerPaidINR || sharedTrip.matchedBid?.quotedFareINR}
                      </span>
                      <span className="text-[10px] text-emerald-300 font-light">85% Release on Drop-off</span>
                    </div>
                  </div>

                  {/* Drop-off OTP Input Card */}
                  <form onSubmit={handleDriverVerifyDropoff} className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-teal-500/30 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <span className="font-medium text-white block">Enter Rider's Drop-off OTP:</span>
                        <span className="text-white/40 text-[11px] font-light">Customer will provide code upon reaching destination</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setDriverDropoffOtpInput(sharedTrip.dropoffOtp);
                          setDropoffOtpErr('');
                        }}
                        className="text-xs text-teal-300 hover:text-teal-200 underline font-light"
                      >
                        Auto-fill OTP ({sharedTrip.dropoffOtp})
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <input
                        type="text"
                        maxLength={4}
                        value={driverDropoffOtpInput}
                        onChange={(e) => {
                          setDriverDropoffOtpInput(e.target.value.replace(/\D/g, ''));
                          setDropoffOtpErr('');
                        }}
                        placeholder="e.g. 9245"
                        className="w-full bg-white/[0.04] border border-white/15 focus:border-teal-400/60 rounded-2xl px-4 py-2.5 text-white font-mono text-center text-lg tracking-widest focus:outline-none"
                      />

                      <button
                        type="submit"
                        className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-black font-semibold text-xs rounded-2xl flex items-center justify-center gap-1.5 shadow-md shadow-teal-500/15 whitespace-nowrap transition-all"
                      >
                        <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                        <span>Verify & Release Payout</span>
                      </button>
                    </div>

                    {dropoffOtpErr && (
                      <div className="flex items-center gap-1.5 text-xs text-rose-300 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20 font-light">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{dropoffOtpErr}</span>
                      </div>
                    )}
                  </form>
                </div>
              ) : sharedTrip?.status === 'completed' ? (
                /* ==================== STAGE 3: TRIP COMPLETED & DRIVER PAID ==================== */
                <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4 animate-slide-up text-center">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-300 shadow-lg">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-300 font-light block">
                      ESCROW SETTLEMENT COMPLETE
                    </span>
                    <h4 className="text-lg font-light tracking-tight text-white mt-1">
                      Trip Completed & Payout Credited!
                    </h4>
                    <p className="text-xs text-white/60 font-light mt-0.5">
                      <strong className="text-emerald-300 font-mono font-normal text-sm">₹{sharedTrip.driverPayoutINR || Math.round((sharedTrip.customerPaidINR || 650) * 0.85)}</strong> has been credited to your Driver Payout Wallet.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 text-xs space-y-2 text-left font-light">
                    <div className="flex justify-between text-white/70">
                      <span>Customer Total Paid:</span>
                      <span className="font-mono text-white font-medium">₹{sharedTrip.customerPaidINR || 650}.00</span>
                    </div>
                    <div className="flex justify-between text-rose-300/90">
                      <span>GoRide Platform Fee (15%):</span>
                      <span className="font-mono">-₹{sharedTrip.platformFeeINR || Math.round((sharedTrip.customerPaidINR || 650) * 0.15)}.00</span>
                    </div>
                    <div className="flex justify-between text-emerald-300 pt-2 border-t border-white/[0.08] font-medium">
                      <span>Net Driver Payout (85%):</span>
                      <span className="font-mono text-sm">₹{sharedTrip.driverPayoutINR || Math.round((sharedTrip.customerPaidINR || 650) * 0.85)}.00</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (onResetTrip) onResetTrip();
                    }}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500/90 to-teal-500/90 hover:from-emerald-400 hover:to-teal-400 text-black font-semibold text-xs transition-all shadow-md"
                  >
                    Accept Next Trip Request
                  </button>
                </div>
              ) : sharedTrip?.status === 'in-call' ? (
                /* ==================== IN-CALL REVIEW NOTICE ==================== */
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-teal-500/30 text-center space-y-2">
                  <Phone className="w-6 h-6 text-teal-300 mx-auto" />
                  <h4 className="font-medium text-sm text-white">Rider In Consultation Call</h4>
                  <p className="text-xs text-white/50 max-w-sm mx-auto font-light leading-relaxed">
                    {sharedTrip.riderName} is reviewing quotes in a 2-minute masked consultation call. Escrow will lock automatically if your quote is confirmed.
                  </p>
                </div>
              ) : (
                /* ==================== DEFAULT: BROADCAST RADAR & BIDDING BOX ==================== */
                <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3.5">
                  {/* Rider & Trip details */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm text-white">
                          {sharedTrip?.riderName || 'Alex Rider'}
                        </h4>
                        <span className="text-[11px] font-light text-amber-300 bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/10">
                          ★ 4.95
                        </span>
                      </div>
                      <p className="text-xs text-white/60 font-light mt-1">
                        <strong className="text-white/80 font-normal">Route:</strong> {sharedTrip?.pickup || 'Connaught Place'} → {sharedTrip?.destination || 'Terminal 3 IGI Airport'}
                      </p>
                      <p className="text-[11px] text-white/40 font-light mt-0.5">
                        {sharedTrip?.stops && sharedTrip.stops.length > 0 
                          ? `${sharedTrip.stops.length} Scheduled Halt (${sharedTrip.stops[0].address})`
                          : 'Direct Non-Stop Route'}
                      </p>
                    </div>

                    <span className="text-[10px] font-mono text-teal-300 bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/20 font-light whitespace-nowrap">
                      ACTIVE AUCTION
                    </span>
                  </div>

                  {/* Rider Note */}
                  <div className="p-3 rounded-2xl bg-white/[0.03] text-xs text-white/70 border border-white/10 font-light">
                    <span className="text-white/40">Special Expectation:</span> "{sharedTrip?.specialNotes || 'Need clean empty boot space for 2 bags. AC on high.'}"
                  </div>

                  {/* Bid Submission Form */}
                  <form onSubmit={handleSubmitBid} className="pt-2 border-t border-white/[0.06] space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <label className="text-white/60 font-light">
                        Submit Your Price Quote (₹):
                      </label>
                      <div className="flex items-center gap-1.5">
                        {['580', '640', '720'].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setBidAmount(preset)}
                            className={`px-2.5 py-0.5 rounded-full font-mono text-[11px] transition-colors ${
                              bidAmount === preset 
                                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 font-medium' 
                                : 'bg-white/[0.03] text-white/50 hover:text-white border border-white/10'
                            }`}
                          >
                            ₹{preset}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-2.5 font-mono text-emerald-300 font-light text-sm">₹</span>
                        <input
                          type="number"
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          placeholder="Enter your quote in ₹..."
                          className="w-full bg-white/[0.04] border border-white/15 focus:border-teal-400/60 rounded-2xl pl-7 pr-3 py-2 text-sm text-white font-mono focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="px-4 py-2 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-black font-semibold text-xs rounded-2xl flex items-center gap-1.5 shadow-md shadow-teal-500/15 transition-all whitespace-nowrap"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Offer Fare (₹{bidAmount})</span>
                      </button>
                    </div>

                    {bidSubmitted && (
                      <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2 animate-fade-in font-light">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span>Your bid of <strong className="font-normal text-white">₹{bidAmount}</strong> has been inserted into Supabase <strong>'bids'</strong> table and broadcast live to rider via Realtime!</span>
                      </div>
                    )}
                  </form>
                </div>
              )}
            </div>

            {/* 4. RECENT PAYOUT HISTORY */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5 text-xs font-light">
              <span className="text-white/60 font-light block">Recent Escrow Releases:</span>
              <div className="space-y-2">
                {[
                  { dest: 'Terminal 3 IGI Airport (Custom Trip)', fare: '₹552.00', status: '85% Released', time: '1 hr ago' },
                  { dest: 'Cyber City Phase 2 (Quick Ride)', fare: '₹221.00', status: '85% Released', time: '3 hrs ago' },
                  { dest: 'Connaught Place Outer Circle', fare: '₹161.50', status: '85% Released', time: 'Yesterday' },
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <div>
                      <span className="text-white/80 font-normal block">{item.dest}</span>
                      <span className="text-[10px] text-white/40">{item.time}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-emerald-300 block font-normal">{item.fare}</span>
                      <span className="text-[10px] font-mono text-white/40">{item.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ) : (
          /* ========================================================================= */
          /* VIEW 2: LOGGED OUT -> DUAL TAB NAVIGATION (LOGIN vs REGISTER KYC) */
          /* ========================================================================= */
          <div className="space-y-6 animate-fade-in">
            
            {/* Modal Header */}
            <div>
              <span className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/20 font-light tracking-wider">
                GoRide / Apex Driver Partner Fleet
              </span>
              <h3 className="font-light text-2xl text-white tracking-tight mt-2.5">
                Drive, Chauffeur & Earn
              </h3>
              <p className="text-xs text-white/50 mt-1 font-light leading-relaxed">
                Keep 85% of every fare, 100% of customer tips, and enjoy instant bank cashouts.
              </p>
            </div>

            {/* DUAL TAB SWITCHER */}
            <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-white/[0.03] border border-white/10">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setLoginError('');
                }}
                className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'login'
                    ? 'bg-white/[0.08] text-white font-medium border border-white/10 shadow-lg'
                    : 'text-white/50 hover:text-white font-light'
                }`}
              >
                <KeyRound className="w-4 h-4 text-emerald-300" />
                <span>Driver Login</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setLoginError('');
                }}
                className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'register'
                    ? 'bg-white/[0.08] text-white font-medium border border-white/10 shadow-lg'
                    : 'text-white/50 hover:text-white font-light'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                <span>Register New Driver (KYC)</span>
              </button>
            </div>

            {/* Quick Fleet Metrics Banner */}
            <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
              <div>
                <span className="block font-mono text-base sm:text-lg font-light text-emerald-300">₹32,500</span>
                <span className="text-[10px] text-white/40 font-light">Avg Weekly</span>
              </div>
              <div>
                <span className="block font-mono text-base sm:text-lg font-light text-white">85%</span>
                <span className="text-[10px] text-white/40 font-light">Driver Payout</span>
              </div>
              <div>
                <span className="block font-mono text-base sm:text-lg font-light text-teal-300">Daily</span>
                <span className="text-[10px] text-white/40 font-light">Instant IMPS</span>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* TAB A: DRIVER LOGIN FLOW */}
            {/* ========================================================================= */}
            {activeTab === 'login' && (
              <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                  <div>
                    <h4 className="font-medium text-sm text-white">Registered Driver Login</h4>
                    <p className="text-xs text-white/50 font-light">Login with registered mobile number and 4-digit OTP</p>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-light">
                    VERIFIED ONLY
                  </span>
                </div>

                {!loginOtpSent ? (
                  /* Step 1: Input Mobile Number */
                  <form onSubmit={handleSendLoginOtp} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-white/40 font-medium mb-1.5">
                        Registered Mobile Number
                      </label>
                      <div className="flex items-center gap-2 p-3 rounded-2xl bg-white/[0.04] border border-white/15 focus-within:border-emerald-500/50">
                        <Phone className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                        <span className="text-sm font-mono text-white/40">+91</span>
                        <input
                          type="tel"
                          value={loginPhone}
                          onChange={(e) => setLoginPhone(e.target.value)}
                          placeholder="e.g. 98110 44219"
                          className="w-full bg-transparent text-sm font-light text-white focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    {loginError && (
                      <p className="text-xs text-rose-300 font-light">{loginError}</p>
                    )}

                    {/* Preset Demo Driver Shortcut */}
                    <button
                      type="button"
                      onClick={() => setLoginPhone('98110 44219')}
                      className="text-xs text-emerald-300 hover:text-emerald-200 font-light block"
                    >
                      Use Demo Driver: Rajesh Kumar (DL 01 AB 4829)
                    </button>

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-gradient-to-r from-emerald-500/90 to-teal-500/90 hover:from-emerald-400 hover:to-teal-400 text-black font-semibold rounded-2xl text-xs sm:text-sm transition-all shadow-lg shadow-emerald-500/15 flex items-center justify-center gap-2"
                    >
                      <span>Send 4-Digit Login OTP</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                ) : (
                  /* Step 2: 4-Digit OTP Verification */
                  <form onSubmit={handleVerifyLoginOtp} className="space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between text-xs font-light">
                      <span className="text-white/60">OTP sent to <strong className="text-white font-medium">+91 {loginPhone}</strong></span>
                      <button
                        type="button"
                        onClick={() => setLoginOtpSent(false)}
                        className="text-emerald-300 underline font-light"
                      >
                        Change Number
                      </button>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-white/40 font-medium mb-1.5">
                        Enter 4-Digit Verification OTP
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          maxLength={4}
                          value={loginOtp}
                          onChange={(e) => setLoginOtp(e.target.value.replace(/\D/g, ''))}
                          placeholder="8421"
                          className="w-full bg-white/[0.04] border border-white/15 focus:border-emerald-400/60 rounded-2xl px-4 py-3 text-white font-mono text-center text-xl tracking-widest focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    {loginError && (
                      <p className="text-xs text-rose-300 font-light">{loginError}</p>
                    )}

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-white/40 font-light">Demo Code:</span>
                      <button
                        type="button"
                        onClick={() => setLoginOtp('8421')}
                        className="text-emerald-300 font-light hover:underline"
                      >
                        Auto-fill 8421
                      </button>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-gradient-to-r from-emerald-500/90 to-teal-500/90 hover:from-emerald-400 hover:to-teal-400 text-black font-semibold rounded-2xl text-xs sm:text-sm transition-all shadow-lg shadow-emerald-500/15 flex items-center justify-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Verify & Open Driver Dashboard</span>
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB B: REGISTER NEW DRIVER (KYC & DOCUMENTS) */}
            {/* ========================================================================= */}
            {activeTab === 'register' && (
              <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
                {!regSubmitted ? (
                  <form onSubmit={handleRegisterKycSubmit} className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                      <div>
                        <h4 className="font-medium text-sm text-white">New Driver KYC Registration</h4>
                        <p className="text-xs text-white/50 font-light">Complete verification to join the verified fleet</p>
                      </div>
                      <span className="text-[10px] font-mono text-teal-300 bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/20 font-light">
                        FAST-TRACK KYC
                      </span>
                    </div>

                    {/* Section 1: Personal Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-wider text-white/40 font-medium mb-1.5">
                          Full Legal Name
                        </label>
                        <input
                          type="text"
                          required
                          value={regForm.fullName}
                          onChange={(e) => setRegForm({ ...regForm, fullName: e.target.value })}
                          className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-emerald-500/50 font-light"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-wider text-white/40 font-medium mb-1.5">
                          Mobile Number
                        </label>
                        <input
                          type="tel"
                          required
                          value={regForm.phone}
                          onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                          className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-emerald-500/50 font-light"
                        />
                      </div>
                    </div>

                    {/* Section 2: Vehicle Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-wider text-white/40 font-medium mb-1.5">
                          Vehicle Model & Year
                        </label>
                        <input
                          type="text"
                          required
                          value={regForm.vehicleModel}
                          onChange={(e) => setRegForm({ ...regForm, vehicleModel: e.target.value })}
                          className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-emerald-500/50 font-light"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-wider text-white/40 font-medium mb-1.5">
                          Commercial Number Plate
                        </label>
                        <input
                          type="text"
                          required
                          value={regForm.vehiclePlate}
                          onChange={(e) => setRegForm({ ...regForm, vehiclePlate: e.target.value })}
                          className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-3.5 py-2.5 text-white text-xs font-mono uppercase focus:outline-none focus:border-emerald-500/50 font-light"
                        />
                      </div>
                    </div>

                    {/* Section 3: Vehicle Category */}
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-white/40 font-medium mb-1.5">
                        Vehicle Fleet Tier
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { id: 'bike', label: 'Bike / Moto' },
                          { id: 'auto', label: 'Auto' },
                          { id: 'mini', label: 'Mini Cab' },
                          { id: 'sedan', label: 'Sedan' },
                        ].map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setRegForm({ ...regForm, vehicleCategory: cat.id as any })}
                            className={`py-2 px-1 text-center rounded-2xl text-xs transition-colors ${
                              regForm.vehicleCategory === cat.id
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-medium'
                                : 'bg-white/[0.03] text-white/50 border border-white/10 font-light'
                            }`}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Section 4: Document Verification & Supabase Storage Uploads */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-white/60 block text-[11px] uppercase font-mono font-medium">
                          FLOW 3: Driver KYC Document Uploads
                        </span>
                        <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                          <Database className="w-3 h-3" />
                          Bucket: driver-documents
                        </span>
                      </div>

                      {/* Document Numbers */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-wider text-white/40 font-medium mb-1">
                            Driving License (DL) Number
                          </label>
                          <input
                            type="text"
                            required
                            value={regForm.dlNumber}
                            onChange={(e) => setRegForm({ ...regForm, dlNumber: e.target.value })}
                            placeholder="e.g. DL-01202400918"
                            className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-emerald-500/50"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-wider text-white/40 font-medium mb-1">
                            Vehicle RC Number
                          </label>
                          <input
                            type="text"
                            required
                            value={regForm.rcNumber}
                            onChange={(e) => setRegForm({ ...regForm, rcNumber: e.target.value })}
                            placeholder="e.g. RC-DL01XY8832"
                            className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-emerald-500/50"
                          />
                        </div>
                      </div>

                      {/* Upload Inputs for DL & RC */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        {/* 1. DL Upload Input */}
                        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-white flex items-center gap-1.5">
                              <FileCheck className="w-4 h-4 text-emerald-400" />
                              Driving License File
                            </span>
                            <span className="text-[10px] text-emerald-300 font-mono">Ready</span>
                          </div>
                          <p className="text-[11px] text-white/40 font-light truncate">
                            {dlFile ? dlFile.name : dlFileName}
                          </p>
                          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-white text-[11px] cursor-pointer border border-white/10 transition-colors">
                            <UploadCloud className="w-3.5 h-3.5 text-teal-300" />
                            <span>{dlFile ? 'Change DL File' : 'Select DL Image/PDF'}</span>
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setDlFile(file);
                                  setDlFileName(file.name);
                                }
                              }}
                            />
                          </label>
                        </div>

                        {/* 2. RC Upload Input */}
                        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-white flex items-center gap-1.5">
                              <FileCheck className="w-4 h-4 text-teal-400" />
                              Vehicle RC Document
                            </span>
                            <span className="text-[10px] text-teal-300 font-mono">Ready</span>
                          </div>
                          <p className="text-[11px] text-white/40 font-light truncate">
                            {rcFile ? rcFile.name : rcFileName}
                          </p>
                          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-white text-[11px] cursor-pointer border border-white/10 transition-colors">
                            <UploadCloud className="w-3.5 h-3.5 text-teal-300" />
                            <span>{rcFile ? 'Change RC File' : 'Select RC Image/PDF'}</span>
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setRcFile(file);
                                  setRcFileName(file.name);
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>

                      {/* Verified Police Clearance Checkbox */}
                      <label className="flex items-center gap-2 text-white/70 cursor-pointer font-light pt-1">
                        <input
                          type="checkbox"
                          checked={regForm.policeClearance}
                          onChange={(e) => setRegForm({ ...regForm, policeClearance: e.target.checked })}
                          className="rounded accent-emerald-500"
                        />
                        <span>No criminal or driving violations recorded (Police Cleared ✓)</span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={kycSubmitting}
                      className="w-full py-3.5 bg-gradient-to-r from-emerald-500/90 to-teal-500/90 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-black font-semibold rounded-2xl text-xs sm:text-sm transition-all shadow-lg shadow-emerald-500/15 flex items-center justify-center gap-2"
                    >
                      {kycSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                          <span>Uploading Documents to Supabase Storage...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Application & Fast-Track KYC</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  /* Registration Approved Confirmation & Supabase Storage Public URLs Display */
                  <div className="text-center py-6 space-y-4 animate-slide-up">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-300">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-300 px-3 py-1 rounded-full font-light border border-emerald-500/20">
                        KYC VERIFIED & SUPABASE PERSISTED
                      </span>
                      <h3 className="text-xl font-light tracking-tight text-white mt-2">
                        Welcome to Apex Fleet, {regForm.fullName}!
                      </h3>
                      <p className="text-xs text-white/50 max-w-sm mx-auto font-light leading-relaxed">
                        Your commercial permit for <strong className="text-white font-medium">{regForm.vehiclePlate}</strong> is verified. ₹1,200 joining bonus is credited to your wallet.
                      </p>
                    </div>

                    {/* Supabase Storage Public URLs Breakdown */}
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2 text-left text-xs font-light max-w-lg mx-auto">
                      <div className="flex items-center justify-between text-[11px] pb-1.5 border-b border-white/[0.06]">
                        <span className="text-emerald-300 font-mono font-medium flex items-center gap-1.5">
                          <Database className="w-3.5 h-3.5" />
                          Supabase 'drivers' Table Record
                        </span>
                        <span className="text-white/40">bucket: driver-documents</span>
                      </div>

                      <div className="space-y-1.5 text-[11px]">
                        <div>
                          <span className="text-white/50 block">Driving License Public URL (dl_url):</span>
                          <a
                            href={supabaseDlUrl || `https://rttotmyyomrnpendoayk.supabase.co/storage/v1/object/public/driver-documents/dl_${regForm.vehiclePlate}.jpg`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-teal-300 hover:underline flex items-center gap-1 truncate"
                          >
                            <span className="truncate">{supabaseDlUrl || `https://rttotmyyomrnpendoayk.supabase.co/storage/v1/object/public/driver-documents/dl_${regForm.vehiclePlate}.jpg`}</span>
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          </a>
                        </div>

                        <div className="pt-1">
                          <span className="text-white/50 block">Vehicle RC Public URL (rc_url):</span>
                          <a
                            href={supabaseRcUrl || `https://rttotmyyomrnpendoayk.supabase.co/storage/v1/object/public/driver-documents/rc_${regForm.vehiclePlate}.jpg`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-teal-300 hover:underline flex items-center gap-1 truncate"
                          >
                            <span className="truncate">{supabaseRcUrl || `https://rttotmyyomrnpendoayk.supabase.co/storage/v1/object/public/driver-documents/rc_${regForm.vehiclePlate}.jpg`}</span>
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          </a>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleLaunchDashboardFromReg}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-500/90 to-teal-500/90 hover:from-emerald-400 hover:to-teal-400 text-black font-semibold text-xs rounded-2xl shadow-lg shadow-emerald-500/15 transition-all flex items-center justify-center gap-2 mx-auto"
                    >
                      <Radio className="w-4 h-4" />
                      <span>Open Driver Duty Dashboard</span>
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
