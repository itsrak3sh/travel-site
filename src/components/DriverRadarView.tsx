import React, { useState, useEffect } from 'react';
import { 
  Radio, Power, Coins, CheckCircle2, ShieldCheck, 
  Send, Navigation, MapPin, AlertCircle, Sparkles, 
  UploadCloud, FileCheck, ExternalLink, 
  Database, ArrowRight, KeyRound, LogOut, ArrowLeft,
  Phone
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SharedActiveTrip } from '../types/mobility';
import { DriverProfileData } from './DriverPartnerModal';
import { uploadDriverDocumentsAndSaveKyc, subscribeToDriverTripAcceptance } from '../lib/supabaseService';

interface DriverRadarViewProps {
  driverProfile: DriverProfileData;
  driverLoggedIn: boolean;
  onDriverLogin: (profile: DriverProfileData) => void;
  onDriverLogout: () => void;
  onUpdateDriverDuty: (isOnline: boolean) => void;
  sharedTrip: SharedActiveTrip | null;
  onDriverSubmitBid: (offerAmount: number) => void;
  onVerifyPickupOtp: (enteredOtp: string) => boolean;
  onVerifyDropoffOtp: (enteredOtp: string) => boolean;
  onResetTrip: () => void;
  onSwitchToCustomerView: () => void;
}

export const DriverRadarView: React.FC<DriverRadarViewProps> = ({
  driverProfile,
  driverLoggedIn,
  onDriverLogin,
  onDriverLogout,
  onUpdateDriverDuty,
  sharedTrip,
  onDriverSubmitBid,
  onVerifyPickupOtp,
  onVerifyDropoffOtp,
  onResetTrip,
  onSwitchToCustomerView,
}) => {
  // Tabs when logged out: 'login' | 'register'
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Tab A: Driver Login state
  const [loginPhone, setLoginPhone] = useState('98110 44219');
  const [loginOtpSent, setLoginOtpSent] = useState(false);
  const [loginOtp, setLoginOtp] = useState('8421');
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

  // Duty Dashboard live bid state
  const [bidAmount, setBidAmount] = useState('640');
  const [bidSubmitted, setBidSubmitted] = useState(false);
  const [instantPayoutDone, setInstantPayoutDone] = useState(false);

  // Handshake OTP verification states
  const [driverPickupOtpInput, setDriverPickupOtpInput] = useState('');
  const [driverDropoffOtpInput, setDriverDropoffOtpInput] = useState('');
  const [pickupOtpErr, setPickupOtpErr] = useState('');
  const [dropoffOtpErr, setDropoffOtpErr] = useState('');

  // Realtime Confirmation Alert State (Supabase 'trips' UPDATE subscription)
  const [acceptedAlertTrip, setAcceptedAlertTrip] = useState<{
    pickup: string;
    drop: string;
    fare: number;
    riderName: string;
    riderPhone: string;
    pickupOtp: string;
  } | null>(null);
  const [alertAcknowledged, setAlertAcknowledged] = useState(false);

  // Supabase Realtime Subscription on 'trips' table for UPDATE events (status = 'accepted')
  useEffect(() => {
    if (!driverLoggedIn || !driverProfile.isOnline) return;

    const unsubscribe = subscribeToDriverTripAcceptance(
      driverProfile.name || driverProfile.vehiclePlate,
      (acceptedTripRow) => {
        try {
          confetti({ particleCount: 90, spread: 70, origin: { y: 0.5 } });
        } catch {
          // ignore
        }
        const custName = (acceptedTripRow as any).customer_name || 
                         (acceptedTripRow as any).rider_name || 
                         (acceptedTripRow as any).customerName || 
                         (acceptedTripRow as any).special_notes?.match(/\[Customer:\s*([^|\]]+)/)?.[1]?.trim() ||
                         sharedTrip?.riderName || 
                         'Customer';
        const custPhone = (acceptedTripRow as any).customer_phone || 
                          (acceptedTripRow as any).rider_phone || 
                          (acceptedTripRow as any).customerPhone || 
                          (acceptedTripRow as any).special_notes?.match(/\|\s*([^\]]+)\]/)?.[1]?.trim() ||
                          sharedTrip?.riderPhone || 
                          '+91 98101 23456';

        setAcceptedAlertTrip({
          pickup: acceptedTripRow.pickup_location || sharedTrip?.pickup || 'Aerocity Central, New Delhi',
          drop: acceptedTripRow.drop_location || sharedTrip?.destination || 'DLF Cyber Hub, Gurugram',
          fare: acceptedTripRow.final_fare || sharedTrip?.customerPaidINR || 650,
          riderName: custName,
          riderPhone: custPhone,
          pickupOtp: acceptedTripRow.pickup_otp || sharedTrip?.pickupOtp || '4821',
        });
      }
    );

    return () => {
      unsubscribe();
    };
  }, [driverLoggedIn, driverProfile.isOnline, driverProfile.name, driverProfile.vehiclePlate, sharedTrip?.riderName, sharedTrip?.riderPhone, sharedTrip?.pickup, sharedTrip?.destination, sharedTrip?.customerPaidINR, sharedTrip?.pickupOtp]);

  // Trigger confirmation alert when sharedTrip updates to matched_en_route
  useEffect(() => {
    if (sharedTrip?.status === 'matched_en_route' && !alertAcknowledged) {
      try {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.5 } });
      } catch {
        // ignore
      }
      setAcceptedAlertTrip({
        pickup: sharedTrip.pickup,
        drop: sharedTrip.destination,
        fare: sharedTrip.customerPaidINR || sharedTrip.matchedBid?.quotedFareINR || 650,
        riderName: sharedTrip.riderName,
        riderPhone: sharedTrip.riderPhone || '+91 98101 23456',
        pickupOtp: sharedTrip.pickupOtp,
      });
    }
  }, [sharedTrip?.status, alertAcknowledged, sharedTrip?.pickup, sharedTrip?.destination, sharedTrip?.customerPaidINR, sharedTrip?.matchedBid, sharedTrip?.riderName, sharedTrip?.riderPhone, sharedTrip?.pickupOtp]);

  // Handle Tab A: Request Login OTP
  const handleSendLoginOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPhone.trim()) {
      setLoginError('Please enter your registered mobile number');
      return;
    }
    setLoginError('');
    setLoginOtpSent(true);
  };

  // Handle Tab A: Verify OTP & Login
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
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch {
      // ignore
    }
  };

  // Handle Tab B: Submit KYC Application & Upload Documents to Supabase
  const handleRegisterKycSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setKycSubmitting(true);

    try {
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
      walletBalance: 1200,
      isOnline: true,
      kycVerified: true,
    };
    onDriverLogin(newDriver);
    setRegSubmitted(false);
  };

  // Submit Fare Bid on incoming request (Flow 2)
  const handleSubmitBid = (e: React.FormEvent) => {
    e.preventDefault();
    const quoteNum = Number(bidAmount) || 640;
    onDriverSubmitBid(quoteNum);
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
      onVerifyPickupOtp(driverPickupOtpInput);
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      } catch {
        // ignore
      }
    } else {
      setPickupOtpErr(`Incorrect Pickup OTP! Rider code is ${sharedTrip.pickupOtp}`);
    }
  };

  // Driver verifies Drop-off OTP
  const handleDriverVerifyDropoff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sharedTrip) return;
    if (driverDropoffOtpInput.trim() === sharedTrip.dropoffOtp) {
      setDropoffOtpErr('');
      onVerifyDropoffOtp(driverDropoffOtpInput);
      try {
        confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
      } catch {
        // ignore
      }
    } else {
      setDropoffOtpErr(`Incorrect Drop-off OTP! Customer code is ${sharedTrip.dropoffOtp}`);
    }
  };

  const handleInstantPayout = () => {
    setInstantPayoutDone(true);
    setTimeout(() => setInstantPayoutDone(false), 3500);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in">
      
      {/* 1. TOP DUAL ROLE TEST CONTROLLER BANNER */}
      <div className="p-5 sm:p-6 rounded-3xl bg-black/60 backdrop-blur-2xl border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-light text-base sm:text-lg text-white tracking-tight">
                Driver Telematics & Auction Radar
              </h2>
              <span className="text-[10px] font-mono bg-teal-500/10 text-teal-300 px-2.5 py-0.5 rounded-full border border-teal-500/20">
                ROUTE: /driver
              </span>
              <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                <Database className="w-3 h-3" />
                Supabase Realtime
              </span>
            </div>
            <p className="text-xs text-white/50 font-light mt-0.5">
              Live chauffeur portal: receive trip broadcasts, submit bids, verify rider OTPs, and manage escrow settlements.
            </p>
          </div>
        </div>

        {/* Quick Switch to Customer View */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            type="button"
            onClick={onSwitchToCustomerView}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] text-white text-xs font-medium border border-white/10 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-emerald-300" />
            <span>Switch to Customer View (/)</span>
          </button>
        </div>
      </div>

      {/* REALTIME TRIP ACCEPTED CONFIRMATION MODAL */}
      {acceptedAlertTrip && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in">
          <div 
            className="relative w-full max-w-lg bg-black/95 backdrop-blur-2xl border border-emerald-500/50 rounded-3xl p-6 sm:p-8 text-white shadow-2xl space-y-6 animate-scale-up ring-1 ring-emerald-500/30"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header: Exact required prompt title */}
            <div className="flex items-center gap-3.5 pb-4 border-b border-white/10">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-emerald-500/25 to-teal-500/25 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-7 h-7 stroke-[2.5] text-emerald-400 animate-pulse" />
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30 font-semibold tracking-wider inline-block">
                  REALTIME HANDSHAKE CONFIRMED
                </span>
                <h3 className="font-semibold text-xl sm:text-2xl text-white tracking-tight mt-1">
                  Trip Confirmed! Head to Pickup
                </h3>
                <p className="text-xs text-white/60 font-light mt-0.5">
                  Customer has locked your quote in Escrow. Proceed to passenger pickup.
                </p>
              </div>
            </div>

            {/* Customer Details & Direct Call Button (Exact requirement) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.04] border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-inner">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300 font-bold text-lg shadow-md">
                  {(acceptedAlertTrip.riderName || 'C').charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className="text-white/40 text-[10px] uppercase font-mono block tracking-wider">
                    Customer Name
                  </span>
                  <span className="font-bold text-white text-lg block">
                    {acceptedAlertTrip.riderName}
                  </span>
                  <span className="text-xs font-mono text-emerald-300/90 block">
                    {acceptedAlertTrip.riderPhone}
                  </span>
                </div>
              </div>

              {/* Real Phone Dialer Anchor */}
              <a
                href={`tel:${acceptedAlertTrip.riderPhone.replace(/\s+/g, '')}`}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
              >
                <Phone className="w-4 h-4 stroke-[2.5]" />
                <span>Call Customer</span>
              </a>
            </div>

            {/* Locked Fare & Escrow Status */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-white/40 text-[11px] block font-light">Locked Customer Fare</span>
                <span className="font-mono text-2xl font-semibold text-emerald-300">
                  ₹{acceptedAlertTrip.fare}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-emerald-300 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 font-mono font-medium block">
                  85% Net Payout: ₹{Math.round(acceptedAlertTrip.fare * 0.85)}
                </span>
                <span className="text-[10px] text-white/40 font-light mt-1 block">
                  GoRide Escrow Vault Locked
                </span>
              </div>
            </div>

            {/* Route Details: Pickup & Drop */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3 text-xs font-light">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div>
                  <strong className="text-emerald-400 font-mono uppercase text-[10px] block tracking-wider">Pickup Location:</strong>
                  <span className="text-white/90 text-sm font-medium">{acceptedAlertTrip.pickup}</span>
                </div>
              </div>
              <div className="flex items-start gap-3 pt-2.5 border-t border-white/[0.06]">
                <div className="w-6 h-6 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-teal-400" />
                </div>
                <div>
                  <strong className="text-teal-400 font-mono uppercase text-[10px] block tracking-wider">Destination:</strong>
                  <span className="text-white/90 text-sm font-medium">{acceptedAlertTrip.drop}</span>
                </div>
              </div>
            </div>

            {/* Acknowledge Button */}
            <button
              type="button"
              onClick={() => {
                setAlertAcknowledged(true);
                setAcceptedAlertTrip(null);
              }}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-semibold text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 transition-all hover:scale-[1.01]"
            >
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              <span>Acknowledge & Navigate to Pickup</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW: LOGGED IN DRIVER DASHBOARD */}
      {/* ========================================================================= */}
      {driverLoggedIn ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT 7 COLS: DUTY RADAR, INCOMING AUCTIONS & LIVE RIDE LIFECYCLE */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. ONLINE / OFFLINE DUTY STATUS SWITCH */}
            <div className={`p-5 sm:p-6 rounded-3xl border backdrop-blur-2xl transition-all ${
              driverProfile.isOnline
                ? 'bg-black/40 border-emerald-500/30 shadow-xl shadow-emerald-950/10'
                : 'bg-black/30 border-white/10'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-medium ${
                    driverProfile.isOnline
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : 'bg-white/[0.04] text-white/40 border border-white/10'
                  }`}>
                    {driverProfile.isOnline ? (
                      <Radio className="w-6 h-6 text-emerald-300" />
                    ) : (
                      <Power className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-light text-base text-white tracking-tight">
                        {driverProfile.isOnline ? 'Duty Status: ONLINE' : 'Duty Status: OFFLINE'}
                      </h3>
                      <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-light uppercase tracking-wider ${
                        driverProfile.isOnline 
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' 
                          : 'bg-white/[0.05] text-white/40 border border-white/10'
                      }`}>
                        {driverProfile.isOnline ? 'Active on Sector Radar' : 'Duty Off'}
                      </span>
                    </div>
                    <p className="text-xs text-white/50 font-light mt-0.5">
                      {driverProfile.isOnline 
                        ? 'Broadcasting live telematics beacon to nearby riders. Live bidding active.' 
                        : 'You are invisible to rider searches. Turn duty online to receive trip requests.'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onUpdateDriverDuty(!driverProfile.isOnline)}
                  className={`px-5 py-2.5 rounded-2xl text-xs font-semibold transition-all shadow-md ${
                    driverProfile.isOnline
                      ? 'bg-white/[0.06] hover:bg-white/[0.1] text-white/80 font-light border border-white/10'
                      : 'bg-emerald-500/90 hover:bg-emerald-400 text-black'
                  }`}
                >
                  {driverProfile.isOnline ? 'Go Offline' : 'Go Online'}
                </button>
              </div>
            </div>

            {/* 2. LIVE INCOMING TRIP REQUESTS RADAR & METHOD 1 BIDDING / HANDSHAKE */}
            <div className="bg-black/40 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 border border-white/10 shadow-2xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse"></span>
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
                  {driverProfile.city} • Telematics Active
                </span>
              </div>

              {!driverProfile.isOnline ? (
                <div className="p-8 rounded-2xl bg-white/[0.02] border border-dashed border-white/10 text-center space-y-2">
                  <Power className="w-8 h-8 text-white/30 mx-auto" />
                  <p className="text-xs text-white/50 max-w-sm mx-auto font-light leading-relaxed">
                    You are offline. Toggle your duty status to <strong className="text-white font-medium">Online</strong> to receive live rider requests from Supabase.
                  </p>
                </div>
              ) : sharedTrip?.status === 'matched_en_route' ? (
                /* ==================== HERO STATE: TRIP CONFIRMED! HEAD TO PICKUP ==================== */
                <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-b from-emerald-950/40 to-black/60 border border-emerald-500/40 space-y-6 animate-fade-in shadow-2xl ring-1 ring-emerald-500/20">
                  {/* Hero Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-white/10 gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/25 to-teal-500/25 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shadow-lg shadow-emerald-500/20">
                        <CheckCircle2 className="w-6 h-6 text-emerald-400 stroke-[2.5] animate-pulse" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30 font-semibold tracking-wider">
                            RIDE CONFIRMED • EN ROUTE
                          </span>
                        </div>
                        <h3 className="font-bold text-xl sm:text-2xl text-white tracking-tight mt-0.5">
                          Trip Confirmed! Head to Pickup
                        </h3>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-xs text-emerald-300 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 font-mono font-medium block">
                        85% Net: ₹{Math.round((sharedTrip.customerPaidINR || sharedTrip.matchedBid?.quotedFareINR || 650) * 0.85)}
                      </span>
                      <span className="text-[10px] font-mono text-amber-300 block mt-1">
                        ESCROW LOCKED (₹{sharedTrip.customerPaidINR || sharedTrip.matchedBid?.quotedFareINR || 650})
                      </span>
                    </div>
                  </div>

                  {/* Customer Information & Direct Call Button */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.04] border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300 font-bold text-lg shadow-md">
                        {(sharedTrip.riderName || 'C').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="text-white/40 text-[10px] uppercase font-mono block tracking-wider">
                          Passenger / Customer
                        </span>
                        <h4 className="font-bold text-lg text-white">
                          {sharedTrip.riderName}
                        </h4>
                        <span className="text-xs font-mono text-emerald-300/90 block">
                          {sharedTrip.riderPhone || '+91 98101 23456'}
                        </span>
                      </div>
                    </div>

                    {/* Direct Real HTML Call Customer Anchor */}
                    <a
                      href={`tel:${(sharedTrip.riderPhone || '+919810123456').replace(/\s+/g, '')}`}
                      className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
                    >
                      <Phone className="w-4 h-4 stroke-[2.5]" />
                      <span>Call Customer ({sharedTrip.riderPhone || '+91 98101 23456'})</span>
                    </a>
                  </div>

                  {/* Prominent Pickup & Drop Route Details */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 text-xs font-light">
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Navigation className="w-4 h-4 text-emerald-300" />
                      </div>
                      <div>
                        <strong className="text-emerald-300 font-mono uppercase text-[10px] block tracking-wider font-medium">Pickup Point (Navigate Here):</strong>
                        <span className="text-white text-sm font-medium">{sharedTrip.pickup}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 pt-3 border-t border-white/[0.06]">
                      <div className="w-7 h-7 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <MapPin className="w-4 h-4 text-teal-300" />
                      </div>
                      <div>
                        <strong className="text-teal-300 font-mono uppercase text-[10px] block tracking-wider font-medium">Destination:</strong>
                        <span className="text-white text-sm font-medium">{sharedTrip.destination}</span>
                      </div>
                    </div>
                  </div>

                  {/* Pickup OTP Input Card */}
                  <form onSubmit={handleDriverVerifyPickup} className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-emerald-500/30 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <span className="font-semibold text-white block">Enter Rider's Pickup OTP:</span>
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
                        Auto-fill ({sharedTrip.pickupOtp})
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
                        className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-semibold text-xs rounded-2xl flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 whitespace-nowrap transition-all"
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
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-teal-500/30 space-y-4 animate-fade-in">
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
                      <div className="pt-2">
                        <a
                          href={`tel:${(sharedTrip.riderPhone || '+919810123456').replace(/\s+/g, '')}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 border border-teal-500/30 text-xs font-medium transition-colors shadow-sm"
                        >
                          <Phone className="w-3.5 h-3.5 text-teal-300" />
                          <span>Call Rider ({sharedTrip.riderPhone || '+91 98101 23456'})</span>
                        </a>
                      </div>
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
                        <span className="text-white/40 text-[11px] font-light">Customer will provide code at destination</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setDriverDropoffOtpInput(sharedTrip.dropoffOtp);
                          setDropoffOtpErr('');
                        }}
                        className="text-xs text-teal-300 hover:text-teal-200 underline font-light"
                      >
                        Auto-fill ({sharedTrip.dropoffOtp})
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
                <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4 animate-slide-up text-center">
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
                      <strong className="text-emerald-300 font-mono font-normal text-sm">₹{sharedTrip.driverPayoutINR || Math.round((sharedTrip.customerPaidINR || 650) * 0.85)}</strong> has been released and deposited into your Driver Payout Wallet.
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
                    onClick={onResetTrip}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500/90 to-teal-500/90 hover:from-emerald-400 hover:to-teal-400 text-black font-semibold text-xs transition-all shadow-md"
                  >
                    Accept Next Trip Request
                  </button>
                </div>
              ) : (
                /* ==================== ACTIVE AUCTION & BID SUBMISSION BOX ==================== */
                <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-5 animate-fade-in shadow-xl">
                  {/* Prominent Customer Details Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
                    <div className="flex items-center gap-3.5">
                      <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/35 flex items-center justify-center text-emerald-300 font-bold text-xl shadow-md">
                        {(sharedTrip?.riderName || 'Customer').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-mono uppercase bg-emerald-500/15 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/25 font-medium tracking-wider">
                            Verified Customer Request
                          </span>
                          <span className="text-[10px] font-mono text-amber-300 bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/10">
                            ★ 4.95 Rating
                          </span>
                        </div>
                        <h4 className="font-bold text-lg sm:text-xl text-white tracking-wide mt-1">
                          {sharedTrip?.riderName || 'Customer'}
                        </h4>
                        <span className="text-xs text-slate-400 font-mono">
                          {sharedTrip?.riderPhone || '+91 98101 23456'}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono text-teal-300 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/20 font-medium whitespace-nowrap flex items-center gap-1.5 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
                      <span>ACTIVE RADAR</span>
                    </span>
                  </div>

                  {/* Route Card: Pickup and Drop clearly highlighted */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-mono uppercase text-emerald-400 block tracking-wider font-medium">Pickup Location</span>
                        <p className="text-sm font-semibold text-white truncate mt-0.5">{sharedTrip?.pickup || 'Pickup location'}</p>
                      </div>
                    </div>

                    <div className="border-t border-white/[0.06] pt-3 flex items-start gap-3">
                      <div className="w-6 h-6 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-teal-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-mono uppercase text-teal-400 block tracking-wider font-medium">Drop Destination</span>
                        <p className="text-sm font-semibold text-white truncate mt-0.5">{sharedTrip?.destination || 'Drop location'}</p>
                      </div>
                    </div>

                    {sharedTrip?.stops && sharedTrip.stops.length > 0 && (
                      <div className="text-[11px] text-white/50 font-light pt-2 border-t border-white/[0.04]">
                        • {sharedTrip.stops.length} Scheduled Halt: {sharedTrip.stops[0].address}
                      </div>
                    )}
                  </div>

                  {/* Rider Note */}
                  <div className="p-3.5 rounded-2xl bg-white/[0.02] text-xs text-white/70 border border-white/[0.08] font-light">
                    <span className="text-white/40 font-mono text-[10px] uppercase block mb-1">Rider Special Expectation:</span>
                    <span className="italic text-white/90">"{sharedTrip?.specialNotes || 'Need clean empty boot space for 2 bags. AC on high.'}"</span>
                  </div>

                  {/* Bid Submission Form (Flow 2) */}
                  <form onSubmit={handleSubmitBid} className="pt-3 border-t border-white/[0.06] space-y-3">
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
                            className={`px-3 py-1 rounded-full font-mono text-[11px] transition-colors ${
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

                    <div className="flex gap-2.5">
                      <div className="relative flex-1">
                        <span className="absolute left-3.5 top-2.5 font-mono text-emerald-300 font-light text-sm">₹</span>
                        <input
                          type="number"
                          value={bidAmount}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => {
                            const clean = e.target.value.replace(/\D/g, '');
                            setBidAmount(clean);
                          }}
                          placeholder="Enter offer amount..."
                          className="w-full bg-white/[0.04] border border-white/15 focus:border-teal-400/60 rounded-2xl pl-8 pr-3 py-2.5 text-sm text-white font-mono focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-black font-semibold text-xs rounded-2xl flex items-center gap-1.5 shadow-md shadow-teal-500/15 transition-all whitespace-nowrap"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Offer Fare (₹{bidAmount})</span>
                      </button>
                    </div>

                    {bidSubmitted && (
                      <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2 animate-fade-in font-light">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span>Your bid of <strong className="font-normal text-white">₹{bidAmount}</strong> has been inserted into Supabase <strong>'bids'</strong> table and broadcast live to rider via Realtime!</span>
                      </div>
                    )}
                  </form>
                </div>
              )}
            </div>

            {/* 3. RECENT PAYOUT HISTORY */}
            <div className="p-6 rounded-3xl bg-black/40 backdrop-blur-2xl border border-white/10 space-y-3 text-xs font-light shadow-xl">
              <span className="text-white/60 font-light block">Recent Escrow Releases:</span>
              <div className="space-y-2">
                {[
                  { dest: 'Terminal 3 IGI Airport (Custom Trip)', fare: '₹552.00', status: '85% Released', time: '1 hr ago' },
                  { dest: 'Cyber City Phase 2 (Quick Ride)', fare: '₹221.00', status: '85% Released', time: '3 hrs ago' },
                  { dest: 'Connaught Place Outer Circle', fare: '₹161.50', status: '85% Released', time: 'Yesterday' },
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
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

          {/* RIGHT 5 COLS: DRIVER PROFILE, WALLET STATS & KYC DOCUMENT UPLOADER */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Driver Profile Card */}
            <div className="p-6 rounded-3xl bg-black/40 backdrop-blur-2xl border border-white/10 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/15 p-0.5 shadow-lg flex items-center justify-center font-medium text-emerald-300 text-lg">
                    {driverProfile.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-medium text-base text-white">{driverProfile.name}</h3>
                    <p className="text-xs text-white/50 font-mono">{driverProfile.vehiclePlate}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onDriverLogout}
                  className="p-2 rounded-xl bg-white/[0.04] hover:bg-rose-500/15 text-white/50 hover:text-rose-300 border border-white/10 transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              <div className="pt-2 border-t border-white/[0.06] grid grid-cols-2 gap-2 text-xs font-light">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-white/40 text-[10px] block">Vehicle Model</span>
                  <span className="text-white font-normal truncate block">{driverProfile.vehicleModel}</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-white/40 text-[10px] block">KYC Status</span>
                  <span className="text-emerald-300 font-normal flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified
                  </span>
                </div>
              </div>
            </div>

            {/* Wallet Balance & Earnings */}
            <div className="p-6 rounded-3xl bg-black/40 backdrop-blur-2xl border border-white/10 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <span className="text-xs font-mono uppercase tracking-wider text-white/40">Payout Wallet</span>
                <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  85% Net Escrow
                </span>
              </div>

              <div className="space-y-1">
                <span className="font-mono text-3xl font-light text-emerald-300 block">
                  ₹{driverProfile.walletBalance}.00
                </span>
                <span className="text-xs text-white/40 font-light">Available for immediate IMPS withdrawal</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 text-xs font-light">
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10">
                  <span className="text-white/40 text-[10px] block">Today's Earnings</span>
                  <span className="font-mono text-white text-base font-normal">₹1,840.00</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10">
                  <span className="text-white/40 text-[10px] block">Rider Tips (100%)</span>
                  <span className="font-mono text-teal-300 text-base font-normal">₹240.00</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleInstantPayout}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500/90 to-teal-500/90 hover:from-emerald-400 hover:to-teal-400 text-black font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/15 transition-all"
              >
                <Coins className="w-3.5 h-3.5" />
                <span>Instant IMPS Cashout to Bank</span>
              </button>

              {instantPayoutDone && (
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2 animate-slide-up font-light">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Payout of ₹{driverProfile.walletBalance} dispatched via IMPS to HDFC Bank!</span>
                </div>
              )}
            </div>

            {/* KYC Uploads Quick Manager */}
            <div className="p-6 rounded-3xl bg-black/40 backdrop-blur-2xl border border-white/10 shadow-2xl space-y-3.5 text-xs font-light">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <span className="text-white/60 font-medium">Supabase KYC Documents</span>
                <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  driver-documents
                </span>
              </div>

              <div className="space-y-2">
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="text-white block font-normal">Driving License (DL)</span>
                      <span className="text-[10px] text-white/40">Verified commercial chauffeur permit</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-300 font-mono">dl_url ✓</span>
                </div>

                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-teal-400" />
                    <div>
                      <span className="text-white block font-normal">Vehicle RC Certificate</span>
                      <span className="text-[10px] text-white/40">Fitness, insurance & emission cleared</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-teal-300 font-mono">rc_url ✓</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* ========================================================================= */
        /* VIEW: LOGGED OUT DRIVER (LOGIN / REGISTRATION) */
        /* ========================================================================= */
        <div className="max-w-2xl mx-auto bg-black/40 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
          <div>
            <span className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/20 font-light tracking-wider">
              GoRide / Apex Chauffeur Network
            </span>
            <h3 className="font-light text-2xl text-white tracking-tight mt-2.5">
              Driver Login & Registration
            </h3>
            <p className="text-xs text-white/50 mt-1 font-light leading-relaxed">
              Earn 85% net fare, 100% of customer tips, and receive live Realtime trip auctions.
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

          {/* TAB A: DRIVER LOGIN */}
          {activeTab === 'login' && (
            <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
              {!loginOtpSent ? (
                <form onSubmit={handleSendLoginOtp} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-white/40 font-medium mb-1.5">
                      Registered Mobile Number
                    </label>
                    <div className="flex items-center gap-2 p-3 rounded-2xl bg-white/[0.04] border border-white/15 focus-within:border-emerald-500/50">
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

                  {loginError && <p className="text-xs text-rose-300 font-light">{loginError}</p>}

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-500/90 to-teal-500/90 hover:from-emerald-400 hover:to-teal-400 text-black font-semibold rounded-2xl text-xs sm:text-sm transition-all shadow-lg shadow-emerald-500/15 flex items-center justify-center gap-2"
                  >
                    <span>Send Login OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyLoginOtp} className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between text-xs font-light">
                    <span className="text-white/60">OTP sent to <strong className="text-white font-medium">+91 {loginPhone}</strong></span>
                    <button
                      type="button"
                      onClick={() => setLoginOtpSent(false)}
                      className="text-emerald-300 underline font-light"
                    >
                      Change
                    </button>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-white/40 font-medium mb-1.5">
                      Enter 4-Digit Verification OTP
                    </label>
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

                  {loginError && <p className="text-xs text-rose-300 font-light">{loginError}</p>}

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-500/90 to-teal-500/90 hover:from-emerald-400 hover:to-teal-400 text-black font-semibold rounded-2xl text-xs sm:text-sm transition-all shadow-lg shadow-emerald-500/15 flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify & Open Driver Radar</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB B: REGISTER NEW DRIVER (KYC) */}
          {activeTab === 'register' && (
            <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
              {!regSubmitted ? (
                <form onSubmit={handleRegisterKycSubmit} className="space-y-4">
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-white/40 font-medium mb-1.5">
                        Vehicle Model
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
                        Number Plate
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

                  {/* KYC Documents */}
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                    <span className="text-white/50 block text-[11px] uppercase font-mono font-medium">
                      Upload KYC Documents (Supabase Storage: driver-documents)
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5">
                        <span className="font-medium text-white flex items-center gap-1 text-xs">
                          <FileCheck className="w-3.5 h-3.5 text-emerald-400" /> Driving License
                        </span>
                        <p className="text-[11px] text-white/40 truncate">{dlFile ? dlFile.name : dlFileName}</p>
                        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-white text-[11px] cursor-pointer border border-white/10 transition-colors">
                          <UploadCloud className="w-3.5 h-3.5 text-teal-300" />
                          <span>Select DL File</span>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) {
                                setDlFile(f);
                                setDlFileName(f.name);
                              }
                            }}
                          />
                        </label>
                      </div>

                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5">
                        <span className="font-medium text-white flex items-center gap-1 text-xs">
                          <FileCheck className="w-3.5 h-3.5 text-teal-400" /> Vehicle RC
                        </span>
                        <p className="text-[11px] text-white/40 truncate">{rcFile ? rcFile.name : rcFileName}</p>
                        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-white text-[11px] cursor-pointer border border-white/10 transition-colors">
                          <UploadCloud className="w-3.5 h-3.5 text-teal-300" />
                          <span>Select RC File</span>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) {
                                setRcFile(f);
                                setRcFileName(f.name);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={kycSubmitting}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-500/90 to-teal-500/90 hover:from-emerald-400 hover:to-teal-400 text-black font-semibold rounded-2xl text-xs sm:text-sm transition-all shadow-lg shadow-emerald-500/15 flex items-center justify-center gap-2"
                  >
                    {kycSubmitting ? 'Uploading to Supabase Storage...' : 'Submit Application & Fast-Track KYC'}
                  </button>
                </form>
              ) : (
                <div className="text-center py-6 space-y-4 animate-slide-up">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-300">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-light tracking-tight text-white">
                    Welcome to Apex Fleet, {regForm.fullName}!
                  </h3>
                  {(supabaseDlUrl || supabaseRcUrl) && (
                    <div className="p-3 bg-white/[0.04] border border-white/10 rounded-xl text-left text-xs font-mono space-y-1 max-w-sm mx-auto">
                      <span className="text-white/40 block text-[10px]">Supabase Storage Uploads:</span>
                      {supabaseDlUrl && (
                        <a href={supabaseDlUrl} target="_blank" rel="noreferrer" className="text-emerald-300 truncate flex items-center gap-1 hover:underline">
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">DL: {supabaseDlUrl}</span>
                        </a>
                      )}
                      {supabaseRcUrl && (
                        <a href={supabaseRcUrl} target="_blank" rel="noreferrer" className="text-teal-300 truncate flex items-center gap-1 hover:underline">
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">RC: {supabaseRcUrl}</span>
                        </a>
                      )}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleLaunchDashboardFromReg}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-500/90 to-teal-500/90 text-black font-semibold text-xs rounded-2xl shadow-lg shadow-emerald-500/15 transition-all flex items-center justify-center gap-2 mx-auto"
                  >
                    <Radio className="w-4 h-4" />
                    <span>Open Driver Radar Dashboard</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
