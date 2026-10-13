import React, { useState } from 'react';
import {
  ShieldAlert,
  Users,
  FileCheck2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Scale,
  Lock,
  Search,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { Carrier, Dispute, MoveOrder, PrivacyConsentRecord } from '../types';

interface AdminPanelProps {
  carriers: Carrier[];
  disputes: Dispute[];
  orders: MoveOrder[];
  privacyLogs: PrivacyConsentRecord[];
  onApproveDocument: (carrierId: string, docId: string) => void;
  onRejectDocument: (carrierId: string, docId: string, feedback: string) => void;
  onResolveDispute: (disputeId: string, resolution: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  carriers,
  disputes,
  orders,
  privacyLogs,
  onApproveDocument,
  onRejectDocument,
  onResolveDispute,
}) => {
  const [activeTab, setActiveTab] = useState<'verificacion' | 'disputas' | 'transportistas' | 'auditoria'>('verificacion');
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [resolutionText, setResolutionText] = useState('');
  const [rejectFeedback, setRejectFeedback] = useState('');
  const [rejectModalDoc, setRejectModalDoc] = useState<{ carrierId: string; docId: string } | null>(null);

  const pendingVerificationCarriers = carriers.filter((c) =>
    c.documents.some((d) => d.status === 'en_revision' || d.status === 'pendiente')
  );

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleConfirmDisputeResolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDispute || !resolutionText) return;
    onResolveDispute(selectedDispute.id, resolutionText);
    setSelectedDispute(null);
    setResolutionText('');
  };

  const handleConfirmDocumentReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalDoc || !rejectFeedback) return;
    onRejectDocument(rejectModalDoc.carrierId, rejectModalDoc.docId, rejectFeedback);
    setRejectModalDoc(null);
    setRejectFeedback('');
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Admin KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 font-medium block">Transportistas Activos</span>
          <span className="text-2xl font-black text-slate-900 tabular-nums">{carriers.length}</span>
          <div className="text-[10px] text-emerald-600 font-semibold mt-1">
            {carriers.filter((c) => c.verificationStatus === 'verificado').length} con verificación completa
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 font-medium block">Mudanzas Este Mes</span>
          <span className="text-2xl font-black text-slate-900 tabular-nums">{orders.length + 42}</span>
          <div className="text-[10px] text-blue-600 font-semibold mt-1">
            Región Caribe & Troncales
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 font-medium block">Disputas Abiertas</span>
          <span className="text-2xl font-black text-orange-600 tabular-nums">
            {disputes.filter((d) => d.status !== 'resuelta').length}
          </span>
          <div className="text-[10px] text-slate-500 mt-1">Moderación requerida</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 font-medium block">Auditoría Habeas Data</span>
          <span className="text-2xl font-black text-emerald-600 tabular-nums">{privacyLogs.length + 180}</span>
          <div className="text-[10px] text-slate-500 mt-1">Consentimientos Ley 1581</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-200/80 rounded-xl max-w-lg">
        <button
          onClick={() => setActiveTab('verificacion')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            activeTab === 'verificacion' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Validación Documental ({pendingVerificationCarriers.length})
        </button>
        <button
          onClick={() => setActiveTab('disputas')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            activeTab === 'disputas' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Disputas y Reclamos ({disputes.length})
        </button>
        <button
          onClick={() => setActiveTab('transportistas')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            activeTab === 'transportistas' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Directorio RBAC
        </button>
        <button
          onClick={() => setActiveTab('auditoria')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            activeTab === 'auditoria' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Auditoría Privacidad
        </button>
      </div>

      {/* TAB 1: VERIFICACION DE DOCUMENTOS */}
      {activeTab === 'verificacion' && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Módulo de Verificación Legal de Transportistas
              </h3>
              <p className="text-xs text-slate-500">
                Revisa y convalida la documentación (SOAT, RUT DIAN, Licencia C1/C2/C3 y RTM) para habilitar a los transportistas en el marketplace.
              </p>
            </div>

            <div className="divide-y divide-slate-100">
              {carriers.map((c) => (
                <div key={c.id} className="py-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {c.companyName} ({c.fullName})
                      </h4>
                      <p className="text-xs text-slate-500">
                        NIT / Cédula: {c.documentId} · Teléfono: {c.phone} · Vehículo: {c.vehiclePlate} ({c.vehicleModel})
                      </p>
                    </div>
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg self-start sm:self-auto ${
                        c.verificationStatus === 'verificado'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {c.verificationStatus.toUpperCase()}
                    </span>
                  </div>

                  {/* Documents table */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {c.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-col justify-between space-y-2"
                      >
                        <div>
                          <div className="flex items-center justify-between font-semibold text-slate-800">
                            <span>{doc.name}</span>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                doc.status === 'aprobado'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : doc.status === 'en_revision'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {doc.status}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 mt-1 truncate">
                            {doc.fileName || 'Adjunto_Digital.pdf'}
                          </div>
                          {doc.feedback && (
                            <div className="text-[10px] text-amber-700 bg-amber-50 p-1 rounded mt-1">
                              {doc.feedback}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-200">
                          {doc.status !== 'aprobado' && (
                            <button
                              onClick={() => onApproveDocument(c.id, doc.id)}
                              className="px-2 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-md transition-colors"
                            >
                              Aprobar
                            </button>
                          )}
                          {doc.status !== 'rechazado' && (
                            <button
                              onClick={() => setRejectModalDoc({ carrierId: c.id, docId: doc.id })}
                              className="px-2 py-1 text-[11px] font-semibold text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors"
                            >
                              Observación / Rechazar
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DISPUTAS Y RECLAMOS */}
      {activeTab === 'disputas' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Centro de Mediación y Resolución de Disputas
            </h3>
            <p className="text-xs text-slate-500">
              Arbitraje imparcial entre clientes y transportistas con trazabilidad legal y financiera.
            </p>
          </div>

          <div className="space-y-3">
            {disputes.map((disp) => {
              const isResolved = disp.status === 'resuelta';
              return (
                <div
                  key={disp.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-slate-900 text-orange-400 px-2 py-0.5 rounded">
                        {disp.trackingCode}
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        Motivo: {disp.reason.replace('_', ' ').toUpperCase()}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isResolved
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {disp.status.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed">
                      "{disp.description}"
                    </p>

                    <div className="text-[11px] text-slate-500">
                      Reportado por: <strong>{disp.reporterName}</strong> ({disp.reportedBy}) · Fecha: {disp.createdAt.slice(0, 10)}
                    </div>

                    {disp.resolution && (
                      <div className="text-xs text-emerald-900 bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg mt-2">
                        <strong>Dictamen Oficial:</strong> {disp.resolution}
                      </div>
                    )}
                  </div>

                  {!isResolved && (
                    <button
                      onClick={() => setSelectedDispute(disp)}
                      className="px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-xs transition-colors shrink-0"
                    >
                      Emitir Dictamen
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: DIRECTORIO RBAC */}
      {activeTab === 'transportistas' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Directorio de Usuarios y Políticas de Control de Acceso (RBAC)
            </h3>
            <p className="text-xs text-slate-500">
              Roles y permisos asignados según la arquitectura de seguridad de Caribe Express.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-bold text-[10px]">
                <tr>
                  <th className="p-3">Nombre / Razón Social</th>
                  <th className="p-3">Rol RBAC</th>
                  <th className="p-3">Ciudad Base</th>
                  <th className="p-3">Vehículo / Placa</th>
                  <th className="p-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {carriers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60">
                    <td className="p-3 font-semibold text-slate-900">{c.companyName}</td>
                    <td className="p-3 font-mono text-[11px] text-blue-700 font-bold">ROLE_TRANSPORTISTA</td>
                    <td className="p-3">{c.baseCity}</td>
                    <td className="p-3 font-mono">{c.vehiclePlate}</td>
                    <td className="p-3">
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        {c.verificationStatus}
                      </span>
                    </td>
                  </tr>
                ))}
                <tr className="hover:bg-slate-50/60">
                  <td className="p-3 font-semibold text-slate-900">Andrea Paola Vergara</td>
                  <td className="p-3 font-mono text-[11px] text-slate-700 font-bold">ROLE_CLIENTE</td>
                  <td className="p-3">Barranquilla</td>
                  <td className="p-3 text-slate-400">N/A</td>
                  <td className="p-3">
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded-full">
                      Activo
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/60">
                  <td className="p-3 font-semibold text-slate-900">Freydell Medina (Autor/SuperAdmin)</td>
                  <td className="p-3 font-mono text-[11px] text-purple-700 font-bold">ROLE_SUPERADMIN</td>
                  <td className="p-3">Costa Caribe</td>
                  <td className="p-3 text-slate-400">Control Total</td>
                  <td className="p-3">
                    <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                      Root Admin
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: AUDITORIA DE PRIVACIDAD */}
      {activeTab === 'auditoria' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Registro de Consentimientos y Auditoría Habeas Data (Ley 1581)
              </h3>
              <p className="text-xs text-slate-500">
                Evidencia formal de autorización previa, expresa e informada de usuarios y conductores.
              </p>
            </div>
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
              Conformidad SIC Colombia
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-bold text-[10px]">
                <tr>
                  <th className="p-3">Titular del Dato</th>
                  <th className="p-3">Correo</th>
                  <th className="p-3">Rol</th>
                  <th className="p-3">Dirección IP & Origen</th>
                  <th className="p-3">Fecha y Hora</th>
                  <th className="p-3">Norma Aplicable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-mono text-[11px]">
                {privacyLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60">
                    <td className="p-3 font-sans font-semibold text-slate-900">{log.userName}</td>
                    <td className="p-3 text-slate-600">{log.userEmail}</td>
                    <td className="p-3 font-sans capitalize">{log.userRole}</td>
                    <td className="p-3 text-slate-500">{log.ipAddress}</td>
                    <td className="p-3">{log.acceptedAt}</td>
                    <td className="p-3 text-emerald-700 font-sans font-medium">{log.regulationNotice}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Dispute Resolution Modal */}
      {selectedDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              Emitir Resolución para Caso {selectedDispute.trackingCode}
            </h3>
            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
              "{selectedDispute.description}"
            </p>

            <form onSubmit={handleConfirmDisputeResolution} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Dictamen Oficial de Caribe Express
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ej. Se autoriza ajuste tarifario de $40,000 COP y se realiza abono al transportista..."
                  value={resolutionText}
                  onChange={(e) => setResolutionText(e.target.value)}
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedDispute(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-xs"
                >
                  Publicar Resolución
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject/Observation Modal */}
      {rejectModalDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Observación o Rechazo de Documento
            </h3>

            <form onSubmit={handleConfirmDocumentReject} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Motivo de la Observación (Se notificará al transportista)
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ej. La fecha de vigencia del SOAT no es legible o el archivo está incompleto..."
                  value={rejectFeedback}
                  onChange={(e) => setRejectFeedback(e.target.value)}
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalDoc(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs"
                >
                  Notificar Observación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
