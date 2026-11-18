import { useState, useEffect, useCallback } from 'react';
import { CARIBE_CITIES } from '../data/mockData';

export interface GeolocationState {
  hasPermission: boolean;
  isLocating: boolean;
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  nearestCity: string | null;
  error: string | null;
}

// Calculate distance in kilometers using the Haversine formula
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
}

export function findNearestCaribeCity(lat: number, lng: number): string {
  let minDistance = Infinity;
  let nearest = 'Barranquilla';

  for (const city of CARIBE_CITIES) {
    const dist = calculateHaversineDistance(lat, lng, city.lat, city.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = city.name;
    }
  }

  return nearest;
}

export function useGeolocation() {
  const [geoState, setGeoState] = useState<GeolocationState>({
    hasPermission: false,
    isLocating: false,
    latitude: null,
    longitude: null,
    accuracy: null,
    nearestCity: null,
    error: null,
  });

  const requestLocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setGeoState((prev) => ({
        ...prev,
        error: 'Geolocalización no soportada por el navegador.',
      }));
      return;
    }

    setGeoState((prev) => ({ ...prev, isLocating: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = Math.round(position.coords.accuracy);
        const nearest = findNearestCaribeCity(lat, lng);

        setGeoState({
          hasPermission: true,
          isLocating: false,
          latitude: lat,
          longitude: lng,
          accuracy,
          nearestCity: nearest,
          error: null,
        });
      },
      (err) => {
        let msg = 'No se pudo obtener la ubicación GPS.';
        if (err.code === 1) {
          msg = 'Acceso a ubicación denegado por el usuario.';
        } else if (err.code === 2) {
          msg = 'Ubicación no disponible.';
        } else if (err.code === 3) {
          msg = 'Tiempo de espera agotado al consultar GPS.';
        }
        setGeoState((prev) => ({
          ...prev,
          isLocating: false,
          hasPermission: false,
          error: msg,
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, []);

  return {
    ...geoState,
    requestLocation,
  };
}

