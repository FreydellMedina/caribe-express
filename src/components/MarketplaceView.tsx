import React, { useState } from 'react';
import {
  Search,
  Filter,
  Star,
  ShieldCheck,
  Truck,
  MapPin,
  CheckCircle,
  Phone,
  Calendar,
  ChevronRight,
  FileText
} from 'lucide-react';
import { Carrier, VehicleType } from '../types';
import { CARIBE_CITIES } from '../data/mockData';

interface MarketplaceViewProps {
  carriers: Carrier[];
  onSelectCarrierForQuote: (carrier: Carrier) => void;
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  carriers,
  onSelectCarrierForQuote,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>('all');
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [selectedCarrierDetail, setSelectedCarrierDetail] = useState<Carrier | null>(null);

  const filteredCarriers = carriers.filter((c) => {
    const matchesSearch =
      c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.vehicleModel.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCity = selectedCity === 'all' || c.baseCity.toLowerCase() === selectedCity.toLowerCase() || c.coverageZones.includes(selectedCity);
    const matchesVehicle = selectedVehicleType === 'all' || c.vehicleType === selectedVehicleType;
    const matchesVerified = !onlyVerified || c.verificationStatus === 'verificado';

    return matchesSearch && matchesCity && matchesVehicle && matchesVerified;
  });

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const vehicleNameMap: Record<VehicleType, string> = {
    pickup: 'Camioneta Pick-up / Estacas',
    furgon: 'Furgón Mediano (3.5T)',
    camion_turbo: 'Camión Turbo (4.5 a 5T)',
    camion_grande: 'Camión Grande Doble Troque (10T)',
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header and Filter Controls */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Marketplace de Transportistas y Empresas de Mudanza
          </h2>
          <p className="text-xs text-slate-500">
            Encuentra transportistas certificados en Barranquilla, Cartagena, Santa Marta y toda la región Caribe.
          </p>
        </div>

        {/* Search Bar & Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
          {/* Search text */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por transportista, empresa o placa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* City filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">Todas las ciudades</option>
              {CARIBE_CITIES.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Vehicle type */}
          <div className="sm:col-span-4">
            <select
              value={selectedVehicleType}
              onChange={(e) => setSelectedVehicleType(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">Todos los vehículos</option>
              <option value="pickup">Camioneta Pick-up / Estacas</option>
              <option value="furgon">Furgón Mediano (3.5T)</option>
              <option value="camion_turbo">Camión Turbo (5T)</option>
              <option value="camion_grande">Camión Grande (10T)</option>
            </select>
          </div>
        </div>

        {/* Quick pill toggle for verified */}
        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
          <label className="flex items-center gap-2 cursor-pointer text-slate-700">
            <input
              type="checkbox"
              checked={onlyVerified}
              onChange={(e) => setOnlyVerified(e.target.checked)}
              className="w-4 h-4 text-orange-600 rounded border-slate-300 focus:ring-orange-500"
            />
            <span className="font-medium">Mostrar solo con Documentos Validados (SOAT, RUT, RTM)</span>
          </label>
          <span className="text-slate-500 font-medium">
            {filteredCarriers.length} transportistas disponibles
          </span>
        </div>
      </div>

      {/* Carriers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCarriers.map((carrier) => {
          const isVerified = carrier.verificationStatus === 'verificado';

          return (
            <div
              key={carrier.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:border-slate-300 transition-all group"
            >
              {/* Photo Container */}
              <div className="relative h-44 bg-slate-100 overflow-hidden">
                <img
                  src={carrier.photoUrl}
                  alt={carrier.companyName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-xs ${
                      isVerified
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-500 text-white'
                    }`}
                  >
                    <ShieldCheck className="w-3 h-3" />
                    {isVerified ? 'Documentos al Día' : 'En Verificación'}
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-white text-[11px] font-medium">
                  {carrier.baseCity}
                </div>
              </div>

              {/* Carrier Body Content */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm leading-tight">
                        {carrier.companyName}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {carrier.fullName}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200/60 shrink-0">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-bold text-amber-900 tabular-nums">
                        {carrier.rating}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {carrier.bio}
                  </p>

                  <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Vehículo:</span>
                      <span className="font-medium text-slate-900 truncate max-w-[170px]">
                        {carrier.vehicleModel}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Placa Oficial:</span>
                      <span className="font-mono font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                        {carrier.vehiclePlate}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Tarifa Base:</span>
                      <span className="font-bold text-orange-600 tabular-nums">
                        {formatCOP(carrier.basePrice)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => setSelectedCarrierDetail(carrier)}
                    className="flex-1 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                  >
                    Ver Perfil Completo
                  </button>
                  <button
                    onClick={() => onSelectCarrierForQuote(carrier)}
                    className="flex-1 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-xs transition-colors"
                  >
                    Cotizar Ahora
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Carrier Detail Modal */}
      {selectedCarrierDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="relative h-48 bg-slate-100">
              <img
                src={selectedCarrierDetail.photoUrl}
                alt={selectedCarrierDetail.companyName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedCarrierDetail(null)}
                className="absolute top-3 right-3 p-2 bg-slate-900/60 hover:bg-slate-900 text-white rounded-full transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">
                    {selectedCarrierDetail.companyName}
                  </h3>
                  <div className="flex items-center gap-1 text-amber-600 font-bold text-xs">
                    ★ {selectedCarrierDetail.rating} ({selectedCarrierDetail.totalTrips} servicios)
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  Responsable: {selectedCarrierDetail.fullName} · {selectedCarrierDetail.phone}
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <span className="font-bold text-slate-900 block">Descripción y Experiencia:</span>
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {selectedCarrierDetail.bio}
                </p>
              </div>

              {/* Legal Verification Status */}
              <div className="space-y-2 text-xs">
                <span className="font-bold text-slate-900 block">
                  Documentación Legal Verificada:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {selectedCarrierDetail.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between"
                    >
                      <span className="font-medium text-slate-700">{doc.name}</span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          doc.status === 'aprobado'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {doc.status === 'aprobado' ? 'Válido' : 'En Trámite'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rates */}
              <div className="p-3.5 bg-orange-50/50 rounded-xl border border-orange-200 text-xs space-y-1.5">
                <div className="font-bold text-orange-950">Estructura Tarifaria:</div>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div>Tarifa Base: <strong>{formatCOP(selectedCarrierDetail.basePrice)}</strong></div>
                  <div>Costo por Km: <strong>{formatCOP(selectedCarrierDetail.pricePerKm)}/km</strong></div>
                  <div>Piso sin ascensor: <strong>{formatCOP(selectedCarrierDetail.floorWithoutElevatorSurcharge)}/piso</strong></div>
                  <div>Ayudante extra: <strong>{formatCOP(selectedCarrierDetail.helperRate)}</strong></div>
                </div>
              </div>

              {/* CTA button */}
              <button
                onClick={() => {
                  onSelectCarrierForQuote(selectedCarrierDetail);
                  setSelectedCarrierDetail(null);
                }}
                className="w-full py-2.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-xs transition-colors"
              >
                Seleccionar para Cotizar Mi Mudanza
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
