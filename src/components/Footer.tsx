import React from 'react';
import { Compass, ShieldCheck, Award, Phone, Mail, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 text-xs sm:text-sm border-t border-slate-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main 4-column footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-md">
                <Compass className="w-5 h-5" />
              </div>
              <span className="font-serif tracking-widest text-xl font-bold text-white">
                WANDERLUX
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Wanderlux creates transformative, ultra-private journeys across the world's most remote and breathtaking destinations. Member of the Global Sustainable Tourism Council.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>ATOL Protected (#10984)</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5 text-xs text-slate-300">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Certified B Corporation</span>
              </div>
            </div>
          </div>

          {/* Destinations */}
          <div>
            <h4 className="text-white font-serif font-bold text-sm uppercase tracking-wider mb-4">
              Destinations
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li><a href="#destinations" className="hover:text-amber-300 transition-colors">Amalfi Coast & Capri</a></li>
              <li><a href="#destinations" className="hover:text-amber-300 transition-colors">Kyoto & Hokkaido, Japan</a></li>
              <li><a href="#destinations" className="hover:text-amber-300 transition-colors">Serengeti & Ngorongoro</a></li>
              <li><a href="#destinations" className="hover:text-amber-300 transition-colors">Swiss Alps & Zermatt</a></li>
              <li><a href="#destinations" className="hover:text-amber-300 transition-colors">Patagonia & Glaciers</a></li>
              <li><a href="#destinations" className="hover:text-amber-300 transition-colors">Bali & Komodo Islands</a></li>
            </ul>
          </div>

          {/* Experiences */}
          <div>
            <h4 className="text-white font-serif font-bold text-sm uppercase tracking-wider mb-4">
              Experiences
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li><a href="#destinations" className="hover:text-amber-300 transition-colors">Private Yachting Charters</a></li>
              <li><a href="#destinations" className="hover:text-amber-300 transition-colors">Alpine Helicopter Safaris</a></li>
              <li><a href="#destinations" className="hover:text-amber-300 transition-colors">Michelin Culinary Trails</a></li>
              <li><a href="#destinations" className="hover:text-amber-300 transition-colors">Aurora Glass Lodges</a></li>
              <li><a href="#destinations" className="hover:text-amber-300 transition-colors">Royal Desert Glamping</a></li>
            </ul>
          </div>

          {/* Concierge Contact */}
          <div>
            <h4 className="text-white font-serif font-bold text-sm uppercase tracking-wider mb-4">
              Private Concierge
            </h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400" />
                <span>+1 (800) 892-LUXE</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400" />
                <span>concierge@wanderlux.travel</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>740 Fifth Avenue, New York, NY</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} Wanderlux Journeys LLC. All Rights Reserved.
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-300">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300">Terms of Service</a>
            <a href="#" className="hover:text-slate-300">Sustainability Charter</a>
            <a href="#" className="hover:text-slate-300">Travel Insurance Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
