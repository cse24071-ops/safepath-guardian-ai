import { motion } from "framer-motion";

interface Marker {
  x: string;
  y: string;
  icon: string;
  label: string;
  type: "hospital" | "police" | "safe" | "user" | "destination";
}

const defaultMarkers: Marker[] = [
  { x: "20%", y: "28%", icon: "🏥", label: "City Hospital", type: "hospital" },
  { x: "70%", y: "42%", icon: "🚓", label: "Police Station", type: "police" },
  { x: "35%", y: "60%", icon: "🏛️", label: "Metro Station", type: "safe" },
  { x: "58%", y: "22%", icon: "🏥", label: "Women's Clinic", type: "hospital" },
  { x: "85%", y: "68%", icon: "🚓", label: "Traffic Police", type: "police" },
  { x: "48%", y: "72%", icon: "🏛️", label: "Community Center", type: "safe" },
];

const MapMarkers = ({ markers = defaultMarkers, showUser = false, showDestination = false }: {
  markers?: Marker[];
  showUser?: boolean;
  showDestination?: boolean;
}) => {
  return (
    <>
      {markers.map((marker, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 + i * 0.1, type: "spring" }}
          className="absolute group"
          style={{ left: marker.x, top: marker.y, transform: "translate(-50%, -50%)" }}
        >
          <div className="relative">
            <div className="w-9 h-9 rounded-full glass-panel-sm flex items-center justify-center text-base cursor-pointer hover:scale-110 transition-transform">
              {marker.icon}
            </div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-card/90 backdrop-blur-sm px-2 py-0.5 rounded text-[9px] text-foreground">
              {marker.label}
            </div>
          </div>
        </motion.div>
      ))}

      {showUser && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute"
          style={{ left: "15%", top: "75%", transform: "translate(-50%, -50%)" }}
        >
          <div className="relative">
            <div className="w-5 h-5 rounded-full gradient-primary shadow-lg shadow-primary/50" />
            <div className="absolute inset-0 w-5 h-5 rounded-full bg-primary/30 animate-pulse-ring" />
            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] text-primary font-semibold whitespace-nowrap">You</span>
          </div>
        </motion.div>
      )}

      {showDestination && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute"
          style={{ left: "78%", top: "20%", transform: "translate(-50%, -50%)" }}
        >
          <div className="w-8 h-8 rounded-full bg-accent/80 flex items-center justify-center shadow-lg shadow-accent/30 text-sm">
            📍
          </div>
          <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] text-accent font-semibold whitespace-nowrap">Destination</span>
        </motion.div>
      )}
    </>
  );
};

export default MapMarkers;
