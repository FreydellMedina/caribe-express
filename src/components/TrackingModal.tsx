import React, { useState } from 'react';
import {
  X,
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  Truck,
  Phone,
  ShieldAlert,
  AlertCircle,
  FileText
} from 'lucide-react';
import { MoveOrder, MoveOrderStatus } from '../types';
import { RouteMapVisualizer } from './RouteMapVisualizer';

interface TrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: MoveOrder[];
  initialTrackingCode?: string;
  onReportDispute?: (orderId: string, trackingCode: string, reason: any, description: string) => void;
}

export const TrackingModal: React.FC<TrackingModalProps> = ({
  isOpen,
  onClose,
  orders,
  initialTrackingCode = 'CRB-84920',
  onReportDispute,
}) => {
  const [searchCode, setSearchCode] = useState(initialTrackingCode);
  const [currentOrder, setCurrentOrder] = useState<MoveOrder | null>(
    orders.find((o) => o.trackingCode.toUpperCase() === initialTrackingCode.toUpperCase()) || orders[0] || null
  );

  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [disputeReason, setDisputeReason] = useState<'retraso_severo' | 'dano_mercancia' | 'cobro_inadecuado'>('retraso_severo');
  const [disputeDesc, setDisputeDesc] = useState('');
  const [disputeSuccess, setDisputeSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = orders.find((o) => o.trackingCode.trim().toUpperCase() === searchCode.trim().toUpperCase());
    if (found) {
      setCurrentOrder(found);
    }
  };

  const handleSendDispute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrder || !onReportDispute || !disputeDesc) return;
    onReportDispute(currentOrder.id, currentOrder.trackingCode, disputeReason, disputeDesc);
    setDisputeSuccess(true);
    setTimeout(() => {
      setDisputeSuccess(false);
      setShowDisputeForm(false);
      setDisputeDesc('');
    }, 1500);
  };

  const stepsOrder: MoveOrderStatus[] = ['cotizado', 'hacia_origen', 'cargando', 'en_ruta', 'completado'];

  const getStepProgressIndex = (status: MoveOrderStatus) => {
    const idx = stepsOrder.indexOf(status);
    return idx >= 0 ? idx : 2;
  };

  const currentIdx = currentOrder ? getStepProgressIndex(currentOrder.status) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold font-display">
                Seguimiento Satelital en Tiempo Real
              </h2>
              <p className="text-xs text-slate-400">
                Monitoreo GPS y estado del servicio de mudanza
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search bar inside modal */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200">
          <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
            <input
              type="text"
              placeholder="Ej. CRB-84920"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-mono uppercase"
            />
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-xs"
            >
              Consultar Código
            </button>
          </form>
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {currentOrder ? (
            <>
              {/* Order quick overview */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-orange-50/50 rounded-xl border border-orange-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold bg-slate-900 text-orange-400 px-2.5 py-0.5 rounded-lg">
                      {currentOrder.trackingCode}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      Transportista: {currentOrder.carrierName}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Placa: <strong className="font-mono">{currentOrder.carrierVehiclePlate}</strong> · Conductor: {currentOrder.carrierPhone}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${currentOrder.carrierPhone}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    Llamar al Conductor
                  </a>
                  <button
                    onClick={() => setShowDisputeForm(!showDisputeForm)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Reportar Incidencia
                  </button>
                </div>
              </div>

              {/* Progress steps bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-500 font-medium">
                  <span>1. Cotizado</span>
                  <span>2. Hacia Origen</span>
                  <span>3. Cargando</span>
                  <span>4. En Ruta</span>
                  <span>5. Entregado</span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-orange-500 h-full rounded-full transition-all duration-700"
                    style={{ width: `${((currentIdx + 1) / stepsOrder.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Live Map */}
              <RouteMapVisualizer
                originCity={currentOrder.quote.origin.city}
                originAddress={currentOrder.quote.origin.address}
                destCity={currentOrder.quote.destination.city}
                destAddress={currentOrder.quote.destination.address}
                distanceKm={currentOrder.quote.distanceKm}
                durationMinutes={currentOrder.quote.estimatedMinutes}
                tollCount={currentOrder.quote.tollCount}
                isLiveTracking={currentOrder.status === 'en_ruta'}
                trackingStepPercent={currentOrder.status === 'completado' ? 100 : 55}
              />

              {/* Timeline of events */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Bitácora de Eventos del Viaje
                </h4>
                <div className="space-y-2">
                  {currentOrder.timeline.map((evt, i) => (
                    <div
                      key={i}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3 text-xs"
                    >
                      <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{evt.title}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({evt.timestamp})</span>
                        </div>
                        <p className="text-slate-600 mt-0.5">{evt.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dispute Form Modal/Accordion */}
              {showDisputeForm && (
                <div className="p-4 bg-red-50/60 rounded-xl border border-red-200 space-y-3 text-xs animate-in fade-in">
                  <div className="flex items-center gap-1.5 text-red-900 font-bold">
                    <ShieldAlert className="w-4 h-4 text-red-600" />
                    Reportar Incidencia o Disputa al Centro de Arbitraje
                  </div>
                  <form onSubmit={handleSendDispute} className="space-y-2">
                    <div>
                      <label className="block text-slate-700 mb-1">Motivo Principal</label>
                      <select
                        value={disputeReason}
                        onChange={(e) => setDisputeReason(e.target.value as any)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                      >
                        <option value="retraso_severo">Retraso Severo en Llegada</option>
                        <option value="dano_mercancia">Daño o Avería en Muebles</option>
                        <option value="cobro_inadecuado">Discrepancia en Cobro Adicional</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-700 mb-1">Descripción detallada</label>
                      <textarea
                        rows={2}
                        required
                        placeholder="Explica qué sucedió..."
                        value={disputeDesc}
                        onChange={(e) => setDisputeDesc(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowDisputeForm(false)}
                        className="px-3 py-1 text-slate-600 hover:bg-slate-100 rounded-lg"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-xs"
                      >
                        {disputeSuccess ? 'Reporte Enviado' : 'Enviar a Moderación'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              No se encontró ninguna mudanza con el código ingresado. Verifica tu comprobante.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
