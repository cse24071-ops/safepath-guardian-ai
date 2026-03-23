import { memo } from "react";

const MapBackground = memo(({ variant = "default" }: { variant?: "default" | "route" | "navigation" | "guardian" }) => {
  return (
    <div className="absolute inset-0 map-bg overflow-hidden">
      {/* Grid lines simulating map */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Road network simulation */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {/* Main roads */}
        <line x1="0" y1="35%" x2="100%" y2="35%" stroke="hsl(220 14% 22%)" strokeWidth="3" opacity="0.5" />
        <line x1="0" y1="65%" x2="100%" y2="65%" stroke="hsl(220 14% 22%)" strokeWidth="3" opacity="0.5" />
        <line x1="25%" y1="0" x2="25%" y2="100%" stroke="hsl(220 14% 22%)" strokeWidth="2" opacity="0.4" />
        <line x1="55%" y1="0" x2="55%" y2="100%" stroke="hsl(220 14% 22%)" strokeWidth="2" opacity="0.4" />
        <line x1="80%" y1="0" x2="80%" y2="100%" stroke="hsl(220 14% 22%)" strokeWidth="2" opacity="0.4" />

        {/* Diagonal roads */}
        <line x1="10%" y1="10%" x2="50%" y2="50%" stroke="hsl(220 14% 20%)" strokeWidth="2" opacity="0.3" />
        <line x1="60%" y1="20%" x2="90%" y2="80%" stroke="hsl(220 14% 20%)" strokeWidth="2" opacity="0.3" />

        {/* Secondary roads */}
        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="hsl(220 14% 18%)" strokeWidth="1.5" opacity="0.3" />
        <line x1="40%" y1="0" x2="40%" y2="100%" stroke="hsl(220 14% 18%)" strokeWidth="1.5" opacity="0.3" />
        <line x1="65%" y1="0" x2="65%" y2="100%" stroke="hsl(220 14% 18%)" strokeWidth="1.5" opacity="0.3" />
      </svg>

      {/* Building blocks */}
      {[
        { x: "8%", y: "15%", w: "12%", h: "15%" },
        { x: "30%", y: "8%", w: "8%", h: "22%" },
        { x: "60%", y: "40%", w: "14%", h: "10%" },
        { x: "42%", y: "55%", w: "10%", h: "18%" },
        { x: "75%", y: "10%", w: "10%", h: "14%" },
        { x: "12%", y: "70%", w: "11%", h: "12%" },
        { x: "82%", y: "55%", w: "10%", h: "20%" },
        { x: "28%", y: "40%", w: "9%", h: "12%" },
      ].map((block, i) => (
        <div
          key={i}
          className="absolute rounded-sm bg-secondary/30"
          style={{ left: block.x, top: block.y, width: block.w, height: block.h }}
        />
      ))}

      {/* Route lines for navigation variants */}
      {(variant === "route" || variant === "navigation") && (
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {/* Safe route - green */}
          <path
            d="M 15% 75% Q 25% 60% 35% 50% T 55% 35% T 78% 20%"
            fill="none"
            stroke="hsl(145 65% 48%)"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.8"
            strokeDasharray="8 4"
          />
          {/* Medium route - yellow */}
          <path
            d="M 15% 75% Q 20% 55% 30% 45% T 60% 30% T 78% 20%"
            fill="none"
            stroke="hsl(42 90% 55%)"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.5"
            strokeDasharray="6 4"
          />
          {/* Danger route - red */}
          <path
            d="M 15% 75% Q 35% 70% 45% 55% T 65% 35% T 78% 20%"
            fill="none"
            stroke="hsl(0 72% 56%)"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.4"
            strokeDasharray="6 4"
          />
        </svg>
      )}

      {/* Danger zone pulsing */}
      {(variant === "navigation" || variant === "route") && (
        <>
          <div className="absolute" style={{ left: "42%", top: "52%", transform: "translate(-50%, -50%)" }}>
            <div className="w-20 h-20 rounded-full bg-destructive/20 animate-pulse-ring" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-destructive/40" />
            </div>
          </div>
          <div className="absolute" style={{ left: "62%", top: "32%", transform: "translate(-50%, -50%)" }}>
            <div className="w-16 h-16 rounded-full bg-destructive/15 animate-pulse-ring" style={{ animationDelay: "0.5s" }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-destructive/30" />
            </div>
          </div>
        </>
      )}

      {/* Guardian mode - user location */}
      {variant === "guardian" && (
        <div className="absolute" style={{ left: "45%", top: "45%", transform: "translate(-50%, -50%)" }}>
          <div className="w-24 h-24 rounded-full bg-primary/20 animate-pulse-ring" />
          <div className="w-16 h-16 rounded-full bg-primary/15 animate-pulse-ring absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ animationDelay: "0.7s" }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-5 h-5 rounded-full gradient-primary shadow-lg shadow-primary/50" />
          </div>
        </div>
      )}
    </div>
  );
});

MapBackground.displayName = "MapBackground";
export default MapBackground;
