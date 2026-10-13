import React from 'react';
import { BrandLogo } from './BrandLogo';
import { UserRole } from '../types';
import { ShieldCheck, Truck, User, Search } from 'lucide-react';

interface TopNavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  onOpenPrivacyModal: () => void;
  onOpenTrackingModal: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  currentTab,
  onSelectTab,
  currentRole,
  onChangeRole,
  onOpenPrivacyModal,
  onOpenTrackingModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text/brand element) */}
        <button
          onClick={() => onSelectTab('cotizador')}
          className="text-left focus:outline-none"
        >
          <BrandLogo size="md" showTagline={false} />
        </button>

        {/* Zone 2: 4-5 Clean Nav Links (whitespace-nowrap shrink-0) */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
          <button
            onClick={() => onSelectTab('cotizador')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 ${
              currentTab === 'cotizador' ? 'text-orange-600 font-bold' : ''
            }`}
          >
            Cotizador Inteligente
          </button>
          <button
            onClick={() => onSelectTab('marketplace')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 ${
              currentTab === 'marketplace' ? 'text-orange-600 font-bold' : ''
            }`}
          >
            Marketplace de Flota
          </button>
          <button
            onClick={() => onSelectTab('transportistas')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 ${
              currentTab === 'transportistas' ? 'text-orange-600 font-bold' : ''
            }`}
          >
            Portal Transportista
          </button>
          <button
            onClick={() => onSelectTab('admin')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 ${
              currentTab === 'admin' ? 'text-orange-600 font-bold' : ''
            }`}
          >
            Panel Administrativo
          </button>
          <button
            onClick={onOpenPrivacyModal}
            className="transition-colors whitespace-nowrap shrink-0 text-slate-500 hover:text-slate-900"
          >
            Aviso de Privacidad
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action (Quick Role Selector & Tracking) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenTrackingModal}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors whitespace-nowrap shrink-0"
          >
            <Search className="w-3.5 h-3.5 text-orange-500" />
            Rastrear Mudanza
          </button>

          {/* Role selector dropdown / toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-400 font-bold px-2 uppercase hidden lg:inline">
              Rol Activo:
            </span>
            <button
              onClick={() => {
                onChangeRole('cliente');
                onSelectTab('cotizador');
              }}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                currentRole === 'cliente'
                  ? 'bg-white text-orange-600 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cliente
            </button>
            <button
              onClick={() => {
                onChangeRole('transportista');
                onSelectTab('transportistas');
              }}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                currentRole === 'transportista'
                  ? 'bg-white text-orange-600 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Transportista
            </button>
            <button
              onClick={() => {
                onChangeRole('admin');
                onSelectTab('admin');
              }}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                currentRole === 'admin'
                  ? 'bg-white text-orange-600 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Admin
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
