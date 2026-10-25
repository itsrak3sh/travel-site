export type MobilityMode = 'custom-trip' | 'quick-ride';

export interface VehicleOption {
  id: string;
  name: string;
  tier: 'Standard' | 'Comfort' | 'Executive' | 'Max' | 'Green';
  seats: number;
  etaMinutes: number;
  basePriceUSD: number;
  pricePerKm: number;
  image: string;
  tagline: string;
  eco: boolean;
  features: string[];
}

export interface CustomTripConfig {
  tripType: 'multi-stop' | 'hourly' | 'outstation' | 'airport';
  pickup: string;
  stops: string[];
  destination: string;
  departureTime: 'now' | 'scheduled';
  scheduledDate?: string;
  hoursNeeded?: number;
  passengers: number;
  luggage: number;
  selectedVehicleId: string;
  notes?: string;
}

export interface QuickRideConfig {
  pickup: string;
  destination: string;
  selectedVehicleId: string;
  paymentMethod: 'apex-pay' | 'card' | 'apple-pay' | 'cash';
  rideOption: 'standard' | 'silent' | 'pet-friendly' | 'extra-legroom';
}

export interface IntermediateStopItem {
  id: string;
  address: string;
  haltDuration: '15m' | '30m' | '60m';
}

export interface DriverBidItem {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  trips: number;
  vehicleModel: string;
  vehicleTier: string;
  plateNumber: string;
  driverAge: number;
  quotedFareINR: number;
  etaMinutes: number;
  distanceKm: number;
  badge?: string;
  verified: boolean;
  isLoggedInPartner?: boolean;
  phone?: string;
}

export type SharedTripStatus = 
  | 'idle' 
  | 'broadcasting' 
  | 'in-call' 
  | 'matched_en_route' 
  | 'in_transit' 
  | 'completed';

export interface SharedActiveTrip {
  id: string;
  riderName: string;
  riderPhone?: string;
  pickup: string;
  destination: string;
  stops: IntermediateStopItem[];
  selectedVehicleTier: string;
  driverAgePref: string;
  specialNotes: string;
  status: SharedTripStatus;
  pickupOtp: string;
  dropoffOtp: string;
  bids: DriverBidItem[];
  matchedBid: DriverBidItem | null;
  escrowStatus: 'none' | 'locked' | 'released';
  customerPaidINR?: number;
  platformFeeINR?: number;
  driverPayoutINR?: number;
}
