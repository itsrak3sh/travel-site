export interface Tour {
  id: string;
  title: string;
  subtitle: string;
  destination: string;
  country: string;
  region: 'Europe' | 'Asia' | 'Americas' | 'Africa' | 'Oceania' | 'Polar';
  category: 'Trending' | 'Beach' | 'Mountain' | 'Cultural' | 'Wildlife' | 'Luxury';
  durationDays: number;
  groupSize: string;
  rating: number;
  reviewCount: number;
  priceUSD: number;
  originalPriceUSD?: number;
  image: string;
  gallery: string[];
  badge?: string;
  highlights: string[];
  itinerary: {
    day: number;
    title: string;
    description: string;
  }[];
  included: string[];
  nextDeparture: string;
}

export interface SearchFilters {
  destination: string;
  category: string;
  duration: string;
  budget: string;
}

export interface BookingDetails {
  tourId: string;
  tourTitle: string;
  date: string;
  guests: number;
  cabinType: 'Standard Suite' | 'Luxury Ocean Villa' | 'Presidential Penthouse';
  addons: {
    privateHelicopter: boolean;
    personalChef: boolean;
    travelInsurance: boolean;
    photographyPackage: boolean;
  };
  fullName: string;
  email: string;
  phone: string;
  specialRequests?: string;
  totalPrice: number;
}
