import React from 'react';
import {
  Calculator,
  Truck,
  ShieldCheck,
  Navigation,
  FileCheck,
  Clock,
  ArrowRight,
  LogIn,
  UserPlus,
  Compass,
  MapPin,
  CheckCircle2,
  DollarSign,
  Layers,
  Sparkles
} from 'lucide-react';

interface HowItWorksViewProps {
  onStartQuote: () => void;
  onExploreMarketplace: () => void;
  onOpenAuthModal: (role?: 'cliente' | 'transportista' | 'admin', mode?: 'login' | 'register') => void;
}

export const HowItWorksView: React.FC<HowItWorksViewProps> = ({
  onStartQuote,
  onExploreMarketplace,
  onOpenAuthModal,
}) => {
  const steps = [
    {
      number: '01',
      icon: <Calculator className="w-6 h-6 text-orange-600" />,
      title: 'Cotización Algorítmica Transparente',
      badge: 'Cálculo en Segundos',
      description:
        'Indica el origen y destino en la Región Caribe. El motor calcula la distancia exacta por carretera, suma el volumen en m³ de tu inventario seleccionado y evalúa los pisos y ascensor para generar un precio justo sin sorpresas.',
      highlights: [
        'Distancia exacta por Google Maps & Haversine',
        'Cálculo volumétrico por catálogo de muebles',
        'Recargos configurables de pisos y auxiliares',
      ],
    },
    {
      number: '02',
      icon: <FileCheck className="w-6 h-6 text-blue-600" />,
      title: 'Flota Verificada por Administrador',
      badge: '100% Legal',
      description:
        'Cada transportista independiente o empresa registrada debe presentar documentación legal: SOAT vigente, Tecnomecánica, Cédula/RUT y Licencia de Conducción. Nuestro panel administrativo audita y aprueba cada documento.',
      highlights: [
        'Validación estricta de SOAT y Tecnomecánica',
        'Antecedentes y verificación de identidad',
        'Calificaciones reales de clientes previos',
      ],
    },
    {
      number: '03',
      icon: <Navigation className="w-6 h-6 text-emerald-600" />,
      title: 'Ruta Óptima & Monitoreo Satelital',
      badge: 'GPS en Tiempo Real',
      description:
        'Monitorea tu mudanza en tiempo real a través de nuestro Radar Satelital interactivo o vista de Google Maps. Conoce la velocidad del camión, peajes del corredor costero y tiempos estimados de llegada.',
      highlights: [
        'Geolocalización del navegador y del vehículo',
        'Radar costero interactivo con peajes y waypoints',
        'Código de seguimiento único (ej. CRB-84920)',
      ],
    },
    {
      number: '04',
      icon: <ShieldCheck className="w-6 h-6 text-purple-600" />,
      title: 'Garantía, Disputas y Habeas Data',
      badge: 'Ley 1581 Colombia',
      description:
        'Tus datos personales y ubicación están protegidos bajo la normativa colombiana de Habeas Data. Si surge algún imprevisto, nuestro centro de disputas resuelve incidencias directamente con soporte administrativo.',
      highlights: [
        'Consentimiento explícito y cifrado de datos',
        'Módulo de disputas con mediación admin',
        'Póliza de protección y seguro express opcional',
      ],
    },
  ];

  return (
    <div className="space-y-12">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-orange-950 rounded-3xl p-8 sm:p-12 text-white border border-slate-700/60 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-400/30 text-orange-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Explora la Plataforma Caribe Express
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display text-white">
            ¿Cómo funciona la red logística de mudanzas del Caribe?
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Conectamos a familias y empresas con los transportistas mejor calificados del litoral norte colombiano (Barranquilla, Cartagena, Santa Marta, Valledupar y Montería) con transparencia total en tarifas y monitoreo GPS en vivo.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={onStartQuote}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-500/20 transition-all"
            >
              <Calculator className="w-4 h-4" />
              Probar Cotizador Ahora
            </button>
            <button
              onClick={onExploreMarketplace}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/10 transition-all"
            >
              <Truck className="w-4 h-4" />
              Ver Flota Disponible
            </button>
          </div>
        </div>

        {/* Decorative background element */}
        <div className="absolute right-[-40px] bottom-[-40px] opacity-10 pointer-events-none">
          <Truck className="w-96 h-96 text-orange-400" />
        </div>
      </div>

      {/* 4 Core Steps Grid */}
      <div>
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight font-display">
            Flujo Logístico Inteligente de Principio a Fin
          </h2>
          <p className="text-xs text-slate-500">
            Diseñado para eliminar la incertidumbre, negociaciones informales y sobrecostos en mudanzas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {steps.map((st) => (
            <div
              key={st.number}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                      {st.icon}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                        Fase {st.number}
                      </span>
                      <h3 className="text-base font-bold text-slate-900">{st.title}</h3>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-slate-100 text-slate-700">
                    {st.badge}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{st.description}</p>

                <div className="space-y-1.5 pt-2">
                  {st.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Roles & Account Types Explanation Banner */}
      <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 text-white space-y-6">
        <div>
          <span className="text-orange-400 text-xs font-bold uppercase tracking-wider">
            Arquitectura de Roles & Acceso Seguro
          </span>
          <h3 className="text-xl font-bold mt-1">¿Cómo interactúan los diferentes roles?</h3>
          <p className="text-xs text-slate-400 mt-1">
            Cada perfil dispone de permisos exclusivos gobernados por tokens criptográficos JWT y almacenamiento en MongoDB.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Cliente card */}
          <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-xl">
                👤
              </div>
              <h4 className="text-sm font-bold text-white">Cliente / Usuario Final</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Cotiza servicios con cálculo volumétrico exacto, selecciona transportistas en el marketplace, reserva mudanzas y consulta su historial en tiempo real.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => onOpenAuthModal('cliente', 'register')}
                className="w-full py-2 px-3 text-xs font-bold bg-orange-500 hover:bg-orange-600 rounded-xl text-white transition-colors flex items-center justify-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Registrarme como Cliente
              </button>
            </div>
          </div>

          {/* Transportista card */}
          <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-xl">
                🚛
              </div>
              <h4 className="text-sm font-bold text-white">Transportista / Empresa</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Registra su vehículo (Pick-up, Furgón, Camión Turbo), sube documentos legales (SOAT, RUT, Licencia), configura tarifas base y actualiza el estado de las mudanzas en ruta.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => onOpenAuthModal('transportista', 'register')}
                className="w-full py-2 px-3 text-xs font-bold bg-blue-600 hover:bg-blue-700 rounded-xl text-white transition-colors flex items-center justify-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Registrarme como Transportista
              </button>
            </div>
          </div>

          {/* Admin card */}
          <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-xl">
                🛡️
              </div>
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">Administrador</h4>
                <span className="text-[9px] bg-purple-500/20 text-purple-300 font-bold px-1.5 py-0.5 rounded border border-purple-500/30">
                  Backend / DB
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Supervisa toda la plataforma, audita y valida documentos de vehículos, resuelve disputas entre partes y audita los registros de consentimiento Habeas Data.
              </p>
              <p className="text-[11px] text-amber-300/90 bg-amber-950/40 border border-amber-800/40 p-2 rounded-lg">
                ℹ️ Por seguridad, las cuentas admin no se registran en la web; son administradas directamente desde el backend.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => onOpenAuthModal('admin', 'login')}
                className="w-full py-2 px-3 text-xs font-bold bg-slate-700 hover:bg-slate-600 rounded-xl text-white transition-colors flex items-center justify-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                Iniciar Sesión como Admin
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

