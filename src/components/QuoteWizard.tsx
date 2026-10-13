import React, { useState, useId } from 'react';
import {
  MapPin,
  Building,
  Home,
  Warehouse,
  Truck,
  Plus,
  Minus,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  ArrowLeft,
  DollarSign,
  PackageCheck,
  Sparkles,
  Info
} from 'lucide-react';
import { CARIBE_CITIES, INVENTORY_CATALOG, calculateDistanceAndCost } from '../data/mockData';
import { PropertyType, VehicleType, InventoryItem, Carrier, MoveOrder } from '../types';
import { RouteMapVisualizer } from './RouteMapVisualizer';

interface QuoteWizardProps {
  carriers: Carrier[];
  onOrderCreated: (newOrder: MoveOrder) => void;
  onOpenPrivacyModal: () => void;
  hasAcceptedPrivacy: boolean;
}

export const QuoteWizard: React.FC<QuoteWizardProps> = ({
  carriers,
  onOrderCreated,
  onOpenPrivacyModal,
  hasAcceptedPrivacy,
}) => {
  const originCityId = useId();
  const destCityId = useId();
  const originFloorId = useId();
  const destFloorId = useId();
  // Wizard steps: 1. Rutas e Inmuebles, 2. Inventario & Volumen, 3. Transportista & Desglose, 4. Confirmación
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Locations & Property
  const [originCity, setOriginCity] = useState('Barranquilla');
  const [originAddress, setOriginAddress] = useState('Carrera 53 # 82-140, Alto Prado');
  const [destCity, setDestCity] = useState('Cartagena');
  const [destAddress, setDestAddress] = useState('Avenida San Martín # 6-32, Bocagrande');

  const [propertyType, setPropertyType] = useState<PropertyType>('apartamento');
  const [originFloor, setOriginFloor] = useState(3);
  const [originElevator, setOriginElevator] = useState(true);
  const [destFloor, setDestFloor] = useState(2);
  const [destElevator, setDestElevator] = useState(false);

  // Step 2: Inventory & Items
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({
    cama_king: 1,
    sofa_3: 1,
    nevera_grande: 1,
    caja_grande: 8,
    caja_vajilla: 2,
    tv_pantalla: 1,
  });

  // Services
  const [helpersCount, setHelpersCount] = useState(2);
  const [packingService, setPackingService] = useState(true);
  const [disassemblyService, setDisassemblyService] = useState(false);
  const [expressInsurance, setExpressInsurance] = useState(true);

  // Step 3: Selected Carrier
  const [selectedCarrierId, setSelectedCarrierId] = useState<string>(carriers[0]?.id || 'car-1');

  // Client info for checkout
  const [clientName, setClientName] = useState('Cliente Caribe Express');
  const [clientPhone, setClientPhone] = useState('+57 301 849 2011');
  const [scheduledDate, setScheduledDate] = useState('2026-10-18');
  const [scheduledTime, setScheduledTime] = useState('08:30 AM');
  const [orderNotes, setOrderNotes] = useState('Por favor llegar puntual con mantas protectoras.');

  // Generated order state
  const [completedOrder, setCompletedOrder] = useState<MoveOrder | null>(null);

  // Calculate total inventory volume
  const totalVolumeM3 = Object.entries(selectedItems).reduce((sum, [itemId, count]) => {
    const catalogItem = INVENTORY_CATALOG.find((it) => it.id === itemId);
    return sum + (catalogItem?.volumeM3 || 0) * count;
  }, 0);

  // Determine suggested vehicle based on volume
  let suggestedVehicle: VehicleType = 'pickup';
  if (totalVolumeM3 > 25) {
    suggestedVehicle = 'camion_grande';
  } else if (totalVolumeM3 > 14) {
    suggestedVehicle = 'camion_turbo';
  } else if (totalVolumeM3 > 6) {
    suggestedVehicle = 'furgon';
  }

  // Active carrier object
  const activeCarrier = carriers.find((c) => c.id === selectedCarrierId) || carriers[0];

  // Run pricing engine
  const calculation = calculateDistanceAndCost(
    originCity,
    destCity,
    suggestedVehicle,
    originFloor,
    originElevator,
    destFloor,
    destElevator,
    helpersCount,
    packingService,
    disassemblyService,
    expressInsurance,
    activeCarrier
  );

  const handleItemCountChange = (itemId: string, delta: number) => {
    setSelectedItems((prev) => {
      const current = prev[itemId] || 0;
      const next = Math.max(0, current + delta);
      const updated = { ...prev };
      if (next === 0) {
        delete updated[itemId];
      } else {
        updated[itemId] = next;
      }
      return updated;
    });
  };

  const handleConfirmReservation = () => {
    if (!hasAcceptedPrivacy) {
      onOpenPrivacyModal();
      return;
    }

    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const trackingCode = `CRB-${randomNum}`;

    const inventoryList: InventoryItem[] = Object.entries(selectedItems).map(([id, count]) => {
      const cat = INVENTORY_CATALOG.find((i) => i.id === id)!;
      return {
        id,
        name: cat.name,
        category: cat.category,
        volumeM3: cat.volumeM3,
        count,
        isFragile: cat.isFragile,
      };
    });

    const newOrder: MoveOrder = {
      id: `ord-${Date.now()}`,
      trackingCode,
      clientId: 'usr-current',
      clientName,
      clientPhone,
      carrierId: activeCarrier.id,
      carrierName: activeCarrier.companyName,
      carrierPhone: activeCarrier.phone,
      carrierVehiclePlate: activeCarrier.vehiclePlate,
      status: 'cotizado',
      scheduledDate,
      scheduledTime,
      quote: {
        origin: {
          city: originCity,
          address: originAddress,
          lat: CARIBE_CITIES.find((c) => c.name === originCity)?.lat || 10.9685,
          lng: CARIBE_CITIES.find((c) => c.name === originCity)?.lng || -74.7813,
        },
        destination: {
          city: destCity,
          address: destAddress,
          lat: CARIBE_CITIES.find((c) => c.name === destCity)?.lat || 10.3910,
          lng: CARIBE_CITIES.find((c) => c.name === destCity)?.lng || -75.4794,
        },
        propertyType,
        originFloor,
        originHasElevator: originElevator,
        destinationFloor: destFloor,
        destinationHasElevator: destElevator,
        inventory: inventoryList,
        suggestedVehicle,
        distanceKm: calculation.distanceKm,
        estimatedMinutes: calculation.estimatedMinutes,
        tollCount: calculation.tollCount,
        additionalServices: {
          helpersCount,
          packingService,
          disassemblyService,
          expressInsurance,
        },
        breakdown: calculation.breakdown,
      },
      timeline: [
        {
          status: 'cotizado',
          timestamp: 'Hoy, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          title: 'Cotización Confirmada con Éxito',
          description: `El servicio ha sido reservado con ${activeCarrier.companyName}. Transportista notificado.`,
        },
      ],
      notes: orderNotes,
    };

    setCompletedOrder(newOrder);
    onOrderCreated(newOrder);
    setStep(4);
  };

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Wizard Step Progress Tracker */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="grid grid-cols-4 gap-2">
          {[
            { num: 1, title: 'Ruta e Inmueble', desc: 'Origen, destino y pisos' },
            { num: 2, title: 'Inventario & Volumen', desc: 'Objetos y vehículo' },
            { num: 3, title: 'Transportista & Tarifa', desc: 'Desglose y servicios' },
            { num: 4, title: 'Confirmación', desc: 'Reserva y seguimiento' },
          ].map((s) => (
            <button
              key={s.num}
              onClick={() => {
                if (s.num <= 3 && !completedOrder) setStep(s.num as any);
              }}
              className={`p-2.5 rounded-xl text-left transition-colors flex items-center gap-3 ${
                step === s.num
                  ? 'bg-orange-50 border border-orange-200 text-orange-950'
                  : step > s.num
                  ? 'bg-slate-50 text-slate-800'
                  : 'text-slate-400 opacity-60'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                  step === s.num
                    ? 'bg-orange-500 text-white'
                    : step > s.num
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {step > s.num ? '✓' : s.num}
              </div>
              <div className="hidden sm:block min-w-0">
                <div className="text-xs font-bold truncate">{s.title}</div>
                <div className="text-[10px] text-slate-500 truncate">{s.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* STEP 1: ROUTE & PROPERTY */}
      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Form inputs */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Paso 1: Rutas de Origen, Destino y Tipo de Inmueble
              </h2>
              <p className="text-xs text-slate-500">
                Calculamos la distancia exacta y los recargos de acceso para ofrecerte la tarifa más justa y transparente.
              </p>
            </div>

            {/* Origin & Destination inputs */}
            <div className="space-y-4">
              {/* Origin */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
                    Punto de Carga (Origen)
                  </span>
                  <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded">
                    Costa Caribe
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label htmlFor={originCityId} className="block text-[11px] font-medium text-slate-600 mb-1">Ciudad</label>
                    <select
                      id={originCityId}
                      value={originCity}
                      onChange={(e) => setOriginCity(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    >
                      {CARIBE_CITIES.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name} ({c.department})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Dirección exacta o Barrio
                    </label>
                    <input
                      type="text"
                      value={originAddress}
                      onChange={(e) => setOriginAddress(e.target.value)}
                      placeholder="Ej. Cra 53 # 82-140, Alto Prado"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Destination */}
              <div className="p-4 bg-orange-50/40 rounded-xl border border-orange-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-orange-950 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />
                    Punto de Descarga (Destino)
                  </span>
                  <span className="text-[10px] text-orange-700 font-semibold bg-orange-100/60 px-2 py-0.5 rounded">
                    Llegada Segura
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label htmlFor={destCityId} className="block text-[11px] font-medium text-slate-600 mb-1">Ciudad</label>
                    <select
                      id={destCityId}
                      value={destCity}
                      onChange={(e) => setDestCity(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    >
                      {CARIBE_CITIES.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name} ({c.department})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Dirección exacta o Barrio
                    </label>
                    <input
                      type="text"
                      value={destAddress}
                      onChange={(e) => setDestAddress(e.target.value)}
                      placeholder="Ej. Av San Martín # 6-32, Bocagrande"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Property Types */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-900">
                Tipo de Inmueble
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'apartamento', label: 'Apartamento', icon: Building, desc: 'Pisos altos y ascensor' },
                  { id: 'casa', label: 'Casa', icon: Home, desc: 'Entrada directa o varios niveles' },
                  { id: 'bodega', label: 'Bodega / Oficina', icon: Warehouse, desc: 'Comercial o almacenamiento' },
                ].map((p) => {
                  const Icon = p.icon;
                  const isSelected = propertyType === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPropertyType(p.id as PropertyType)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-orange-500 bg-orange-50/50 ring-2 ring-orange-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mb-1.5 ${isSelected ? 'text-orange-600' : 'text-slate-500'}`} />
                      <div className="text-xs font-bold text-slate-900">{p.label}</div>
                      <div className="text-[10px] text-slate-500">{p.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Floor and Elevator Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-semibold text-slate-800 block">Acceso en Origen</span>
                <div className="flex items-center justify-between text-xs">
                  <label htmlFor={originFloorId} className="text-slate-600">Piso de Salida:</label>
                  <select
                    id={originFloorId}
                    value={originFloor}
                    onChange={(e) => setOriginFloor(Number(e.target.value))}
                    className="px-2 py-1 border border-slate-300 rounded bg-white font-medium"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20].map((f) => (
                      <option key={f} value={f}>Piso {f}</option>
                    ))}
                  </select>
                </div>
                <label className="flex items-center gap-2 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={originElevator}
                    onChange={(e) => setOriginElevator(e.target.checked)}
                    className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4"
                  />
                  <span className="text-[11px] text-slate-700">Cuenta con ascensor habilitado</span>
                </label>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-semibold text-slate-800 block">Acceso en Destino</span>
                <div className="flex items-center justify-between text-xs">
                  <label htmlFor={destFloorId} className="text-slate-600">Piso de Llegada:</label>
                  <select
                    id={destFloorId}
                    value={destFloor}
                    onChange={(e) => setDestFloor(Number(e.target.value))}
                    className="px-2 py-1 border border-slate-300 rounded bg-white font-medium"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20].map((f) => (
                      <option key={f} value={f}>Piso {f}</option>
                    ))}
                  </select>
                </div>
                <label className="flex items-center gap-2 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={destElevator}
                    onChange={(e) => setDestElevator(e.target.checked)}
                    className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4"
                  />
                  <span className="text-[11px] text-slate-700">Cuenta con ascensor habilitado</span>
                </label>
              </div>
            </div>

            {/* Next button */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-xs transition-colors"
              >
                Siguiente: Seleccionar Inventario
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Map Preview on Right */}
          <div className="lg:col-span-5 space-y-4">
            <RouteMapVisualizer
              originCity={originCity}
              originAddress={originAddress}
              destCity={destCity}
              destAddress={destAddress}
              distanceKm={calculation.distanceKm}
              durationMinutes={calculation.estimatedMinutes}
              tollCount={calculation.tollCount}
            />

            <div className="p-4 bg-blue-50/70 border border-blue-200/80 rounded-2xl text-xs space-y-2 text-slate-700">
              <div className="font-semibold text-blue-950 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-blue-600" />
                Optimización de Ruta por Inteligencia Logística
              </div>
              <p className="text-[11px] leading-relaxed text-blue-900/80">
                Nuestro motor de rutas valida la geocodificación y sugiere el trayecto más seguro, 
                evitando cierres viales y evaluando el tráfico en los peajes del corredor norte (Marahuaco, Papiros, Tasajera).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: INVENTORY & LOAD VOLUMETRIC CALCULATION */}
      {step === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Paso 2: Inventario de Carga y Estimación Volumétrica
                </h2>
                <p className="text-xs text-slate-500">
                  Selecciona los objetos que vas a transportar para calcular el cubicaje en metros cúbicos (m³).
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Volumen Calculado</span>
                <span className="text-lg font-extrabold text-orange-600 tabular-nums">
                  {totalVolumeM3.toFixed(1)} m³
                </span>
              </div>
            </div>

            {/* Inventory categories */}
            <div className="space-y-4">
              {['muebles', 'electrodomesticos', 'cajas', 'otros'].map((catKey) => {
                const items = INVENTORY_CATALOG.filter((i) => i.category === catKey);
                const categoryNames: Record<string, string> = {
                  muebles: '🛋️ Muebles Principales y Alcobas',
                  electrodomesticos: '🔌 Línea Blanca y Electrodomésticos',
                  cajas: '📦 Cajas, Enseres y Cristalería',
                  otros: '🚲 Transporte Ligero y Cuadros',
                };
                return (
                  <div key={catKey} className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-800 border-b border-slate-200">
                      {categoryNames[catKey]}
                    </div>
                    <div className="divide-y divide-slate-100">
                      {items.map((item) => {
                        const count = selectedItems[item.id] || 0;
                        return (
                          <div
                            key={item.id}
                            className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-50/60 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <div>
                                <span className="text-xs font-medium text-slate-900 block">
                                  {item.name}
                                </span>
                                <span className="text-[10px] text-slate-500">
                                  ~{item.volumeM3} m³ {item.isFragile && '· ⚠️ Delicado / Frágil'}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleItemCountChange(item.id, -1)}
                                disabled={count === 0}
                                className="w-7 h-7 rounded-lg border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-6 text-center text-xs font-bold text-slate-900 tabular-nums">
                                {count}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleItemCountChange(item.id, 1)}
                                className="w-7 h-7 rounded-lg bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 shadow-xs"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Additional logistics services */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold text-slate-900">
                Servicios Adicionales Requeridos
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Helpers count */}
                <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-800 block">Ayudantes de Carga</span>
                    <span className="text-[10px] text-slate-500">+${formatCOP(activeCarrier.helperRate)} c/u</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {[0, 1, 2, 3].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setHelpersCount(num)}
                        className={`w-6 h-6 rounded text-xs font-bold ${
                          helpersCount === num
                            ? 'bg-orange-600 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Packing service */}
                <label className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="font-semibold text-slate-800 block">Embalaje con Mantas y Vinipel</span>
                    <span className="text-[10px] text-slate-500">Protección especial de muebles</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={packingService}
                    onChange={(e) => setPackingService(e.target.checked)}
                    className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4"
                  />
                </label>

                {/* Disassembly service */}
                <label className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="font-semibold text-slate-800 block">Desarme y Arme de Camas</span>
                    <span className="text-[10px] text-slate-500">Herramientas especializadas</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={disassemblyService}
                    onChange={(e) => setDisassemblyService(e.target.checked)}
                    className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4"
                  />
                </label>

                {/* Insurance service */}
                <label className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="font-semibold text-slate-800 block">Seguro Express de Carga</span>
                    <span className="text-[10px] text-slate-500">Póliza hasta $30,000,000 COP</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={expressInsurance}
                    onChange={(e) => setExpressInsurance(e.target.checked)}
                    className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4"
                  />
                </label>
              </div>
            </div>

            {/* Back / Next buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Regresar a Ruta
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-xs transition-colors"
              >
                Siguiente: Seleccionar Transportista
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Vehicle suggestion sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-md space-y-4">
              <div className="flex items-center gap-2 text-orange-400 text-xs font-semibold uppercase">
                <Truck className="w-4 h-4" />
                Vehículo Recomendado
              </div>

              <div>
                <h3 className="text-xl font-bold font-display">
                  {suggestedVehicle === 'pickup' && 'Camioneta Pick-up / Estacas'}
                  {suggestedVehicle === 'furgon' && 'Furgón Mediano (3.5 Ton)'}
                  {suggestedVehicle === 'camion_turbo' && 'Camión Turbo (4.5 a 5 Ton)'}
                  {suggestedVehicle === 'camion_grande' && 'Camión Grande Doble Troque (10 Ton)'}
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Ideal para {totalVolumeM3.toFixed(1)} m³ de enseres con suficiente holgura de seguridad y amarres.
                </p>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-xl text-xs space-y-1.5 border border-slate-700">
                <div className="flex justify-between text-slate-300">
                  <span>Capacidad máxima:</span>
                  <span className="font-bold text-white">
                    {suggestedVehicle === 'pickup' && '9 m³ / 1.8 T'}
                    {suggestedVehicle === 'furgon' && '18 m³ / 3.5 T'}
                    {suggestedVehicle === 'camion_turbo' && '26 m³ / 4.8 T'}
                    {suggestedVehicle === 'camion_grande' && '45 m³ / 10.0 T'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Protección climática:</span>
                  <span className="font-bold text-white">Carrocería furgonada / Carpa marina</span>
                </div>
              </div>
            </div>

            {/* Quick summary card */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2 text-xs">
              <div className="font-bold text-slate-900">Resumen del Servicio</div>
              <div className="space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span>Distancia:</span>
                  <span className="font-semibold text-slate-900">{calculation.distanceKm} km</span>
                </div>
                <div className="flex justify-between">
                  <span>Tiempo estimado:</span>
                  <span className="font-semibold text-slate-900">{Math.floor(calculation.estimatedMinutes / 60)}h {calculation.estimatedMinutes % 60}m</span>
                </div>
                <div className="flex justify-between">
                  <span>Ayudantes:</span>
                  <span className="font-semibold text-slate-900">{helpersCount} personas</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: CARRIER SELECTION & TRANSPARENT BREAKDOWN */}
      {step === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Paso 3: Transportistas Disponibles y Reserva
              </h2>
              <p className="text-xs text-slate-500">
                Selecciona al conductor o empresa verificada que ejecutará tu servicio.
              </p>
            </div>

            {/* Carriers list */}
            <div className="space-y-3">
              {carriers.map((c) => {
                const isSelected = c.id === selectedCarrierId;
                const carrierCost = calculateDistanceAndCost(
                  originCity,
                  destCity,
                  suggestedVehicle,
                  originFloor,
                  originElevator,
                  destFloor,
                  destElevator,
                  helpersCount,
                  packingService,
                  disassemblyService,
                  expressInsurance,
                  c
                );

                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCarrierId(c.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50/40 ring-2 ring-orange-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={c.photoUrl}
                        alt={c.companyName}
                        referrerPolicy="no-referrer"
                        className="w-16 h-14 object-cover rounded-lg border border-slate-200 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900">{c.companyName}</h4>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                            Verificado
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600">
                          {c.fullName} · {c.baseCity}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span className="text-amber-600 font-bold">★ {c.rating}</span>
                          <span>·</span>
                          <span>{c.totalTrips} viajes</span>
                          <span>·</span>
                          <span>Placa: {c.vehiclePlate}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right sm:shrink-0 w-full sm:w-auto flex sm:flex-col justify-between sm:justify-center items-center sm:items-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                      <span className="text-xs text-slate-500">Tarifa Estimada</span>
                      <span className="text-sm font-extrabold text-slate-900 tabular-nums">
                        {formatCOP(carrierCost.breakdown.total)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Schedule date & Client information */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-900">Fecha y Datos de Contacto</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Teléfono Móvil (WhatsApp)</label>
                  <input
                    type="text"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Fecha de la Mudanza</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Hora Estimada</label>
                  <select
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="07:00 AM">07:00 AM</option>
                    <option value="08:30 AM">08:30 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="01:30 PM">01:30 PM</option>
                    <option value="03:00 PM">03:00 PM</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-slate-600 mb-1 text-xs">Instrucciones o Notas Especiales</label>
                <input
                  type="text"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Ej. Cuidado especial con televisor o escaleras"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-xs"
                />
              </div>
            </div>

            {/* Back / Confirm buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Regresar a Inventario
              </button>
              <button
                type="button"
                onClick={handleConfirmReservation}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-xs transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirmar y Reservar Mudanza
              </button>
            </div>
          </div>

          {/* Pricing breakdown sidebar */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                Desglose Algorítmico Transparente
              </h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Tarifa Base del Vehículo:</span>
                <span className="font-semibold text-slate-900 tabular-nums">
                  {formatCOP(calculation.breakdown.baseRate)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>
                  Recorrido ({calculation.distanceKm} km x ${formatCOP(activeCarrier.pricePerKm)}):
                </span>
                <span className="font-semibold text-slate-900 tabular-nums">
                  {formatCOP(calculation.breakdown.distanceCost)}
                </span>
              </div>
              {calculation.breakdown.stairSurcharge > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Recargo pisos sin ascensor:</span>
                  <span className="font-semibold text-orange-600 tabular-nums">
                    {formatCOP(calculation.breakdown.stairSurcharge)}
                  </span>
                </div>
              )}
              {calculation.breakdown.helpersCost > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>{helpersCount} Ayudantes de carga:</span>
                  <span className="font-semibold text-slate-900 tabular-nums">
                    {formatCOP(calculation.breakdown.helpersCost)}
                  </span>
                </div>
              )}
              {calculation.breakdown.packingCost > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Embalaje y protección:</span>
                  <span className="font-semibold text-slate-900 tabular-nums">
                    {formatCOP(calculation.breakdown.packingCost)}
                  </span>
                </div>
              )}
              {calculation.breakdown.insuranceCost > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Póliza Seguro Express:</span>
                  <span className="font-semibold text-slate-900 tabular-nums">
                    {formatCOP(calculation.breakdown.insuranceCost)}
                  </span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-900">Total Cotizado</span>
                <span className="text-2xl font-black text-orange-600 tabular-nums">
                  {formatCOP(calculation.breakdown.total)}
                </span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 space-y-1">
              <div className="font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                Garantía Caribe Express
              </div>
              <p>
                Sin costos ocultos ni sorpresas de último minuto. Tu precio está protegido por contrato digital de transporte.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: ORDER CONFIRMED & TRACKING GENERATED */}
      {step === 4 && completedOrder && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center max-w-2xl mx-auto space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-2xl mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs uppercase font-bold text-orange-600 tracking-wider">
              ¡Mudanza Registrada con Éxito!
            </span>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">
              Código de Seguimiento Oficial
            </h2>
            <div className="mt-2 inline-block px-4 py-2 bg-slate-900 text-orange-400 font-mono text-xl font-bold rounded-xl tracking-widest shadow-inner">
              {completedOrder.trackingCode}
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
            Hemos asignado tu mudanza a <strong>{completedOrder.carrierName}</strong>. 
            El conductor se comunicará al número <strong>{completedOrder.clientPhone}</strong> para coordinar detalles previos de la llegada.
          </p>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-2">
            <div className="flex justify-between border-b border-slate-200 pb-1.5">
              <span className="text-slate-500">Origen:</span>
              <span className="font-semibold text-slate-900">{completedOrder.quote.origin.address} ({completedOrder.quote.origin.city})</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1.5">
              <span className="text-slate-500">Destino:</span>
              <span className="font-semibold text-slate-900">{completedOrder.quote.destination.address} ({completedOrder.quote.destination.city})</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1.5">
              <span className="text-slate-500">Fecha y Hora:</span>
              <span className="font-semibold text-slate-900">{completedOrder.scheduledDate} a las {completedOrder.scheduledTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total a Pagar:</span>
              <span className="font-bold text-orange-600">{formatCOP(completedOrder.quote.breakdown.total)}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setCompletedOrder(null);
                setStep(1);
              }}
              className="px-5 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Nueva Cotización
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
