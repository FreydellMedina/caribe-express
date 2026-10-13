import React from 'react';
import { PackageCheck, MapPin, Calendar, Clock, Eye, Star, CheckCircle2 } from 'lucide-react';
import { MoveOrder } from '../types';

interface ClientMovesHistoryProps {
  orders: MoveOrder[];
  onOpenTracking: (code: string) => void;
}

export const ClientMovesHistory: React.FC<ClientMovesHistoryProps> = ({
  orders,
  onOpenTracking,
}) => {
  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Mis Solicitudes y Mudanzas
          </h3>
          <p className="text-xs text-slate-500">
            Historial de traslados cotizados y en curso en la plataforma.
          </p>
        </div>
        <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">
          {orders.length} mudanzas registradas
        </span>
      </div>

      <div className="space-y-3">
        {orders.map((ord) => (
          <div
            key={ord.id}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          >
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold bg-slate-900 text-orange-400 px-2.5 py-0.5 rounded-lg">
                  {ord.trackingCode}
                </span>
                <span className="text-xs font-bold text-slate-900">
                  {ord.carrierName}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    ord.status === 'completado'
                      ? 'bg-emerald-100 text-emerald-800'
                      : ord.status === 'en_ruta'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {ord.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              <div className="text-xs text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-orange-500" />
                <span>{ord.quote.origin.address} ({ord.quote.origin.city})</span>
                <span className="text-slate-400">➔</span>
                <span>{ord.quote.destination.address} ({ord.quote.destination.city})</span>
              </div>

              <div className="text-[11px] text-slate-500 flex items-center gap-3">
                <span>Fecha: <strong>{ord.scheduledDate} a las {ord.scheduledTime}</strong></span>
                <span>·</span>
                <span>Distancia: <strong>{ord.quote.distanceKm} km</strong></span>
                <span>·</span>
                <span>Total: <strong className="text-orange-600 font-bold">{formatCOP(ord.quote.breakdown.total)}</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onOpenTracking(ord.trackingCode)}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5 text-orange-400" />
                Seguimiento en Vivo
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
