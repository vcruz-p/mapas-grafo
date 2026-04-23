import type { Coordinates } from '../types/map.types'

const API_BASE = 'http://192.168.83.128:3000'

// =====================
// 🔎 GEOCODING
// =====================
export async function geocode(address: string): Promise<Coordinates> {
  const res = await fetch(
    `${API_BASE}/api/search?q=${encodeURIComponent(address)}`
  )

  if (!res.ok) {
    throw new Error('Error en geocoding request')
  }

  const data = await res.json()

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Dirección no encontrada')
  }

  const first = data[0]

  return {
    lat: Number(first.lat),
    lng: Number(first.lon),
  }
}

// =====================
// 🔁 REVERSE GEOCODING
// =====================
export async function reverse(lat: number, lon: number) {
  const res = await fetch(
    `${API_BASE}/api/reverse?lat=${lat}&lon=${lon}`
  )

  if (!res.ok) {
    throw new Error('Error en reverse geocoding')
  }

  const data = await res.json()

  return {
    displayName: data?.display_name || '',
    raw: data,
  }
}

// =====================
// 🧭 ROUTE (OSRM SAFE)
// =====================
export async function getRoute(from: Coordinates, to: Coordinates) {
  const res = await fetch(
    `${API_BASE}/api/route?from=${from.lng},${from.lat}&to=${to.lng},${to.lat}`
  )

  if (!res.ok) {
    throw new Error('Error calculando ruta')
  }

  const data = await res.json()

  const route = data?.routes?.[0]

  if (!route || !route.geometry) {
    throw new Error('No se pudo calcular la ruta')
  }

  return {
    geometry: route.geometry,
    distance: route.distance ?? 0,
    duration: route.duration ?? 0,
  }
}

// =====================
// 📍 NEAREST (OPCIONAL FUTURO)
// =====================
export async function nearest(lat: number, lon: number) {
  const res = await fetch(
    `${API_BASE}/api/nearest?lat=${lat}&lon=${lon}`
  )

  if (!res.ok) {
    throw new Error('Error en nearest')
  }

  return res.json()
}

// =====================
// ❤️ HEALTH CHECK
// =====================
export async function health(): Promise<{ status: string }> {
  const res = await fetch(`${API_BASE}/health`)

  if (!res.ok) {
    throw new Error('API no disponible')
  }

  return res.json()
}

export async function searchPlaces(query: string) {
  const res = await fetch(
    `${API_BASE}/api/search?q=${encodeURIComponent(query)}`
  )

  if (!res.ok) {
    throw new Error('Error en search')
  }

  return res.json()
}