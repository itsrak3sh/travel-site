import { useState, useEffect } from 'react';
import { MobilityHeader } from './components/MobilityHeader';
import { MobilityHero } from './components/MobilityHero';
import { CustomTripView } from './components/CustomTripView';
import { QuickRideView } from './components/QuickRideView';
import { DriverRadarView } from './components/DriverRadarView';
import { AuthModal } from './components/AuthModal';
import { DriverPartnerModal, DriverProfileData } from './components/DriverPartnerModal';
import { MobilityFooter } from './components/MobilityFooter';
import { MobilityMode, SharedActiveTrip, DriverBidItem, IntermediateStopItem } from './types/mobility';
import { 
  insertTripRecord, 
  subscribeToTripBids, 
  subscribeToSearchingTrips, 
  insertDriverBid,
  generateUUID 
} from './lib/supabaseService';
import { supabase } from './lib/supabaseClient.js';

export function App() {
  // Direct route detection: support '/driver' route directly
  const getInitialView = (): 'customer' | 'driver' => {
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/driver')) {
      return 'driver';
    }
    return 'customer';
  };

  const [currentAppView, setCurrentAppView] = useState<'customer' | 'driver'>(getInitialView);
  const [activeMode, setActiveMode] = useState<MobilityMode>('custom-trip');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [driverModalOpen, setDriverModalOpen] = useState(false);

  // Customer Login Session State (persisted in localStorage)
  const [customerUser, setCustomerUser] = useState<{ name: string; phone: string; loggedIn: boolean }>(() => {
    try {
      const saved = localStorage.getItem('goride_customer_user');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return { name: 'Alex Rider', phone: '+91 98101 23456', loggedIn: false };
  });

  const [userLoggedIn, setUserLoggedIn] = useState<boolean>(customerUser.loggedIn);
  const [userName, setUserName] = useState<string>(customerUser.name);
  const [userPhone, setUserPhone] = useState<string>(customerUser.phone);

  // Handle browser Back / Forward navigation and direct URL route changes
  useEffect(() => {
    const handlePopState = () => {
      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/driver')) {
        setCurrentAppView('driver');
      } else {
        setCurrentAppView('customer');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleToggleAppView = (view: 'customer' | 'driver') => {
    setCurrentAppView(view);
    const targetPath = view === 'driver' ? '/driver' : '/';
    if (typeof window !== 'undefined' && window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
  };

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
      id: generateUUID(),
      riderName: customerUser.name,
      riderPhone: customerUser.phone,
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

  const handleLoginSuccess = (name: string, phone?: string) => {
    setUserLoggedIn(true);
    setUserName(name);
    if (phone) setUserPhone(phone);
    setCustomerUser({ name, phone: phone || userPhone, loggedIn: true });
    setSharedTrip((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        riderName: name,
        riderPhone: phone || prev.riderPhone,
      };
    });
  };

  // FLOW 1: Customer submits Step 5 -> Insert into 'trips' table with status 'searching' & broadcast
  const handleCustomerBroadcastTrip = async (data: {
    pickup: string;
    destination: string;
    stops: IntermediateStopItem[];
    selectedVehicle: string;
    driverAgePref: string;
    specialNotes: string;
    initialBids: DriverBidItem[];
  }) => {
    const currentPickupOtp = sharedTrip?.pickupOtp || '4821';
    const currentDropOtp = sharedTrip?.dropoffOtp || '9245';
    const newTripId = generateUUID();

    // 1. Insert record into Supabase 'trips' table with a valid UUID
    const { trip } = await insertTripRecord({
      id: newTripId,
      bookingMode: 'custom',
      pickup: data.pickup,
      destination: data.destination,
      stops: data.stops,
      vehiclePreference: data.selectedVehicle,
      driverAgePref: data.driverAgePref,
      specialNotes: data.specialNotes,
      pickupOtp: currentPickupOtp,
      dropoffOtp: currentDropOtp,
    });

    const activeTripId = trip?.id || newTripId;

    setSharedTrip({
      id: activeTripId,
      riderName: userName || 'Alex Rider',
      riderPhone: userPhone || '+91 98101 23456',
      pickup: data.pickup,
      destination: data.destination,
      stops: data.stops,
      selectedVehicleTier: data.selectedVehicle,
      driverAgePref: data.driverAgePref,
      specialNotes: data.specialNotes,
      status: 'broadcasting',
      pickupOtp: currentPickupOtp,
      dropoffOtp: currentDropOtp,
      bids: data.initialBids,
      matchedBid: null,
      escrowStatus: 'none',
    });
  };

  // FLOW 1: Subscribe via Supabase Realtime to 'bids' table for changes on this trip_id so received bids update live on UI
  useEffect(() => {
    if (!sharedTrip?.id || sharedTrip.status !== 'broadcasting') return;

    const unsubscribe = subscribeToTripBids(sharedTrip.id, (incomingBid) => {
      setSharedTrip((prev) => {
        if (!prev || prev.id !== sharedTrip.id) return prev;
        const exists = prev.bids.some((b) => b.id === incomingBid.id);
        if (exists) {
          return {
            ...prev,
            bids: prev.bids.map((b) => (b.id === incomingBid.id ? incomingBid : b)),
          };
        }
        return {
          ...prev,
          bids: [incomingBid, ...prev.bids],
        };
      });
    });

    return () => {
      unsubscribe();
    };
  }, [sharedTrip?.id, sharedTrip?.status]);

  // FLOW 2: Driver Radar - Subscribe to 'trips' table for status = 'searching'
  useEffect(() => {
    if (!driverLoggedIn || !driverProfile.isOnline) return;

    const unsubscribe = subscribeToSearchingTrips((searchingTrip) => {
      setSharedTrip((prev) => {
        // If already tracking this trip, don't overwrite local bidding state
        if (prev?.id === searchingTrip.id && prev.status === 'broadcasting') {
          return prev;
        }
        return {
          id: searchingTrip.id,
          riderName: 'Alex Rider',
          pickup: searchingTrip.pickup_location,
          destination: searchingTrip.drop_location,
          stops: searchingTrip.route_stops || [],
          selectedVehicleTier: searchingTrip.vehicle_preference || 'sedan',
          driverAgePref: searchingTrip.driver_age_preference || 'any',
          specialNotes: searchingTrip.special_notes || '',
          status: 'broadcasting',
          pickupOtp: searchingTrip.pickup_otp || '4821',
          dropoffOtp: searchingTrip.drop_otp || '9245',
          bids: prev?.id === searchingTrip.id ? prev.bids : [],
          matchedBid: null,
          escrowStatus: 'none',
        };
      });
    });

    return () => {
      unsubscribe();
    };
  }, [driverLoggedIn, driverProfile.isOnline]);

  // FLOW 2: Driver clicks 'Offer Fare' / 'Submit Quote' -> Insert record into 'bids' table with quoted_fare and eta_minutes
  const handleDriverSubmitBid = async (offerAmount: number) => {
    const activeTripId = sharedTrip?.id || generateUUID();

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
      badge: '★ Your Live Partner Quote (Supabase)',
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

    // Insert into Supabase 'bids' table
    await insertDriverBid({
      tripId: activeTripId,
      quotedFare: offerAmount,
      etaMinutes: 3,
      driverName: driverProfile.name,
      vehicleModel: driverProfile.vehicleModel,
      vehiclePlate: driverProfile.vehiclePlate,
    });
  };

  // 3. Customer calls and confirms ride -> Handshake changes status to "matched_en_route"
  const handleCustomerConfirmRide = async (bid: DriverBidItem) => {
    const customerPaid = bid.quotedFareINR;
    const platformFee = Math.round(customerPaid * 0.15);
    const driverPayout = customerPaid - platformFee;

    setSharedTrip((prev) => {
      if (!prev) return null;
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

    // Update Supabase 'trips' table to status = 'accepted' to trigger Realtime Driver Alert
    try {
      if (sharedTrip?.id) {
        await supabase
          .from('trips')
          .update({
            status: 'accepted',
            driver_id: bid.id || driverProfile.name || 'driver-partner',
            final_fare: customerPaid,
            escrow_locked: true,
          })
          .eq('id', sharedTrip.id);
      }
    } catch (err) {
      console.warn('Realtime trip status update handled:', err);
    }
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
      {/* 1. Main Navigation Header with Book Ride / Driver Partner Role Switch */}
      <MobilityHeader
        activeMode={activeMode}
        onModeChange={(mode) => {
          setActiveMode(mode);
          if (currentAppView !== 'customer') {
            handleToggleAppView('customer');
          }
        }}
        currentAppView={currentAppView}
        onNavigateView={handleToggleAppView}
        onNavigateHome={() => handleToggleAppView('customer')}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        userLoggedIn={userLoggedIn}
        userName={userName}
      />

      {/* 2. Main Viewport: Swappable between Customer View (/) and Driver Radar View (/driver) */}
      <main className="flex-1">
        {currentAppView === 'driver' ? (
          <DriverRadarView
            driverProfile={driverProfile}
            driverLoggedIn={driverLoggedIn}
            onDriverLogin={handleDriverLogin}
            onDriverLogout={handleDriverLogout}
            onUpdateDriverDuty={handleUpdateDriverDuty}
            sharedTrip={sharedTrip}
            onDriverSubmitBid={handleDriverSubmitBid}
            onVerifyPickupOtp={handleVerifyPickupOtp}
            onVerifyDropoffOtp={handleVerifyDropoffOtp}
            onResetTrip={handleResetTrip}
            onSwitchToCustomerView={() => handleToggleAppView('customer')}
          />
        ) : (
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
        )}
      </main>

      {/* 3. Sleek Dark Cab-Tech Footer */}
      <MobilityFooter />

      {/* 4. Frictionless Customer Phone Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        initialName={userName}
        initialPhone={userPhone}
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
