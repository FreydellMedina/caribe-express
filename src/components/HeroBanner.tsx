import React from 'react';
import { ArrowRight, ShieldCheck, MapPin, Truck, Sparkles, Navigation } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface HeroBannerProps {
  onStartQuote: () => void;
  onExploreMarketplace: () => void;
  onOpenTracking: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onStartQuote,
  onExploreMarketplace,
  onOpenTracking,
}) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-[#0B1E48] to-slate-900 text-white rounded-3xl border border-slate-800 shadow-xl">
      {/* Background Decorative Scrim */}
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#F97316_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 py-12 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Proposition and Copy */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Plataforma Líder de Mudanzas en la Costa Caribe</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-display text-white leading-tight">
              Mudanzas inteligentes: <br />
              <span className="text-orange-500 italic">Eficiente, efectivo y Express.</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
              Conectamos a familias y empresas con transportistas independientes y furgones certificados en 
              <strong> Barranquilla, Cartagena, Santa Marta, Valledupar y Montería</strong>. 
              Cotización algorítmica transparente, optimización de rutas en tiempo real y protección de carga.
            </p>
          </div>

          {/* Value signals */}
          <div className="grid grid-cols-3 gap-3 pt-2 text-xs text-slate-300 border-t border-slate-800/80">
            <div>
              <div className="font-bold text-white text-base font-mono">100%</div>
              <div className="text-[11px] text-slate-400">SOAT y RUT Verificados</div>
            </div>
            <div>
              <div className="font-bold text-white text-base font-mono">3 min</div>
              <div className="text-[11px] text-slate-400">Cotización Inmediata</div>
            </div>
            <div>
              <div className="font-bold text-white text-base font-mono">0 sorpresas</div>
              <div className="text-[11px] text-slate-400">Precios Transparentes</div>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onStartQuote}
              className="px-6 py-3 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-lg shadow-orange-600/30 transition-all flex items-center gap-2"
            >
              Cotizar Mi Mudanza Ahora
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onExploreMarketplace}
              className="px-5 py-3 text-xs font-semibold text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl transition-all"
            >
              Explorar Flota Disponible
            </button>

            <button
              onClick={onOpenTracking}
              className="px-4 py-3 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Seguimiento por Código
            </button>
          </div>
        </div>

        {/* Right Column: High Fidelity Hero Image with Scrim */}
        <div className="lg:col-span-5 relative">
          <div className="relative rounded-2xl overflow-hidden border border-slate-700/70 shadow-2xl group">
            <img
              src="/src/assets/images/hero_caribe_express_truck_1791928170503.jpg"
              alt="Camión Caribe Express en autopista del Caribe"
              referrerPolicy="no-referrer"
              className="w-full h-80 sm:h-96 object-cover object-center group-hover:scale-102 transition-transform duration-700"
            />
            {/* Scrim overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

            {/* Bottom floating badge */}
            <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-md p-3.5 rounded-xl border border-slate-700 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center font-bold">
                  <Navigation className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white text-[11px]">Corredor Caribe Activo</div>
                  <div className="text-[10px] text-slate-400">Ruta del Sol · Vía al Mar · Troncal</div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Monitoreo GPS
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
