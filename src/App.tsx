import { useState } from 'react';
import { MobilityHeader } from './components/MobilityHeader';
import { MobilityHero } from './components/MobilityHero';
import { CustomTripView } from './components/CustomTripView';
import { QuickRideView } from './components/QuickRideView';
import { AuthModal } from './components/AuthModal';
import { DriverPartnerModal, DriverProfileData } from './components/DriverPartnerModal';
import { MobilityFooter } from './components/MobilityFooter';
import { MobilityMode, SharedActiveTrip, DriverBidItem, IntermediateStopItem } from './types/mobility';

export function App() {
  const [activeMode, setActiveMode] = useState<MobilityMode>('custom-trip');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [driverModalOpen, setDriverModalOpen] = useState(false);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [userName, setUserName] = useState('Alex Rider');

  // Driver Login & Duty Session State (persisted in localStorage)
  const [driverLoggedIn, setDriverLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem('goride_driver_logged_in') === 'true';
    } catch {
      return false;
    }
  });

  const [driverProfile, setDriverProfile] = useState<DriverProfileData>(() => {
    try {
      const saved = localStorage.getItem('goride_driver_profile');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {
      name: 'Rajesh Kumar',
      phone: '+91 98110 44219',
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
  });

  // Shared Active Trip State for Bidirectional Handshake
  const [sharedTrip, setSharedTrip] = useState<SharedActiveTrip | null>(() => {
    return {
      id: 'TRIP-APEX-89421',
      riderName: 'Alex Rider',
      pickup: 'Connaught Place, Inner Circle, New Delhi',
      destination: 'Terminal 3, Indira Gandhi International Airport',
      stops: [
        { id: '1', address: 'Cyber Hub, DLF Phase 2, Gurugram', haltDuration: '30m' }
      ],
      selectedVehicleTier: 'sedan',
      driverAgePref: '31-45',
      specialNotes: 'Need clean empty boot space for 2 trolley bags. AC on high.',
      status: 'idle',
      pickupOtp: '4821',
      dropoffOtp: '9245',
      bids: [],
      matchedBid: null,
      escrowStatus: 'none',
      customerPaidINR: 650,
      platformFeeINR: 98,
      driverPayoutINR: 552,
    };
  });

  const handleDriverLogin = (profile: DriverProfileData) => {
    setDriverLoggedIn(true);
    setDriverProfile(profile);
    try {
      localStorage.setItem('goride_driver_logged_in', 'true');
      localStorage.setItem('goride_driver_profile', JSON.stringify(profile));
    } catch {
      // ignore
    }
  };

  const handleDriverLogout = () => {
    setDriverLoggedIn(false);
    try {
      localStorage.removeItem('goride_driver_logged_in');
    } catch {
      // ignore
    }
  };

  const handleUpdateDriverDuty = (isOnline: boolean) => {
    const updated = { ...driverProfile, isOnline };
    setDriverProfile(updated);
    try {
      localStorage.setItem('goride_driver_profile', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleLoginSuccess = (name: string) => {
    setUserLoggedIn(true);
    setUserName(name);
  };

  // 1. Customer submits Step 5 -> Broadcast trip to shared pool
  const handleCustomerBroadcastTrip = (data: {
    pickup: string;
    destination: string;
    stops: IntermediateStopItem[];
    selectedVehicle: string;
    driverAgePref: string;
    specialNotes: string;
    initialBids: DriverBidItem[];
  }) => {
    setSharedTrip((prev) => ({
      id: `TRIP-${Date.now()}`,
      riderName: userName || 'Alex Rider',
      pickup: data.pickup,
      destination: data.destination,
      stops: data.stops,
      selectedVehicleTier: data.selectedVehicle,
      driverAgePref: data.driverAgePref,
      specialNotes: data.specialNotes,
      status: 'broadcasting',
      pickupOtp: prev?.pickupOtp || '4821',
      dropoffOtp: prev?.dropoffOtp || '9245',
      bids: data.initialBids,
      matchedBid: null,
      escrowStatus: 'none',
    }));
  };

  // 2. Driver inputs offer and clicks "Submit Quote" -> Appends quote to customer's live bids
  const handleDriverSubmitBid = (offerAmount: number) => {
    const newBid: DriverBidItem = {
      id: `bid-partner-${Date.now()}`,
      name: driverProfile.name,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      rating: driverProfile.rating,
      trips: driverProfile.trips,
      vehicleModel: driverProfile.vehicleModel,
      vehicleTier: 'Prime Sedan',
      plateNumber: driverProfile.vehiclePlate,
      driverAge: 38,
      quotedFareINR: offerAmount,
      etaMinutes: 3,
      distanceKm: 0.9,
      badge: '★ Your Live Partner Quote',
      verified: true,
      isLoggedInPartner: true,
    };

    setSharedTrip((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        status: 'broadcasting',
        bids: [newBid, ...prev.bids.filter((b) => !b.isLoggedInPartner)],
      };
    });
  };

  // 3. Customer calls and confirms ride -> Handshake changes status to "matched_en_route"
  const handleCustomerConfirmRide = (bid: DriverBidItem) => {
    setSharedTrip((prev) => {
      if (!prev) return null;
      const customerPaid = bid.quotedFareINR;
      const platformFee = Math.round(customerPaid * 0.15);
      const driverPayout = customerPaid - platformFee;
      return {
        ...prev,
        status: 'matched_en_route',
        matchedBid: bid,
        escrowStatus: 'locked',
        customerPaidINR: customerPaid,
        platformFeeINR: platformFee,
        driverPayoutINR: driverPayout,
      };
    });
  };

  // 4. Verify Pickup OTP -> Starts the journey in-transit
  const handleVerifyPickupOtp = (enteredOtp?: string): boolean => {
    if (enteredOtp && sharedTrip && enteredOtp.trim() !== sharedTrip.pickupOtp) {
      return false;
    }
    setSharedTrip((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        status: 'in_transit',
      };
    });
    return true;
  };

  // 5. Verify Drop-off OTP -> Completes trip & releases 85% payout to driver wallet
  const handleVerifyDropoffOtp = (enteredOtp: string) => {
    if (!sharedTrip) return false;
    if (enteredOtp.trim() !== sharedTrip.dropoffOtp) {
      return false;
    }

    const customerPaid = sharedTrip.customerPaidINR || sharedTrip.matchedBid?.quotedFareINR || 650;
    const platformFee = Math.round(customerPaid * 0.15);
    const driverPayout = customerPaid - platformFee;

    // Credit Driver Wallet with 85% payout
    setDriverProfile((prev) => {
      const updated = {
        ...prev,
        walletBalance: prev.walletBalance + driverPayout,
      };
      try {
        localStorage.setItem('goride_driver_profile', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    setSharedTrip((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        status: 'completed',
        escrowStatus: 'released',
        customerPaidINR: customerPaid,
        platformFeeINR: platformFee,
        driverPayoutINR: driverPayout,
      };
    });

    return true;
  };

  // Reset trip back to idle
  const handleResetTrip = () => {
    setSharedTrip((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        status: 'idle',
        bids: [],
        matchedBid: null,
        escrowStatus: 'none',
      };
    });
  };

  return (
    <div className="min-h-screen bg-dark-950 font-sans text-slate-100 selection:bg-emerald-500 selection:text-slate-950 flex flex-col justify-between">
      {/* 1. Main Navigation Header */}
      <MobilityHeader
        activeMode={activeMode}
        onModeChange={setActiveMode}
        onOpenDriverModal={() => setDriverModalOpen(true)}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        userLoggedIn={userLoggedIn}
        userName={userName}
        driverLoggedIn={driverLoggedIn}
        driverName={driverProfile.name}
        driverPlate={driverProfile.vehiclePlate}
        driverWalletBalance={driverProfile.walletBalance}
        driverIsOnline={driverProfile.isOnline}
        pendingTripRequestsCount={sharedTrip?.status === 'broadcasting' ? 1 : 0}
      />

      {/* 2. Cinematic Highway Night Driving Video Loop Hero Section */}
      <main className="flex-1">
        <MobilityHero activeMode={activeMode} onModeChange={setActiveMode}>
          {activeMode === 'custom-trip' ? (
            <CustomTripView
              sharedTrip={sharedTrip}
              onBroadcastTrip={handleCustomerBroadcastTrip}
              onCustomerConfirmRide={handleCustomerConfirmRide}
              onCustomerVerifyPickupOtp={handleVerifyPickupOtp}
              onCustomerVerifyDropoffOtp={handleVerifyDropoffOtp}
              onResetTrip={handleResetTrip}
              riderName={userName}
            />
          ) : (
            <QuickRideView />
          )}
        </MobilityHero>
      </main>

      {/* 3. Sleek Dark Cab-Tech Footer */}
      <MobilityFooter />

      {/* 4. Login / Signup Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* 5. Driver Partner Modal (Dual Tab Login/Register + Duty Dashboard) */}
      <DriverPartnerModal
        isOpen={driverModalOpen}
        onClose={() => setDriverModalOpen(false)}
        driverLoggedIn={driverLoggedIn}
        driverProfile={driverProfile}
        onDriverLogin={handleDriverLogin}
        onDriverLogout={handleDriverLogout}
        onUpdateDriverDuty={handleUpdateDriverDuty}
        sharedTrip={sharedTrip}
        onDriverSubmitBid={handleDriverSubmitBid}
        onVerifyPickupOtp={handleVerifyPickupOtp}
        onVerifyDropoffOtp={handleVerifyDropoffOtp}
        onResetTrip={handleResetTrip}
      />
    </div>
  );
}

export default App;
