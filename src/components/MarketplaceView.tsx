import React, { useState, useEffect } from 'react';
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
  ChevronLeft,
  ChevronRight,
  FileText
} from 'lucide-react';
import { Carrier, VehicleType } from '../types';
import { CARIBE_CITIES } from '../data/mockData';

interface MarketplaceViewProps {
  carriers: Carrier[];
  onSelectCarrierForQuote: (carrier: Carrier) => void;
}

// Catálogo curado de imágenes de alta resolución de camiones, furgones y camionetas automotrices
const VEHICLE_FALLBACK_IMAGES: Record<VehicleType, string[]> = {
  pickup: [
    'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=80',
  ],
  furgon: [
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1549194388-2469d59ec75c?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=800&auto=format&fit=crop&q=80',
  ],
  camion_turbo: [
    'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?w=800&auto=format&fit=crop&q=80',
  ],
  camion_grande: [
    'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1501700493788-fa1a4fc9fe62?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1592838064575-70ed626d3a0e?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800&auto=format&fit=crop&q=80',
  ],
};

// Función para obtener siempre una imagen de vehículo automotor
function getCarrierVehiclePhoto(carrier: Carrier): string {
  const photo = carrier.photoUrl || '';
  const isPersonPortrait =
    !photo ||
    photo.includes('randomuser.me') ||
    photo.includes('portrait') ||
    photo.includes('ui-avatars.com') ||
    photo.includes('moving_crew_professional') ||
    photo.includes('warehouse_logistics_hub');

  if (isPersonPortrait) {
    const vType = carrier.vehicleType || 'camion_turbo';
    const list = VEHICLE_FALLBACK_IMAGES[vType] || VEHICLE_FALLBACK_IMAGES.camion_turbo;
    let hash = 0;
    for (let i = 0; i < carrier.id.length; i++) {
      hash = (hash << 5) - hash + carrier.id.charCodeAt(i);
      hash |= 0;
    }
    const idx = Math.abs(hash) % list.length;
    return list[idx];
  }

  return photo;
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

  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const filteredCarriers = carriers.filter((c) => {
    const matchesSearch =
      c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.vehicleModel.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCity =
      selectedCity === 'all' ||
      c.baseCity.toLowerCase() === selectedCity.toLowerCase() ||
      c.coverageZones.includes(selectedCity);
    const matchesVehicle = selectedVehicleType === 'all' || c.vehicleType === selectedVehicleType;
    const matchesVerified = !onlyVerified || c.verificationStatus === 'verificado';

    return matchesSearch && matchesCity && matchesVehicle && matchesVerified;
  });

  // Al cambiar filtros o tamaño de página, regresar a la página 1
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCity, selectedVehicleType, onlyVerified, pageSize]);

  // Cálculos de paginación
  const totalItems = filteredCarriers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedCarriers = filteredCarriers.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      const el = document.getElementById('marketplace-grid-start');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // Generar lista de páginas para mostrar con elipsis si son muchas
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val);
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

        {/* Quick pill toggle for verified and Results Count */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1 border-t border-slate-100">
          <label className="flex items-center gap-2 cursor-pointer text-slate-700">
            <input
              type="checkbox"
              checked={onlyVerified}
              onChange={(e) => setOnlyVerified(e.target.checked)}
              className="w-4 h-4 text-orange-600 rounded border-slate-300 focus:ring-orange-500"
            />
            <span className="font-medium">Mostrar solo con Documentos Validados (SOAT, RUT, RTM)</span>
          </label>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-slate-500">
              <span>Por página:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="px-2 py-1 text-xs border border-slate-300 rounded-lg bg-white font-semibold text-slate-700"
              >
                <option value={6}>6</option>
                <option value={9}>9</option>
                <option value={12}>12</option>
              </select>
            </div>
            <span className="text-slate-500 font-medium">
              {totalItems} transportistas encontrados
            </span>
          </div>
        </div>
      </div>

      {/* Anchor for smooth scroll when paginating */}
      <div id="marketplace-grid-start" className="scroll-mt-24" />

      {/* Carriers Grid */}
      {paginatedCarriers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <Truck className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No se encontraron transportistas</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Prueba ajustando los filtros de ciudad o tipo de vehículo para ver más opciones en la flota.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedCarriers.map((carrier) => {
            const isVerified = carrier.verificationStatus === 'verificado';
            const vehiclePhoto = getCarrierVehiclePhoto(carrier);

            return (
              <div
                key={carrier.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:border-slate-300 transition-all group"
              >
                {/* Photo Container: Foto del Vehículo Automotor */}
                <div className="relative h-44 bg-slate-900 overflow-hidden">
                  <img
                    src={vehiclePhoto}
                    alt={carrier.vehicleModel || carrier.companyName}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      // Fallback en caso de error de red
                      const target = e.target as HTMLImageElement;
                      target.src = VEHICLE_FALLBACK_IMAGES[carrier.vehicleType]?.[0] || VEHICLE_FALLBACK_IMAGES.camion_turbo[0];
                    }}
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
                  <div className="absolute bottom-3 left-3 bg-slate-900/85 backdrop-blur-md px-2.5 py-1 rounded-lg text-white text-[11px] font-medium flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-orange-400" />
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
                        <span className="font-medium text-slate-900 truncate max-w-[170px]" title={carrier.vehicleModel}>
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
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-500 font-medium">
            Mostrando <strong className="text-slate-900">{startIndex + 1}</strong> -{' '}
            <strong className="text-slate-900">{endIndex}</strong> de{' '}
            <strong className="text-slate-900">{totalItems}</strong> transportistas
          </div>

          <div className="flex items-center gap-1.5">
            {/* Botón Anterior */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed transition-colors flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Anterior</span>
            </button>

            {/* Números de página */}
            <div className="flex items-center gap-1">
              {getPageNumbers().map((page, idx) => {
                if (page === '...') {
                  return (
                    <span key={`dots-${idx}`} className="px-2 py-1 text-slate-400">
                      ...
                    </span>
                  );
                }
                const pageNum = Number(page);
                const isActive = pageNum === currentPage;
                return (
                  <button
                    key={`page-${pageNum}`}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-8 h-8 rounded-xl font-bold transition-all text-xs ${
                      isActive
                        ? 'bg-orange-600 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            {/* Botón Siguiente */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed transition-colors flex items-center gap-1"
            >
              <span>Siguiente</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Carrier Detail Modal */}
      {selectedCarrierDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="relative h-48 bg-slate-900">
              <img
                src={getCarrierVehiclePhoto(selectedCarrierDetail)}
                alt={selectedCarrierDetail.vehicleModel || selectedCarrierDetail.companyName}
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
                <span className="font-bold text-slate-900 block">Vehículo Asignado:</span>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                  <p className="font-semibold text-slate-800">{selectedCarrierDetail.vehicleModel}</p>
                  <p className="text-slate-500">Placa: <strong className="font-mono text-slate-800">{selectedCarrierDetail.vehiclePlate}</strong> · Capacidad: <strong>{selectedCarrierDetail.capacityKg} kg / {selectedCarrierDetail.volumeM3} m³</strong></p>
                </div>
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
