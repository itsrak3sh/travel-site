import React, { useState } from 'react';
import { Tour } from '../types';
import { X, CheckCircle, ShieldCheck, Calendar, Users, Sparkles, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BookingModalProps {
  tour: Tour | null;
  onClose: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ tour, onClose }) => {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [departureDate, setDepartureDate] = useState('2026-07-15');
  const [guests, setGuests] = useState(2);
  const [cabinTier, setCabinTier] = useState<'Standard' | 'Luxury' | 'Presidential'>('Luxury');
  const [addons, setAddons] = useState({
    helicopter: false,
    chef: false,
    insurance: true,
    photographer: false,
  });

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    notes: '',
  });

  if (!tour) return null;

  // Price calculations
  const basePricePerPerson = tour.priceUSD;
  const tierMultiplier = cabinTier === 'Presidential' ? 1.5 : cabinTier === 'Luxury' ? 1.2 : 1.0;
  const suiteTotal = basePricePerPerson * tierMultiplier * guests;

  const addonPrices = {
    helicopter: 850,
    chef: 600,
    insurance: 220 * guests,
    photographer: 500,
  };

  const totalAddons =
    (addons.helicopter ? addonPrices.helicopter : 0) +
    (addons.chef ? addonPrices.chef : 0) +
    (addons.insurance ? addonPrices.insurance : 0) +
    (addons.photographer ? addonPrices.photographer : 0);

  const grandTotal = Math.round(suiteTotal + totalAddons);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('success');
    try {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#FBBF24', '#0284C7', '#10B981'],
      });
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-6 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">Reserve Your Expedition</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'form' ? (
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {/* Tour Mini Summary Card */}
            <div className="flex gap-4 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
              <img
                src={tour.image}
                alt={tour.title}
                className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
              />
              <div className="flex-1">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wide">
                  {tour.destination}
                </span>
                <h3 className="font-serif font-bold text-base sm:text-lg text-white mb-1">
                  {tour.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-1">{tour.subtitle}</p>
                <div className="flex items-center gap-4 mt-2 text-xs font-semibold text-slate-300">
                  <span>{tour.durationDays} Days</span>
                  <span>•</span>
                  <span>{tour.groupSize}</span>
                </div>
              </div>
            </div>

            {/* Travel Dates & Guests */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-2">
                  Select Departure Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    min="2026-05-01"
                    max="2027-12-31"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                  />
                  <Calendar className="w-4 h-4 text-slate-400 absolute right-4 top-3.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-2">
                  Number of Guests
                </label>
                <div className="flex items-center justify-between bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-semibold">{guests} Guests</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setGuests(Math.max(1, guests - 1))}
                      className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center font-bold"
                    >
                      -
                    </button>
                    <button
                      type="button"
                      onClick={() => setGuests(Math.min(10, guests + 1))}
                      className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Cabin Tier Selection */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-2">
                Suite & Villa Category
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'Standard', name: 'Deluxe Suite', extra: 'Included', mult: 1.0 },
                  { id: 'Luxury', name: 'Oceanview Villa', extra: '+20% upgrade', mult: 1.2 },
                  { id: 'Presidential', name: 'Royal Penthouse', extra: '+50% luxury private', mult: 1.5 },
                ].map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setCabinTier(tier.id as any)}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      cabinTier === tier.id
                        ? 'bg-amber-500/10 border-amber-400 shadow-md shadow-amber-500/10'
                        : 'bg-slate-800/60 border-slate-700/80 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-white">{tier.name}</span>
                      <span className="text-[10px] text-amber-400 font-bold">{tier.extra}</span>
                    </div>
                    <span className="text-xs text-slate-400">
                      ${Math.round(basePricePerPerson * tier.mult).toLocaleString()} / guest
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Curated Add-ons */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-2">
                Optional Bespoke Enhancements
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700 cursor-pointer hover:bg-slate-800/70">
                  <input
                    type="checkbox"
                    checked={addons.helicopter}
                    onChange={(e) => setAddons({ ...addons, helicopter: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                  />
                  <div className="flex-1">
                    <span className="block text-xs font-bold text-white">Private Helicopter Airport Transfer</span>
                    <span className="text-[11px] text-slate-400">+$850 one-way private flight</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700 cursor-pointer hover:bg-slate-800/70">
                  <input
                    type="checkbox"
                    checked={addons.chef}
                    onChange={(e) => setAddons({ ...addons, chef: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                  />
                  <div className="flex-1">
                    <span className="block text-xs font-bold text-white">Private Villa Michelin Chef</span>
                    <span className="text-[11px] text-slate-400">+$600 bespoke 5-course dinner</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700 cursor-pointer hover:bg-slate-800/70">
                  <input
                    type="checkbox"
                    checked={addons.insurance}
                    onChange={(e) => setAddons({ ...addons, insurance: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                  />
                  <div className="flex-1">
                    <span className="block text-xs font-bold text-white">VIP Comprehensive Travel Guard</span>
                    <span className="text-[11px] text-emerald-400">+$220/guest (100% Medical + Cancel)</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700 cursor-pointer hover:bg-slate-800/70">
                  <input
                    type="checkbox"
                    checked={addons.photographer}
                    onChange={(e) => setAddons({ ...addons, photographer: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                  />
                  <div className="flex-1">
                    <span className="block text-xs font-bold text-white">Personal Expedition Photographer</span>
                    <span className="text-[11px] text-slate-400">+$500 high-res edited album</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <span className="block text-xs font-bold uppercase text-slate-400">Lead Traveler Details</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Full Name *"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
                />
                <input
                  type="email"
                  required
                  placeholder="Email Address *"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
                />
              </div>
              <input
                type="tel"
                required
                placeholder="Phone Number (with Country Code) *"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Total and Guarantee */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Calculated Total:</span>
                  <span className="text-2xl font-bold text-amber-400">${grandTotal.toLocaleString()}</span>
                  <span className="text-xs text-slate-400">for {guests} {guests === 1 ? 'guest' : 'guests'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>$0 Deposit due today. Free cancellation up to 30 days.</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/25 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>Confirm & Lock In Price</span>
              </button>
            </div>
          </form>
        ) : (
          /* Confirmation State */
          <div className="p-8 sm:p-12 text-center space-y-6 animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase tracking-widest mb-3">
                Reservation Confirmed
              </span>
              <h2 className="font-serif text-3xl font-bold text-white mb-2">
                You’re Going to {tour.destination}!
              </h2>
              <p className="text-slate-300 text-sm max-w-md mx-auto">
                Thank you, <strong className="text-white">{formData.fullName}</strong>. A dedicated Senior Travel Concierge will reach out to you within 2 hours at <strong className="text-white">{formData.email}</strong> to finalize customized itinerary preferences.
              </p>
            </div>

            {/* Summary Voucher */}
            <div className="max-w-md mx-auto bg-slate-800/80 rounded-2xl p-4 text-left border border-slate-700/60 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Booking Reference:</span>
                <span className="font-mono font-bold text-amber-400">WLX-{Math.floor(100000 + Math.random() * 900000)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Departure:</span>
                <span className="text-white font-medium">{departureDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Suite Tier:</span>
                <span className="text-white font-medium">{cabinTier} Villa</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Secured Price:</span>
                <span className="text-white font-bold">${grandTotal.toLocaleString()} USD</span>
              </div>
            </div>

            <div className="pt-4 flex justify-center">
              <button
                onClick={onClose}
                className="px-8 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all"
              >
                Return to Expeditions
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
