import React from 'react';
import { BrandLogo } from './BrandLogo';
import { UserRole } from '../types';
import { AuthUser } from './AuthModal';
import { ShieldCheck, Truck, Search, LogIn, LogOut, HelpCircle, UserPlus, Brain } from 'lucide-react';

interface TopNavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  currentRole: UserRole;
  onOpenPrivacyModal: () => void;
  onOpenTrackingModal: () => void;
  authUser?: AuthUser | null;
  onOpenAuthModal?: (role?: UserRole, mode?: 'login' | 'register') => void;
  onLogout?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  currentTab,
  onSelectTab,
  currentRole,
  onOpenPrivacyModal,
  onOpenTrackingModal,
  authUser,
  onOpenAuthModal,
  onLogout,
}) => {
  const isCarrierLoggedIn = authUser?.role === 'transportista';
  const isAdminLoggedIn = authUser?.role === 'admin';
  const isClientLoggedIn = authUser?.role === 'cliente';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-3">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => onSelectTab('cotizador')}
          className="text-left focus:outline-none shrink-0"
        >
          <BrandLogo size="md" showTagline={false} />
        </button>

        {/* Zone 2: Navigation Links separated by role / exploration */}
        <nav className="hidden lg:flex items-center gap-4 text-xs font-semibold text-slate-600">
          <button
            onClick={() => onSelectTab('como_funciona')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 ${
              currentTab === 'como_funciona'
                ? 'text-orange-600 bg-orange-50 font-bold'
                : 'text-slate-600'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-orange-500" />
            ¿Cómo Funciona?
          </button>

          <button
            onClick={() => onSelectTab('cotizador')}
            className={`px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 ${
              currentTab === 'cotizador'
                ? 'text-orange-600 bg-orange-50 font-bold'
                : 'text-slate-600'
            }`}
          >
            Cotizador Inteligente
          </button>

          <button
            onClick={() => onSelectTab('marketplace')}
            className={`px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 ${
              currentTab === 'marketplace'
                ? 'text-orange-600 bg-orange-50 font-bold'
                : 'text-slate-600'
            }`}
          >
            Marketplace de Flota
          </button>

          {/* Pestaña pública: Modelo Predictivo */}
          <button
            onClick={() => onSelectTab('predictivo')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 ${
              currentTab === 'predictivo'
                ? 'text-purple-600 bg-purple-50 font-bold'
                : 'text-slate-600'
            }`}
          >
            <Brain className="w-3.5 h-3.5 text-purple-500" />
            Modelo Predictivo
          </button>

          {/* Protected Tab: Portal Transportista — solo visible cuando el transportista está autenticado */}
          {isCarrierLoggedIn && (
            <button
              onClick={() => onSelectTab('transportistas')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 ${
                currentTab === 'transportistas'
                  ? 'text-orange-600 bg-orange-50 font-bold'
                  : 'text-slate-600'
              }`}
            >
              <Truck className="w-3.5 h-3.5 text-orange-500" />
              Portal Transportista
            </button>
          )}

          {/* Protected Tab: Panel Administrativo — solo visible cuando el admin está autenticado */}
          {isAdminLoggedIn && (
            <button
              onClick={() => onSelectTab('admin')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 ${
                currentTab === 'admin'
                  ? 'text-purple-600 bg-purple-50 font-bold'
                  : 'text-slate-600'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />
              Panel Admin
            </button>
          )}

          {/* Client Moves tab if logged in as client */}
          {isClientLoggedIn && (
            <button
              onClick={() => onSelectTab('mis_mudanzas')}
              className={`px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 ${
                currentTab === 'mis_mudanzas'
                  ? 'text-blue-600 bg-blue-50 font-bold'
                  : 'text-slate-600'
              }`}
            >
              Mis Mudanzas
            </button>
          )}

          <button
            onClick={onOpenPrivacyModal}
            className="transition-colors whitespace-nowrap shrink-0 text-slate-500 hover:text-slate-900 text-[11px]"
          >
            Aviso Privacidad
          </button>
        </nav>

        {/* Zone 3: Actions (Tracking, Login/Register or Profile) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Tracking button */}
          <button
            onClick={onOpenTrackingModal}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors whitespace-nowrap shrink-0"
          >
            <Search className="w-3.5 h-3.5 text-orange-500" />
            Rastrear
          </button>

          {/* Auth section */}
          {authUser ? (
            <div className="flex items-center gap-2 pl-1">
              <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 px-2.5 py-1.5 rounded-xl text-xs">
                <span className="w-5 h-5 rounded-full bg-orange-500 text-white font-bold flex items-center justify-center text-[10px]">
                  {authUser.full_name.charAt(0).toUpperCase()}
                </span>
                <span className="font-semibold text-slate-800 max-w-[100px] truncate hidden sm:inline">
                  {authUser.full_name.split(' ')[0]}
                </span>
                <span className="text-[10px] uppercase font-bold text-orange-700 px-1.5 py-0.5 bg-white rounded border border-orange-200 font-mono">
                  {authUser.role}
                </span>
              </div>
              {onLogout && (
                <button
                  onClick={onLogout}
                  title="Cerrar Sesión"
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            onOpenAuthModal && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onOpenAuthModal('cliente', 'login')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors whitespace-nowrap"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Ingresar</span>
                </button>
                <button
                  onClick={() => onOpenAuthModal('cliente', 'register')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 active:scale-95 shadow-xs rounded-xl transition-all whitespace-nowrap"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Registrarme</span>
                </button>
              </div>
            )
          )}
        </div>
      </div>

      {/* Mobile navigation bar */}
      <div className="lg:hidden flex items-center overflow-x-auto px-4 py-2 border-t border-slate-100 bg-slate-50/80 gap-2 text-xs scrollbar-none">
        <button
          onClick={() => onSelectTab('como_funciona')}
          className={`px-3 py-1 rounded-lg shrink-0 font-medium ${
            currentTab === 'como_funciona' ? 'bg-orange-500 text-white font-bold' : 'text-slate-600'
          }`}
        >
          ¿Cómo Funciona?
        </button>
        <button
          onClick={() => onSelectTab('cotizador')}
          className={`px-3 py-1 rounded-lg shrink-0 font-medium ${
            currentTab === 'cotizador' ? 'bg-orange-500 text-white font-bold' : 'text-slate-600'
          }`}
        >
          Cotizador
        </button>
        <button
          onClick={() => onSelectTab('marketplace')}
          className={`px-3 py-1 rounded-lg shrink-0 font-medium ${
            currentTab === 'marketplace' ? 'bg-orange-500 text-white font-bold' : 'text-slate-600'
          }`}
        >
          Flota
        </button>
        <button
          onClick={() => onSelectTab('predictivo')}
          className={`px-3 py-1 rounded-lg shrink-0 font-medium flex items-center gap-1 ${
            currentTab === 'predictivo' ? 'bg-purple-600 text-white font-bold' : 'text-slate-600'
          }`}
        >
          🧠 Modelo Predictivo
        </button>
        {/* Mobile: Portal Transportista — solo si está autenticado como transportista */}
        {isCarrierLoggedIn && (
          <button
            onClick={() => onSelectTab('transportistas')}
            className={`px-3 py-1 rounded-lg shrink-0 font-medium flex items-center gap-1 ${
              currentTab === 'transportistas' ? 'bg-orange-500 text-white font-bold' : 'text-slate-600'
            }`}
          >
            Transportista
          </button>
        )}
        {/* Mobile: Panel Admin — solo si está autenticado como admin */}
        {isAdminLoggedIn && (
          <button
            onClick={() => onSelectTab('admin')}
            className={`px-3 py-1 rounded-lg shrink-0 font-medium flex items-center gap-1 ${
              currentTab === 'admin' ? 'bg-purple-600 text-white font-bold' : 'text-slate-600'
            }`}
          >
            Admin
          </button>
        )}
        {isClientLoggedIn && (
          <button
            onClick={() => onSelectTab('mis_mudanzas')}
            className={`px-3 py-1 rounded-lg shrink-0 font-medium ${
              currentTab === 'mis_mudanzas' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600'
            }`}
          >
            Mis Mudanzas
          </button>
        )}
      </div>
    </header>
  );
};
