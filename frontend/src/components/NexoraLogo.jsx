import React, { useId } from 'react';

export default function NexoraLogo({ size = 34, showWordmark = true, subtitle = null }) {
  const uid = useId();
  const chevronGradId = `nexora-chevron-${uid}`;
  const playGradId = `nexora-play-${uid}`;

  return (
    <span className="nexora-brand" aria-label="Nexora">
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="nexora-brand__mark"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id={chevronGradId}
            x1="60"
            y1="10"
            x2="60"
            y2="110"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#146EF5" />
            <stop offset="52%" stopColor="#6246EA" />
            <stop offset="100%" stopColor="#B814FC" />
          </linearGradient>
          <linearGradient
            id={playGradId}
            x1="46"
            y1="34"
            x2="46"
            y2="86"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#58B9FF" />
            <stop offset="55%" stopColor="#919BFF" />
            <stop offset="100%" stopColor="#D9A7FF" />
          </linearGradient>
        </defs>
        <path
          d="M34 39.5C34 36.2 37.8 34.3 40.5 36.3L59.2 50.3C61.6 52.1 61.6 55.7 59.2 57.5L40.5 71.5C37.8 73.5 34 71.6 34 68.3V39.5Z"
          transform="translate(0, 6)"
          fill={`url(#${playGradId})`}
        />
        <path
          d="M34 14H45.5C47.7 14 49.8 14.9 51.3 16.5L88.2 55.2C90.9 58 90.9 62.4 88.2 65.2L51.3 103.5C49.8 105.1 47.7 106 45.5 106H34C30.4 106 28.5 101.7 31 99.1L68.1 60.2L31 20.9C28.5 18.3 30.4 14 34 14Z"
          stroke={`url(#${chevronGradId})`}
          strokeWidth="6.5"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      {showWordmark && (
        <span className="nexora-brand__text-group">
          <span className="nexora-brand__wordmark">NEXORA</span>
          {subtitle && <span className="nexora-brand__subtitle">{subtitle}</span>}
        </span>
      )}
    </span>
  );
}
