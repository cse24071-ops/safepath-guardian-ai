import { useEffect, useRef, useState, memo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icon issue in bundlers
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom icon creators
const createUserIcon = () =>
  L.divIcon({
    className: "",
    html: `<div style="width:20px;height:20px;border-radius:50%;background:linear-gradient(135deg,hsl(258,90%,66%),hsl(280,85%,60%));border:3px solid white;box-shadow:0 0 12px rgba(139,92,246,0.6);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

const createDestinationIcon = () =>
  L.divIcon({
    className: "",
    html: `<div style="font-size:28px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.4));">📍</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  });

const createSOSIcon = () =>
  L.divIcon({
    className: "",
    html: `<div style="width:24px;height:24px;border-radius:50%;background:hsl(0,72%,51%);border:3px solid white;box-shadow:0 0 16px rgba(239,68,68,0.7);display:flex;align-items:center;justify-content:center;"><span style="color:white;font-size:14px;font-weight:bold;">!</span></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

const createPOIIcon = (emoji: string) =>
  L.divIcon({
    className: "",
    html: `<div style="width:32px;height:32px;border-radius:50%;background:rgba(30,30,40,0.85);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 2px 8px rgba(0,0,0,0.3);">${emoji}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

// Default center (Bangalore) as fallback
const DEFAULT_CENTER: [number, number] = [12.9716, 77.5946];

interface LeafletMapProps {
  variant?: "default" | "route" | "navigation" | "guardian";
  showUser?: boolean;
  showDestination?: boolean;
  showPOIs?: boolean;
  sosPosition?: [number, number] | null;
  onMapReady?: (map: L.Map) => void;
}

const LeafletMap = memo(({
  variant = "default",
  showUser = false,
  showDestination = false,
  showPOIs = true,
  sosPosition = null,
  onMapReady,
}: LeafletMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const [userPos, setUserPos] = useState<[number, number] | null>(null);

  // Initialize the map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      center: DEFAULT_CENTER,
      zoom: 15,
      zoomControl: false,
      attributionControl: false,
    });

    // Dark-themed OpenStreetMap tiles
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
    }).addTo(map);

    // Add zoom control to bottom-left to avoid clashing with floating controls
    L.control.zoom({ position: "bottomleft" }).addTo(map);

    mapInstance.current = map;
    onMapReady?.(map);

    // Try to get user location and center on it
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setUserPos(coords);
          map.setView(coords, 16);
        },
        () => {
          // Fallback: stay on default center
        },
        { enableHighAccuracy: true }
      );
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // Watch user position in real-time
  useEffect(() => {
    if (!showUser || !navigator.geolocation) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserPos(coords);
      },
      () => {},
      { enableHighAccuracy: true }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [showUser]);

  // Update user marker when position changes
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !showUser) return;

    const pos = userPos || DEFAULT_CENTER;

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng(pos);
    } else {
      userMarkerRef.current = L.marker(pos, { icon: createUserIcon() })
        .addTo(map)
        .bindPopup("📍 You are here");
    }
  }, [userPos, showUser]);

  // Show destination marker (offset from user or default)
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !showDestination) return;

    const base = userPos || DEFAULT_CENTER;
    const destPos: [number, number] = [base[0] + 0.012, base[1] + 0.015];

    const marker = L.marker(destPos, { icon: createDestinationIcon() })
      .addTo(map)
      .bindPopup("🏁 Phoenix Mall, MG Road");

    return () => { map.removeLayer(marker); };
  }, [showDestination, userPos]);

  // Show POI markers (hospitals, police, safe places)
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !showPOIs) return;

    const base = userPos || DEFAULT_CENTER;
    const pois = [
      { offset: [0.004, -0.006], emoji: "🏥", label: "City Hospital" },
      { offset: [-0.003, 0.008], emoji: "🚓", label: "Police Station" },
      { offset: [0.007, 0.003], emoji: "🏛️", label: "Metro Station" },
      { offset: [-0.005, -0.004], emoji: "🏥", label: "Women's Clinic" },
      { offset: [0.009, 0.01], emoji: "🚓", label: "Traffic Police" },
      { offset: [-0.002, 0.012], emoji: "🏛️", label: "Community Center" },
    ];

    const markers = pois.map((poi) =>
      L.marker([base[0] + poi.offset[0], base[1] + poi.offset[1]], {
        icon: createPOIIcon(poi.emoji),
      })
        .addTo(map)
        .bindPopup(`${poi.emoji} ${poi.label}`)
    );

    return () => { markers.forEach((m) => map.removeLayer(m)); };
  }, [showPOIs, userPos]);

  // Draw route lines for route/navigation variants
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || (variant !== "route" && variant !== "navigation")) return;

    const base = userPos || DEFAULT_CENTER;

    // Safe route (green)
    const safeRoute: [number, number][] = [
      [base[0], base[1]],
      [base[0] + 0.003, base[1] + 0.004],
      [base[0] + 0.006, base[1] + 0.007],
      [base[0] + 0.009, base[1] + 0.011],
      [base[0] + 0.012, base[1] + 0.015],
    ];
    const moderateRoute: [number, number][] = [
      [base[0], base[1]],
      [base[0] + 0.002, base[1] + 0.005],
      [base[0] + 0.005, base[1] + 0.009],
      [base[0] + 0.01, base[1] + 0.013],
      [base[0] + 0.012, base[1] + 0.015],
    ];
    const riskyRoute: [number, number][] = [
      [base[0], base[1]],
      [base[0] + 0.004, base[1] + 0.002],
      [base[0] + 0.007, base[1] + 0.006],
      [base[0] + 0.01, base[1] + 0.01],
      [base[0] + 0.012, base[1] + 0.015],
    ];

    const lines = [
      L.polyline(safeRoute, { color: "hsl(145,65%,48%)", weight: 5, opacity: 0.85, dashArray: "10 5" }).addTo(map),
      L.polyline(moderateRoute, { color: "hsl(42,90%,55%)", weight: 4, opacity: 0.6, dashArray: "8 5" }).addTo(map),
      L.polyline(riskyRoute, { color: "hsl(0,72%,56%)", weight: 4, opacity: 0.5, dashArray: "8 5" }).addTo(map),
    ];

    // Danger zone circles
    const dangerZones = [
      L.circle([base[0] + 0.005, base[1] + 0.003], { radius: 150, color: "hsl(0,72%,56%)", fillColor: "hsl(0,72%,56%)", fillOpacity: 0.15, weight: 1 }).addTo(map),
      L.circle([base[0] + 0.008, base[1] + 0.008], { radius: 100, color: "hsl(0,72%,56%)", fillColor: "hsl(0,72%,56%)", fillOpacity: 0.1, weight: 1 }).addTo(map),
    ];

    return () => {
      lines.forEach((l) => map.removeLayer(l));
      dangerZones.forEach((z) => map.removeLayer(z));
    };
  }, [variant, userPos]);

  // Guardian mode: pulsing circle around user
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || variant !== "guardian") return;

    const pos = userPos || DEFAULT_CENTER;
    const circle = L.circle(pos, {
      radius: 200,
      color: "hsl(258,90%,66%)",
      fillColor: "hsl(258,90%,66%)",
      fillOpacity: 0.1,
      weight: 2,
      dashArray: "6 4",
    }).addTo(map);

    return () => { map.removeLayer(circle); };
  }, [variant, userPos]);

  // SOS marker
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !sosPosition) return;

    const marker = L.marker(sosPosition, { icon: createSOSIcon() })
      .addTo(map)
      .bindPopup("🚨 SOS Alert Triggered!")
      .openPopup();

    return () => { map.removeLayer(marker); };
  }, [sosPosition]);

  return (
    <div
      ref={mapRef}
      className="absolute inset-0 z-0"
      style={{ background: "hsl(220 14% 10%)" }}
    />
  );
});

LeafletMap.displayName = "LeafletMap";
export default LeafletMap;
