import { Carrier, MoveOrder, Dispute, PrivacyConsentRecord, InventoryItem, LocationPoint, VehicleType } from '../types';

export const CARIBE_CITIES: Array<{
  name: string;
  department: string;
  lat: number;
  lng: number;
  popularDistricts: string[];
}> = [
  {
    name: 'Barranquilla',
    department: 'Atlántico',
    lat: 10.9685,
    lng: -74.7813,
    popularDistricts: ['El Prado', 'Riomar', 'Alto Prado', 'Villa Country', 'Norte-Centro Histórico', 'Boston', 'Ciudad Mallorquín'],
  },
  {
    name: 'Cartagena',
    department: 'Bolívar',
    lat: 10.3910,
    lng: -75.4794,
    popularDistricts: ['Bocagrande', 'Castillogrande', 'Manga', 'Crespo', 'Pie de la Popa', 'Castillo Grande', 'Serena del Mar'],
  },
  {
    name: 'Santa Marta',
    department: 'Magdalena',
    lat: 11.2408,
    lng: -74.1990,
    popularDistricts: ['El Rodadero', 'Bello Horizonte', 'Pozos Colorados', 'Centro Histórico', 'Bavaria', 'Taganga'],
  },
  {
    name: 'Valledupar',
    department: 'Cesar',
    lat: 10.4631,
    lng: -73.2532,
    popularDistricts: ['Los Cortijos', 'Novalito', 'Alfonso López', 'San Joaquín', 'Las Delicias'],
  },
  {
    name: 'Montería',
    department: 'Córdoba',
    lat: 8.7479,
    lng: -75.8814,
    popularDistricts: ['La Castellana', 'El Recreo', 'Monteverde', 'Pasatiempo', 'Costa de Oro'],
  },
  {
    name: 'Sincelejo',
    department: 'Sucre',
    lat: 9.3047,
    lng: -75.3978,
    popularDistricts: ['Venecia', 'La Ford', 'Boston', 'Majagual', 'Los Alpes'],
  },
  {
    name: 'Riohacha',
    department: 'La Guajira',
    lat: 11.5444,
    lng: -72.9072,
    popularDistricts: ['El Prado', 'Arriba', 'Coquivacoa', 'Centro Histórico', 'Entrerríos'],
  },
];

export const INVENTORY_CATALOG: Omit<InventoryItem, 'count'>[] = [
  { id: 'cama_king', name: 'Juego de Alcoba King / Queen', category: 'muebles', volumeM3: 2.2 },
  { id: 'cama_semi', name: 'Cama Sencilla / Semidoble', category: 'muebles', volumeM3: 1.2 },
  { id: 'sofa_3', name: 'Sofá de 3 Puestos en L', category: 'muebles', volumeM3: 2.5 },
  { id: 'sofa_2', name: 'Sofá de 2 Puestos', category: 'muebles', volumeM3: 1.4 },
  { id: 'comedor_6', name: 'Comedor de 6 Puestos + Sillas', category: 'muebles', volumeM3: 2.0 },
  { id: 'closet_desarmable', name: 'Armario / Clóset Desarmable', category: 'muebles', volumeM3: 1.8 },
  { id: 'escritorio_silla', name: 'Escritorio con Silla Ergonómica', category: 'muebles', volumeM3: 0.9 },
  { id: 'nevera_grande', name: 'Nevera No-Frost Grande (400L+)', category: 'electrodomesticos', volumeM3: 1.5, isFragile: true },
  { id: 'lavadora_secadora', name: 'Lavadora o Torre de Lavado', category: 'electrodomesticos', volumeM3: 1.1 },
  { id: 'tv_pantalla', name: 'Televisor Smart TV (55" a 75")', category: 'electrodomesticos', volumeM3: 0.4, isFragile: true },
  { id: 'microondas_airfryer', name: 'Microondas y Pequeños Electrodomésticos', category: 'electrodomesticos', volumeM3: 0.3, isFragile: true },
  { id: 'caja_grande', name: 'Caja Grande Ropa/Lencería (60x40x40 cm)', category: 'cajas', volumeM3: 0.12 },
  { id: 'caja_mediana', name: 'Caja Mediana Libros/Objetos (40x30x30 cm)', category: 'cajas', volumeM3: 0.06 },
  { id: 'caja_vajilla', name: 'Caja Reforzada Vajilla / Cristalería', category: 'cajas', volumeM3: 0.08, isFragile: true },
  { id: 'bicicleta_moto', name: 'Bicicleta / Moto scooter', category: 'otros', volumeM3: 1.3 },
  { id: 'espejo_cuadros', name: 'Cuadros de Arte / Espejos de Pared', category: 'otros', volumeM3: 0.4, isFragile: true },
];

export const MOCK_CARRIERS: Carrier[] = [
  {
    id: 'car-1',
    fullName: 'Jairo Mendoza Cárdenas',
    companyName: 'Transportes del Caribe S.A.S.',
    documentId: '901.442.819-3',
    phone: '+57 301 542 9811',
    email: 'operaciones@transportesdelcaribe.com.co',
    baseCity: 'Barranquilla',
    coverageZones: ['Barranquilla', 'Cartagena', 'Santa Marta', 'Valledupar'],
    vehicleType: 'camion_turbo',
    vehiclePlate: 'WLZ-832',
    vehicleModel: 'Chevrolet NHR Turbo 2023 con Furgón Aislado',
    capacityKg: 4500,
    volumeM3: 24,
    basePrice: 180000,
    pricePerKm: 2800,
    floorWithoutElevatorSurcharge: 25000,
    helperRate: 45000,
    rating: 4.95,
    totalTrips: 184,
    verificationStatus: 'verificado',
    documents: [
      { id: 'd-1', name: 'RUT DIAN', type: 'rut', status: 'aprobado', fileName: 'RUT_TransportesCaribe_2026.pdf' },
      { id: 'd-2', name: 'Licencia C2', type: 'licencia', status: 'aprobado', fileName: 'Licencia_C2_JMendoza.pdf', expiryDate: '2028-11-20' },
      { id: 'd-3', name: 'SOAT Vigente', type: 'soat', status: 'aprobado', fileName: 'SOAT_WLZ832_SegurosBolivar.pdf', expiryDate: '2027-04-15' },
      { id: 'd-4', name: 'Revisión Técnico-Mecánica', type: 'tecnomecanica', status: 'aprobado', fileName: 'RTM_CDA_DelSur.pdf', expiryDate: '2027-02-10' },
      { id: 'd-5', name: 'Tarjeta de Operación', type: 'tarjeta_operacion', status: 'aprobado', fileName: 'TO_Mintransporte_9912.pdf', expiryDate: '2027-08-30' },
    ],
    photoUrl: '/src/assets/images/hero_caribe_express_truck_1791928170503.jpg',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=160&auto=format&fit=crop&q=80',
    bio: 'Más de 12 años liderando mudanzas residenciales e intermunicipales con mantas acolchadas, cinchas de alta tensión y seguro todo riesgo.',
    availableNow: true,
  },
  {
    id: 'car-2',
    fullName: 'Carlos Alberto Marrugo',
    companyName: 'Mudanzas Costeña Express',
    documentId: '73.192.481',
    phone: '+57 310 789 4433',
    email: 'carlos.marrugo@costenaexpress.co',
    baseCity: 'Cartagena',
    coverageZones: ['Cartagena', 'Barranquilla', 'Turbaco', 'Sincelejo'],
    vehicleType: 'furgon',
    vehiclePlate: 'UFS-401',
    vehicleModel: 'Renault Master Furgón Gran Volumen 2022',
    capacityKg: 3500,
    volumeM3: 18,
    basePrice: 150000,
    pricePerKm: 2500,
    floorWithoutElevatorSurcharge: 20000,
    helperRate: 40000,
    rating: 4.88,
    totalTrips: 112,
    verificationStatus: 'verificado',
    documents: [
      { id: 'd-6', name: 'RUT Persona Natural', type: 'rut', status: 'aprobado', fileName: 'RUT_CMarrugo.pdf' },
      { id: 'd-7', name: 'Licencia C1', type: 'licencia', status: 'aprobado', fileName: 'Licencia_C1_Marrugo.pdf', expiryDate: '2029-01-10' },
      { id: 'd-8', name: 'SOAT Vigente', type: 'soat', status: 'aprobado', fileName: 'SOAT_UFS401.pdf', expiryDate: '2027-06-22' },
      { id: 'd-9', name: 'Revisión Técnico-Mecánica', type: 'tecnomecanica', status: 'aprobado', fileName: 'RTM_Cartagena_CDA.pdf', expiryDate: '2027-05-18' },
    ],
    photoUrl: '/src/assets/images/fleet_cargo_van_1791928170997.jpg',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
    bio: 'Especialista en traslados para apartamentos y casas en la bahía de Cartagena y corredor hacia Barranquilla. Cuidado extremo con vajilla y tecnología.',
    availableNow: true,
  },
  {
    id: 'car-3',
    fullName: 'Luis Fernando Daza (Don Lucho)',
    companyName: 'Fletes y Mudanzas Don Lucho',
    documentId: '85.492.301',
    phone: '+57 318 633 2190',
    email: 'donluchofletes@gmail.com',
    baseCity: 'Santa Marta',
    coverageZones: ['Santa Marta', 'Ciénaga', 'Barranquilla', 'Riohacha'],
    vehicleType: 'pickup',
    vehiclePlate: 'TLK-924',
    vehicleModel: 'Toyota Hilux Estacas con Carpa Impermeable Reforzada',
    capacityKg: 1800,
    volumeM3: 9,
    basePrice: 110000,
    pricePerKm: 2100,
    floorWithoutElevatorSurcharge: 18000,
    helperRate: 35000,
    rating: 4.79,
    totalTrips: 76,
    verificationStatus: 'verificado',
    documents: [
      { id: 'd-10', name: 'RUT DIAN', type: 'rut', status: 'aprobado', fileName: 'RUT_LDaza.pdf' },
      { id: 'd-11', name: 'Licencia C1', type: 'licencia', status: 'aprobado', fileName: 'Lic_LDaza_2026.pdf', expiryDate: '2027-09-14' },
      { id: 'd-12', name: 'SOAT Vigente', type: 'soat', status: 'aprobado', fileName: 'SOAT_TLK924.pdf', expiryDate: '2026-12-05' },
      { id: 'd-13', name: 'Revisión Técnico-Mecánica', type: 'tecnomecanica', status: 'aprobado', fileName: 'Tecno_SantaMarta.pdf', expiryDate: '2027-01-30' },
    ],
    photoUrl: '/src/assets/images/moving_crew_professional_1791928170545.jpg',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
    bio: 'Fletes rápidos, mudanzas de apartaestudios y oficinas medianas en Santa Marta, Taganga y El Rodadero con puntualidad garantizada.',
    availableNow: true,
  },
  {
    id: 'car-4',
    fullName: 'Roberto Guillén',
    companyName: 'Logística y Carga Tayrona S.A.S.',
    documentId: '900.892.115-1',
    phone: '+57 314 205 7799',
    email: 'contacto@logiticatayrona.com',
    baseCity: 'Valledupar',
    coverageZones: ['Valledupar', 'Barranquilla', 'Santa Marta', 'Riohacha', 'Montería'],
    vehicleType: 'camion_grande',
    vehiclePlate: 'KPR-712',
    vehicleModel: 'Hino 500 Camión de 10 Toneladas Carrocería Furgón Cerrado',
    capacityKg: 10000,
    volumeM3: 45,
    basePrice: 320000,
    pricePerKm: 3400,
    floorWithoutElevatorSurcharge: 30000,
    helperRate: 50000,
    rating: 4.96,
    totalTrips: 245,
    verificationStatus: 'verificado',
    documents: [
      { id: 'd-14', name: 'RUT Cámara de Comercio', type: 'rut', status: 'aprobado', fileName: 'RUT_Tayrona_2026.pdf' },
      { id: 'd-15', name: 'Licencia C3', type: 'licencia', status: 'aprobado', fileName: 'Lic_C3_RGuillen.pdf', expiryDate: '2028-04-12' },
      { id: 'd-16', name: 'SOAT Vigente', type: 'soat', status: 'aprobado', fileName: 'SOAT_KPR712.pdf', expiryDate: '2027-03-29' },
      { id: 'd-17', name: 'Revisión Técnico-Mecánica', type: 'tecnomecanica', status: 'aprobado', fileName: 'RTM_Tayrona_Valledupar.pdf', expiryDate: '2027-02-18' },
    ],
    photoUrl: '/src/assets/images/warehouse_logistics_hub_1791928171147.jpg',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80',
    bio: 'Mudanzas de casas completas de gran tamaño, bodegas y oficinas interdepartamentales por todo el Caribe colombiano.',
    availableNow: false,
  },
  {
    id: 'car-5',
    fullName: 'Álvaro Echeverría',
    companyName: 'Transportes Rápidos del Sinú',
    documentId: '15.684.992',
    phone: '+57 320 891 0022',
    email: 'alvaro.echeverria@sinuexpress.co',
    baseCity: 'Montería',
    coverageZones: ['Montería', 'Sincelejo', 'Cartagena'],
    vehicleType: 'camion_turbo',
    vehiclePlate: 'MKV-503',
    vehicleModel: 'Foton Aumark Turbo 2024 Furgón',
    capacityKg: 4000,
    volumeM3: 20,
    basePrice: 175000,
    pricePerKm: 2700,
    floorWithoutElevatorSurcharge: 22000,
    helperRate: 40000,
    rating: 4.82,
    totalTrips: 63,
    verificationStatus: 'en_revision',
    documents: [
      { id: 'd-18', name: 'RUT Persona Natural', type: 'rut', status: 'aprobado', fileName: 'RUT_AEcheverria.pdf' },
      { id: 'd-19', name: 'Licencia C2', type: 'licencia', status: 'en_revision', fileName: 'Lic_Renovacion_Tramite.pdf', feedback: 'Pendiente copia del reverso de la licencia' },
      { id: 'd-20', name: 'SOAT Vigente', type: 'soat', status: 'aprobado', fileName: 'SOAT_MKV503.pdf', expiryDate: '2026-11-20' },
      { id: 'd-21', name: 'Revisión Técnico-Mecánica', type: 'tecnomecanica', status: 'aprobado', fileName: 'RTM_Monteria_2026.pdf', expiryDate: '2027-01-14' },
    ],
    photoUrl: '/src/assets/images/fleet_cargo_van_1791928170997.jpg',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=160&auto=format&fit=crop&q=80',
    bio: 'Servicios en el eje Montería - Sincelejo y conexión con la costa Caribe. Vehículo modelo reciente con rastreo GPS.',
    availableNow: true,
  },
];

export const MOCK_ORDERS: MoveOrder[] = [
  {
    id: 'ord-101',
    trackingCode: 'CRB-84920',
    clientId: 'usr-cliente-1',
    clientName: 'Andrea Paola Vergara',
    clientPhone: '+57 300 241 8890',
    carrierId: 'car-1',
    carrierName: 'Jairo Mendoza Cárdenas (Transportes del Caribe)',
    carrierPhone: '+57 301 542 9811',
    carrierVehiclePlate: 'WLZ-832',
    status: 'en_ruta',
    currentLocation: {
      lat: 10.7512,
      lng: -74.9821,
      description: 'Km 42 Vía al Mar (Entre Puerto Colombia y Barranquilla)',
    },
    scheduledDate: '2026-10-14',
    scheduledTime: '08:00 AM',
    quote: {
      origin: {
        address: 'Carrera 53 # 82-140, Edificio Prado Norte',
        city: 'Barranquilla',
        lat: 11.0041,
        lng: -74.8123,
      },
      destination: {
        address: 'Avenida San Martín # 6-32, Bocagrande',
        city: 'Cartagena',
        lat: 10.4002,
        lng: -75.5562,
      },
      propertyType: 'apartamento',
      originFloor: 5,
      originHasElevator: true,
      destinationFloor: 3,
      destinationHasElevator: true,
      suggestedVehicle: 'camion_turbo',
      distanceKm: 118,
      estimatedMinutes: 125,
      tollCount: 2,
      inventory: [
        { id: 'cama_king', name: 'Juego de Alcoba King', category: 'muebles', volumeM3: 2.2, count: 1 },
        { id: 'sofa_3', name: 'Sofá de 3 Puestos', category: 'muebles', volumeM3: 2.5, count: 1 },
        { id: 'nevera_grande', name: 'Nevera No-Frost Grande', category: 'electrodomesticos', volumeM3: 1.5, count: 1, isFragile: true },
        { id: 'caja_grande', name: 'Cajas Grandes', category: 'cajas', volumeM3: 0.12, count: 12 },
      ],
      additionalServices: {
        helpersCount: 2,
        packingService: true,
        disassemblyService: true,
        expressInsurance: true,
      },
      breakdown: {
        baseRate: 180000,
        distanceCost: 330400,
        stairSurcharge: 0,
        helpersCost: 90000,
        packingCost: 75000,
        insuranceCost: 35000,
        total: 710400,
      },
    },
    timeline: [
      { status: 'cotizado', timestamp: '14 Oct 06:30 AM', title: 'Cotización Aprobada', description: 'El cliente confirmó la reserva con el transportista asignado.' },
      { status: 'hacia_origen', timestamp: '14 Oct 07:15 AM', title: 'Camión en Camino a Origen', description: 'El conductor inició desplazamiento hacia Cra 53 # 82-140.' },
      { status: 'cargando', timestamp: '14 Oct 08:05 AM', title: 'Carga y Embalaje Completados', description: 'Inventario asegurado con mantas y correas protectoras.' },
      { status: 'en_ruta', timestamp: '14 Oct 09:40 AM', title: 'En Tránsito Intermunicipal', description: 'Vehículo en desplazamiento por Vía al Mar hacia Bocagrande.' },
    ],
    notes: 'Manejar con precaución juego de copas de cristal en caja marcada.',
  },
  {
    id: 'ord-102',
    trackingCode: 'CRB-31054',
    clientId: 'usr-cliente-2',
    clientName: 'Santiago Morales Pineda',
    clientPhone: '+57 315 902 4410',
    carrierId: 'car-2',
    carrierName: 'Carlos Alberto Marrugo (Mudanzas Costeña)',
    carrierPhone: '+57 310 789 4433',
    carrierVehiclePlate: 'UFS-401',
    status: 'completado',
    scheduledDate: '2026-10-12',
    scheduledTime: '10:00 AM',
    quote: {
      origin: {
        address: 'Calle 32 # 11-45, Barrio Manga',
        city: 'Cartagena',
        lat: 10.4120,
        lng: -75.5340,
      },
      destination: {
        address: 'Carrera 1 # 18-90, El Rodadero',
        city: 'Santa Marta',
        lat: 11.2023,
        lng: -74.2250,
      },
      propertyType: 'apartamento',
      originFloor: 2,
      originHasElevator: false,
      destinationFloor: 1,
      destinationHasElevator: true,
      suggestedVehicle: 'furgon',
      distanceKm: 226,
      estimatedMinutes: 235,
      tollCount: 3,
      inventory: [
        { id: 'cama_semi', name: 'Cama Semidoble', category: 'muebles', volumeM3: 1.2, count: 1 },
        { id: 'escritorio_silla', name: 'Escritorio con Silla', category: 'muebles', volumeM3: 0.9, count: 1 },
        { id: 'tv_pantalla', name: 'Smart TV 55"', category: 'electrodomesticos', volumeM3: 0.4, count: 1, isFragile: true },
        { id: 'caja_mediana', name: 'Cajas Medianas', category: 'cajas', volumeM3: 0.06, count: 8 },
      ],
      additionalServices: {
        helpersCount: 1,
        packingService: false,
        disassemblyService: false,
        expressInsurance: true,
      },
      breakdown: {
        baseRate: 150000,
        distanceCost: 565000,
        stairSurcharge: 20000,
        helpersCost: 40000,
        packingCost: 0,
        insuranceCost: 25000,
        total: 800000,
      },
    },
    timeline: [
      { status: 'cotizado', timestamp: '12 Oct 08:00 AM', title: 'Cotización Generada', description: 'Servicio solicitado por el cliente.' },
      { status: 'cargando', timestamp: '12 Oct 10:10 AM', title: 'Carga Realizada', description: 'Muebles asegurados en furgón.' },
      { status: 'en_ruta', timestamp: '12 Oct 11:30 AM', title: 'En Tránsito', description: 'Recorrido por Troncal del Caribe.' },
      { status: 'completado', timestamp: '12 Oct 03:45 PM', title: 'Entrega Exitosa', description: 'Mercancía recibida a conformidad en Santa Marta.' },
    ],
    rating: 5,
    clientReview: 'Excelente servicio. Muy puntuales y cuidaron el televisor con muchísimo esmero.',
  },
  {
    id: 'ord-103',
    trackingCode: 'CRB-19402',
    clientId: 'usr-cliente-3',
    clientName: 'María Fernanda Gómez',
    clientPhone: '+57 302 443 1120',
    carrierId: 'car-3',
    carrierName: 'Luis Fernando Daza (Don Lucho)',
    carrierPhone: '+57 318 633 2190',
    carrierVehiclePlate: 'TLK-924',
    status: 'asignado',
    scheduledDate: '2026-10-15',
    scheduledTime: '02:00 PM',
    quote: {
      origin: {
        address: 'Calle 22 # 14-30, Centro Histórico',
        city: 'Santa Marta',
        lat: 11.2420,
        lng: -74.2050,
      },
      destination: {
        address: 'Carrera 7 # 3-20, Taganga',
        city: 'Santa Marta',
        lat: 11.2680,
        lng: -74.1920,
      },
      propertyType: 'casa',
      originFloor: 1,
      originHasElevator: false,
      destinationFloor: 1,
      destinationHasElevator: false,
      suggestedVehicle: 'pickup',
      distanceKm: 8,
      estimatedMinutes: 20,
      tollCount: 0,
      inventory: [
        { id: 'cama_semi', name: 'Cama Sencilla', category: 'muebles', volumeM3: 1.2, count: 1 },
        { id: 'sofa_2', name: 'Sofá de 2 puestos', category: 'muebles', volumeM3: 1.4, count: 1 },
        { id: 'caja_mediana', name: 'Cajas medianas', category: 'cajas', volumeM3: 0.06, count: 6 },
      ],
      additionalServices: {
        helpersCount: 1,
        packingService: false,
        disassemblyService: false,
        expressInsurance: false,
      },
      breakdown: {
        baseRate: 110000,
        distanceCost: 16800,
        stairSurcharge: 0,
        helpersCost: 35000,
        packingCost: 0,
        insuranceCost: 0,
        total: 161800,
      },
    },
    timeline: [
      { status: 'cotizado', timestamp: '13 Oct 11:20 AM', title: 'Cotización Aceptada', description: 'Servicio programado para el 15 de Octubre.' },
      { status: 'asignado', timestamp: '13 Oct 11:45 AM', title: 'Transportista Confirmado', description: 'Don Lucho aceptó el servicio.' },
    ],
  },
];

export const MOCK_DISPUTES: Dispute[] = [
  {
    id: 'disp-201',
    trackingCode: 'CRB-77190',
    orderId: 'ord-99',
    reportedBy: 'cliente',
    reporterName: 'Carlos Mario Benítez',
    reason: 'retraso_severo',
    description: 'El transportista llegó 2 horas y media después de la hora pactada debido a un retraso no notificado en el peaje de Tasajera.',
    status: 'en_investigacion',
    createdAt: '2026-10-11T16:20:00Z',
    resolution: 'En mediación: Transportista ofreció un descuento de $50,000 en el flete por el inconveniente.',
  },
  {
    id: 'disp-202',
    trackingCode: 'CRB-64210',
    orderId: 'ord-88',
    reportedBy: 'transportista',
    reporterName: 'Carlos Alberto Marrugo',
    reason: 'cobro_inadecuado',
    description: 'El cliente declaró apartamento en piso 1, pero al llegar era piso 4 sin ascensor y con escaleras de caracol angostas que requirieron 3 ayudantes extras.',
    status: 'resuelta',
    createdAt: '2026-10-09T14:10:00Z',
    resolvedAt: '2026-10-10T11:00:00Z',
    resolution: 'Aprobado ajuste de tarifa por $60,000 correspondiente a 3 pisos adicionales sin ascensor según la tabla oficial.',
  },
];

export const MOCK_PRIVACY_LOGS: PrivacyConsentRecord[] = [
  {
    id: 'priv-001',
    userName: 'Andrea Paola Vergara',
    userEmail: 'andrea.vergara@email.com',
    userRole: 'cliente',
    ipAddress: '181.135.24.112 (Barranquilla)',
    acceptedAt: '2026-10-13 06:30:15',
    regulationNotice: 'Ley 1581 de 2012 (Colombia) / GDPR',
  },
  {
    id: 'priv-002',
    userName: 'Jairo Mendoza Cárdenas',
    userEmail: 'operaciones@transportesdelcaribe.com.co',
    userRole: 'transportista',
    ipAddress: '190.158.42.88 (Barranquilla)',
    acceptedAt: '2026-10-11 09:12:44',
    regulationNotice: 'Ley 1581 de 2012 (Colombia) / GDPR',
  },
  {
    id: 'priv-003',
    userName: 'Santiago Morales Pineda',
    userEmail: 'santiago.morales@empresa.com',
    userRole: 'cliente',
    ipAddress: '186.84.19.201 (Cartagena)',
    acceptedAt: '2026-10-12 07:55:02',
    regulationNotice: 'Ley 1581 de 2012 (Colombia) / GDPR',
  },
];

// Helper calculate distance and price
export function calculateDistanceAndCost(
  originCity: string,
  destCity: string,
  vehicleType: VehicleType,
  originFloor: number,
  originElevator: boolean,
  destFloor: number,
  destElevator: boolean,
  helpers: number,
  packing: boolean,
  disassembly: boolean,
  insurance: boolean,
  customCarrier?: Carrier
) {
  // Approximate route distances between northern Colombian cities
  const key = `${originCity.toLowerCase()}_${destCity.toLowerCase()}`;
  const reverseKey = `${destCity.toLowerCase()}_${originCity.toLowerCase()}`;

  const distances: Record<string, { km: number; mins: number; tolls: number }> = {
    'barranquilla_cartagena': { km: 118, mins: 120, tolls: 2 },
    'barranquilla_santa marta': { km: 104, mins: 110, tolls: 2 },
    'barranquilla_valledupar': { km: 298, mins: 310, tolls: 3 },
    'barranquilla_montería': { km: 385, mins: 420, tolls: 4 },
    'barranquilla_sincelejo': { km: 235, mins: 240, tolls: 3 },
    'barranquilla_riohacha': { km: 275, mins: 290, tolls: 3 },
    'cartagena_santa marta': { km: 228, mins: 240, tolls: 4 },
    'cartagena_montería': { km: 248, mins: 260, tolls: 3 },
    'cartagena_sincelejo': { km: 168, mins: 175, tolls: 2 },
    'cartagena_valledupar': { km: 395, mins: 410, tolls: 4 },
    'santa marta_valledupar': { km: 255, mins: 270, tolls: 2 },
    'santa marta_riohacha': { km: 172, mins: 175, tolls: 2 },
    'sincelejo_montería': { km: 82, mins: 90, tolls: 1 },
  };

  let route = distances[key] || distances[reverseKey];
  if (!route) {
    if (originCity.toLowerCase() === destCity.toLowerCase()) {
      route = { km: 16, mins: 35, tolls: 0 };
    } else {
      route = { km: 195, mins: 210, tolls: 2 };
    }
  }

  // Base rates by vehicle
  const baseRates: Record<VehicleType, { base: number; perKm: number; extraStairs: number; helperRate: number }> = {
    pickup: { base: 110000, perKm: 2100, extraStairs: 18000, helperRate: 35000 },
    furgon: { base: 150000, perKm: 2500, extraStairs: 20000, helperRate: 40000 },
    camion_turbo: { base: 180000, perKm: 2800, extraStairs: 25000, helperRate: 45000 },
    camion_grande: { base: 320000, perKm: 3400, extraStairs: 30000, helperRate: 50000 },
  };

  const rates = customCarrier
    ? {
        base: customCarrier.basePrice,
        perKm: customCarrier.pricePerKm,
        extraStairs: customCarrier.floorWithoutElevatorSurcharge,
        helperRate: customCarrier.helperRate,
      }
    : baseRates[vehicleType];

  const distanceCost = Math.round(route.km * rates.perKm);

  // Calculate stair surcharges (for floors > 1 without elevator)
  let stairFloors = 0;
  if (!originElevator && originFloor > 1) {
    stairFloors += (originFloor - 1);
  }
  if (!destElevator && destFloor > 1) {
    stairFloors += (destFloor - 1);
  }
  const stairSurcharge = stairFloors * rates.extraStairs;

  const helpersCost = helpers * rates.helperRate;
  const packingCost = packing ? (vehicleType === 'camion_grande' ? 120000 : 75000) : 0;
  const disassemblyCost = disassembly ? 45000 : 0;
  const insuranceCost = insurance ? (vehicleType === 'camion_grande' ? 55000 : 35000) : 0;

  const total = rates.base + distanceCost + stairSurcharge + helpersCost + packingCost + disassemblyCost + insuranceCost;

  return {
    distanceKm: route.km,
    estimatedMinutes: route.mins,
    tollCount: route.tolls,
    breakdown: {
      baseRate: rates.base,
      distanceCost,
      stairSurcharge,
      helpersCost,
      packingCost: packingCost + disassemblyCost,
      insuranceCost,
      total,
    },
  };
}
