import { Carrier, MoveOrder, Dispute, PrivacyConsentRecord, QuoteDetails } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

// Safe fetch wrapper with timeout
async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`API call ${endpoint} returned ${res.status}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (error) {
    // Graceful fallback to local state if backend is offline
    return null;
  }
}

export const apiService = {
  // Check backend health
  async checkHealth(): Promise<boolean> {
    const res = await apiFetch<{ status: string }>('/health');
    return res?.status === 'healthy';
  },

  // Carriers
  async getCarriers(): Promise<Carrier[] | null> {
    return apiFetch<Carrier[]>('/carriers');
  },

  async updateCarrierRates(carrierId: string, rates: { basePrice: number; pricePerKm: number; floorSurcharge: number; helperRate: number }) {
    return apiFetch(`/carriers/${carrierId}/rates`, {
      method: 'PUT',
      body: JSON.stringify(rates),
    });
  },

  async verifyDocument(carrierId: string, docId: string, status: string, feedback?: string) {
    return apiFetch(`/carriers/${carrierId}/documents/${docId}/verify`, {
      method: 'PATCH',
      body: JSON.stringify({ status, feedback }),
    });
  },

  // Quotes
  async calculateQuote(quoteReq: any) {
    return apiFetch('/quotes/calculate', {
      method: 'POST',
      body: JSON.stringify(quoteReq),
    });
  },

  // Orders
  async getOrders(): Promise<MoveOrder[] | null> {
    return apiFetch<MoveOrder[]>('/orders');
  },

  async createOrder(orderPayload: any) {
    return apiFetch('/orders', {
      method: 'POST',
      body: JSON.stringify(orderPayload),
    });
  },

  async updateOrderStatus(orderId: string, status: string, notes?: string) {
    return apiFetch(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    });
  },

  // Disputes
  async getDisputes(): Promise<Dispute[] | null> {
    return apiFetch<Dispute[]>('/disputes');
  },

  async createDispute(disputeData: any) {
    return apiFetch('/disputes', {
      method: 'POST',
      body: JSON.stringify(disputeData),
    });
  },

  async resolveDispute(disputeId: string, resolution: string) {
    return apiFetch(`/disputes/${disputeId}/resolve`, {
      method: 'PATCH',
      body: JSON.stringify({ resolution, status: 'resuelta' }),
    });
  },

  // Privacy
  async recordConsent(consentData: { userName: string; userEmail: string; userRole: string }) {
    return apiFetch('/privacy/consent', {
      method: 'POST',
      body: JSON.stringify(consentData),
    });
  },

  async getPrivacyConsents(): Promise<PrivacyConsentRecord[] | null> {
    return apiFetch<PrivacyConsentRecord[]>('/privacy/consents');
  },

  // Google Maps / Routes
  async autocompleteAddress(query: string, city?: string) {
    return apiFetch<any[]>(`/maps/places/autocomplete?query=${encodeURIComponent(query)}&city=${encodeURIComponent(city || '')}`);
  },

  async getRouteOptimization(origin: string, destination: string) {
    return apiFetch<any>(`/maps/directions?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`);
  },
};

