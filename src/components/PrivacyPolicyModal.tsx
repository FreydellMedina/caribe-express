import React, { useState } from 'react';
import { ShieldCheck, FileText, CheckCircle2, X, Lock } from 'lucide-react';
import { UserRole } from '../types';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: (userName: string, userEmail: string) => void;
  currentRole: UserRole;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  isOpen,
  onClose,
  onAccept,
  currentRole,
}) => {
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [hasConsented, setHasConsented] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleAccept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasConsented) return;
    setSubmitted(true);
    if (onAccept) {
      onAccept(userName || 'Usuario Caribe Express', userEmail || 'contacto@caribeexpress.co');
    }
    setTimeout(() => {
      onClose();
      setSubmitted(false);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Política de Protección de Datos y Privacidad
              </h2>
              <p className="text-xs text-slate-500">
                Cumplimiento Ley Estatutaria 1581 de 2012 (Colombia) y Estándar GDPR
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="px-6 py-5 overflow-y-auto space-y-4 text-sm text-slate-600 leading-relaxed">
          <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-100 flex items-start gap-3 text-xs text-blue-900">
            <Lock className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
            <p>
              En <strong>Caribe Express</strong> la seguridad de su información y de sus bienes es nuestra máxima prioridad. 
              Garantizamos el tratamiento lícito, confidencial y seguro de todos sus datos personales y de localización.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 mb-1">1. Responsable del Tratamiento</h3>
            <p className="text-xs">
              <strong>Caribe Express Soluciones Logísticas</strong>, con sede principal en Barranquilla, Atlántico, Colombia. 
              Correo electrónico del oficial de datos: <code className="text-orange-600 font-mono">privacidad@caribeexpress.co</code>.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 mb-1">2. Finalidades del Tratamiento de Datos</h3>
            <ul className="text-xs space-y-1.5 list-disc list-inside text-slate-600">
              <li>Cálculo algorítmico de rutas óptimas, kilometraje y cotizaciones de mudanzas.</li>
              <li>Conexión segura entre clientes y transportistas independientes verificados legalmente (RUT, SOAT, Licencia y Tecnicomecánica).</li>
              <li>Seguimiento satelital en tiempo real del vehículo durante el traslado del servicio.</li>
              <li>Emisión de facturación electrónica, comprobantes y resolución de eventuales disputas o seguros de carga.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 mb-1">3. Derechos del Titular (Habeas Data)</h3>
            <p className="text-xs">
              De conformidad con el artículo 8 de la Ley 1581 de 2012, usted tiene derecho a: 
              conocer, actualizar y rectificar sus datos personales; solicitar prueba de la autorización otorgada; ser informado del uso dado a sus datos; y revocar la autorización o solicitar la supresión de sus datos en cualquier momento.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 mb-1">4. Medidas de Seguridad y Cifrado</h3>
            <p className="text-xs">
              Implementamos cifrado TLS/SSL en tránsito y en reposo, arquitectura RBAC (Control de Acceso Basado en Roles) 
              y sanitización estricta contra inyección SQL, CSRF y accesos no autorizados.
            </p>
          </div>

          {/* Consent Acceptance Form */}
          <form onSubmit={handleAccept} className="pt-3 border-t border-slate-200 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Freydell Medina"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  required
                  placeholder="usuario@ejemplo.com"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer pt-1">
              <input
                type="checkbox"
                required
                checked={hasConsented}
                onChange={(e) => setHasConsented(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-orange-600 border-slate-300 rounded focus:ring-orange-500"
              />
              <span className="text-xs text-slate-700">
                Otorgo mi consentimiento previo, expreso e informado para el tratamiento de mis datos personales 
                de acuerdo con la Política de Privacidad de Caribe Express y la Ley 1581 de 2012.
              </span>
            </label>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cerrar
              </button>
              <button
                type="submit"
                disabled={!hasConsented || submitted}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 rounded-lg shadow-sm transition-colors"
              >
                {submitted ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Autorización Registrada
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    Firmar y Registrar Consentimiento
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
