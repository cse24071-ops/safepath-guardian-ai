import { useEffect, useRef, useState, memo, useCallback } from "react";
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

export interface RouteInfo {
  distance: number; // meters
  duration: number; // seconds
  geometry: [number, number][]; // lat,lng pairs
}

interface LeafletMapProps {
  variant?: "default" | "route" | "navigation" | "guardian";
  showUser?: boolean;
  showDestination?: boolean;
  showPOIs?: boolean;
  destinationCoords?: [number, number] | null;
  destinationLabel?: string;
  sosPosition?: [number, number] | null;
  onMapReady?: (map: L.Map) => void;
  onUserPosition?: (pos: [number, number]) => void;
  onRoutesCalculated?: (routes: RouteInfo[]) => void;
}

/** Fetch up to 3 alternative routes from OSRM */
async function fetchOSRMRoutes(
  from: [number, number],
  to: [number, number]
): Promise<RouteInfo[]> {
  const url = `https://router.project-osrm.org/route/v1/foot/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson&alternatives=true`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.code !== "Ok" || !data.routes?.length) return [];
    return data.routes.map((r: any) => ({
      distance: r.distance,
      duration: r.duration,
      geometry: r.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]] as [number, number]),
    }));
  } catch {
    return [];
  }
}

const LeafletMap = memo(({
  variant = "default",
  showUser = false,
  showDestination = false,
  showPOIs = true,
  destinationCoords = null,
  destinationLabel = "Destination",
  sosPosition = null,
  onMapReady,
  onUserPosition,
  onRoutesCalculated,
}: LeafletMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const destMarkerRef = useRef<L.Marker | null>(null);
  const routeLayersRef = useRef<L.Layer[]>([]);
  const watchIdRef = useRef<number | null>(null);
  const [userPos, setUserPos] = useState<[number, number] | null>(null);

  // Stable callback wrapper
  const onUserPositionRef = useRef(onUserPosition);
  onUserPositionRef.current = onUserPosition;
  const onRoutesCalculatedRef = useRef(onRoutesCalculated);
  onRoutesCalculatedRef.current = onRoutesCalculated;

  // Initialize the map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      center: DEFAULT_CENTER,
      zoom: 15,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: "bottomleft" }).addTo(map);

    mapInstance.current = map;
    onMapReady?.(map);

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setUserPos(coords);
          onUserPositionRef.current?.(coords);
          map.setView(coords, 15);
        },
        () => {},
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
        onUserPositionRef.current?.(coords);
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

  // User marker
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

  // Destination marker + OSRM routing
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    // Clean previous destination marker
    if (destMarkerRef.current) {
      map.removeLayer(destMarkerRef.current);
      destMarkerRef.current = null;
    }

    // Clean previous route layers
    routeLayersRef.current.forEach((l) => map.removeLayer(l));
    routeLayersRef.current = [];

    const destCoords = destinationCoords;

    // If no explicit destination but showDestination is true, use offset
    const effectiveDest: [number, number] | null = destCoords
      ? destCoords
      : showDestination
      ? [(userPos || DEFAULT_CENTER)[0] + 0.012, (userPos || DEFAULT_CENTER)[1] + 0.015]
      : null;

    if (!effectiveDest) return;

    // Place destination marker
    destMarkerRef.current = L.marker(effectiveDest, { icon: createDestinationIcon() })
      .addTo(map)
      .bindPopup(`🏁 ${destinationLabel}`);

    // Fit bounds to show both user and destination
    const origin = userPos || DEFAULT_CENTER;
    const bounds = L.latLngBounds([origin, effectiveDest]);
    map.fitBounds(bounds, { padding: [80, 80] });

    // Fetch real routes from OSRM
    if (variant === "route" || variant === "navigation") {
      fetchOSRMRoutes(origin, effectiveDest).then((routes) => {
        if (!mapInstance.current) return;

        const colors = ["hsl(145,65%,48%)", "hsl(42,90%,55%)", "hsl(0,72%,56%)"];
        const weights = [6, 4, 4];
        const opacities = [0.9, 0.6, 0.5];

        routes.forEach((route, i) => {
          const line = L.polyline(route.geometry, {
            color: colors[i] || colors[2],
            weight: weights[i] || 3,
            opacity: opacities[i] || 0.4,
            dashArray: i === 0 ? undefined : "8 5",
          }).addTo(mapInstance.current!);
          routeLayersRef.current.push(line);
        });

        onRoutesCalculatedRef.current?.(routes);
      });
    }
  }, [destinationCoords, showDestination, variant, userPos, destinationLabel]);

  // POI markers
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

  // Guardian mode circle
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
