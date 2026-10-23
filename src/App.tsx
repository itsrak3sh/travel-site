import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { FeaturedDestinations } from './components/FeaturedDestinations';
import { FlashDeals } from './components/FlashDeals';
import { WhyUs } from './components/WhyUs';
import { Reviews } from './components/Reviews';
import { Newsletter } from './components/Newsletter';
import { Footer } from './components/Footer';
import { TourModal } from './components/TourModal';
import { BookingModal } from './components/BookingModal';
import { TripPlannerQuiz } from './components/TripPlannerQuiz';
import { WishlistDrawer } from './components/WishlistDrawer';
import { FloatingConcierge } from './components/FloatingConcierge';
import { TOURS_DATA } from './data/tours';
import { Tour } from './types';

export function App() {
  const [tours] = useState<Tour[]>(TOURS_DATA);
  const [wishlist, setWishlist] = useState<string[]>(['amalfi-coast-superyacht', 'kyoto-zen-hokkaido']);
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [bookingTour, setBookingTour] = useState<Tour | null>(null);
  const [quizOpen, setQuizOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);

  // Search state passed from Hero Search Bar to Destinations
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  const handleToggleWishlist = (tourId: string) => {
    setWishlist((prev) =>
      prev.includes(tourId) ? prev.filter((id) => id !== tourId) : [...prev, tourId]
    );
  };

  const handleSearch = (filters: { destination: string; category: string; guests: number; month: string }) => {
    setSearchQuery(filters.destination);
    setFilterCategory(filters.category);
  };

  const handleExploreClick = () => {
    const el = document.getElementById('destinations');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 selection:bg-amber-400 selection:text-slate-950">
      {/* Navigation */}
      <Navbar
        wishlistCount={wishlist.length}
        onOpenQuiz={() => setQuizOpen(true)}
        onOpenWishlist={() => setWishlistOpen(true)}
      />

      {/* Main Content */}
      <main>
        {/* Hero Section with Interactive Search */}
        <Hero
          onSearch={handleSearch}
          onExploreClick={handleExploreClick}
        />

        {/* Featured Expeditions / Tours Catalog */}
        <FeaturedDestinations
          tours={tours}
          wishlist={wishlist}
          onToggleWishlist={handleToggleWishlist}
          onSelectTour={(tour) => setSelectedTour(tour)}
          onBookTour={(tour) => setBookingTour(tour)}
          activeFilterCategory={filterCategory}
          searchQuery={searchQuery}
        />

        {/* Real-Time Flash Deals with Countdown */}
        <FlashDeals
          tours={tours}
          onBookTour={(tour) => setBookingTour(tour)}
        />

        {/* Value Proposition & Trust Badges */}
        <WhyUs />

        {/* Customer Testimonials & Reviews */}
        <Reviews />

        {/* High-Converting Newsletter Lead Magnet */}
        <Newsletter />
      </main>

      {/* Modern Luxury Footer */}
      <Footer />

      {/* Floating AI Concierge Action Button */}
      <FloatingConcierge onOpenQuiz={() => setQuizOpen(true)} />

      {/* Detailed Itinerary Modal */}
      <TourModal
        tour={selectedTour}
        onClose={() => setSelectedTour(null)}
        onBookNow={(tour) => {
          setSelectedTour(null);
          setBookingTour(tour);
        }}
        isWishlisted={selectedTour ? wishlist.includes(selectedTour.id) : false}
        onToggleWishlist={handleToggleWishlist}
      />

      {/* Interactive Reservation Flow Modal */}
      <BookingModal
        tour={bookingTour}
        onClose={() => setBookingTour(null)}
      />

      {/* AI Concierge Matchmaker Quiz */}
      <TripPlannerQuiz
        isOpen={quizOpen}
        onClose={() => setQuizOpen(false)}
        tours={tours}
        onSelectTour={(tour) => {
          setSelectedTour(tour);
        }}
      />

      {/* Wishlist Drawer */}
      <WishlistDrawer
        isOpen={wishlistOpen}
        onClose={() => setWishlistOpen(false)}
        wishlistIds={wishlist}
        tours={tours}
        onRemove={handleToggleWishlist}
        onBookTour={(tour) => {
          setWishlistOpen(false);
          setBookingTour(tour);
        }}
        onSelectTour={(tour) => {
          setWishlistOpen(false);
          setSelectedTour(tour);
        }}
      />
    </div>
  );
}

export default App;
