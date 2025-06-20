export default function SuperBeeLogo() {
  return (
    <div className="flex items-center gap-2 group">
      <div className="relative">
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10 transition-all duration-300 group-hover:scale-110"
        >
          {/* Glow effect background */}
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient
              id="beeGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#00f5ff" />
              <stop offset="50%" stopColor="#bf00ff" />
              <stop offset="100%" stopColor="#ff1493" />
            </linearGradient>
          </defs>

          {/* Bee body with gradient */}
          <ellipse
            cx="20"
            cy="25"
            rx="8"
            ry="12"
            fill="url(#beeGradient)"
            filter="url(#glow)"
          />

          {/* Wings */}
          <ellipse
            cx="15"
            cy="18"
            rx="6"
            ry="4"
            fill="rgba(255,255,255,0.8)"
            opacity="0.9"
          />
          <ellipse
            cx="25"
            cy="18"
            rx="6"
            ry="4"
            fill="rgba(255,255,255,0.8)"
            opacity="0.9"
          />

          {/* Stripes */}
          <rect
            x="14"
            y="20"
            width="12"
            height="2"
            fill="#000"
            opacity="0.3"
            rx="1"
          />
          <rect
            x="14"
            y="24"
            width="12"
            height="2"
            fill="#000"
            opacity="0.3"
            rx="1"
          />
          <rect
            x="14"
            y="28"
            width="12"
            height="2"
            fill="#000"
            opacity="0.3"
            rx="1"
          />

          {/* Eyes */}
          <circle cx="17" cy="15" r="2" fill="#fff" />
          <circle cx="23" cy="15" r="2" fill="#fff" />
          <circle cx="17" cy="15" r="1" fill="#000" />
          <circle cx="23" cy="15" r="1" fill="#000" />
        </svg>

        {/* Animated glow ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-30 transition-opacity duration-300 animate-pulse blur-md"></div>
      </div>

      <div className="flex flex-col">
        <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent font-gaming">
          SuperBee
        </span>
        <span className="text-xs text-gray-400 font-medium tracking-wider">
          GAMING STORE
        </span>
      </div>
    </div>
  );
}
