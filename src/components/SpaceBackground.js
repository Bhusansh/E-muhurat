'use client';

import { useState, useEffect } from 'react';

export default function SpaceBackground() {
  const [stars, setStars] = useState([]);

  useEffect(() => {
    setStars(
      Array.from({ length: 80 }, (_, i) => ({
        id: i,
        size: Math.random() * 2.5 + 0.5,
        top: Math.random() * 100,
        left: Math.random() * 100,
        delay: Math.random() * 5,
        duration: Math.random() * 4 + 3,
      }))
    );
  }, []);

  const celestials = [
    // Large ringed planet (Saturn-like)
    {
      type: 'saturn', top: 12, left: 8,
      size: 70, color: '#c8a96e',
      duration: 40, delay: 0,
    },
    // Small blue planet
    {
      type: 'planet', top: 65, left: 85,
      size: 40, color: '#4a6fa5',
      duration: 55, delay: 5,
    },
    // Tiny reddish planet
    {
      type: 'planet', top: 30, left: 78,
      size: 20, color: '#8b4a3a',
      duration: 35, delay: 10,
    },
    // Moon (crescent)
    {
      type: 'moon', top: 75, left: 15,
      size: 45, duration: 50, delay: 3,
    },
    // Small pale planet
    {
      type: 'planet', top: 50, left: 50,
      size: 15, color: '#5a4a6a',
      duration: 30, delay: 8,
    },
  ];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: -1,
      overflow: 'hidden',
      pointerEvents: 'none',
    }}>
      {/* Stars */}
      {stars.map(star => (
        <div
          key={star.id}
          style={{
            position: 'absolute',
            top: `${star.top}%`,
            left: `${star.left}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            borderRadius: '50%',
            background: 'white',
            opacity: 0.6,
            animation: `twinkle ${star.duration}s ${star.delay}s ease-in-out infinite alternate`,
          }}
        />
      ))}

      {/* Celestial bodies */}
      {celestials.map((c, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: `${c.top}%`,
            left: `${c.left}%`,
            animation: `floatCelestial ${c.duration}s ${c.delay}s ease-in-out infinite alternate`,
            opacity: 0.18,
          }}
        >
          {c.type === 'saturn' && (
            <svg width={c.size * 2.4} height={c.size * 1.5} viewBox="0 0 120 75">
              {/* Ring */}
              <ellipse cx="60" cy="50" rx="58" ry="12" fill="none" stroke={c.color} strokeWidth="5" opacity="0.7" />
              {/* Planet */}
              <circle cx="60" cy="37" r="30" fill={c.color} />
              {/* Ring front part */}
              <ellipse cx="60" cy="50" rx="58" ry="12" fill="none" stroke={c.color} strokeWidth="5" opacity="0.9"
                clipPath="url(#ringFront)" />
              <defs>
                <clipPath id="ringFront">
                  <rect x="0" y="50" width="120" height="30" />
                </clipPath>
              </defs>
            </svg>
          )}
          {c.type === 'planet' && (
            <svg width={c.size} height={c.size} viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="48" fill={c.color} />
              <ellipse cx="40" cy="35" rx="15" ry="8" fill="white" opacity="0.08" />
            </svg>
          )}
          {c.type === 'moon' && (
            <svg width={c.size} height={c.size} viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="48" fill="#d4c5a0" />
              <circle cx="68" cy="50" r="38" fill="#0d0d18" />
            </svg>
          )}
        </div>
      ))}

      <style>{`
        @keyframes twinkle {
          0% { opacity: 0.2; transform: scale(0.8); }
          100% { opacity: 0.9; transform: scale(1.2); }
        }
        @keyframes floatCelestial {
          0% { transform: translateY(0px) rotate(0deg); }
          100% { transform: translateY(-30px) rotate(5deg); }
        }
      `}</style>
    </div>
  );
}
