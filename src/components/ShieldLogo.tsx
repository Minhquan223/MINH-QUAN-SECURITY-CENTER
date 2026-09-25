import React from 'react';

interface ShieldLogoProps {
  className?: string;
  size?: number;
}

export const ShieldLogo: React.FC<ShieldLogoProps> = ({ className = 'h-8 w-8', size = 32 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="512" height="512" rx="112" fill="#0d1527" />
      {/* Outer shield border */}
      <path
        d="M256 76L390 148V282C390 370 256 436 256 436C256 436 122 370 122 282V148L256 76Z"
        stroke="#00a6e0"
        strokeWidth="32"
        strokeLinejoin="round"
        fill="#070e1d"
      />
      {/* Dashed inner circle radar */}
      <circle
        cx="256"
        cy="260"
        r="115"
        stroke="#00a6e0"
        strokeWidth="20"
        strokeLinecap="round"
        strokeDasharray="24 36"
      />
      {/* Inner checkmark */}
      <path
        d="M196 264L240 308L324 212"
        stroke="#7bd0ff"
        strokeWidth="34"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
