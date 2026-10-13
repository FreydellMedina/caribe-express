import React, { useState } from 'react';
import {
  Truck,
  TrendingUp,
  FileCheck2,
  DollarSign,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Settings,
  MapPin,
  Phone,
  Navigation
} from 'lucide-react';
import { Carrier, MoveOrder, MoveOrderStatus } from '../types';

interface CarrierDashboardProps {
  carrier: Carrier;
  orders: MoveOrder[];
  onUpdateOrderStatus: (orderId: string, newStatus: MoveOrderStatus) => void;
  onUpdateCarrierRates: (rates: { basePrice: number; pricePerKm: number; floorSurcharge: number; helperRate: number }) => void;
}

export const CarrierDashboard: React.FC<CarrierDashboardProps> = ({
  carrier,
  orders,
  onUpdateOrderStatus,
  onUpdateCarrierRates,
}) => {
  const [activeTab, setActiveTab] = useState<'servicios' | 'documentos' | 'tarifas' | 'ganancias'>('servicios');

  // Rates form state
  const [basePrice, setBasePrice] = useState(carrier.basePrice);
  const [pricePerKm, setPricePerKm] = useState(carrier.pricePerKm);
  const [floorSurcharge, setFloorSurcharge] = useState(carrier.floorWithoutElevatorSurcharge);
  const [helperRate, setHelperRate] = useState(carrier.helperRate);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Filter orders assigned to this carrier
  const myOrders = orders.filter((o) => o.carrierId === carrier.id);

  // Financial calculations
  const completedOrders = myOrders.filter((o) => o.status === 'completado');
  const totalEarned = completedOrders.reduce((sum, o) => sum + (o.quote.breakdown.total * 0.88), 0); // 12% platform fee

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleSaveRates = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCarrierRates({
      basePrice,
      pricePerKm,
      floorSurcharge,
      helperRate,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const nextStatusMap: Partial<Record<MoveOrderStatus, { next: MoveOrderStatus; label: string }>> = {
    cotizado: { next: 'asignado', label: 'Aceptar Servicio' },
    asignado: { next: 'hacia_origen', label: 'Iniciar Traslado a Origen' },
    hacia_origen: { next: 'cargando', label: 'Llegué a Origen / Comenzar Carga' },
    cargando: { next: 'en_ruta', label: 'Carga Completa / Iniciar Ruta a Destino' },
    en_ruta: { next: 'descargando', label: 'Llegué a Destino / Descargando' },
    descargando: { next: 'completado', label: 'Finalizar Entrega a Conformidad' },
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Carrier Top Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center font-bold text-xl">
            <Truck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold font-display text-white">
                {carrier.companyName}
              </h2>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold px-2 py-0.5 rounded-full">
                {carrier.verificationStatus === 'verificado' ? 'Verificado Oficial' : 'En Validación'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Conductor: {carrier.fullName} · Placa: <span className="font-mono text-orange-400 font-bold">{carrier.vehiclePlate}</span> ({carrier.vehicleModel})
            </p>
          </div>
        </div>

        {/* Quick KPI pills */}
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
          <div className="bg-slate-800/90 px-3.5 py-2 rounded-xl border border-slate-700 text-center min-w-[90px]">
            <span className="block text-[10px] text-slate-400">Calificación</span>
            <span className="text-xs font-bold text-amber-400 tabular-nums">★ {carrier.rating}</span>
          </div>
          <div className="bg-slate-800/90 px-3.5 py-2 rounded-xl border border-slate-700 text-center min-w-[90px]">
            <span className="block text-[10px] text-slate-400">Viajes Totales</span>
            <span className="text-xs font-bold text-white tabular-nums">{carrier.totalTrips}</span>
          </div>
          <div className="bg-slate-800/90 px-3.5 py-2 rounded-xl border border-slate-700 text-center min-w-[110px]">
            <span className="block text-[10px] text-slate-400">Ingresos Mes</span>
            <span className="text-xs font-bold text-emerald-400 tabular-nums">{formatCOP(totalEarned || 2450000)}</span>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-1 p-1 bg-slate-200/80 rounded-xl max-w-md">
        <button
          onClick={() => setActiveTab('servicios')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            activeTab === 'servicios' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Servicios y Rutas ({myOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('documentos')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            activeTab === 'documentos' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Documentación Legal
        </button>
        <button
          onClick={() => setActiveTab('tarifas')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            activeTab === 'tarifas' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Tarifas Base
        </button>
        <button
          onClick={() => setActiveTab('ganancias')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            activeTab === 'ganancias' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Ganancias
        </button>
      </div>

      {/* TAB 1: SERVICIOS Y ÓRDENES */}
      {activeTab === 'servicios' && (
        <div className="space-y-4">
          {myOrders.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
              No tienes mudanzas asignadas en este momento. Las nuevas solicitudes de cotización aparecerán aquí.
            </div>
          ) : (
            myOrders.map((ord) => {
              const nextAction = nextStatusMap[ord.status];
              const isCompleted = ord.status === 'completado';

              return (
                <div
                  key={ord.id}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-slate-900 text-orange-400 px-2.5 py-0.5 rounded-lg">
                        {ord.trackingCode}
                      </span>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Estado: <strong className="text-orange-600">{ord.status.replace('_', ' ')}</strong>
                      </span>
                    </div>

                    <div className="text-xs text-slate-900 font-semibold flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-orange-500" />
                      {ord.quote.origin.address} ({ord.quote.origin.city}) ➔ {ord.quote.destination.address} ({ord.quote.destination.city})
                    </div>

                    <div className="text-[11px] text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
                      <span>Cliente: <strong>{ord.clientName}</strong></span>
                      <span>Teléfono: <strong>{ord.clientPhone}</strong></span>
                      <span>Fecha: <strong>{ord.scheduledDate} · {ord.scheduledTime}</strong></span>
                      <span>Distancia: <strong>{ord.quote.distanceKm} km</strong></span>
                    </div>
                  </div>

                  {/* Actions & Price */}
                  <div className="flex flex-col sm:flex-row md:flex-col items-end gap-2 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Tu Ganancia Neta</span>
                      <span className="text-base font-extrabold text-slate-900 tabular-nums">
                        {formatCOP(ord.quote.breakdown.total * 0.88)}
                      </span>
                    </div>

                    {nextAction && !isCompleted && (
                      <button
                        onClick={() => onUpdateOrderStatus(ord.id, nextAction.next)}
                        className="px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        {nextAction.label}
                      </button>
                    )}

                    {isCompleted && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Servicio Completado
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: DOCUMENTOS LEGALES */}
      {activeTab === 'documentos' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Documentación Legal y Verificación Ministerial
              </h3>
              <p className="text-xs text-slate-500">
                Requisito indispensable para operar en Caribe Express y cumplir con las normas del Ministerio de Transporte de Colombia.
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              4/5 Aprobados
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {carrier.documents.map((doc) => (
              <div
                key={doc.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-orange-600" />
                    <span className="text-xs font-bold text-slate-900">{doc.name}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Archivo: {doc.fileName || 'Cargado_Digital.pdf'}
                  </div>
                  {doc.expiryDate && (
                    <div className="text-[10px] text-slate-600">
                      Vencimiento: <span className="font-semibold">{doc.expiryDate}</span>
                    </div>
                  )}
                  {doc.feedback && (
                    <div className="text-[10px] text-amber-700 bg-amber-50 p-1.5 rounded mt-1 border border-amber-200">
                      Nota de revisión: {doc.feedback}
                    </div>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      doc.status === 'aprobado'
                        ? 'bg-emerald-100 text-emerald-800'
                        : doc.status === 'en_revision'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {doc.status.toUpperCase()}
                  </span>
                  <button className="block text-[10px] text-blue-600 hover:underline mt-2">
                    Reemplazar Archivo
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: TARIFAS BASE */}
      {activeTab === 'tarifas' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 max-w-2xl">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Configuración de Tarifas y Recargos del Vehículo
            </h3>
            <p className="text-xs text-slate-500">
              Estas tarifas se aplican dinámicamente cuando un usuario solicita cotización en tus zonas de cobertura.
            </p>
          </div>

          <form onSubmit={handleSaveRates} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tarifa Base del Servicio (COP)
              </label>
              <input
                type="number"
                value={basePrice}
                onChange={(e) => setBasePrice(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
              <span className="text-[10px] text-slate-400">Incluye arranque local y primera hora de carga.</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Costo por Kilómetro Adicional (COP / km)
              </label>
              <input
                type="number"
                value={pricePerKm}
                onChange={(e) => setPricePerKm(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Recargo por Piso sin Ascensor (COP / piso)
              </label>
              <input
                type="number"
                value={floorSurcharge}
                onChange={(e) => setFloorSurcharge(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tarifa por Ayudante de Carga Extra (COP)
              </label>
              <input
                type="number"
                value={helperRate}
                onChange={(e) => setHelperRate(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              {saveSuccess && (
                <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Tarifas actualizadas exitosamente
                </span>
              )}
              <button
                type="submit"
                className="ml-auto px-5 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-xs transition-colors"
              >
                Guardar Modificaciones
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: GANANCIAS */}
      {activeTab === 'ganancias' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-xs text-slate-500 font-medium">Ingresos Facturados</span>
            <div className="text-2xl font-black text-slate-900 tabular-nums">
              {formatCOP(totalEarned || 2450000)}
            </div>
            <p className="text-[10px] text-emerald-600 font-semibold">Disponible para retiro inmediato</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-xs text-slate-500 font-medium">Comisión Caribe Express (12%)</span>
            <div className="text-2xl font-black text-slate-500 tabular-nums">
              {formatCOP((totalEarned || 2450000) * 0.12)}
            </div>
            <p className="text-[10px] text-slate-400">Incluye soporte 24/7 y seguro de carga</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-xs text-slate-500 font-medium">Promedio por Servicio</span>
            <div className="text-2xl font-black text-orange-600 tabular-nums">
              {formatCOP(380000)}
            </div>
            <p className="text-[10px] text-slate-400">Basado en trayectos intermunicipales</p>
          </div>
        </div>
      )}
    </div>
  );
};
