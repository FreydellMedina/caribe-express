/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserRole, Carrier, MoveOrder, Dispute, PrivacyConsentRecord, MoveOrderStatus } from './types';
import { MOCK_CARRIERS, MOCK_ORDERS, MOCK_DISPUTES, MOCK_PRIVACY_LOGS } from './data/mockData';
import { apiService } from './services/api';
import { TopNavbar } from './components/TopNavbar';
import { HeroBanner } from './components/HeroBanner';
import { QuoteWizard } from './components/QuoteWizard';
import { MarketplaceView } from './components/MarketplaceView';
import { CarrierDashboard } from './components/CarrierDashboard';
import { AdminPanel } from './components/AdminPanel';
import { ClientMovesHistory } from './components/ClientMovesHistory';
import { HowItWorksView } from './components/HowItWorksView';
import { RoleGateScreen } from './components/RoleGateScreen';
import { PredictiveModelView } from './components/PredictiveModelView';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { TrackingModal } from './components/TrackingModal';
import { AuthModal, AuthUser } from './components/AuthModal';
import { Footer } from './components/Footer';
import { ShieldCheck, LogIn, LogOut, User, Compass, Lock, CheckCircle2 } from 'lucide-react';

// Restore session from sessionStorage on page load
function restoreSession(): { user: AuthUser | null; token: string | null } {
  try {
    const token = sessionStorage.getItem('caribe_token');
    const userStr = sessionStorage.getItem('caribe_user');
    if (token && userStr) {
      return { user: JSON.parse(userStr) as AuthUser, token };
    }
  } catch { /* noop */ }
  return { user: null, token: null };
}

export default function App() {
  const session = restoreSession();

  // Auth state
  const [authUser, setAuthUser] = useState<AuthUser | null>(session.user);
  const [authToken, setAuthToken] = useState<string | null>(session.token);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalRole, setAuthModalRole] = useState<UserRole>('cliente');
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // Navigation tab state: 'como_funciona' | 'cotizador' | 'marketplace' | 'transportistas' | 'admin' | 'mis_mudanzas'
  const [currentTab, setCurrentTab] = useState<string>('cotizador');

  // Database records (in-memory state with realistic mock data, synced with FastAPI MongoDB backend)
  const [carriers, setCarriers] = useState<Carrier[]>(MOCK_CARRIERS);
  const [orders, setOrders] = useState<MoveOrder[]>(MOCK_ORDERS);
  const [disputes, setDisputes] = useState<Dispute[]>(MOCK_DISPUTES);
  const [privacyLogs, setPrivacyLogs] = useState<PrivacyConsentRecord[]>(MOCK_PRIVACY_LOGS);
  const [hasAcceptedPrivacy, setHasAcceptedPrivacy] = useState<boolean>(true);
  const [backendConnected, setBackendConnected] = useState<boolean>(false);

  // Synchronize with FastAPI MongoDB backend if available
  useEffect(() => {
    apiService.checkHealth().then((isHealthy) => {
      if (isHealthy) {
        setBackendConnected(true);
        apiService.getCarriers().then((data) => {
          if (data && data.length > 0) setCarriers(data);
        });
        apiService.getOrders().then((data) => {
          if (data && data.length > 0) setOrders(data);
        });
        apiService.getDisputes().then((data) => {
          if (data && data.length > 0) setDisputes(data);
        });
        apiService.getPrivacyConsents().then((data) => {
          if (data && data.length > 0) setPrivacyLogs(data);
        });
      }
    });
  }, []);

  const openAuthWithConfig = (role: UserRole = 'cliente', mode: 'login' | 'register' = 'login') => {
    setAuthModalRole(role);
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleLoginSuccess = (user: AuthUser, token: string) => {
    setAuthUser(user);
    setAuthToken(token);
    const role = user.role as UserRole;
    if (role === 'transportista') setCurrentTab('transportistas');
    else if (role === 'admin') setCurrentTab('admin');
    else setCurrentTab('cotizador');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('caribe_token');
    sessionStorage.removeItem('caribe_user');
    setAuthUser(null);
    setAuthToken(null);
    setCurrentTab('cotizador');
  };

  // Modals state
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [activeTrackingCode, setActiveTrackingCode] = useState('CRB-84920');

  // Handle new order creation
  const handleOrderCreated = (newOrder: MoveOrder) => {
    setOrders((prev) => [newOrder, ...prev]);
    setActiveTrackingCode(newOrder.trackingCode);
  };

  // Handle selecting carrier from Marketplace to quote
  const handleSelectCarrierForQuote = (carrier: Carrier) => {
    setCurrentTab('cotizador');
  };

  // Handle updating order status by carrier
  const handleUpdateOrderStatus = (orderId: string, newStatus: MoveOrderStatus) => {
    apiService.updateOrderStatus(orderId, newStatus);
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const timestamp = 'Hoy, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const statusDescriptions: Record<MoveOrderStatus, { title: string; desc: string }> = {
            cotizado: { title: 'Cotización Registrada', desc: 'Reserva generada.' },
            asignado: { title: 'Servicio Aceptado', desc: 'Transportista listo para el traslado.' },
            hacia_origen: { title: 'En Camino al Origen', desc: 'El conductor se desplaza a la dirección de carga.' },
            cargando: { title: 'Cargando y Embalando', desc: 'Asegurando enseres con mantas y vinipel.' },
            en_ruta: { title: 'En Tránsito Intermunicipal', desc: 'Desplazamiento por autopista monitoreado vía GPS.' },
            descargando: { title: 'Descarga en Destino', desc: 'Ingreso de enseres a nuevo inmueble.' },
            completado: { title: 'Entrega Finalizada', desc: 'Mercancía entregada a entera satisfacción.' },
            cancelado: { title: 'Servicio Cancelado', desc: 'Cancelación procesada.' },
          };
          const info = statusDescriptions[newStatus] || { title: 'Estado Actualizado', desc: '' };

          return {
            ...ord,
            status: newStatus,
            timeline: [
              ...ord.timeline,
              {
                status: newStatus,
                timestamp,
                title: info.title,
                description: info.desc,
              },
            ],
          };
        }
        return ord;
      })
    );
  };

  // Carrier updates their rates
  const handleUpdateCarrierRates = (rates: { basePrice: number; pricePerKm: number; floorSurcharge: number; helperRate: number }) => {
    apiService.updateCarrierRates('car-1', rates);
    setCarriers((prev) =>
      prev.map((c) =>
        c.id === 'car-1'
          ? {
              ...c,
              basePrice: rates.basePrice,
              pricePerKm: rates.pricePerKm,
              floorWithoutElevatorSurcharge: rates.floorSurcharge,
              helperRate: rates.helperRate,
            }
          : c
      )
    );
  };

  // Admin approves carrier document
  const handleApproveDocument = (carrierId: string, docId: string) => {
    apiService.verifyDocument(carrierId, docId, 'aprobado');
    setCarriers((prev) =>
      prev.map((c) => {
        if (c.id === carrierId) {
          const updatedDocs = c.documents.map((d) =>
            d.id === docId ? { ...d, status: 'aprobado' as const, feedback: undefined } : d
          );
          const allApproved = updatedDocs.every((d) => d.status === 'aprobado');
          return {
            ...c,
            documents: updatedDocs,
            verificationStatus: allApproved ? ('verificado' as const) : c.verificationStatus,
          };
        }
        return c;
      })
    );
  };

  // Admin rejects carrier document with feedback
  const handleRejectDocument = (carrierId: string, docId: string, feedback: string) => {
    apiService.verifyDocument(carrierId, docId, 'rechazado', feedback);
    setCarriers((prev) =>
      prev.map((c) => {
        if (c.id === carrierId) {
          const updatedDocs = c.documents.map((d) =>
            d.id === docId ? { ...d, status: 'rechazado' as const, feedback } : d
          );
          return {
            ...c,
            documents: updatedDocs,
            verificationStatus: 'rechazado' as const,
          };
        }
        return c;
      })
    );
  };

  // Admin resolves dispute
  const handleResolveDispute = (disputeId: string, resolution: string) => {
    apiService.resolveDispute(disputeId, resolution);
    setDisputes((prev) =>
      prev.map((disp) =>
        disp.id === disputeId
          ? {
              ...disp,
              status: 'resuelta' as const,
              resolution,
              resolvedAt: new Date().toISOString(),
            }
          : disp
      )
    );
  };

  // Client or carrier reports new dispute
  const handleReportDispute = (
    orderId: string,
    trackingCode: string,
    reason: any,
    description: string
  ) => {
    const reporterRole = authUser?.role === 'transportista' ? 'transportista' : 'cliente';
    const reporterName = authUser?.full_name || (reporterRole === 'transportista' ? 'Transportista Verificado' : 'Cliente Caribe Express');
    apiService.createDispute({
      orderId,
      trackingCode,
      reportedBy: reporterRole,
      reporterName,
      reason,
      description,
    });
    const newDispute: Dispute = {
      id: `disp-${Date.now()}`,
      orderId,
      trackingCode,
      reportedBy: reporterRole,
      reporterName,
      reason,
      description,
      status: 'abierta',
      createdAt: new Date().toISOString(),
    };
    setDisputes((prev) => [newDispute, ...prev]);
  };

  // Accept privacy consent
  const handleAcceptPrivacy = (userName: string, userEmail: string) => {
    setHasAcceptedPrivacy(true);
    const activeRole = authUser?.role || 'cliente';
    apiService.recordConsent({ userName, userEmail, userRole: activeRole });
    const newRecord: PrivacyConsentRecord = {
      id: `priv-${Date.now()}`,
      userName,
      userEmail,
      userRole: activeRole,
      ipAddress: '190.248.81.14 (Caribe)',
      acceptedAt: new Date().toLocaleString(),
      regulationNotice: 'Ley 1581 de 2012 (Colombia) / GDPR',
    };
    setPrivacyLogs((prev) => [newRecord, ...prev]);
  };

  const isCarrierLoggedIn = authUser?.role === 'transportista';
  const isAdminLoggedIn = authUser?.role === 'admin';
  const isClientLoggedIn = authUser?.role === 'cliente';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased selection:bg-orange-500 selection:text-white">
      {/* Privacy Notice Banner if not yet explicitly acknowledged */}
      {!hasAcceptedPrivacy && (
        <div className="bg-slate-900 text-slate-200 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-orange-400 shrink-0" />
            <span>
              En cumplimiento de la <strong>Ley 1581 de 2012 (Habeas Data Colombia)</strong>, tus datos y geolocalización están protegidos con cifrado.
            </span>
          </div>
          <button
            onClick={() => setIsPrivacyModalOpen(true)}
            className="text-xs font-bold text-orange-400 hover:text-orange-300 underline underline-offset-2"
          >
            Ver Política de Privacidad
          </button>
        </div>
      )}

      {/* Top Navbar */}
      <TopNavbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        currentRole={authUser?.role || 'cliente'}
        onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)}
        onOpenTrackingModal={() => setIsTrackingModalOpen(true)}
        authUser={authUser}
        onOpenAuthModal={(role, mode) => openAuthWithConfig(role || 'cliente', mode || 'login')}
        onLogout={handleLogout}
      />

      {/* Main App Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-8">

        {/* ===================== TAB ROUTER ===================== */}

        {/* 1. ¿CÓMO FUNCIONA? (Public Exploration) */}
        {currentTab === 'como_funciona' && (
          <HowItWorksView
            onStartQuote={() => setCurrentTab('cotizador')}
            onExploreMarketplace={() => setCurrentTab('marketplace')}
            onOpenAuthModal={(role, mode) => openAuthWithConfig(role || 'cliente', mode || 'login')}
          />
        )}

        {/* 2. COTIZADOR INTELIGENTE (Public Exploration + Quote Generation) */}
        {currentTab === 'cotizador' && (
          <div className="space-y-8">
            <HeroBanner
              onStartQuote={() => {
                const el = document.getElementById('cotizador-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              onExploreMarketplace={() => setCurrentTab('marketplace')}
              onOpenTracking={() => setIsTrackingModalOpen(true)}
            />

            <div id="cotizador-section" className="pt-2">
              <div className="text-center max-w-xl mx-auto mb-6">
                <h2 className="text-2xl font-bold font-display text-slate-900 tracking-tight">
                  Cotizador Algorítmico Caribe Express
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Calcula tu tarifa exacta considerando distancia, características de inmueble, pisos, volumen en m³ y opciones de embalaje.
                </p>
              </div>

              <QuoteWizard
                carriers={carriers}
                onOrderCreated={handleOrderCreated}
                onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)}
                hasAcceptedPrivacy={hasAcceptedPrivacy}
              />
            </div>
          </div>
        )}

        {/* 3. MARKETPLACE DE FLOTA (Public Exploration) */}
        {currentTab === 'marketplace' && (
          <MarketplaceView
            carriers={carriers}
            onSelectCarrierForQuote={handleSelectCarrierForQuote}
          />
        )}

        {/* 3b. MODELO PREDICTIVO J48 (Public) */}
        {currentTab === 'predictivo' && (
          <PredictiveModelView />
        )}

        {/* 4. PORTAL TRANSPORTISTA (PROTECTED: Requires Login as Transportista) */}
        {currentTab === 'transportistas' && (
          isCarrierLoggedIn ? (
            <CarrierDashboard
              carrier={carriers[0]}
              orders={orders}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onUpdateCarrierRates={handleUpdateCarrierRates}
            />
          ) : (
            <RoleGateScreen
              requiredRole="transportista"
              currentRole={authUser?.role}
              onOpenAuthModal={(role, mode) => openAuthWithConfig(role, mode)}
              onBackToCotizador={() => setCurrentTab('cotizador')}
            />
          )
        )}

        {/* 5. PANEL ADMINISTRATIVO (PROTECTED: Requires Login as Admin) */}
        {currentTab === 'admin' && (
          isAdminLoggedIn ? (
            <AdminPanel
              carriers={carriers}
              disputes={disputes}
              orders={orders}
              privacyLogs={privacyLogs}
              onApproveDocument={handleApproveDocument}
              onRejectDocument={handleRejectDocument}
              onResolveDispute={handleResolveDispute}
            />
          ) : (
            <RoleGateScreen
              requiredRole="admin"
              currentRole={authUser?.role}
              onOpenAuthModal={(role, mode) => openAuthWithConfig(role, mode)}
              onBackToCotizador={() => setCurrentTab('cotizador')}
            />
          )
        )}

        {/* 6. MIS MUDANZAS (PROTECTED: Requires Login as Cliente) */}
        {currentTab === 'mis_mudanzas' && (
          isClientLoggedIn ? (
            <ClientMovesHistory
              orders={orders}
              onOpenTracking={(code) => {
                setActiveTrackingCode(code);
                setIsTrackingModalOpen(true);
              }}
            />
          ) : (
            <RoleGateScreen
              requiredRole="cliente"
              currentRole={authUser?.role}
              onOpenAuthModal={(role, mode) => openAuthWithConfig(role, mode)}
              onBackToCotizador={() => setCurrentTab('cotizador')}
            />
          )
        )}
      </main>

      {/* Footer */}
      <Footer onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)} />

      {/* Privacy Policy and Consent Modal (Ley 1581 de 2012 / GDPR) */}
      <PrivacyPolicyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        onAccept={handleAcceptPrivacy}
        currentRole={authUser?.role || 'cliente'}
      />

      {/* Live Route Satellite Tracking Modal */}
      <TrackingModal
        isOpen={isTrackingModalOpen}
        onClose={() => setIsTrackingModalOpen(false)}
        orders={orders}
        initialTrackingCode={activeTrackingCode}
        onReportDispute={handleReportDispute}
      />

      {/* Login / Register Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        defaultRole={authModalRole}
        initialMode={authModalMode}
      />
    </div>
  );
}
