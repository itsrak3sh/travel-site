import { Tour } from '../types';

export const TOURS_DATA: Tour[] = [
  {
    id: 'amalfi-coast-superyacht',
    title: 'Amalfi Coast & Capri Yachting Odysseys',
    subtitle: 'Private Catamaran, Clifftop Villas & Michelin Cliffside Dining',
    destination: 'Positano, Capri & Ravello',
    country: 'Italy',
    region: 'Europe',
    category: 'Luxury',
    durationDays: 7,
    groupSize: 'Max 8 guests',
    rating: 4.98,
    reviewCount: 312,
    priceUSD: 4250,
    originalPriceUSD: 5100,
    badge: 'Best Seller',
    image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80'
    ],
    highlights: [
      'Private chartered 58ft Riva Yacht through Faraglioni rock formations',
      'Exclusive reservation at 2-Michelin Star Quattro Passi',
      'Vintage Alfa Romeo coastal cruise along the famous Amalfi Cliffside drive',
      'Private limoncello tasting in 300-year-old organic lemon groves'
    ],
    itinerary: [
      { day: 1, title: 'Arrival in Naples & Helicopter to Positano', description: 'Scenic helicopter transfer landing at a private cliffside helipad. Welcome champagne toast at Le Sirenuse.' },
      { day: 2, title: 'Yacht Charter to Capri & Blue Grotto', description: 'Morning sail across the Tyrrhenian Sea, swimming in private coves and exploring Capri by convertible taxi.' },
      { day: 3, title: 'Ravello Gardens & Classical Sunset Concert', description: 'Stroll Villa Cimbrone gardens overlooking the endless Mediterranean, followed by a private chamber concert.' },
      { day: 4, title: 'Artisanal Vineyard Walk & Truffle Pairing', description: 'Private tasting at a high-elevation terraced estate on Mount Vesuvius with bespoke wine pairing.' },
      { day: 5, title: 'Path of the Gods Helicopter & Cliffside Hike', description: 'Panoramic aerial tour followed by a gentle downhill scenic trek with a local master botanist.' },
      { day: 6, title: 'Sunset Gala Dinner at Sea', description: 'Sunset cruise onboard our luxury vessel with a live jazz duo and fresh Mediterranean catch.' },
      { day: 7, title: 'Sorrento Farewell & Departure', description: 'Private chauffeur transfer to Naples International with souvenir gift basket.' }
    ],
    included: [
      '6 nights in 5-star cliffside suites',
      'All private yacht and helicopter transfers',
      'Gourmet breakfasts, 4 chef dinners & wine pairings',
      '24/7 dedicated private concierge & luggage butler'
    ],
    nextDeparture: 'Next departure: June 14, 2026'
  },
  {
    id: 'kyoto-zen-hokkaido',
    title: 'Sanctuary of Japan: Kyoto & Alpine Hokkaido',
    subtitle: 'Private Ryokan Retreats, Tea Masters & Snow Peak Onsens',
    destination: 'Kyoto, Hakone & Niseko',
    country: 'Japan',
    region: 'Asia',
    category: 'Cultural',
    durationDays: 10,
    groupSize: 'Max 6 guests',
    rating: 4.99,
    reviewCount: 248,
    priceUSD: 5800,
    originalPriceUSD: 6600,
    badge: 'Curator Choice',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=1200&q=80'
    ],
    highlights: [
      'Exclusive after-hours private access to Kyoto UNESCO temples',
      'Traditional 16th-generation tea ceremony with a Grand Master',
      'Private cedarwood hot spring onsen with views of Mt. Yotei',
      'Multi-course Kaiseki dinners prepared by 3-star Michelin chefs'
    ],
    itinerary: [
      { day: 1, title: 'Arrival in Kyoto & Gion Lantern Walk', description: 'Private transfer to a heritage Machiya villa. Evening lantern-lit walk through Gion with a cultural historian.' },
      { day: 2, title: 'Bamboo Groves & Hidden Zen Gardens', description: 'Early morning private opening of Tenryu-ji temple and meditation session with head monk.' },
      { day: 3, title: 'Culinary Masterclass & Sake Cellars', description: 'Hands-on sushi and Wagyu masterclass in Fushimi followed by rare sake barrel tasting.' },
      { day: 4, title: 'Bullet Train First Class to Hakone', description: 'Shinkansen Gran Class transit; check-in at luxury ryokan with open-air volcanic onsen.' },
      { day: 5, title: 'Mount Fuji Vista & Artisan Pottery', description: 'Private yacht cruise across Lake Ashi with pristine vistas of Mt. Fuji.' },
      { day: 6, title: 'Flight to Hokkaido & Cedar Forest Sanctuary', description: 'Flight to Sapporo, transfer to Niseko luxury lodge nestled inside pristine pine forests.' },
      { day: 7, title: 'Forest Bathing & Thermal Springs', description: 'Shinrin-yoku wellness trail led by forest therapy guide and volcanic mineral baths.' },
      { day: 8, title: 'Sea of Okhotsk Seafood Feast', description: 'Fresh king crab and uni prepared directly at the morning coastal harbor.' },
      { day: 9, title: 'Farewell Gala in Tokyo', description: 'Bullet train to Tokyo Ginza; penthouse farewell reception overlooking skyline.' },
      { day: 10, title: 'VIP Airport Departure', description: 'Complimentary expedited security and departure.' }
    ],
    included: [
      '9 nights in ultra-luxury Ryokan & 5-star heritage suites',
      'All Shinkansen bullet train Gran Class tickets',
      'Daily curated breakfasts and signature Kaiseki dining',
      'English-speaking master guide and private chauffeur'
    ],
    nextDeparture: 'Next departure: July 8, 2026'
  },
  {
    id: 'serengeti-great-migration',
    title: 'The Great Serengeti Migration & Ngorongoro Crater',
    subtitle: 'Helicopter Safaris, Canvas Luxury Camps & Big Five Encounters',
    destination: 'Serengeti & Ngorongoro',
    country: 'Tanzania',
    region: 'Africa',
    category: 'Wildlife',
    durationDays: 8,
    groupSize: 'Max 6 guests',
    rating: 4.97,
    reviewCount: 189,
    priceUSD: 6900,
    originalPriceUSD: 7800,
    badge: 'Rare Experience',
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80'
    ],
    highlights: [
      'Hot air balloon flight at dawn over 1.5 million migrating wildebeest',
      'Private open-top custom Land Cruisers with top zoologist guides',
      'Stargazing luxury glamping with open canvas suites under the African sky',
      'Exclusive descent into the prehistoric Ngorongoro volcanic crater'
    ],
    itinerary: [
      { day: 1, title: 'Kilimanjaro to Arusha Coffee Estate', description: 'Arrival and unwind at a historic colonial coffee plantation with private verandas.' },
      { day: 2, title: 'Bush Flight to North Serengeti', description: 'Scenic low-altitude flight landing directly inside the heart of the savannah.' },
      { day: 3, title: 'Sunrise Hot Air Balloon & Champagne Bush Breakfast', description: 'Float over herds of elephants and lions followed by a white-tablecloth feast in the wild.' },
      { day: 4, title: 'Mara River Crossing Tracking', description: 'Witness the iconic river crossing spectacle with our veteran predator tracking guide.' },
      { day: 5, title: 'Fly to Ngorongoro Crater Rim', description: 'Arrive at the spectacular Crater Lodge perched 2,300m above the ancient caldera.' },
      { day: 6, title: 'Prehistoric Caldera Safari', description: 'Full day safari tracking black rhinos, pride of lions, and flamingos in Lake Magadi.' },
      { day: 7, title: 'Maasai Cultural Exchange & Boma Feast', description: 'Authentic cultural encounter and storytelling around an acacia bonfire.' },
      { day: 8, title: 'Scenic Flight to Kilimanjaro', description: 'Farewell bush flight and international departure lounge access.' }
    ],
    included: [
      'All internal chartered flights between reserves',
      '7 nights in premier eco-luxury safari camps & lodges',
      'All national park conservation & concession fees included',
      'Unlimited game drives with drinks and gourmet bush meals'
    ],
    nextDeparture: 'Next departure: August 3, 2026'
  },
  {
    id: 'swiss-alps-glacier-express',
    title: 'Majestic Swiss Alps & Glacier Luxury Express',
    subtitle: 'Zermatt, Matterhorn Views, Private Chalets & Fondue Flights',
    destination: 'Zermatt, St. Moritz & Grindelwald',
    country: 'Switzerland',
    region: 'Europe',
    category: 'Mountain',
    durationDays: 8,
    groupSize: 'Max 8 guests',
    rating: 4.96,
    reviewCount: 284,
    priceUSD: 4950,
    originalPriceUSD: 5700,
    badge: 'Popular',
    image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1491557345352-5929e343eb89?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80'
    ],
    highlights: [
      'Excellence Class Glacier Express panoramic train through snowy passes',
      'Helicopter flight around the sheer north face of the Matterhorn',
      'Ski or snowshoe with former Olympic certified Alpine instructors',
      'Private cheese cave cellar dinner with grand cru Swiss wines'
    ],
    itinerary: [
      { day: 1, title: 'Zurich to St. Moritz Luxury Transfer', description: 'Scenic drive to the cradle of alpine winter glamor and five-star spa resort.' },
      { day: 2, title: 'Engadin Lake Walk & St. Moritz Bobsleigh Run', description: 'Private horse-drawn sleigh ride and historical bobsleigh museum.' },
      { day: 3, title: 'The World-Famous Glacier Express', description: 'Panoramic glass coach journey through the Rhine Gorge and 291 bridges.' },
      { day: 4, title: 'Zermatt Village & Matterhorn Glacier Paradise', description: 'Ascend Europe’s highest cable car station to 3,883m with 360° Alpine views.' },
      { day: 5, title: 'Alpine Heli-Tour & Glacier Landing', description: 'Touching down on a remote glacier for fondue and chilled vintage champagne.' },
      { day: 6, title: 'Interlaken & Lauterbrunnen Valley of 72 Waterfalls', description: 'Journey to the breathtaking Lauterbrunnen valley and Grindelwald First.' },
      { day: 7, title: 'Private Spa Day & Michelin Gala', description: 'Thermal mineral infinity pool gazing over the Eiger North Wall.' },
      { day: 8, title: 'Departure from Zurich', description: 'First-class Swiss rail transfer back to Zurich airport.' }
    ],
    included: [
      '7 nights in 5-star Relais & Châteaux alpine retreats',
      'Glacier Express Excellence Class seat reservations',
      'Matterhorn private helicopter flight & glacier landing',
      'All gourmet dining, wine pairings, and mountain passes'
    ],
    nextDeparture: 'Next departure: June 22, 2026'
  },
  {
    id: 'patagonia-fjord-expedition',
    title: 'Wild Patagonia: Torres del Paine & Glaciers',
    subtitle: 'Puma Tracking, Fjords Navigation & Luxury Geodesic Domes',
    destination: 'Torres del Paine & El Calafate',
    country: 'Chile & Argentina',
    region: 'Americas',
    category: 'Mountain',
    durationDays: 9,
    groupSize: 'Max 10 guests',
    rating: 4.95,
    reviewCount: 167,
    priceUSD: 5200,
    originalPriceUSD: 5900,
    badge: 'Adventure High',
    image: 'https://images.unsplash.com/photo-1527004013197-933c4bb611b3?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1527004013197-933c4bb611b3?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80'
    ],
    highlights: [
      'Eco-luxury dome suite with wood burning stove facing the granite towers',
      'Ice trekking on the massive Perito Moreno Glacier with crampons',
      'Private catamaran cruise past icebergs in Grey Glacier lake',
      'Asado barbecue under the southern stars paired with Malbec reserves'
    ],
    itinerary: [
      { day: 1, title: 'Punta Arenas Arrival & Patagonian Steppe', description: 'Check-in at coastal lodge with Magellanic penguin sanctuary exploration.' },
      { day: 2, title: 'Journey to Torres del Paine National Park', description: 'Vistas of Lake Pehoe and turquoise water bodies flanked by Andean peaks.' },
      { day: 3, title: 'Base of the Towers Trek or Horseback Trail', description: 'Guided hike to the dramatic amphitheater of granite spires.' },
      { day: 4, title: 'French Valley & Hanging Glaciers', description: 'Hear the thunder of ice avalanches echoing off Mount Paine Grande.' },
      { day: 5, title: 'Puma Conservation Tracking Expedition', description: 'Early morning tracking with seasoned Chilean park wildlife biologists.' },
      { day: 6, title: 'Crossing to Argentina & El Calafate', description: 'Cross the Andes into Santa Cruz province, Argentina.' },
      { day: 7, title: 'Perito Moreno Glacier Ice Walk', description: 'Strap on crampons for a trek across deep sapphire crevasses and ice caves.' },
      { day: 8, title: 'Traditional Gaucho Estancia Experience', description: 'Learn horseback herding from authentic Patagonian gauchos.' },
      { day: 9, title: 'Departure from El Calafate', description: 'Flight connections to Buenos Aires.' }
    ],
    included: [
      '8 nights in premium luxury eco-domes and estancias',
      'All guided excursions with certified wilderness leaders',
      'All gourmet meals, Patagonian wine pairings, and park admissions',
      'Internal transfers and specialized glacier gear'
    ],
    nextDeparture: 'Next departure: November 12, 2026'
  },
  {
    id: 'bali-komodo-island-escape',
    title: 'Bali Sanctuary & Komodo Dragon Private Cruise',
    subtitle: 'Ubud Jungle Villas, Pink Beach & Private Phinisi Schooner',
    destination: 'Ubud, Uluwatu & Komodo National Park',
    country: 'Indonesia',
    region: 'Asia',
    category: 'Beach',
    durationDays: 9,
    groupSize: 'Max 8 guests',
    rating: 4.97,
    reviewCount: 356,
    priceUSD: 3600,
    originalPriceUSD: 4300,
    badge: 'Trending Now',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80'
    ],
    highlights: [
      '3-night voyage aboard an authentic handcrafted luxury Phinisi yacht',
      'Swim with gentle giant Manta Rays at Manta Point',
      'Private sunrise yoga pavilion overlooking sacred Ayung River valley',
      'Vip clifftop sunset cocktail hour at Uluwatu Temple'
    ],
    itinerary: [
      { day: 1, title: 'Arrival in Bali & Ubud Jungle Sanctuary', description: 'Check-in to a five-star pool villa nestled over lush rice terraces.' },
      { day: 2, title: 'Sacred Water Purification & Tirta Empul', description: 'Private blessing ritual with a Balinese high priest at ancient spring water temple.' },
      { day: 3, title: 'Tegalalang Terraces & Sound Bath Meditation', description: 'Morning walk in UNESCO rice terraces followed by healing Tibetan sound bath.' },
      { day: 4, title: 'Flight to Labuan Bajo & Board Luxury Phinisi', description: 'Welcome on deck with coconuts, set sail into Komodo archipelago.' },
      { day: 5, title: 'Komodo Dragon Trekking on Rinca Island', description: 'Encounter the ancient prehistoric dragons in their natural habitat.' },
      { day: 6, title: 'Pink Sand Beach & Coral Reef Snorkel', description: 'Crystal-clear turquoise waters and pristine pink coral sands.' },
      { day: 7, title: 'Padar Island Panoramic Sunrise', description: 'Ascend to the famous three-bay viewpoint overlooking tri-colored beaches.' },
      { day: 8, title: 'Return to Bali & Uluwatu Clifftop Retreat', description: 'Relax at ultra-luxurious clifftop infinity pool with Indian Ocean vistas.' },
      { day: 9, title: 'Balinese Spa Treatment & Departure', description: 'Three-hour traditional herbal floral bath before airport send-off.' }
    ],
    included: [
      '5 nights luxury pool villas + 3 nights private yacht charter',
      'Private chefs on board and all dining experiences',
      'Snorkeling gear, paddle boards, and Komodo park permits',
      'VIP airport concierge and chauffeured vehicles'
    ],
    nextDeparture: 'Next departure: July 20, 2026'
  },
  {
    id: 'iceland-northern-lights',
    title: 'Iceland Arctic Lights & Blue Glacier Caves',
    subtitle: 'Superjeep Expeditions, Geothermal Lagoons & Aurora Glass Lodges',
    destination: 'Reykjavik, Vik & Vatnajökull',
    country: 'Iceland',
    region: 'Polar',
    category: 'Trending',
    durationDays: 6,
    groupSize: 'Max 8 guests',
    rating: 4.94,
    reviewCount: 220,
    priceUSD: 3950,
    originalPriceUSD: 4600,
    badge: 'Limited Season',
    image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=1200&q=80'
    ],
    highlights: [
      'Sleep under dancing Auroras in private glass-roof panoramic pods',
      'Explore deep electric-blue crystal ice caves inside Europe’s largest glacier',
      'VIP access to the Retreat Spa at the world-famous Blue Lagoon',
      'Custom superjeep traversing black volcanic desert sands'
    ],
    itinerary: [
      { day: 1, title: 'Arrival & The Blue Lagoon Retreat Spa', description: 'Unwind in private geothermal lagoons and subterranean mineral chambers.' },
      { day: 2, title: 'Golden Circle & Geysir Eruptions', description: 'Thingvellir fissure, Gullfoss golden waterfall, and exploding Strokkur geyser.' },
      { day: 3, title: 'South Coast Waterfalls & Black Sand Beach', description: 'Walk behind Seljalandsfoss and explore the basalt sea stacks of Reynisfjara.' },
      { day: 4, title: 'Vatnajökull Crystal Ice Cave Superjeep', description: 'Hike into natural blue cathedral caves beneath 8,000-year-old glacier ice.' },
      { day: 5, title: 'Diamond Beach & Aurora Stargazing', description: 'Glistening iceberg fragments on volcanic shore followed by midnight Aurora hunt.' },
      { day: 6, title: 'Reykjavik Gastronomy & Departure', description: 'Nordic tasting lunch in Reykjavik Old Harbor before transfer.' }
    ],
    included: [
      '5 nights in glass aurora lodges and boutique hotels',
      'Modified 4x4 superjeep with dedicated driver guide',
      'Blue Lagoon Retreat lounge and luxury bath rituals',
      'Glacier equipment, helmet, and crampons'
    ],
    nextDeparture: 'Next departure: September 15, 2026'
  },
  {
    id: 'moroccan-sahara-imperial',
    title: 'Imperial Morocco & The Sahara Starlight Camp',
    subtitle: 'Marrakech Riads, High Atlas Mountains & Golden Dunes Glamping',
    destination: 'Marrakech, Atlas Mountains & Erg Chebbi',
    country: 'Morocco',
    region: 'Africa',
    category: 'Cultural',
    durationDays: 8,
    groupSize: 'Max 8 guests',
    rating: 4.96,
    reviewCount: 195,
    priceUSD: 3400,
    originalPriceUSD: 4100,
    badge: 'Sensory Magic',
    image: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80'
    ],
    highlights: [
      'Royal Mansour inspired private riad in the heart of Marrakech Medina',
      'Camel trek into towering 150m orange dunes of Erg Chebbi',
      'Berber music and astronomy session around desert firepit',
      'Private tour of Yves Saint Laurent’s Majorelle Villa and gardens'
    ],
    itinerary: [
      { day: 1, title: 'Marrakech Welcome & Private Hammam', description: 'Eucalyptus steam scrub and mint tea in a tranquil historic sanctuary.' },
      { day: 2, title: 'Medina Secret Souks & Secret Palaces', description: 'Discover hidden artisan copper, leather, and spice workshops with cultural guide.' },
      { day: 3, title: 'Across the High Atlas Tizi n’Tichka Pass', description: 'Dramatic mountain pass reaching ancient mudbrick fortress Ait Benhaddou.' },
      { day: 4, title: 'Dades Valley of Roses to Sahara Gates', description: 'Gorges of Todra and changing landscapes arriving at the golden dunes.' },
      { day: 5, title: 'Erg Chebbi Sunset & Royal Desert Camp', description: 'Camel caravan across glowing ridges to a five-star glamping oasis with private baths.' },
      { day: 6, title: 'Fossil Quarries & Oasis Palm Groves', description: 'Quad biking adventure on the crests and mint tea with nomad families.' },
      { day: 7, title: 'Return Flight to Marrakech & Farewell Feast', description: 'Rooftop dining under fairy lights overlooking the bustling Jemaa el-Fnaa.' },
      { day: 8, title: 'Farewell Morocco', description: 'Private transfer to Marrakech Menara Airport.' }
    ],
    included: [
      '7 nights in palatial riads & royal luxury desert camp',
      'Private Mercedes 4WD with English-speaking chauffeur',
      'All medina entrance fees, camel treks, and camel handlers',
      'Daily breakfasts, traditional Tagine dinners, and mint tea service'
    ],
    nextDeparture: 'Next departure: October 5, 2026'
  }
];

export const TESTIMONIALS = [
  {
    id: 1,
    name: 'Elena Rostova',
    location: 'Geneva, Switzerland',
    trip: 'Amalfi Coast Superyacht Odyssey',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    quote: 'Wanderlux orchestrated our 10th anniversary in Positano with surgical precision. From the private helicopter arrival to having Capri’s Blue Grotto completely to ourselves, every single detail felt like pure magic.',
    verified: true
  },
  {
    id: 2,
    name: 'Marcus & David Chen',
    location: 'San Francisco, CA',
    trip: 'Serengeti Great Migration & Crater',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    quote: 'Watching over a million wildebeest cross the Mara River at sunrise while sipping hot pour-over coffee from our private guide was the single most transcendent travel moment of our lives. Worth every penny.',
    verified: true
  },
  {
    id: 3,
    name: 'Sophia Lindqvist',
    location: 'Stockholm, Sweden',
    trip: 'Sanctuary of Japan: Kyoto & Hokkaido',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    quote: 'The level of cultural access was astonishing. Meeting the 16th-generation tea master in Kyoto was something you cannot just book online. Their 24/7 concierge took care of every restaurant reservation flawlessly.',
    verified: true
  }
];

export const TRUST_STATS = [
  { value: '48,000+', label: 'Happy Explorers' },
  { value: '94', label: 'Countries Covered' },
  { value: '4.98 / 5', label: 'Average Trust Rating' },
  { value: '100%', label: 'Carbon-Offset Flights' },
  { value: '24/7', label: 'Dedicated Concierge' }
];
