import React from 'react';
import { PackageCheck, MapPin, Eye, AlertCircle } from 'lucide-react';
import { MoveOrder } from '../types';

interface ClientMovesHistoryProps {
  orders: MoveOrder[];
  onOpenTracking: (code: string) => void;
}

export const ClientMovesHistory: React.FC<ClientMovesHistoryProps> = ({
  orders,
  onOpenTracking,
}) => {
  const formatCOP = (val: number) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val ?? 0);

  // Filtrar órdenes que tengan quote válido para evitar crashes
  const validOrders = orders.filter(
    (o) => o && o.quote && o.quote.origin && o.quote.destination
  );

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Mis Solicitudes y Mudanzas</h3>
          <p className="text-xs text-slate-500">
            Historial de traslados cotizados y en curso en la plataforma.
          </p>
        </div>
        <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">
          {validOrders.length} mudanza{validOrders.length !== 1 ? 's' : ''} registrada{validOrders.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Estado vacío */}
      {validOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-12 flex flex-col items-center justify-center gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center">
            <PackageCheck className="w-8 h-8 text-orange-400" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-sm mb-1">Aún no tienes mudanzas registradas</h4>
            <p className="text-xs text-slate-500 max-w-sm">
              Usa el <strong>Cotizador Inteligente</strong> para calcular el precio de tu próxima mudanza y reserva un transportista verificado.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {validOrders.map((ord) => (
            <div
              key={ord.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                {/* Tracking code + carrier + status */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold bg-slate-900 text-orange-400 px-2.5 py-0.5 rounded-lg shrink-0">
                    {ord.trackingCode}
                  </span>
                  <span className="text-xs font-bold text-slate-900 truncate">
                    {ord.carrierName}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      ord.status === 'completado'
                        ? 'bg-emerald-100 text-emerald-800'
                        : ord.status === 'en_ruta'
                        ? 'bg-orange-100 text-orange-800'
                        : ord.status === 'cancelado'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {ord.status.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>

                {/* Ruta */}
                <div className="text-xs text-slate-700 flex flex-wrap items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                  <span className="truncate max-w-[200px]">
                    {ord.quote.origin.address} ({ord.quote.origin.city})
                  </span>
                  <span className="text-slate-400">➔</span>
                  <span className="truncate max-w-[200px]">
                    {ord.quote.destination.address} ({ord.quote.destination.city})
                  </span>
                </div>

                {/* Detalles */}
                <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                  <span>
                    Fecha: <strong>{ord.scheduledDate} · {ord.scheduledTime}</strong>
                  </span>
                  <span>·</span>
                  <span>
                    Distancia: <strong>{ord.quote.distanceKm} km</strong>
                  </span>
                  <span>·</span>
                  <span>
                    Total:{' '}
                    <strong className="text-orange-600 font-bold">
                      {formatCOP(ord.quote.breakdown.total)}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Acción */}
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
      )}
    </div>
  );
};
