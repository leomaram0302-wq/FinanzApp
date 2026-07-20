import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => {
  return (
    <svg
      id="finanzapp-logo-svg"
      className={`${className}`}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Metal/Silver Gradients */}
        <linearGradient id="silverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F1F5F9" />
          <stop offset="50%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>
        <linearGradient id="metallicGrad" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="30%" stopColor="#CBD5E1" />
          <stop offset="70%" stopColor="#64748B" />
          <stop offset="100%" stopColor="#1E293B" />
        </linearGradient>
        
        {/* Gold Gradients */}
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>

        {/* Green Leaf Gradients */}
        <linearGradient id="greenLeafGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#065F46" />
          <stop offset="50%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#34D399" />
        </linearGradient>

        <filter id="subtle-shadow" x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Hexagonal Shield Plateado (Outer) */}
      <polygon
        points="50,6 90,26 90,74 50,94 10,74 10,26"
        fill="url(#metallicGrad)"
        stroke="url(#silverGrad)"
        strokeWidth="3.5"
        strokeLinejoin="round"
        filter="url(#subtle-shadow)"
      />
      
      {/* Internal Hexagon Base (Blue slate background inside shield) */}
      <polygon
        points="50,11 85,28 85,71 50,88 15,71 15,28"
        fill="#0F172A"
        stroke="url(#silverGrad)"
        strokeWidth="1.5"
        strokeLinejoin="round"
        opacity="0.9"
      />

      {/* 5 Golden/Silver Stars in the Upper Arc inside the shield */}
      <g fill="url(#goldGrad)" stroke="#B45309" strokeWidth="0.4">
        {/* Star 1 (Center): cx=50, cy=18 */}
        <polygon points="50,13 51.5,17 55,17 52,19 53,22.5 50,20.5 47,22.5 48,19 45,17 48.5,17" />
        {/* Star 2: cx=37, cy=21 */}
        <polygon points="37,16 38.5,20 42,20 39,22 40,25.5 37,23.5 34,25.5 35,22 32,20 35.5,20" />
        {/* Star 3: cx=63, cy=21 */}
        <polygon points="63,16 64.5,20 68,20 65,22 66,25.5 63,23.5 60,25.5 61,22 58,20 61.5,20" />
        {/* Star 4: cx=26, cy=27 */}
        <polygon points="26,22 27.5,26 31,26 28,28 29,31.5 26,29.5 23,31.5 24,28 21,26 24.5,26" />
        {/* Star 5: cx=74, cy=27 */}
        <polygon points="74,22 75.5,26 79,26 76,28 77,31.5 74,29.5 71,31.5 72,28 69,26 72.5,26" />
      </g>

      {/* Faceted Central Diamond (3D Gemstone) */}
      <g>
        {/* Outer diamond profile */}
        <polygon points="50,32 68,48 50,71 32,48" fill="#F8FAFC" stroke="url(#silverGrad)" strokeWidth="1" />
        {/* Facet Top-Center */}
        <polygon points="50,32 42,48 58,48" fill="#FFFFFF" opacity="0.8" />
        {/* Facet Top-Left */}
        <polygon points="50,32 32,48 42,48" fill="#E2E8F0" opacity="0.9" />
        {/* Facet Top-Right */}
        <polygon points="50,32 58,48 68,48" fill="#CBD5E1" opacity="0.9" />
        {/* Facet Bottom-Left */}
        <polygon points="32,48 50,71 50,48" fill="#94A3B8" opacity="0.75" />
        {/* Facet Bottom-Right */}
        <polygon points="68,48 50,71 50,48" fill="#64748B" opacity="0.75" />
        {/* Facet Bottom-Center */}
        <polygon points="42,48 50,71 58,48" fill="#F1F5F9" opacity="0.5" />
      </g>

      {/* Golden "S/." currency symbol inside the faceted diamond */}
      <text
        x="50"
        y="54"
        fontSize="13.5"
        fontWeight="900"
        fill="url(#goldGrad)"
        stroke="#78350F"
        strokeWidth="0.6"
        textAnchor="middle"
        fontFamily="system-ui, sans-serif"
        className="font-black select-none"
      >
        S/.
      </text>

      {/* Stylized Emerald Green Growing Leaves at the Base hugging the Shield */}
      {/* Left leaf embracing */}
      <path
        d="M50,88 C32,87 20,72 16,56 C14,48 18,44 21,43 C22,46 20,58 35,71 C42,77 48,84 50,88 Z"
        fill="url(#greenLeafGrad)"
        stroke="#047857"
        strokeWidth="1.2"
      />
      {/* Right leaf embracing */}
      <path
        d="M50,88 C68,87 80,72 84,56 C86,48 82,44 79,43 C78,46 80,58 65,71 C58,77 52,84 50,88 Z"
        fill="url(#greenLeafGrad)"
        stroke="#047857"
        strokeWidth="1.2"
      />
      {/* Center growing sprout */}
      <path
        d="M50,88 Q45,76 50,66 Q55,76 50,88 Z"
        fill="url(#greenLeafGrad)"
        stroke="#047857"
        strokeWidth="1"
      />
    </svg>
  );
};
