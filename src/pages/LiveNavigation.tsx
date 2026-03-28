import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation, MapPin, Clock, Shield, Sparkles, AlertTriangle, ArrowRight, RefreshCw, ChevronUp } from "lucide-react";
import LeafletMap from "@/components/LeafletMap";
import FloatingControls from "@/components/FloatingControls";

const checkpoints = [
  { name: "Start: Current Location", status: "passed", time: "0 min" },
  { name: "MG Road Junction", status: "passed", time: "3 min" },
  { name: "Park Avenue", status: "current", time: "6 min" },
  { name: "Lake View Bridge", status: "upcoming", time: "9 min" },
  { name: "Destination: Phoenix Mall", status: "upcoming", time: "12 min" },
];

const LiveNavigation = () => {
  const [distance, setDistance] = useState(2.8);
  const [eta, setEta] = useState(8);
  const [safetyScore, setSafetyScore] = useState(89);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowAlert(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setDistance((d) => Math.max(0.1, d - 0.05));
      setEta((e) => Math.max(1, e - 0.1));
      setSafetyScore((s) => {
        const change = Math.random() > 0.5 ? 1 : -1;
        return Math.min(100, Math.max(60, s + change));
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full">
      <MapBackground variant="navigation" />
      <MapMarkers showUser showDestination />
      <FloatingControls showSOS />

      {/* Animated Vehicle */}
      <motion.div
        animate={{ left: ["15%", "30%", "45%", "60%", "75%"], top: ["75%", "60%", "50%", "38%", "25%"] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute z-10"
        style={{ transform: "translate(-50%, -50%)" }}
      >
        <div className="relative">
          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center shadow-lg shadow-primary/40">
            <Navigation className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="absolute inset-0 w-8 h-8 rounded-full bg-primary/20 animate-pulse-ring" />
        </div>
      </motion.div>

      {/* Alert Banner */}
      <AnimatePresence>
        {showAlert && (
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            className="absolute top-4 left-4 right-20 z-20"
          >
            <div className="glass-panel-sm p-3 flex items-center gap-3 border-warning/30">
              <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />
              <div className="flex-1">
                <p className="text-[10px] font-semibold text-warning">Approaching Moderate Risk Zone</p>
                <p className="text-[10px] text-muted-foreground">Sector 12 area — reduced lighting reported</p>
              </div>
              <button
                onClick={() => setShowAlert(false)}
                className="text-[10px] text-primary font-semibold px-3 py-1.5 rounded-lg bg-primary/10 cursor-pointer hover:bg-primary/20 transition-colors flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Reroute
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Suggestion */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute left-4 top-20 z-20 max-w-[250px]"
      >
        <div className="glass-panel-sm p-3 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            <span className="text-primary font-semibold">SafeBot:</span> Stay on Park Avenue for best safety. Alternate route available if risk increases.
          </p>
        </div>
      </motion.div>

      {/* Checkpoints */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="absolute left-4 top-[180px] z-20 w-[220px]"
      >
        <div className="glass-panel-sm p-3">
          <p className="text-[10px] font-semibold text-foreground mb-2">Route Checkpoints</p>
          <div className="space-y-0">
            {checkpoints.map((cp, i) => (
              <div key={i} className="flex items-center gap-2 py-1.5">
                <div className="flex flex-col items-center">
                  <div className={`w-2.5 h-2.5 rounded-full ${cp.status === "passed" ? "bg-safe" : cp.status === "current" ? "gradient-primary animate-pulse" : "bg-muted-foreground/30"}`} />
                  {i < checkpoints.length - 1 && (
                    <div className={`w-0.5 h-4 ${cp.status === "passed" ? "bg-safe/50" : "bg-muted-foreground/20"}`} />
                  )}
                </div>
                <div className="flex-1 flex items-center justify-between">
                  <span className={`text-[9px] ${cp.status === "current" ? "text-primary font-semibold" : cp.status === "passed" ? "text-muted-foreground" : "text-muted-foreground/60"}`}>
                    {cp.name}
                  </span>
                  <span className="text-[8px] text-muted-foreground/50">{cp.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Bottom Panel */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="absolute bottom-4 left-4 right-4 z-20"
      >
        <div className="glass-panel p-4">
          <ChevronUp className="w-4 h-4 text-muted-foreground mx-auto mb-2" />

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-5">
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">{distance.toFixed(1)} km</p>
                <p className="text-[10px] text-muted-foreground">Remaining</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">{eta.toFixed(0)} min</p>
                <p className="text-[10px] text-muted-foreground">ETA</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <motion.p
                  key={safetyScore}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className={`text-lg font-bold ${safetyScore >= 80 ? "text-safe" : safetyScore >= 50 ? "text-warning" : "text-destructive"}`}
                >
                  {safetyScore}
                </motion.p>
                <p className="text-[10px] text-muted-foreground">Safety</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between bg-safe/5 border border-safe/20 rounded-xl px-3 py-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-safe animate-pulse" />
              <span className="text-[10px] text-safe font-medium">Live Navigation Active</span>
            </div>
            <div className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-primary" />
              <span className="text-[10px] text-primary font-medium">AI Monitoring</span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-secondary/40 rounded-xl px-3 py-2">
            <ArrowRight className="w-4 h-4 text-primary" />
            <span className="text-[10px] text-foreground">Continue on <span className="text-primary font-semibold">Park Avenue</span> for 800m</span>
            <span className="text-[9px] text-muted-foreground ml-auto">Turn right ahead</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LiveNavigation;
