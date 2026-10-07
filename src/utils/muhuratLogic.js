// src/utils/muhuratLogic.js

export const EVENT_RULES = {
  marriage: {
    good_vaara: ['Monday', 'Wednesday', 'Thursday', 'Friday'],
    good_nakshatra: ['Rohini', 'Mrigashira', 'Magha', 'Uttara Phalguni', 'Hasta', 'Swati', 'Anuradha', 'Mula', 'Uttara Ashadha', 'Uttara Bhadrapada', 'Revati'],
    good_tithi: ['2', '3', '5', '7', '10', '11', '13'] // Representing dwitiya, tritiya, etc.
  },
  griha_pravesh: {
    good_vaara: ['Monday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    good_nakshatra: ['Rohini', 'Mrigashira', 'Pushya', 'Chitra', 'Anuradha', 'Revati', 'Uttara Phalguni', 'Uttara Ashadha', 'Uttara Bhadrapada'],
    good_tithi: ['2', '3', '5', '7', '10', '11', '13']
  },
  vehicle: {
    good_vaara: ['Sunday', 'Monday', 'Wednesday', 'Thursday', 'Friday'],
    good_nakshatra: ['Ashwini', 'Punarvasu', 'Pushya', 'Hasta', 'Chitra', 'Swati', 'Shravana', 'Dhanishta', 'Shatabhisha'],
    good_tithi: ['3', '4', '5', '7', '10', '11', '13', '15']
  },
  property: {
    good_vaara: ['Thursday', 'Friday'],
    good_nakshatra: ['Rohini', 'Mrigashira', 'Punarvasu', 'Pushya', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Anuradha', 'Uttara Ashadha', 'Shravana', 'Uttara Bhadrapada', 'Revati'],
    good_tithi: ['5', '6', '10', '11', '15']
  },
  namakaran: {
    good_vaara: ['Monday', 'Wednesday', 'Thursday', 'Friday'],
    good_nakshatra: ['Ashwini', 'Rohini', 'Mrigashira', 'Pushya', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Anuradha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Uttara Bhadrapada', 'Revati'],
    good_tithi: ['1', '2', '3', '5', '7', '10', '11', '13']
  }
};

const CHOGHADIYA_SEQUENCE = {
  'Sunday':    ['Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg'],
  'Monday':    ['Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Char', 'Labh', 'Amrit'],
  'Tuesday':   ['Rog', 'Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog'],
  'Wednesday': ['Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Char', 'Labh'],
  'Thursday':  ['Shubh', 'Rog', 'Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh'],
  'Friday':    ['Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Char'],
  'Saturday':  ['Kaal', 'Shubh', 'Rog', 'Udveg', 'Char', 'Labh', 'Amrit', 'Kaal']
};

export const CHOGHADIYA_TYPES = {
  Amrit: 'Good',
  Shubh: 'Good',
  Labh: 'Good',
  Char: 'Neutral',
  Udveg: 'Bad',
  Kaal: 'Bad',
  Rog: 'Bad'
};

function formatTime(dateObj) {
  return dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export function calculateChoghadiya(dateStr, sunriseStr, sunsetStr, vaara) {
  if (!sunriseStr || !sunsetStr || !vaara) return [];
  
  // Format: "YYYY-MM-DDTHH:mm:ss"
  const sunriseTime = new Date(`${dateStr}T${sunriseStr}`);
  const sunsetTime = new Date(`${dateStr}T${sunsetStr}`);
  
  // Calculate total daylight in milliseconds
  const daylightMs = sunsetTime - sunriseTime;
  
  // Each Choghadiya block duration
  const blockMs = daylightMs / 8;
  
  const sequence = CHOGHADIYA_SEQUENCE[vaara] || CHOGHADIYA_SEQUENCE['Sunday'];
  
  const choghadiyas = [];
  let currentStart = sunriseTime.getTime();
  
  for (let i = 0; i < 8; i++) {
    const currentEnd = currentStart + blockMs;
    const name = sequence[i];
    
    choghadiyas.push({
      name: name,
      type: CHOGHADIYA_TYPES[name],
      startTime: formatTime(new Date(currentStart)),
      endTime: formatTime(new Date(currentEnd))
    });
    
    currentStart = currentEnd;
  }
  
  return choghadiyas;
}

// Map english tithi text like "Shukla Tritiya" to a number "3"
function extractTithiNumber(tithiEn) {
  if (!tithiEn) return null;
  const map = {
    'pratipada': '1', 'dwitiya': '2', 'tritiya': '3', 'chaturthi': '4', 
    'panchami': '5', 'shashthi': '6', 'saptami': '7', 'ashtami': '8', 
    'navami': '9', 'dashami': '10', 'ekadashi': '11', 'dwadashi': '12', 
    'trayodashi': '13', 'chaturdashi': '14', 'purnima': '15', 'amavasya': '30'
  };
  const parts = tithiEn.toLowerCase().split(' ');
  const tithiName = parts[parts.length - 1]; // last word is usually the tithi
  return map[tithiName] || null;
}

export function evaluateDay(dayData, eventType) {
  const rules = EVENT_RULES[eventType];
  if (!rules) return { isAuspicious: true, reasons: [] }; // Fallback

  const reasons = [];
  let isAuspicious = true;

  // Vaara check
  const vaara = dayData.vaara_en;
  if (rules.good_vaara.includes(vaara)) {
    reasons.push({ text: `Day is ${vaara}`, good: true });
  } else {
    reasons.push({ text: `Avoid ${vaara} for this event`, good: false });
    isAuspicious = false;
  }

  // Nakshatra check (partial match to avoid case issues)
  const nakshatra = dayData.nakshatra_en?.split(' ')[0] || '';
  if (rules.good_nakshatra.some(n => nakshatra.includes(n))) {
    reasons.push({ text: `Auspicious Nakshatra (${nakshatra})`, good: true });
  } else {
    reasons.push({ text: `Nakshatra ${nakshatra} is not ideal`, good: false });
    isAuspicious = false;
  }

  // Tithi check
  const tithiNum = extractTithiNumber(dayData.tithi_en);
  if (tithiNum && rules.good_tithi.includes(tithiNum)) {
    reasons.push({ text: `Favorable Tithi (${dayData.tithi_en})`, good: true });
  } else {
    reasons.push({ text: `Unfavorable Tithi (${dayData.tithi_en})`, good: false });
    isAuspicious = false;
  }

  return { isAuspicious, reasons };
}
