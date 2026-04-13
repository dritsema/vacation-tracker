const CITIES = {
  // US cities & landmarks
  'new york': '🗽', 'nyc': '🗽', 'manhattan': '🗽', 'brooklyn': '🗽',
  'los angeles': '🎬', 'hollywood': '🎬', 'beverly hills': '🎬',
  'san francisco': '🌉', 'sf': '🌉',
  'las vegas': '🎰', 'vegas': '🎰',
  'chicago': '🌆',
  'miami': '🌴', 'south beach': '🌴',
  'new orleans': '🎷',
  'nashville': '🎸',
  'austin': '🤠',
  'seattle': '☕',
  'portland': '🌲',
  'denver': '🏔️',
  'phoenix': '🌵', 'scottsdale': '🌵', 'tempe': '🌵', 'mesa': '🌵',
  'sedona': '🏜️',
  'grand canyon': '🏜️',
  'yellowstone': '🦌',
  'yosemite': '🏔️',
  'boston': '🦞',
  'washington dc': '🏛️',
  'philadelphia': '🔔',
  'san diego': '🌊',
  'santa barbara': '🌸',
  'napa': '🍷', 'sonoma': '🍷',
  'key west': '🌅',
  'orlando': '🎡',
  'honolulu': '🌺', 'maui': '🌺', 'oahu': '🌺', 'kauai': '🌺', 'big island': '🌋',
  'anchorage': '🐻',
  'glacier': '🧊',
  'aspen': '🎿', 'vail': '🎿', 'breckenridge': '🎿', 'park city': '🎿', 'jackson hole': '🎿',
  'savannah': '🌿',
  'charleston': '🌸',

  // Canada
  'toronto': '🍁', 'montreal': '🍁', 'vancouver': '🌲',
  'banff': '🏔️', 'jasper': '🏔️', 'whistler': '🎿',
  'quebec': '🏰',

  // Mexico & Caribbean
  'mexico city': '🌮',
  'cancun': '🏖️', 'tulum': '🏖️', 'playa del carmen': '🏖️',
  'cabo': '🌵', 'los cabos': '🌵',
  'havana': '🎺',
  'san juan': '🌴',
  'punta cana': '🏖️', 'nassau': '🏝️', 'montego bay': '🌴',

  // Europe
  'paris': '🗼', 'versailles': '🏰',
  'london': '🎡',
  'rome': '🏛️', 'venice': '🚣', 'florence': '🎨', 'milan': '👗',
  'amalfi': '🌊', 'positano': '🌊', 'cinque terre': '🌊',
  'sicily': '🍋', 'naples': '🍕',
  'barcelona': '🎨', 'madrid': '💃', 'seville': '💃', 'ibiza': '🎉',
  'amsterdam': '🌷',
  'berlin': '🐻', 'munich': '🍺',
  'prague': '🏰',
  'vienna': '🎼',
  'budapest': '🏰',
  'athens': '🏛️', 'santorini': '🌅', 'mykonos': '🏖️',
  'lisbon': '🎸', 'porto': '🍷',
  'edinburgh': '🏰', 'dublin': '🍀',
  'stockholm': '👑', 'copenhagen': '🧜', 'oslo': '🎿',
  'reykjavik': '🌋',
  'zurich': '🏔️', 'interlaken': '🏔️',
  'bruges': '🏰', 'monaco': '🎲',
  'nice': '🌊', 'cannes': '🎬',
  'dubrovnik': '🌊', 'split': '🌊',
  'istanbul': '🕌', 'cappadocia': '🎈',

  // Asia
  'tokyo': '⛩️', 'kyoto': '⛩️', 'osaka': '🍜',
  'seoul': '🎎',
  'beijing': '🐉', 'shanghai': '🌆', 'hong kong': '🌆',
  'taipei': '🧋',
  'bangkok': '🛕', 'chiang mai': '🌿', 'phuket': '🏖️', 'krabi': '🏖️',
  'singapore': '🦁',
  'bali': '🌴', 'ubud': '🌴',
  'kathmandu': '🏔️',
  'mumbai': '🎬', 'delhi': '🕌', 'jaipur': '🏰', 'agra': '🕌', 'goa': '🏖️',
  'dubai': '🏙️', 'abu dhabi': '🕌',
  'jerusalem': '✡️', 'tel aviv': '🌊',
  'hoi an': '🏮', 'hanoi': '🌿', 'ho chi minh': '🛵',

  // Africa
  'cairo': '🐪',
  'marrakech': '🕌', 'fez': '🕌',
  'cape town': '🦁',
  'nairobi': '🦒', 'serengeti': '🦁', 'zanzibar': '🏝️',

  // Oceania & Pacific
  'sydney': '🦘', 'melbourne': '☕', 'cairns': '🐠', 'gold coast': '🏖️',
  'uluru': '🪨',
  'auckland': '🥝', 'queenstown': '🎿',
  'fiji': '🏝️', 'tahiti': '🌺', 'bora bora': '🏝️',

  // South America
  'rio de janeiro': '🌊', 'rio': '🌊',
  'buenos aires': '🥩',
  'machu picchu': '🏔️', 'cusco': '🏔️',
  'cartagena': '🌊',
  'galapagos': '🦎',
  'patagonia': '🏔️',
};

const STATES = {
  al: '🍑', ak: '🐻', az: '🌵', ar: '🌲', ca: '🌞',
  co: '🏔️', ct: '🍂', fl: '🌴', ga: '🍑', hi: '🌺',
  id: '🥔', il: '🌆', ks: '🌾', ky: '🐎', la: '🎷',
  me: '🦞', md: '🦀', ma: '🦞', mi: '🌊', mn: '🌲',
  ms: '🎸', mt: '🏔️', ne: '🌽', nv: '🎰', nh: '🍂',
  nj: '🏖️', nm: '🌵', ny: '🗽', nc: '🏔️', nd: '🌾',
  oh: '🏛️', ok: '🤠', or: '🌲', pa: '🔔', ri: '🏖️',
  sc: '🌴', sd: '🦅', tn: '🎸', tx: '🤠', ut: '🪨',
  vt: '🍂', va: '🏛️', wa: '☕', wv: '🌲', wi: '🧀',
  wy: '🦌', dc: '🏛️',
};

const COUNTRIES = {
  'france': '🗼', 'italy': '🍕', 'spain': '💃', 'greece': '🏛️',
  'japan': '⛩️', 'china': '🐉', 'south korea': '🎎',
  'uk': '🎡', 'england': '🎡', 'scotland': '🏴', 'ireland': '🍀',
  'germany': '🍺', 'austria': '🎼', 'switzerland': '🏔️',
  'netherlands': '🌷', 'belgium': '🍺', 'portugal': '🎸',
  'sweden': '👑', 'norway': '🎿', 'denmark': '🧜', 'iceland': '🌋',
  'czech republic': '🏰', 'czechia': '🏰', 'hungary': '🏰', 'croatia': '🌊',
  'turkey': '🕌', 'morocco': '🕌', 'egypt': '🐪',
  'south africa': '🦁', 'kenya': '🦒', 'tanzania': '🦒',
  'australia': '🦘', 'new zealand': '🥝',
  'thailand': '🛕', 'vietnam': '🌿', 'cambodia': '🛕',
  'indonesia': '🌴', 'malaysia': '🌴', 'india': '🛕', 'nepal': '🏔️',
  'maldives': '🏝️', 'sri lanka': '🌿',
  'uae': '🏙️', 'israel': '✡️', 'jordan': '🏜️',
  'peru': '🦙', 'colombia': '☕', 'brazil': '🌊',
  'argentina': '🥩', 'chile': '🏔️',
  'mexico': '🌮', 'canada': '🍁', 'cuba': '🎺',
  'jamaica': '🌴', 'bahamas': '🏝️', 'costa rica': '🌿',
};

const KEYWORDS = [
  ['national park', '🏕️'], ['hot spring', '♨️'],
  ['glacier', '🧊'], ['volcano', '🌋'], ['canyon', '🏜️'], ['desert', '🏜️'],
  ['mountain', '🏔️'], ['ski', '🎿'], ['island', '🏝️'], ['beach', '🏖️'],
  ['lake', '🏞️'], ['river', '🚣'], ['forest', '🌲'], ['jungle', '🌿'],
  ['coast', '🌊'], ['falls', '🌊'], ['vineyard', '🍷'], ['winery', '🍷'],
  ['safari', '🦁'], ['resort', '🏨'], ['cruise', '🚢'],
  ['cabin', '🏕️'], ['camp', '🏕️'], ['ranch', '🤠'], ['farm', '🌾'],
];

export function getDestinationEmoji(name) {
  const lower = name.toLowerCase().trim();
  const parts = lower.split(/[\s,]+/);

  // 1. Known city / landmark
  for (const [city, emoji] of Object.entries(CITIES)) {
    if (lower.includes(city)) return emoji;
  }

  // 2. US state abbreviation (exact token match to avoid false positives)
  for (const part of parts) {
    if (STATES[part]) return STATES[part];
  }

  // 3. Country or state full name
  for (const [place, emoji] of Object.entries(COUNTRIES)) {
    if (lower.includes(place)) return emoji;
  }

  // 4. Geographic / activity keyword
  for (const [keyword, emoji] of KEYWORDS) {
    if (lower.includes(keyword)) return emoji;
  }

  return '📍';
}
