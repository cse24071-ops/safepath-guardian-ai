import { motion } from "framer-motion";
import { Shield, Sun, Users, FileWarning, Sparkles, MapPin, Clock, Navigation, ChevronUp, Phone, AlertTriangle } from "lucide-react";
import LeafletMap from "@/components/LeafletMap";
import FloatingControls from "@/components/FloatingControls";
import { useNavigate } from "react-router-dom";

const safetyMetrics = [
  { icon: Sun, label: "Lighting", value: "Good", score: 85, color: "text-safe" },
  { icon: Users, label: "Crowd Density", value: "Moderate", score: 62, color: "text-warning" },
  { icon: FileWarning, label: "Crime Reports", value: "Low", score: 88, color: "text-safe" },
];

const SafetyAnalysis = () => {
  const navigate = useNavigate();

  return (
    <div className="relative w-full h-full">
      <MapBackground variant="route" />
      <MapMarkers showUser showDestination />
      <FloatingControls showSOS />

      {/* Safety Score Card */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute top-4 left-4 z-20 w-[260px]"
      >
        <div className="glass-panel p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-semibold text-foreground">Safety Score</h3>
          </div>

          {/* Score circle */}
          <div className="flex items-center gap-4 mb-4">
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" fill="none" stroke="hsl(var(--secondary))" strokeWidth="5" />
                <circle cx="32" cy="32" r="28" fill="none" stroke="hsl(var(--safe))" strokeWidth="5" strokeLinecap="round"
                  strokeDasharray={`${87 * 1.76} 176`} />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-safe">87</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-safe">Safe Route</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Via MG Road & Park Avenue</p>
              <p className="text-[10px] text-muted-foreground">4.2 km • 12 min ETA</p>
            </div>
          </div>

          {/* Metrics */}
          <div className="space-y-2">
            {safetyMetrics.map((metric, i) => (
              <motion.div
                key={metric.label}
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center justify-between bg-secondary/40 rounded-lg px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <metric.icon className={`w-3.5 h-3.5 ${metric.color}`} />
                  <span className="text-[10px] text-muted-foreground">{metric.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${metric.score}%` }}
                      transition={{ delay: 0.5 + i * 0.1, duration: 0.6 }}
                      className={`h-full rounded-full ${metric.score >= 80 ? "bg-safe" : metric.score >= 50 ? "bg-warning" : "bg-destructive"}`}
                    />
                  </div>
                  <span className={`text-[10px] font-semibold ${metric.color}`}>{metric.value}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* AI Suggestion */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="absolute left-4 top-[330px] z-20 max-w-[260px]"
      >
        <div className="glass-panel-sm p-3 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            <span className="text-primary font-semibold">AI:</span> Route segment near Sector 12 has reduced lighting after 9 PM. Consider travelling before sunset or enable Guardian Mode.
          </p>
        </div>
      </motion.div>

      {/* Night Warning */}
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="absolute top-4 right-20 z-20"
      >
        <div className="glass-panel-sm p-2.5 flex items-center gap-2 border-warning/30">
          <Sun className="w-4 h-4 text-warning" />
          <span className="text-[10px] text-warning font-medium">Night Mode: Low lighting ahead</span>
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
          <div className="flex items-center justify-center mb-2">
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          </div>

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">4.2 km</p>
                <p className="text-[10px] text-muted-foreground">Distance</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">12 min</p>
                <p className="text-[10px] text-muted-foreground">ETA</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <div className="px-3 py-1 rounded-lg bg-safe/15">
                  <p className="text-sm font-bold text-safe">Safe</p>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">Status</p>
              </div>
            </div>
          </div>

          {/* Nearby safe places */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] text-muted-foreground">Nearby:</span>
            {["🏥 Hospital 200m", "🚓 Police 350m", "🏛️ Metro 180m"].map((place) => (
              <span key={place} className="text-[9px] bg-secondary/60 px-2 py-1 rounded-lg text-muted-foreground">{place}</span>
            ))}
          </div>

          {/* Live status */}
          <div className="flex items-center justify-between bg-safe/5 border border-safe/20 rounded-xl px-3 py-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-safe animate-pulse" />
              <span className="text-[10px] text-safe font-medium">Travelling safely</span>
            </div>
            <Navigation className="w-3.5 h-3.5 text-safe" />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => navigate("/navigate")}
              className="flex-1 gradient-primary rounded-xl py-2.5 text-xs font-semibold text-primary-foreground flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 transition-opacity"
            >
              <Navigation className="w-4 h-4" />
              Start Navigation
            </button>
            <button className="px-4 rounded-xl bg-secondary text-xs font-medium text-foreground flex items-center gap-2 cursor-pointer hover:bg-secondary/80 transition-colors">
              <Phone className="w-4 h-4" />
              Fake Call
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SafetyAnalysis;
