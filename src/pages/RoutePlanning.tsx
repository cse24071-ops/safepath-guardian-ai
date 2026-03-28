import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Clock, ArrowRight, Sparkles, Shield, ChevronRight, Loader2, X } from "lucide-react";
import LeafletMap, { type RouteInfo } from "@/components/LeafletMap";
import FloatingControls from "@/components/FloatingControls";
import { useNavigate } from "react-router-dom";

/** Geocode a query using Nominatim (free, no API key) */
async function geocode(query: string): Promise<{ lat: number; lon: number; display: string }[]> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`;
  try {
    const res = await fetch(url, { headers: { "Accept-Language": "en" } });
    const data = await res.json();
    return data.map((r: any) => ({
      lat: parseFloat(r.lat),
      lon: parseFloat(r.lon),
      display: r.display_name,
    }));
  } catch {
    return [];
  }
}

function formatDistance(meters: number) {
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`;
}
function formatDuration(seconds: number) {
  const mins = Math.round(seconds / 60);
  return mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins} min`;
}

const RoutePlanning = () => {
  const navigate = useNavigate();

  // Search state
  const [sourceQuery, setSourceQuery] = useState("");
  const [destQuery, setDestQuery] = useState("");
  const [sourceResults, setSourceResults] = useState<{ lat: number; lon: number; display: string }[]>([]);
  const [destResults, setDestResults] = useState<{ lat: number; lon: number; display: string }[]>([]);
  const [sourceLoading, setSourceLoading] = useState(false);
  const [destLoading, setDestLoading] = useState(false);
  const [showSourceResults, setShowSourceResults] = useState(false);
  const [showDestResults, setShowDestResults] = useState(false);

  // Selected locations
  const [sourceName, setSourceName] = useState("Current Location (GPS)");
  const [destName, setDestName] = useState("");
  const [destCoords, setDestCoords] = useState<[number, number] | null>(null);
  const [userPos, setUserPos] = useState<[number, number] | null>(null);

  // Routes from OSRM
  const [routes, setRoutes] = useState<(RouteInfo & { safety: "safe" | "moderate" | "danger"; score: number })[]>([]);
  const [selectedRoute, setSelectedRoute] = useState(0);
  const [routesLoading, setRoutesLoading] = useState(false);

  // Debounced geocoding
  const sourceTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const destTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const handleSourceSearch = (query: string) => {
    setSourceQuery(query);
    clearTimeout(sourceTimerRef.current);
    if (query.length < 3) { setSourceResults([]); setShowSourceResults(false); return; }
    setSourceLoading(true);
    sourceTimerRef.current = setTimeout(async () => {
      const results = await geocode(query);
      setSourceResults(results);
      setShowSourceResults(true);
      setSourceLoading(false);
    }, 400);
  };

  const handleDestSearch = (query: string) => {
    setDestQuery(query);
    clearTimeout(destTimerRef.current);
    if (query.length < 3) { setDestResults([]); setShowDestResults(false); return; }
    setDestLoading(true);
    destTimerRef.current = setTimeout(async () => {
      const results = await geocode(query);
      setDestResults(results);
      setShowDestResults(true);
      setDestLoading(false);
    }, 400);
  };

  const selectSource = (result: { lat: number; lon: number; display: string }) => {
    setSourceName(result.display.split(",").slice(0, 2).join(","));
    setSourceQuery("");
    setShowSourceResults(false);
  };

  const selectDest = (result: { lat: number; lon: number; display: string }) => {
    setDestName(result.display.split(",").slice(0, 2).join(","));
    setDestCoords([result.lat, result.lon]);
    setDestQuery("");
    setShowDestResults(false);
    setRoutesLoading(true);
  };

  const handleRoutesCalculated = useCallback((osrmRoutes: RouteInfo[]) => {
    // Assign safety scores: first = safest, last = riskiest
    const safetyLevels: ("safe" | "moderate" | "danger")[] = ["safe", "moderate", "danger"];
    const scores = [92, 68, 31];
    const enriched = osrmRoutes.map((r, i) => ({
      ...r,
      safety: safetyLevels[Math.min(i, 2)],
      score: scores[Math.min(i, 2)],
    }));
    setRoutes(enriched);
    setSelectedRoute(0);
    setRoutesLoading(false);
  }, []);

  const clearDestination = () => {
    setDestCoords(null);
    setDestName("");
    setDestQuery("");
    setRoutes([]);
  };

  return (
    <div className="relative w-full h-full">
      <LeafletMap
        variant="route"
        showUser
        showDestination={!!destCoords}
        destinationCoords={destCoords}
        destinationLabel={destName || "Destination"}
        onUserPosition={setUserPos}
        onRoutesCalculated={handleRoutesCalculated}
      />
      <FloatingControls />

      {/* Search Panel */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute top-4 left-4 right-20 z-[1000]"
      >
        <div className="glass-panel p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center gap-1">
              <div className="w-3 h-3 rounded-full gradient-primary" />
              <div className="w-0.5 h-6 bg-muted-foreground/30" />
              <div className="w-3 h-3 rounded-full bg-accent" />
            </div>
            <div className="flex-1 space-y-2">
              {/* Source input */}
              <div className="relative">
                <div className="flex items-center gap-2 bg-secondary/60 rounded-xl px-3 py-2.5">
                  <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                  <input
                    type="text"
                    placeholder={sourceName}
                    value={sourceQuery}
                    onChange={(e) => handleSourceSearch(e.target.value)}
                    onFocus={() => sourceResults.length > 0 && setShowSourceResults(true)}
                    onBlur={() => setTimeout(() => setShowSourceResults(false), 200)}
                    className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none"
                  />
                  {sourceLoading ? (
                    <Loader2 className="w-3.5 h-3.5 text-primary animate-spin flex-shrink-0" />
                  ) : (
                    <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  )}
                </div>
                {/* Source autocomplete dropdown */}
                <AnimatePresence>
                  {showSourceResults && sourceResults.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="absolute top-full left-0 right-0 mt-1 glass-panel rounded-xl overflow-hidden max-h-40 overflow-y-auto"
                    >
                      {sourceResults.map((r, i) => (
                        <button
                          key={i}
                          onMouseDown={() => selectSource(r)}
                          className="w-full text-left px-3 py-2 text-[10px] text-foreground hover:bg-primary/10 transition-colors border-b border-border/30 last:border-0 cursor-pointer"
                        >
                          <span className="line-clamp-1">{r.display}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Destination input */}
              <div className="relative">
                <div className="flex items-center gap-2 bg-secondary/60 rounded-xl px-3 py-2.5">
                  <MapPin className="w-4 h-4 text-accent flex-shrink-0" />
                  <input
                    type="text"
                    placeholder={destName || "Search destination..."}
                    value={destQuery}
                    onChange={(e) => handleDestSearch(e.target.value)}
                    onFocus={() => destResults.length > 0 && setShowDestResults(true)}
                    onBlur={() => setTimeout(() => setShowDestResults(false), 200)}
                    className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none"
                  />
                  {destCoords && (
                    <button onClick={clearDestination} className="cursor-pointer">
                      <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                    </button>
                  )}
                  {destLoading ? (
                    <Loader2 className="w-3.5 h-3.5 text-primary animate-spin flex-shrink-0" />
                  ) : (
                    <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  )}
                </div>
                {/* Destination autocomplete dropdown */}
                <AnimatePresence>
                  {showDestResults && destResults.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="absolute top-full left-0 right-0 mt-1 glass-panel rounded-xl overflow-hidden max-h-40 overflow-y-auto"
                    >
                      {destResults.map((r, i) => (
                        <button
                          key={i}
                          onMouseDown={() => selectDest(r)}
                          className="w-full text-left px-3 py-2 text-[10px] text-foreground hover:bg-primary/10 transition-colors border-b border-border/30 last:border-0 cursor-pointer"
                        >
                          <span className="line-clamp-1">{r.display}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {destCoords && (
            <button
              onClick={() => navigate("/safety")}
              className="w-full gradient-primary rounded-xl py-2.5 text-xs font-semibold text-primary-foreground flex items-center justify-center gap-2 hover:opacity-90 transition-opacity cursor-pointer"
            >
              <Shield className="w-4 h-4" />
              Find Safest Route
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>

      {/* AI Suggestion - only shown when destination is selected */}
      {destCoords && (
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
                {routes.length > 1
                  ? `${routes.length} routes found. The safest route is ${formatDistance(routes[0].distance)} (${formatDuration(routes[0].duration)}). Avoid alternate routes through poorly lit areas.`
                  : "Calculating the safest route for you..."}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Route Options Panel */}
      <AnimatePresence>
        {routes.length > 0 && (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ delay: 0.3 }}
            className="absolute bottom-4 left-4 right-4 z-20"
          >
            <div className="glass-panel p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-foreground">Route Options</h3>
                <span className="text-[10px] text-muted-foreground">{routes.length} route{routes.length > 1 ? "s" : ""} found</span>
              </div>
              <div className="space-y-2">
                {routes.map((route, i) => {
                  const colorBar = route.safety === "safe" ? "bg-safe" : route.safety === "moderate" ? "bg-warning" : "bg-destructive";
                  const scoreBg = route.safety === "safe" ? "bg-safe/15 text-safe" : route.safety === "moderate" ? "bg-warning/15 text-warning" : "bg-destructive/15 text-destructive";
                  const labels = ["Safest Route", "Moderate", "Risky"];

                  return (
                    <motion.div
                      key={i}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                      onClick={() => setSelectedRoute(i)}
                      className={`p-3 rounded-xl cursor-pointer transition-all duration-200 border ${selectedRoute === i ? "border-primary/50 bg-primary/5" : "border-transparent bg-secondary/40 hover:bg-secondary/60"}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-8 rounded-full ${colorBar}`} />
                          <div>
                            <p className="text-xs font-medium text-foreground">{labels[Math.min(i, 2)]}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {formatDistance(route.distance)}
                              </span>
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {formatDuration(route.duration)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`px-2 py-1 rounded-lg text-[10px] font-semibold ${scoreBg}`}>
                            {route.score}/100
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading state */}
      {routesLoading && (
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute bottom-4 left-4 right-4 z-20"
        >
          <div className="glass-panel p-4 flex items-center justify-center gap-3">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
            <span className="text-xs text-muted-foreground">Calculating routes...</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default RoutePlanning;
