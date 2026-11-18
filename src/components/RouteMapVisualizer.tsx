import React, { useState, useEffect } from 'react';
import {
  Navigation,
  Clock,
  Shield,
  AlertCircle,
  RefreshCw,
  Zap,
  MapPin,
  Compass,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Crosshair,
  Radio,
  ExternalLink
} from 'lucide-react';
import { CARIBE_CITIES } from '../data/mockData';
import { useGeolocation, calculateHaversineDistance } from '../services/useGeolocation';

interface RouteMapVisualizerProps {
  originCity: string;
  originAddress?: string;
  destCity: string;
  destAddress?: string;
  distanceKm: number;
  durationMinutes: number;
  tollCount?: number;
  isLiveTracking?: boolean;
  trackingStepPercent?: number;
  carrierVehiclePlate?: string;
}

export const RouteMapVisualizer: React.FC<RouteMapVisualizerProps> = ({
  originCity,
  originAddress = 'Dirección de Origen',
  destCity,
  destAddress = 'Dirección de Destino',
  distanceKm,
  durationMinutes,
  tollCount = 2,
  isLiveTracking = false,
  trackingStepPercent = 45,
  carrierVehiclePlate = 'WLZ-832',
}) => {
  const [mapEngine, setMapEngine] = useState<'google' | 'radar'>('radar');
  const [selectedRouteType, setSelectedRouteType] = useState<'optima' | 'alternativa'>('optima');
  const [trafficStatus, setTrafficStatus] = useState<'fluido' | 'moderado' | 'concurrido'>('fluido');
  const [carProgress, setCarProgress] = useState(isLiveTracking ? trackingStepPercent : 45);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [activeTollInfo, setActiveTollInfo] = useState<string | null>(null);

  // Hook de Geolocalización en vivo
  const {
    hasPermission,
    isLocating,
    latitude,
    longitude,
    accuracy,
    error: geoError,
    requestLocation
  } = useGeolocation();

  // Animated vehicle progress for live tracking
  useEffect(() => {
    if (!isLiveTracking) {
      setCarProgress(trackingStepPercent || 50);
      return;
    }
    const interval = setInterval(() => {
      setCarProgress((prev) => (prev >= 98 ? 15 : prev + 1));
    }, 1200);
    return () => clearInterval(interval);
  }, [isLiveTracking, trackingStepPercent]);

  // City coordinates normalized for our SVG canvas (SVG dimensions: 800 x 480)
  const projectCoordinates = (lat: number, lng: number) => {
    const minLat = 8.5;
    const maxLat = 11.8;
    const minLng = -76.2;
    const maxLng = -72.5;

    const x = ((lng - minLng) / (maxLng - minLng)) * 740 + 30;
    const y = 460 - ((lat - minLat) / (maxLat - minLat)) * 420;
    return { x, y };
  };

  const originCityObj = CARIBE_CITIES.find(
    (c) => c.name.toLowerCase() === originCity.toLowerCase()
  ) || CARIBE_CITIES[0];

  const destCityObj = CARIBE_CITIES.find(
    (c) => c.name.toLowerCase() === destCity.toLowerCase()
  ) || CARIBE_CITIES[1];

  const p1 = projectCoordinates(originCityObj.lat, originCityObj.lng);
  const p2 = projectCoordinates(destCityObj.lat, destCityObj.lng);

  // Bezier curve control point for road curvature simulation (Vía al Mar / Troncal)
  const midX = (p1.x + p2.x) / 2;
  const midY = (p1.y + p2.y) / 2;
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const normalX = -dy * 0.15;
  const normalY = dx * 0.15;
  const ctrlX = midX + normalX;
  const ctrlY = midY + normalY;

  // Compute truck coordinates along quadratic bezier curve
  const t = carProgress / 100;
  const truckX = Math.round((1 - t) * (1 - t) * p1.x + 2 * (1 - t) * t * ctrlX + t * t * p2.x);
  const truckY = Math.round((1 - t) * (1 - t) * p1.y + 2 * (1 - t) * t * ctrlY + t * t * p2.y);

  // Simulated Peajes (Toll booths) along Caribbean corridor
  const tollBooths = [
    {
      name: 'Peaje Puerto Colombia',
      cost: '$16.800 COP',
      tRatio: 0.35,
      x: Math.round((1 - 0.35) * (1 - 0.35) * p1.x + 2 * (1 - 0.35) * 0.35 * ctrlX + 0.35 * 0.35 * p2.x),
      y: Math.round((1 - 0.35) * (1 - 0.35) * p1.y + 2 * (1 - 0.35) * 0.35 * ctrlY + 0.35 * 0.35 * p2.y),
    },
    {
      name: 'Peaje Marahuaco',
      cost: '$17.500 COP',
      tRatio: 0.72,
      x: Math.round((1 - 0.72) * (1 - 0.72) * p1.x + 2 * (1 - 0.72) * 0.72 * ctrlX + 0.72 * 0.72 * p2.x),
      y: Math.round((1 - 0.72) * (1 - 0.72) * p1.y + 2 * (1 - 0.72) * 0.72 * ctrlY + 0.72 * 0.72 * p2.y),
    }
  ];

  // User GPS point projected if available
  const userPt = (latitude && longitude) ? projectCoordinates(latitude, longitude) : null;
  const distanceToTruck = (latitude && longitude)
    ? calculateHaversineDistance(latitude, longitude, originCityObj.lat + (destCityObj.lat - originCityObj.lat) * t, originCityObj.lng + (destCityObj.lng - originCityObj.lng) * t)
    : null;

  // Traffic badge styling
  const trafficDetails = {
    fluido: { label: 'Tráfico fluido (Velocidad: 72 km/h)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    moderado: { label: 'Tráfico moderado (+15 min)', color: 'text-amber-700 bg-amber-50 border-amber-200' },
    concurrido: { label: 'Retraso por peaje (+25 min)', color: 'text-red-700 bg-red-50 border-red-200' },
  }[trafficStatus];

  // Google Maps Directions Embed Query URL
  const googleMapsUrl = `https://maps.google.com/maps?saddr=${encodeURIComponent(
    `${originAddress}, ${originCity}, Colombia`
  )}&daddr=${encodeURIComponent(
    `${destAddress}, ${destCity}, Colombia`
  )}&output=embed&z=11`;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* Top Map Route Header */}
      <div className="p-4 bg-slate-50/90 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold shadow-sm">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <span>{originCity}</span>
              <span className="text-orange-500">➔</span>
              <span>{destCity}</span>
            </div>
            <p className="text-[11px] text-slate-500 truncate max-w-xs">
              Vía recomendada: Corredor Troncal Caribe / Vía al Mar
            </p>
          </div>
        </div>

        {/* Engine switcher: Google Maps vs Radar Satelital Caribe */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-0.5 bg-slate-200 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setMapEngine('radar')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                mapEngine === 'radar'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🛰️ Radar Satelital GPS
            </button>
            <button
              onClick={() => setMapEngine('google')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                mapEngine === 'google'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🗺️ Google Maps
            </button>
          </div>

          <span className={`hidden sm:inline-block px-2.5 py-1 border rounded-lg text-[11px] font-medium ${trafficDetails.color}`}>
            {trafficDetails.label}
          </span>
        </div>
      </div>

      {/* Geolocation status and trigger ribbon */}
      <div className="px-4 py-2 bg-gradient-to-r from-slate-900 to-slate-800 text-white text-xs flex flex-wrap items-center justify-between gap-2 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${hasPermission ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          {hasPermission ? (
            <span className="text-[11px]">
              GPS en tiempo real activo · Precisión: ±{accuracy}m {distanceToTruck ? `· A ${distanceToTruck} km del camión (${carrierVehiclePlate})` : ''}
            </span>
          ) : (
            <span className="text-[11px] text-slate-300">
              {geoError || 'Permite el acceso a tu ubicación para sincronizar la distancia exacta con el camión.'}
            </span>
          )}
        </div>

        {!hasPermission && (
          <button
            onClick={requestLocation}
            disabled={isLocating}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-orange-500 hover:bg-orange-600 text-white transition-all shadow-xs"
          >
            <Crosshair className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            {isLocating ? 'Obteniendo GPS...' : '📍 Activar mi Ubicación'}
          </button>
        )}
      </div>

      {/* Map Display Container */}
      <div className="relative w-full h-80 sm:h-96 bg-[#e6edf4] overflow-hidden">
        {mapEngine === 'google' ? (
          /* Google Maps Interactive Iframe */
          <div className="w-full h-full relative">
            <iframe
              title="Google Maps Caribe Express Route"
              src={googleMapsUrl}
              className="w-full h-full border-0"
              loading="lazy"
              allowFullScreen
            />
            {/* Direct Google Maps link overlay */}
            <div className="absolute top-2 right-2">
              <a
                href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
                  `${originAddress}, ${originCity}`
                )}&destination=${encodeURIComponent(`${destAddress}, ${destCity}`)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/95 text-slate-800 text-[11px] font-bold rounded-xl shadow-md hover:bg-white transition-all border border-slate-200"
              >
                <ExternalLink className="w-3.5 h-3.5 text-orange-500" />
                Abrir en Google Maps App
              </a>
            </div>
          </div>
        ) : (
          /* Radar Satelital Caribe Interactive Canvas */
          <div
            className="w-full h-full relative transition-transform duration-300"
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
          >
            {/* Background ocean & terrain styling */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#cbe0f5] via-[#ddeaf7] to-[#eaf2f9]" />

            <svg
              viewBox="0 0 800 480"
              className="absolute inset-0 w-full h-full object-cover"
              preserveAspectRatio="none"
            >
              {/* Grid pattern */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(148, 163, 184, 0.18)" strokeWidth="0.8" />
                </pattern>
                <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0B2356" />
                  <stop offset="50%" stopColor="#EA580C" />
                  <stop offset="100%" stopColor="#0B2356" />
                </linearGradient>
              </defs>
              <rect width="800" height="480" fill="url(#grid)" />

              {/* Caribbean Coastal shoreline contour */}
              <path
                d="M 20 180 Q 140 160 220 200 T 420 150 T 640 120 T 780 70 L 800 480 L 0 480 Z"
                fill="#f1f5f9"
                stroke="#cbd5e1"
                strokeWidth="1.5"
              />

              {/* Intercity corridor connectors */}
              {CARIBE_CITIES.map((city, idx) => {
                const nextCity = CARIBE_CITIES[(idx + 1) % CARIBE_CITIES.length];
                const pA = projectCoordinates(city.lat, city.lng);
                const pB = projectCoordinates(nextCity.lat, nextCity.lng);
                return (
                  <line
                    key={`hw-${city.name}-${nextCity.name}`}
                    x1={pA.x}
                    y1={pA.y}
                    x2={pB.x}
                    y2={pB.y}
                    stroke="#cbd5e1"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />
                );
              })}

              {/* Active Route casing and path */}
              <path
                d={`M ${p1.x} ${p1.y} Q ${ctrlX} ${ctrlY} ${p2.x} ${p2.y}`}
                fill="none"
                stroke="#ffffff"
                strokeWidth="9"
                strokeLinecap="round"
              />
              <path
                d={`M ${p1.x} ${p1.y} Q ${ctrlX} ${ctrlY} ${p2.x} ${p2.y}`}
                fill="none"
                stroke="url(#routeGradient)"
                strokeWidth="5"
                strokeLinecap="round"
              />

              {/* Toll Booth Markers */}
              {tollBooths.map((toll, i) => (
                <g
                  key={toll.name}
                  transform={`translate(${toll.x}, ${toll.y})`}
                  className="cursor-pointer"
                  onClick={() => setActiveTollInfo(activeTollInfo === toll.name ? null : toll.name)}
                >
                  <circle r="7" fill="#F59E0B" stroke="#ffffff" strokeWidth="2" />
                  <text x="0" y="3" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">
                    $
                  </text>
                  <text x="0" y="-10" textAnchor="middle" fill="#78350F" fontSize="8" fontWeight="bold">
                    Peaje
                  </text>
                </g>
              ))}

              {/* City Markers */}
              {CARIBE_CITIES.map((c) => {
                const pt = projectCoordinates(c.lat, c.lng);
                const isOrigin = c.name.toLowerCase() === originCity.toLowerCase();
                const isDest = c.name.toLowerCase() === destCity.toLowerCase();
                return (
                  <g key={c.name} transform={`translate(${pt.x}, ${pt.y})`}>
                    <circle
                      r={isOrigin || isDest ? '7.5' : '3.5'}
                      fill={isOrigin ? '#0B2356' : isDest ? '#EA580C' : '#94a3b8'}
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                    <text
                      x="0"
                      y="-11"
                      textAnchor="middle"
                      fill={isOrigin || isDest ? '#0f172a' : '#64748b'}
                      fontWeight={isOrigin || isDest ? 'bold' : 'normal'}
                      fontSize={isOrigin || isDest ? '11' : '9'}
                    >
                      {c.name}
                    </text>
                  </g>
                );
              })}

              {/* User GPS Pin (if permission granted) */}
              {userPt && (
                <g transform={`translate(${userPt.x}, ${userPt.y})`}>
                  <circle r="16" fill="#10B981" fillOpacity="0.25" className="animate-ping" />
                  <circle r="8" fill="#10B981" stroke="#ffffff" strokeWidth="2" />
                  <text x="0" y="18" textAnchor="middle" fill="#047857" fontSize="9" fontWeight="bold">
                    Tu Ubicación
                  </text>
                </g>
              )}

              {/* Origin Marker */}
              <g transform={`translate(${p1.x}, ${p1.y})`}>
                <circle r="13" fill="#0B2356" />
                <circle r="4" fill="#ffffff" />
                <text x="0" y="24" textAnchor="middle" fill="#0B2356" fontSize="10" fontWeight="bold">
                  ORIGEN
                </text>
              </g>

              {/* Destination Marker */}
              <g transform={`translate(${p2.x}, ${p2.y})`}>
                <circle r="13" fill="#EA580C" />
                <circle r="4" fill="#ffffff" />
                <text x="0" y="24" textAnchor="middle" fill="#EA580C" fontSize="10" fontWeight="bold">
                  DESTINO
                </text>
              </g>

              {/* Moving Delivery Truck on Route */}
              <g transform={`translate(${truckX}, ${truckY})`} className="transition-all duration-700">
                <circle r="18" fill="#F97316" fillOpacity="0.3" className="animate-pulse" />
                <circle r="12" fill="#EA580C" stroke="#ffffff" strokeWidth="2.5" />
                <rect x="-4" y="-4" width="8" height="8" rx="1.5" fill="#ffffff" />
              </g>
            </svg>
          </div>
        )}

        {/* Floating Zoom & Map Controls (for Radar Mode) */}
        {mapEngine === 'radar' && (
          <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
            <button
              onClick={() => setZoomLevel((z) => Math.min(z + 0.2, 1.8))}
              title="Acercar mapa"
              className="w-8 h-8 rounded-lg bg-white/95 text-slate-700 shadow-md flex items-center justify-center hover:bg-white font-bold transition-all border border-slate-200"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(z - 0.2, 0.9))}
              title="Alejar mapa"
              className="w-8 h-8 rounded-lg bg-white/95 text-slate-700 shadow-md flex items-center justify-center hover:bg-white font-bold transition-all border border-slate-200"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              title="Restablecer vista"
              className="w-8 h-8 rounded-lg bg-white/95 text-slate-700 shadow-md flex items-center justify-center hover:bg-white font-bold transition-all border border-slate-200"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Live Truck Telemetry Card Overlay */}
        <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-xs bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200/90 shadow-xl text-xs space-y-2.5 z-10">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-orange-500" />
              Telemetría Caribe Express
            </span>
            <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-mono text-[10px] font-bold">
              Placa: {carrierVehiclePlate}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-slate-100">
            <div className="bg-slate-50 p-1.5 rounded-xl border border-slate-100">
              <span className="block text-[10px] text-slate-500 font-medium">Distancia</span>
              <span className="font-bold text-slate-900 tabular-nums">{distanceKm} km</span>
            </div>
            <div className="bg-slate-50 p-1.5 rounded-xl border border-slate-100">
              <span className="block text-[10px] text-slate-500 font-medium">Tiempo Est.</span>
              <span className="font-bold text-slate-900 tabular-nums">{Math.floor(durationMinutes / 60)}h {durationMinutes % 60}m</span>
            </div>
            <div className="bg-slate-50 p-1.5 rounded-xl border border-slate-100">
              <span className="block text-[10px] text-slate-500 font-medium">Peajes</span>
              <span className="font-bold text-slate-900 tabular-nums">{tollCount}</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-600 flex items-start gap-1.5 pt-0.5">
            <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
            <span className="truncate font-medium">{originAddress} ➔ {destAddress}</span>
          </div>

          {activeTollInfo && (
            <div className="bg-amber-50 border border-amber-200 p-2 rounded-xl text-[10px] text-amber-900">
              <strong>{activeTollInfo}</strong>: Tarifa categoría I aproximada $17.000 COP. Paso verificado con telepeaje Flypass / Facilpass.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
