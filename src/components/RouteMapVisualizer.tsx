import React, { useState, useEffect } from 'react';
import { Navigation, Clock, Shield, AlertCircle, RefreshCw, Zap, MapPin } from 'lucide-react';
import { CARIBE_CITIES } from '../data/mockData';

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
}) => {
  const [selectedRouteType, setSelectedRouteType] = useState<'optima' | 'alternativa'>('optima');
  const [trafficStatus, setTrafficStatus] = useState<'fluido' | 'moderado' | 'concurrido'>('fluido');
  const [carProgress, setCarProgress] = useState(isLiveTracking ? trackingStepPercent : 0);

  // Animated vehicle progress for live tracking or preview
  useEffect(() => {
    if (!isLiveTracking) {
      setCarProgress(50);
      return;
    }
    const interval = setInterval(() => {
      setCarProgress((prev) => (prev >= 98 ? 10 : prev + 1));
    }, 1200);
    return () => clearInterval(interval);
  }, [isLiveTracking]);

  // City coordinates normalized for our SVG canvas (SVG dimensions: 800 x 480)
  // Lat bounds ~ 8.5 to 11.8 (South to North)
  // Lng bounds ~ -76.0 to -72.5 (West to East)
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

  // Bezier curve control point for road curve simulation
  const midX = (p1.x + p2.x) / 2;
  const midY = (p1.y + p2.y) / 2;
  // Curve curvature offset
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const normalX = -dy * 0.15;
  const normalY = dx * 0.15;
  const ctrlX = midX + normalX;
  const ctrlY = midY + normalY;

  // Compute position of truck along quadratic bezier curve: B(t) = (1-t)^2 P1 + 2(1-t)t Pctrl + t^2 P2
  const t = carProgress / 100;
  const truckX = Math.round((1 - t) * (1 - t) * p1.x + 2 * (1 - t) * t * ctrlX + t * t * p2.x);
  const truckY = Math.round((1 - t) * (1 - t) * p1.y + 2 * (1 - t) * t * ctrlY + t * t * p2.y);

  // Traffic badge styling
  const trafficDetails = {
    fluido: { label: 'Tráfico fluido', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    moderado: { label: 'Tráfico moderado (+12 min)', color: 'text-amber-700 bg-amber-50 border-amber-200' },
    concurrido: { label: 'Retraso por peaje (+25 min)', color: 'text-red-700 bg-red-50 border-red-200' },
  }[trafficStatus];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* Top Map Route Header */}
      <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center font-bold">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
              <span>{originCity}</span>
              <span className="text-orange-500">➔</span>
              <span>{destCity}</span>
            </div>
            <p className="text-[11px] text-slate-500 truncate max-w-xs">
              Vía recomendada: Corredor Troncal Caribe / Vía al Mar
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {/* Segmented route filter */}
          <div className="flex items-center p-0.5 bg-slate-200/80 rounded-lg">
            <button
              onClick={() => {
                setSelectedRouteType('optima');
                setTrafficStatus('fluido');
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                selectedRouteType === 'optima'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ruta Más Rápida
            </button>
            <button
              onClick={() => {
                setSelectedRouteType('alternativa');
                setTrafficStatus('moderado');
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                selectedRouteType === 'alternativa'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Alternativa sin Peaje
            </button>
          </div>

          <span className={`px-2.5 py-1 border rounded-lg text-[11px] font-medium ${trafficDetails.color}`}>
            {trafficDetails.label}
          </span>
        </div>
      </div>

      {/* Interactive Simulated Map Canvas */}
      <div className="relative w-full h-80 sm:h-96 bg-[#e6edf4] overflow-hidden">
        {/* Sea / Ocean background accent */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#d4e4f7] via-[#e2ecf7] to-[#e8f0f8]" />

        {/* Coastal contour decorative SVG */}
        <svg
          viewBox="0 0 800 480"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          preserveAspectRatio="none"
        >
          {/* Subtle grid pattern for cartographic look */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(148, 163, 184, 0.15)" strokeWidth="0.8" />
            </pattern>
            {/* Gradient along the route path */}
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0B2356" />
              <stop offset="50%" stopColor="#EA580C" />
              <stop offset="100%" stopColor="#0B2356" />
            </linearGradient>
          </defs>
          <rect width="800" height="480" fill="url(#grid)" />

          {/* Caribbean Sea shoreline contour */}
          <path
            d="M 20 180 Q 140 160 220 200 T 420 150 T 640 120 T 780 70 L 800 480 L 0 480 Z"
            fill="#f1f5f9"
            stroke="#cbd5e1"
            strokeWidth="1.5"
          />

          {/* Major intercity highway network connectors */}
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

          {/* Active Navigation Route Line (Bezier Curve) */}
          {/* Route casing (shadow border) */}
          <path
            d={`M ${p1.x} ${p1.y} Q ${ctrlX} ${ctrlY} ${p2.x} ${p2.y}`}
            fill="none"
            stroke="#ffffff"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Active Colored Route */}
          <path
            d={`M ${p1.x} ${p1.y} Q ${ctrlX} ${ctrlY} ${p2.x} ${p2.y}`}
            fill="none"
            stroke="url(#routeGradient)"
            strokeWidth="5"
            strokeLinecap="round"
          />

          {/* City Hub Markers */}
          {CARIBE_CITIES.map((c) => {
            const pt = projectCoordinates(c.lat, c.lng);
            const isOrigin = c.name.toLowerCase() === originCity.toLowerCase();
            const isDest = c.name.toLowerCase() === destCity.toLowerCase();
            return (
              <g key={c.name} transform={`translate(${pt.x}, ${pt.y})`}>
                <circle
                  r={isOrigin || isDest ? '7' : '3.5'}
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
                  fontFamily="'Plus Jakarta Sans', sans-serif"
                >
                  {c.name}
                </text>
              </g>
            );
          })}

          {/* Origin Flag Icon */}
          <g transform={`translate(${p1.x}, ${p1.y})`}>
            <circle r="12" fill="#0B2356" />
            <circle r="4" fill="#ffffff" />
            <text x="0" y="24" textAnchor="middle" fill="#0B2356" fontSize="10" fontWeight="bold">
              ORIGEN
            </text>
          </g>

          {/* Destination Flag Icon */}
          <g transform={`translate(${p2.x}, ${p2.y})`}>
            <circle r="12" fill="#EA580C" />
            <circle r="4" fill="#ffffff" />
            <text x="0" y="24" textAnchor="middle" fill="#EA580C" fontSize="10" fontWeight="bold">
              DESTINO
            </text>
          </g>

          {/* Moving Transport Vehicle Pin on Route */}
          <g transform={`translate(${truckX}, ${truckY})`} className="transition-all duration-700">
            {/* Pulse beacon */}
            <circle r="16" fill="#F97316" fillOpacity="0.25" />
            <circle r="11" fill="#EA580C" stroke="#ffffff" strokeWidth="2" />
            {/* Delivery Box icon inside truck pin */}
            <rect x="-4" y="-4" width="8" height="8" rx="1.5" fill="#ffffff" />
          </g>
        </svg>

        {/* Live Tracking overlay card inside map */}
        <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-xs bg-white/95 backdrop-blur-md p-3 rounded-xl border border-slate-200/90 shadow-lg text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-900 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-orange-500" />
              Telemetría de Ruta Caribe
            </span>
            <span className="text-[10px] text-slate-500 font-mono">GPS 4G Activo</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-slate-100">
            <div className="bg-slate-50 p-1.5 rounded-lg">
              <span className="block text-[10px] text-slate-500">Distancia</span>
              <span className="font-bold text-slate-900 tabular-nums">{distanceKm} km</span>
            </div>
            <div className="bg-slate-50 p-1.5 rounded-lg">
              <span className="block text-[10px] text-slate-500">Tiempo Est.</span>
              <span className="font-bold text-slate-900 tabular-nums">{Math.floor(durationMinutes / 60)}h {durationMinutes % 60}m</span>
            </div>
            <div className="bg-slate-50 p-1.5 rounded-lg">
              <span className="block text-[10px] text-slate-500">Peajes</span>
              <span className="font-bold text-slate-900 tabular-nums">{tollCount}</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-600 flex items-start gap-1.5 pt-0.5">
            <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
            <span className="truncate">{originAddress} ➔ {destAddress}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
