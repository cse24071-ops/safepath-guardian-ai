import { useState } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Clock, ArrowRight, Sparkles, Shield, ChevronRight } from "lucide-react";
import LeafletMap from "@/components/LeafletMap";
import FloatingControls from "@/components/FloatingControls";
import { useNavigate } from "react-router-dom";

const routes = [
  {
    id: 1,
    name: "Via MG Road & Park Avenue",
    distance: "4.2 km",
    eta: "12 min",
    safety: "safe" as const,
    score: 92,
    label: "Safest Route",
    color: "bg-safe",
  },
  {
    id: 2,
    name: "Via Station Road & Lake View",
    distance: "3.8 km",
    eta: "10 min",
    safety: "moderate" as const,
    score: 68,
    label: "Moderate",
    color: "bg-warning",
  },
  {
    id: 3,
    name: "Via Industrial Area Shortcut",
    distance: "2.9 km",
    eta: "8 min",
    safety: "danger" as const,
    score: 31,
    label: "Risky",
    color: "bg-destructive",
  },
];

const RoutePlanning = () => {
  const [source] = useState("Current Location");
  const [destination] = useState("Phoenix Mall, MG Road");
  const [selectedRoute, setSelectedRoute] = useState(1);
  const navigate = useNavigate();

  return (
    <div className="relative w-full h-full">
      <MapBackground variant="route" />
      <MapMarkers showUser showDestination />
      <FloatingControls />

      {/* Search Panel */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute top-4 left-4 right-20 z-20"
      >
        <div className="glass-panel p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center gap-1">
              <div className="w-3 h-3 rounded-full gradient-primary" />
              <div className="w-0.5 h-6 bg-muted-foreground/30" />
              <div className="w-3 h-3 rounded-full bg-accent" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 bg-secondary/60 rounded-xl px-3 py-2.5">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-xs text-foreground">{source}</span>
                <Search className="w-3.5 h-3.5 text-muted-foreground ml-auto flex-shrink-0" />
              </div>
              <div className="flex items-center gap-2 bg-secondary/60 rounded-xl px-3 py-2.5">
                <MapPin className="w-4 h-4 text-accent flex-shrink-0" />
                <span className="text-xs text-foreground">{destination}</span>
                <Search className="w-3.5 h-3.5 text-muted-foreground ml-auto flex-shrink-0" />
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate("/safety")}
            className="w-full gradient-primary rounded-xl py-2.5 text-xs font-semibold text-primary-foreground flex items-center justify-center gap-2 hover:opacity-90 transition-opacity cursor-pointer"
          >
            <Shield className="w-4 h-4" />
            Find Safest Route
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* AI Suggestion */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="absolute left-4 top-[220px] z-20 max-w-[280px]"
      >
        <div className="glass-panel-sm p-3 flex items-start gap-2">
          <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-primary">AI Suggestion</p>
            <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5">
              Take left via Park Avenue to avoid high-risk zone near Industrial Area. Well-lit path with CCTV coverage.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Route Options Panel */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="absolute bottom-4 left-4 right-4 z-20"
      >
        <div className="glass-panel p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-foreground">Route Options</h3>
            <span className="text-[10px] text-muted-foreground">3 routes found</span>
          </div>
          <div className="space-y-2">
            {routes.map((route, i) => (
              <motion.div
                key={route.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                onClick={() => setSelectedRoute(route.id)}
                className={`p-3 rounded-xl cursor-pointer transition-all duration-200 border ${selectedRoute === route.id ? "border-primary/50 bg-primary/5" : "border-transparent bg-secondary/40 hover:bg-secondary/60"}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-8 rounded-full ${route.color}`} />
                    <div>
                      <p className="text-xs font-medium text-foreground">{route.name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {route.distance}
                        </span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {route.eta}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`px-2 py-1 rounded-lg text-[10px] font-semibold ${route.safety === "safe" ? "bg-safe/15 text-safe" : route.safety === "moderate" ? "bg-warning/15 text-warning" : "bg-destructive/15 text-destructive"}`}>
                      {route.score}/100
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RoutePlanning;
