import React from 'react';
import { Lock, Truck, ShieldAlert, User, LogIn, UserPlus, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { UserRole } from '../types';

interface RoleGateScreenProps {
  requiredRole: 'transportista' | 'admin' | 'cliente';
  currentRole?: UserRole | null;
  onOpenAuthModal: (role: UserRole, mode: 'login' | 'register') => void;
  onBackToCotizador: () => void;
}

export const RoleGateScreen: React.FC<RoleGateScreenProps> = ({
  requiredRole,
  currentRole,
  onOpenAuthModal,
  onBackToCotizador,
}) => {
  if (requiredRole === 'admin') {
    return (
      <div className="max-w-xl mx-auto my-12 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden text-center p-8 sm:p-10 space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-purple-100 border border-purple-200 text-purple-700 mx-auto flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200">
            <Lock className="w-3.5 h-3.5" />
            Acceso Restringido · Solo Administradores
          </div>
          <h2 className="text-2xl font-bold font-display text-slate-900">
            Panel Administrativo de Control y Auditoría
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Esta sección contiene herramientas sensibles para validar documentos oficiales (SOAT, RUT, Licencias), moderar disputas de clientes y supervisar registros de privacidad.
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left text-xs text-amber-900 space-y-2">
          <div className="font-bold flex items-center gap-1.5 text-amber-950">
            <span>🛡️</span> Política de Creación de Perfiles de Administrador
          </div>
          <p className="text-[11px] leading-relaxed">
            Por estrictas normas de seguridad y control interno, <strong>no es posible registrar cuentas de administrador desde el formulario web público</strong>. Los usuarios administradores son dados de alta exclusivamente por el equipo técnico desde el backend / base de datos MongoDB.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => onOpenAuthModal('admin', 'login')}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-purple-700 hover:bg-purple-800 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition-all"
          >
            <LogIn className="w-4 h-4" />
            Iniciar Sesión como Administrador
          </button>
          <button
            onClick={onBackToCotizador}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Explorar
          </button>
        </div>

        <p className="text-[11px] text-slate-400">
          ¿Deseas probar la vista de demo? Usa el botón rápido <strong>🛡️ Admin Demo</strong> dentro del diálogo de inicio de sesión.
        </p>
      </div>
    );
  }

  if (requiredRole === 'transportista') {
    return (
      <div className="max-w-xl mx-auto my-12 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden text-center p-8 sm:p-10 space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-orange-100 border border-orange-200 text-orange-600 mx-auto flex items-center justify-center">
          <Truck className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-bold border border-orange-200">
            <Lock className="w-3.5 h-3.5" />
            Área Exclusiva para Transportistas
          </div>
          <h2 className="text-2xl font-bold font-display text-slate-900">
            Portal de Gestión de Flota y Mudanzas
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Inicia sesión o crea tu cuenta como transportista para acceder a la asignación de servicios, actualizar trayectos satelitales en vivo, subir tu documentación vehicular y configurar tus tarifas por kilómetro.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Gestión de Órdenes
            </div>
            <p className="text-[11px] text-slate-500">
              Acepta servicios, marca estados (cargando, en ruta, descargando) y finaliza entregas.
            </p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Documentos & Tarifas
            </div>
            <p className="text-[11px] text-slate-500">
              Carga tu SOAT, RUT y personaliza tus precios base y recargos por piso.
            </p>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => onOpenAuthModal('transportista', 'login')}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition-all"
          >
            <LogIn className="w-4 h-4" />
            Iniciar Sesión como Transportista
          </button>
          <button
            onClick={() => onOpenAuthModal('transportista', 'register')}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition-all"
          >
            <UserPlus className="w-4 h-4" />
            Registrarme como Transportista
          </button>
        </div>

        <div>
          <button
            onClick={onBackToCotizador}
            className="text-xs text-slate-500 hover:text-slate-800 underline underline-offset-2"
          >
            ← Volver a explorar cotizador y marketplace
          </button>
        </div>
      </div>
    );
  }

  // Cliente gate for "Mis Mudanzas"
  return (
    <div className="max-w-xl mx-auto my-12 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden text-center p-8 sm:p-10 space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-blue-100 border border-blue-200 text-blue-600 mx-auto flex items-center justify-center">
        <User className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
          <Lock className="w-3.5 h-3.5" />
          Historial de Mudanzas Privado
        </div>
        <h2 className="text-2xl font-bold font-display text-slate-900">
          Consulta y Gestiona tus Solicitudes
        </h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          Inicia sesión con tu cuenta de cliente para visualizar el historial detallado de tus cotizaciones, mudanzas confirmadas y seguimiento satelital.
        </p>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={() => onOpenAuthModal('cliente', 'login')}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition-all"
        >
          <LogIn className="w-4 h-4" />
          Iniciar Sesión
        </button>
        <button
          onClick={() => onOpenAuthModal('cliente', 'register')}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-900 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition-all"
        >
          <UserPlus className="w-4 h-4" />
          Crear Cuenta de Cliente
        </button>
      </div>

      <div>
        <button
          onClick={onBackToCotizador}
          className="text-xs text-slate-500 hover:text-slate-800 underline underline-offset-2"
        >
          ← Volver al cotizador
        </button>
      </div>
    </div>
  );
};

